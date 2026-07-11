import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit"
import { hashResetToken, isResetTokenUsable } from "@/lib/resetToken"

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  const { allowed, retryAfterSeconds } = rateLimit(`reset-password:${ip}`, 10, 15 * 60 * 1000)
  if (!allowed) return rateLimitResponse(retryAfterSeconds)

  try {
    const { token, password } = await request.json().catch(() => ({}))
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Invalid or missing reset token" }, { status: 400 })
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const tokenHash = hashResetToken(token)
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { tokenHash } })
    if (!isResetTokenUsable(resetToken)) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one." },
        { status: 400 },
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)
    await prisma.$transaction([
      prisma.user.update({ where: { id: resetToken.userId }, data: { password: hashedPassword } }),
      prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
    ])

    return NextResponse.json({ message: "Password updated. You can now log in." })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}

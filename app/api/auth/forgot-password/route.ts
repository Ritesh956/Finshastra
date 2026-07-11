import { NextResponse } from "next/server"
import crypto from "crypto"
import { prisma } from "@/lib/prisma"
import { sendMail } from "@/lib/mailer"

// Issues a password reset token. Always responds 200 so the endpoint can't be
// used to probe which emails have accounts.
export async function POST(request: Request) {
  try {
    const { email } = await request.json().catch(() => ({}))
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase().trim() } })
    if (user) {
      const token = crypto.randomBytes(32).toString("hex")
      const tokenHash = crypto.createHash("sha256").update(token).digest("hex")

      // A new request invalidates any previous outstanding tokens
      await prisma.$transaction([
        prisma.passwordResetToken.deleteMany({ where: { userId: user.id } }),
        prisma.passwordResetToken.create({
          data: {
            userId: user.id,
            tokenHash,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        }),
      ])

      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000"
      const resetUrl = `${baseUrl}/reset-password?token=${token}`
      await sendMail({
        to: user.email,
        subject: "FinShastra: Reset your password",
        text:
          `Hi ${user.name},\n\n` +
          `We received a request to reset your FinShastra password. ` +
          `Open the link below within 1 hour to choose a new one:\n\n${resetUrl}\n\n` +
          `If you didn't request this, you can safely ignore this email.\n\n— FinShastra`,
      })
    }

    return NextResponse.json({
      message: "If an account exists for that email, a reset link has been sent.",
    })
  } catch (error) {
    console.error("Forgot password error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}

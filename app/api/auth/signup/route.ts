import { NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit"

export async function POST(request: Request) {
  const ip = getClientIp(request.headers)
  const { allowed, retryAfterSeconds } = rateLimit(`signup:${ip}`, 5, 15 * 60 * 1000)
  if (!allowed) return rateLimitResponse(retryAfterSeconds)

  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    if (!name || typeof name !== "string" || name.trim().length < 2) {
      return NextResponse.json({ error: "Please enter your full name" }, { status: 400 })
    }
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address" }, { status: 400 })
    }
    if (!password || typeof password !== "string" || password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone || null,
      },
      select: { id: true, name: true, email: true },
    })

    return NextResponse.json({ user }, { status: 201 })
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json({ error: "Something went wrong. Please try again." }, { status: 500 })
  }
}

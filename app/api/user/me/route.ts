import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  avatarUrl: true,
  bank: true,
  income: true,
  expenses: true,
  creditScore: true,
  createdAt: true,
} as const

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: publicUserSelect,
  })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({ user })
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (typeof body.name === "string" && body.name.trim().length >= 2) data.name = body.name.trim()
    if (typeof body.phone === "string") data.phone = body.phone
    if (typeof body.bank === "string") data.bank = body.bank
    if (typeof body.avatarUrl === "string") data.avatarUrl = body.avatarUrl
    if (typeof body.income === "number" && body.income >= 0) data.income = body.income
    if (typeof body.expenses === "number" && body.expenses >= 0) data.expenses = body.expenses
    if (typeof body.creditScore === "number" && body.creditScore >= 300 && body.creditScore <= 900) {
      data.creditScore = body.creditScore
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data,
      select: publicUserSelect,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

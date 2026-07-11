import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateEMI } from "@/utils/loanCalculations"
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loans = await prisma.loan.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "asc" },
  })

  return NextResponse.json({ loans })
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, retryAfterSeconds } = rateLimit(`loans:create:${session.user.id}`, 20, 15 * 60 * 1000)
  if (!allowed) return rateLimitResponse(retryAfterSeconds)

  try {
    const body = await request.json()
    const { name, type, principal, interestRate, termMonths, nextPaymentDue } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Loan name is required" }, { status: 400 })
    }
    if (typeof principal !== "number" || principal <= 0) {
      return NextResponse.json({ error: "Loan amount must be greater than zero" }, { status: 400 })
    }
    if (typeof interestRate !== "number" || interestRate < 0 || interestRate > 100) {
      return NextResponse.json({ error: "Interest rate must be between 0 and 100" }, { status: 400 })
    }
    if (typeof termMonths !== "number" || termMonths < 1 || termMonths > 600) {
      return NextResponse.json({ error: "Term must be between 1 and 600 months" }, { status: 400 })
    }

    const dueDate = nextPaymentDue ? new Date(nextPaymentDue) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    if (isNaN(dueDate.getTime())) {
      return NextResponse.json({ error: "Invalid next payment date" }, { status: 400 })
    }

    const emi = interestRate === 0 ? Math.round((principal / termMonths) * 100) / 100 : calculateEMI(principal, interestRate, termMonths)

    const loan = await prisma.loan.create({
      data: {
        userId: session.user.id,
        name: name.trim(),
        type: typeof type === "string" && type.trim() ? type.trim() : "Personal",
        principal,
        interestRate,
        termMonths,
        emi,
        outstandingBalance: principal,
        nextPaymentDue: dueDate,
      },
    })

    return NextResponse.json({ loan }, { status: 201 })
  } catch (error) {
    console.error("Create loan error:", error)
    return NextResponse.json({ error: "Failed to create loan" }, { status: 500 })
  }
}

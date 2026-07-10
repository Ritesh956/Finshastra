import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const MONTH_LABELS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payments = await prisma.payment.findMany({
    where: { loan: { userId: session.user.id } },
    orderBy: { paidAt: "asc" },
    include: { loan: { select: { name: true } } },
  })

  // Monthly totals for the last 6 months (chart data)
  const now = new Date()
  const history: { month: string; amount: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const total = payments
      .filter((p) => p.paidAt.getFullYear() === d.getFullYear() && p.paidAt.getMonth() === d.getMonth())
      .reduce((sum, p) => sum + p.amount, 0)
    history.push({ month: MONTH_LABELS[d.getMonth()], amount: Math.round(total * 100) / 100 })
  }

  return NextResponse.json({
    history,
    payments: payments.map((p) => ({
      id: p.id,
      loanName: p.loan.name,
      amount: p.amount,
      principalComponent: p.principalComponent,
      interestComponent: p.interestComponent,
      paidAt: p.paidAt,
    })),
  })
}

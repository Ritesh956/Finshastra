import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export interface AlertItem {
  id: string
  severity: "urgent" | "warning" | "info" | "success"
  title: string
  message: string
}

const formatINR = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })

// Real alerts derived from the user's loan portfolio.
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loans = await prisma.loan.findMany({ where: { userId: session.user.id } })
  const now = new Date()
  const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
  const alerts: AlertItem[] = []

  for (const loan of loans) {
    const due = new Date(loan.nextPaymentDue)
    if (loan.outstandingBalance <= 0) {
      alerts.push({
        id: `paidoff-${loan.id}`,
        severity: "success",
        title: `${loan.name} fully repaid`,
        message: `Congratulations — this loan is paid off. Total interest paid: ₹${formatINR(loan.totalInterestPaid)}.`,
      })
      continue
    }
    if (due < now) {
      const daysLate = Math.floor((now.getTime() - due.getTime()) / (24 * 60 * 60 * 1000))
      alerts.push({
        id: `overdue-${loan.id}`,
        severity: "urgent",
        title: `Overdue: ${loan.name} EMI`,
        message: `₹${formatINR(loan.emi)} was due on ${formatDate(due)} (${daysLate} day${daysLate === 1 ? "" : "s"} overdue). Pay now to avoid late charges.`,
      })
    } else if (due <= in7Days) {
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      alerts.push({
        id: `due-${loan.id}`,
        severity: "warning",
        title: `Upcoming: ${loan.name} EMI`,
        message: `₹${formatINR(loan.emi)} due on ${formatDate(due)} (${daysLeft} day${daysLeft === 1 ? "" : "s"} left). Ensure sufficient balance in your account.`,
      })
    }
    // Nearly repaid — fewer than 3 EMIs left
    if (loan.outstandingBalance > 0 && loan.outstandingBalance <= loan.emi * 3) {
      alerts.push({
        id: `closing-${loan.id}`,
        severity: "info",
        title: `${loan.name} almost repaid`,
        message: `Only ₹${formatINR(loan.outstandingBalance)} outstanding — you're within your last few EMIs.`,
      })
    }
  }

  // Surface a better offer when a cheaper rate exists for a loan's type
  if (loans.length > 0) {
    const offers = await prisma.bankOffer.findMany()
    for (const loan of loans) {
      if (loan.outstandingBalance <= 0) continue
      const better = offers
        .filter((o) => o.loanType.replace(/ Loan$/, "") === loan.type && o.interestRate < loan.interestRate)
        .sort((a, b) => a.interestRate - b.interestRate)[0]
      if (better) {
        alerts.push({
          id: `offer-${loan.id}`,
          severity: "info",
          title: `Lower rate available for ${loan.name}`,
          message: `${better.bankName} offers ${loan.type} loans at ${better.interestRate}% p.a. (you pay ${loan.interestRate}%). Consider refinancing.`,
        })
      }
    }
  }

  const severityOrder = { urgent: 0, warning: 1, info: 2, success: 3 }
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])

  return NextResponse.json({ alerts })
}

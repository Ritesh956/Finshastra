// Pure alert-derivation logic, extracted from the alerts route so it can be
// unit-tested without a server or database.

export interface AlertItem {
  id: string
  severity: "urgent" | "warning" | "info" | "success"
  title: string
  message: string
}

export interface AlertLoan {
  id: string
  name: string
  type: string
  interestRate: number
  emi: number
  outstandingBalance: number
  totalInterestPaid: number
  nextPaymentDue: Date
}

export interface AlertOffer {
  bankName: string
  loanType: string
  interestRate: number
}

const DAY_MS = 24 * 60 * 60 * 1000

const formatINR = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })

const plural = (n: number) => (n === 1 ? "" : "s")

const severityOrder: Record<AlertItem["severity"], number> = { urgent: 0, warning: 1, info: 2, success: 3 }

/**
 * Builds the user's alerts from their loan portfolio and the available bank
 * offers: overdue EMIs, EMIs due within 7 days, paid-off loans, near-payoff
 * notices (≤ 3 EMIs left), and cheaper refinance offers for a loan's type.
 * Sorted most-severe first.
 */
export function buildLoanAlerts(loans: AlertLoan[], offers: AlertOffer[], now: Date = new Date()): AlertItem[] {
  const in7Days = new Date(now.getTime() + 7 * DAY_MS)
  const alerts: AlertItem[] = []

  for (const loan of loans) {
    const due = loan.nextPaymentDue
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
      const daysLate = Math.floor((now.getTime() - due.getTime()) / DAY_MS)
      alerts.push({
        id: `overdue-${loan.id}`,
        severity: "urgent",
        title: `Overdue: ${loan.name} EMI`,
        message: `₹${formatINR(loan.emi)} was due on ${formatDate(due)} (${daysLate} day${plural(daysLate)} overdue). Pay now to avoid late charges.`,
      })
    } else if (due <= in7Days) {
      const daysLeft = Math.ceil((due.getTime() - now.getTime()) / DAY_MS)
      alerts.push({
        id: `due-${loan.id}`,
        severity: "warning",
        title: `Upcoming: ${loan.name} EMI`,
        message: `₹${formatINR(loan.emi)} due on ${formatDate(due)} (${daysLeft} day${plural(daysLeft)} left). Ensure sufficient balance in your account.`,
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

  return alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}

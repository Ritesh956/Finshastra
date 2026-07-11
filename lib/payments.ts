// Pure amortization logic for recording an EMI payment, extracted from the
// payments route so it can be unit-tested without a server or database.

export interface PaymentSplit {
  interestComponent: number
  principalComponent: number
  newBalance: number
  newTotalInterestPaid: number
}

const round2 = (value: number) => Math.round(value * 100) / 100

/**
 * Splits a payment into interest and principal at the loan's monthly rate and
 * computes the resulting balance. Interest accrues on the outstanding balance;
 * whatever remains of the payment reduces principal, clamped so the balance
 * never goes negative.
 */
export function splitEmiPayment(
  loan: { outstandingBalance: number; interestRate: number; totalInterestPaid: number },
  amount: number,
): PaymentSplit {
  const monthlyRate = loan.interestRate / 12 / 100
  const interestComponent = round2(loan.outstandingBalance * monthlyRate)
  const principalComponent = Math.max(0, round2(amount - interestComponent))
  const newBalance = Math.max(0, round2(loan.outstandingBalance - principalComponent))
  return {
    interestComponent,
    principalComponent,
    newBalance,
    newTotalInterestPaid: round2(loan.totalInterestPaid + interestComponent),
  }
}

/**
 * Advances a due date by one calendar month, clamping to the last day of the
 * target month (Jan 31 → Feb 28/29, not Mar 2/3 — plain setMonth overflows).
 */
export function advanceDueDateByOneMonth(due: Date): Date {
  const next = new Date(due)
  const dayOfMonth = next.getDate()
  next.setDate(1)
  next.setMonth(next.getMonth() + 1)
  const lastDayOfTargetMonth = new Date(next.getFullYear(), next.getMonth() + 1, 0).getDate()
  next.setDate(Math.min(dayOfMonth, lastDayOfTargetMonth))
  return next
}

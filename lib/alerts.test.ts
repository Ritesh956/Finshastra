import { describe, it, expect } from "vitest"
import { buildLoanAlerts, type AlertLoan, type AlertOffer } from "./alerts"

const NOW = new Date(2026, 6, 15, 12, 0, 0) // 15 July 2026, noon

const DAY_MS = 24 * 60 * 60 * 1000

function makeLoan(overrides: Partial<AlertLoan> = {}): AlertLoan {
  return {
    id: "loan1",
    name: "Car Loan",
    type: "Auto",
    interestRate: 9,
    emi: 12000,
    outstandingBalance: 400000,
    totalInterestPaid: 20000,
    nextPaymentDue: new Date(NOW.getTime() + 30 * DAY_MS), // far in the future by default
    ...overrides,
  }
}

describe("buildLoanAlerts", () => {
  it("returns no alerts for an empty portfolio", () => {
    expect(buildLoanAlerts([], [], NOW)).toEqual([])
  })

  it("returns no alerts for a healthy loan due more than 7 days out", () => {
    expect(buildLoanAlerts([makeLoan()], [], NOW)).toEqual([])
  })

  it("flags an overdue loan as urgent with the days-overdue count", () => {
    const loans = [makeLoan({ nextPaymentDue: new Date(NOW.getTime() - 3 * DAY_MS) })]
    const alerts = buildLoanAlerts(loans, [], NOW)
    expect(alerts).toHaveLength(1)
    expect(alerts[0].severity).toBe("urgent")
    expect(alerts[0].id).toBe("overdue-loan1")
    expect(alerts[0].message).toContain("3 days overdue")
  })

  it("uses singular wording for exactly one day overdue", () => {
    const loans = [makeLoan({ nextPaymentDue: new Date(NOW.getTime() - 1 * DAY_MS) })]
    const [alert] = buildLoanAlerts(loans, [], NOW)
    expect(alert.message).toContain("1 day overdue")
    expect(alert.message).not.toContain("1 days")
  })

  it("flags a loan due within 7 days as a warning with days left", () => {
    const loans = [makeLoan({ nextPaymentDue: new Date(NOW.getTime() + 2 * DAY_MS) })]
    const alerts = buildLoanAlerts(loans, [], NOW)
    expect(alerts).toHaveLength(1)
    expect(alerts[0].severity).toBe("warning")
    expect(alerts[0].message).toContain("2 days left")
  })

  it("does not warn about a loan due exactly 8 days out", () => {
    const loans = [makeLoan({ nextPaymentDue: new Date(NOW.getTime() + 8 * DAY_MS) })]
    expect(buildLoanAlerts(loans, [], NOW)).toEqual([])
  })

  it("celebrates a fully repaid loan and emits nothing else for it", () => {
    const loans = [makeLoan({ outstandingBalance: 0, nextPaymentDue: new Date(NOW.getTime() - 30 * DAY_MS) })]
    const alerts = buildLoanAlerts(loans, [], NOW)
    expect(alerts).toHaveLength(1)
    expect(alerts[0].severity).toBe("success")
    expect(alerts[0].id).toBe("paidoff-loan1")
  })

  it("notes a loan within its last 3 EMIs", () => {
    const loans = [makeLoan({ outstandingBalance: 30000, emi: 12000 })]
    const alerts = buildLoanAlerts(loans, [], NOW)
    expect(alerts.map((a) => a.id)).toContain("closing-loan1")
  })

  it("does not emit the near-payoff notice when more than 3 EMIs remain", () => {
    const loans = [makeLoan({ outstandingBalance: 36001, emi: 12000 })]
    expect(buildLoanAlerts(loans, [], NOW).map((a) => a.id)).not.toContain("closing-loan1")
  })

  describe("refinance offers", () => {
    const offers: AlertOffer[] = [
      { bankName: "HDFC Bank", loanType: "Auto Loan", interestRate: 7.25 },
      { bankName: "XYZ Bank", loanType: "Auto Loan", interestRate: 8.5 },
      { bankName: "SBI", loanType: "Home Loan", interestRate: 6.75 },
    ]

    it("surfaces the cheapest matching offer for the loan's type", () => {
      const alerts = buildLoanAlerts([makeLoan({ interestRate: 9 })], offers, NOW)
      expect(alerts).toHaveLength(1)
      expect(alerts[0].id).toBe("offer-loan1")
      expect(alerts[0].message).toContain("HDFC Bank")
      expect(alerts[0].message).toContain("7.25%")
    })

    it("matches offer loan types by stripping the ' Loan' suffix", () => {
      const alerts = buildLoanAlerts([makeLoan({ type: "Home", interestRate: 8 })], offers, NOW)
      expect(alerts[0].message).toContain("SBI")
    })

    it("stays silent when no offer beats the loan's current rate", () => {
      expect(buildLoanAlerts([makeLoan({ interestRate: 7 })], offers, NOW)).toEqual([])
    })

    it("skips refinance suggestions for paid-off loans", () => {
      const loans = [makeLoan({ outstandingBalance: 0, interestRate: 20 })]
      const ids = buildLoanAlerts(loans, offers, NOW).map((a) => a.id)
      expect(ids).not.toContain("offer-loan1")
    })
  })

  it("sorts alerts most-severe first", () => {
    const loans = [
      makeLoan({ id: "a", name: "A", outstandingBalance: 0 }),
      makeLoan({ id: "b", name: "B", nextPaymentDue: new Date(NOW.getTime() + 2 * DAY_MS) }),
      makeLoan({ id: "c", name: "C", nextPaymentDue: new Date(NOW.getTime() - 2 * DAY_MS) }),
      makeLoan({ id: "d", name: "D", outstandingBalance: 20000, emi: 12000 }),
    ]
    const severities = buildLoanAlerts(loans, [], NOW).map((a) => a.severity)
    expect(severities).toEqual([...severities].sort(
      (a, b) => ["urgent", "warning", "info", "success"].indexOf(a) - ["urgent", "warning", "info", "success"].indexOf(b),
    ))
    expect(severities[0]).toBe("urgent")
    expect(severities[severities.length - 1]).toBe("success")
  })

  it("formats amounts in en-IN digit grouping", () => {
    const loans = [makeLoan({ emi: 125000, nextPaymentDue: new Date(NOW.getTime() + 2 * DAY_MS) })]
    const [alert] = buildLoanAlerts(loans, [], NOW)
    expect(alert.message).toContain("₹1,25,000")
  })
})

import { describe, it, expect } from "vitest"
import { splitEmiPayment, advanceDueDateByOneMonth } from "./payments"

describe("splitEmiPayment", () => {
  it("splits a standard EMI into interest and principal at the monthly rate", () => {
    // ₹5,00,000 at 9% p.a. → monthly interest = 500000 × 0.0075 = 3750
    const split = splitEmiPayment(
      { outstandingBalance: 500000, interestRate: 9, totalInterestPaid: 0 },
      12442.52,
    )
    expect(split.interestComponent).toBe(3750)
    expect(split.principalComponent).toBe(8692.52)
    expect(split.newBalance).toBe(491307.48)
    expect(split.newTotalInterestPaid).toBe(3750)
  })

  it("interest + principal always equals the payment amount (when payment covers interest)", () => {
    const split = splitEmiPayment(
      { outstandingBalance: 250000, interestRate: 11.5, totalInterestPaid: 1000 },
      8000,
    )
    expect(split.interestComponent + split.principalComponent).toBeCloseTo(8000, 2)
  })

  it("puts the entire payment towards principal on a zero-interest loan", () => {
    const split = splitEmiPayment(
      { outstandingBalance: 120000, interestRate: 0, totalInterestPaid: 0 },
      10000,
    )
    expect(split.interestComponent).toBe(0)
    expect(split.principalComponent).toBe(10000)
    expect(split.newBalance).toBe(110000)
  })

  it("clamps the balance to zero on the final payment instead of going negative", () => {
    // Balance ₹5,000, interest ~₹37.50, EMI ₹12,442.52 overshoots the remainder
    const split = splitEmiPayment(
      { outstandingBalance: 5000, interestRate: 9, totalInterestPaid: 50000 },
      12442.52,
    )
    expect(split.newBalance).toBe(0)
    expect(split.principalComponent).toBeGreaterThan(0)
  })

  it("clamps principal to zero when the payment doesn't even cover the interest", () => {
    // Interest on ₹10,00,000 at 12% is ₹10,000/month; paying only ₹500
    const split = splitEmiPayment(
      { outstandingBalance: 1000000, interestRate: 12, totalInterestPaid: 0 },
      500,
    )
    expect(split.principalComponent).toBe(0)
    expect(split.newBalance).toBe(1000000)
  })

  it("accumulates totalInterestPaid across payments", () => {
    const split = splitEmiPayment(
      { outstandingBalance: 500000, interestRate: 9, totalInterestPaid: 7500.25 },
      12442.52,
    )
    expect(split.newTotalInterestPaid).toBe(11250.25)
  })

  it("rounds all outputs to two decimal places", () => {
    const split = splitEmiPayment(
      { outstandingBalance: 333333.33, interestRate: 9.99, totalInterestPaid: 0.01 },
      7777.77,
    )
    for (const value of [
      split.interestComponent,
      split.principalComponent,
      split.newBalance,
      split.newTotalInterestPaid,
    ]) {
      expect(value).toBe(Math.round(value * 100) / 100)
    }
  })
})

describe("advanceDueDateByOneMonth", () => {
  it("advances a mid-month date by exactly one month", () => {
    expect(advanceDueDateByOneMonth(new Date(2026, 6, 15))).toEqual(new Date(2026, 7, 15))
  })

  it("clamps Jan 31 to Feb 28 in a non-leap year instead of overflowing to March", () => {
    expect(advanceDueDateByOneMonth(new Date(2026, 0, 31))).toEqual(new Date(2026, 1, 28))
  })

  it("clamps Jan 31 to Feb 29 in a leap year", () => {
    expect(advanceDueDateByOneMonth(new Date(2028, 0, 31))).toEqual(new Date(2028, 1, 29))
  })

  it("clamps May 31 to Jun 30", () => {
    expect(advanceDueDateByOneMonth(new Date(2026, 4, 31))).toEqual(new Date(2026, 5, 30))
  })

  it("rolls December into January of the next year", () => {
    expect(advanceDueDateByOneMonth(new Date(2026, 11, 5))).toEqual(new Date(2027, 0, 5))
  })

  it("does not mutate the input date", () => {
    const input = new Date(2026, 0, 31)
    advanceDueDateByOneMonth(input)
    expect(input).toEqual(new Date(2026, 0, 31))
  })
})

import { describe, it, expect } from "vitest"
import { calculateEMI, calculateTotalRepayment } from "./loanCalculations"

describe("calculateEMI", () => {
  it("computes the standard EMI for a home loan", () => {
    // ₹25,00,000 at 8.5% p.a. for 240 months
    expect(calculateEMI(2500000, 8.5, 240)).toBeCloseTo(21695.58, 1)
  })

  it("computes EMI for a short personal loan", () => {
    // ₹1,00,000 at 12% p.a. for 12 months
    expect(calculateEMI(100000, 12, 12)).toBeCloseTo(8884.88, 1)
  })

  it("EMI × term always exceeds principal when rate > 0", () => {
    const emi = calculateEMI(500000, 10, 60)
    expect(emi * 60).toBeGreaterThan(500000)
  })

  it("higher interest rate produces higher EMI", () => {
    expect(calculateEMI(500000, 12, 60)).toBeGreaterThan(calculateEMI(500000, 8, 60))
  })

  it("longer tenure produces lower EMI", () => {
    expect(calculateEMI(500000, 10, 120)).toBeLessThan(calculateEMI(500000, 10, 60))
  })

  it("rounds to two decimal places", () => {
    const emi = calculateEMI(333333, 9.99, 37)
    expect(emi).toBe(Math.round(emi * 100) / 100)
  })
})

describe("calculateTotalRepayment", () => {
  it("multiplies EMI by tenure", () => {
    expect(calculateTotalRepayment(10000, 24)).toBe(240000)
  })

  it("rounds to two decimal places", () => {
    expect(calculateTotalRepayment(1000.555, 3)).toBe(3001.67)
  })
})

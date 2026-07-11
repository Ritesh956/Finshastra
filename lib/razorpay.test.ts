import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import crypto from "crypto"
import { isRazorpayConfigured, verifyRazorpaySignature } from "./razorpay"

const SECRET = "test_secret_key"

function signedWith(secret: string, orderId: string, paymentId: string): string {
  return crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex")
}

beforeEach(() => {
  vi.stubEnv("RAZORPAY_KEY_ID", "rzp_test_key")
  vi.stubEnv("RAZORPAY_KEY_SECRET", SECRET)
})

afterEach(() => {
  vi.unstubAllEnvs()
})

describe("isRazorpayConfigured", () => {
  it("is true when both key id and secret are set", () => {
    expect(isRazorpayConfigured()).toBe(true)
  })

  it("is false when either key is missing", () => {
    vi.stubEnv("RAZORPAY_KEY_SECRET", "")
    expect(isRazorpayConfigured()).toBe(false)
  })
})

describe("verifyRazorpaySignature", () => {
  it("accepts a signature computed with the configured secret", () => {
    const sig = signedWith(SECRET, "order_123", "pay_456")
    expect(verifyRazorpaySignature("order_123", "pay_456", sig)).toBe(true)
  })

  it("rejects a signature computed with a different secret", () => {
    const sig = signedWith("attacker_secret", "order_123", "pay_456")
    expect(verifyRazorpaySignature("order_123", "pay_456", sig)).toBe(false)
  })

  it("rejects a valid signature replayed against a different order", () => {
    const sig = signedWith(SECRET, "order_123", "pay_456")
    expect(verifyRazorpaySignature("order_999", "pay_456", sig)).toBe(false)
  })

  it("rejects garbage and wrong-length signatures without throwing", () => {
    expect(verifyRazorpaySignature("order_123", "pay_456", "")).toBe(false)
    expect(verifyRazorpaySignature("order_123", "pay_456", "deadbeef")).toBe(false)
  })

  it("rejects everything when no secret is configured", () => {
    const sig = signedWith(SECRET, "order_123", "pay_456")
    vi.stubEnv("RAZORPAY_KEY_SECRET", "")
    expect(verifyRazorpaySignature("order_123", "pay_456", sig)).toBe(false)
  })
})

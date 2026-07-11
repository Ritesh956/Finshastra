import crypto from "crypto"

// Razorpay integration via REST API (no SDK needed).
// When RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET are unset, the app falls back to
// a built-in simulated checkout so the payment flow works out of the box.

export function isRazorpayConfigured(): boolean {
  return Boolean(process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET)
}

interface RazorpayOrder {
  id: string
  amount: number
  currency: string
}

export async function createRazorpayOrder(amountInPaise: number, receipt: string): Promise<RazorpayOrder> {
  const auth = Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString("base64")
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ amount: amountInPaise, currency: "INR", receipt }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Razorpay order creation failed (${res.status}): ${text}`)
  }
  return res.json()
}

export function verifyRazorpaySignature(orderId: string, paymentId: string, signature: string): boolean {
  const secret = process.env.RAZORPAY_KEY_SECRET
  if (!secret) return false
  const expected = crypto.createHmac("sha256", secret).update(`${orderId}|${paymentId}`).digest("hex")
  const expectedBuf = Buffer.from(expected)
  const providedBuf = Buffer.from(signature)
  return expectedBuf.length === providedBuf.length && crypto.timingSafeEqual(expectedBuf, providedBuf)
}

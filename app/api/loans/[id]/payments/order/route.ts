import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import crypto from "crypto"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isRazorpayConfigured, createRazorpayOrder } from "@/lib/razorpay"

// Creates a payment order for a loan's next EMI. Returns a Razorpay order when
// keys are configured, otherwise a simulated order the client can "pay" locally.
export async function POST(_request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loan = await prisma.loan.findUnique({ where: { id: params.id } })
  if (!loan || loan.userId !== session.user.id) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 })
  }
  if (loan.outstandingBalance <= 0) {
    return NextResponse.json({ error: "This loan is already fully paid" }, { status: 400 })
  }

  const amount = loan.emi

  try {
    if (isRazorpayConfigured()) {
      const order = await createRazorpayOrder(Math.round(amount * 100), `loan_${loan.id.slice(-12)}`)
      return NextResponse.json({
        mode: "razorpay",
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount,
        currency: "INR",
        loanName: loan.name,
        userName: session.user.name ?? "",
        userEmail: session.user.email ?? "",
      })
    }

    return NextResponse.json({
      mode: "simulated",
      orderId: `sim_order_${crypto.randomUUID()}`,
      amount,
      currency: "INR",
      loanName: loan.name,
    })
  } catch (error) {
    console.error("Create payment order error:", error)
    return NextResponse.json({ error: "Failed to create payment order" }, { status: 500 })
  }
}

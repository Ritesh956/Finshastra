import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { isRazorpayConfigured, verifyRazorpaySignature } from "@/lib/razorpay"
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { allowed, retryAfterSeconds } = rateLimit(`loans:payments:${session.user.id}`, 20, 15 * 60 * 1000)
  if (!allowed) return rateLimitResponse(retryAfterSeconds)

  const loan = await prisma.loan.findUnique({ where: { id: params.id } })
  if (!loan || loan.userId !== session.user.id) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    // Default to the loan's EMI when no explicit amount is given
    const amount = typeof body.amount === "number" && body.amount > 0 ? body.amount : loan.emi

    if (loan.outstandingBalance <= 0) {
      return NextResponse.json({ error: "This loan is already fully paid" }, { status: 400 })
    }

    // Gateway payments must carry a verifiable signature (Razorpay) or a
    // simulated order id from our own order endpoint.
    let method = "manual"
    let gatewayPaymentId: string | null = null
    if (body.method === "razorpay") {
      const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body
      if (
        !isRazorpayConfigured() ||
        typeof razorpayOrderId !== "string" ||
        typeof razorpayPaymentId !== "string" ||
        typeof razorpaySignature !== "string" ||
        !verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature)
      ) {
        return NextResponse.json({ error: "Payment verification failed" }, { status: 400 })
      }
      method = "razorpay"
      gatewayPaymentId = razorpayPaymentId
    } else if (body.method === "simulated") {
      if (typeof body.orderId !== "string" || !body.orderId.startsWith("sim_order_")) {
        return NextResponse.json({ error: "Invalid simulated order" }, { status: 400 })
      }
      method = "simulated"
      gatewayPaymentId = body.orderId
    }

    const monthlyRate = loan.interestRate / 12 / 100
    const interestComponent = Math.round(loan.outstandingBalance * monthlyRate * 100) / 100
    const principalComponent = Math.max(0, Math.round((amount - interestComponent) * 100) / 100)
    const newBalance = Math.max(0, Math.round((loan.outstandingBalance - principalComponent) * 100) / 100)

    const nextDue = new Date(loan.nextPaymentDue)
    nextDue.setMonth(nextDue.getMonth() + 1)

    const [payment, updatedLoan] = await prisma.$transaction([
      prisma.payment.create({
        data: {
          loanId: loan.id,
          amount,
          principalComponent,
          interestComponent,
          method,
          gatewayPaymentId,
        },
      }),
      prisma.loan.update({
        where: { id: loan.id },
        data: {
          outstandingBalance: newBalance,
          totalInterestPaid: Math.round((loan.totalInterestPaid + interestComponent) * 100) / 100,
          nextPaymentDue: nextDue,
        },
      }),
    ])

    return NextResponse.json({ payment, loan: updatedLoan }, { status: 201 })
  } catch (error) {
    console.error("Record payment error:", error)
    return NextResponse.json({ error: "Failed to record payment" }, { status: 500 })
  }
}

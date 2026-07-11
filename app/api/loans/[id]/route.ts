import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rateLimit, rateLimitResponse } from "@/lib/rateLimit"

async function getOwnedLoan(loanId: string) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return { error: "Unauthorized", status: 401, loan: null }

  const loan = await prisma.loan.findUnique({ where: { id: loanId } })
  if (!loan || loan.userId !== session.user.id) {
    return { error: "Loan not found", status: 404, loan: null }
  }
  return { error: null, status: 200, loan }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { error, status, loan } = await getOwnedLoan(params.id)
  if (error || !loan) return NextResponse.json({ error }, { status })

  const { allowed, retryAfterSeconds } = rateLimit(`loans:mutate:${loan.userId}`, 40, 15 * 60 * 1000)
  if (!allowed) return rateLimitResponse(retryAfterSeconds)

  try {
    const body = await request.json()
    const data: Record<string, unknown> = {}

    if (typeof body.name === "string" && body.name.trim()) data.name = body.name.trim()
    if (typeof body.notificationsEnabled === "boolean") data.notificationsEnabled = body.notificationsEnabled
    if (typeof body.nextPaymentDue === "string") {
      const d = new Date(body.nextPaymentDue)
      if (!isNaN(d.getTime())) data.nextPaymentDue = d
    }

    const updated = await prisma.loan.update({ where: { id: loan.id }, data })
    return NextResponse.json({ loan: updated })
  } catch (err) {
    console.error("Update loan error:", err)
    return NextResponse.json({ error: "Failed to update loan" }, { status: 500 })
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const { error, status, loan } = await getOwnedLoan(params.id)
  if (error || !loan) return NextResponse.json({ error }, { status })

  const { allowed, retryAfterSeconds } = rateLimit(`loans:mutate:${loan.userId}`, 40, 15 * 60 * 1000)
  if (!allowed) return rateLimitResponse(retryAfterSeconds)

  await prisma.loan.delete({ where: { id: loan.id } })
  return NextResponse.json({ ok: true })
}

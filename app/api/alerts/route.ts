import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { buildLoanAlerts } from "@/lib/alerts"

// Real alerts derived from the user's loan portfolio (see lib/alerts.ts).
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const loans = await prisma.loan.findMany({ where: { userId: session.user.id } })
  const offers = loans.length > 0 ? await prisma.bankOffer.findMany() : []

  return NextResponse.json({ alerts: buildLoanAlerts(loans, offers) })
}

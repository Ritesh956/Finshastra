import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  const offers = await prisma.bankOffer.findMany({ orderBy: { interestRate: "asc" } })

  return NextResponse.json({
    offers: offers.map((o) => ({
      ...o,
      features: JSON.parse(o.features) as string[],
    })),
  })
}

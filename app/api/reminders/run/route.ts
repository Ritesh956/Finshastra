import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendMail } from "@/lib/mailer"

const formatINR = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })

// Sends EMI reminder emails for loans due within the next 3 days (or overdue)
// that have notifications enabled. Trigger it from a cron job with
// `Authorization: Bearer <CRON_SECRET>`, or as a logged-in user (own loans only).
export async function POST(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  const authHeader = request.headers.get("authorization")
  const isCron = Boolean(cronSecret && authHeader === `Bearer ${cronSecret}`)

  let userFilter: { userId?: string } = {}
  if (!isCron) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    userFilter = { userId: session.user.id }
  }

  const cutoff = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
  const loans = await prisma.loan.findMany({
    where: {
      ...userFilter,
      notificationsEnabled: true,
      outstandingBalance: { gt: 0 },
      nextPaymentDue: { lte: cutoff },
    },
    include: { user: { select: { email: true, name: true } } },
  })

  // One email per user covering all their due loans
  const byUser = new Map<string, typeof loans>()
  for (const loan of loans) {
    const list = byUser.get(loan.user.email) ?? []
    list.push(loan)
    byUser.set(loan.user.email, list)
  }

  const now = new Date()
  let sent = 0
  let logged = 0
  for (const [email, userLoans] of byUser) {
    const lines = userLoans.map((loan) => {
      const due = new Date(loan.nextPaymentDue)
      const status = due < now ? `OVERDUE since ${formatDate(due)}` : `due on ${formatDate(due)}`
      return `• ${loan.name}: ₹${formatINR(loan.emi)} ${status}`
    })
    const result = await sendMail({
      to: email,
      subject: `FinShastra: ${userLoans.length} EMI payment${userLoans.length === 1 ? " needs" : "s need"} your attention`,
      text:
        `Hi ${userLoans[0].user.name},\n\n` +
        `The following EMI payment${userLoans.length === 1 ? " is" : "s are"} due:\n\n` +
        `${lines.join("\n")}\n\n` +
        `Pay from your dashboard to stay on track.\n\n— FinShastra`,
    })
    if (result.delivered) sent++
    else logged++
  }

  return NextResponse.json({ remindersSent: sent, remindersLogged: logged, loansDue: loans.length })
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendMail } from "@/lib/mailer"

const formatINR = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })

const formatDate = (date: Date) =>
  date.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })

// Sends EMI reminder emails for loans due within the next 3 days (or overdue)
// that have notifications enabled. Triggered by a cron job with
// `Authorization: Bearer <CRON_SECRET>` (Vercel Cron sends this header
// automatically as a GET when the CRON_SECRET env var is set), or manually
// as a logged-in user (own loans only).

function isCronRequest(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET
  return Boolean(cronSecret && request.headers.get("authorization") === `Bearer ${cronSecret}`)
}

// Vercel Cron invokes the path with GET — cron auth only, no session fallback.
export async function GET(request: Request) {
  if (!isCronRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  return runReminders({})
}

export async function POST(request: Request) {
  let userFilter: { userId?: string } = {}
  if (!isCronRequest(request)) {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    userFilter = { userId: session.user.id }
  }
  return runReminders(userFilter)
}

async function runReminders(userFilter: { userId?: string }) {
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

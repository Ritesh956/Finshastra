import { NextResponse } from "next/server"
import Anthropic from "@anthropic-ai/sdk"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { getKnowledgeBaseResponse } from "@/utils/loanKnowledgeBase"

const MAX_HISTORY = 20

interface ChatMessage {
  role: "user" | "assistant"
  content: string
}

async function buildUserContext(): Promise<string> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return "The user is not logged in, so you have no information about their personal loans."
  }

  const [user, loans] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true, income: true, expenses: true, creditScore: true },
    }),
    prisma.loan.findMany({
      where: { userId: session.user.id },
      select: {
        name: true,
        type: true,
        principal: true,
        interestRate: true,
        termMonths: true,
        emi: true,
        outstandingBalance: true,
        totalInterestPaid: true,
        nextPaymentDue: true,
      },
    }),
  ])

  if (!user) return "The user is not logged in."

  const profile = [
    `Name: ${user.name}`,
    user.income != null ? `Monthly income: ₹${user.income.toLocaleString("en-IN")}` : null,
    user.expenses != null ? `Monthly expenses: ₹${user.expenses.toLocaleString("en-IN")}` : null,
    user.creditScore != null ? `Credit score: ${user.creditScore}` : null,
  ]
    .filter(Boolean)
    .join("\n")

  const loanLines =
    loans.length === 0
      ? "The user has no loans tracked yet."
      : loans
          .map(
            (l) =>
              `- ${l.name} (${l.type}): principal ₹${l.principal.toLocaleString("en-IN")}, ` +
              `${l.interestRate}% p.a., ${l.termMonths} months, EMI ₹${l.emi.toLocaleString("en-IN")}, ` +
              `outstanding ₹${l.outstandingBalance.toLocaleString("en-IN")}, ` +
              `interest paid so far ₹${l.totalInterestPaid.toLocaleString("en-IN")}, ` +
              `next payment due ${l.nextPaymentDue.toISOString().split("T")[0]}`,
          )
          .join("\n")

  return `Logged-in user profile:\n${profile}\n\nTheir tracked loans:\n${loanLines}`
}

export async function POST(request: Request) {
  let messages: ChatMessage[]
  try {
    const body = await request.json()
    messages = Array.isArray(body.messages) ? body.messages : []
    messages = messages
      .filter(
        (m): m is ChatMessage =>
          (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string" && m.content.length > 0,
      )
      .slice(-MAX_HISTORY)
    if (messages.length === 0 || messages[messages.length - 1].role !== "user") {
      return NextResponse.json({ error: "The last message must be from the user" }, { status: 400 })
    }
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY

  // No API key configured — answer from the built-in loan knowledge base
  if (!apiKey) {
    const reply = getKnowledgeBaseResponse(messages[messages.length - 1].content)
    return NextResponse.json({ reply, source: "knowledge-base" })
  }

  try {
    const client = new Anthropic({ apiKey })
    const userContext = await buildUserContext()

    const response = await client.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 1024,
      system: `You are the FinShastra AI Loan Assistant, embedded in an Indian personal loan-management web app. You help users understand loans, EMIs, interest rates, credit scores, prepayment, and their own loan portfolio.

Guidelines:
- All currency is Indian Rupees (₹). Use Indian number formatting (lakh, crore where natural).
- Be concise and practical. Use short paragraphs or bullet lists, no markdown headings.
- When the user asks about their own loans, answer from the context below. If they ask something you can compute (e.g. total outstanding, which loan to prepay first), do the arithmetic and show it.
- Recommend the app's built-in tools when relevant: Loan Comparison Tool, Repayment Plan Simulator, EMI Notifications, and the Dashboard.
- You are not a licensed financial advisor; for major decisions suggest consulting one. Never invent loan data the context doesn't contain.

${userContext}`,
      messages,
    })

    if (response.stop_reason === "refusal") {
      return NextResponse.json({
        reply: "I can't help with that request. Try asking me about loans, EMIs, interest rates, or your portfolio.",
        source: "ai",
      })
    }

    const reply = response.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((block) => block.text)
      .join("")

    return NextResponse.json({ reply, source: "ai" })
  } catch (error) {
    console.error("Chat API error:", error)
    // Degrade gracefully to the knowledge base rather than failing the chat
    const reply = getKnowledgeBaseResponse(messages[messages.length - 1].content)
    return NextResponse.json({ reply, source: "knowledge-base" })
  }
}

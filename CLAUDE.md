# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

FinShastra — a full-stack loan-management app. Next.js 14 (App Router) + TypeScript + Prisma 6 + SQLite + NextAuth v4 + Tailwind/shadcn-ui. Currency and audience are Indian (₹, `en-IN` formatting, lakh/crore).

## Commands

```bash
npm run dev        # dev server (port 3000; picks another if occupied)
npm run build      # production build — TS + ESLint checks are ENFORCED, keep them on
npm test           # Vitest (utils/*.test.ts)
npx tsc --noEmit   # typecheck
npx prisma migrate dev   # create/apply migrations after schema changes
node prisma/seed.js      # seed bank offers (idempotent)
```

## Environment

`.env` (gitignored — copy from `.env.example`):
- `DATABASE_URL` — SQLite file (`file:./dev.db`, relative to `prisma/`)
- `NEXTAUTH_SECRET` — JWT signing secret
- `NEXTAUTH_URL` — must match the dev server port; update it if the port changes
- `ANTHROPIC_API_KEY` — optional; enables the real Claude chatbot. Without it `/api/chat` falls back to the rule-based knowledge base in `utils/loanKnowledgeBase.ts`.

## Architecture

- **Auth**: NextAuth credentials provider in `lib/auth.ts` (bcrypt compare against Prisma `User`). `contexts/AuthContext.tsx` wraps NextAuth's `useSession`/`signIn`/`signOut` but exposes the legacy `useAuth()` interface (`user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `signup`, `updateProfile`) — all pages consume that, not NextAuth directly. `middleware.ts` protects `/dashboard` and `/profile`. Client-side redirects must check `isLoading` before `isAuthenticated` (session starts in "loading").
- **Data**: Prisma singleton in `lib/prisma.ts`. Schema in `prisma/schema.prisma` (User, Loan, Payment, BankOffer). SQLite has no arrays — `BankOffer.features` is a JSON-encoded string, parsed in `app/api/bank-offers/route.ts`.
- **API routes** (`app/api/`): all loan/payment/user routes are session-scoped via `getServerSession(authOptions)` — always verify `loan.userId === session.user.id` before mutating. Payment recording (`loans/[id]/payments`) splits amount into interest/principal at the loan's monthly rate and updates balance + next due date in a `$transaction`.
- **AI chat** (`app/api/chat/route.ts`): Claude (`claude-opus-4-8`) with the user's real loan portfolio injected into the system prompt; degrades to `getKnowledgeBaseResponse()` when no key or on API error.
- **EMI math**: `utils/loanCalculations.ts` — reused by both client (live preview) and server (loan creation). Zero-interest loans are handled as `principal / termMonths` at call sites (the formula divides by zero at 0%).
- **UI**: shadcn/ui components in `components/ui/`, feature components in `components/`. Dashboard (`components/UserDashboard.tsx`) fetches `/api/loans`, `/api/payments`, `/api/bank-offers` and has loading/error/empty states. Toasts via `hooks/use-toast` + `<Toaster />` in `app/layout.tsx`.

## Gotchas

- **`app/globals.css` has `!important` overrides.** `[class*="bg-gradient"] { color: white !important }` is countered by `[class*="bg-clip-text"] { color: transparent !important }` for gradient text. A global heading font-size override was removed once already — don't reintroduce global `!important` typography rules; they silently defeat Tailwind utilities.
- **Windows + `.next` corruption**: if the dev server throws `UNKNOWN: unknown error, open '...\.next\...'`, stop the server, delete `.next`, restart. Never run `next build` while the dev server is running (they share `.next`).
- **Prisma version is pinned to v6** — v7 has a breaking config format (`prisma.config.ts`, driver adapters). Don't upgrade casually.
- **react-day-picker is v9** — `components/ui/calendar.tsx` uses the v9 API (`Chevron` component, `month_caption`/`weekdays`/`day_button` classNames). Don't paste v8-era shadcn calendar snippets.
- Never commit `.env` or `prisma/dev.db` (both gitignored).

## Honest feature status

Real: auth, loan CRUD, payment recording with amortization, payment-history chart, bank offers, chatbot (Claude or fallback), recommendations, per-loan notification *preference*.
Not real yet (README roadmap): payment gateway, email/SMS reminder delivery, password-reset emails, PDF export, Postgres/deployment.

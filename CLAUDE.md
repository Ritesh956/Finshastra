# CLAUDE.md

Guidance for Claude Code when working in this repository.

## Project

FinShastra — a full-stack loan-management app. Next.js 14 (App Router) + TypeScript + Prisma 6 + Postgres (Neon) + NextAuth v4 + Tailwind/shadcn-ui. Currency and audience are Indian (₹, `en-IN` formatting, lakh/crore).

## Commands

```bash
npm run dev        # dev server (port 3000; picks another if occupied)
npm run build      # production build — TS + ESLint checks are ENFORCED, keep them on
npm test           # Vitest (utils/*.test.ts + lib/*.test.ts)
npx tsc --noEmit   # typecheck
npx prisma migrate dev   # create/apply migrations after schema changes
node prisma/seed.js      # seed bank offers (idempotent)
```

## Environment

`.env` (gitignored — copy from `.env.example`, which documents the full list):
- `DATABASE_URL` — Neon Postgres connection string. Locally use the **direct** host (`ep-...neon.tech`); Prisma Migrate does not work through the pooler. On Netlify use the **pooled** host (`ep-...-pooler...neon.tech`) — serverless needs PgBouncer. Strip `channel_binding=require` if Neon's console includes it; keep `sslmode=require`.
- `NEXTAUTH_SECRET` — JWT signing secret
- `NEXTAUTH_URL` — must match the dev server port; update it if the port changes. Locally the Claude preview config (`.claude/launch.json`) pins port **4321** because Docker Desktop holds 3000/3001 on this machine.
- `ANTHROPIC_API_KEY` — optional; enables the real Claude chatbot. Without it `/api/chat` falls back to the rule-based knowledge base in `utils/loanKnowledgeBase.ts`.
- Optional integrations (all degrade gracefully when unset): `RAZORPAY_KEY_ID`/`RAZORPAY_KEY_SECRET` (real gateway vs simulated checkout), `SMTP_*`/`EMAIL_FROM` (email vs console logging), `CRON_SECRET` (reminder job auth).

## Architecture

- **Auth**: NextAuth credentials provider in `lib/auth.ts` (bcrypt compare against Prisma `User`). `contexts/AuthContext.tsx` wraps NextAuth's `useSession`/`signIn`/`signOut` but exposes the legacy `useAuth()` interface (`user`, `isAuthenticated`, `isLoading`, `login`, `logout`, `signup`, `updateProfile`) — all pages consume that, not NextAuth directly. `middleware.ts` protects `/dashboard` and `/profile`, and also rate-limits `POST /api/auth/callback/credentials` (login) — see Rate limiting below for why that one has to live in middleware instead of `authorize()`. Client-side redirects must check `isLoading` before `isAuthenticated` (session starts in "loading").
- **Data**: Prisma singleton in `lib/prisma.ts`. Schema in `prisma/schema.prisma` (User, Loan, Payment, BankOffer, PasswordResetToken). `BankOffer.features` is a JSON-encoded string (kept from the SQLite era for compatibility), parsed in `app/api/bank-offers/route.ts`.
- **API routes** (`app/api/`): all loan/payment/user routes are session-scoped via `getServerSession(authOptions)` — always verify `loan.userId === session.user.id` before mutating. Payment recording (`loans/[id]/payments`) splits amount into interest/principal at the loan's monthly rate and updates balance + next due date in a `$transaction`.
- **Route business logic lives in `lib/`, not in the handlers**: payment amortization split + due-date advance in `lib/payments.ts`, alert derivation in `lib/alerts.ts`, reset-token hashing/expiry in `lib/resetToken.ts` — each with a co-located `*.test.ts`. Keep new domain logic in testable pure functions there; route handlers should only do session checks, Prisma I/O, and response shaping. `advanceDueDateByOneMonth` clamps to month-end (Jan 31 → Feb 28/29) — don't replace it with a bare `setMonth(+1)`, which overflows into March.
- **AI chat** (`app/api/chat/route.ts`): Claude (`claude-opus-4-8`) with the user's real loan portfolio injected into the system prompt; degrades to `getKnowledgeBaseResponse()` when no key or on API error.
- **EMI math**: `utils/loanCalculations.ts` — reused by both client (live preview) and server (loan creation). Zero-interest loans are handled as `principal / termMonths` at call sites (the formula divides by zero at 0%).
- **UI**: shadcn/ui components in `components/ui/`, feature components in `components/`. Dashboard (`components/UserDashboard.tsx`) fetches `/api/loans`, `/api/payments`, `/api/bank-offers` and has loading/error/empty states. Toasts via `hooks/use-toast` + `<Toaster />` in `app/layout.tsx`.

## Rate limiting

`lib/rateLimit.ts` is an in-memory fixed-window limiter — no Redis/external dependency. It works correctly for a single-process deployment (one `next start`) but does **not** share state across multiple instances or between the Node runtime (route handlers) and the Edge runtime (`middleware.ts`); each keeps its own buckets. Applied to: signup, forgot-password, reset-password (all per-IP, in their own route handlers), loan create/update/delete/payments (per-user, in their own route handlers), and login (per-IP, in `middleware.ts` — the only one that has to live there, since NextAuth normalizes every credentials failure to a generic `CredentialsSignin` error before the app ever sees it, so a limit inside `authorize()` couldn't return a distinguishable response). Before scaling beyond one instance, swap the in-memory `Map` for a shared store (e.g. Upstash Redis).

## Gotchas

- **`app/globals.css` has `!important` overrides.** `[class*="bg-gradient"] { color: white !important }` is countered by `[class*="bg-clip-text"] { color: transparent !important }` for gradient text. A global heading font-size override was removed once already — don't reintroduce global `!important` typography rules; they silently defeat Tailwind utilities.
- **Windows + `.next` corruption**: if the dev server throws `UNKNOWN: unknown error, open '...\.next\...'`, stop the server, delete `.next`, restart. Never run `next build` while the dev server is running (they share `.next`).
- **Prisma version is pinned to v6** — v7 has a breaking config format (`prisma.config.ts`, driver adapters). Don't upgrade casually.
- **react-day-picker is v9** — `components/ui/calendar.tsx` uses the v9 API (`Chevron` component, `month_caption`/`weekdays`/`day_button` classNames). Don't paste v8-era shadcn calendar snippets.
- Never commit `.env` or `prisma/dev.db` (both gitignored).
- **`LoanCard` renders `{loan.type} Loan`** — anything mapping a `BankOffer` into it must strip the `" Loan"` suffix from `loanType` (`.replace(/ Loan$/, "")`) or badges read "Home Loan Loan". Both `LoanComparisonTool` and `PersonalizedRecommendations` do this.
- **Primary CTAs use `<Button variant="gradient">`** (defined in `components/ui/button.tsx`) — don't inline `bg-gradient-to-r ...` classes on buttons; that's how the tool tabs drifted apart before. Currency is always ₹ with `toLocaleString("en-IN")` in the UI ("Rs." only inside generated PDFs).

## Honest feature status

Real: auth, loan CRUD, payment recording with amortization, payment-history chart, bank offers, chatbot (Claude or fallback), recommendations, per-loan notification preference, payment gateway (Razorpay test mode via `lib/razorpay.ts`; simulated checkout fallback when keys unset), real alerts (`/api/alerts`), email EMI reminders (`/api/reminders/run`, SMTP via `lib/mailer.ts` or console fallback), token-based password reset, PDF statement export (jspdf — uses "Rs." because built-in fonts lack the ₹ glyph), rate limiting, mobile nav, `/tools` + `/faq` pages, 404/error pages, Neon Postgres persistence.
Not real yet: SMS reminders (no free provider — deliberately skipped).

## Deployment status

**Live at https://finshastra.vercel.app** — Vercel project `finshastra` (team "Ritesh's projects"), GitHub-linked, auto-deploys every push to `main`. Database is **Neon Postgres** (demo login test@gmail.com / test1234 exists there). `vercel.json` runs the reminder cron daily at 03:00 UTC. The deployment-protection SSO page on `*-riteshs-projects-*.vercel.app` URLs is normal — the public domain is the plain one. Note: a duplicate Vercel project `loan-manage` from an earlier import attempt also auto-builds (and fails) on every push; it should be deleted in the Vercel dashboard. Local `.env` uses the direct (non-pooler) Neon host, required for `prisma migrate`.

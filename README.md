# FinShastra — Smart Loan Management

A full-stack loan-management platform built with Next.js 14. Track loans with real persistence, record EMI payments with correct amortization math, compare bank offers, and chat with an AI assistant that knows your actual portfolio.

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-6-2D3748?style=for-the-badge&logo=prisma)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?style=for-the-badge&logo=tailwind-css)

## Features

### Real, working functionality
- **Authentication** — NextAuth.js with credentials provider, bcrypt-hashed passwords, JWT sessions, and middleware-protected routes (`/dashboard`, `/profile`)
- **Persistent loan tracking** — loans live in a SQLite database via Prisma; add, delete, and pay EMIs and they survive restarts
- **Correct EMI math** — standard amortization formula; each payment is split into interest and principal components, balance and next-due-date update in a transaction
- **Payment history** — real monthly aggregates charted on the dashboard
- **Bank offers** — seeded reference data served from the database, used by the comparison table and personalized recommendations
- **AI Loan Assistant** — `/api/chat` calls Claude (Anthropic API) with the logged-in user's real loan portfolio as context; falls back to a built-in rule-based knowledge base when no API key is configured
- **Personalized recommendations** — filters live bank offers against your income, expenses, and credit score (persisted to your profile when logged in)
- **EMI notifications toggle** — per-loan setting persisted to the database
- Loan comparison tool, repayment simulator, payment calendar, dark theme, responsive layout

### Honest limitations
- No payment gateway — "Pay EMI" records a payment, it doesn't move money
- No email/SMS delivery for notifications (the per-loan preference is stored, delivery is not implemented)
- Password reset UI exists but doesn't send emails
- SQLite is for development; swap `DATABASE_URL` to Postgres for production

## Getting Started

### Prerequisites
- Node.js 18+

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#    - DATABASE_URL: leave as-is for SQLite
#    - NEXTAUTH_SECRET: generate with `openssl rand -base64 32`
#    - ANTHROPIC_API_KEY: optional — enables the real AI chatbot

# 3. Create the database and seed bank offers
npx prisma migrate dev
node prisma/seed.js

# 4. Run the dev server
npm run dev
```

Open http://localhost:3000, sign up, and add your first loan.

### Tests

```bash
npm test          # Vitest — EMI math + knowledge base
npx tsc --noEmit  # typecheck (also enforced during `next build`)
```

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (App Router), React 18, TypeScript |
| Database | Prisma 6 + SQLite (dev) |
| Auth | NextAuth.js v4, bcryptjs |
| AI | Anthropic Claude API (`@anthropic-ai/sdk`) with rule-based fallback |
| UI | Tailwind CSS, shadcn/ui, Radix, Recharts, lucide-react |
| Tests | Vitest |

## API Routes

| Route | Methods | Description |
|---|---|---|
| `/api/auth/[...nextauth]` | GET/POST | NextAuth session + credentials login |
| `/api/auth/signup` | POST | Create account (validated, bcrypt-hashed) |
| `/api/user/me` | GET/PATCH | Profile read/update |
| `/api/loans` | GET/POST | List / create loans (session-scoped) |
| `/api/loans/[id]` | PATCH/DELETE | Update (name, due date, notifications) / delete |
| `/api/loans/[id]/payments` | POST | Record an EMI payment (amortized split) |
| `/api/payments` | GET | Payment history + monthly chart aggregates |
| `/api/bank-offers` | GET | Seeded bank loan offers |
| `/api/chat` | POST | AI assistant (Claude or knowledge-base fallback) |

## Roadmap

- [ ] Payment gateway integration (Razorpay/Stripe)
- [ ] Email/SMS EMI reminders (the toggle already persists per loan)
- [ ] Real password reset flow
- [ ] PDF statement export
- [ ] Postgres + deployment config

---

Crafted with care by **Ritesh Gupta**

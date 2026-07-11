import { NextResponse } from "next/server"

// In-memory fixed-window rate limiter. Deliberately simple: no external
// dependency, works out of the box for a single-process deployment (one
// `next start` / one dev server). It does NOT share state across multiple
// server instances or across the Node vs Edge runtime (this module is used
// from both regular route handlers and middleware.ts, which run in separate
// processes/isolates and therefore keep independent buckets). If this app is
// ever deployed behind multiple instances or Vercel's distributed Edge
// Network, swap this for a shared store (e.g. Upstash Redis) — see README.

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

// Opportunistic cleanup so `buckets` doesn't grow unbounded from one-off IPs.
// Runs at most once every 5 minutes, piggybacking on normal traffic.
let lastSweep = Date.now()
function sweep(now: number) {
  if (now - lastSweep < 5 * 60 * 1000) return
  lastSweep = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt < now) buckets.delete(key)
  }
}

export interface RateLimitResult {
  allowed: boolean
  retryAfterSeconds: number
}

/** Returns whether `key` is still within `limit` requests per `windowMs`. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now()
  sweep(now)

  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { allowed: true, retryAfterSeconds: 0 }
  }
  if (bucket.count >= limit) {
    return { allowed: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }
  bucket.count += 1
  return { allowed: true, retryAfterSeconds: 0 }
}

/** Reads the originating client IP from forwarding headers set by a proxy/load balancer. */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for")
  if (forwarded) return forwarded.split(",")[0].trim()
  return headers.get("x-real-ip") ?? "unknown"
}

export function rateLimitResponse(retryAfterSeconds: number) {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    { status: 429, headers: { "Retry-After": String(retryAfterSeconds) } },
  )
}

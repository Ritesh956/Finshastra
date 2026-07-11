import { describe, it, expect, beforeEach, afterEach, vi } from "vitest"
import { rateLimit, getClientIp } from "./rateLimit"

// Each test uses a unique key: the limiter's buckets are module-level state.
let n = 0
const freshKey = () => `test-key-${++n}`

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date(2026, 6, 15, 12, 0, 0))
})

afterEach(() => {
  vi.useRealTimers()
})

describe("rateLimit", () => {
  it("allows requests up to the limit within a window", () => {
    const key = freshKey()
    for (let i = 0; i < 5; i++) {
      expect(rateLimit(key, 5, 60_000).allowed).toBe(true)
    }
  })

  it("blocks the request after the limit and reports a retry delay", () => {
    const key = freshKey()
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000)
    const result = rateLimit(key, 3, 60_000)
    expect(result.allowed).toBe(false)
    expect(result.retryAfterSeconds).toBeGreaterThan(0)
    expect(result.retryAfterSeconds).toBeLessThanOrEqual(60)
  })

  it("resets the count after the window elapses", () => {
    const key = freshKey()
    for (let i = 0; i < 3; i++) rateLimit(key, 3, 60_000)
    expect(rateLimit(key, 3, 60_000).allowed).toBe(false)

    vi.advanceTimersByTime(60_001)
    expect(rateLimit(key, 3, 60_000).allowed).toBe(true)
  })

  it("tracks different keys independently", () => {
    const a = freshKey()
    const b = freshKey()
    for (let i = 0; i < 3; i++) rateLimit(a, 3, 60_000)
    expect(rateLimit(a, 3, 60_000).allowed).toBe(false)
    expect(rateLimit(b, 3, 60_000).allowed).toBe(true)
  })

  it("retryAfterSeconds counts down as the window ages", () => {
    const key = freshKey()
    rateLimit(key, 1, 60_000)
    const early = rateLimit(key, 1, 60_000).retryAfterSeconds
    vi.advanceTimersByTime(30_000)
    const late = rateLimit(key, 1, 60_000).retryAfterSeconds
    expect(late).toBeLessThan(early)
  })
})

describe("getClientIp", () => {
  it("takes the first hop from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1, 172.16.0.1" })
    expect(getClientIp(headers)).toBe("203.0.113.7")
  })

  it("falls back to x-real-ip", () => {
    const headers = new Headers({ "x-real-ip": "198.51.100.9" })
    expect(getClientIp(headers)).toBe("198.51.100.9")
  })

  it("returns 'unknown' with no forwarding headers", () => {
    expect(getClientIp(new Headers())).toBe("unknown")
  })
})

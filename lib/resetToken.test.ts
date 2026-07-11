import { describe, it, expect } from "vitest"
import crypto from "crypto"
import {
  generateResetToken,
  hashResetToken,
  isResetTokenUsable,
  RESET_TOKEN_TTL_MS,
} from "./resetToken"

const NOW = new Date(2026, 6, 15, 12, 0, 0)

describe("generateResetToken", () => {
  it("produces a 64-char hex token whose hash matches hashResetToken", () => {
    const { token, tokenHash } = generateResetToken(NOW)
    expect(token).toMatch(/^[0-9a-f]{64}$/)
    expect(tokenHash).toBe(hashResetToken(token))
  })

  it("stores only a hash, never the raw token", () => {
    const { token, tokenHash } = generateResetToken(NOW)
    expect(tokenHash).not.toBe(token)
    expect(tokenHash).toMatch(/^[0-9a-f]{64}$/) // sha256 hex
  })

  it("expires exactly one hour after issuance", () => {
    const { expiresAt } = generateResetToken(NOW)
    expect(expiresAt.getTime()).toBe(NOW.getTime() + RESET_TOKEN_TTL_MS)
    expect(RESET_TOKEN_TTL_MS).toBe(60 * 60 * 1000)
  })

  it("generates a different token every call", () => {
    expect(generateResetToken(NOW).token).not.toBe(generateResetToken(NOW).token)
  })
})

describe("hashResetToken", () => {
  it("is deterministic sha256 hex", () => {
    const expected = crypto.createHash("sha256").update("abc").digest("hex")
    expect(hashResetToken("abc")).toBe(expected)
    expect(hashResetToken("abc")).toBe(hashResetToken("abc"))
  })

  it("different tokens hash differently", () => {
    expect(hashResetToken("token-a")).not.toBe(hashResetToken("token-b"))
  })
})

describe("isResetTokenUsable", () => {
  const oneHourLater = new Date(NOW.getTime() + RESET_TOKEN_TTL_MS)

  it("accepts a fresh, unused token", () => {
    expect(isResetTokenUsable({ usedAt: null, expiresAt: oneHourLater }, NOW)).toBe(true)
  })

  it("rejects a missing record", () => {
    expect(isResetTokenUsable(null, NOW)).toBe(false)
  })

  it("rejects a token that has already been used (single-use)", () => {
    expect(
      isResetTokenUsable({ usedAt: new Date(NOW.getTime() - 1000), expiresAt: oneHourLater }, NOW),
    ).toBe(false)
  })

  it("rejects an expired token", () => {
    expect(
      isResetTokenUsable({ usedAt: null, expiresAt: new Date(NOW.getTime() - 1) }, NOW),
    ).toBe(false)
  })

  it("accepts a token at the exact expiry instant", () => {
    expect(isResetTokenUsable({ usedAt: null, expiresAt: NOW }, NOW)).toBe(true)
  })
})

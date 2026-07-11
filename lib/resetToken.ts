import crypto from "crypto"

// Password-reset token helpers, extracted from the auth routes so the
// hashing/expiry/single-use rules can be unit-tested.

export const RESET_TOKEN_TTL_MS = 60 * 60 * 1000 // 1 hour

/** Only the SHA-256 hash is stored; the raw token exists solely in the emailed link. */
export function hashResetToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex")
}

export function generateResetToken(now: Date = new Date()): {
  token: string
  tokenHash: string
  expiresAt: Date
} {
  const token = crypto.randomBytes(32).toString("hex")
  return {
    token,
    tokenHash: hashResetToken(token),
    expiresAt: new Date(now.getTime() + RESET_TOKEN_TTL_MS),
  }
}

/** A token is usable only if it exists, has never been used, and hasn't expired. */
export function isResetTokenUsable<T extends { usedAt: Date | null; expiresAt: Date }>(
  record: T | null,
  now: Date = new Date(),
): record is T {
  if (!record) return false
  if (record.usedAt) return false
  return record.expiresAt >= now
}

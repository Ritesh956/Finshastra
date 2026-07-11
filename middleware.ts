import { NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import type { NextRequest } from "next/server"
import { rateLimit, getClientIp, rateLimitResponse } from "@/lib/rateLimit"

const PROTECTED_PAGES = ["/dashboard", "/profile"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Login goes through NextAuth's own catch-all route, which normalizes every
  // credentials failure to a generic "CredentialsSignin" error regardless of
  // cause — so a rate limit applied inside authorize() would be indistinguishable
  // from a wrong password to the client. Intercepting here, before the request
  // reaches NextAuth, is the only way to return a distinct 429 for this route.
  if (pathname === "/api/auth/callback/credentials" && request.method === "POST") {
    const ip = getClientIp(request.headers)
    const { allowed, retryAfterSeconds } = rateLimit(`login:${ip}`, 10, 15 * 60 * 1000)
    if (!allowed) return rateLimitResponse(retryAfterSeconds)
  }

  if (PROTECTED_PAGES.some((page) => pathname === page || pathname.startsWith(`${page}/`))) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const signInUrl = new URL("/login", request.url)
      signInUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(signInUrl)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*", "/api/auth/callback/credentials"],
}

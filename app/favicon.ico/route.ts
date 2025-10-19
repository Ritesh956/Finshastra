import { NextResponse } from "next/server"

export function GET() {
  // Redirect /favicon.ico to our SVG favicon to avoid 404s
  return NextResponse.redirect(new URL("/favicon.svg", "http://localhost"))
}

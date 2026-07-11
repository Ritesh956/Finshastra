import type { Metadata } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/ThemeProvider"
import { AuthProvider } from "@/contexts/AuthContext"
import { LayoutContent } from "@/components/LayoutContent"
import { Toaster } from "@/components/ui/toaster"
import type React from "react"

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" })
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" })

export const metadata: Metadata = {
  title: {
    default: "FinShastra - Smart Loan Management",
    template: "%s | FinShastra",
  },
  description:
    "Track loans, pay EMIs, compare bank offers, and get AI-powered recommendations — intelligent loan management built for India.",
  keywords: ["loan management", "EMI calculator", "loan comparison", "EMI tracker", "India"],
  openGraph: {
    title: "FinShastra - Smart Loan Management",
    description:
      "Track loans, pay EMIs, compare bank offers, and get AI-powered recommendations — intelligent loan management built for India.",
    type: "website",
    siteName: "FinShastra",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans min-h-screen bg-slate-950`} suppressHydrationWarning>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
          <AuthProvider>
            <LayoutContent>{children}</LayoutContent>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


"use client"

import { usePathname, useRouter } from "next/navigation"
import { Command } from "@/components/Command"
import { AlertDialogDemo } from "@/components/AlertDialog"
import { ThemeToggle } from "@/components/ThemeToggle"
import { UserProfileDropdown } from "@/components/UserProfileDropdown"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  // Don't show header/footer on login/signup pages
  const isAuthPage = pathname === "/login" || pathname === "/signup"

  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="flex flex-col min-h-screen bg-background" suppressHydrationWarning>
      {/* Enhanced Modern Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-purple-900/30 bg-gradient-to-r from-slate-950 via-purple-950/40 to-slate-950 backdrop-blur-xl shadow-lg shadow-purple-900/20">
        <div className="container flex h-20 items-center justify-between px-6 mx-auto" suppressHydrationWarning>
          <div className="flex items-center space-x-10" suppressHydrationWarning>
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 shadow-lg group-hover:shadow-2xl group-hover:shadow-purple-500/50 group-hover:scale-105 transition-all duration-300" suppressHydrationWarning>
                <span className="text-3xl font-black text-white">₹</span>
              </div>
              <div className="flex flex-col" suppressHydrationWarning>
                <span className="text-2xl font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  FinShastra
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold tracking-wide">SMART LOAN MANAGEMENT</span>
              </div>
            </Link>
            <nav className="hidden lg:flex items-center space-x-1 ml-8">
              <Link 
                href="/" 
                className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                  pathname === "/" 
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105" 
                    : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 hover:scale-105"
                }`}
              >
                Home
              </Link>
              {isAuthenticated && (
                <Link 
                  href="/dashboard" 
                  className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                    pathname === "/dashboard" 
                      ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-purple-500/30 scale-105" 
                      : "text-slate-300 hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 hover:scale-105"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center space-x-3" suppressHydrationWarning>
            <div className="hidden lg:flex" suppressHydrationWarning>
              <Command />
            </div>
            <AlertDialogDemo />
            {isAuthenticated && user ? (
              <UserProfileDropdown user={user} />
            ) : (
              <div className="flex items-center space-x-3" suppressHydrationWarning>
                <Button 
                  variant="ghost" 
                  size="lg" 
                  onClick={() => router.push("/login")} 
                  className="text-sm font-bold text-slate-300 hover:bg-slate-800 hover:scale-105 transition-all duration-300 rounded-xl px-6"
                >
                  Login
                </Button>
                <Button 
                  size="lg" 
                  onClick={() => router.push("/signup")} 
                  className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-700 hover:via-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/40 hover:shadow-xl hover:shadow-purple-500/60 text-sm font-bold px-8 rounded-xl hover:scale-105 transition-all duration-300"
                >
                  Sign Up
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      
      {/* Enhanced Modern Footer */}
      <footer className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-t border-slate-800" suppressHydrationWarning>
        {/* Subtle animated background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none" suppressHydrationWarning>
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-blue-400/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-purple-400/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 py-8 relative z-10" suppressHydrationWarning>
          <div className="flex flex-col md:flex-row items-center justify-between gap-6" suppressHydrationWarning>
            {/* GitHub Link - Left */}
            <a 
              href="https://github.com/Ritesh956/LATEST_HACK" 
              target="_blank" 
              rel="noreferrer"
              className="group inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-gradient-to-r from-slate-800 to-slate-700 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-bold text-sm shadow-lg hover:shadow-2xl hover:shadow-purple-500/40 hover:scale-105 transition-all duration-300"
            >
              <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
              <span className="flex items-center gap-2">
                View on GitHub
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </a>
            
            {/* Made by Ritesh - Center/Right */}
            <div className="flex items-center gap-3" suppressHydrationWarning>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 flex items-center justify-center shadow-lg" suppressHydrationWarning>
                <span className="text-white font-black text-lg">R</span>
              </div>
              <p className="text-slate-400 text-sm font-medium">
                Crafted with <span className="text-red-500 animate-pulse inline-block">♥</span> by{" "}
                <span className="font-black bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent text-base">
                  Ritesh Gupta
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

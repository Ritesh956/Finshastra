"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { UserDashboard } from "@/components/UserDashboard"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated || !user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Button variant="ghost" onClick={() => router.push("/")} className="mb-2 text-slate-300 hover:text-white hover:bg-slate-800">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
            <h1 className="text-3xl font-bold text-white">Welcome back, {user.name}!</h1>
            <p className="text-slate-400 mt-1">Here's an overview of your loan portfolio</p>
          </div>
        </div>
        <UserDashboard />
      </div>
    </div>
  )
}

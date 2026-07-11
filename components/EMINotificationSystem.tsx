"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bell, BellOff, Loader2, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/contexts/AuthContext"

interface UserLoan {
  id: string
  name: string
  emi: number
  outstandingBalance: number
  nextPaymentDue: string
  notificationsEnabled: boolean
}

const formatINR = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })

export function EMINotificationSystem() {
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const [loans, setLoans] = useState<UserLoan[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (authLoading) return
    if (!isAuthenticated) {
      setIsLoading(false)
      return
    }
    fetch("/api/loans")
      .then((res) => (res.ok ? res.json() : { loans: [] }))
      .then((data) => setLoans(data.loans))
      .catch(() => setLoans([]))
      .finally(() => setIsLoading(false))
  }, [isAuthenticated, authLoading])

  const notifications = loans.filter(
    (loan) => loan.notificationsEnabled && loan.outstandingBalance > 0 && !dismissed.includes(loan.id),
  )

  const isOverdue = (loan: UserLoan) => new Date(loan.nextPaymentDue).getTime() < Date.now()

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">EMI Notification System</CardTitle>
            <CardDescription className="text-slate-400">
              Never miss a payment with smart reminders
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {authLoading || isLoading ? (
          <div className="flex items-center justify-center py-10 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            Loading your reminders…
          </div>
        ) : !isAuthenticated ? (
          <div className="flex flex-col items-center py-10 text-center">
            <Bell className="h-10 w-10 text-slate-600 mb-3" />
            <p className="text-slate-300 font-medium">Log in to see your EMI reminders</p>
            <p className="text-sm text-slate-500 mt-1 mb-4">
              Reminders are built from your real loans and their due dates.
            </p>
            <Button variant="gradient" asChild>
              <Link href="/login">Login</Link>
            </Button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-10 text-center">
            <CheckCircle2 className="h-10 w-10 text-green-500 mb-3" />
            <p className="text-slate-300 font-medium">No upcoming EMI notifications</p>
            <p className="text-sm text-slate-500 mt-1">
              Add a loan on the dashboard and enable its reminder toggle to see notifications here.
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {notifications.map((loan) => (
              <li
                key={loan.id}
                className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-lg border border-slate-700 bg-slate-900/50 p-4"
              >
                <div>
                  <p className="font-medium text-white flex items-center gap-2">
                    {loan.name}
                    {isOverdue(loan) && <Badge variant="destructive">Overdue</Badge>}
                  </p>
                  <p className="text-sm text-slate-400">
                    ₹{formatINR(loan.emi)} due on{" "}
                    {new Date(loan.nextPaymentDue).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setDismissed((prev) => [...prev, loan.id])}>
                    <BellOff className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                  <Button size="sm" variant="gradient" asChild>
                    <Link href="/dashboard">Pay Now</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from "recharts"
import {
  Wallet,
  TrendingUp,
  CreditCard,
  CalendarIcon,
  Bell,
  AlertCircle,
  PlusCircle,
  Trash2,
  IndianRupee,
  Loader2,
  Calculator,
  PersonStanding,
  BarChart3,
  MessageSquare,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Calendar } from "@/components/ui/calendar"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { PayEMIDialog } from "./PayEMIDialog"
import { ExportStatementButton } from "./ExportStatementButton"
import { AddLoanDialog } from "./AddLoanDialog"

interface UserLoan {
  id: string
  name: string
  type: string
  principal: number
  interestRate: number
  termMonths: number
  emi: number
  outstandingBalance: number
  totalInterestPaid: number
  nextPaymentDue: string
  notificationsEnabled: boolean
}

interface PaymentHistoryPoint {
  month: string
  amount: number
}

const formatINR = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })

const isLoanOverdue = (loan: UserLoan) =>
  loan.outstandingBalance > 0 && new Date(loan.nextPaymentDue).getTime() < Date.now()

export function UserDashboard() {
  const { toast } = useToast()
  const { user } = useAuth()
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loans, setLoans] = useState<UserLoan[]>([])
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistoryPoint[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState("")
  const [addLoanOpen, setAddLoanOpen] = useState(false)

  const loadData = useCallback(async () => {
    setLoadError("")
    try {
      const [loansRes, paymentsRes] = await Promise.all([fetch("/api/loans"), fetch("/api/payments")])
      if (!loansRes.ok || !paymentsRes.ok) {
        throw new Error("Failed to load dashboard data")
      }
      const [loansData, paymentsData] = await Promise.all([loansRes.json(), paymentsRes.json()])
      setLoans(loansData.loans)
      setPaymentHistory(paymentsData.history)
    } catch {
      setLoadError("Could not load your dashboard. Please check your connection and try again.")
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getDueDates = (date: Date): UserLoan[] =>
    loans.filter((loan) => {
      const due = new Date(loan.nextPaymentDue)
      return (
        due.getDate() === date.getDate() &&
        due.getMonth() === date.getMonth() &&
        due.getFullYear() === date.getFullYear()
      )
    })

  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0)
  const totalInterestPaid = loans.reduce((sum, loan) => sum + loan.totalInterestPaid, 0)
  const activeLoans = loans.filter((loan) => loan.outstandingBalance > 0)
  const hasOverdue = loans.some(isLoanOverdue)

  const handlePaid = async (loanId: string, updatedLoan: UserLoan, payment: { amount: number }) => {
    setLoans((prev) => prev.map((l) => (l.id === loanId ? updatedLoan : l)))
    const paymentsRes = await fetch("/api/payments")
    if (paymentsRes.ok) {
      const paymentsData = await paymentsRes.json()
      setPaymentHistory(paymentsData.history)
    }
    toast({
      title: "Payment recorded",
      description: `₹${formatINR(payment.amount)} paid on ${loans.find((l) => l.id === loanId)?.name ?? "loan"}.`,
    })
  }

  const handleDeleteLoan = async (loan: UserLoan) => {
    try {
      const res = await fetch(`/api/loans/${loan.id}`, { method: "DELETE" })
      if (!res.ok) {
        toast({ title: "Delete failed", description: "Please try again.", variant: "destructive" })
        return
      }
      setLoans((prev) => prev.filter((l) => l.id !== loan.id))
      toast({ title: "Loan removed", description: `${loan.name} is no longer tracked.` })
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "destructive" })
    }
  }

  const toggleNotifications = async (loan: UserLoan) => {
    const next = !loan.notificationsEnabled
    setLoans((prev) => prev.map((l) => (l.id === loan.id ? { ...l, notificationsEnabled: next } : l)))
    const res = await fetch(`/api/loans/${loan.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notificationsEnabled: next }),
    })
    if (!res.ok) {
      setLoans((prev) => prev.map((l) => (l.id === loan.id ? { ...l, notificationsEnabled: !next } : l)))
      toast({ title: "Could not update notifications", variant: "destructive" })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-slate-400" role="status" aria-live="polite">
        <Loader2 className="h-8 w-8 animate-spin mb-4" />
        <p>Loading your loan portfolio…</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <Alert variant="destructive" className="my-8">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription className="flex items-center gap-4">
          {loadError}
          <Button size="sm" variant="outline" onClick={() => { setIsLoading(true); loadData() }}>
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <AddLoanDialog
        open={addLoanOpen}
        onOpenChange={setAddLoanOpen}
        onAdded={(loan) => setLoans((prev) => [...prev, loan as UserLoan])}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {[
            { icon: Calculator, label: "Compare", tab: "compare" },
            { icon: PersonStanding, label: "Recommendations", tab: "recommendations" },
            { icon: BarChart3, label: "Simulator", tab: "simulator" },
            { icon: MessageSquare, label: "AI Chat", tab: "chat" },
          ].map(({ icon: Icon, label, tab }) => (
            <Link
              key={tab}
              href={`/tools?tab=${tab}`}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-1.5 text-sm font-medium text-slate-300 hover:text-white hover:border-purple-600/50 hover:bg-slate-800 transition-colors"
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </Link>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="gradient" onClick={() => setAddLoanOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
            Add Loan
          </Button>
          {loans.length > 0 && <ExportStatementButton loans={loans} userName={user?.name ?? "FinShastra user"} />}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <Wallet className="h-4 w-4 text-blue-100" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{formatINR(totalOutstanding)}</div>
            <p className="text-xs text-blue-100">Across all loans</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interest Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-100" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{formatINR(totalInterestPaid)}</div>
            <p className="text-xs text-green-100">Lifetime interest payments</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-100" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeLoans.length}</div>
            <p className="text-xs text-purple-100">Currently active loans</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <CalendarIcon className="h-4 w-4 text-yellow-100" aria-hidden="true" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {activeLoans.length > 0
                ? new Date(
                    Math.min(...activeLoans.map((loan) => new Date(loan.nextPaymentDue).getTime())),
                  ).toLocaleDateString("en-IN", { day: "numeric", month: "short" })
                : "—"}
            </div>
            <p className="text-xs text-yellow-100">
              {activeLoans.length > 0 ? "Upcoming payment due" : "No active loans"}
            </p>
          </CardContent>
        </Card>
      </div>

      {hasOverdue && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Overdue Payments</AlertTitle>
          <AlertDescription>
            You have overdue payments on one or more loans. Please make the payments as soon as possible to avoid
            additional charges.
          </AlertDescription>
        </Alert>
      )}

      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Your Loans</CardTitle>
        </CardHeader>
        <CardContent>
          {loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <IndianRupee className="h-10 w-10 text-slate-600 mb-3" aria-hidden="true" />
              <p className="text-slate-300 font-medium">No loans yet</p>
              <p className="text-sm text-slate-500 mt-1 mb-4">
                Add your first loan to start tracking EMIs, payments, and progress.
              </p>
              <Button variant="gradient" onClick={() => setAddLoanOpen(true)}>
                <PlusCircle className="h-4 w-4 mr-2" aria-hidden="true" />
                Add Your First Loan
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {loans.map((loan) => {
                const paidPrincipal = Math.max(0, loan.principal - loan.outstandingBalance)
                const progress = loan.principal > 0 ? (paidPrincipal / loan.principal) * 100 : 0
                return (
                  <div key={loan.id} className="rounded-xl border border-slate-800 bg-slate-950/40 p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <div className="space-y-1 flex-1">
                        <div className="text-sm font-medium leading-none text-white">
                          {loan.name}
                          <Badge variant="outline" className="ml-2 text-slate-400 border-slate-600">
                            {loan.type}
                          </Badge>
                          {isLoanOverdue(loan) && (
                            <Badge variant="destructive" className="ml-2">
                              Overdue
                            </Badge>
                          )}
                          {loan.outstandingBalance === 0 && (
                            <Badge className="ml-2 bg-green-600 hover:bg-green-600">Paid off</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">
                          EMI ₹{formatINR(loan.emi)} · Next payment:{" "}
                          {new Date(loan.nextPaymentDue).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <div className="flex items-center justify-between sm:justify-end gap-2 flex-wrap">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div className="font-medium cursor-help mr-2 text-white">
                                ₹{formatINR(loan.outstandingBalance)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Outstanding balance</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <div className="flex items-center gap-2">
                          <Switch
                            id={`notifications-${loan.id}`}
                            checked={loan.notificationsEnabled}
                            onCheckedChange={() => toggleNotifications(loan)}
                            aria-label={`Toggle EMI reminders for ${loan.name}`}
                          />
                          <Label htmlFor={`notifications-${loan.id}`}>
                            <Bell className="h-4 w-4 text-slate-400" aria-hidden="true" />
                          </Label>
                          <PayEMIDialog
                            loanId={loan.id}
                            loanName={loan.name}
                            emi={loan.emi}
                            disabled={loan.outstandingBalance === 0}
                            onPaid={(updatedLoan, payment) => handlePaid(loan.id, updatedLoan as UserLoan, payment)}
                          />
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline" aria-label={`Delete ${loan.name}`}>
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete {loan.name}?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This removes the loan and its payment history permanently. This cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDeleteLoan(loan)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <div className="flex justify-between text-xs text-slate-500">
                        <span>Repaid</span>
                        <span>{progress.toFixed(0)}%</span>
                      </div>
                      <Progress
                        value={progress}
                        className="h-1.5"
                        aria-label={`${loan.name} repayment progress: ${progress.toFixed(0)}%`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {loans.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Payment History</CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory.every((p) => p.amount === 0) ? (
                <div className="flex flex-col items-center justify-center h-[280px] text-center">
                  <TrendingUp className="h-10 w-10 text-slate-600 mb-3" aria-hidden="true" />
                  <p className="text-slate-300 font-medium">No payments recorded yet</p>
                  <p className="text-sm text-slate-500 mt-1">Use "Pay EMI" on a loan to log your first payment.</p>
                </div>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={paymentHistory}>
                      <defs>
                        <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                          <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" />
                      <YAxis />
                      <CartesianGrid strokeDasharray="3 3" />
                      <RechartsTooltip formatter={(value: number) => [`₹${formatINR(value)}`, "Paid"]} />
                      <Area type="monotone" dataKey="amount" stroke="#8884d8" fillOpacity={1} fill="url(#colorAmount)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Loan Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={activeLoans}
                      dataKey="outstandingBalance"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius="80%"
                      fill="#8884d8"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {activeLoans.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => [`₹${formatINR(value)}`, "Outstanding"]} />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loans.length > 0 && (
        <Collapsible>
          <Card className="bg-slate-900/50 border-slate-700">
            <CollapsibleTrigger asChild>
              <button type="button" className="group w-full flex flex-row items-center justify-between space-y-0 p-6 text-left">
                <span className="text-2xl font-semibold leading-none tracking-tight text-white">Repayment Calendar</span>
                <ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent>
                <div className="flex flex-col space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border mx-auto"
                  />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">
                      Payments due on {selectedDate?.toLocaleDateString("en-IN")}
                    </h3>
                    {getDueDates(selectedDate || new Date()).map((loan) => (
                      <div key={loan.id} className="mb-2 flex justify-between items-center text-white">
                        <span>{loan.name}</span>
                        <span className="font-medium">₹{formatINR(loan.emi)}</span>
                      </div>
                    ))}
                    {getDueDates(selectedDate || new Date()).length === 0 && (
                      <p className="text-slate-400">No payments due on this date.</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}
    </div>
  )
}

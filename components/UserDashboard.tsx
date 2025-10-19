"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertCircle, CalendarIcon, TrendingUp, Bell, CreditCard, Wallet } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  PieChart as RePieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface UserLoan {
  id: string
  name: string
  outstandingBalance: number
  nextPaymentDue: Date
  totalInterestPaid: number
  isOverdue: boolean
  emi: number
  notificationsEnabled: boolean
}

const mockUserLoans: UserLoan[] = [
  {
    id: "1",
    name: "Home Loan",
    outstandingBalance: 200000,
    nextPaymentDue: new Date(2023, 5, 15),
    totalInterestPaid: 15000,
    isOverdue: false,
    emi: 1500,
    notificationsEnabled: true,
  },
  {
    id: "2",
    name: "Car Loan",
    outstandingBalance: 15000,
    nextPaymentDue: new Date(2023, 5, 1),
    totalInterestPaid: 2000,
    isOverdue: true,
    emi: 500,
    notificationsEnabled: false,
  },
  {
    id: "3",
    name: "Personal Loan",
    outstandingBalance: 5000,
    nextPaymentDue: new Date(2023, 5, 30),
    totalInterestPaid: 500,
    isOverdue: false,
    emi: 200,
    notificationsEnabled: true,
  },
]

const mockPaymentHistory = [
  { month: "Jan", amount: 2000 },
  { month: "Feb", amount: 2200 },
  { month: "Mar", amount: 1800 },
  { month: "Apr", amount: 2400 },
  { month: "May", amount: 2100 },
  { month: "Jun", amount: 2300 },
]

interface BankLoanOffer {
  id: string
  bankName: string
  loanType: string
  interestRate: number
  maxAmount: number
  maxTenure: number
  processingFee: number
  features: string[]
}

const mockBankLoanOffers: BankLoanOffer[] = [
  {
    id: "1",
    bankName: "ABC Bank",
    loanType: "Personal Loan",
    interestRate: 8.5,
    maxAmount: 500000,
    maxTenure: 60,
    processingFee: 1,
    features: ["No collateral required", "Flexible repayment options", "Quick approval"],
  },
  {
    id: "2",
    bankName: "XYZ Bank",
    loanType: "Home Loan",
    interestRate: 6.75,
    maxAmount: 5000000,
    maxTenure: 360,
    processingFee: 0.5,
    features: ["Low interest rates", "Long repayment tenure", "Property insurance included"],
  },
  {
    id: "3",
    bankName: "123 Financial",
    loanType: "Business Loan",
    interestRate: 10,
    maxAmount: 1000000,
    maxTenure: 84,
    processingFee: 2,
    features: ["No security required up to 30 lakhs", "Customized repayment options", "Dedicated relationship manager"],
  },
]

export function UserDashboard() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date())
  const [loans, setLoans] = useState<UserLoan[]>(mockUserLoans)
  const [newLoan, setNewLoan] = useState({
    name: "",
    outstandingBalance: 0,
    emi: 0,
    nextPaymentDue: new Date(),
  })
  const [isAddingLoan, setIsAddingLoan] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState<string | null>(null)

  const getDueDates = (date: Date): UserLoan[] => {
    return loans.filter(
      (loan) =>
        loan.nextPaymentDue.getDate() === date.getDate() &&
        loan.nextPaymentDue.getMonth() === date.getMonth() &&
        loan.nextPaymentDue.getFullYear() === date.getFullYear(),
    )
  }

  const totalOutstanding = loans.reduce((sum, loan) => sum + loan.outstandingBalance, 0)
  const totalInterestPaid = loans.reduce((sum, loan) => sum + loan.totalInterestPaid, 0)

  const handleAddLoan = (e: React.FormEvent) => {
    e.preventDefault()
    const newLoanWithId: UserLoan = {
      ...newLoan,
      id: (loans.length + 1).toString(),
      totalInterestPaid: 0,
      isOverdue: false,
      notificationsEnabled: true,
    }
    setLoans([...loans, newLoanWithId])
    setNewLoan({ name: "", outstandingBalance: 0, emi: 0, nextPaymentDue: new Date() })
    setIsAddingLoan(false)
  }

  const handleLoanAction = (loanId: string, action: string) => {
    setSelectedLoan(loanId)
    // Implement actions like view details, edit, delete, etc.
    console.log(`${action} loan with id: ${loanId}`)
  }

  const toggleNotifications = (loanId: string) => {
    setLoans(
      loans.map((loan) => (loan.id === loanId ? { ...loan, notificationsEnabled: !loan.notificationsEnabled } : loan)),
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Outstanding</CardTitle>
            <Wallet className="h-4 w-4 text-blue-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalOutstanding.toFixed(2)}</div>
            <p className="text-xs text-blue-100">Across all loans</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Interest Paid</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalInterestPaid.toFixed(2)}</div>
            <p className="text-xs text-green-100">Lifetime interest payments</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Loans</CardTitle>
            <CreditCard className="h-4 w-4 text-purple-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loans.length}</div>
            <p className="text-xs text-purple-100">Currently active loans</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Payment</CardTitle>
            <CalendarIcon className="h-4 w-4 text-yellow-100" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Date(Math.min(...loans.map((loan) => loan.nextPaymentDue.getTime()))).toLocaleDateString()}
            </div>
            <p className="text-xs text-yellow-100">Upcoming payment due</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Loan Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {loans.map((loan) => (
                <div key={loan.id} className="flex flex-col sm:flex-row sm:items-center">
                  <div className="space-y-1 flex-1">
                    <div className="text-sm font-medium leading-none">
                      {loan.name}
                      {loan.isOverdue && (
                        <Badge variant="destructive" className="ml-2">
                          Overdue
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-400">
                      Next payment: {loan.nextPaymentDue.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end mt-2 sm:mt-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="font-medium cursor-help mr-4 text-white">${loan.outstandingBalance.toFixed(2)}</div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Outstanding balance</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex items-center space-x-2">
                      <Switch
                        id={`notifications-${loan.id}`}
                        checked={loan.notificationsEnabled}
                        onCheckedChange={() => toggleNotifications(loan.id)}
                      />
                      <Label htmlFor={`notifications-${loan.id}`}>
                        <Bell className="h-4 w-4" />
                      </Label>
                      <Button size="sm" onClick={() => handleLoanAction(loan.id, "view")}>
                        View
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleLoanAction(loan.id, "edit")}>
                        Edit
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Payment History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockPaymentHistory}>
                  <defs>
                    <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="month" />
                  <YAxis />
                  <CartesianGrid strokeDasharray="3 3" />
                  <RechartsTooltip />
                  <Area type="monotone" dataKey="amount" stroke="#8884d8" fillOpacity={1} fill="url(#colorAmount)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-slate-900/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Loan Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="add-loan" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-slate-800">
              <TabsTrigger value="add-loan" className="data-[state=active]:bg-slate-700">Add New Loan</TabsTrigger>
              <TabsTrigger value="repayment-schedule" className="data-[state=active]:bg-slate-700">Repayment Schedule</TabsTrigger>
            </TabsList>
            <TabsContent value="add-loan">
              {isAddingLoan && (
                <form onSubmit={handleAddLoan} className="space-y-4 mt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="loanName">Loan Name</Label>
                      <Input
                        id="loanName"
                        value={newLoan.name}
                        onChange={(e) => setNewLoan({ ...newLoan, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="outstandingBalance">Outstanding Balance</Label>
                      <Input
                        id="outstandingBalance"
                        type="number"
                        value={newLoan.outstandingBalance}
                        onChange={(e) => setNewLoan({ ...newLoan, outstandingBalance: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="emi">EMI</Label>
                      <Input
                        id="emi"
                        type="number"
                        value={newLoan.emi}
                        onChange={(e) => setNewLoan({ ...newLoan, emi: Number(e.target.value) })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="nextPaymentDue">Next Payment Due</Label>
                      <Input
                        id="nextPaymentDue"
                        type="date"
                        value={newLoan.nextPaymentDue.toISOString().split("T")[0]}
                        onChange={(e) => setNewLoan({ ...newLoan, nextPaymentDue: new Date(e.target.value) })}
                        required
                      />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">
                    Save Loan
                  </Button>
                </form>
              )}
            </TabsContent>
            <TabsContent value="repayment-schedule">
              <div className="mt-4 space-y-4">
                <div className="flex flex-col space-y-4">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border mx-auto"
                  />
                  <div>
                    <h3 className="text-lg font-semibold mb-2 text-white">Payments due on {selectedDate?.toLocaleDateString()}</h3>
                    {getDueDates(selectedDate || new Date()).map((loan) => (
                      <div key={loan.id} className="mb-2 flex justify-between items-center text-white">
                        <span>{loan.name}</span>
                        <span className="font-medium">${loan.emi.toFixed(2)}</span>
                      </div>
                    ))}
                    {getDueDates(selectedDate || new Date()).length === 0 && (
                      <p className="text-slate-400">No payments due on this date.</p>
                    )}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Loan Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RePieChart>
                  <Pie
                    data={loans}
                    dataKey="outstandingBalance"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="80%"
                    fill="#8884d8"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {loans.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={`hsl(${index * 45}, 70%, 60%)`} />
                    ))}
                  </Pie>
                </RePieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Loan Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-8">
              {loans.map((loan) => {
                const totalLoanAmount = loan.outstandingBalance + loan.totalInterestPaid
                const progress = (loan.totalInterestPaid / totalLoanAmount) * 100
                return (
                  <div key={loan.id} className="space-y-2">
                    <div className="flex justify-between text-sm text-white">
                      <span>{loan.name}</span>
                      <span>{progress.toFixed(0)}% paid</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {loans.some((loan) => loan.isOverdue) && (
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
          <CardTitle className="text-white">Bank Loan Offers</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bank</TableHead>
                <TableHead>Loan Type</TableHead>
                <TableHead>Interest Rate</TableHead>
                <TableHead>Max Amount</TableHead>
                <TableHead>Max Tenure</TableHead>
                <TableHead>Processing Fee</TableHead>
                <TableHead>Features</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBankLoanOffers.map((offer) => (
                <TableRow key={offer.id} className="text-slate-300">
                  <TableCell className="text-white font-medium">{offer.bankName}</TableCell>
                  <TableCell>{offer.loanType}</TableCell>
                  <TableCell>{offer.interestRate}%</TableCell>
                  <TableCell>${offer.maxAmount.toLocaleString()}</TableCell>
                  <TableCell>{offer.maxTenure} months</TableCell>
                  <TableCell>{offer.processingFee}%</TableCell>
                  <TableCell>
                    <ul className="list-disc list-inside">
                      {offer.features.map((feature, index) => (
                        <li key={index} className="text-sm">
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}


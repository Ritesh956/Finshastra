import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import type { Loan } from "@/utils/mockData"
import { calculateEMI, calculateTotalRepayment } from "@/utils/loanCalculations"
import { Badge } from "@/components/ui/badge"
import { Check, TrendingDown, Calendar, DollarSign, Percent } from "lucide-react"

interface LoanCardProps {
  loan: Loan
  amount: number
}

export function LoanCard({ loan, amount }: LoanCardProps) {
  const emi = calculateEMI(amount, loan.interestRate, loan.tenure)
  const totalRepayment = calculateTotalRepayment(emi, loan.tenure)

  return (
    <Card className="group relative overflow-hidden w-full border-2 border-slate-700/50 hover:border-blue-500 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 bg-gradient-to-br from-slate-900 to-slate-800">
      {/* Gradient Overlay on Hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Animated Border Gradient */}
      <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500" />
      
      <CardHeader className="relative pb-4 border-b border-slate-700/50">
        <div className="flex justify-between items-start mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {loan.institution}
              </CardTitle>
              <p className="text-sm text-slate-400">Trusted Partner</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 px-4 py-1.5 text-sm font-semibold shadow-lg">
            {loan.type} Loan
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="relative pt-6 space-y-6">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="group/stat relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-950 to-blue-900/50 p-4 border border-blue-800/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
              <Percent className="w-5 h-5 text-blue-400" />
              <TrendingDown className="w-4 h-4 text-blue-500 opacity-50" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-blue-400">Interest Rate</span>
              <span className="text-3xl font-bold block bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                {loan.interestRate}%
              </span>
            </div>
          </div>

          <div className="group/stat relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-950 to-purple-900/50 p-4 border border-purple-800/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-purple-400">Tenure</span>
              <span className="text-3xl font-bold block bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                {loan.tenure}
              </span>
              <span className="text-xs text-slate-400">months</span>
            </div>
          </div>

          <div className="group/stat relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-950 to-green-900/50 p-4 border border-green-800/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
              <DollarSign className="w-5 h-5 text-green-400" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-green-400">Monthly EMI</span>
              <span className="text-2xl font-bold block bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                ₹{emi.toFixed(0)}
              </span>
            </div>
          </div>

          <div className="group/stat relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-950 to-orange-900/50 p-4 border border-orange-800/50 hover:shadow-lg transition-all duration-300">
            <div className="flex items-start justify-between mb-2">
              <TrendingDown className="w-5 h-5 text-orange-400" />
            </div>
            <div className="space-y-1">
              <span className="text-xs font-medium text-orange-400">Total Repayment</span>
              <span className="text-2xl font-bold block bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
                ₹{(totalRepayment / 100000).toFixed(1)}L
              </span>
            </div>
          </div>
        </div>

        {/* Processing Fee */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900/50 p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-400">Processing Fee</span>
            <span className="text-2xl font-bold bg-gradient-to-r from-slate-400 to-slate-200 bg-clip-text text-transparent">
              {loan.processingFee}%
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-3">
          <span className="text-sm font-semibold text-slate-400 flex items-center gap-2">
            <div className="w-1 h-4 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full" />
            Key Features
          </span>
          <ul className="space-y-2">
            {loan.features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3 text-sm group/feature">
                <div className="mt-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center flex-shrink-0 group-hover/feature:scale-110 transition-transform duration-300">
                  <Check className="w-3 h-3 text-white" />
                </div>
                <span className="text-slate-300 group-hover/feature:text-blue-400 transition-colors">
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}

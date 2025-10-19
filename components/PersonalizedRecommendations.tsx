"use client"

import { useState } from "react"
import { UserProfileSetup } from "./UserProfileSetup"
import { LoanCard } from "./LoanCard"
import { type UserProfile, mockLoans, type Loan } from "@/utils/mockData"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PersonStanding } from "lucide-react"

function getRecommendedLoans(profile: UserProfile): Loan[] {
  const { income, expenses, creditScore } = profile
  const monthlyDisposableIncome = income - expenses

  return mockLoans.filter((loan) => {
    const maxEMI = monthlyDisposableIncome * 0.4 // Assume max EMI is 40% of disposable income
    const emi =
      ((loan.interestRate / 12 / 100) * 10000 * Math.pow(1 + loan.interestRate / 12 / 100, loan.tenure)) /
      (Math.pow(1 + loan.interestRate / 12 / 100, loan.tenure) - 1)

    return (
      emi <= maxEMI &&
      ((creditScore >= 750 && loan.interestRate <= 10) ||
        (creditScore >= 650 && loan.interestRate <= 12) ||
        (creditScore >= 550 && loan.interestRate <= 15))
    )
  })
}

export function PersonalizedRecommendations() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [recommendedLoans, setRecommendedLoans] = useState<Loan[]>([])

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile)
    setRecommendedLoans(getRecommendedLoans(profile))
  }

  const handleApplyForLoan = (loanId: string) => {
    // Implement logic to apply for the selected loan
    console.log(`Applying for loan with id: ${loanId}`)
  }

  return (
    <div className="space-y-8">
      {!userProfile ? (
        <Card className="bg-transparent border-none shadow-none">
          <CardHeader className="border-b border-slate-700">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
                <PersonStanding className="w-6 h-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl text-white">Personalized Recommendations</CardTitle>
                <CardDescription className="text-slate-400">
                  Get AI-powered loan recommendations tailored for you
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <UserProfileSetup onProfileSubmit={handleProfileSubmit} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-2xl text-white">Your Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-slate-400">Monthly Income</dt>
                  <dd className="text-2xl font-semibold text-white">${userProfile.income.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-400">Monthly Expenses</dt>
                  <dd className="text-2xl font-semibold text-white">${userProfile.expenses.toLocaleString()}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-400">Credit Score</dt>
                  <dd className="text-2xl font-semibold text-white">{userProfile.creditScore}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-white">Personalized Loan Recommendations</h2>
            <p className="text-lg text-slate-300">Based on your profile, here are some recommended loans:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendedLoans.map((loan) => (
                <div key={loan.id}>
                  <LoanCard loan={loan} amount={10000} />
                  <Button className="w-full mt-3 h-11 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700" onClick={() => handleApplyForLoan(loan.id)}>
                    Apply for Loan
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
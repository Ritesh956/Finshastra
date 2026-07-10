"use client"

import { useEffect, useState } from "react"
import { UserProfileSetup } from "./UserProfileSetup"
import { LoanCard } from "./LoanCard"
import { type UserProfile, type Loan } from "@/utils/mockData"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PersonStanding } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"
import { calculateEMI } from "@/utils/loanCalculations"

interface BankOffer {
  id: string
  bankName: string
  loanType: string
  interestRate: number
  maxAmount: number
  maxTenure: number
  processingFee: number
  features: string[]
}

const REFERENCE_AMOUNT = 500000

function offerToLoan(offer: BankOffer): Loan {
  return {
    id: offer.id,
    type: offer.loanType,
    institution: offer.bankName,
    interestRate: offer.interestRate,
    tenure: offer.maxTenure,
    features: offer.features,
    processingFee: offer.processingFee,
  }
}

function getRecommendedOffers(profile: UserProfile, offers: BankOffer[]): BankOffer[] {
  const { income, expenses, creditScore } = profile
  const monthlyDisposableIncome = income - expenses
  const maxEMI = monthlyDisposableIncome * 0.4 // max EMI at 40% of disposable income

  return offers.filter((offer) => {
    const emi = calculateEMI(REFERENCE_AMOUNT, offer.interestRate, Math.min(offer.maxTenure, 60))
    return (
      emi <= maxEMI &&
      ((creditScore >= 750 && offer.interestRate <= 10) ||
        (creditScore >= 650 && offer.interestRate <= 12) ||
        (creditScore >= 550 && offer.interestRate <= 15))
    )
  })
}

export function PersonalizedRecommendations() {
  const { isAuthenticated, user, updateProfile } = useAuth()
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [offers, setOffers] = useState<BankOffer[]>([])
  const [recommended, setRecommended] = useState<BankOffer[]>([])

  useEffect(() => {
    fetch("/api/bank-offers")
      .then((res) => (res.ok ? res.json() : { offers: [] }))
      .then((data) => setOffers(data.offers))
      .catch(() => setOffers([]))
  }, [])

  // Prefill from the saved profile of a logged-in user
  useEffect(() => {
    if (
      !userProfile &&
      user &&
      user.income != null &&
      user.expenses != null &&
      user.creditScore != null
    ) {
      setUserProfile({ income: user.income, expenses: user.expenses, creditScore: user.creditScore })
    }
  }, [user, userProfile])

  useEffect(() => {
    if (userProfile && offers.length > 0) {
      setRecommended(getRecommendedOffers(userProfile, offers))
    }
  }, [userProfile, offers])

  const handleProfileSubmit = (profile: UserProfile) => {
    setUserProfile(profile)
    if (isAuthenticated) {
      // Persist so the dashboard and AI assistant can use it
      updateProfile({ income: profile.income, expenses: profile.expenses, creditScore: profile.creditScore })
    }
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
                  Loan offers matched to your income, expenses, and credit score
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
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl text-white">Your Profile</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setUserProfile(null)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Edit Profile
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <dt className="text-sm font-medium text-slate-400">Monthly Income</dt>
                  <dd className="text-2xl font-semibold text-white">₹{userProfile.income.toLocaleString("en-IN")}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-slate-400">Monthly Expenses</dt>
                  <dd className="text-2xl font-semibold text-white">₹{userProfile.expenses.toLocaleString("en-IN")}</dd>
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
            {recommended.length === 0 ? (
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="py-10 text-center">
                  <p className="text-slate-300 font-medium">No offers match your current profile</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Improving your credit score or reducing expenses will unlock more options.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <p className="text-lg text-slate-300">
                  Based on your profile, these bank offers fit within 40% of your disposable income:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recommended.map((offer) => (
                    <div key={offer.id}>
                      <LoanCard loan={offerToLoan(offer)} amount={REFERENCE_AMOUNT} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

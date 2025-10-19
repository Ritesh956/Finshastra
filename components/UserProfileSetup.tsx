"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import type { UserProfile } from "@/utils/mockData"

interface UserProfileSetupProps {
  onProfileSubmit: (profile: UserProfile) => void
}

export function UserProfileSetup({ onProfileSubmit }: UserProfileSetupProps) {
  const [income, setIncome] = useState("")
  const [expenses, setExpenses] = useState("")
  const [creditScore, setCreditScore] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onProfileSubmit({ 
      income: Number(income) || 0, 
      expenses: Number(expenses) || 0, 
      creditScore: Number(creditScore) || 0 
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="income" className="text-base font-semibold dark:text-white">Monthly Income</Label>
          <Input
            id="income"
            type="number"
            placeholder="Enter your monthly income (e.g., 50000)"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="text-base h-12 dark:bg-slate-800/50 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400"
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expenses" className="text-base font-semibold dark:text-white">Monthly Expenses</Label>
          <Input
            id="expenses"
            type="number"
            placeholder="Enter your monthly expenses (e.g., 30000)"
            value={expenses}
            onChange={(e) => setExpenses(e.target.value)}
            className="text-base h-12 dark:bg-slate-800/50 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400"
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="creditScore" className="text-base font-semibold dark:text-white">Credit Score</Label>
        <Input
          id="creditScore"
          type="number"
          placeholder="Enter your credit score (300-850)"
          value={creditScore}
          onChange={(e) => setCreditScore(e.target.value)}
          className="text-base h-12 dark:bg-slate-800/50 dark:border-slate-600 dark:text-white dark:placeholder:text-slate-400"
          required
          min="300"
          max="850"
        />
      </div>
      <Button type="submit" className="w-full h-12 text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
        Submit Profile
      </Button>
    </form>
  )
}


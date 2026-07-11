"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { LoanCard } from "./LoanCard"
import type { Loan } from "@/utils/mockData"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calculator } from "lucide-react"

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

export function LoanComparisonTool() {
  const [offers, setOffers] = useState<BankOffer[]>([])
  const [amount, setAmount] = useState(500000)
  const [loanType, setLoanType] = useState("All")
  const [tenure, setTenure] = useState(60)
  const [interestRange, setInterestRange] = useState([0, 20])
  const [selectedInstitutions, setSelectedInstitutions] = useState<string[]>([])
  const resultsRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/bank-offers")
      .then((res) => (res.ok ? res.json() : { offers: [] }))
      .then((data) => setOffers(data.offers))
      .catch(() => setOffers([]))
  }, [])

  const loanTypes = useMemo(() => ["All", ...Array.from(new Set(offers.map((o) => o.loanType)))], [offers])
  const institutions = useMemo(() => Array.from(new Set(offers.map((o) => o.bankName))), [offers])

  const filteredLoans: Loan[] = offers
    .filter(
      (offer) =>
        (loanType === "All" || offer.loanType === loanType) &&
        offer.interestRate >= interestRange[0] &&
        offer.interestRate <= interestRange[1] &&
        amount <= offer.maxAmount &&
        (selectedInstitutions.length === 0 || selectedInstitutions.includes(offer.bankName)),
    )
    .map((offer) => ({
      id: offer.id,
      type: offer.loanType.replace(/ Loan$/, ""),
      institution: offer.bankName,
      interestRate: offer.interestRate,
      // Compare EMIs over the user's chosen tenure, capped at the offer's max
      tenure: Math.min(tenure, offer.maxTenure),
      features: offer.features,
      processingFee: offer.processingFee,
    }))

  const handleCompare = () => {
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="space-y-8">
      <Card className="bg-transparent border-none shadow-none">
        <CardHeader className="border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
              <Calculator className="w-6 h-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl text-white">Loan Comparison Tool</CardTitle>
              <CardDescription className="text-slate-400">
                Compare and find the best loan options for you
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Loan Amount (₹)</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanType">Loan Type</Label>
              <Select value={loanType} onValueChange={setLoanType}>
                <SelectTrigger id="loanType">
                  <SelectValue placeholder="Select Loan Type" />
                </SelectTrigger>
                <SelectContent>
                  {loanTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="tenure">Tenure (months)</Label>
              <Input id="tenure" type="number" min={1} value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Interest Rate Range</Label>
              <Slider min={0} max={20} step={0.1} value={interestRange} onValueChange={setInterestRange} />
              <div className="flex justify-between text-sm text-slate-400">
                <span>{interestRange[0]}%</span>
                <span>{interestRange[1]}%</span>
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-2">
            <Label>Financial Institutions</Label>
            <div className="flex flex-wrap gap-2">
              {institutions.map((institution) => (
                <Button
                  key={institution}
                  variant={selectedInstitutions.includes(institution) ? "gradient" : "outline"}
                  size="sm"
                  onClick={() => {
                    setSelectedInstitutions((prev) =>
                      prev.includes(institution) ? prev.filter((i) => i !== institution) : [...prev, institution],
                    )
                  }}
                >
                  {institution}
                </Button>
              ))}
            </div>
          </div>
          <Button variant="gradient" className="w-full mt-4 h-12 text-base font-semibold" onClick={handleCompare}>
            Compare Loans
          </Button>
        </CardContent>
      </Card>
      <div ref={resultsRef} className="space-y-4 scroll-mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Matching Loans</h2>
          <p className="text-sm text-slate-400">{filteredLoans.length} loans found</p>
        </div>
        {filteredLoans.length === 0 ? (
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="py-10 text-center">
              <p className="text-slate-300 font-medium">No loans match your criteria</p>
              <p className="text-sm text-slate-500 mt-1">
                Try a smaller loan amount, a wider interest range, or a different loan type.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLoans.map((loan) => (
              <LoanCard key={loan.id} loan={loan} amount={amount} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "@/components/ui/use-toast"
import { calculateEMI, calculateTotalRepayment } from "@/utils/loanCalculations"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { ArrowRight, Info, AlertTriangle, BarChart3 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"

interface SimulationResult {
  currentEMI: number
  newEMI: number
  currentTotalInterest: number
  newTotalInterest: number
  currentSchedule: { month: number; balance: number; interest: number; principal: number }[]
  newSchedule: { month: number; balance: number; interest: number; principal: number }[]
}

export function RepaymentPlanSimulator() {
  const router = useRouter()
  const [loanAmount, setLoanAmount] = useState(100000)
  const [interestRate, setInterestRate] = useState(5)
  const [currentTenure, setCurrentTenure] = useState(60)
  const [newTenure, setNewTenure] = useState(60)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [loanType, setLoanType] = useState("personal")
  const [includeInsurance, setIncludeInsurance] = useState(false)
  const [insuranceRate, setInsuranceRate] = useState(0.5)
  const [prepaymentAmount, setPrepaymentAmount] = useState("")
  const [simulationProgress, setSimulationProgress] = useState(0)

  useEffect(() => {
    // Reset simulation result when inputs change
    setSimulationResult(null)
  }, [loanAmount, interestRate, currentTenure, newTenure, loanType, includeInsurance, insuranceRate, prepaymentAmount])

  const simulateRepayment = async () => {
    setIsLoading(true)
    setError(null)
    setSimulationProgress(0)

    try {
      // Simulate API call or complex calculation
      await new Promise((resolve) => {
        let progress = 0
        const interval = setInterval(() => {
          progress += 10
          setSimulationProgress(progress)
          if (progress >= 100) {
            clearInterval(interval)
            resolve(null)
          }
        }, 200)
      })

      const prepaymentValue = Number(prepaymentAmount) || 0
      const effectiveRate = includeInsurance ? interestRate + insuranceRate : interestRate
      const currentEMI = calculateEMI(loanAmount, effectiveRate, currentTenure)
      const newEMI = calculateEMI(loanAmount - prepaymentValue, effectiveRate, newTenure)
      const currentTotalRepayment = calculateTotalRepayment(currentEMI, currentTenure)
      const newTotalRepayment = calculateTotalRepayment(newEMI, newTenure) + prepaymentValue

      const currentSchedule = generateRepaymentSchedule(loanAmount, effectiveRate, currentTenure)
      const newSchedule = generateRepaymentSchedule(loanAmount - prepaymentValue, effectiveRate, newTenure)

      setSimulationResult({
        currentEMI,
        newEMI,
        currentTotalInterest: currentTotalRepayment - loanAmount,
        newTotalInterest: newTotalRepayment - loanAmount + prepaymentValue,
        currentSchedule,
        newSchedule,
      })

      toast({
        title: "Simulation Complete",
        description: "Your repayment plan has been simulated successfully.",
      })
    } catch (err) {
      setError("An error occurred while simulating the repayment plan. Please try again.")
      toast({
        title: "Simulation Error",
        description: "Failed to simulate repayment plan. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setSimulationProgress(100)
    }
  }

  const handleApplyChanges = () => {
    // Implement logic to apply the new repayment plan
    console.log("Applying new repayment plan")
    toast({
      title: "Changes Applied",
      description: "Your new repayment plan has been applied successfully.",
    })
    // Redirect to a confirmation page
    router.push("/repayment-confirmation")
  }

  const generateRepaymentSchedule = (principal: number, rate: number, tenure: number) => {
    const monthlyRate = rate / 12 / 100
    const emi = calculateEMI(principal, rate, tenure)
    let balance = principal
    const schedule = []

    for (let month = 0; month <= tenure; month++) {
      const interest = balance * monthlyRate
      const principalPaid = emi - interest
      balance = Math.max(0, balance - principalPaid)
      schedule.push({ month, balance, interest, principal: principalPaid })
    }

    return schedule
  }

  const handleLoanTypeChange = (value: string) => {
    setLoanType(value)
    // Adjust interest rate based on loan type
    switch (value) {
      case "personal":
        setInterestRate(10)
        break
      case "home":
        setInterestRate(6.5)
        break
      case "car":
        setInterestRate(7.5)
        break
      default:
        setInterestRate(5)
    }
  }

  return (
    <Card className="w-full bg-transparent border-none shadow-none">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">Repayment Plan Simulator</CardTitle>
            <CardDescription className="text-slate-400">Optimize your loan repayment strategy</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="loanType">Loan Type</Label>
            <Select value={loanType} onValueChange={handleLoanTypeChange}>
              <SelectTrigger id="loanType">
                <SelectValue placeholder="Select Loan Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="personal">Personal Loan</SelectItem>
                <SelectItem value="home">Home Loan</SelectItem>
                <SelectItem value="car">Car Loan</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="loanAmount">Loan Amount</Label>
            <Input
              id="loanAmount"
              type="number"
              value={loanAmount}
              onChange={(e) => setLoanAmount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="interestRate">Interest Rate (%)</Label>
            <Input
              id="interestRate"
              type="number"
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              step="0.1"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currentTenure">Current Tenure (months)</Label>
            <Input
              id="currentTenure"
              type="number"
              value={currentTenure}
              onChange={(e) => setCurrentTenure(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="prepaymentAmount">Prepayment Amount</Label>
            <Input
              id="prepaymentAmount"
              type="number"
              placeholder="Enter prepayment amount"
              value={prepaymentAmount}
              onChange={(e) => setPrepaymentAmount(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="includeInsurance" className="flex items-center space-x-2">
              <span>Include Loan Insurance</span>
              <Dialog>
                <DialogTrigger>
                  <Info className="h-4 w-4 text-slate-400" />
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Loan Insurance</DialogTitle>
                    <DialogDescription>
                      Loan insurance protects you in case of unforeseen circumstances. It may increase your EMI but
                      provides additional security.
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </Label>
            <Switch id="includeInsurance" checked={includeInsurance} onCheckedChange={setIncludeInsurance} />
          </div>
        </div>
        {includeInsurance && (
          <div className="space-y-2">
            <Label htmlFor="insuranceRate">Insurance Rate (%)</Label>
            <Input
              id="insuranceRate"
              type="number"
              value={insuranceRate}
              onChange={(e) => setInsuranceRate(Number(e.target.value))}
              step="0.1"
            />
          </div>
        )}
        <div className="space-y-2">
          <Label>New Tenure: {newTenure} months</Label>
          <Slider min={12} max={360} step={12} value={[newTenure]} onValueChange={(value) => setNewTenure(value[0])} />
        </div>
        <Button onClick={simulateRepayment} className="w-full" disabled={isLoading}>
          {isLoading ? "Simulating..." : "Simulate Repayment"}
        </Button>

        {isLoading && (
          <div className="space-y-2">
            <Progress value={simulationProgress} className="w-full" />
            <p className="text-center text-sm text-slate-400">Simulating repayment plan...</p>
          </div>
        )}
        {error && (
          <div className="flex items-center space-x-2 text-red-500">
            <AlertTriangle className="h-4 w-4" />
            <p>{error}</p>
          </div>
        )}
        {simulationResult && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">Current Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>EMI:</span>
                      <span className="font-medium">${simulationResult.currentEMI.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-medium">${simulationResult.currentTotalInterest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tenure:</span>
                      <span className="font-medium">{currentTenure} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Payment:</span>
                      <span className="font-medium">
                        ${(simulationResult.currentTotalInterest + loanAmount).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white">New Plan</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>EMI:</span>
                      <span className="font-medium">${simulationResult.newEMI.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Interest:</span>
                      <span className="font-medium">${simulationResult.newTotalInterest.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tenure:</span>
                      <span className="font-medium">{newTenure} months</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Payment:</span>
                      <span className="font-medium">
                        ${(simulationResult.newTotalInterest + loanAmount - (Number(prepaymentAmount) || 0)).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-green-600">
                      <span>Savings:</span>
                      <span className="font-medium">
                        $
                        {(
                          simulationResult.currentTotalInterest +
                          loanAmount -
                          (simulationResult.newTotalInterest + loanAmount - (Number(prepaymentAmount) || 0))
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Repayment Schedule Comparison</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart
                    data={simulationResult.currentSchedule.map((current, index) => ({
                      month: current.month,
                      currentBalance: current.balance,
                      newBalance: simulationResult.newSchedule[index]?.balance || 0,
                    }))}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="currentBalance" stroke="#8884d8" name="Current Plan" />
                    <Line type="monotone" dataKey="newBalance" stroke="#82ca9d" name="New Plan" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            <div className="flex items-center justify-center space-x-4">
              <div className="text-center">
                <p className="text-sm text-slate-400">Current EMI</p>
                <p className="text-2xl font-bold text-white">${simulationResult.currentEMI.toFixed(2)}</p>
              </div>
              <ArrowRight className="w-6 h-6 text-slate-400" />
              <div className="text-center">
                <p className="text-sm text-slate-400">New EMI</p>
                <p className="text-2xl font-bold text-white">${simulationResult.newEMI.toFixed(2)}</p>
              </div>
            </div>
            <Button className="w-full mt-4" onClick={handleApplyChanges}>
              Apply New Repayment Plan
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}


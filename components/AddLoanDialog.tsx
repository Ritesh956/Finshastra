"use client"

import { useState } from "react"
import { Loader2, PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { calculateEMI } from "@/utils/loanCalculations"

const LOAN_TYPES = ["Personal", "Home", "Auto", "Education", "Business", "Gold", "Other"]

const formatINR = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })

interface NewLoanForm {
  name: string
  type: string
  principal: string
  interestRate: string
  termMonths: string
  nextPaymentDue: string
}

const emptyForm = (): NewLoanForm => ({
  name: "",
  type: "Personal",
  principal: "",
  interestRate: "",
  termMonths: "",
  nextPaymentDue: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
})

interface AddLoanDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdded: (loan: unknown) => void
}

export function AddLoanDialog({ open, onOpenChange, onAdded }: AddLoanDialogProps) {
  const { toast } = useToast()
  const [form, setForm] = useState<NewLoanForm>(emptyForm())
  const [isSaving, setIsSaving] = useState(false)

  const parsedPrincipal = Number(form.principal)
  const parsedRate = Number(form.interestRate)
  const parsedTerm = Number(form.termMonths)
  const emiPreview =
    parsedPrincipal > 0 && parsedRate >= 0 && parsedTerm > 0
      ? parsedRate === 0
        ? Math.round((parsedPrincipal / parsedTerm) * 100) / 100
        : calculateEMI(parsedPrincipal, parsedRate, parsedTerm)
      : null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          principal: parsedPrincipal,
          interestRate: parsedRate,
          termMonths: parsedTerm,
          nextPaymentDue: form.nextPaymentDue,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast({ title: "Could not add loan", description: data.error, variant: "destructive" })
        return
      }
      onAdded(data.loan)
      toast({ title: "Loan added", description: `${data.loan.name} is now being tracked.` })
      setForm(emptyForm())
      onOpenChange(false)
    } catch {
      toast({ title: "Network error", description: "Please try again.", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) setForm(emptyForm())
        onOpenChange(next)
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5 text-purple-400" />
            Add a loan
          </DialogTitle>
          <DialogDescription>Track a new loan&apos;s EMIs, payments, and progress.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="loanName">Loan Name</Label>
              <Input
                id="loanName"
                placeholder="e.g. Home Loan — HDFC"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="loanType">Loan Type</Label>
              <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                <SelectTrigger id="loanType">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {LOAN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="principal">Loan Amount (₹)</Label>
              <Input
                id="principal"
                type="number"
                min="1"
                step="any"
                placeholder="500000"
                value={form.principal}
                onChange={(e) => setForm({ ...form, principal: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interestRate">Interest Rate (% p.a.)</Label>
              <Input
                id="interestRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                placeholder="8.5"
                value={form.interestRate}
                onChange={(e) => setForm({ ...form, interestRate: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="termMonths">Term (months)</Label>
              <Input
                id="termMonths"
                type="number"
                min="1"
                max="600"
                placeholder="60"
                value={form.termMonths}
                onChange={(e) => setForm({ ...form, termMonths: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextPaymentDue">First Payment Due</Label>
              <Input
                id="nextPaymentDue"
                type="date"
                value={form.nextPaymentDue}
                onChange={(e) => setForm({ ...form, nextPaymentDue: e.target.value })}
                required
              />
            </div>
          </div>
          {emiPreview !== null && (
            <p className="text-sm text-slate-400">
              Estimated EMI: <span className="text-white font-medium">₹{formatINR(emiPreview)}</span> / month
            </p>
          )}
          <DialogFooter>
            <Button type="submit" variant="gradient" className="w-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
                  Saving…
                </>
              ) : (
                "Save Loan"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

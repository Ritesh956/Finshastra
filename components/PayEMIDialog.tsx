"use client"

import { useState } from "react"
import { Loader2, ShieldCheck, CreditCard, CheckCircle2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void }
  }
}

interface PayEMIDialogProps {
  loanId: string
  loanName: string
  emi: number
  disabled?: boolean
  onPaid: (loan: unknown, payment: { amount: number }) => void
}

const formatINR = (value: number) => value.toLocaleString("en-IN", { maximumFractionDigits: 0 })

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

type Stage = "confirm" | "processing" | "success"

export function PayEMIDialog({ loanId, loanName, emi, disabled, onPaid }: PayEMIDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [stage, setStage] = useState<Stage>("confirm")
  const [isWorking, setIsWorking] = useState(false)
  const [mode, setMode] = useState<"razorpay" | "simulated" | null>(null)

  const reset = () => {
    setStage("confirm")
    setIsWorking(false)
    setMode(null)
  }

  const recordPayment = async (payload: Record<string, unknown>) => {
    const res = await fetch(`/api/loans/${loanId}/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || "Payment failed")
    return data
  }

  const finishSuccess = (data: { loan: unknown; payment: { amount: number } }) => {
    setStage("success")
    setIsWorking(false)
    onPaid(data.loan, data.payment)
  }

  const handlePay = async () => {
    setIsWorking(true)
    try {
      const orderRes = await fetch(`/api/loans/${loanId}/payments/order`, { method: "POST" })
      const order = await orderRes.json()
      if (!orderRes.ok) throw new Error(order.error || "Could not start payment")
      setMode(order.mode)

      if (order.mode === "razorpay") {
        const loaded = await loadRazorpayScript()
        if (!loaded || !window.Razorpay) throw new Error("Could not load the payment gateway")
        const rzp = new window.Razorpay({
          key: order.keyId,
          order_id: order.orderId,
          amount: Math.round(order.amount * 100),
          currency: order.currency,
          name: "FinShastra",
          description: `EMI — ${order.loanName}`,
          prefill: { name: order.userName, email: order.userEmail },
          theme: { color: "#7c3aed" },
          handler: async (response: {
            razorpay_order_id: string
            razorpay_payment_id: string
            razorpay_signature: string
          }) => {
            try {
              setStage("processing")
              const data = await recordPayment({
                method: "razorpay",
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              })
              finishSuccess(data)
            } catch (err) {
              toast({
                title: "Payment verification failed",
                description: err instanceof Error ? err.message : "Please try again.",
                variant: "destructive",
              })
              reset()
            }
          },
          modal: { ondismiss: () => setIsWorking(false) },
        })
        rzp.open()
      } else {
        // Simulated gateway: brief processing pause, then record the payment.
        setStage("processing")
        await new Promise((r) => setTimeout(r, 1200))
        const data = await recordPayment({ method: "simulated", orderId: order.orderId })
        finishSuccess(data)
      }
    } catch (err) {
      toast({
        title: "Payment failed",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      })
      reset()
    }
  }

  return (
    <>
      <Button size="sm" variant="gradient" disabled={disabled} onClick={() => { reset(); setOpen(true) }}>
        Pay EMI
      </Button>
      <Dialog open={open} onOpenChange={(next) => { if (!next) reset(); setOpen(next) }}>
        <DialogContent className="sm:max-w-md">
          {stage === "success" ? (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                  Payment successful
                </DialogTitle>
                <DialogDescription>
                  ₹{formatINR(emi)} paid towards {loanName}
                  {mode === "simulated" && " via the simulated test gateway"}.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="gradient" className="w-full" onClick={() => setOpen(false)}>
                  Done
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-400" />
                  Pay EMI — {loanName}
                </DialogTitle>
                <DialogDescription>Review the amount and pay securely.</DialogDescription>
              </DialogHeader>
              <div className="rounded-xl border border-slate-700 bg-slate-900/50 p-6 text-center space-y-1">
                <p className="text-sm text-slate-400">Amount due</p>
                <p className="text-4xl font-bold text-white">₹{formatINR(emi)}</p>
                <div className="flex items-center justify-center gap-2 pt-2">
                  <ShieldCheck className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-slate-400">Secured payment</span>
                  <Badge variant="outline" className="text-xs border-slate-600 text-slate-400">
                    Test mode
                  </Badge>
                </div>
              </div>
              <DialogFooter>
                <Button variant="gradient" className="w-full" onClick={handlePay} disabled={isWorking}>
                  {isWorking ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {stage === "processing" ? "Processing payment…" : "Starting…"}
                    </>
                  ) : (
                    `Pay ₹${formatINR(emi)}`
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

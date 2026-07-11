"use client"

import { useState } from "react"
import { FileDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

interface UserLoan {
  id: string
  name: string
  type: string
  principal: number
  interestRate: number
  emi: number
  outstandingBalance: number
  totalInterestPaid: number
  nextPaymentDue: string
}

interface PaymentDetail {
  loanName: string
  amount: number
  principalComponent: number
  interestComponent: number
  paidAt: string
}

// jsPDF's built-in fonts have no ₹ glyph, so statements use "Rs."
const formatRs = (value: number) => `Rs. ${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`

const formatDate = (value: string | Date) =>
  new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })

export function ExportStatementButton({ loans, userName }: { loans: UserLoan[]; userName: string }) {
  const { toast } = useToast()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const [{ jsPDF }, { default: autoTable }] = await Promise.all([import("jspdf"), import("jspdf-autotable")])
      const res = await fetch("/api/payments")
      const paymentsData = res.ok ? await res.json() : { payments: [] }
      const payments: PaymentDetail[] = paymentsData.payments ?? []

      const doc = new jsPDF()
      const pageWidth = doc.internal.pageSize.getWidth()

      doc.setFontSize(20)
      doc.setTextColor(88, 28, 135)
      doc.text("FinShastra", 14, 18)
      doc.setFontSize(11)
      doc.setTextColor(100)
      doc.text("Loan Portfolio Statement", 14, 25)
      doc.text(`Account holder: ${userName}`, pageWidth - 14, 18, { align: "right" })
      doc.text(`Generated: ${formatDate(new Date())}`, pageWidth - 14, 25, { align: "right" })

      const totalOutstanding = loans.reduce((s, l) => s + l.outstandingBalance, 0)
      const totalInterest = loans.reduce((s, l) => s + l.totalInterestPaid, 0)
      doc.setFontSize(12)
      doc.setTextColor(30)
      doc.text(
        `Active loans: ${loans.filter((l) => l.outstandingBalance > 0).length}    ` +
          `Total outstanding: ${formatRs(totalOutstanding)}    ` +
          `Interest paid to date: ${formatRs(totalInterest)}`,
        14,
        36,
      )

      autoTable(doc, {
        startY: 42,
        head: [["Loan", "Type", "Principal", "Rate", "EMI", "Outstanding", "Next Due"]],
        body: loans.map((l) => [
          l.name,
          l.type,
          formatRs(l.principal),
          `${l.interestRate}%`,
          formatRs(l.emi),
          formatRs(l.outstandingBalance),
          l.outstandingBalance > 0 ? formatDate(l.nextPaymentDue) : "Paid off",
        ]),
        headStyles: { fillColor: [88, 28, 135] },
        styles: { fontSize: 9 },
      })

      const afterLoansY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY
      doc.setFontSize(13)
      doc.text("Payment History", 14, afterLoansY + 12)
      autoTable(doc, {
        startY: afterLoansY + 16,
        head: [["Date", "Loan", "Amount", "Principal", "Interest"]],
        body:
          payments.length > 0
            ? payments.map((p) => [
                formatDate(p.paidAt),
                p.loanName,
                formatRs(p.amount),
                formatRs(p.principalComponent),
                formatRs(p.interestComponent),
              ])
            : [["—", "No payments recorded yet", "—", "—", "—"]],
        headStyles: { fillColor: [88, 28, 135] },
        styles: { fontSize: 9 },
      })

      doc.save(`FinShastra-Statement-${new Date().toISOString().split("T")[0]}.pdf`)
    } catch (err) {
      console.error("PDF export error:", err)
      toast({ title: "Export failed", description: "Could not generate the PDF. Please try again.", variant: "destructive" })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting || loans.length === 0}>
      {isExporting ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" aria-hidden="true" />
      ) : (
        <FileDown className="h-4 w-4 mr-2" aria-hidden="true" />
      )}
      Export PDF
    </Button>
  )
}

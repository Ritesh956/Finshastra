"use client"

import { useCallback, useState } from "react"
import { AlertCircle, Bell, CreditCard, Calendar, TrendingUp, CheckCircle2, Loader2, Info } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface AlertItem {
  id: string
  severity: "urgent" | "warning" | "info" | "success"
  title: string
  message: string
}

const severityStyles: Record<AlertItem["severity"], { box: string; heading: string; text: string; Icon: typeof Bell }> = {
  urgent: { box: "bg-red-950/60 border border-red-800", heading: "text-red-300", text: "text-red-200/80", Icon: CreditCard },
  warning: { box: "bg-yellow-950/60 border border-yellow-800", heading: "text-yellow-300", text: "text-yellow-200/80", Icon: Calendar },
  info: { box: "bg-blue-950/60 border border-blue-800", heading: "text-blue-300", text: "text-blue-200/80", Icon: TrendingUp },
  success: { box: "bg-green-950/60 border border-green-800", heading: "text-green-300", text: "text-green-200/80", Icon: CheckCircle2 },
}

export function AlertDialogDemo() {
  const [alerts, setAlerts] = useState<AlertItem[]>([])
  const [status, setStatus] = useState<"idle" | "loading" | "loaded" | "unauthenticated" | "error">("idle")

  const loadAlerts = useCallback(async () => {
    setStatus("loading")
    try {
      const res = await fetch("/api/alerts")
      if (res.status === 401) {
        setStatus("unauthenticated")
        return
      }
      if (!res.ok) throw new Error()
      const data = await res.json()
      setAlerts(data.alerts)
      setStatus("loaded")
    } catch {
      setStatus("error")
    }
  }, [])

  return (
    <AlertDialog onOpenChange={(open) => { if (open) loadAlerts() }}>
      <AlertDialogTrigger asChild>
        <Button
          variant="outline"
          aria-label="Show alerts"
          className="border-purple-700/50 bg-purple-950/30 text-white hover:bg-purple-900/50 hover:border-purple-600 transition-all duration-300"
        >
          <AlertCircle className="h-4 w-4 sm:mr-2" aria-hidden="true" />
          <span className="hidden sm:inline">Show Alerts</span>
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold flex items-center">
            <Bell className="mr-2 h-6 w-6 text-yellow-500" />
            Your Alerts
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-4 mt-4">
              {status === "loading" && (
                <div className="flex items-center justify-center py-10 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  Loading your alerts…
                </div>
              )}
              {status === "unauthenticated" && (
                <div className="flex flex-col items-center py-10 text-center">
                  <Info className="h-8 w-8 text-slate-500 mb-2" />
                  <p className="text-slate-300 font-medium">Log in to see your alerts</p>
                  <p className="text-sm text-slate-500 mt-1">
                    Alerts are built from your real loan portfolio — EMI due dates, overdue payments, and better offers.
                  </p>
                </div>
              )}
              {status === "error" && (
                <div className="flex flex-col items-center py-10 text-center">
                  <AlertCircle className="h-8 w-8 text-red-500 mb-2" />
                  <p className="text-slate-300 font-medium">Could not load alerts</p>
                  <p className="text-sm text-slate-500 mt-1">Please try again in a moment.</p>
                </div>
              )}
              {status === "loaded" && alerts.length === 0 && (
                <div className="flex flex-col items-center py-10 text-center">
                  <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                  <p className="text-slate-300 font-medium">You're all caught up</p>
                  <p className="text-sm text-slate-500 mt-1">No overdue or upcoming EMIs need your attention.</p>
                </div>
              )}
              {status === "loaded" &&
                alerts.map((alert) => {
                  const style = severityStyles[alert.severity]
                  return (
                    <div key={alert.id} className={`${style.box} p-4 rounded-lg`}>
                      <h3 className={`text-lg font-semibold ${style.heading} flex items-center`}>
                        <style.Icon className="mr-2 h-5 w-5 shrink-0" />
                        {alert.title}
                      </h3>
                      <p className={`text-sm ${style.text} mt-1`}>{alert.message}</p>
                    </div>
                  )
                })}
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-between items-center">
          {status === "loaded" && alerts.length > 0 && (
            <Badge variant="outline" className="px-2 py-1">
              {alerts.length} Alert{alerts.length === 1 ? "" : "s"}
            </Badge>
          )}
          <AlertDialogAction>Close</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}

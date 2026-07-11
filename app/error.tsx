"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Unhandled app error:", error)
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg mb-6">
          <AlertTriangle className="h-8 w-8 text-white" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">Something went wrong</h1>
        <p className="text-slate-400 mb-8">
          An unexpected error occurred. Your data is safe — try again, and if it keeps happening, reload the page.
        </p>
        <Button variant="gradient" onClick={reset}>
          Try Again
        </Button>
      </div>
    </div>
  )
}

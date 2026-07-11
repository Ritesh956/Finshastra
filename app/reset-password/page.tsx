"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lock, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react"

function ResetPasswordForm() {
  const searchParams = useSearchParams()
  const token = searchParams.get("token") ?? ""
  const [password, setPassword] = useState("")
  const [confirm, setConfirm] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      return
    }
    if (password !== confirm) {
      setError("Passwords do not match")
      return
    }
    setIsLoading(true)
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.")
        return
      }
      setSuccess(true)
    } catch {
      setError("Network error. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="shadow-xl bg-slate-900/50 border-slate-700">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-white">Choose a new password</CardTitle>
        <CardDescription className="text-slate-400">
          Enter and confirm your new password below
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!token ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              This page needs a reset link. Request one from the{" "}
              <Link href="/forgot-password" className="underline">
                forgot password
              </Link>{" "}
              page.
            </AlertDescription>
          </Alert>
        ) : success ? (
          <Alert className="border-green-500 bg-green-950/50">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">
              Password updated.{" "}
              <Link href="/login" className="underline">
                Log in
              </Link>{" "}
              with your new password.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-200">
                New Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-slate-200">
                Confirm Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="confirm"
                  type="password"
                  placeholder="Re-enter your new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            <Button type="submit" variant="gradient" className="w-full" disabled={isLoading}>
              {isLoading ? "Updating…" : "Update Password"}
            </Button>
          </form>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Link
          href="/login"
          className="text-sm text-purple-400 hover:text-purple-300 hover:underline flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Login
        </Link>
      </CardFooter>
    </Card>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-white">Reset Password</h1>
          <p className="text-slate-400">Set a new password for your account</p>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  )
}

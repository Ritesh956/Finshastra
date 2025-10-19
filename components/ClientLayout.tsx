"use client"

import { AuthProvider } from "@/contexts/AuthContext"
import { LayoutContent } from "@/components/LayoutContent"
import type React from "react"

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <LayoutContent>{children}</LayoutContent>
    </AuthProvider>
  )
}

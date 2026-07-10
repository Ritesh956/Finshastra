"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { SessionProvider, useSession, signIn, signOut } from "next-auth/react"

export interface User {
  id: string
  name: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  bank?: string | null
  income?: number | null
  expenses?: number | null
  creditScore?: number | null
  createdAt: string
}

interface SignupData {
  name: string
  email: string
  phone?: string
  password: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  signup: (userData: SignupData) => Promise<{ ok: boolean; error?: string }>
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function AuthContextInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/user/me")
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        setUser(null)
      }
    } catch {
      setUser(null)
    }
  }, [])

  useEffect(() => {
    if (status === "authenticated") {
      fetchProfile()
    } else if (status === "unauthenticated") {
      setUser(null)
    }
  }, [status, fetchProfile])

  const login = async (email: string, password: string): Promise<boolean> => {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })
    return result?.ok ?? false
  }

  const logout = () => {
    signOut({ redirect: false }).then(() => {
      setUser(null)
      router.push("/login")
    })
  }

  const signup = async (userData: SignupData): Promise<{ ok: boolean; error?: string }> => {
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      if (res.ok) {
        return { ok: true }
      }
      const data = await res.json().catch(() => ({}))
      return { ok: false, error: data.error || "Registration failed. Please try again." }
    } catch {
      return { ok: false, error: "Network error. Please try again." }
    }
  }

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      const res = await fetch("/api/user/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      })
      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
        return true
      }
      return false
    } catch {
      return false
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: status === "authenticated",
        isLoading: status === "loading",
        login,
        logout,
        signup,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AuthContextInner>{children}</AuthContextInner>
    </SessionProvider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

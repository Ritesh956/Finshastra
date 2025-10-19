"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl?: string
  bank?: string
  createdAt: string
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => boolean
  logout: () => void
  signup: (userData: Omit<User, "id" | "createdAt">) => boolean
  updateProfile: (userData: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem("currentUser")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setIsAuthenticated(true)
    }
  }, [])

  const login = (email: string, password: string): boolean => {
    // Mock authentication - replace with real API call
    // For demo purposes, we'll check if user exists in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    const foundUser = users.find((u: any) => u.email === email)

    if (foundUser) {
      setUser(foundUser)
      setIsAuthenticated(true)
      localStorage.setItem("currentUser", JSON.stringify(foundUser))
      return true
    }

    // For demo: allow any email/password combination
    const demoUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name: email.split("@")[0],
      email: email,
      phone: "+1 (555) 123-4567",
      createdAt: new Date().toISOString(),
      avatarUrl: "/placeholder.svg?height=40&width=40",
    }
    setUser(demoUser)
    setIsAuthenticated(true)
    localStorage.setItem("currentUser", JSON.stringify(demoUser))
    return true
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    localStorage.removeItem("currentUser")
    router.push("/login")
  }

  const signup = (userData: Omit<User, "id" | "createdAt">): boolean => {
    const newUser: User = {
      ...userData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    }

    // Store in localStorage (replace with real API call)
    const users = JSON.parse(localStorage.getItem("users") || "[]")
    users.push(newUser)
    localStorage.setItem("users", JSON.stringify(users))

    return true
  }

  const updateProfile = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData }
      setUser(updatedUser)
      localStorage.setItem("currentUser", JSON.stringify(updatedUser))

      // Update in users array
      const users = JSON.parse(localStorage.getItem("users") || "[]")
      const userIndex = users.findIndex((u: User) => u.id === user.id)
      if (userIndex !== -1) {
        users[userIndex] = updatedUser
        localStorage.setItem("users", JSON.stringify(users))
      }
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, signup, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

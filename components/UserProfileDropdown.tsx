"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, ChevronDown, ChevronUp, Settings, LogOut } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/contexts/AuthContext"

interface UserProfileDropdownProps {
  user: {
    name: string
    email: string
    phone: string
    bank?: string
    avatarUrl?: string
  }
}

export function UserProfileDropdown({ user }: UserProfileDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const handleEditProfile = () => {
    router.push("/profile")
    setIsOpen(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary border-2 border-transparent hover:border-blue-500">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user.avatarUrl} alt={user.name} />
            <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-lg shadow-lg">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 dark:bg-slate-800 dark:border-slate-700" align="end">
        <Card className="border-0 shadow-none dark:bg-transparent">
          <CardHeader className="pb-3">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl} alt={user.name} />
                <AvatarFallback className="bg-gradient-to-br from-blue-600 to-purple-600 text-white font-bold text-2xl">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg dark:text-white">{user.name}</CardTitle>
                <p className="text-sm text-muted-foreground dark:text-slate-400">{user.email}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3 pt-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground dark:text-slate-400">Phone</Label>
              <p className="text-sm font-medium dark:text-white">{user.phone}</p>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground dark:text-slate-400">Bank</Label>
              <p className="text-sm font-medium dark:text-white">{user.bank || "Not specified"}</p>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-3">
            <Button variant="outline" className="w-full dark:border-slate-600 dark:text-white dark:hover:bg-slate-700" onClick={handleEditProfile}>
              <Settings className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </CardFooter>
        </Card>
        <DropdownMenuSeparator className="dark:bg-slate-700" />
        <DropdownMenuItem onClick={handleLogout} className="dark:text-white dark:hover:bg-slate-700 cursor-pointer">
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}


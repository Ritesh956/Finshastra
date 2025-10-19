"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuth } from "@/contexts/AuthContext"
import { User, Mail, Phone, Building2, Camera, Save, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  const router = useRouter()
  const { user, isAuthenticated, updateProfile, logout } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    bank: "",
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login")
      return
    }

    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        bank: user.bank || "",
      })
    }
  }, [user, isAuthenticated, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    })
  }

  const handleSave = () => {
    updateProfile(formData)
    setIsEditing(false)
    setSuccessMessage("Profile updated successfully!")
    setTimeout(() => setSuccessMessage(""), 3000)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <div className="container mx-auto py-8 px-4 max-w-4xl">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => router.push("/dashboard")} className="mb-4 text-slate-300 hover:text-white hover:bg-slate-800">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-white">Profile Settings</h1>
          <p className="text-slate-400 mt-2">Manage your account settings and preferences</p>
        </div>

        {successMessage && (
          <Alert className="mb-6 border-green-500 bg-green-950/50">
            <CheckCircle2 className="h-4 w-4 text-green-400" />
            <AlertDescription className="text-green-400">{successMessage}</AlertDescription>
          </Alert>
        )}

        <div className="grid gap-6">
          <Card className="bg-slate-900/50 border-slate-700">
            <CardHeader>
              <CardTitle className="text-white">Profile Information</CardTitle>
              <CardDescription className="text-slate-400">Update your personal information and contact details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center mb-6">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-2xl bg-purple-900 text-white">{getInitials(user.name)}</AvatarFallback>
                </Avatar>
                <Button size="icon" variant="secondary" className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-slate-800 hover:bg-slate-700">
                  <Camera className="h-4 w-4 text-white" />
                </Button>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-white">{user.name}</h2>
              <p className="text-sm text-slate-400">{user.email}</p>
            </div>

            <Separator className="my-6 bg-slate-700" />

            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-slate-800">
                <TabsTrigger value="personal" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Personal Details</TabsTrigger>
                <TabsTrigger value="security" className="data-[state=active]:bg-slate-700 text-slate-300 data-[state=active]:text-white">Security</TabsTrigger>
              </TabsList>

              <TabsContent value="personal" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-200">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-200">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-slate-200">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bank" className="text-slate-200">Bank Name (Optional)</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                    <Input
                      id="bank"
                      value={formData.bank}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="Your primary bank"
                      className="pl-10 bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)} className="w-full bg-purple-600 hover:bg-purple-700">
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button onClick={handleSave} className="flex-1 bg-purple-600 hover:bg-purple-700">
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          if (user) {
                            setFormData({
                              name: user.name || "",
                              email: user.email || "",
                              phone: user.phone || "",
                              bank: user.bank || "",
                            })
                          }
                        }}
                        className="flex-1 border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="security" className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword" className="text-slate-200">Current Password</Label>
                  <Input id="currentPassword" type="password" placeholder="••••••••" className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword" className="text-slate-200">New Password</Label>
                  <Input id="newPassword" type="password" placeholder="••••••••" className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword" className="text-slate-200">Confirm New Password</Label>
                  <Input id="confirmNewPassword" type="password" placeholder="••••••••" className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500" />
                </div>

                <Button className="w-full mt-4 bg-purple-600 hover:bg-purple-700">Update Password</Button>

                <Separator className="my-6 bg-slate-700" />

                <div className="pt-4">
                  <h3 className="text-lg font-semibold mb-2 text-white">Account Actions</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Member since {new Date(user.createdAt).toLocaleDateString()}
                  </p>
                  <Button variant="destructive" onClick={logout} className="w-full">
                    Logout
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
    </div>
  )
}

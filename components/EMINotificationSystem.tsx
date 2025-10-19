"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bell, BellOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

interface Notification {
  id: string
  loanName: string
  amount: number
  dueDate: Date
}

export function EMINotificationSystem({ loans }: { loans: any[] }) {
  const [notifications, setNotifications] = useState<Notification[]>([])

  useEffect(() => {
    // Generate notifications based on loans
    const newNotifications = loans
      .filter((loan) => loan.notificationsEnabled)
      .map((loan) => ({
        id: loan.id,
        loanName: loan.name,
        amount: loan.emi,
        dueDate: loan.nextPaymentDue,
      }))
    setNotifications(newNotifications)
  }, [loans])

  const dismissNotification = (id: string) => {
    setNotifications(notifications.filter((notification) => notification.id !== id))
  }

  const sendNotification = (notification: Notification) => {
    toast({
      title: `EMI Reminder: ${notification.loanName}`,
      description: `Your EMI of $${notification.amount.toFixed(2)} is due on ${notification.dueDate.toLocaleDateString()}`,
    })
    console.log(`Notification sent for loan: ${notification.loanName}`)
  }

  const handlePayNow = (notification: Notification) => {
    // Implement logic to process the payment
    console.log(`Processing payment for loan: ${notification.loanName}`)
  }

  return (
    <Card className="bg-transparent border-none shadow-none">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">EMI Notification System</CardTitle>
            <CardDescription className="text-slate-400">
              Never miss a payment with smart reminders
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-slate-400">No upcoming EMI notifications.</p>
        ) : (
          <ul className="space-y-4">
            {notifications.map((notification) => (
              <li key={notification.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">{notification.loanName}</p>
                  <p className="text-sm text-slate-400">
                    Due: {notification.dueDate.toLocaleDateString()} - ${notification.amount.toFixed(2)}
                  </p>
                </div>
                <div className="flex space-x-2">
                  <Button size="sm" onClick={() => sendNotification(notification)}>
                    <Bell className="h-4 w-4 mr-2" />
                    Remind
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => dismissNotification(notification.id)}>
                    <BellOff className="h-4 w-4 mr-2" />
                    Dismiss
                  </Button>
                  <Button size="sm" variant="default" onClick={() => handlePayNow(notification)}>
                    Pay Now
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}


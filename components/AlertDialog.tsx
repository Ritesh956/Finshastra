"use client"
import { AlertCircle, Bell, CreditCard, Percent, Calendar, TrendingUp } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export function AlertDialogDemo() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button 
          variant="outline" 
          className="border-purple-700/50 bg-purple-950/30 text-white hover:bg-purple-900/50 hover:border-purple-600 transition-all duration-300"
        >
          <AlertCircle className="mr-2 h-4 w-4" />
          Show Alerts
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-w-3xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-2xl font-bold flex items-center">
            <Bell className="mr-2 h-6 w-6 text-yellow-500" />
            Important Alerts
          </AlertDialogTitle>
          <AlertDialogDescription>
            <div className="space-y-4 mt-4">
              <div className="bg-red-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-red-800 flex items-center">
                  <CreditCard className="mr-2 h-5 w-5" />
                  Urgent: Home Loan EMI Due
                </h3>
                <p className="text-red-700 mt-1">Amount: ₹25,000 | Due Date: 15th July 2023 (3 days left)</p>
                <p className="text-sm text-red-600 mt-2">
                  Please ensure sufficient balance in your account to avoid late payment charges.
                </p>
              </div>

              <div className="bg-yellow-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-yellow-800 flex items-center">
                  <Percent className="mr-2 h-5 w-5" />
                  Interest Rate Change
                </h3>
                <p className="text-yellow-700 mt-1">Personal Loan: New rate 10.5% p.a. (previously 11% p.a.)</p>
                <p className="text-sm text-yellow-600 mt-2">
                  This change will be reflected in your next EMI. Consider refinancing options if applicable.
                </p>
              </div>

              <div className="bg-green-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  New Loan Offer
                </h3>
                <p className="text-green-700 mt-1">Pre-approved Personal Loan up to ₹5,00,000 at 9.99% p.a.</p>
                <p className="text-sm text-green-600 mt-2">
                  Limited time offer based on your excellent credit history. T&C apply.
                </p>
              </div>

              <div className="bg-blue-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-800 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5" />
                  Credit Score Update
                </h3>
                <p className="text-blue-700 mt-1">Current score: 780 (Excellent) | Last updated: 1st July 2023</p>
                <p className="text-sm text-blue-600 mt-2">
                  Your credit score has improved. You may be eligible for better loan terms.
                </p>
              </div>

              <div className="bg-purple-100 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-purple-800 flex items-center">
                  <Calendar className="mr-2 h-5 w-5" />
                  Scheduled Maintenance
                </h3>
                <p className="text-purple-700 mt-1">Date: 17th July 2023 | Time: 11:00 PM to 2:00 AM (IST)</p>
                <p className="text-sm text-purple-600 mt-2">
                  Online and mobile banking services may be intermittently unavailable. Plan transactions accordingly.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-between items-center">
          <Badge variant="outline" className="px-2 py-1">
            5 New Alerts
          </Badge>
          <div>
            <AlertDialogCancel className="mr-2">Dismiss All</AlertDialogCancel>
            <AlertDialogAction>View Details</AlertDialogAction>
          </div>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}


"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { LoanComparisonTool } from "@/components/LoanComparisonTool"
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations"
import { RepaymentPlanSimulator } from "@/components/RepaymentPlanSimulator"
import { EMINotificationSystem } from "@/components/EMINotificationSystem"
import { AIChatbot } from "@/components/AIChatbot"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calculator, PersonStanding, BarChart3, Bell, MessageSquare } from "lucide-react"

const TABS = ["compare", "recommendations", "simulator", "reminders", "chat"] as const
type ToolTab = (typeof TABS)[number]

function ToolsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const requested = searchParams.get("tab")
  const activeTab: ToolTab = (TABS as readonly string[]).includes(requested ?? "")
    ? (requested as ToolTab)
    : "compare"

  return (
    <div className="container mx-auto px-4 py-12 max-w-7xl">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-black mb-3 leading-none tracking-tighter">
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent">
            TOOLS
          </span>
        </h1>
        <p className="text-slate-400">Everything you need to compare, plan, and manage your loans</p>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={(tab) => router.push(`/tools?tab=${tab}`, { scroll: false })}
      >
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-5 mb-10 bg-slate-900/50 backdrop-blur-md p-3 rounded-3xl shadow-2xl border border-slate-700 h-auto gap-3">
          <TabsTrigger
            value="compare"
            className="flex items-center gap-2 text-base font-bold py-4 rounded-2xl text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 transition-all hover:text-white"
          >
            <Calculator className="w-5 h-5" />
            <span className="hidden sm:inline">Compare</span>
          </TabsTrigger>
          <TabsTrigger
            value="recommendations"
            className="flex items-center gap-2 text-base font-bold py-4 rounded-2xl text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 transition-all hover:text-white"
          >
            <PersonStanding className="w-5 h-5" />
            <span className="hidden sm:inline">Recommend</span>
          </TabsTrigger>
          <TabsTrigger
            value="simulator"
            className="flex items-center gap-2 text-base font-bold py-4 rounded-2xl text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 transition-all hover:text-white"
          >
            <BarChart3 className="w-5 h-5" />
            <span className="hidden sm:inline">Simulator</span>
          </TabsTrigger>
          <TabsTrigger
            value="reminders"
            className="flex items-center gap-2 text-base font-bold py-4 rounded-2xl text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 transition-all hover:text-white"
          >
            <Bell className="w-5 h-5" />
            <span className="hidden sm:inline">Reminders</span>
          </TabsTrigger>
          <TabsTrigger
            value="chat"
            className="flex items-center gap-2 text-base font-bold py-4 rounded-2xl text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 transition-all hover:text-white"
          >
            <MessageSquare className="w-5 h-5" />
            <span className="hidden sm:inline">AI Chat</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="compare">
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
            <LoanComparisonTool />
          </div>
        </TabsContent>
        <TabsContent value="recommendations">
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
            <PersonalizedRecommendations />
          </div>
        </TabsContent>
        <TabsContent value="simulator">
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
            <RepaymentPlanSimulator />
          </div>
        </TabsContent>
        <TabsContent value="reminders">
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
            <EMINotificationSystem />
          </div>
        </TabsContent>
        <TabsContent value="chat">
          <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
            <AIChatbot />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function ToolsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
      <Suspense>
        <ToolsContent />
      </Suspense>
    </div>
  )
}

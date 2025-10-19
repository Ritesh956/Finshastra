"use client"

import { useRouter } from "next/navigation"
import { LoanComparisonTool } from "@/components/LoanComparisonTool"
import { PersonalizedRecommendations } from "@/components/PersonalizedRecommendations"
import { RepaymentPlanSimulator } from "@/components/RepaymentPlanSimulator"
import { EMINotificationSystem } from "@/components/EMINotificationSystem"
import { AIChatbot } from "@/components/AIChatbot"
import { FAQ } from "@/components/FAQ"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calculator,
  PersonStanding,
  BarChart3,
  Bell,
  MessageSquare,
  HelpCircle,
  CreditCard,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Target,
  Award,
  Users,
  DollarSign,
  Star,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useAuth } from "@/contexts/AuthContext"
import { Badge } from "@/components/ui/badge"

export default function Home() {
  const router = useRouter()
  const { isAuthenticated } = useAuth()

  const handleGetStarted = () => {
    if (isAuthenticated) {
      router.push("/dashboard")
    } else {
      router.push("/signup")
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Hero Section - Brand New Ultra Modern Design */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950">
        {/* Animated Background Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        
        {/* Animated Gradient Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-500/30 rounded-full blur-[120px] animate-blob"></div>
          <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-purple-500/30 rounded-full blur-[120px] animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-1/4 left-1/2 w-[450px] h-[450px] bg-pink-500/30 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-7xl mx-auto text-center">
            
            {/* MASSIVE FinShastra Brand Name */}
            <div className="mb-6">
              <h1 className="text-[15rem] md:text-[30rem] lg:text-[55rem] xl:text-[70rem] font-black leading-none tracking-tighter mb-4">
  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-40xl">
    FinShastra
  </span>
</h1>


              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
                <Sparkles className="w-8 h-8 text-blue-400 animate-pulse" />
                <div className="h-1.5 w-32 bg-gradient-to-r from-transparent via-purple-500 to-transparent"></div>
              </div>
            </div>

            {/* Tagline */}
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
              Smart Loans, <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Smarter Decisions</span>
            </h2>

            {/* Description */}
            <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
              Transform your financial future with AI-powered loan management, real-time insights, and personalized recommendations.
            </p>

            {/* AI Badge */}
            <div className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-5 py-2.5 mb-10 shadow-2xl">
              <Sparkles className="w-5 h-5 text-blue-400" />
              <span className="text-sm font-semibold text-white">
                AI-Powered Financial Intelligence
              </span>
              <Badge className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0 hover:from-blue-700 hover:to-purple-700">
                New
              </Badge>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="group relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 hover:from-blue-500 hover:via-purple-500 hover:to-pink-500 text-white text-lg px-10 py-6 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all transform hover:scale-105 border-0"
              >
                <span className="relative z-10 flex items-center gap-2 font-bold">
                  Get Started Free
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </span>
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-10 py-6 rounded-2xl border-2 border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 hover:border-white/50 transition-all font-bold"
              >
                Watch Demo
              </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              {[
                { icon: Users, value: "50K+", label: "Happy Users" },
                { icon: DollarSign, value: "₹1000Cr+", label: "Loans Managed" },
                { icon: Award, value: "4.9/5", label: "User Rating" },
                { icon: Target, value: "99.9%", label: "Success Rate" },
              ].map((stat, idx) => (
                <div key={idx} className="group">
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all hover:shadow-xl hover:shadow-blue-500/20 transform hover:-translate-y-1">
                    <stat.icon className="w-8 h-8 mx-auto mb-2 text-blue-400 group-hover:scale-110 group-hover:text-blue-300 transition-all" />
                    <div className="text-3xl font-black text-white mb-1">
                      {stat.value}
                    </div>
                    <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
                      {stat.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Gradient Fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent"></div>
      </section>

      {/* Features Section - Ultra Modern Dark Theme */}
      <section id="features" className="relative py-20 bg-slate-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          {/* Section Header */}
          <div className="text-center mb-16">
            <h2 className="text-[16rem] md:text-[24rem] lg:text-[32rem] xl:text-[40rem] font-black mb-8 leading-none tracking-tighter">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-2xl">
                FEATURES
              </span>
            </h2>
          </div>

          {/* Feature Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
            {[
              {
                icon: CreditCard,
                title: "Smart Loan Comparison",
                description: "Compare multiple loan offers in real-time with AI-powered recommendations tailored to your profile.",
                gradient: "from-blue-500 to-cyan-500"
              },
              {
                icon: Calculator,
                title: "EMI Calculator",
                description: "Calculate EMIs instantly with our advanced simulator. Visualize different repayment scenarios.",
                gradient: "from-purple-500 to-pink-500"
              },
              {
                icon: TrendingUp,
                title: "Personalized Insights",
                description: "Get AI-driven recommendations based on your income, expenses, and credit profile.",
                gradient: "from-green-500 to-emerald-500"
              },
              {
                icon: Bell,
                title: "Smart Notifications",
                description: "Never miss a payment with intelligent reminders and payment tracking.",
                gradient: "from-orange-500 to-red-500"
              },
              {
                icon: MessageSquare,
                title: "AI Assistant",
                description: "24/7 AI chatbot to answer all your loan-related queries instantly.",
                gradient: "from-indigo-500 to-purple-500"
              },
              {
                icon: Shield,
                title: "Secure & Private",
                description: "Bank-grade security with end-to-end encryption for your financial data.",
                gradient: "from-teal-500 to-cyan-500"
              }
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl bg-slate-900/50 backdrop-blur-sm border border-slate-800 hover:border-blue-500/50 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/20 transform hover:-translate-y-2"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                
                <div className="relative z-10">
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                    <feature.icon className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Section - Ultra Modern Dark Theme */}
      <section className="relative py-20 bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[150px]"></div>
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-pink-500/20 rounded-full blur-[150px]"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-[16rem] md:text-[24rem] lg:text-[32rem] xl:text-[40rem] font-black mb-8 leading-none tracking-tighter">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 bg-clip-text text-transparent drop-shadow-2xl">
                TOOLS
              </span>
            </h2>
          </div>

          <Tabs defaultValue="compare" className="max-w-7xl mx-auto">
            <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6 mb-12 bg-slate-900/50 backdrop-blur-md p-3 rounded-3xl shadow-2xl border border-slate-700 h-auto gap-3">
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
                value="notifications" 
                className="flex items-center gap-2 text-base font-bold py-4 rounded-2xl text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 transition-all hover:text-white"
              >
                <Bell className="w-5 h-5" />
                <span className="hidden sm:inline">Alerts</span>
              </TabsTrigger>
              <TabsTrigger 
                value="chatbot" 
                className="flex items-center gap-2 text-base font-bold py-4 rounded-2xl text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 transition-all hover:text-white"
              >
                <MessageSquare className="w-5 h-5" />
                <span className="hidden sm:inline">AI Chat</span>
              </TabsTrigger>
              <TabsTrigger 
                value="faq" 
                className="flex items-center gap-2 text-base font-bold py-4 rounded-2xl text-slate-400 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-xl data-[state=active]:shadow-blue-500/50 transition-all hover:text-white"
              >
                <HelpCircle className="w-5 h-5" />
                <span className="hidden sm:inline">FAQ</span>
              </TabsTrigger>
            </TabsList>

            {/* Tab Content Sections - Dark Theme */}
            <TabsContent value="compare" className="mt-8">
              <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
                <LoanComparisonTool />
              </div>
            </TabsContent>
            
            <TabsContent value="recommendations" className="mt-8">
              <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
                <PersonalizedRecommendations />
              </div>
            </TabsContent>
            
            <TabsContent value="simulator" className="mt-8">
              <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
                <RepaymentPlanSimulator />
              </div>
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-8">
              <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
                <EMINotificationSystem loans={[]} />
              </div>
            </TabsContent>
            
            <TabsContent value="chatbot" className="mt-8">
              <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
                <AIChatbot />
              </div>
            </TabsContent>
            
            <TabsContent value="faq" className="mt-8">
              <div className="rounded-3xl bg-slate-900/50 backdrop-blur-md p-8 border border-slate-800 shadow-2xl">
                <FAQ />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}

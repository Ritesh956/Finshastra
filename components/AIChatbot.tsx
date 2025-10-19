"use client"

import { useState, useRef, useEffect } from "react"
import type { FormEvent } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, MessageSquare, Clock, Send, Bot, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface Message {
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

function formatResponse(text: string): string {
  // Remove markdown bold (**text**)
  return text.replace(/\*\*/g, '')
}

function getIntelligentAIResponse(input: string): string {
  const lowercaseInput = input.toLowerCase()

  // Loan types and eligibility
  if (lowercaseInput.includes("eligib") || lowercaseInput.includes("qualify")) {
    return "To qualify for a loan, lenders typically look at:\n\n• Credit Score: Generally 650+ for personal loans, 620+ for mortgages\n• Income: Stable employment with sufficient income to cover EMIs\n• Debt-to-Income Ratio: Usually below 40%\n• Employment History: At least 2 years of stable employment\n• Age: Between 21-60 years\n\nWould you like to know about specific loan eligibility criteria?"
  }

  // Interest rates
  if (lowercaseInput.includes("interest") || lowercaseInput.includes("rate")) {
    return "Interest rates vary by loan type and your credit profile:\n\n• Personal Loans: 10.5% - 24% per annum\n• Home Loans: 8.5% - 11.5% per annum\n• Car Loans: 8.7% - 14% per annum\n• Education Loans: 9% - 15% per annum\n\nYour credit score significantly impacts the rate you'll receive. Higher scores (750+) get the best rates. Use our comparison tool to find the lowest rates!"
  }

  // EMI calculation
  if (lowercaseInput.includes("emi") || lowercaseInput.includes("payment") || lowercaseInput.includes("installment")) {
    return "EMI (Equated Monthly Installment) is calculated using:\n\nFormula: EMI = [P × R × (1+R)^N] / [(1+R)^N-1]\n\nWhere:\n• P = Principal loan amount\n• R = Monthly interest rate\n• N = Loan tenure in months\n\n💡 Tip: Use our Repayment Plan Simulator to calculate your exact EMI and see how prepayments can reduce your total interest!"
  }

  // Credit score
  if (lowercaseInput.includes("credit score") || lowercaseInput.includes("cibil")) {
    return "Credit Score Ranges & What They Mean:\n\n• 750-900: Excellent - Best rates & quick approval\n• 650-749: Good - Competitive rates available\n• 550-649: Fair - Limited options, higher rates\n• Below 550: Poor - Difficult to get approved\n\nImprove Your Score:\n✓ Pay all bills on time\n✓ Keep credit utilization below 30%\n✓ Avoid multiple loan applications\n✓ Check credit report for errors"
  }

  // Documents required
  if (lowercaseInput.includes("document") || lowercaseInput.includes("paper") || lowercaseInput.includes("proof")) {
    return "Common Documents Required for Loan Applications:\n\n📄 Identity Proof: PAN card, Aadhaar, Passport, Voter ID\n📄 Address Proof: Utility bills, rental agreement, Aadhaar\n📄 Income Proof: Salary slips (3-6 months), bank statements, ITR\n📄 Employment Proof: Employment certificate, offer letter\n📄 Additional: Form 16, bank statements (6-12 months)\n\nFor self-employed: Business proof, GST registration, audited financials required."
  }

  // Loan types
  if (lowercaseInput.includes("type") && lowercaseInput.includes("loan")) {
    return "Popular Loan Types We Can Help You With:\n\n🏠 Home Loan: 8.5%-11.5% | Up to 30 years\n🚗 Car Loan: 8.7%-14% | Up to 7 years\n💼 Personal Loan: 10.5%-24% | Up to 5 years\n🎓 Education Loan: 9%-15% | Up to 15 years\n💳 Business Loan: 11%-20% | Up to 10 years\n🏗️ Property Loan: 9%-13% | Up to 20 years\n\nWhich loan type interests you?"
  }

  // Prepayment
  if (lowercaseInput.includes("prepay") || lowercaseInput.includes("foreclos") || lowercaseInput.includes("early")) {
    return "Prepayment & Foreclosure Information:\n\n✅ Benefits:\n• Reduce total interest paid\n• Become debt-free faster\n• Improve credit score\n\n⚠️ Things to Consider:\n• Prepayment charges: 2-5% for some loans\n• Tax benefits on home loans may reduce\n• Lock-in periods may apply\n\n💡 Use our Repayment Simulator to see how prepayments impact your loan!"
  }

  // Comparison
  if (lowercaseInput.includes("compar") || lowercaseInput.includes("best") || lowercaseInput.includes("which")) {
    return "🔍 Comparing Loans? Consider These Factors:\n\n1. Interest Rate: Lower is better, but check for hidden charges\n2. Processing Fee: 0.5%-3% of loan amount\n3. Tenure Flexibility: Longer tenure = lower EMI but higher interest\n4. Prepayment Options: Zero prepayment charges preferred\n5. Approval Time: Some lenders offer instant approval\n\n👉 Try our Loan Comparison Tool to compare multiple offers instantly!"
  }

  // Processing time
  if (lowercaseInput.includes("how long") || lowercaseInput.includes("process") || lowercaseInput.includes("time")) {
    return "Typical Loan Processing Times:\n\n⚡ Personal Loan: 24-48 hours (instant for pre-approved)\n🏠 Home Loan: 7-21 days\n🚗 Car Loan: 2-7 days\n🎓 Education Loan: 7-15 days\n\nFactors Affecting Speed:\n• Document completeness\n• Credit score\n• Loan amount\n• Verification requirements\n\n💡 Have all documents ready for faster approval!"
  }

  // Default/rejection
  if (lowercaseInput.includes("reject") || lowercaseInput.includes("denied") || lowercaseInput.includes("refuse")) {
    return "Common Reasons for Loan Rejection:\n\n❌ Low credit score (below 650)\n❌ Insufficient income\n❌ High existing debt\n❌ Incomplete documentation\n❌ Employment instability\n❌ Errors in application\n\nWhat to Do Next:\n✓ Ask for rejection reason\n✓ Improve credit score\n✓ Reduce existing debts\n✓ Consider a co-applicant\n✓ Try for a lower amount\n✓ Wait 3-6 months before reapplying"
  }

  // Secured vs unsecured
  if (lowercaseInput.includes("secured") || lowercaseInput.includes("collateral") || lowercaseInput.includes("unsecured")) {
    return "Secured vs Unsecured Loans:\n\n🔒 Secured Loans (with collateral):\n• Lower interest rates (8-12%)\n• Higher loan amounts\n• Longer tenure\n• Risk: Can lose asset\n• Examples: Home, car, gold loans\n\n🔓 Unsecured Loans (no collateral):\n• Higher interest rates (12-24%)\n• Lower loan amounts\n• Shorter tenure\n• No asset risk\n• Examples: Personal, education loans\n\nWhich type suits your needs?"
  }

  // Help/greeting
  if (lowercaseInput.includes("hello") || lowercaseInput.includes("hi") || lowercaseInput.includes("hey") || lowercaseInput.includes("help")) {
    return "👋 Hello! I'm your AI Loan Assistant. I can help you with:\n\n• Loan eligibility & requirements\n• Interest rates & EMI calculations\n• Document requirements\n• Loan comparison & recommendations\n• Credit score guidance\n• Application process & timelines\n\nWhat would you like to know about loans today?"
  }

  // Default intelligent response
  return "I understand you're asking about loans. Here's what I can help you with:\n\n💡 Try asking me about:\n• \"What documents do I need?\"\n• \"How to calculate EMI?\"\n• \"What's a good credit score?\"\n• \"Compare loan types\"\n• \"Prepayment benefits\"\n\nOr use our tools:\n🔧 Loan Comparison Tool - Compare multiple lenders\n📊 Repayment Simulator - Calculate EMI & savings\n\nWhat specific aspect of loans would you like to explore?"
}

export function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "👋 Hello! I'm your AI Loan Assistant. Ask me anything about loans, interest rates, EMI calculations, eligibility, or use our comparison tools!",
      timestamp: new Date()
    }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight
      }
    }
  }, [messages])

  const sendMessage = async (e: FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: "user", content: input, timestamp: new Date() }
    setMessages((prevMessages) => [...prevMessages, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate typing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    const aiResponse = getIntelligentAIResponse(input)
    const assistantMessage: Message = { role: "assistant", content: aiResponse, timestamp: new Date() }
    setMessages((prevMessages) => [...prevMessages, assistantMessage])
    setIsLoading(false)
  }

  const quickQuestions = [
    "How to calculate EMI?",
    "What documents needed?",
    "Check eligibility",
    "Compare loan types"
  ]

  const handleQuickQuestion = (question: string) => {
    setInput(question)
  }

  return (
    <Card className="h-[700px] flex flex-col bg-transparent border-none shadow-none">
      <CardHeader className="border-b border-slate-700">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center shadow-lg">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl text-white">AI Loan Assistant</CardTitle>
            <CardDescription className="text-slate-400">
              Powered by intelligent loan knowledge base
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-6">
        <Tabs defaultValue="chat" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-3 bg-slate-800">
            <TabsTrigger value="chat" className="data-[state=active]:bg-slate-700">
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-slate-700">
              <Clock className="w-4 h-4 mr-2" />
              Suggestions
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-slate-700">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="chat" className="flex-1 flex flex-col mt-4 space-y-4">
            {messages.length === 1 && (
              <div className="grid grid-cols-2 gap-2 mb-4">
                {quickQuestions.map((question, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs dark:border-slate-600 dark:hover:bg-slate-700 dark:text-slate-300"
                  >
                    {question}
                  </Button>
                ))}
              </div>
            )}
            
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`flex items-start space-x-2 max-w-[85%] ${message.role === "user" ? "flex-row-reverse space-x-reverse" : ""}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === "user" 
                          ? "bg-gradient-to-br from-purple-600 to-pink-600" 
                          : "bg-gradient-to-br from-blue-600 to-purple-600"
                      }`}>
                        {message.role === "user" ? (
                          <User className="w-4 h-4 text-white" />
                        ) : (
                          <Bot className="w-4 h-4 text-white" />
                        )}
                      </div>
                      <div className="flex flex-col space-y-1">
                        <div
                          className={`rounded-2xl px-4 py-3 shadow-sm ${
                            message.role === "user"
                              ? "bg-gradient-to-br from-blue-600 to-purple-600 text-white"
                              : "bg-slate-900 text-slate-100 border-2 border-slate-700"
                          }`}
                        >
                          <div className="text-sm whitespace-pre-line leading-relaxed font-medium">{message.content}</div>
                        </div>
                        <span className="text-xs text-slate-500 px-2">
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start space-x-2 max-w-[85%]">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                        <Bot className="w-4 h-4 text-white" />
                      </div>
                      <div className="bg-slate-900 rounded-2xl px-4 py-3 border-2 border-slate-700 shadow-sm">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                          <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
            
            <form onSubmit={sendMessage} className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about loans, EMI, eligibility, rates..."
                disabled={isLoading}
                className="flex-1 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
              />
              <Button 
                type="submit" 
                disabled={isLoading || !input.trim()}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="history" className="flex-1 mt-4">
            <ScrollArea className="h-full">
              <div className="space-y-3">
                <h3 className="font-semibold mb-4 dark:text-white text-lg">Quick Topics</h3>
                <div className="space-y-2">
                  {[
                    { icon: "📊", title: "EMI Calculation", question: "How to calculate EMI?" },
                    { icon: "📄", title: "Required Documents", question: "What documents do I need?" },
                    { icon: "✅", title: "Eligibility Criteria", question: "Check loan eligibility" },
                    { icon: "💰", title: "Interest Rates", question: "Current interest rates" },
                    { icon: "🏠", title: "Home Loan Info", question: "Tell me about home loans" },
                    { icon: "🚗", title: "Car Loan Info", question: "Tell me about car loans" },
                    { icon: "💳", title: "Personal Loan", question: "Personal loan details" },
                    { icon: "📈", title: "Credit Score", question: "How to improve credit score?" },
                  ].map((topic, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleQuickQuestion(topic.question)}
                      className="w-full text-left p-3 rounded-lg border border-slate-700 hover:bg-slate-800 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <span className="text-2xl">{topic.icon}</span>
                        <div>
                          <div className="font-medium text-white">{topic.title}</div>
                          <div className="text-xs text-slate-400">{topic.question}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="settings" className="flex-1 mt-4">
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 text-white text-lg">Assistant Capabilities</h3>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-green-500">Active</Badge>
                    <div>
                      <div className="font-medium text-white">Loan Knowledge Base</div>
                      <div className="text-sm text-slate-400">
                        Comprehensive information on all loan types
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-green-500">Active</Badge>
                    <div>
                      <div className="font-medium text-white">EMI Calculator</div>
                      <div className="text-sm text-slate-400">
                        Instant payment calculations and advice
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-green-500">Active</Badge>
                    <div>
                      <div className="font-medium text-white">Document Guidance</div>
                      <div className="text-sm text-slate-400">
                        Required paperwork for different loans
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Badge className="bg-green-500">Active</Badge>
                    <div>
                      <div className="font-medium text-white">Credit Score Tips</div>
                      <div className="text-sm text-slate-400">
                        Improve your creditworthiness
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-blue-950/30 rounded-lg border border-blue-900">
                <div className="text-sm text-slate-300">
                  <strong className="dark:text-white">💡 Pro Tip:</strong> Be specific in your questions for better answers. 
                  Example: "What documents are needed for a home loan?" instead of just "documents?"
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}


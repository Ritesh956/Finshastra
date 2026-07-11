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
    const history = [...messages, userMessage]
    setMessages(history)
    setInput("")
    setIsLoading(true)

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history.map(({ role, content }) => ({ role, content })),
        }),
      })
      const data = await res.json()
      const reply = res.ok && data.reply
        ? data.reply
        : "Sorry, I ran into a problem answering that. Please try again."
      setMessages((prev) => [...prev, { role: "assistant", content: reply, timestamp: new Date() }])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: "I couldn't reach the server. Please check your connection and try again.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
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
              Powered by Claude AI with a built-in loan knowledge base
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
                variant="gradient"
                disabled={isLoading || !input.trim()}
                aria-label="Send message"
              >
                <Send className="w-4 h-4" aria-hidden="true" />
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


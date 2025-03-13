"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { Activity, ArrowUp, Bot, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (input.trim()) {
      const userMessage: Message = { role: "user", content: input }
      const updatedMessages = [...messages, userMessage]
      setMessages(updatedMessages)
      setInput("")
      setIsLoading(true)

      try {
        // Send the conversation to the backend
        const response = await fetch("http://127.0.0.1:8000/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ messages: updatedMessages }),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }

        // Parse the response data
        const data = await response.json()

        // Add the bot's reply to the conversation
        const botMessage: Message = { role: "assistant", content: data.reply }
        setMessages([...updatedMessages, botMessage])
      } catch (error) {
        console.error("Error:", error)
        // Add error message
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: "I'm sorry, I encountered an error. Please try again later.",
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="bg-primary px-4 lg:px-6 h-14 flex items-center">
        <Link className="flex items-center justify-center" href="/">
          <Activity className="h-6 w-6 text-white" />
          <span className="ml-2 text-lg font-bold text-white">MediTriage AI</span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="/dashboard">
            Dashboard
          </Link>
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="/chat">
            Chat
          </Link>
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="/triage">
            Triage
          </Link>
          <Link className="text-sm font-medium text-white hover:underline underline-offset-4" href="#">
            Settings
          </Link>
        </nav>
      </header>

      <main className="flex-1 container max-w-4xl py-8 flex flex-col">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Medical Assistant Chat</h1>
          <p className="text-muted-foreground mt-2">
            Describe your symptoms to our AI assistant for preliminary guidance.
          </p>
        </div>

        <Card className="flex-1 mb-4 overflow-hidden flex flex-col">
          <CardContent className="p-4 flex-1 overflow-y-auto max-h-[60vh]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <Bot className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Welcome to MediTriage AI Assistant</h3>
                <p className="text-muted-foreground max-w-md">
                  Describe your symptoms and I'll help assess their urgency. Remember, this is not a substitute for
                  professional medical advice.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <div key={index} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`flex items-start gap-3 max-w-[80%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="h-8 w-8 mt-1">
                        {msg.role === "user" ? (
                          <>
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="User" />
                            <AvatarFallback>
                              <User className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        ) : (
                          <>
                            <AvatarImage src="/placeholder.svg?height=32&width=32" alt="Assistant" />
                            <AvatarFallback>
                              <Bot className="h-4 w-4" />
                            </AvatarFallback>
                          </>
                        )}
                      </Avatar>
                      <div
                        className={`rounded-lg px-4 py-2 ${
                          msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-start gap-3 max-w-[80%]">
                      <Avatar className="h-8 w-8 mt-1">
                        <AvatarFallback>
                          <Bot className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="rounded-lg px-4 py-2 bg-muted">
                        <Skeleton className="h-4 w-24 mb-2" />
                        <Skeleton className="h-4 w-32" />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </CardContent>
        </Card>

        <div className="relative">
          <Textarea
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-[100px] resize-none pr-16 rounded-lg"
            disabled={isLoading}
          />
          <Button onClick={handleSend} className="absolute bottom-4 right-4" disabled={!input.trim() || isLoading}>
            <ArrowUp className="h-4 w-4 mr-2" />
            Send
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          This AI assistant is for informational purposes only and is not a substitute for professional medical advice,
          diagnosis, or treatment.
        </p>
      </main>
    </div>
  )
}


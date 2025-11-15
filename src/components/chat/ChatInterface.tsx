"use client"

import React, { useState } from "react"
import { Send, Bot, User } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/input"
import { ChatMessageList } from "@/components/ui/chat-message-list"
import {
  ChatBubble,
  ChatBubbleAvatar,
  ChatBubbleMessage,
  ChatBubbleTimestamp,
} from "@/components/ui/chat-bubble"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hello! I'm your ThermoTrace AI assistant. How can I help you with thermal monitoring today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm analyzing your thermal data. This is a demo response. Integration with AI coming soon!",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, aiMessage])
      setIsLoading(false)
    }, 1000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Messages with Auto-scroll */}
      <ChatMessageList className="flex-1 px-2">
        {messages.map((message) => (
          <ChatBubble
            key={message.id}
            variant={message.role === "user" ? "sent" : "received"}
          >
            <ChatBubbleAvatar
              fallback={message.role === "user" ? "U" : "AI"}
              className={
                message.role === "user"
                  ? "bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center"
                  : "bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center"
              }
            />
            <div className="flex flex-col">
              <ChatBubbleMessage
                variant={message.role === "user" ? "sent" : "received"}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
              </ChatBubbleMessage>
              <ChatBubbleTimestamp
                timestamp={message.timestamp.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              />
            </div>
          </ChatBubble>
        ))}
        {isLoading && (
          <ChatBubble variant="received">
            <ChatBubbleAvatar
              fallback="AI"
              className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center"
            />
            <ChatBubbleMessage variant="received">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </ChatBubbleMessage>
          </ChatBubble>
        )}
      </ChatMessageList>

      {/* Input Area */}
      <div className="border-t border-gray-200 p-4 bg-white">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about thermal data..."
            className="flex-1 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

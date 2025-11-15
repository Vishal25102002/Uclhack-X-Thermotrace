"use client"

import React from "react"
import { AgentResponse } from "@/types/agent"
import { Brain, Wrench, Activity, CheckCircle2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AgentResponseCardProps {
  response: AgentResponse
}

const getResponseIcon = (type: AgentResponse["type"]) => {
  switch (type) {
    case "thought":
      return <Brain className="h-4 w-4" />
    case "action":
      return <Wrench className="h-4 w-4" />
    case "observation":
      return <Activity className="h-4 w-4" />
    case "result":
      return <CheckCircle2 className="h-4 w-4" />
  }
}

const getBadgeColor = (type: AgentResponse["type"]) => {
  switch (type) {
    case "thought":
      return "bg-blue-100 text-blue-700 border-blue-200"
    case "action":
      return "bg-purple-100 text-purple-700 border-purple-200"
    case "observation":
      return "bg-green-100 text-green-700 border-green-200"
    case "result":
      return "bg-indigo-100 text-indigo-700 border-indigo-200"
  }
}

const getTypeLabel = (type: AgentResponse["type"]) => {
  return type.charAt(0).toUpperCase() + type.slice(1)
}

export default function AgentResponseCard({ response }: AgentResponseCardProps) {
  return (
    <div className="mb-4 bg-white rounded-lg p-4 border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <Badge
          variant="outline"
          className={`font-medium ${getBadgeColor(response.type)}`}
        >
          <span className="mr-1">{getResponseIcon(response.type)}</span>
          {getTypeLabel(response.type)}
        </Badge>
        <span className="text-xs text-gray-500 font-mono">
          {response.timestamp.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
          })}
        </span>
      </div>

      {/* Content */}
      <p className="text-sm text-gray-700 leading-relaxed font-sans">
        {response.content}
      </p>

      {/* Metadata */}
      {response.metadata && Object.keys(response.metadata).length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {response.metadata.model && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono">
                {response.metadata.model}
              </span>
            )}
            {response.metadata.confidence !== undefined && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono">
                {(response.metadata.confidence * 100).toFixed(0)}%
              </span>
            )}
            {response.metadata.tool && (
              <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded font-mono">
                {response.metadata.tool}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

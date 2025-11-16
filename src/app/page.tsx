"use client"

import React, { useState, useMemo } from "react"
import { HeaderBar } from "@/components/layout"
import { Timeline } from "@/components/timeline"
import { OfflineIndicator } from "@/components/shared"
import { DashboardCards } from "@/components/dashboard"
import { DecisionSummary } from "@/components/decision-summary"
import { ChatInterface } from "@/components/chat"
import { TimelineEvent, TimeRange } from "@/types/timeline"
import { mockTimelineEvents } from "@/utils/mockData/timelineEvents"
import {
  ExpandableChat,
  ExpandableChatHeader,
  ExpandableChatBody,
} from "@/components/ui/expandable-chat"
import { Bot } from "lucide-react"

export default function Home() {
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>()
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [systemStatus, setSystemStatus] = useState<"normal" | "warning" | "critical">("normal")
  const [isConnected, setIsConnected] = useState(true)
  const [selectedTimestepIndex, setSelectedTimestepIndex] = useState<number>(2)

  // Use mock timeline events for now
  const displayEvents = mockTimelineEvents

  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEventId(event.id)
    // Scroll to dashboard section
    document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range)
    // Clear selection when time range changes
    setSelectedEventId(undefined)
  }

  const handleAlertClick = () => {
    // TODO: Open alert modal/panel
    console.log("Alerts clicked")
  }

  const handleTimestepClick = (index: number) => {
    setSelectedTimestepIndex(index)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header Bar */}
      <HeaderBar
        systemStatus={systemStatus}
        alertCount={2}
        agentHealth="healthy"
        onAlertClick={handleAlertClick}
      />

      {/* Offline Indicator */}
      <OfflineIndicator isConnected={isConnected} />

      {/* Main Content */}
      <main className="pt-16 pb-8">
        {/* Timeline */}
        <Timeline
          events={displayEvents}
          selectedEventId={selectedEventId}
          onEventClick={handleEventClick}
          timeRange={timeRange}
          onTimeRangeChange={handleTimeRangeChange}
          height={180}
          selectedTimestepIndex={selectedTimestepIndex}
          onTimestepClick={handleTimestepClick}
        />

        {/* Decision Summary */}
        <div id="decision-summary-section" className="px-6 mb-4">
          <DecisionSummary timestepIndex={selectedTimestepIndex} />
        </div>

        {/* Dashboard Section */}
        <div id="dashboard-section" className="px-6">
          <DashboardCards
            selectedEventId={selectedEventId}
            timeRange={timeRange}
            timestepIndex={selectedTimestepIndex}
          />
        </div>
      </main>

      {/* Expandable Chat */}
      <ExpandableChat position="bottom-right" size="md" icon={<Bot className="h-6 w-6" />}>
        <ExpandableChatHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white border-none shadow-lg">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {/* Animated Avatar */}
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-2 border-white/30">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-400 border-2 border-blue-700 animate-pulse"></div>
              </div>

              {/* Title and Status */}
              <div>
                <h3 className="font-bold text-base tracking-tight">ThermoTrace AI</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></div>
                  <p className="text-xs text-blue-100 font-medium">Online • Ready to help</p>
                </div>
              </div>
            </div>

            {/* Minimize indicator */}
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 rounded-full bg-white/60"></div>
              <div className="w-1 h-1 rounded-full bg-white/60"></div>
              <div className="w-1 h-1 rounded-full bg-white/60"></div>
            </div>
          </div>
        </ExpandableChatHeader>
        <ExpandableChatBody className="bg-white">
          <ChatInterface />
        </ExpandableChatBody>
      </ExpandableChat>
    </div>
  )
}

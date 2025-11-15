"use client"

import React, { useState, useMemo } from "react"
import { HeaderBar } from "@/components/layout"
import { Timeline } from "@/components/timeline"
import { OfflineIndicator } from "@/components/shared"
import { DashboardCards } from "@/components/dashboard"
import { TimelineEvent, TimeRange } from "@/types/timeline"
import { mockTimelineEvents } from "@/utils/mockData/timelineEvents"

export default function Home() {
  const [selectedEventId, setSelectedEventId] = useState<string | undefined>()
  const [timeRange, setTimeRange] = useState<TimeRange>("24h")
  const [systemStatus, setSystemStatus] = useState<"normal" | "warning" | "critical">("normal")
  const [isConnected, setIsConnected] = useState(true)

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
        <div className="mb-6">
          <Timeline
            events={displayEvents}
            selectedEventId={selectedEventId}
            onEventClick={handleEventClick}
            timeRange={timeRange}
            onTimeRangeChange={handleTimeRangeChange}
            height={180}
          />
        </div>

        {/* Dashboard Section */}
        <div id="dashboard-section" className="container mx-auto px-4 max-w-7xl">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold mb-2">
              AI Agent Cooling Control Dashboard
            </h2>
            <p className="text-muted-foreground">
              Monitor system performance and decision metrics in real-time
            </p>
          </div>

          <DashboardCards 
            selectedEventId={selectedEventId}
            timeRange={timeRange}
          />
        </div>
      </main>
    </div>
  )
}

"use client"

import React, { useState, useMemo, useEffect } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TimelineEvent as TimelineEventType, TimeRange } from "@/types/timeline"
import TimelineEvent from "./TimelineEvent"
import TimelineTooltip from "./TimelineTooltip"
import TimelineAxis from "./TimelineAxis"
import TimelineControls from "./TimelineControls"
import { getTimeRangeDates } from "@/utils/formatting/time"
import { cn } from "@/lib/utils"
import { loadRunData, detectControlDecision, checkViolations, parseTimestepData } from "@/utils/decisionData"

export interface TimelineProps {
  events: TimelineEventType[]
  selectedEventId?: string
  onEventClick?: (event: TimelineEventType) => void
  timeRange?: TimeRange
  onTimeRangeChange?: (range: TimeRange) => void
  height?: number
  selectedTimestepIndex?: number
  onTimestepClick?: (index: number) => void
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const DEFAULT_ZOOM = 1

// Agent decision trace color scheme
const AGENT_IDLE = "#B8F4E4"      // Light green - No decision made
const AGENT_DECISION = "#24C19A"  // Full green - AI made decision
const AGENT_ANOMALY = "#FF9800"   // Yellow - Anomalies detected
const AGENT_VIOLATION = "#EF5350" // Red - Violations / Red alerts

type AgentStatus = 'idle' | 'decision' | 'anomaly' | 'violation'

export default function Timeline({
  events,
  selectedEventId,
  onEventClick,
  timeRange = "24h",
  onTimeRangeChange,
  height = 200,
  selectedTimestepIndex,
  onTimestepClick,
}: TimelineProps) {
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM)
  const [runData, setRunData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // Load run data on mount
  useEffect(() => {
    loadRunData().then((data) => {
      setRunData(data)
      setLoading(false)
    })
  }, [])

  // 24-hour timeline with 96 traces (one every 15 minutes)
  // 96 traces = 24 hours × 4 (15-min intervals per hour)
  const TIMELINE_DURATION_MS = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  const defaultDate = new Date('2025-10-01T00:00:00')
  const start = defaultDate
  const end = new Date(start.getTime() + TIMELINE_DURATION_MS)
  const totalMs = TIMELINE_DURATION_MS

  const baseWidth = 1200 // Base width in pixels
  const width = baseWidth * zoomLevel
  const pixelsPerMs = width / totalMs

  const visibleEvents = useMemo(() => {
    return events.filter(
      (event) =>
        event.timestamp >= start && event.timestamp <= end
    )
  }, [events, start, end])

  // Generate timeline segments representing agent decision traces
  // 96 traces for 24 hours = 1 trace every 15 minutes
  const timelineSegments = useMemo(() => {
    const segments: Array<{ id: string; color: string; width: number; status: AgentStatus; confidence: number; hasChanges: boolean; violationCount: number }> = []
    const numSegments = 96 // Exactly 96 traces for 24-hour period (agent runs every 15 min)

    if (!runData) {
      // Loading state - all segments idle
      for (let i = 0; i < numSegments; i++) {
        segments.push({
          id: `segment-${i}`,
          color: AGENT_IDLE,
          width: 100 / numSegments,
          status: 'idle',
          confidence: 0,
          hasChanges: false,
          violationCount: 0
        })
      }
      return segments
    }

    for (let i = 0; i < numSegments; i++) {
      // Get control decision and violations for this timestep
      const decision = detectControlDecision(i, runData)
      const data = parseTimestepData(i, runData)
      // Only run physics validation if a control decision was made
      const { violations, anomalies } = checkViolations(data, decision.hasChanges)

      // Determine status and color based on:
      // 1. Violations detected (physical constraints) -> red
      // 2. Anomalies detected (efficiency worse) -> yellow/orange
      // 3. Control decision changed -> full green
      // 4. No changes, no violations -> light green (idle)
      let status: AgentStatus
      let color: string

      if (violations.length > 0) {
        status = 'violation'
        color = AGENT_VIOLATION  // Red
      } else if (anomalies.length > 0) {
        status = 'anomaly'
        color = AGENT_ANOMALY  // Yellow/Orange
      } else if (decision.hasChanges) {
        status = 'decision'
        color = AGENT_DECISION  // Full green
      } else {
        status = 'idle'
        color = AGENT_IDLE  // Light green
      }

      // Calculate confidence (100% when no issues, lower with violations/anomalies)
      const totalIssues = violations.length + anomalies.length
      const confidence = totalIssues === 0 ? 95 : Math.max(40, 80 - (totalIssues * 15))

      segments.push({
        id: `segment-${i}`,
        color,
        width: 100 / numSegments, // percentage
        status,
        confidence: Math.round(confidence),
        hasChanges: decision.hasChanges,
        violationCount: violations.length + anomalies.length
      })
    }

    return segments
  }, [runData])

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.5, MAX_ZOOM))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.5, MIN_ZOOM))
  }

  const handleReset = () => {
    setZoomLevel(DEFAULT_ZOOM)
  }

  const handleEventClick = (event: TimelineEventType) => {
    onEventClick?.(event)
  }

  const getEventPosition = (event: TimelineEventType) => {
    const eventMs = event.timestamp.getTime() - start.getTime()
    return eventMs * pixelsPerMs
  }

  // Calculate agent decision statistics
  const stats = useMemo(() => {
    const idle = timelineSegments.filter(s => s.status === 'idle').length
    const decisions = timelineSegments.filter(s => s.status === 'decision').length
    const anomalies = timelineSegments.filter(s => s.status === 'anomaly').length
    const violations = timelineSegments.filter(s => s.status === 'violation').length
    // Success rate = (idle + decisions) / total = no anomalies or violations
    const successRate = (((idle + decisions) / timelineSegments.length) * 100).toFixed(0)

    return { idle, decisions, anomalies, violations, successRate }
  }, [timelineSegments])

  const [hoveredSegment, setHoveredSegment] = React.useState<number | null>(null)

  const getSegmentTime = (index: number) => {
    const segmentDuration = totalMs / timelineSegments.length
    const segmentStart = new Date(start.getTime() + (index * segmentDuration))
    const segmentEnd = new Date(start.getTime() + ((index + 1) * segmentDuration))
    return { start: segmentStart, end: segmentEnd }
  }

  return (
    <div className="flex flex-col bg-background">
      <div className="px-6 py-3">
        {/* Agent Decision Trace */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-700">Agent Decision Trace</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: AGENT_IDLE }}></div>
                <span className="text-xs text-gray-600">No Decision ({stats.idle})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: AGENT_DECISION }}></div>
                <span className="text-xs text-gray-600">Decision Made ({stats.decisions})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: AGENT_ANOMALY }}></div>
                <span className="text-xs text-gray-600">Anomalies ({stats.anomalies})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: AGENT_VIOLATION }}></div>
                <span className="text-xs text-gray-600">Violations ({stats.violations})</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold px-3 py-1 rounded-full border" style={{
            color: '#16a34a',
            backgroundColor: 'rgba(36, 193, 154, 0.1)',
            borderColor: '#24C19A'
          }}>
            {stats.successRate}% Success Rate
          </div>
        </div>

        {/* Agent Decision Trace Bar - 96 Individual Boxes */}
        <div className="relative">
          <div className="w-full h-8 flex gap-1">
            {timelineSegments.map((segment, index) => (
              <div
                key={segment.id}
                style={{
                  backgroundColor: segment.color,
                  flex: '1 1 0%',
                }}
                className={cn(
                  "h-full rounded-sm transition-all hover:brightness-110 hover:scale-105 cursor-pointer relative shadow-sm",
                  selectedTimestepIndex === index && "ring-2 ring-blue-500 ring-offset-1 scale-105 brightness-110"
                )}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => onTimestepClick?.(index)}
              />
            ))}
          </div>

          {/* Hover Tooltip */}
          {hoveredSegment !== null && (
            <div
              className="absolute top-12 z-50 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl border border-gray-700 min-w-[200px]"
              style={{
                left: `${(hoveredSegment / timelineSegments.length) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between border-b border-gray-700 pb-1.5">
                  <span className="font-semibold text-white">Timestep {hoveredSegment}</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{
                      backgroundColor: timelineSegments[hoveredSegment].status === 'idle' ? AGENT_IDLE :
                                      timelineSegments[hoveredSegment].status === 'decision' ? AGENT_DECISION :
                                      timelineSegments[hoveredSegment].status === 'anomaly' ? AGENT_ANOMALY :
                                      AGENT_VIOLATION
                    }}
                  >
                    {timelineSegments[hoveredSegment].status === 'idle' ? 'No Changes' :
                     timelineSegments[hoveredSegment].status === 'decision' ? 'Decision Made' :
                     timelineSegments[hoveredSegment].status === 'anomaly' ? 'Anomaly' :
                     'Violation'}
                  </span>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Time</div>
                  <div className="tabular-nums text-white">{getSegmentTime(hoveredSegment).start.toLocaleTimeString()}</div>
                </div>
                {timelineSegments[hoveredSegment].hasChanges && (
                  <div>
                    <div className="text-gray-400 text-xs">Control Changes</div>
                    <div className="font-medium text-emerald-400">Yes</div>
                  </div>
                )}
                {timelineSegments[hoveredSegment].violationCount > 0 && (
                  <div className="pt-1.5 border-t border-gray-700">
                    <div className="text-gray-400 text-xs">Violations</div>
                    <div className="font-bold text-lg text-red-400">{timelineSegments[hoveredSegment].violationCount}</div>
                  </div>
                )}
              </div>
              {/* Arrow */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
            </div>
          )}
        </div>

        {/* Time Markers */}
        <div className="mt-2 flex justify-between text-xs text-gray-500 tabular-nums">
          <span>{start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="font-semibold" style={{ color: '#24C19A' }}>24 hours • 96 traces (15 min intervals)</span>
          <span>{end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}

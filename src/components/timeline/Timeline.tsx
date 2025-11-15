"use client"

import React, { useState, useMemo } from "react"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { TimelineEvent as TimelineEventType, TimeRange } from "@/types/timeline"
import TimelineEvent from "./TimelineEvent"
import TimelineTooltip from "./TimelineTooltip"
import TimelineAxis from "./TimelineAxis"
import TimelineControls from "./TimelineControls"
import { getTimeRangeDates } from "@/utils/formatting/time"
import { cn } from "@/lib/utils"

export interface TimelineProps {
  events: TimelineEventType[]
  selectedEventId?: string
  onEventClick?: (event: TimelineEventType) => void
  timeRange?: TimeRange
  onTimeRangeChange?: (range: TimeRange) => void
  height?: number
}

const MIN_ZOOM = 0.5
const MAX_ZOOM = 4
const DEFAULT_ZOOM = 1

// Energy sector color scheme: Custom Green (optimal/efficient) and Custom Red (high load/issues)
const ENERGY_GREEN = "#08CB00" // Optimal energy efficiency
const ENERGY_RED = "#DC0E0E"   // High energy load/issues

const getEnergyStatusColor = (index: number, total: number): string => {
  // Simulate energy efficiency data - in production, this would come from real metrics
  const position = index / total

  // Create a pattern that shows energy efficiency over time
  // Green = optimal efficiency, Red = high energy consumption/issues
  if (position < 0.2) return ENERGY_GREEN // Start efficient
  if (position < 0.35) return ENERGY_RED // Issue detected
  if (position < 0.6) return ENERGY_GREEN // Recovered
  if (position < 0.75) return ENERGY_RED // Another issue
  return ENERGY_GREEN // Optimized
}

export default function Timeline({
  events,
  selectedEventId,
  onEventClick,
  timeRange = "24h",
  onTimeRangeChange,
  height = 200,
}: TimelineProps) {
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM)

  // 50-minute timeline with 96 traces (one every ~31 seconds)
  const TIMELINE_DURATION_MS = 50 * 60 * 1000 // 50 minutes in milliseconds
  const now = new Date()
  const start = new Date(now.getTime() - TIMELINE_DURATION_MS)
  const end = now
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

  // Generate timeline segments representing energy efficiency status
  // 96 traces for 50 minutes = 1 trace every ~31.25 seconds
  const timelineSegments = useMemo(() => {
    const segments: Array<{ id: string; color: string; width: number; status: 'optimal' | 'issue'; efficiency: number }> = []
    const numSegments = 96 // Exactly 96 traces for 50-minute period

    for (let i = 0; i < numSegments; i++) {
      const color = getEnergyStatusColor(i, numSegments)
      const efficiency = color === ENERGY_GREEN ? 85 + Math.random() * 15 : 50 + Math.random() * 30
      segments.push({
        id: `segment-${i}`,
        color,
        width: 100 / numSegments, // percentage
        status: color === ENERGY_GREEN ? 'optimal' : 'issue',
        efficiency: Math.round(efficiency)
      })
    }

    return segments
  }, [])

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

  // Calculate energy statistics
  const stats = useMemo(() => {
    const optimal = timelineSegments.filter(s => s.status === 'optimal').length
    const issues = timelineSegments.filter(s => s.status === 'issue').length
    const efficiencyRate = ((optimal / timelineSegments.length) * 100).toFixed(0)

    return { optimal, issues, efficiencyRate }
  }, [timelineSegments])

  const [hoveredSegment, setHoveredSegment] = React.useState<number | null>(null)

  const getSegmentTime = (index: number) => {
    const segmentDuration = totalMs / timelineSegments.length
    const segmentStart = new Date(start.getTime() + (index * segmentDuration))
    const segmentEnd = new Date(start.getTime() + ((index + 1) * segmentDuration))
    return { start: segmentStart, end: segmentEnd }
  }

  return (
    <div className="flex flex-col bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700" style={{ height: `${height}px` }}>
      <div className="flex-1 px-4 py-3">
        {/* Energy Efficiency Timeline */}
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-xs font-medium text-gray-700">Energy Status Timeline</span>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#08CB00' }}></div>
                <span className="text-xs text-gray-600">Optimal ({stats.optimal})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: '#DC0E0E' }}></div>
                <span className="text-xs text-gray-600">High Load ({stats.issues})</span>
              </div>
            </div>
          </div>
          <div className="text-xs font-semibold text-green-700 bg-green-50 px-3 py-1 rounded-full border border-green-200">
            {stats.efficiencyRate}% Efficiency
          </div>
        </div>

        {/* Energy Status Bar - 96 Individual Boxes */}
        <div className="relative">
          <div className="w-full h-12 bg-gray-100 dark:bg-slate-800 rounded-lg p-2 flex gap-1 border border-gray-200 dark:border-slate-600 shadow-sm">
            {timelineSegments.map((segment, index) => (
              <div
                key={segment.id}
                style={{
                  backgroundColor: segment.color,
                  flex: '1 1 0%',
                }}
                className="h-full rounded-sm transition-all hover:brightness-110 hover:scale-105 cursor-pointer relative shadow-sm"
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
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
                  <span className="font-semibold text-white">Time Period</span>
                  <span
                    className="px-2 py-0.5 rounded text-xs font-medium text-white"
                    style={{
                      backgroundColor: timelineSegments[hoveredSegment].status === 'optimal' ? '#08CB00' : '#DC0E0E'
                    }}
                  >
                    {timelineSegments[hoveredSegment].status === 'optimal' ? 'Optimal' : 'High Load'}
                  </span>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">Start</div>
                  <div className="font-mono text-white">{getSegmentTime(hoveredSegment).start.toLocaleTimeString()}</div>
                </div>
                <div>
                  <div className="text-gray-400 text-xs">End</div>
                  <div className="font-mono text-white">{getSegmentTime(hoveredSegment).end.toLocaleTimeString()}</div>
                </div>
                <div className="pt-1.5 border-t border-gray-700">
                  <div className="text-gray-400 text-xs">Energy Efficiency</div>
                  <div className="font-bold text-lg text-white">{timelineSegments[hoveredSegment].efficiency}%</div>
                </div>
              </div>
              {/* Arrow */}
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-8 border-transparent border-b-gray-900"></div>
            </div>
          )}
        </div>

        {/* Time Markers */}
        <div className="mt-2 flex justify-between text-xs text-gray-500 font-mono">
          <span>{start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          <span className="text-blue-600 font-semibold">50 min • 96 traces</span>
          <span>{end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
    </div>
  )
}

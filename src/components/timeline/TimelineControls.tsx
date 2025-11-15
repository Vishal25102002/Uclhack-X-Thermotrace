"use client"

import React from "react"
import { Button } from "@/components/ui"
import { ZoomIn, ZoomOut, RotateCcw } from "lucide-react"
import { TimeRange } from "@/types/timeline"
import { cn } from "@/lib/utils"

export interface TimelineControlsProps {
  timeRange: TimeRange
  onTimeRangeChange: (range: TimeRange) => void
  onZoomIn: () => void
  onZoomOut: () => void
  onReset: () => void
  canZoomIn: boolean
  canZoomOut: boolean
}

const timeRangeButtons: { label: string; value: TimeRange }[] = [
  { label: "24h", value: "24h" },
  { label: "7d", value: "7d" },
  { label: "30d", value: "30d" },
  { label: "Custom", value: "custom" },
]

export default function TimelineControls({
  timeRange,
  onTimeRangeChange,
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
}: TimelineControlsProps) {
  return (
    <div className="flex items-center gap-2 border-b bg-background p-2">
      {/* Time Range Buttons */}
      <div className="flex items-center gap-1">
        {timeRangeButtons.map(({ label, value }) => (
          <Button
            key={value}
            variant={timeRange === value ? "default" : "outline"}
            size="sm"
            onClick={() => onTimeRangeChange(value)}
            className="h-8 text-xs"
          >
            {label}
          </Button>
        ))}
      </div>

      <div className="h-6 w-px bg-border" />

      {/* Zoom Controls */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomOut}
          disabled={!canZoomOut}
          className="h-8 w-8"
          aria-label="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onZoomIn}
          disabled={!canZoomIn}
          className="h-8 w-8"
          aria-label="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          className="h-8 w-8"
          aria-label="Reset zoom"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

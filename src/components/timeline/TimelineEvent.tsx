import React from "react"
import { cn } from "@/lib/utils"
import { TimelineEvent as TimelineEventType } from "@/types/timeline"
import { colors } from "@/utils/constants/colors"

export interface TimelineEventProps {
  event: TimelineEventType
  position: number // Position in pixels
  isSelected: boolean
  onClick: () => void
}

const getEventColor = (type: TimelineEventType["type"]) => {
  switch (type) {
    case "decision":
      return colors.agentDecision
    case "alert":
      return colors.alert
    case "override":
      return colors.manualOverride
    default:
      return colors.info
  }
}

const getEventShape = (type: TimelineEventType["type"]) => {
  switch (type) {
    case "decision":
      // Circle
      return (
        <circle
          cx="8"
          cy="8"
          r="6"
          fill={getEventColor(type)}
          stroke="white"
          strokeWidth="2"
        />
      )
    case "alert":
      // Triangle
      return (
        <polygon
          points="8,2 14,14 2,14"
          fill={getEventColor(type)}
          stroke="white"
          strokeWidth="2"
        />
      )
    case "override":
      // Square
      return (
        <rect
          x="3"
          y="3"
          width="10"
          height="10"
          fill={getEventColor(type)}
          stroke="white"
          strokeWidth="2"
        />
      )
  }
}

export default function TimelineEvent({
  event,
  position,
  isSelected,
  onClick,
}: TimelineEventProps) {
  return (
    <div
      className="absolute cursor-pointer"
      style={{
        left: `${Math.round(position * 100) / 100}px`,
        top: "50%",
        transform: "translate(-50%, -50%)",
      }}
      onClick={onClick}
    >
      <div
        className={cn(
          "relative transition-all duration-150",
          isSelected && "z-10"
        )}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          className={cn(
            "transition-all duration-150",
            isSelected && "drop-shadow-lg scale-125"
          )}
          style={{
            filter: isSelected ? `drop-shadow(0 0 8px ${getEventColor(event.type)})` : undefined,
          }}
        >
          {getEventShape(event.type)}
        </svg>
      </div>
    </div>
  )
}

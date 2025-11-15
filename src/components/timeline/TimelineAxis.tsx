import React from "react"
import { getHoursInRange } from "@/utils/formatting/time"
import { formatTime, formatDate } from "@/utils/formatting/time"
import { cn } from "@/lib/utils"

export interface TimelineAxisProps {
  startDate: Date
  endDate: Date
  width: number
  height: number
}

export default function TimelineAxis({
  startDate,
  endDate,
  width,
  height = 30,
}: TimelineAxisProps) {
  const hours = getHoursInRange(startDate, endDate)
  const totalMs = endDate.getTime() - startDate.getTime()
  const pixelsPerMs = width / totalMs

  return (
    <div
      className="relative border-t bg-background"
      style={{ height: `${height}px`, width: `${width}px` }}
    >
      {hours.map((hour, index) => {
        const position = (hour.getTime() - startDate.getTime()) * pixelsPerMs
        const isDayBoundary = hour.getHours() === 0
        const roundedPosition = Math.round(position)

        return (
          <div
            key={hour.getTime()}
            className="absolute top-0 flex flex-col items-center"
            style={{ left: `${roundedPosition}px`, transform: "translateX(-50%)" }}
          >
            {isDayBoundary && (
              <div className="absolute -top-5 text-xs text-muted-foreground">
                {formatDate(hour)}
              </div>
            )}
            <div
              className={cn(
                "h-full w-px bg-border",
                isDayBoundary && "bg-foreground/30"
              )}
            />
            <div className="mt-1 text-xs text-muted-foreground">
              {formatTime(hour)}
            </div>
          </div>
        )
      })}
    </div>
  )
}

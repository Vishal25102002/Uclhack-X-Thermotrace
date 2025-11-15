import React from "react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, Badge } from "@/components/ui"
import { TimelineEvent } from "@/types/timeline"
import { formatDateTime } from "@/utils/formatting/time"

export interface TimelineTooltipProps {
  event: TimelineEvent
  children: React.ReactNode
}

export default function TimelineTooltip({ event, children }: TimelineTooltipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side="top" className="max-w-sm p-3">
          <div className="space-y-2.5">
            {/* Timestamp - Most prominent */}
            <div className="text-sm font-bold text-foreground border-b pb-2">
              {formatDateTime(event.timestamp)}
            </div>

            {/* Title */}
            <div className="font-semibold text-base">{event.title}</div>

            {/* Description */}
            {event.description && (
              <div className="text-sm text-muted-foreground">{event.description}</div>
            )}

            {/* Metadata */}
            <div className="flex items-center gap-3 pt-1">
              {event.confidence !== undefined && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-muted-foreground">Confidence:</span>
                  <Badge variant="outline" className="font-semibold">{event.confidence}%</Badge>
                </div>
              )}
              {event.impact && (
                <div className="text-xs text-muted-foreground">
                  {event.impact}
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

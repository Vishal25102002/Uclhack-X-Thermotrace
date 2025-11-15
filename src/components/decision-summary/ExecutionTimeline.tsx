import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Clock } from "lucide-react"

export interface ExecutionTimelineProps {
  decisionId: string
}

export function ExecutionTimeline({ decisionId }: ExecutionTimelineProps) {
  // TODO: Fetch actual execution timeline data
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4" />
          Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <div className="font-medium">Decision:</div>
          <div className="text-muted-foreground">14:23:45</div>
        </div>
        <div>
          <div className="font-medium">Execution:</div>
          <div className="text-muted-foreground">14:23:47</div>
        </div>
        <div>
          <div className="font-medium">Ramp-up:</div>
          <div className="text-muted-foreground">5 minutes</div>
        </div>
        <div>
          <div className="font-medium">Stabilize:</div>
          <div className="text-muted-foreground">14:30:00</div>
        </div>
        <div>
          <div className="font-medium">Duration:</div>
          <div className="text-muted-foreground">45 min</div>
        </div>
      </CardContent>
    </Card>
  )
}

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui"

export interface ActionSummaryProps {
  decisionId: string
}

export function ActionSummary({ decisionId }: ActionSummaryProps) {
  // TODO: Fetch actual action summary data
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">🎯 Action Taken</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="font-semibold">Activated Secondary Chiller (CH2)</div>
        <div className="text-sm text-muted-foreground">
          Parameters:
        </div>
        <ul className="space-y-1 text-sm">
          <li>• Start: Gradual ramp</li>
          <li>• Load: 50% capacity</li>
          <li>• Mode: <Badge variant="outline">AUTO</Badge></li>
        </ul>
      </CardContent>
    </Card>
  )
}

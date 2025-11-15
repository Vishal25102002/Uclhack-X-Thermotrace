import React from "react"
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui"

export interface StatusColumnProps {
  decisionId: string
}

export function StatusColumn({ decisionId }: StatusColumnProps) {
  // TODO: Fetch actual status data
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">✅ Status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div>
          <div className="font-medium">Execution:</div>
          <Badge variant="success" className="mt-1">COMPLETE</Badge>
        </div>
        <div>
          <div className="font-medium">Validation:</div>
          <Badge variant="success" className="mt-1">PASSED</Badge>
        </div>
        <div>
          <div className="font-medium">Match: 98.2%</div>
        </div>
        <div>
          <div className="font-medium">Outcome:</div>
          <Badge variant="success" className="mt-1">SUCCESS</Badge>
        </div>
      </CardContent>
    </Card>
  )
}

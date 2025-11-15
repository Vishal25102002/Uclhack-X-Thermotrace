import React from "react"
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui"
import { CheckCircle2 } from "lucide-react"

export interface SelectedActionProps {
  decisionId: string
}

export function SelectedAction({ decisionId }: SelectedActionProps) {
  // TODO: Fetch and display actual selected action data
  const action = {
    title: "ACTIVATE SECONDARY CHILLER (CH2)",
    parameters: {
      startTime: "14:23:47",
      rampRate: "Gradual (5 min)",
      targetLoad: "50% capacity",
      mode: "AUTO",
    },
  }

  return (
    <Card className="border-[#10B981] bg-[#10B981]/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5" style={{ color: "#10B981" }} />
          Selected Action
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h5 className="text-lg font-bold">{action.title}</h5>
          </div>
          <div>
            <h6 className="mb-2 text-sm font-semibold">Execution Parameters:</h6>
            <ul className="space-y-1 text-sm">
              <li>Start Time: {action.parameters.startTime}</li>
              <li>Ramp Rate: {action.parameters.rampRate}</li>
              <li>Target Load: {action.parameters.targetLoad}</li>
              <li>
                Mode: <Badge variant="outline">{action.parameters.mode}</Badge>
              </li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

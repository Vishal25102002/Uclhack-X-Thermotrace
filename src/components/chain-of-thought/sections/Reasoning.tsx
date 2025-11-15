import React from "react"
import { Card, CardContent, Badge } from "@/components/ui"

export interface ReasoningProps {
  decisionId: string
}

export function Reasoning({ decisionId }: ReasoningProps) {
  // TODO: Fetch and display actual reasoning data
  const reasoning = {
    confidence: 92,
    confidenceLevel: "HIGH",
    explanation: `I selected Action 2 (Activate CH2) for the following reasons:

1. Energy Efficiency: Predicted 12% energy savings, the highest among viable options.

2. Comfort Maintenance: Indoor temperature will return to target within 10 minutes.

3. Risk Mitigation: Low risk compared to other options with medium confidence.

The decision prioritizes energy savings while maintaining comfort levels within acceptable parameters.`,
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <p className="whitespace-pre-line text-sm leading-relaxed">
            {reasoning.explanation}
          </p>
        </CardContent>
      </Card>
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium">Confidence:</span>
        <Badge variant="success">
          {reasoning.confidence}% ({reasoning.confidenceLevel})
        </Badge>
      </div>
    </div>
  )
}

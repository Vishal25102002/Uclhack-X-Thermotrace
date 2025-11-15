import React from "react"
import { Card, CardContent, CardHeader, CardTitle, Badge } from "@/components/ui"
import { Check } from "lucide-react"

export interface ImpactMetricsProps {
  decisionId: string
}

export function ImpactMetrics({ decisionId }: ImpactMetricsProps) {
  // TODO: Fetch actual impact metrics data
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">📊 Impact</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Energy: -12.1%</span>
            <Check className="h-4 w-4" style={{ color: "#10B981" }} />
          </div>
          <div className="text-muted-foreground">
            (Est: -12%, Δ: -0.1%)
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Comfort: MAINTAINED</span>
            <Check className="h-4 w-4" style={{ color: "#10B981" }} />
          </div>
          <div className="text-muted-foreground">
            Temp: 22.4°C (target: 22°C)
          </div>
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Efficiency: +8%</span>
            <Check className="h-4 w-4" style={{ color: "#10B981" }} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

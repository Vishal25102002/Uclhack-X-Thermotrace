import React from "react"
import { Card, CardContent } from "@/components/ui"
import { getTemperatureColor } from "@/utils/constants/colors"
import { cn } from "@/lib/utils"

export interface SystemDiagramProps {
  decisionId: string
}

export function SystemDiagram({ decisionId }: SystemDiagramProps) {
  // TODO: Fetch actual system state data
  // Placeholder visualization
  const equipment = [
    { id: "ch1", name: "Chiller 1", temp: 12, status: "active" },
    { id: "ch2", name: "Chiller 2", temp: 15, status: "active" },
    { id: "pump1", name: "Pump 1", temp: 20, status: "active" },
    { id: "tower1", name: "Cooling Tower 1", temp: 30, status: "active" },
  ]

  return (
    <div className="rounded-lg border bg-background p-6">
      <div className="grid grid-cols-2 gap-4">
        {equipment.map((item) => {
          const tempColor = getTemperatureColor(item.temp)
          return (
            <Card key={item.id} className="relative overflow-hidden">
              <CardContent className="p-4">
                <div className="mb-2 font-semibold">{item.name}</div>
                <div
                  className={cn(
                    "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                    item.status === "active" ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                  )}
                >
                  {item.status.toUpperCase()}
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: tempColor }}
                  />
                  <span className="text-sm">{item.temp}°C</span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

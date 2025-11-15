import React from "react"
import { Card, CardContent, CardDescription } from "@/components/ui"

export interface ConsideredActionsProps {
  decisionId: string
}

export function ConsideredActions({ decisionId }: ConsideredActionsProps) {
  // TODO: Fetch and display actual considered actions data
  const actions = [
    {
      number: 1,
      title: "Increase chiller setpoint by 2°C",
      description: "Reduce energy consumption, slight temperature increase",
    },
    {
      number: 2,
      title: "Activate secondary chiller (CH2)",
      description: "Higher capacity, more energy consumption",
    },
    {
      number: 3,
      title: "Optimize condenser water flow",
      description: "Improve efficiency, minimal risk",
    },
  ]

  return (
    <div className="space-y-3">
      {actions.map((action) => (
        <Card key={action.number}>
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                {action.number}
              </div>
              <div className="flex-1">
                <h5 className="font-medium">{action.title}</h5>
                <CardDescription className="mt-1">
                  → {action.description}
                </CardDescription>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle, ScrollArea, Separator } from "@/components/ui"
import { SystemDiagram } from "./SystemDiagram"
import { PredictionComparison } from "./PredictionComparison"
import { ValidationStatusCard } from "./ValidationStatusCard"

export interface DigitalTwinPanelProps {
  decisionId: string
}

export default function DigitalTwinPanel({ decisionId }: DigitalTwinPanelProps) {
  // TODO: Fetch decision validation data using decisionId

  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>Digital Twin Validation</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 space-y-4 overflow-hidden p-0">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            {/* Validation Status Card */}
            <ValidationStatusCard decisionId={decisionId} />

            <Separator />

            {/* System Diagram */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">System Diagram</h3>
              <SystemDiagram decisionId={decisionId} />
            </div>

            <Separator />

            {/* Prediction Comparison */}
            <div>
              <h3 className="mb-4 text-lg font-semibold">Prediction vs Reality</h3>
              <PredictionComparison decisionId={decisionId} />
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

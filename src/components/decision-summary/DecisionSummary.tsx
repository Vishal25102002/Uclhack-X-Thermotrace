import React from "react"
import { ActionSummary } from "./ActionSummary"
import { ExecutionTimeline } from "./ExecutionTimeline"
import { ImpactMetrics } from "./ImpactMetrics"
import { StatusColumn } from "./StatusColumn"

export interface DecisionSummaryProps {
  decisionId: string
}

export default function DecisionSummary({ decisionId }: DecisionSummaryProps) {
  return (
    <div className="grid grid-cols-12 gap-4">
      {/* Column 1: Action Summary (30%) */}
      <div className="col-span-12 md:col-span-4">
        <ActionSummary decisionId={decisionId} />
      </div>

      {/* Column 2: Execution Timeline (25%) */}
      <div className="col-span-12 md:col-span-3">
        <ExecutionTimeline decisionId={decisionId} />
      </div>

      {/* Column 3: Impact Metrics (25%) */}
      <div className="col-span-12 md:col-span-3">
        <ImpactMetrics decisionId={decisionId} />
      </div>

      {/* Column 4: Status (20%) */}
      <div className="col-span-12 md:col-span-2">
        <StatusColumn decisionId={decisionId} />
      </div>
    </div>
  )
}

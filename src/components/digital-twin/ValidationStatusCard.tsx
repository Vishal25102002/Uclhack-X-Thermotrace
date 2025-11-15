import React from "react"
import { Card, CardContent } from "@/components/ui"
import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ValidationStatusCardProps {
  decisionId: string
}

type ValidationStatus = "validated" | "partial" | "mismatch"

export function ValidationStatusCard({
  decisionId,
}: ValidationStatusCardProps) {
  // TODO: Fetch actual validation status
  const status: ValidationStatus = "validated"
  const accuracy = 98.2

  const statusConfig = {
    validated: {
      icon: CheckCircle2,
      label: "VALIDATED",
      bgColor: "bg-[#10B981]",
      textColor: "text-white",
      message: "All metrics within acceptable range",
    },
    partial: {
      icon: AlertTriangle,
      label: "PARTIAL MATCH",
      bgColor: "bg-[#F59E0B]",
      textColor: "text-white",
      message: "Some deviations detected",
    },
    mismatch: {
      icon: XCircle,
      label: "MISMATCH",
      bgColor: "bg-[#EF4444]",
      textColor: "text-white",
      message: "Model requires review",
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon

  return (
    <Card className={cn(config.bgColor, config.textColor)}>
      <CardContent className="flex items-center justify-between p-6">
        <div className="flex items-center gap-4">
          <Icon className="h-12 w-12" />
          <div>
            <div className="text-2xl font-bold">{config.label}</div>
            <div className="mt-1 text-sm opacity-90">
              Prediction accuracy: {accuracy}%
            </div>
            <div className="mt-1 text-sm opacity-80">{config.message}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

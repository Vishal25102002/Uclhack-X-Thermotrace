import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui"
import { Check, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface PredictionComparisonProps {
  decisionId: string
}

interface ComparisonRow {
  metric: string
  predicted: string
  actual: string
  difference: string
  status: "pass" | "warning" | "fail"
}

export function PredictionComparison({
  decisionId,
}: PredictionComparisonProps) {
  // TODO: Fetch actual comparison data
  const comparison: ComparisonRow[] = [
    {
      metric: "Energy (kW)",
      predicted: "110",
      actual: "108.5",
      difference: "-1.4%",
      status: "pass",
    },
    {
      metric: "Temp Zone 1 (°C)",
      predicted: "22.3",
      actual: "22.4",
      difference: "+0.1°C",
      status: "pass",
    },
    {
      metric: "COP",
      predicted: "0.82",
      actual: "0.84",
      difference: "+2.4%",
      status: "pass",
    },
  ]

  const getStatusIcon = (status: ComparisonRow["status"]) => {
    switch (status) {
      case "pass":
        return <Check className="h-4 w-4" style={{ color: "#10B981" }} />
      case "warning":
        return <AlertTriangle className="h-4 w-4" style={{ color: "#F59E0B" }} />
      case "fail":
        return <X className="h-4 w-4" style={{ color: "#EF4444" }} />
    }
  }

  const getRowClassName = (status: ComparisonRow["status"]) => {
    switch (status) {
      case "pass":
        return "bg-[#10B981]/10"
      case "warning":
        return "bg-[#F59E0B]/10"
      case "fail":
        return "bg-[#EF4444]/10"
    }
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Metric</TableHead>
            <TableHead>Predicted</TableHead>
            <TableHead>Actual</TableHead>
            <TableHead>Δ</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comparison.map((row) => (
            <TableRow key={row.metric} className={cn(getRowClassName(row.status))}>
              <TableCell className="font-medium">{row.metric}</TableCell>
              <TableCell>{row.predicted}</TableCell>
              <TableCell>{row.actual}</TableCell>
              <TableCell>{row.difference}</TableCell>
              <TableCell>{getStatusIcon(row.status)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <div className="rounded-md bg-[#10B981]/10 p-3 text-sm" style={{ color: "#10B981" }}>
        <span className="font-semibold">Overall Match: 98.2%</span>{" "}
        <span>✓ VALIDATED</span>
      </div>
    </div>
  )
}

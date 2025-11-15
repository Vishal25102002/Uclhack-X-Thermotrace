import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@/components/ui"
import { Check } from "lucide-react"

export interface SimulatedOutcomesProps {
  decisionId: string
}

export function SimulatedOutcomes({ decisionId }: SimulatedOutcomesProps) {
  // TODO: Fetch and display actual simulated outcomes data
  const outcomes = [
    {
      action: "Increase chiller setpoint by 2°C",
      energy: { current: "125 kW", predicted: "115 kW", change: "-8%" },
      temperature: { current: "23.1°C", predicted: "23.8°C", change: "+0.7°C" },
      risk: "LOW",
      confidence: 78,
      selected: false,
    },
    {
      action: "Activate secondary chiller (CH2)",
      energy: { current: "125 kW", predicted: "110 kW", change: "-12%" },
      temperature: { current: "23.1°C", predicted: "22.3°C", change: "-0.8°C" },
      risk: "LOW",
      confidence: 92,
      selected: true,
    },
    {
      action: "Optimize condenser water flow",
      energy: { current: "125 kW", predicted: "120 kW", change: "-4%" },
      temperature: { current: "23.1°C", predicted: "22.9°C", change: "-0.2°C" },
      risk: "MEDIUM",
      confidence: 65,
      selected: false,
    },
  ]

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Energy</TableHead>
            <TableHead>Temperature</TableHead>
            <TableHead>Risk</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {outcomes.map((outcome, index) => (
            <TableRow key={index} className={outcome.selected ? "bg-muted/50" : ""}>
              <TableCell className="font-medium">{outcome.action}</TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{outcome.energy.predicted}</div>
                  <div className="text-muted-foreground">
                    {outcome.energy.change}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{outcome.temperature.predicted}</div>
                  <div className="text-muted-foreground">
                    {outcome.temperature.change}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    outcome.risk === "LOW"
                      ? "success"
                      : outcome.risk === "MEDIUM"
                        ? "warning"
                        : "error"
                  }
                >
                  {outcome.risk}
                </Badge>
              </TableCell>
              <TableCell>{outcome.confidence}%</TableCell>
              <TableCell>
                {outcome.selected && (
                  <Check className="h-4 w-4 text-success" />
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

import React from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge } from "@/components/ui"

export interface PerceivedStateProps {
  decisionId: string
}

export function PerceivedState({ decisionId }: PerceivedStateProps) {
  // TODO: Fetch and display actual perceived state data
  // Placeholder data structure
  const environmentData = [
    { label: "Outdoor Temp", value: "32.5°C", status: "normal" },
    { label: "Indoor Target", value: "22.0°C", status: "normal" },
    { label: "Indoor Actual", value: "23.1°C", status: "warning" },
    { label: "Humidity", value: "65%", status: "normal" },
  ]

  const systemData = [
    { label: "Cooling Load", value: "85%", status: "warning" },
    { label: "Chiller 1 COP", value: "0.78", status: "warning" },
    { label: "Chiller 2", value: "STANDBY", status: "normal" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h4 className="mb-3 text-sm font-semibold">Environment</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {environmentData.map((item) => (
              <TableRow key={item.label}>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "normal"
                        ? "success"
                        : item.status === "warning"
                          ? "warning"
                          : "error"
                    }
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div>
        <h4 className="mb-3 text-sm font-semibold">System</h4>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Metric</TableHead>
              <TableHead>Value</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {systemData.map((item) => (
              <TableRow key={item.label}>
                <TableCell className="font-medium">{item.label}</TableCell>
                <TableCell>{item.value}</TableCell>
                <TableCell>
                  <Badge
                    variant={
                      item.status === "normal"
                        ? "success"
                        : item.status === "warning"
                          ? "warning"
                          : "error"
                    }
                  >
                    {item.status.toUpperCase()}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui"
import { Badge, StatusBadge } from "@/components/ui"
import { loadAgentTraceData } from "@/utils/loadTraceData"

export interface DecisionSummaryProps {
  timestepIndex: number
}

export default function DecisionSummary({ timestepIndex }: DecisionSummaryProps) {
  // Load data directly from JSON
  const traceData = loadAgentTraceData(timestepIndex)

  const data = traceData.timestep_data
  const decision = traceData.control_decision
  const { violations, anomalies } = traceData.validation
  const efficiency = traceData.efficiency.actual
  const predictedEfficiency = traceData.efficiency.predicted
  const predictions = traceData.physics_predictions
  const totalPredictedPower = traceData.physics_predictions.totalPredictedPower

  const timestamp = new Date(data.datetime).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })

  // Mock reasoning - in production this would come from agent traces
  const reasoning = `Load at ${data.plant.cooling.toFixed(0)} tons. CH1 at ${data.chiller1.rla.toFixed(1)}% RLA. ${violations.length > 0 ? violations[0] : anomalies.length > 0 ? anomalies[0] : 'All systems operating within normal parameters.'
    }`

  // Determine validation status based on violations and anomalies
  // Violations (physical constraints) = critical (red)
  // Anomalies (efficiency worse) = warning (yellow/orange)
  // No issues = normal (green)
  const validationStatus = violations.length > 0 ? "critical" : anomalies.length > 0 ? "warning" : "normal"

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Left: Control Decision */}
      <Card className="shadow-md">
        <CardHeader className="pb-3 px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground tabular-nums">
              <CardTitle className="text-lg font-semibold">Control Decision</CardTitle>
              <span>{timestamp}</span>
              <span className="text-gray-400">•</span>
              <span>{data.plant.cooling.toFixed(0)} tons</span>
              <span className="text-gray-400">•</span>
              <span>{data.environment.drybulb.toFixed(0)}°F</span>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-6">
          {/* Historical Trend Chart */}
          <div>
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {(() => {
                // Use data from JSON
                const chartData = traceData.historical_chart_data
                const forecastData = traceData.forecast_data

                // Fixed scales for consistent visualization
                const minCooling = 0
                const maxCooling = 1000 // Fixed at 1000 tons
                const minEfficiency = 0.6 // Fixed range for efficiency
                const maxEfficiency = 0.8
                const maxTimestep = 96 // Full 24-hour day (96 x 15min intervals)

                // Chart dimensions
                const width = 600
                const height = 200
                const margin = { top: 10, right: 60, bottom: 30, left: 60 }
                const chartWidth = width - margin.left - margin.right
                const chartHeight = height - margin.top - margin.bottom

                // Scale functions with fixed ranges
                const xScale = (timestep: number) => margin.left + (timestep / maxTimestep) * chartWidth
                const yScaleCooling = (cooling: number) => {
                  const range = maxCooling - minCooling
                  return margin.top + chartHeight - ((cooling - minCooling) / range) * chartHeight
                }
                const yScaleEfficiency = (efficiency: number) => {
                  const range = maxEfficiency - minEfficiency
                  return margin.top + chartHeight - ((efficiency - minEfficiency) / range) * chartHeight
                }

                // Generate path strings
                const coolingPath = chartData.map((d, i) =>
                  `${i === 0 ? 'M' : 'L'} ${xScale(d.timestep)} ${yScaleCooling(d.cooling)}`
                ).join(' ')

                const efficiencyPath = chartData.map((d, i) =>
                  `${i === 0 ? 'M' : 'L'} ${xScale(d.timestep)} ${yScaleEfficiency(d.efficiency)}`
                ).join(' ')

                // Forecast path (starts from current point)
                const forecastPath = forecastData.length > 0
                  ? 'M ' + xScale(timestepIndex) + ' ' + yScaleCooling(data.plant.cooling) + ' ' +
                    forecastData.map((d) =>
                      `L ${xScale(d.timestep)} ${yScaleCooling(d.cooling)}`
                    ).join(' ')
                  : ''

                return (
                  <svg viewBox={`0 0 ${width} ${height}`} className="w-full">
                    {/* Vertical and horizontal axis lines */}
                    <line x1={margin.left} y1={margin.top} x2={margin.left} y2={height - margin.bottom} stroke="#D1D5DB" strokeWidth="1" />
                    <line x1={margin.left} y1={height - margin.bottom} x2={width - margin.right} y2={height - margin.bottom} stroke="#D1D5DB" strokeWidth="1" />

                    {/* Horizontal grid lines for Y-axis (Cooling Load) */}
                    {[0, 200, 400, 600, 800, 1000].map((value) => {
                      const y = yScaleCooling(value)
                      return (
                        <line
                          key={`grid-cooling-${value}`}
                          x1={margin.left}
                          y1={y}
                          x2={width - margin.right}
                          y2={y}
                          stroke="#F3F4F6"
                          strokeWidth="1"
                        />
                      )
                    })}

                    {/* Cooling load line (blue) */}
                    <path d={coolingPath} fill="none" stroke="#2563EB" strokeWidth="2" />

                    {/* Forecast line (dashed blue) */}
                    {forecastPath && (
                      <path
                        d={forecastPath}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="2"
                        strokeDasharray="6,4"
                        opacity="0.6"
                      />
                    )}

                    {/* Efficiency line (emerald) */}
                    <path d={efficiencyPath} fill="none" stroke="#10B981" strokeWidth="2" strokeDasharray="4,2" />

                    {/* Current point markers */}
                    <circle
                      cx={xScale(timestepIndex)}
                      cy={yScaleCooling(data.plant.cooling)}
                      r="4"
                      fill="#2563EB"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle
                      cx={xScale(timestepIndex)}
                      cy={yScaleEfficiency(efficiency)}
                      r="4"
                      fill="#10B981"
                      stroke="white"
                      strokeWidth="2"
                    />

                    {/* Y-axis labels - Left (Cooling) with grid values */}
                    {[0, 200, 400, 600, 800, 1000].map((value) => {
                      const y = yScaleCooling(value)
                      return (
                        <text
                          key={`label-cooling-${value}`}
                          x={margin.left - 5}
                          y={y + 4}
                          fontSize="9"
                          fill="#6B7280"
                          textAnchor="end"
                          fontWeight="500"
                        >
                          {value}
                        </text>
                      )
                    })}
                    <text x={margin.left - 35} y={height / 2} fontSize="11" fill="#2563EB" textAnchor="middle" transform={`rotate(-90 ${margin.left - 35} ${height / 2})`} fontWeight="600">
                      Cooling (tons)
                    </text>

                    {/* Y-axis labels - Right (Efficiency) with guide values */}
                    {[0.6, 0.65, 0.7, 0.75, 0.8].map((value) => {
                      const y = yScaleEfficiency(value)
                      return (
                        <text
                          key={`label-eff-${value}`}
                          x={width - margin.right + 5}
                          y={y + 4}
                          fontSize="9"
                          fill="#6B7280"
                          textAnchor="start"
                          fontWeight="500"
                        >
                          {value.toFixed(2)}
                        </text>
                      )
                    })}
                    <text x={width - margin.right + 40} y={height / 2} fontSize="11" fill="#10B981" textAnchor="middle" transform={`rotate(90 ${width - margin.right + 40} ${height / 2})`} fontWeight="600">
                      Eff (kW/ton)
                    </text>

                    {/* X-axis labels - Time format */}
                    {['00:00', '06:00', '12:00', '18:00', '24:00'].map((time, idx) => {
                      const hour = parseInt(time.split(':')[0])
                      const timestep = (hour / 24) * 96
                      const x = xScale(timestep)
                      return (
                        <text
                          key={`time-${time}`}
                          x={x}
                          y={height - margin.bottom + 15}
                          fontSize="9"
                          fill="#6B7280"
                          textAnchor="middle"
                          fontWeight="500"
                        >
                          {time}
                        </text>
                      )
                    })}

                    {/* Legend */}
                    <g transform={`translate(${width / 2 - 120}, ${margin.top + 5})`}>
                      <line x1="0" y1="0" x2="20" y2="0" stroke="#2563EB" strokeWidth="2" />
                      <text x="25" y="4" fontSize="10" fill="#666">Cooling Load</text>

                      <line x1="110" y1="0" x2="130" y2="0" stroke="#2563EB" strokeWidth="2" strokeDasharray="6,4" opacity="0.6" />
                      <text x="135" y="4" fontSize="10" fill="#666">Forecast (12h)</text>

                      <line x1="245" y1="0" x2="265" y2="0" stroke="#10B981" strokeWidth="2" strokeDasharray="4,2" />
                      <text x="270" y="4" fontSize="10" fill="#666">Efficiency</text>
                    </g>
                  </svg>
                )
              })()}
            </div>
          </div>

          {/* Chiller Staging & Current State */}
          <div>
            <div className="text-base font-semibold mb-3">Chiller Staging</div>
            <div className="grid grid-cols-3 gap-2">
              {/* CH1 */}
              <div className={`rounded-lg p-2.5 shadow-sm relative ${decision.staging.chiller1.current === 'ON' ? 'bg-emerald-50' : 'bg-gray-50'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-semibold text-gray-900">CH1</div>
                  {(decision.staging.chiller1.previous !== decision.staging.chiller1.current ||
                    (decision.setpoints.chiller1.current !== null && decision.setpoints.chiller1.current !== decision.setpoints.chiller1.previous)) && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-blue-600 text-white">
                      CHANGED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm tabular-nums mb-2">
                  {decision.staging.chiller1.previous !== decision.staging.chiller1.current ? (
                    <>
                      <span className="text-gray-400">{decision.staging.chiller1.previous}</span>
                      <span className="text-gray-400">→</span>
                      <span className={decision.staging.chiller1.current === "ON" ? "text-emerald-600 font-semibold" : "text-gray-400"}>
                        {decision.staging.chiller1.current}
                      </span>
                    </>
                  ) : (
                    <span className={decision.staging.chiller1.current === "ON" ? "text-emerald-600 font-semibold" : "text-gray-400"}>
                      {decision.staging.chiller1.current}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">RLA</span>
                    <span className={`tabular-nums font-medium ${
                      data.chiller1.rla >= 95 ? 'text-red-600' :
                      data.chiller1.rla > 90 ? 'text-orange-600' : ''
                    }`}>
                      {data.chiller1.rla.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Power</span>
                    <span className="tabular-nums">{data.chiller1.power.toFixed(0)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Setpoint</span>
                    <span className="tabular-nums">
                      {decision.setpoints.chiller1.current !== null &&
                        decision.setpoints.chiller1.current !== decision.setpoints.chiller1.previous ? (
                        <span className="text-emerald-600 font-medium">
                          {decision.setpoints.chiller1.previous?.toFixed(0) || '--'}°F → {decision.setpoints.chiller1.current.toFixed(0)}°F
                        </span>
                      ) : (
                        <span>{decision.setpoints.chiller1.current?.toFixed(0) || '--'}°F</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cond</span>
                    <span className="tabular-nums">{data.chiller1.condTemp.toFixed(1)}°F</span>
                  </div>
                </div>
              </div>

              {/* CH2 */}
              <div className={`rounded-lg p-2.5 shadow-sm relative ${decision.staging.chiller2.current === 'ON' ? 'bg-emerald-50' : 'bg-gray-50'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-semibold text-gray-900">CH2</div>
                  {(decision.staging.chiller2.previous !== decision.staging.chiller2.current ||
                    (decision.setpoints.chiller2?.current !== null && decision.setpoints.chiller2?.current !== decision.setpoints.chiller2?.previous)) && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-blue-600 text-white">
                      CHANGED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm tabular-nums mb-2">
                  {decision.staging.chiller2.previous !== decision.staging.chiller2.current ? (
                    <>
                      <span className="text-gray-400">{decision.staging.chiller2.previous}</span>
                      <span className="text-gray-400">→</span>
                      <span className={decision.staging.chiller2.current === "ON" ? "text-emerald-600 font-semibold" : "text-gray-400"}>
                        {decision.staging.chiller2.current}
                      </span>
                    </>
                  ) : (
                    <span className={decision.staging.chiller2.current === "ON" ? "text-emerald-600 font-semibold" : "text-gray-400"}>
                      {decision.staging.chiller2.current}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">RLA</span>
                    <span className={`tabular-nums font-medium ${
                      data.chiller2.rla >= 95 ? 'text-red-600' :
                      data.chiller2.rla > 90 ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {data.chiller2.rla.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Power</span>
                    <span className="tabular-nums text-gray-400">{data.chiller2.power.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Setpoint</span>
                    <span className="tabular-nums text-gray-400">
                      {decision.setpoints.chiller2?.current !== null &&
                        decision.setpoints.chiller2?.current !== decision.setpoints.chiller2?.previous ? (
                        <span className="text-emerald-600 font-medium">
                          {decision.setpoints.chiller2.previous?.toFixed(0) || '--'}°F → {decision.setpoints.chiller2.current.toFixed(0)}°F
                        </span>
                      ) : (
                        <span>{decision.setpoints.chiller2?.current?.toFixed(0) || '--'}°F</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cond</span>
                    <span className="tabular-nums text-gray-400">{data.chiller2.condTemp.toFixed(1)}°F</span>
                  </div>
                </div>
              </div>

              {/* CH3 */}
              <div className={`rounded-lg p-2.5 shadow-sm relative ${decision.staging.chiller3.current === 'ON' ? 'bg-emerald-50' : 'bg-gray-50'
                }`}>
                <div className="flex items-center justify-between mb-1">
                  <div className="text-sm font-semibold text-gray-900">CH3</div>
                  {(decision.staging.chiller3.previous !== decision.staging.chiller3.current ||
                    (decision.setpoints.chiller3.current !== null && decision.setpoints.chiller3.current !== decision.setpoints.chiller3.previous)) && (
                    <span className="px-1.5 py-0.5 text-xs font-semibold rounded bg-blue-600 text-white">
                      CHANGED
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-sm tabular-nums mb-2">
                  {decision.staging.chiller3.previous !== decision.staging.chiller3.current ? (
                    <>
                      <span className="text-gray-400">{decision.staging.chiller3.previous}</span>
                      <span className="text-gray-400">→</span>
                      <span className={decision.staging.chiller3.current === "ON" ? "text-emerald-600 font-semibold" : "text-gray-400"}>
                        {decision.staging.chiller3.current}
                      </span>
                    </>
                  ) : (
                    <span className={decision.staging.chiller3.current === "ON" ? "text-emerald-600 font-semibold" : "text-gray-400"}>
                      {decision.staging.chiller3.current}
                    </span>
                  )}
                </div>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">RLA</span>
                    <span className={`tabular-nums font-medium ${
                      data.chiller3.rla >= 95 ? 'text-red-600' :
                      data.chiller3.rla > 90 ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      {data.chiller3.rla.toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Power</span>
                    <span className="tabular-nums text-gray-400">{data.chiller3.power.toFixed(1)} kW</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Setpoint</span>
                    <span className="tabular-nums text-gray-400">
                      {decision.setpoints.chiller3.current !== null &&
                        decision.setpoints.chiller3.current !== decision.setpoints.chiller3.previous ? (
                        <span className="text-emerald-600 font-medium">
                          {decision.setpoints.chiller3.previous?.toFixed(0) || '--'}°F → {decision.setpoints.chiller3.current.toFixed(0)}°F
                        </span>
                      ) : (
                        <span>{decision.setpoints.chiller3.current?.toFixed(0) || '--'}°F</span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Cond</span>
                    <span className="tabular-nums text-gray-400">{data.chiller3.condTemp.toFixed(1)}°F</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Plant Totals & Outdoor Conditions */}
          <div>
            <div className="space-y-2">
              <div className="rounded-lg p-2.5 shadow-sm bg-slate-50">
                <div className="font-semibold text-sm mb-2">Plant Totals</div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Cooling</span>
                  <span className="tabular-nums">{data.plant.cooling.toFixed(0)} tons</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Power</span>
                  <span className="tabular-nums">{data.plant.power.toFixed(0)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Actual Eff</span>
                  <span className="tabular-nums font-medium text-blue-600">{efficiency.toFixed(2)} kW/ton</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Supply</span>
                  <span className="tabular-nums">{data.plant.supplyTemp.toFixed(1)}°F</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg p-2.5 shadow-sm bg-slate-50">
              <div className="font-semibold text-sm mb-2">Outdoor Conditions</div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Drybulb</span>
                <span className="tabular-nums">{data.environment.drybulb.toFixed(1)}°F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Humidity</span>
                <span className="tabular-nums">{data.environment.humidity.toFixed(0)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Wetbulb</span>
                <span className="tabular-nums">{data.environment.wetbulb.toFixed(1)}°F</span>
              </div>
            </div>
          </div>
        </div>
    </div>
        </CardContent >
    </Card >

    {/* Right: Physics Validation */ }
    < Card className = "shadow-md" >
    <CardHeader className="pb-3 px-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-semibold">Physics Validation</CardTitle>
          <StatusBadge status={validationStatus}>
            {validationStatus === 'critical' ? 'Violation' : validationStatus === 'warning' ? 'Anomaly' : 'Passed'}
          </StatusBadge>
          <span className="text-sm text-muted-foreground">
            {violations.length > 0 && `${violations.length} violation${violations.length !== 1 ? 's' : ''}`}
            {violations.length > 0 && anomalies.length > 0 && ' • '}
            {anomalies.length > 0 && `${anomalies.length} anomal${anomalies.length !== 1 ? 'ies' : 'y'}`}
            {violations.length === 0 && anomalies.length === 0 && 'All checks passed'}
          </span>
        </div>
      </div>
    </CardHeader>
    <CardContent className="space-y-3 px-6">
      {/* All Chillers Detail */}
      <div>
        <div className="text-base font-semibold mb-3">All Chillers Detail</div>
        <div className="space-y-2">
          {/* Chiller 1 */}
          <div className="rounded-lg p-2.5 shadow-sm bg-gray-50">
            <div className="font-semibold text-sm mb-2">
              CH1 • <span className={decision.staging.chiller1.current === 'ON' ? 'text-emerald-600' : 'text-gray-400'}>{decision.staging.chiller1.current}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Left column - Data */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">RLA</span>
                  <span className={`tabular-nums font-medium ${
                    data.chiller1.rla >= 95 ? 'text-red-600' :
                    data.chiller1.rla > 90 ? 'text-orange-600' :
                    data.chiller1.rla > 0 ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {data.chiller1.rla.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Power</span>
                  <span className="tabular-nums">{data.chiller1.power.toFixed(0)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Evap</span>
                  <span className="tabular-nums">{data.chiller1.evapTemp?.toFixed(1) || '--'}°F</span>
                </div>
                {predictions.chiller1 !== null && (
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-500">Predicted Plant</span>
                    <span className="tabular-nums text-blue-600 font-medium">{predictions.chiller1.toFixed(0)} kW</span>
                  </div>
                )}
              </div>

              {/* Right column - Chart */}
              {predictions.chiller1 !== null && (
                <div className="flex flex-col justify-center">
                  <svg viewBox="0 0 120 120" className="w-full h-36">
                    {/* Background */}
                    <rect x="8" y="8" width="104" height="104" fill="#FAFAFA" stroke="#E5E5E5" strokeWidth="0.5" rx="2" />

                    {/* Grid lines */}
                    <line x1="10" y1="10" x2="10" y2="110" stroke="#D1D5DB" strokeWidth="1" />
                    <line x1="10" y1="110" x2="110" y2="110" stroke="#D1D5DB" strokeWidth="1" />

                    {/* Perfect fit line (y=x diagonal) */}
                    <line x1="10" y1="110" x2="110" y2="10" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="3,2" />

                    {/* Actual data point */}
                    {(() => {
                      const maxVal = Math.max(data.plant.power, predictions.chiller1)
                      const xPos = 10 + ((data.plant.power / maxVal) * 100)
                      const yPos = 110 - ((predictions.chiller1 / maxVal) * 100)
                      return (
                        <>
                          <circle cx={xPos} cy={yPos} r="5" fill="#2E86AB" opacity="0.2" />
                          <circle cx={xPos} cy={yPos} r="3.5" fill="#2E86AB" opacity="0.9" />
                        </>
                      )
                    })()}

                    {/* Axes labels */}
                    <text x="60" y="118" fontSize="7" fill="#6B7280" textAnchor="middle" fontWeight="500">Actual (kW)</text>
                    <text x="4" y="60" fontSize="7" fill="#6B7280" textAnchor="middle" fontWeight="500" transform="rotate(-90 4 60)">Predicted (kW)</text>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Chiller 2 */}
          <div className="rounded-lg p-2.5 shadow-sm bg-gray-50">
            <div className="font-semibold text-sm mb-2">
              CH2 • <span className={decision.staging.chiller2.current === 'ON' ? 'text-emerald-600' : 'text-gray-400'}>{decision.staging.chiller2.current}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Left column - Data */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">RLA</span>
                  <span className={`tabular-nums font-medium ${
                    data.chiller2.rla >= 95 ? 'text-red-600' :
                    data.chiller2.rla > 90 ? 'text-orange-600' :
                    data.chiller2.rla > 0 ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {data.chiller2.rla.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Power</span>
                  <span className="tabular-nums">{data.chiller2.power.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Evap</span>
                  <span className="tabular-nums">{data.chiller2.evapTemp?.toFixed(1) || '--'}°F</span>
                </div>
                {predictions.chiller2 !== null && (
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-500">Predicted Plant</span>
                    <span className="tabular-nums text-blue-600 font-medium">{predictions.chiller2.toFixed(0)} kW</span>
                  </div>
                )}
              </div>

              {/* Right column - Chart */}
              {predictions.chiller2 !== null && (
                <div className="flex flex-col justify-center">
                  <svg viewBox="0 0 120 120" className="w-full h-36">
                    {/* Background */}
                    <rect x="8" y="8" width="104" height="104" fill="#FAFAFA" stroke="#E5E5E5" strokeWidth="0.5" rx="2" />

                    {/* Grid lines */}
                    <line x1="10" y1="10" x2="10" y2="110" stroke="#D1D5DB" strokeWidth="1" />
                    <line x1="10" y1="110" x2="110" y2="110" stroke="#D1D5DB" strokeWidth="1" />

                    {/* Perfect fit line (y=x diagonal) */}
                    <line x1="10" y1="110" x2="110" y2="10" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="3,2" />

                    {/* Actual data point */}
                    {(() => {
                      const maxVal = Math.max(data.plant.power, predictions.chiller2)
                      const xPos = 10 + ((data.plant.power / maxVal) * 100)
                      const yPos = 110 - ((predictions.chiller2 / maxVal) * 100)
                      return (
                        <>
                          <circle cx={xPos} cy={yPos} r="5" fill="#A23B72" opacity="0.2" />
                          <circle cx={xPos} cy={yPos} r="3.5" fill="#A23B72" opacity="0.9" />
                        </>
                      )
                    })()}

                    {/* Axes labels */}
                    <text x="60" y="118" fontSize="7" fill="#6B7280" textAnchor="middle" fontWeight="500">Actual (kW)</text>
                    <text x="4" y="60" fontSize="7" fill="#6B7280" textAnchor="middle" fontWeight="500" transform="rotate(-90 4 60)">Predicted (kW)</text>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Chiller 3 */}
          <div className="rounded-lg p-2.5 shadow-sm bg-gray-50">
            <div className="font-semibold text-sm mb-2">
              CH3 • <span className={decision.staging.chiller3.current === 'ON' ? 'text-emerald-600' : 'text-gray-400'}>{decision.staging.chiller3.current}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {/* Left column - Data */}
              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">RLA</span>
                  <span className={`tabular-nums font-medium ${
                    data.chiller3.rla >= 95 ? 'text-red-600' :
                    data.chiller3.rla > 90 ? 'text-orange-600' :
                    data.chiller3.rla > 0 ? 'text-emerald-600' : 'text-gray-400'
                  }`}>
                    {data.chiller3.rla.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Power</span>
                  <span className="tabular-nums">{data.chiller3.power.toFixed(1)} kW</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Evap</span>
                  <span className="tabular-nums">{data.chiller3.evapTemp?.toFixed(1) || '--'}°F</span>
                </div>
                {predictions.chiller3 !== null && (
                  <div className="flex justify-between pt-1 border-t border-gray-200">
                    <span className="text-gray-500">Predicted Plant</span>
                    <span className="tabular-nums text-blue-600 font-medium">{predictions.chiller3.toFixed(0)} kW</span>
                  </div>
                )}
              </div>

              {/* Right column - Chart */}
              {predictions.chiller3 !== null && (
                <div className="flex flex-col justify-center">
                  <svg viewBox="0 0 120 120" className="w-full h-36">
                    {/* Background */}
                    <rect x="8" y="8" width="104" height="104" fill="#FAFAFA" stroke="#E5E5E5" strokeWidth="0.5" rx="2" />

                    {/* Grid lines */}
                    <line x1="10" y1="10" x2="10" y2="110" stroke="#D1D5DB" strokeWidth="1" />
                    <line x1="10" y1="110" x2="110" y2="110" stroke="#D1D5DB" strokeWidth="1" />

                    {/* Perfect fit line (y=x diagonal) */}
                    <line x1="10" y1="110" x2="110" y2="10" stroke="#6B7280" strokeWidth="1.5" strokeDasharray="3,2" />

                    {/* Actual data point */}
                    {(() => {
                      const maxVal = Math.max(data.plant.power, predictions.chiller3)
                      const xPos = 10 + ((data.plant.power / maxVal) * 100)
                      const yPos = 110 - ((predictions.chiller3 / maxVal) * 100)
                      return (
                        <>
                          <circle cx={xPos} cy={yPos} r="5" fill="#F18F01" opacity="0.2" />
                          <circle cx={xPos} cy={yPos} r="3.5" fill="#F18F01" opacity="0.9" />
                        </>
                      )
                    })()}

                    {/* Axes labels */}
                    <text x="60" y="118" fontSize="7" fill="#6B7280" textAnchor="middle" fontWeight="500">Actual (kW)</text>
                    <text x="4" y="60" fontSize="7" fill="#6B7280" textAnchor="middle" fontWeight="500" transform="rotate(-90 4 60)">Predicted (kW)</text>
                  </svg>
                </div>
              )}
            </div>
          </div>

          {/* Plant Summary */}
          <div className="rounded-lg p-2.5 shadow-sm bg-blue-50">
            <div className="font-semibold text-sm mb-2">Plant Summary</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total Load</span>
              <span className="tabular-nums font-medium">{data.plant.cooling.toFixed(0)} tons</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Power</span>
              <span className="tabular-nums font-medium">{data.plant.power.toFixed(0)} kW</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Actual Eff</span>
              <span className="tabular-nums font-medium text-blue-600">{efficiency.toFixed(2)} kW/ton</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Supply Temp</span>
              <span className="tabular-nums">{data.plant.supplyTemp.toFixed(1)}°F</span>
            </div>
            {predictedEfficiency !== null && totalPredictedPower !== null && (
              <>
                <div className="flex justify-between pt-1 border-t border-blue-200">
                  <span className="text-gray-600">Predicted Power</span>
                  <span className="tabular-nums font-medium text-emerald-600">{totalPredictedPower.toFixed(0)} kW</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-blue-200">
                  <span className="text-gray-600">Predicted Eff</span>
                  <span className="tabular-nums font-medium text-emerald-600">{predictedEfficiency.toFixed(2)} kW/ton</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>


  {/* Validation Rules */}
  <div className="border-t pt-3">
    <div className="text-base font-semibold mb-2">Validation Rules</div>
    <div className="grid grid-cols-3 gap-x-4 gap-y-1 text-xs">
      {/* CH1 RLA Max */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller1.rla > 95 ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller1.rla > 95 ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH1 RLA &lt; 95%</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller1.rla.toFixed(0)}%</span>
      </div>
      {/* CH1 RLA Min */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller1.rla > 0 && data.chiller1.rla < 30 ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller1.rla > 0 && data.chiller1.rla < 30 ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH1 RLA &gt; 30%</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller1.rla.toFixed(0)}%</span>
      </div>
      {/* CH1 Evap Temp */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller1.evapTemp !== null && (data.chiller1.evapTemp < 42 || data.chiller1.evapTemp > 55) ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller1.evapTemp !== null && (data.chiller1.evapTemp < 42 || data.chiller1.evapTemp > 55) ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH1 Evap 42-55°F</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller1.evapTemp?.toFixed(0) || '--'}°F</span>
      </div>

      {/* CH2 RLA Max */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller2.rla > 95 ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller2.rla > 95 ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH2 RLA &lt; 95%</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller2.rla.toFixed(0)}%</span>
      </div>
      {/* CH2 RLA Min */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller2.rla > 0 && data.chiller2.rla < 30 ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller2.rla > 0 && data.chiller2.rla < 30 ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH2 RLA &gt; 30%</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller2.rla.toFixed(0)}%</span>
      </div>
      {/* CH2 Evap Temp */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller2.evapTemp !== null && (data.chiller2.evapTemp < 42 || data.chiller2.evapTemp > 55) ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller2.evapTemp !== null && (data.chiller2.evapTemp < 42 || data.chiller2.evapTemp > 55) ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH2 Evap 42-55°F</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller2.evapTemp?.toFixed(0) || '--'}°F</span>
      </div>

      {/* CH3 RLA Max */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller3.rla > 95 ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller3.rla > 95 ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH3 RLA &lt; 95%</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller3.rla.toFixed(0)}%</span>
      </div>
      {/* CH3 RLA Min */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller3.rla > 0 && data.chiller3.rla < 30 ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller3.rla > 0 && data.chiller3.rla < 30 ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH3 RLA &gt; 30%</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller3.rla.toFixed(0)}%</span>
      </div>
      {/* CH3 Evap Temp */}
      <div className="flex items-center gap-1.5">
        <span className={data.chiller3.evapTemp !== null && (data.chiller3.evapTemp < 42 || data.chiller3.evapTemp > 55) ? 'text-red-600' : 'text-emerald-600'}>
          {data.chiller3.evapTemp !== null && (data.chiller3.evapTemp < 42 || data.chiller3.evapTemp > 55) ? '✗' : '✓'}
        </span>
        <span className="text-gray-600">CH3 Evap 42-55°F</span>
        <span className="text-gray-400 tabular-nums ml-auto">{data.chiller3.evapTemp?.toFixed(0) || '--'}°F</span>
      </div>

      {/* Efficiency Check */}
      <div className="flex items-center gap-1.5 col-span-3">
        <span className={anomalies.length > 0 ? 'text-orange-600' : 'text-emerald-600'}>
          {anomalies.length > 0 ? '⚠' : '✓'}
        </span>
        <span className="text-gray-600">Physics Model Efficiency</span>
        <span className="text-gray-400 tabular-nums ml-auto">{anomalies.length > 0 ? 'Anomaly Detected' : 'Normal'}</span>
      </div>
    </div>
  </div>
  </CardContent >
      </Card >
    </div >
  )
}

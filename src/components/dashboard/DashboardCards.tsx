"use client"

import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Zap,
  Thermometer,
  Brain,
  Lightbulb,
  ArrowRight,
  CheckCircle2,
  Activity,
  RefreshCw,
  Wrench
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AgentFlowChart, AgentResponseCard } from "@/components/visualization"
import { AgentNode, AgentExecution } from "@/types/agent"
import { mockAgentExecution, mockAgentResponses } from "@/utils/mockData/agentExecution"
import LoadingSpinner from "@/components/shared/LoadingSpinner"
import ErrorMessage from "@/components/shared/ErrorMessage"
import { SpotlightCard } from "@/components/ui/spotlight-card"

interface Metrics {
  temperature: { value: string; status: "optimal" | "good" | "warning" }
  energyEfficiency: { value: string; status: "optimal" | "good" | "warning" }
  aiDecisions: { value: string; status: "optimal" | "good" | "warning" }
}

// Helper function to extract metrics from node
function getMetricsFromNode(selectedNode: AgentNode | null, execution: AgentExecution | null): Metrics {
  // Default/fallback metrics
  const defaultMetrics: Metrics = {
    temperature: { value: "22.3", status: "optimal" },
    energyEfficiency: { value: "94", status: "good" },
    aiDecisions: { value: "0", status: "good" }
  }

  if (!selectedNode && !execution) {
    return defaultMetrics
  }

  const node = selectedNode || execution?.rootNode
  if (!node) return defaultMetrics

  // Extract temperature from node output or input
  let temperature = defaultMetrics.temperature
  if (node.output?.temperature !== undefined) {
    const tempValue = typeof node.output.temperature === 'number' ? node.output.temperature : parseFloat(node.output.temperature) || 22.3
    temperature = {
      value: tempValue.toFixed(1),
      status: tempValue <= 22.5 ? "optimal" : tempValue <= 24 ? "good" : "warning"
    }
  } else if (node.input?.currentTemp !== undefined) {
    const tempValue = typeof node.input.currentTemp === 'number' ? node.input.currentTemp : parseFloat(node.input.currentTemp) || 22.3
    temperature = {
      value: tempValue.toFixed(1),
      status: tempValue <= 22.5 ? "optimal" : tempValue <= 24 ? "good" : "warning"
    }
  }

  // Extract energy efficiency from output or metadata
  let energyEfficiency = defaultMetrics.energyEfficiency
  if (node.output?.estimatedSavings !== undefined) {
    const savings = typeof node.output.estimatedSavings === 'string' 
      ? parseFloat(node.output.estimatedSavings.replace('%', '')) || 12
      : (node.output.estimatedSavings as number) || 12
    const efficiency = 100 - Math.abs(savings)
    energyEfficiency = {
      value: Math.max(0, Math.min(100, efficiency)).toFixed(0),
      status: efficiency >= 90 ? "optimal" : efficiency >= 85 ? "good" : "warning"
    }
  } else if (node.metadata?.confidence !== undefined) {
    const confidence = node.metadata.confidence
    energyEfficiency = {
      value: confidence.toFixed(0),
      status: confidence >= 90 ? "optimal" : confidence >= 80 ? "good" : "warning"
    }
  }

  // Count decision nodes in the execution
  let aiDecisions = defaultMetrics.aiDecisions
  if (execution?.rootNode) {
    const countDecisions = (node: AgentNode): number => {
      let count = node.type === "decision" ? 1 : 0
      if (node.children) {
        count += node.children.reduce((sum, child) => sum + countDecisions(child), 0)
      }
      return count
    }
    const decisionCount = countDecisions(execution.rootNode)
    aiDecisions = {
      value: decisionCount.toString(),
      status: decisionCount > 0 ? "good" : "optimal"
    }
  }

  return { temperature, energyEfficiency, aiDecisions }
}

interface MetricCardProps {
  label: string
  value: string
  unit: string
  icon: React.ReactNode
  status: "optimal" | "good" | "warning"
}

function MetricCard({ label, value, unit, icon, status }: MetricCardProps) {
  const statusColors = {
    optimal: "bg-green-50 text-green-700 border-green-200",
    good: "bg-blue-50 text-blue-700 border-blue-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
  }

  return (
    <Card className="border-l-4 border-l-blue-500">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">{value}</span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </div>
          </div>
          <div className="rounded-full bg-blue-100 p-3">
            {icon}
          </div>
        </div>
        <Badge className={`mt-3 ${statusColors[status]}`} variant="outline">
          {status === "optimal" && "Optimal Performance"}
          {status === "good" && "Normal Operation"}
          {status === "warning" && "Requires Attention"}
        </Badge>
      </CardContent>
    </Card>
  )
}

interface DashboardCardsProps {
  /**
   * Selected event ID from timeline
   */
  selectedEventId?: string
  
  /**
   * Time range for display
   */
  timeRange?: "24h" | "7d" | "30d" | "custom"
}

export function DashboardCards({ 
  selectedEventId,
  timeRange
}: DashboardCardsProps = {}) {
  const [selectedNode, setSelectedNode] = useState<AgentNode | null>(null)
  
  // Use mock data for now
  const displayExecution = mockAgentExecution

  const handleNodeClick = (node: AgentNode) => {
    setSelectedNode(node)
  }

  // Extract metrics from selected node or execution
  const metrics = getMetricsFromNode(selectedNode, displayExecution)

  return (
    <div className="space-y-6">
      {/* Agent Execution Trace & Responses - Single Row */}
      <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6">
        {/* Left Side - Agent Execution Flowchart */}
        <Card className="flex flex-col border-0">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-blue-600" />
                <div>
                  <CardTitle className="text-xl font-semibold">Agent Execution Trace</CardTitle>
                  <CardDescription>AI agent decision flow visualization</CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  {displayExecution.status.toUpperCase()}
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  {displayExecution.totalDuration}ms
                </Badge>
              </div>
            </div>
          </CardHeader>

          <CardContent className="flex-1 overflow-hidden p-0">
            <div className="h-[600px] overflow-auto bg-white">
              <AgentFlowChart
                rootNode={displayExecution.rootNode}
                responses={mockAgentResponses}
                onNodeClick={handleNodeClick}
              />
            </div>

            {/* Trace Summary */}
            <div className="mt-6 grid grid-cols-3 gap-4 px-4 pb-4">
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total Duration</div>
                <div className="text-2xl font-bold text-blue-600">{displayExecution.totalDuration}ms</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Total Cost</div>
                <div className="text-2xl font-bold text-blue-600">${displayExecution.totalCost?.toFixed(4) || '0.0000'}</div>
              </div>
              <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Execution ID</div>
                <div className="text-sm font-mono font-semibold text-blue-600 truncate">{displayExecution.id}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Agent Responses */}
        <Card className="flex flex-col border-0">
          <CardHeader className="border-0">
            <div className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              <div>
                <CardTitle className="text-lg font-semibold">Agent Responses</CardTitle>
                <CardDescription className="text-sm">Real-time execution log</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden pt-0">
            <div className="h-[600px] overflow-auto pr-2">
              {mockAgentResponses.map((response) => (
                <AgentResponseCard key={response.id} response={response} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chain of Thought & Final Insight - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chain of Thought (COT) */}
        <SpotlightCard className="bg-white border-blue-200 shadow-sm" spotlightColor="rgba(59, 130, 246, 0.1)">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="rounded-lg bg-blue-100 p-2">
            <Brain className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">AI Decision Chain of Thought</h3>
            <p className="text-xs text-gray-500">Latest AI cooling optimization decision</p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Step 1: Detected */}
          <div className="flex items-start gap-3 group">
            <div className="rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 p-2 flex-shrink-0 shadow-sm group-hover:shadow transition-all">
              <CheckCircle2 className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">Detected: High cooling load (85%)</h4>
              <p className="text-xs text-gray-600 leading-relaxed">
                Zone 1 temperature rising above optimal threshold of 22°C
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-10">
            <ArrowRight className="h-4 w-4 text-blue-400" />
          </div>

          {/* Step 2: Evaluated */}
          <div className="flex items-start gap-3 group">
            <div className="rounded-lg bg-gradient-to-br from-blue-100 to-blue-50 p-2 flex-shrink-0 shadow-sm group-hover:shadow transition-all">
              <Lightbulb className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-2">Evaluated: 3 possible actions</h4>
              <ul className="space-y-1.5 list-none">
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                  <span>Increase primary chiller capacity <span className="text-gray-500">(+15kW)</span></span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-900 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></span>
                  <span>Activate secondary chiller <span className="text-gray-500 font-normal">(+12kW)</span> <span className="text-green-600">✓</span></span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400 mt-1.5 flex-shrink-0"></span>
                  <span>Adjust temperature setpoint <span className="text-gray-500">(+8kW)</span></span>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex items-center gap-2 pl-10">
            <ArrowRight className="h-4 w-4 text-blue-400" />
          </div>

          {/* Step 3: Decision */}
          <div className="flex items-start gap-3 group">
            <div className="rounded-lg bg-gradient-to-br from-green-100 to-green-50 p-2 flex-shrink-0 shadow-sm group-hover:shadow transition-all">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 text-sm mb-1">Decision: Activate secondary chiller</h4>
              <p className="text-xs text-gray-600 mb-2">
                <span className="font-medium text-gray-900">92% confidence</span> • Energy savings: <span className="font-medium text-green-700">12%</span>
              </p>
              <Badge className="bg-green-100 text-green-800 border-green-300 text-xs font-medium px-2 py-0.5" variant="outline">
                ✓ Executed
              </Badge>
            </div>
          </div>
        </div>
      </SpotlightCard>

        {/* Final Insight */}
        <SpotlightCard className="bg-white border-blue-200 shadow-sm" spotlightColor="rgba(16, 185, 129, 0.1)">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="rounded-lg bg-green-100 p-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Final Insight</h3>
              <p className="text-xs text-gray-500">AI recommendation summary</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Recommendation */}
            <div className="bg-gradient-to-br from-green-50 to-white rounded-lg p-4 border border-green-200">
              <div className="flex items-start gap-2 mb-2">
                <Lightbulb className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-gray-900 text-sm">Optimal Solution</h4>
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Activating the secondary chiller provides the best balance between cooling efficiency and energy consumption for current load conditions.
              </p>
            </div>

            {/* Key Metrics */}
            <div className="space-y-3">
              <h4 className="font-semibold text-gray-900 text-sm">Key Metrics</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                  <div className="text-xs text-gray-600 mb-1">Energy Saved</div>
                  <div className="text-lg font-bold text-blue-600">12%</div>
                </div>
                <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                  <div className="text-xs text-gray-600 mb-1">Confidence</div>
                  <div className="text-lg font-bold text-green-600">92%</div>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                  <div className="text-xs text-gray-600 mb-1">Response Time</div>
                  <div className="text-lg font-bold text-purple-600">3.5s</div>
                </div>
                <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                  <div className="text-xs text-gray-600 mb-1">Cost Impact</div>
                  <div className="text-lg font-bold text-orange-600">-$42</div>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-2 mb-2">
                <Activity className="h-4 w-4 text-gray-600 mt-0.5 flex-shrink-0" />
                <h4 className="font-semibold text-gray-900 text-sm">Next Steps</h4>
              </div>
              <ul className="space-y-1.5 list-none">
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-green-600">•</span>
                  <span>Monitor zone temperature for next 15 minutes</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-green-600">•</span>
                  <span>Prepare to adjust if load increases beyond 90%</span>
                </li>
                <li className="flex items-start gap-2 text-xs text-gray-600">
                  <span className="text-green-600">•</span>
                  <span>Log efficiency metrics for future optimization</span>
                </li>
              </ul>
            </div>
          </div>
        </SpotlightCard>
      </div>
    </div>
  )
}

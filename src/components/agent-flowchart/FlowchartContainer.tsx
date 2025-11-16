"use client"

import React, { useState, useEffect } from "react"
import { AgentNode } from "@/types/agent"
import { convertTraceToTree } from "@/utils/flowchart/traceToTree"
import { useFlowchartAnimation } from "@/hooks/useFlowchartAnimation"
import { ReactFlowChart } from "./ReactFlowChart"
import { FlowchartControls } from "./FlowchartControls"
import { Activity, Loader2 } from "lucide-react"
import agentTraceTemplate from "@/data/agent-trace-30.json"
import { loadRunData, parseTimestepData, detectControlDecision, checkViolations } from "@/utils/decisionData"

interface FlowchartContainerProps {
  timestepIndex: number
}

type AgentTraceData = Parameters<typeof convertTraceToTree>[0]

// Dynamic data loading function
async function loadTraceForTimestep(timestepIndex: number): Promise<any> {
  try {
    // Load physics run data for the selected timestep
    const runData = await loadRunData()

    // Fallback to template if run data isn't available
    if (!runData || Object.keys(runData).length === 0) {
      return agentTraceTemplate
    }

    // Extract timestep-level data and decision context
    const timestep = parseTimestepData(timestepIndex, runData)
    const decision = detectControlDecision(timestepIndex, runData)
    const { violations, anomalies } = checkViolations(timestep, decision.hasChanges)

    // Use the sample LangSmith trace as a visual template,
    // but enrich it with timestep-specific metadata so each
    // segment on the timeline feels distinct.
    const baseTrace = agentTraceTemplate as AgentTraceData

    const dynamicTrace: AgentTraceData = {
      ...baseTrace,
      start_time: timestep.datetime,
      end_time: timestep.datetime,
      execution_time_ms: baseTrace.execution_time_ms,
      metadata: {
        ...(baseTrace.metadata || {}),
        timestepIndex,
        datetime: timestep.datetime,
        cooling_tons: timestep.plant.cooling,
        plant_power_kw: timestep.plant.power,
        drybulb_f: timestep.environment.drybulb,
        hasDecision: decision.hasChanges,
        violationCount: violations.length,
        anomalyCount: anomalies.length,
      },
      child_runs: baseTrace.child_runs.map((run) => ({
        ...run,
        metadata: {
          ...(run.metadata || {}),
          timestepIndex,
          hasDecision: decision.hasChanges,
        },
      })),
    }

    return dynamicTrace
  } catch (error) {
    console.error('Failed to load trace data:', error)
    return agentTraceTemplate
  }
}

export function FlowchartContainer({ timestepIndex }: FlowchartContainerProps) {
  const [rootNode, setRootNode] = useState<AgentNode | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load trace data when timestepIndex changes
  useEffect(() => {
    let cancelled = false

    const loadData = async () => {
      setLoading(true)
      setError(null)

      try {
        const traceData = await loadTraceForTimestep(timestepIndex)

        if (cancelled) return

        if (traceData) {
          const tree = convertTraceToTree(traceData)
          setRootNode(tree)
        } else {
          setError('No trace data available for this timestep')
        }
      } catch (err) {
        if (!cancelled) {
          setError('Failed to load trace data')
          console.error(err)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadData()

    return () => {
      cancelled = true
    }
  }, [timestepIndex])

  // Animation hook
  const {
    currentStep,
    totalSteps,
    visibleNodeIds,
    isPlaying,
    speed,
    progress,
    play,
    pause,
    reset,
    setPlaybackSpeed
  } = useFlowchartAnimation(rootNode, true)

  const handleNodeClick = (node: AgentNode) => {
    console.log('Node clicked:', node)
    // Could open a modal or expand details
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col items-center justify-center text-gray-400">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">Loading agent trace...</p>
        </div>
      </div>
    )
  }

  if (error || !rootNode) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <div className="flex flex-col items-center justify-center text-gray-400">
          <Activity className="h-8 w-8 mb-3" />
          <p className="text-sm">{error || 'No trace data available'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-blue-600" />
            <h3 className="font-bold text-gray-900 text-sm">Agent Execution Flowchart</h3>
          </div>
          <div className="text-xs text-gray-500">
            Timestep {timestepIndex} • {totalSteps} nodes
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-3">
        <FlowchartControls
          isPlaying={isPlaying}
          currentStep={currentStep}
          totalSteps={totalSteps}
          speed={speed}
          progress={progress}
          onReset={reset}
          onSpeedChange={setPlaybackSpeed}
        />
      </div>

      {/* Flowchart Visualization */}
      <div className="bg-gradient-to-b from-white to-gray-50 h-[600px]">
        <ReactFlowChart
          rootNode={rootNode}
          visibleNodeIds={visibleNodeIds}
          onNodeClick={handleNodeClick}
        />
      </div>

      {/* Legend */}
      <div className="border-t border-gray-200 bg-gray-50 px-6 py-3">
        <div className="flex items-center justify-center gap-6 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-600 to-blue-700 border border-blue-500" />
            <span className="text-gray-600">Agent</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-purple-600 to-purple-700 border border-purple-500" />
            <span className="text-gray-600">LLM</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded bg-gradient-to-br from-blue-500 to-blue-600 border border-blue-400" />
            <span className="text-gray-600">Tool</span>
          </div>
        </div>
      </div>
    </div>
  )
}

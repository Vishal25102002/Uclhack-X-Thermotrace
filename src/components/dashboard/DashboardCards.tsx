"use client"

import React, { useState, useEffect } from "react"
import { ChevronDown, ChevronUp, CheckCircle2, Clock, Bot, Wrench, Brain, Cpu, TrendingUp, Shield, Zap, Activity, ArrowRight } from "lucide-react"
import { loadRunData, detectControlDecision, checkViolations, parseTimestepData, getEfficiency } from "@/utils/decisionData"
import agentTrace30 from '@/data/agent-trace-30.json'

interface ChildRun {
  id: string
  name: string
  run_type: 'tool' | 'llm' | 'chain'
  summary?: string
  start_time: string
  end_time: string
  execution_time_ms: number
  status: string
  inputs: any
  outputs: any
  metadata?: any
  tags?: string[]
}

interface AgentTraceData {
  id: string
  name: string
  start_time: string
  end_time: string
  execution_time_ms: number
  status: string
  metadata: {
    cycle_number: number
  }
  child_runs: ChildRun[]
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

  /**
   * Selected timestep index (0-95)
   */
  timestepIndex?: number
}

// Load actual trace data (for now, using timestep 30's data as template)
function loadTraceData(timestepIndex: number): AgentTraceData {
  // For now, return the actual trace data from timestep 30
  // In production, this would load different traces based on timestepIndex
  return agentTrace30 as AgentTraceData
}

export function DashboardCards({
  selectedEventId,
  timeRange,
  timestepIndex = 2
}: DashboardCardsProps = {}) {
  const [runData, setRunData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isExpanded, setIsExpanded] = useState(false)

  // Load run data on mount
  useEffect(() => {
    loadRunData().then((data) => {
      setRunData(data)
      setLoading(false)
    })
  }, [])

  // Load actual agent trace data
  const trace = loadTraceData(timestepIndex)

  if (!trace) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-400">Loading trace data...</div>
      </div>
    )
  }

  const formatTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    })
  }

  // Extract key data for summary panel
  const llmRun = trace.child_runs.find(r => r.run_type === 'llm')
  const safetyRun = trace.child_runs.find(r => r.name === 'SafetyValidation')
  const envRun = trace.child_runs.find(r => r.name === 'ReadEnvironmentState')
  const forecastRun = trace.child_runs.find(r => r.name === 'LoadForecastTool')

  // Extract decision info
  const decision = llmRun?.outputs?.parsed_decision
  const reasoningContent = llmRun?.outputs?.content || ''
  const rationale = reasoningContent.split('\n\n')[0] // First paragraph as brief rationale

  // Extract efficiency from timestep_data (read from JSON, not child runs)
  const traceData = trace as any
  const efficiencyBefore = traceData.efficiency?.actual || (traceData.timestep_data?.plant.power / traceData.timestep_data?.plant.cooling) || 0
  const efficiencyAfter = traceData.efficiency?.predicted || 0

  // Extract load split from parsed decision
  const afterState = decision?.predicted_load_split || {}

  // Extract safety checks
  const safetyChecks = safetyRun?.outputs?.checks || []
  const safetyScore = safetyRun?.outputs?.safety_score || 0

  // Calculate execution breakdown
  const totalTime = trace.execution_time_ms
  const toolTime = trace.child_runs
    .filter(r => r.run_type === 'tool')
    .reduce((sum, r) => sum + r.execution_time_ms, 0)
  const llmTime = llmRun?.execution_time_ms || 0

  return (
    <div className="space-y-6">
      {/* 2-Column Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Agent Execution Trace */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{trace.name}</h2>
                <div className="flex items-center gap-3 mt-1.5 text-sm text-gray-600">
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-3.5 w-3.5" />
                    {formatTime(trace.start_time)}
                  </span>
                  <span>•</span>
                  <span className="font-mono">{(trace.execution_time_ms / 1000).toFixed(1)}s</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  {trace.status.toUpperCase()}
                </div>
              </div>
            </div>
          </div>

          {/* Child Runs */}
          <div className="divide-y divide-gray-100">
            {trace.child_runs.map((run, idx) => (
              <ChildRunBlock key={run.id} run={run} formatTime={formatTime} />
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: Decision Summary & Impact */}
        <div className="space-y-4">
          {/* Before → After State */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-3 bg-gradient-to-r from-blue-50 to-cyan-50">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <h3 className="font-bold text-gray-900">Impact Analysis</h3>
              </div>
            </div>
            <div className="px-6 py-4 space-y-4">
              {/* Efficiency Change */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Plant Efficiency</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-gray-900">{efficiencyBefore.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">kW/ton (before)</div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400" />
                  <div className="flex-1">
                    <div className="text-2xl font-bold text-green-600">{efficiencyAfter.toFixed(2)}</div>
                    <div className="text-xs text-gray-500">kW/ton (predicted)</div>
                  </div>
                  <div className="px-2 py-1 rounded-md bg-green-100 text-green-700 text-xs font-semibold">
                    {((efficiencyBefore - efficiencyAfter) / efficiencyBefore * 100).toFixed(1)}% ↓
                  </div>
                </div>
              </div>

              {/* Chiller Load Distribution */}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Predicted Load Split</div>
                <div className="space-y-2">
                  {Object.entries(afterState).map(([chiller, rla]) => {
                    const rlaValue = Number(rla)
                    return (
                      <div key={chiller} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-12">{chiller}</span>
                        <div className="flex-1 h-8 bg-gray-100 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-end px-2"
                            style={{ width: `${rlaValue}%` }}
                          >
                            <span className="text-xs font-bold text-white">{rlaValue}%</span>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Safety Validation */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-3 bg-gradient-to-r from-emerald-50 to-green-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  <h3 className="font-bold text-gray-900">Safety Validation</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-green-600">Score: {safetyScore.toFixed(1)}</span>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                </div>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="grid grid-cols-2 gap-2">
                {safetyChecks.slice(0, 6).map((check: any) => (
                  <div key={check.check} className="flex items-center gap-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
                    <span className="text-xs text-gray-600 truncate">{check.check}</span>
                  </div>
                ))}
              </div>
              {safetyChecks.length > 6 && (
                <div className="mt-2 text-xs text-gray-500 text-center">
                  +{safetyChecks.length - 6} more checks passed
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="border-b border-gray-200 px-6 py-3 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-purple-600" />
                <h3 className="font-bold text-gray-900">Performance Metrics</h3>
              </div>
            </div>
            <div className="px-6 py-4 space-y-3">
              {/* Execution Time Breakdown */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Execution Breakdown</span>
                  <span className="text-xs font-mono text-gray-700">{(totalTime / 1000).toFixed(1)}s total</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-24 text-xs text-gray-600">LLM Reasoning</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-purple-500 flex items-center justify-end px-2"
                        style={{ width: `${(llmTime / totalTime) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">{(llmTime / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 text-xs text-gray-600">Tool Calls</div>
                    <div className="flex-1 h-6 bg-gray-100 rounded overflow-hidden">
                      <div
                        className="h-full bg-blue-500 flex items-center justify-end px-2"
                        style={{ width: `${(toolTime / totalTime) * 100}%` }}
                      >
                        <span className="text-xs font-bold text-white">{(toolTime / 1000).toFixed(1)}s</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Model Info */}
              <div className="pt-3 border-t border-gray-100">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-gray-500">LLM Model</span>
                    <p className="font-semibold text-gray-900 mt-1">
                      {llmRun?.metadata?.model ?
                        llmRun.metadata.model.includes('claude-sonnet-4') ? 'Claude Sonnet 4' :
                        llmRun.metadata.model.includes('claude-sonnet') ? 'Claude Sonnet' :
                        llmRun.metadata.model.includes('claude') ? 'Claude' :
                        llmRun.metadata.model
                        : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Total Tokens</span>
                    <p className="font-semibold text-gray-900 mt-1">{llmRun?.metadata?.total_tokens?.toLocaleString() || 'N/A'}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Forecast Model</span>
                    <p className="font-semibold text-gray-900 mt-1">
                      {forecastRun?.metadata?.model_name?.includes('xgboost') ? 'XGBoost' :
                       forecastRun?.metadata?.model_name || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Model R²</span>
                    <p className="font-semibold text-gray-900 mt-1">{forecastRun?.metadata?.model_r2 || 'N/A'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Child run block component with improved design
function ChildRunBlock({ run, formatTime }: { run: ChildRun; formatTime: (isoString: string) => string }) {
  const [showInputs, setShowInputs] = useState(false)
  const [showOutputs, setShowOutputs] = useState(run.run_type === 'llm') // LLM outputs expanded by default

  const getIcon = () => {
    switch (run.run_type) {
      case 'llm':
        return <Brain className="h-4 w-4 text-white" />
      case 'tool':
        return <Wrench className="h-4 w-4 text-white" />
      default:
        return <Cpu className="h-4 w-4 text-white" />
    }
  }

  const getIconBg = () => {
    switch (run.run_type) {
      case 'llm':
        return 'bg-purple-600'
      case 'tool':
        return 'bg-blue-600'
      default:
        return 'bg-gray-600'
    }
  }

  const getBg = () => {
    return run.run_type === 'llm' ? 'bg-purple-50' : ''
  }

  return (
    <div className={`px-6 py-5 ${getBg()} hover:bg-gray-50/50 transition-colors`}>
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex-shrink-0 mt-1">
          <div className={`w-8 h-8 rounded-lg ${getIconBg()} flex items-center justify-center shadow-sm`}>
            {getIcon()}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-gray-900">{run.name}</h3>
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                  {run.run_type}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                <span>{formatTime(run.start_time)}</span>
                <span>•</span>
                <span className="font-mono">{run.execution_time_ms}ms</span>
                <span>•</span>
                <span className={`font-semibold ${run.status === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                  {run.status}
                </span>
              </div>
            </div>
          </div>

          {/* Summary Section */}
          {run.summary && (
            <div className="mb-3 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg px-4 py-3">
              <div className="flex items-start gap-2">
                <div className="flex-shrink-0 mt-0.5">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Summary</div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {run.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Inputs */}
          <div className="mb-3">
            <button
              onClick={() => setShowInputs(!showInputs)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {showInputs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span>Inputs</span>
            </button>
            {showInputs && (
              <div className="mt-2 bg-white rounded-lg p-4 border border-gray-200">
                <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(run.inputs, null, 2)}
                </pre>
                <div className="mt-2 text-xs text-gray-400 uppercase tracking-wide">JSON</div>
              </div>
            )}
          </div>

          {/* Outputs */}
          <div>
            <button
              onClick={() => setShowOutputs(!showOutputs)}
              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              {showOutputs ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              <span>Outputs</span>
            </button>
            {showOutputs && (
              <div className="mt-2">
                {run.run_type === 'llm' && run.outputs.content ? (
                  // Special formatting for LLM reasoning
                  <div className="bg-gradient-to-br from-purple-50 to-white rounded-lg p-5 border border-purple-200">
                    <pre className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap font-sans">
                      {run.outputs.content}
                    </pre>
                  </div>
                ) : (
                  // JSON for other outputs
                  <div className="bg-white rounded-lg p-4 border border-gray-200">
                    <pre className="text-xs font-mono text-gray-700 whitespace-pre-wrap overflow-x-auto">
                      {JSON.stringify(run.outputs, null, 2)}
                    </pre>
                    <div className="mt-2 text-xs text-gray-400 uppercase tracking-wide">JSON</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Metadata tags */}
          {run.tags && run.tags.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              {run.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


"use client"

import React from "react"
import { motion } from "framer-motion"
import { AgentNode, NodeType } from "@/types/agent"
import { cn } from "@/lib/utils"
import {
  Brain,
  Wrench,
  MessageSquare,
  Cpu,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowDown
} from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip"

interface FlowchartNodeProps {
  node: AgentNode
  isVisible: boolean
  onClick?: (node: AgentNode) => void
  isRoot?: boolean
}

const getNodeIcon = (type: NodeType) => {
  switch (type) {
    case "agent":
      return Brain
    case "tool":
      return Wrench
    case "llm":
      return MessageSquare
    case "decision":
      return Cpu
  }
}

const getNodeColor = (type: NodeType) => {
  switch (type) {
    case "agent":
      return "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500"
    case "tool":
      return "bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400"
    case "llm":
      return "bg-gradient-to-br from-purple-600 to-purple-700 border-purple-500"
    case "decision":
      return "bg-gradient-to-br from-cyan-600 to-cyan-700 border-cyan-500"
  }
}

const getStatusIcon = (status: AgentNode["status"]) => {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
    case "error":
      return <XCircle className="h-3.5 w-3.5 text-red-400" />
    case "running":
      return <Loader2 className="h-3.5 w-3.5 text-white animate-spin" />
    case "pending":
      return <Loader2 className="h-3.5 w-3.5 text-gray-300" />
  }
}

const nodeVariants = {
  hidden: {
    opacity: 0,
    scale: 0.8,
    y: -10
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut" as const
    }
  }
}

export function FlowchartNode({ node, isVisible, onClick, isRoot = false }: FlowchartNodeProps) {
  const Icon = getNodeIcon(node.type)

  if (!isVisible) {
    return null
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.button
            variants={nodeVariants}
            initial="hidden"
            animate="visible"
            onClick={() => onClick?.(node)}
            className={cn(
              "px-4 py-2.5 rounded-lg font-semibold text-xs shadow-lg transition-all duration-200",
              "hover:scale-105 hover:shadow-xl text-white border-2",
              "min-w-[140px] text-center",
              getNodeColor(node.type),
              isRoot && "px-6 py-3 text-sm min-w-[180px]"
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <Icon className={cn("flex-shrink-0", isRoot ? "h-4 w-4" : "h-3.5 w-3.5")} />
              <span className="truncate max-w-[120px]">{node.name}</span>
              {getStatusIcon(node.status)}
            </div>
            {node.duration !== undefined && (
              <div className="mt-1.5 text-[10px] font-medium opacity-90">
                {node.duration}ms
              </div>
            )}
          </motion.button>
        </TooltipTrigger>

        <TooltipContent
          side="right"
          className="max-w-md p-0 bg-white border-2 border-blue-300 shadow-xl z-[99999]"
          sideOffset={10}
        >
          <div className="max-h-[400px] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-blue-600 text-white p-3 border-b-2 border-blue-500">
              <div className="font-bold text-sm mb-0.5">{node.name}</div>
              <div className="text-[10px] opacity-90">
                {node.type.toUpperCase()} • {node.duration}ms • {node.status}
              </div>
            </div>

            <div className="p-3 space-y-3">
              {/* Input */}
              <div>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <ArrowDown className="h-3 w-3 text-blue-600" />
                  <div className="text-xs font-bold text-blue-900">INPUT:</div>
                </div>
                <pre className="text-[10px] bg-gray-50 text-gray-800 p-2 rounded border border-gray-200 overflow-x-auto max-h-32 font-mono">
                  {JSON.stringify(node.input, null, 2)}
                </pre>
              </div>

              {/* Output */}
              {node.output && (
                <div>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <ArrowDown className="h-3 w-3 text-green-600 rotate-180" />
                    <div className="text-xs font-bold text-green-900">OUTPUT:</div>
                  </div>
                  <pre className="text-[10px] bg-green-50 text-gray-800 p-2 rounded border border-green-200 overflow-x-auto max-h-32 font-mono">
                    {JSON.stringify(node.output, null, 2)}
                  </pre>
                </div>
              )}

              {/* Metadata */}
              {node.metadata && (
                <div className="pt-2 border-t border-gray-200">
                  <div className="text-xs font-bold text-gray-700 mb-1.5">METADATA:</div>
                  <div className="grid grid-cols-2 gap-1.5 text-[10px]">
                    {node.metadata.model && (
                      <div className="bg-blue-50 p-1.5 rounded border border-blue-200">
                        <div className="text-gray-600">Model</div>
                        <div className="font-semibold text-gray-900 truncate">{node.metadata.model}</div>
                      </div>
                    )}
                    {node.metadata.total_tokens && (
                      <div className="bg-green-50 p-1.5 rounded border border-green-200">
                        <div className="text-gray-600">Tokens</div>
                        <div className="font-semibold text-gray-900">{node.metadata.total_tokens}</div>
                      </div>
                    )}
                    {typeof node.metadata.timestepIndex === "number" && (
                      <div className="bg-indigo-50 p-1.5 rounded border border-indigo-200">
                        <div className="text-gray-600">Timestep</div>
                        <div className="font-semibold text-gray-900">#{node.metadata.timestepIndex}</div>
                      </div>
                    )}
                    {typeof node.metadata.cooling_tons === "number" && (
                      <div className="bg-sky-50 p-1.5 rounded border border-sky-200">
                        <div className="text-gray-600">Plant Load</div>
                        <div className="font-semibold text-gray-900">
                          {node.metadata.cooling_tons.toFixed(0)} tons
                        </div>
                      </div>
                    )}
                    {typeof node.metadata.plant_power_kw === "number" && (
                      <div className="bg-amber-50 p-1.5 rounded border border-amber-200">
                        <div className="text-gray-600">Plant Power</div>
                        <div className="font-semibold text-gray-900">
                          {node.metadata.plant_power_kw.toFixed(0)} kW
                        </div>
                      </div>
                    )}
                    {typeof node.metadata.drybulb_f === "number" && (
                      <div className="bg-rose-50 p-1.5 rounded border border-rose-200">
                        <div className="text-gray-600">Outdoor Temp</div>
                        <div className="font-semibold text-gray-900">
                          {node.metadata.drybulb_f.toFixed(0)}°F
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

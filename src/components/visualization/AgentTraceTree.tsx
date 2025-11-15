"use client"

import React from "react"
import { AgentNode, NodeType } from "@/types/agent"
import { cn } from "@/lib/utils"
import {
  Brain,
  Wrench,
  MessageSquare,
  GitBranch,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowDown
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/Tooltip"

interface AgentTraceTreeProps {
  rootNode: AgentNode
  onNodeClick?: (node: AgentNode) => void
}

interface TreeNodeProps {
  node: AgentNode
  level: number
  onNodeClick?: (node: AgentNode) => void
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
      return GitBranch
  }
}

const getNodeColor = (type: NodeType) => {
  // Solid blue theme for all nodes
  switch (type) {
    case "agent":
      return "bg-blue-500 text-white border-blue-400 hover:bg-blue-600"
    case "tool":
      return "bg-blue-400 text-white border-blue-300 hover:bg-blue-500"
    case "llm":
      return "bg-blue-500 text-white border-blue-400 hover:bg-blue-600"
    case "decision":
      return "bg-blue-400 text-white border-blue-300 hover:bg-blue-500"
  }
}

const getStatusIcon = (status: AgentNode["status"]) => {
  switch (status) {
    case "success":
      return <CheckCircle2 className="h-4 w-4 text-green-400" />
    case "error":
      return <XCircle className="h-4 w-4 text-red-400" />
    case "running":
      return <Loader2 className="h-4 w-4 text-white animate-spin" />
    case "pending":
      return <Loader2 className="h-4 w-4 text-gray-300" />
  }
}

function TreeNode({ node, level, onNodeClick }: TreeNodeProps) {
  const hasChildren = node.children && node.children.length > 0
  const Icon = getNodeIcon(node.type)

  return (
    <div className="flex flex-col items-center">
      {/* Node Box */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onNodeClick?.(node)}
              className={cn(
                "px-5 py-3 rounded-xl font-semibold text-sm shadow-md transition-all duration-300",
                "hover:scale-105 hover:shadow-xl min-w-[180px] text-center border-2",
                getNodeColor(node.type),
                level === 0 && "text-base px-10 py-4 min-w-[240px]"
              )}
            >
              <div className="flex items-center justify-center gap-2">
                <Icon className={cn("flex-shrink-0", level === 0 ? "h-5 w-5" : "h-4 w-4")} />
                <span className="truncate">{node.name}</span>
                {getStatusIcon(node.status)}
              </div>
              <div className="flex items-center justify-center gap-2 mt-2 flex-wrap">
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20">
                  {node.type}
                </span>
                {node.duration !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20">
                    {node.duration}ms
                  </span>
                )}
                {node.metadata?.model && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-white/20">
                    {node.metadata.model}
                  </span>
                )}
              </div>
            </button>
          </TooltipTrigger>

          <TooltipContent
            side="right"
            className="max-w-xl p-0 bg-white border-2 border-blue-300 shadow-xl z-[99999]"
            sideOffset={10}
          >
            <div className="max-h-[600px] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-blue-500 text-white p-4 border-b-2 border-blue-400">
                <div className="font-bold text-lg mb-1">{node.name}</div>
                <div className="text-xs opacity-90">
                  {node.type.toUpperCase()} • {node.duration}ms
                </div>
              </div>

              <div className="p-4 space-y-4">
                {/* Input */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <ArrowDown className="h-4 w-4 text-blue-600" />
                    <div className="text-sm font-bold text-blue-900">
                      INPUT:
                    </div>
                  </div>
                  <pre className="text-xs bg-gray-50 text-gray-800 p-3 rounded-lg border border-gray-200 overflow-x-auto max-h-48 font-mono">
                    {JSON.stringify(node.input, null, 2)}
                  </pre>
                </div>

                {/* Output */}
                {node.output && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ArrowDown className="h-4 w-4 text-green-600 rotate-180" />
                      <div className="text-sm font-bold text-green-900">
                        OUTPUT:
                      </div>
                    </div>
                    <pre className="text-xs bg-green-50 text-gray-800 p-3 rounded-lg border border-green-200 overflow-x-auto max-h-48 font-mono">
                      {JSON.stringify(node.output, null, 2)}
                    </pre>
                  </div>
                )}

                {/* Metadata */}
                {node.metadata && Object.keys(node.metadata).length > 0 && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="text-sm font-bold text-gray-700 mb-2">METADATA:</div>
                    <div className="grid grid-cols-2 gap-2">
                      {node.metadata.tokenCount && (
                        <div className="bg-blue-50 p-2 rounded border border-blue-200">
                          <div className="text-xs text-gray-600">Tokens</div>
                          <div className="text-sm font-semibold text-gray-900">{node.metadata.tokenCount}</div>
                        </div>
                      )}
                      {node.metadata.cost && (
                        <div className="bg-green-50 p-2 rounded border border-green-200">
                          <div className="text-xs text-gray-600">Cost</div>
                          <div className="text-sm font-semibold text-gray-900">${node.metadata.cost.toFixed(4)}</div>
                        </div>
                      )}
                      {node.metadata.confidence && (
                        <div className="bg-purple-50 p-2 rounded border border-purple-200">
                          <div className="text-xs text-gray-600">Confidence</div>
                          <div className="text-sm font-semibold text-gray-900">{node.metadata.confidence}%</div>
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

      {/* Arrow Connector Down */}
      {hasChildren && (
        <div className="flex flex-col items-center my-2">
          <ArrowDown className="h-6 w-6 text-blue-500 animate-pulse" />
        </div>
      )}

      {/* Children Container */}
      {hasChildren && (
        <div className="relative pt-2">
          {/* Horizontal Line connecting all children */}
          {node.children!.length > 1 && (
            <div
              className="absolute h-0.5 bg-blue-300 rounded"
              style={{
                top: '8px',
                left: '50%',
                right: '50%',
                width: `${(node.children!.length - 1) * 240}px`,
                marginLeft: `-${((node.children!.length - 1) * 240) / 2}px`,
              }}
            />
          )}

          {/* Children Nodes */}
          <div className="flex gap-8 pt-0">
            {node.children!.map((child: AgentNode, index: number) => (
              <div key={child.id} className="relative flex flex-col items-center">
                {/* Vertical connector with arrow */}
                {node.children!.length > 1 && (
                  <div className="flex flex-col items-center mb-2">
                    <div className="w-0.5 h-4 bg-blue-300 rounded" />
                    <ArrowDown className="h-5 w-5 text-blue-500" />
                  </div>
                )}

                {/* Render child node recursively */}
                <TreeNode
                  node={child}
                  level={level + 1}
                  onNodeClick={onNodeClick}
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default function AgentTraceTree({ rootNode, onNodeClick }: AgentTraceTreeProps) {
  return (
    <div className="w-full overflow-x-auto overflow-y-visible">
      <div className="min-w-max flex justify-center py-8 px-4">
        <TreeNode node={rootNode} level={0} onNodeClick={onNodeClick} />
      </div>
    </div>
  )
}

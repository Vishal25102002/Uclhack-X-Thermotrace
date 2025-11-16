import React, { memo } from "react"
import { Handle, Position, NodeProps } from "@xyflow/react"
import { motion } from "framer-motion"
import { Brain, Zap, Code } from "lucide-react"
import { AgentNode } from "@/types/agent"

const nodeVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -10 },
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

function getNodeIcon(type: AgentNode["type"]) {
  switch (type) {
    case "agent":
      return <Brain className="h-3.5 w-3.5" />
    case "llm":
      return <Zap className="h-3.5 w-3.5" />
    case "tool":
      return <Code className="h-3.5 w-3.5" />
    default:
      return <Brain className="h-3.5 w-3.5" />
  }
}

function getNodeColors(type: AgentNode["type"]) {
  switch (type) {
    case "agent":
      return {
        gradient: "from-blue-600 to-blue-700",
        border: "border-blue-500",
        glow: "shadow-blue-500/50",
        text: "text-blue-50"
      }
    case "llm":
      return {
        gradient: "from-purple-600 to-purple-700",
        border: "border-purple-500",
        glow: "shadow-purple-500/50",
        text: "text-purple-50"
      }
    case "tool":
      return {
        gradient: "from-blue-500 to-blue-600",
        border: "border-blue-400",
        glow: "shadow-blue-400/50",
        text: "text-blue-50"
      }
    default:
      return {
        gradient: "from-gray-600 to-gray-700",
        border: "border-gray-500",
        glow: "shadow-gray-500/50",
        text: "text-gray-50"
      }
  }
}

export const CustomFlowNode = memo(({ data }: NodeProps) => {
  const nodeData = data as AgentNode
  const colors = getNodeColors(nodeData.type)
  const icon = getNodeIcon(nodeData.type)

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-blue-400 !border-2 !border-white"
      />

      <motion.div
        variants={nodeVariants}
        initial="hidden"
        animate="visible"
        className={`
          relative px-3 py-2 rounded-lg border-2
          bg-gradient-to-br ${colors.gradient}
          ${colors.border}
          shadow-lg ${colors.glow}
          cursor-grab active:cursor-grabbing
          hover:scale-105 transition-transform
          min-w-[140px]
        `}
      >
        {/* Node content */}
        <div className="flex items-center gap-2">
          <div className={colors.text}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className={`text-xs font-semibold truncate ${colors.text}`}>
              {nodeData.name}
            </div>
          </div>
        </div>

        {/* Status indicator */}
        {nodeData.status && (
          <div className="mt-1.5 flex items-center gap-1">
            <div className={`
              w-1.5 h-1.5 rounded-full
              ${nodeData.status === 'success' ? 'bg-green-400' :
                nodeData.status === 'error' ? 'bg-red-400' :
                nodeData.status === 'running' ? 'bg-yellow-400 animate-pulse' :
                'bg-gray-400'}
            `} />
            <span className="text-[10px] text-white/80 capitalize">
              {nodeData.status}
            </span>
          </div>
        )}
      </motion.div>

      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-blue-400 !border-2 !border-white"
      />
    </>
  )
})

CustomFlowNode.displayName = "CustomFlowNode"

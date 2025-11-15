"use client"

import React from "react"
import { AgentNode, AgentResponse } from "@/types/agent"
import AgentTraceTree from "./AgentTraceTree"

interface AgentFlowChartProps {
  rootNode: AgentNode
  responses?: AgentResponse[]
  onNodeClick?: (node: AgentNode) => void
}

export default function AgentFlowChart({ rootNode, responses = [], onNodeClick }: AgentFlowChartProps) {
  return (
    <div className="w-full">
      <AgentTraceTree 
        rootNode={rootNode}
        onNodeClick={onNodeClick}
      />
    </div>
  )
}

"use client"

import React, { useCallback, useMemo } from "react"
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import { AgentNode } from "@/types/agent"
import { CustomFlowNode } from "./CustomFlowNode"
import { CustomAnimatedEdge } from "./CustomAnimatedEdge"
import { createAnimatedNodes } from "@/utils/flowchart/treeToFlow"

interface ReactFlowChartProps {
  rootNode: AgentNode
  visibleNodeIds: Set<string>
  onNodeClick?: (node: AgentNode) => void
}

// Define custom node and edge types
const nodeTypes = {
  custom: CustomFlowNode,
}

const edgeTypes = {
  custom: CustomAnimatedEdge,
}

export function ReactFlowChart({
  rootNode,
  visibleNodeIds,
  onNodeClick,
}: ReactFlowChartProps) {
  // Convert tree to flow nodes and edges
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => createAnimatedNodes(rootNode, visibleNodeIds),
    [rootNode, visibleNodeIds]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  // Update nodes and edges when visibility changes
  React.useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = createAnimatedNodes(
      rootNode,
      visibleNodeIds
    )
    setNodes(newNodes)
    setEdges(newEdges)
  }, [rootNode, visibleNodeIds, setNodes, setEdges])

  // Handle node click
  const handleNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      if (onNodeClick && node.data) {
        onNodeClick(node.data as AgentNode)
      }
    },
    [onNodeClick]
  )

  return (
    <div className="w-full h-full min-h-[500px]">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        fitViewOptions={{
          padding: 0.2,
          includeHiddenNodes: false,
        }}
        minZoom={0.5}
        maxZoom={1.5}
        defaultEdgeOptions={{
          animated: true,
        }}
        proOptions={{ hideAttribution: true }}
      >
        {/* SVG Definitions for animations */}
        <svg style={{ position: "absolute", width: 0, height: 0 }}>
          <defs>
            {/* Arrow marker */}
            <marker
              id="arrowhead-flow"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="5"
              orient="auto"
            >
              <polygon points="0,0 10,5 0,10" fill="#60a5fa" />
            </marker>

            {/* Gradient for flowing effect */}
            <linearGradient id="flowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
              <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        <Background color="#e5e7eb" gap={16} />

        <Controls
          showZoom
          showFitView
          showInteractive={false}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm"
        />

        <MiniMap
          nodeColor={(node) => {
            const data = node.data as AgentNode
            switch (data.type) {
              case "agent":
                return "#2563eb"
              case "llm":
                return "#9333ea"
              case "tool":
                return "#3b82f6"
              default:
                return "#6b7280"
            }
          }}
          className="bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg shadow-sm"
          pannable
          zoomable
        />

        <Panel position="top-right" className="text-xs text-gray-500 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg border border-gray-200">
          Drag nodes to reposition • Scroll to zoom
        </Panel>
      </ReactFlow>
    </div>
  )
}

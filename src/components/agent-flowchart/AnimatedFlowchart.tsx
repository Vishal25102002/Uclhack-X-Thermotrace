"use client"

import React, { useMemo } from "react"
import { motion } from "framer-motion"
import { AgentNode } from "@/types/agent"
import { FlowchartNode } from "./FlowchartNode"

interface AnimatedFlowchartProps {
  rootNode: AgentNode
  visibleNodeIds: Set<string>
  onNodeClick?: (node: AgentNode) => void
}

interface NodePosition {
  node: AgentNode
  x: number
  y: number
  level: number
  width: number
}

export function AnimatedFlowchart({ rootNode, visibleNodeIds, onNodeClick }: AnimatedFlowchartProps) {
  const isNodeVisible = (nodeId: string) => visibleNodeIds.has(nodeId)

  // Calculate complete tree layout with proper positioning
  const { positions, connections, dimensions } = useMemo(() => {
    const NODE_WIDTH = 160
    const NODE_HEIGHT = 70
    const HORIZONTAL_GAP = 120
    const VERTICAL_GAP = 30
    const LEVEL_GAP = 200

    const positions: NodePosition[] = []
    const connections: Array<{
      from: { x: number; y: number; id: string }
      to: { x: number; y: number; id: string }
      index: number
    }> = []

    let connectionIndex = 0

    // Calculate subtree height for proper vertical spacing
    function calculateSubtreeHeight(node: AgentNode): number {
      if (!node.children || node.children.length === 0) {
        return NODE_HEIGHT
      }

      let totalHeight = 0
      node.children.forEach(child => {
        totalHeight += calculateSubtreeHeight(child) + VERTICAL_GAP
      })
      return totalHeight - VERTICAL_GAP
    }

    // Position nodes in tree structure
    function positionNode(
      node: AgentNode,
      x: number,
      y: number,
      level: number
    ): { height: number; centerY: number } {
      if (!node.children || node.children.length === 0) {
        // Leaf node
        positions.push({
          node,
          x,
          y,
          level,
          width: NODE_WIDTH
        })
        return { height: NODE_HEIGHT, centerY: y + NODE_HEIGHT / 2 }
      }

      // Calculate total height needed for all children
      const childHeights = node.children.map(child => calculateSubtreeHeight(child))
      const totalChildrenHeight = childHeights.reduce((sum, h) => sum + h, 0) +
                                   (node.children.length - 1) * VERTICAL_GAP

      // Position children
      let currentY = y
      const childCenters: number[] = []

      node.children.forEach((child, index) => {
        const childHeight = childHeights[index]
        const childResult = positionNode(
          child,
          x + NODE_WIDTH + LEVEL_GAP,
          currentY,
          level + 1
        )
        childCenters.push(childResult.centerY)
        currentY += childHeight + VERTICAL_GAP
      })

      // Calculate parent's vertical center based on children
      const parentCenterY = (childCenters[0] + childCenters[childCenters.length - 1]) / 2
      const parentY = parentCenterY - NODE_HEIGHT / 2

      // Add parent node
      positions.push({
        node,
        x,
        y: parentY,
        level,
        width: NODE_WIDTH
      })

      // Create connections from parent to each child
      node.children.forEach((child, index) => {
        const childPos = positions.find(p => p.node.id === child.id)
        if (childPos) {
          connections.push({
            from: {
              x: x + NODE_WIDTH,
              y: parentY + NODE_HEIGHT / 2,
              id: node.id
            },
            to: {
              x: childPos.x,
              y: childPos.y + NODE_HEIGHT / 2,
              id: child.id
            },
            index: connectionIndex++
          })
        }
      })

      return {
        height: totalChildrenHeight,
        centerY: parentCenterY
      }
    }

    // Start positioning from root
    const treeHeight = calculateSubtreeHeight(rootNode)
    positionNode(rootNode, 60, 60, 0)

    // Calculate canvas dimensions
    let maxX = 0
    let maxY = 0
    let minY = Infinity

    positions.forEach(pos => {
      maxX = Math.max(maxX, pos.x + NODE_WIDTH)
      maxY = Math.max(maxY, pos.y + NODE_HEIGHT)
      minY = Math.min(minY, pos.y)
    })

    return {
      positions,
      connections,
      dimensions: {
        width: maxX + 100,
        height: maxY - minY + 120
      }
    }
  }, [rootNode])

  return (
    <div className="w-full overflow-x-auto overflow-y-hidden py-6">
      <div
        className="relative mx-auto"
        style={{
          width: `${dimensions.width}px`,
          height: `${Math.max(dimensions.height, 500)}px`,
          minWidth: '100%'
        }}
      >
        {/* SVG Layer for connections */}
        <svg
          className="absolute inset-0 pointer-events-none"
          style={{
            width: `${dimensions.width}px`,
            height: `${dimensions.height}px`
          }}
        >
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

          {/* Draw all connections with flowing dashed lines */}
          {connections.map((conn) => {
            const isFromVisible = isNodeVisible(conn.from.id)
            const isToVisible = isNodeVisible(conn.to.id)
            const shouldShow = isFromVisible && isToVisible

            if (!shouldShow) return null

            // Create smooth path from parent to child
            const startX = conn.from.x
            const startY = conn.from.y
            const endX = conn.to.x
            const endY = conn.to.y

            // Use Bezier curve for smooth connection
            const controlX = startX + (endX - startX) * 0.5
            const pathD = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`

            // Animation duration and delay
            const duration = 2.5
            const delay = conn.index * 0.15

            return (
              <g key={`conn-${conn.from.id}-${conn.to.id}`}>
                {/* Base dashed line */}
                <motion.path
                  d={pathD}
                  stroke="#93c5fd"
                  strokeWidth="2"
                  fill="none"
                  strokeDasharray="8 6"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: 0.4
                  }}
                  transition={{
                    pathLength: { duration: 0.6, ease: "easeOut", delay },
                    opacity: { duration: 0.3, delay }
                  }}
                />

                {/* Animated flowing dashed line */}
                <motion.path
                  d={pathD}
                  stroke="#60a5fa"
                  strokeWidth="2.5"
                  fill="none"
                  strokeDasharray="8 6"
                  markerEnd="url(#arrowhead-flow)"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: 1,
                    opacity: 0.8,
                    strokeDashoffset: [0, -28]
                  }}
                  transition={{
                    pathLength: { duration: 0.6, ease: "easeOut", delay },
                    opacity: { duration: 0.3, delay },
                    strokeDashoffset: {
                      duration: duration,
                      ease: "linear",
                      repeat: Infinity,
                      delay
                    }
                  }}
                />

                {/* Animated circle traveling along path (from animated-svg-edge) */}
                <circle r="5" fill="#3b82f6" opacity="0.9">
                  <animateMotion
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    path={pathD}
                    begin={`${delay}s`}
                    calcMode="linear"
                    keyPoints="0;1"
                    keyTimes="0;1"
                  />
                  {/* Pulse effect on the circle */}
                  <animate
                    attributeName="r"
                    values="4;6;4"
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                  />
                  <animate
                    attributeName="opacity"
                    values="0.6;1;0.6"
                    dur={`${duration}s`}
                    repeatCount="indefinite"
                    begin={`${delay}s`}
                  />
                </circle>

                {/* Flowing highlight pulse */}
                <motion.path
                  d={pathD}
                  stroke="url(#flowGradient)"
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{
                    pathLength: [0, 0.4, 0],
                    opacity: [0, 1, 0]
                  }}
                  transition={{
                    duration: duration,
                    ease: "easeInOut",
                    repeat: Infinity,
                    delay: delay + 0.2
                  }}
                />
              </g>
            )
          })}
        </svg>

        {/* Nodes Layer */}
        {positions.map((pos) => (
          <div
            key={pos.node.id}
            className="absolute"
            style={{
              left: `${pos.x}px`,
              top: `${pos.y}px`,
              width: '160px',
              zIndex: 10
            }}
          >
            <FlowchartNode
              node={pos.node}
              isVisible={isNodeVisible(pos.node.id)}
              onClick={onNodeClick}
              isRoot={pos.level === 0}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

import React from "react"
import { EdgeProps, BaseEdge, getBezierPath } from "@xyflow/react"
import { motion } from "framer-motion"

export function CustomAnimatedEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
}: EdgeProps) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // Animation duration
  const duration = 2.5

  return (
    <>
      {/* Base dashed line */}
      <motion.path
        d={edgePath}
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
          pathLength: { duration: 0.6, ease: "easeOut" as const },
          opacity: { duration: 0.3 }
        }}
      />

      {/* Animated flowing dashed line */}
      <motion.path
        d={edgePath}
        stroke="#60a5fa"
        strokeWidth="2.5"
        fill="none"
        strokeDasharray="8 6"
        markerEnd={markerEnd}
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{
          pathLength: 1,
          opacity: 0.8,
          strokeDashoffset: [0, -28]
        }}
        transition={{
          pathLength: { duration: 0.6, ease: "easeOut" as const },
          opacity: { duration: 0.3 },
          strokeDashoffset: {
            duration: duration,
            ease: "linear" as const,
            repeat: Infinity,
          }
        }}
      />

      {/* Animated circle traveling along path */}
      <circle r="5" fill="#3b82f6" opacity="0.9">
        <animateMotion
          dur={`${duration}s`}
          repeatCount="indefinite"
          path={edgePath}
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
        />
        <animate
          attributeName="opacity"
          values="0.6;1;0.6"
          dur={`${duration}s`}
          repeatCount="indefinite"
        />
      </circle>

      {/* Flowing highlight pulse */}
      <motion.path
        d={edgePath}
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
          ease: "easeInOut" as const,
          repeat: Infinity,
          delay: 0.2
        }}
      />
    </>
  )
}

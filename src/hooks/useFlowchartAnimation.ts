import { useState, useEffect, useCallback } from 'react'
import { AgentNode } from '@/types/agent'
import { PlaybackSpeed } from '@/types/flowchart'
import { flattenTreeToSteps } from '@/utils/flowchart/traceToTree'

export function useFlowchartAnimation(rootNode: AgentNode | null, autoPlay: boolean = false) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [speed, setSpeed] = useState<PlaybackSpeed>(1)
  const [visibleNodeIds, setVisibleNodeIds] = useState<Set<string>>(new Set())

  // Flatten tree to steps
  const steps = rootNode ? flattenTreeToSteps(rootNode) : []
  const totalSteps = steps.length

  // Reset when rootNode changes
  useEffect(() => {
    setCurrentStep(0)
    setVisibleNodeIds(new Set())
    setIsPlaying(autoPlay)
  }, [rootNode, autoPlay])

  // Animation loop
  useEffect(() => {
    if (!isPlaying || currentStep >= totalSteps || totalSteps === 0) {
      if (currentStep >= totalSteps && totalSteps > 0) {
        setIsPlaying(false)
      }
      return
    }

    const baseDelay = 600 // Base delay in ms
    const delay = baseDelay / speed

    const timer = setTimeout(() => {
      const currentNode = steps[currentStep]
      setVisibleNodeIds(prev => new Set([...prev, currentNode.id]))
      setCurrentStep(prev => prev + 1)
    }, delay)

    return () => clearTimeout(timer)
  }, [isPlaying, currentStep, totalSteps, speed, steps])

  const play = useCallback(() => {
    if (currentStep >= totalSteps && totalSteps > 0) {
      // If at end, restart
      setCurrentStep(0)
      setVisibleNodeIds(new Set())
    }
    setIsPlaying(true)
  }, [currentStep, totalSteps])

  const pause = useCallback(() => {
    setIsPlaying(false)
  }, [])

  const reset = useCallback(() => {
    setCurrentStep(0)
    setVisibleNodeIds(new Set())
    setIsPlaying(true)
  }, [])

  const jumpToStep = useCallback((step: number) => {
    if (step < 0 || step > totalSteps) return

    setCurrentStep(step)
    // Show all nodes up to this step
    const nodeIds = steps.slice(0, step).map(s => s.id)
    setVisibleNodeIds(new Set(nodeIds))
  }, [steps, totalSteps])

  const setPlaybackSpeed = useCallback((newSpeed: PlaybackSpeed) => {
    setSpeed(newSpeed)
  }, [])

  return {
    currentStep,
    totalSteps,
    visibleNodeIds,
    isPlaying,
    speed,
    play,
    pause,
    reset,
    jumpToStep,
    setPlaybackSpeed,
    progress: totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0
  }
}

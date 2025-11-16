// Flowchart-specific types

export interface FlowchartAnimationState {
  currentStep: number
  totalSteps: number
  isPlaying: boolean
  speed: number // 0.5x, 1x, 2x, 4x
  visibleNodeIds: Set<string>
}

export interface FlowchartStep {
  nodeId: string
  depth: number
  index: number
}

export type PlaybackSpeed = 0.5 | 1 | 2 | 4

export interface FlowchartNodePosition {
  x: number
  y: number
  depth: number
}

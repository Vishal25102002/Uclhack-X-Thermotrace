// LangSmith trace types

export type NodeType = "agent" | "llm" | "tool" | "decision"

export interface TraceNode {
  id: string
  name: string
  type: NodeType
  status: "success" | "error" | "running"
  startTime: number
  endTime?: number
  duration?: number
  input?: any
  output?: any
  metadata?: {
    model?: string
    tokenCount?: number
    cost?: number
    confidence?: number
    [key: string]: any
  }
  children: TraceNode[]
}

export interface LangSmithTrace {
  traceId: string
  name: string
  startTime: number
  endTime?: number
  status: "success" | "error" | "running"
  rootNode: TraceNode
  totalDuration?: number
  totalCost?: number
}

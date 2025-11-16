// Agent flowchart types

export type NodeType = "agent" | "tool" | "llm" | "decision"
export type NodeStatus = "success" | "error" | "running" | "pending"

export interface AgentNode extends Record<string, unknown> {
  id: string
  name: string
  type: NodeType
  status: NodeStatus
  input?: any
  output?: any
  duration?: number
  timestamp?: Date
  metadata?: {
    model?: string
    confidence?: number
    cost?: number
    [key: string]: any
  }
  children?: AgentNode[]
}

export interface AgentExecution {
  id: string
  name: string
  startTime: Date
  endTime?: Date
  status: NodeStatus
  rootNode: AgentNode
  totalDuration?: number
  totalCost?: number
}

export interface AgentResponse {
  id: string
  timestamp: Date
  type: "thought" | "action" | "observation" | "result"
  content: string
  metadata?: Record<string, any>
}

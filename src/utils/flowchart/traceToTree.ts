import { AgentNode, NodeType, NodeStatus } from "@/types/agent"

interface ChildRun {
  id: string
  name: string
  run_type: string
  start_time: string
  end_time: string
  execution_time_ms: number
  status: string
  inputs: any
  outputs: any
  metadata?: any
  tags?: string[]
}

interface AgentTraceData {
  id: string
  name: string
  run_type: string
  start_time: string
  end_time: string
  execution_time_ms: number
  status: string
  metadata?: any
  child_runs: ChildRun[]
}

/**
 * Convert LangSmith trace data to AgentNode tree structure
 */
export function convertTraceToTree(trace: AgentTraceData): AgentNode {
  const mapRunTypeToNodeType = (runType: string): NodeType => {
    switch (runType.toLowerCase()) {
      case 'llm':
        return 'llm'
      case 'tool':
        return 'tool'
      case 'chain':
      case 'agent':
        return 'agent'
      default:
        return 'tool'
    }
  }

  const mapStatusToNodeStatus = (status: string): NodeStatus => {
    switch (status.toLowerCase()) {
      case 'success':
        return 'success'
      case 'error':
      case 'failed':
        return 'error'
      case 'running':
        return 'running'
      default:
        return 'pending'
    }
  }

  const convertChildRun = (child: ChildRun): AgentNode => {
    return {
      id: child.id,
      name: child.name,
      type: mapRunTypeToNodeType(child.run_type),
      status: mapStatusToNodeStatus(child.status),
      input: child.inputs,
      output: child.outputs,
      duration: child.execution_time_ms,
      timestamp: new Date(child.start_time),
      metadata: {
        ...child.metadata,
        run_type: child.run_type,
        tags: child.tags
      },
      children: [] // Flatten to single level for flowchart
    }
  }

  // Create root node
  const rootNode: AgentNode = {
    id: trace.id,
    name: trace.name,
    type: mapRunTypeToNodeType(trace.run_type),
    status: mapStatusToNodeStatus(trace.status),
    duration: trace.execution_time_ms,
    timestamp: new Date(trace.start_time),
    metadata: {
      ...trace.metadata,
      run_type: trace.run_type
    },
    children: trace.child_runs.map(convertChildRun)
  }

  return rootNode
}

/**
 * Flatten tree to sequential steps for animation
 */
export function flattenTreeToSteps(rootNode: AgentNode): AgentNode[] {
  const steps: AgentNode[] = []

  const traverse = (node: AgentNode, depth: number = 0) => {
    steps.push(node)

    if (node.children && node.children.length > 0) {
      node.children.forEach(child => traverse(child, depth + 1))
    }
  }

  traverse(rootNode)
  return steps
}

/**
 * Get all node IDs in order
 */
export function getAllNodeIds(rootNode: AgentNode): string[] {
  const steps = flattenTreeToSteps(rootNode)
  return steps.map(step => step.id)
}

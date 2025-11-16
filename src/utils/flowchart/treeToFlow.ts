import { Node, Edge } from "@xyflow/react"
import { AgentNode } from "@/types/agent"

interface NodePosition {
  x: number
  y: number
}

const NODE_WIDTH = 160
const NODE_HEIGHT = 70
const HORIZONTAL_SPACING = 250
const VERTICAL_SPACING = 100

/**
 * Calculate the height needed for a subtree
 */
function calculateSubtreeHeight(node: AgentNode): number {
  if (!node.children || node.children.length === 0) {
    return NODE_HEIGHT
  }

  let totalHeight = 0
  node.children.forEach(child => {
    totalHeight += calculateSubtreeHeight(child) + VERTICAL_SPACING
  })
  return totalHeight - VERTICAL_SPACING
}

/**
 * Position nodes in a tree layout and return positions
 */
function positionNodes(
  node: AgentNode,
  x: number,
  y: number,
  level: number,
  positions: Map<string, NodePosition>
): { centerY: number } {
  if (!node.children || node.children.length === 0) {
    // Leaf node
    positions.set(node.id, { x, y })
    return { centerY: y + NODE_HEIGHT / 2 }
  }

  // Calculate heights for children
  const childHeights = node.children.map(child => calculateSubtreeHeight(child))

  // Position children
  let currentY = y
  const childCenters: number[] = []

  node.children.forEach((child, index) => {
    const childHeight = childHeights[index]
    const result = positionNodes(
      child,
      x + HORIZONTAL_SPACING,
      currentY,
      level + 1,
      positions
    )
    childCenters.push(result.centerY)
    currentY += childHeight + VERTICAL_SPACING
  })

  // Center parent between children
  const parentCenterY = (childCenters[0] + childCenters[childCenters.length - 1]) / 2
  const parentY = parentCenterY - NODE_HEIGHT / 2

  positions.set(node.id, { x, y: parentY })

  return { centerY: parentCenterY }
}

/**
 * Convert AgentNode tree to React Flow nodes and edges
 */
export function convertTreeToFlow(rootNode: AgentNode): {
  nodes: Node<AgentNode>[]
  edges: Edge[]
} {
  const positions = new Map<string, NodePosition>()

  // Calculate positions
  positionNodes(rootNode, 50, 50, 0, positions)

  // Create nodes
  const nodes: Node<AgentNode>[] = []
  const edges: Edge[] = []

  function traverseTree(node: AgentNode, parentId?: string) {
    const position = positions.get(node.id) || { x: 0, y: 0 }

    nodes.push({
      id: node.id,
      type: "custom",
      position,
      data: node,
    })

    if (parentId) {
      edges.push({
        id: `${parentId}-${node.id}`,
        source: parentId,
        target: node.id,
        type: "custom",
        animated: true,
      })
    }

    if (node.children) {
      node.children.forEach(child => {
        traverseTree(child, node.id)
      })
    }
  }

  traverseTree(rootNode)

  return { nodes, edges }
}

/**
 * Create initial nodes with visibility animation
 */
export function createAnimatedNodes(
  rootNode: AgentNode,
  visibleNodeIds: Set<string>
): {
  nodes: Node<AgentNode>[]
  edges: Edge[]
} {
  const { nodes, edges } = convertTreeToFlow(rootNode)

  // Filter nodes based on visibility
  const visibleNodes = nodes.map(node => ({
    ...node,
    hidden: !visibleNodeIds.has(node.id),
  }))

  // Filter edges - only show if both source and target are visible
  const visibleEdges = edges.filter(edge =>
    visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
  )

  return {
    nodes: visibleNodes,
    edges: visibleEdges,
  }
}

import { LangSmithTrace, TraceNode, NodeType } from "@/types/langsmith"
import { Client } from "langsmith"

// Support both LANGSMITH_ and LANGCHAIN_ prefixed env vars (LangSmith uses LANGCHAIN_ prefix)
const LANGSMITH_API_KEY = process.env.LANGSMITH_API_KEY || process.env.LANGCHAIN_API_KEY || process.env.NEXT_PUBLIC_LANGSMITH_API_KEY || process.env.NEXT_PUBLIC_LANGCHAIN_API_KEY
const LANGSMITH_ENDPOINT = process.env.LANGSMITH_ENDPOINT || process.env.LANGCHAIN_ENDPOINT || process.env.NEXT_PUBLIC_LANGSMITH_ENDPOINT || process.env.NEXT_PUBLIC_LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com"
const LANGSMITH_PROJECT = process.env.LANGSMITH_PROJECT || process.env.LANGCHAIN_PROJECT || process.env.NEXT_PUBLIC_LANGSMITH_PROJECT || process.env.NEXT_PUBLIC_LANGCHAIN_PROJECT || "cooling-control-agent"

// Initialize LangSmith client
let langSmithClient: Client | null = null

function getLangSmithClient(): Client {
  if (!langSmithClient && LANGSMITH_API_KEY) {
    langSmithClient = new Client({
      apiKey: LANGSMITH_API_KEY,
      apiUrl: LANGSMITH_ENDPOINT,
    })
  }
  
  if (!langSmithClient) {
    throw new Error("LangSmith client not initialized. Please set LANGSMITH_API_KEY in your environment variables.")
  }
  
  return langSmithClient
}

interface LangSmithRun {
  id: string
  name: string
  run_type: string
  start_time: string
  end_time?: string
  status: string
  inputs: any
  outputs?: any
  error?: string
  extra?: any
  child_runs?: LangSmithRun[]
  execution_order?: number
  parent_run_id?: string
  trace_id?: string
  dotted_order?: string
}

// Map LangSmith run type to our NodeType
function mapRunTypeToNodeType(runType: string, name: string): NodeType {
  const nameLower = name.toLowerCase()

  if (runType === "chain" || runType === "agent") return "agent"
  if (runType === "llm") return "llm"
  if (runType === "tool") return "tool"
  if (nameLower.includes("decision") || nameLower.includes("evaluate")) return "decision"

  return "tool"
}

// Map LangSmith status to our status
function mapStatus(status: string): "success" | "error" | "running" {
  if (status === "success") return "success"
  if (status === "error") return "error"
  return "running"
}

// Convert LangSmith run to our TraceNode format
function convertRunToTraceNode(run: LangSmithRun): TraceNode {
  const startTime = new Date(run.start_time).getTime()
  const endTime = run.end_time ? new Date(run.end_time).getTime() : undefined
  const duration = endTime ? endTime - startTime : undefined

  // Extract metadata
  const metadata: any = {}

  if (run.extra) {
    if (run.extra.metadata) {
      metadata.model = run.extra.metadata.ls_model_name || run.extra.metadata.model
      metadata.tokenCount = run.extra.metadata.token_count
      metadata.cost = run.extra.metadata.cost
    }
    if (run.extra.invocation_params) {
      metadata.model = metadata.model || run.extra.invocation_params.model
    }
  }

  // Try to extract confidence from outputs
  if (run.outputs) {
    if (typeof run.outputs === 'object' && run.outputs !== null) {
      metadata.confidence = run.outputs.confidence || run.outputs.score
    }
  }

  const node: TraceNode = {
    id: run.id,
    name: run.name,
    type: mapRunTypeToNodeType(run.run_type, run.name),
    status: mapStatus(run.status),
    startTime,
    endTime,
    duration,
    input: run.inputs,
    output: run.outputs,
    metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
    children: run.child_runs ? run.child_runs.map(convertRunToTraceNode) : [],
  }

  return node
}

// Fetch runs from LangSmith API
export async function fetchLangSmithRuns(limit: number = 10): Promise<LangSmithTrace[]> {
  try {
    // Validate environment variables
    if (!LANGSMITH_API_KEY) {
      throw new Error("LANGSMITH_API_KEY is not set. Please check your .env.local file.")
    }

    // Build request body according to LangSmith API specification
    const requestBody: any = {
      limit,
      order: "desc", // Must be "asc" or "desc"
      order_by: "start_time", // Field to sort by
      filter: "eq(parent_run_id, null)", // Only root runs
    }
    
    // Add project filter if specified
    if (LANGSMITH_PROJECT) {
      requestBody.project = [LANGSMITH_PROJECT] // LangSmith expects array of project names
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    // LangSmith accepts both x-api-key and Authorization Bearer
    if (LANGSMITH_API_KEY.startsWith("lsv2_")) {
      // New format API key (lsv2_ prefix)
      headers["x-api-key"] = LANGSMITH_API_KEY
    } else {
      // Try as bearer token as fallback
      headers["Authorization"] = `Bearer ${LANGSMITH_API_KEY}`
      headers["x-api-key"] = LANGSMITH_API_KEY
    }

    console.log("LangSmith API Request:", {
      endpoint: `${LANGSMITH_ENDPOINT}/runs/query`,
      project: LANGSMITH_PROJECT,
      hasApiKey: !!LANGSMITH_API_KEY,
      apiKeyPrefix: LANGSMITH_API_KEY.substring(0, 10) + "...",
      headers: Object.keys(headers),
    })

    const response = await fetch(
      `${LANGSMITH_ENDPOINT}/runs/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      }
    )

    const responseText = await response.text()
    let data: any

    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse LangSmith API response:", responseText)
      throw new Error(`Invalid JSON response from LangSmith API: ${response.status} ${response.statusText}. Response: ${responseText.substring(0, 200)}`)
    }

    if (!response.ok) {
      console.error("LangSmith API Error Response:", data)
      
      // If 403 and we're using a project filter, try without project to diagnose
      if (response.status === 403 && LANGSMITH_PROJECT) {
        console.log("403 Forbidden with project filter, trying without project to diagnose...")
        const fallbackBody: any = {
          limit: 10,
          order: "desc",
          order_by: "start_time",
          filter: "eq(parent_run_id, null)",
        }
        
        const fallbackResponse = await fetch(
          `${LANGSMITH_ENDPOINT}/runs/query`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(fallbackBody),
          }
        )
        
        if (fallbackResponse.ok) {
          const fallbackText = await fallbackResponse.text()
          const fallbackData = JSON.parse(fallbackText)
          console.warn(`⚠️ Successfully fetched WITHOUT project filter. This means:`)
          console.warn(`1. Your API key is valid`)
          console.warn(`2. The project "${LANGSMITH_PROJECT}" may not exist or you don't have access to it`)
          console.warn(`3. Available runs: ${fallbackData?.runs?.length || 0}`)
          console.warn(`4. Try checking your LangSmith dashboard for the correct project name`)
        } else {
          console.error("Even without project filter, API returned:", fallbackResponse.status)
        }
      }
      
      const errorDetail = data?.detail || data?.message || responseText
      const helpfulMessage = response.status === 403 
        ? `403 Forbidden: ${errorDetail || "Your API key may not have access to this project, or the project name '${LANGSMITH_PROJECT}' doesn't exist. Check your LangSmith dashboard for the correct project name."}`
        : `LangSmith API error: ${response.status} ${response.statusText}. ${errorDetail}`
      
      throw new Error(helpfulMessage)
    }

    const runs: LangSmithRun[] = data?.runs || data || []

    // Convert to our trace format
    const traces: LangSmithTrace[] = []

    for (const run of runs) {
      // Fetch full run details including children
      const fullRun = await fetchRunDetails(run.id)

      const trace: LangSmithTrace = {
        traceId: fullRun.trace_id || fullRun.id,
        name: fullRun.name,
        startTime: new Date(fullRun.start_time).getTime(),
        endTime: fullRun.end_time ? new Date(fullRun.end_time).getTime() : undefined,
        status: mapStatus(fullRun.status),
        rootNode: convertRunToTraceNode(fullRun),
        totalDuration: fullRun.end_time
          ? new Date(fullRun.end_time).getTime() - new Date(fullRun.start_time).getTime()
          : undefined,
        totalCost: fullRun.extra?.metadata?.total_cost,
      }

      traces.push(trace)
    }

    return traces
  } catch (error) {
    console.error("Error fetching LangSmith runs:", error)
    throw error
  }
}

// Fetch detailed run information including child runs
export async function fetchRunDetails(runId: string): Promise<LangSmithRun> {
  try {
    const headers: Record<string, string> = {}
    
    if (LANGSMITH_API_KEY) {
      if (LANGSMITH_API_KEY.startsWith("lsv2_")) {
        headers["x-api-key"] = LANGSMITH_API_KEY
      } else {
        headers["Authorization"] = `Bearer ${LANGSMITH_API_KEY}`
        headers["x-api-key"] = LANGSMITH_API_KEY
      }
    }

    const response = await fetch(
      `${LANGSMITH_ENDPOINT}/runs/${runId}`,
      {
        headers,
      }
    )

    if (!response.ok) {
      throw new Error(`LangSmith API error: ${response.status}`)
    }

    const run: LangSmithRun = await response.json()

    // Fetch child runs
    if (run.id) {
      let childrenRequestBody: any = {
        filter: `eq(parent_run_id, "${run.id}")`,
        order: "execution_order",
      }
      
      if (LANGSMITH_PROJECT) {
        childrenRequestBody.project_name = LANGSMITH_PROJECT
        childrenRequestBody.project = [LANGSMITH_PROJECT]
      }

      const childrenHeaders: Record<string, string> = {
        "Content-Type": "application/json",
      }
      
      if (LANGSMITH_API_KEY?.startsWith("lsv2_")) {
        childrenHeaders["x-api-key"] = LANGSMITH_API_KEY
      } else if (LANGSMITH_API_KEY) {
        childrenHeaders["Authorization"] = `Bearer ${LANGSMITH_API_KEY}`
        childrenHeaders["x-api-key"] = LANGSMITH_API_KEY
      }

      const childrenResponse = await fetch(
        `${LANGSMITH_ENDPOINT}/runs/query`,
        {
          method: "POST",
          headers: childrenHeaders,
          body: JSON.stringify(childrenRequestBody),
        }
      )

      if (childrenResponse.ok) {
        const childrenData = await childrenResponse.json()
        run.child_runs = childrenData.runs || []
      }
    }

    return run
  } catch (error) {
    console.error(`Error fetching run details for ${runId}:`, error)
    throw error
  }
}

// Fetch the latest trace
export async function fetchLatestTrace(): Promise<LangSmithTrace | null> {
  try {
    const traces = await fetchLangSmithRuns(1)
    return traces.length > 0 ? traces[0] : null
  } catch (error) {
    console.error("Error fetching latest trace:", error)
    return null
  }
}

// Fetch a specific trace by traceId
export async function fetchTraceById(traceId: string): Promise<LangSmithTrace | null> {
  try {
    if (!LANGSMITH_API_KEY) {
      throw new Error("LANGSMITH_API_KEY is not set. Please check your .env.local file.")
    }

    // First, try to query by trace_id
    let requestBody: any = {
      limit: 1,
      order: "desc",
      order_by: "start_time",
      filter: `eq(trace_id, "${traceId}")`,
    }
    
    if (LANGSMITH_PROJECT) {
      requestBody.project_name = LANGSMITH_PROJECT
      requestBody.project = [LANGSMITH_PROJECT]
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    if (LANGSMITH_API_KEY.startsWith("lsv2_")) {
      headers["x-api-key"] = LANGSMITH_API_KEY
    } else {
      headers["Authorization"] = `Bearer ${LANGSMITH_API_KEY}`
      headers["x-api-key"] = LANGSMITH_API_KEY
    }

    const response = await fetch(
      `${LANGSMITH_ENDPOINT}/runs/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      }
    )

    const responseText = await response.text()
    let data: any

    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse LangSmith API response:", responseText)
      throw new Error(`Invalid JSON response from LangSmith API: ${response.status} ${response.statusText}`)
    }

    if (!response.ok) {
      console.error("LangSmith API Error Response:", data)
      
      // If 403 and we're using a project filter, try without project to diagnose
      if (response.status === 403 && LANGSMITH_PROJECT) {
        console.log("403 Forbidden with project filter, trying without project to diagnose...")
        const fallbackBody: any = {
          limit: 10,
          order: "desc",
          order_by: "start_time",
          filter: "eq(parent_run_id, null)",
        }
        
        const fallbackResponse = await fetch(
          `${LANGSMITH_ENDPOINT}/runs/query`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(fallbackBody),
          }
        )
        
        if (fallbackResponse.ok) {
          const fallbackText = await fallbackResponse.text()
          const fallbackData = JSON.parse(fallbackText)
          console.warn(`⚠️ Successfully fetched WITHOUT project filter. This means:`)
          console.warn(`1. Your API key is valid`)
          console.warn(`2. The project "${LANGSMITH_PROJECT}" may not exist or you don't have access to it`)
          console.warn(`3. Available runs: ${fallbackData?.runs?.length || 0}`)
          console.warn(`4. Try checking your LangSmith dashboard for the correct project name`)
        } else {
          console.error("Even without project filter, API returned:", fallbackResponse.status)
        }
      }
      
      const errorDetail = data?.detail || data?.message || responseText
      const helpfulMessage = response.status === 403 
        ? `403 Forbidden: ${errorDetail || "Your API key may not have access to this project, or the project name '${LANGSMITH_PROJECT}' doesn't exist. Check your LangSmith dashboard for the correct project name."}`
        : `LangSmith API error: ${response.status} ${response.statusText}. ${errorDetail}`
      
      throw new Error(helpfulMessage)
    }

    const runs: LangSmithRun[] = data?.runs || data || []

    if (runs.length === 0) {
      // Try fetching by run ID if trace_id doesn't work
      try {
        const run = await fetchRunDetails(traceId)
        if (run) {
          return {
            traceId: run.trace_id || run.id,
            name: run.name,
            startTime: new Date(run.start_time).getTime(),
            endTime: run.end_time ? new Date(run.end_time).getTime() : undefined,
            status: mapStatus(run.status),
            rootNode: convertRunToTraceNode(run),
            totalDuration: run.end_time
              ? new Date(run.end_time).getTime() - new Date(run.start_time).getTime()
              : undefined,
            totalCost: run.extra?.metadata?.total_cost,
          }
        }
      } catch {
        return null
      }
      return null
    }

    const fullRun = await fetchRunDetails(runs[0].id)

    return {
      traceId: fullRun.trace_id || fullRun.id,
      name: fullRun.name,
      startTime: new Date(fullRun.start_time).getTime(),
      endTime: fullRun.end_time ? new Date(fullRun.end_time).getTime() : undefined,
      status: mapStatus(fullRun.status),
      rootNode: convertRunToTraceNode(fullRun),
      totalDuration: fullRun.end_time
        ? new Date(fullRun.end_time).getTime() - new Date(fullRun.start_time).getTime()
        : undefined,
      totalCost: fullRun.extra?.metadata?.total_cost,
    }
  } catch (error) {
    console.error(`Error fetching trace by ID ${traceId}:`, error)
    return null
  }
}

// Fetch traces filtered by time range
export async function fetchTracesByTimeRange(startTime: Date, endTime: Date, limit: number = 50): Promise<LangSmithTrace[]> {
  try {
    if (!LANGSMITH_API_KEY) {
      throw new Error("LANGSMITH_API_KEY is not set. Please check your .env.local file.")
    }

    const startTimeISO = startTime.toISOString()
    const endTimeISO = endTime.toISOString()

    // Try with project first, then without if it fails
    let requestBody: any = {
      limit,
      order: "desc",
      order_by: "start_time",
      filter: `and(eq(parent_run_id, null),gte(start_time, "${startTimeISO}"),lte(start_time, "${endTimeISO}"))`,
    }
    
    // Try just project as array first (LangSmith API standard format)
    if (LANGSMITH_PROJECT) {
      requestBody.project = [LANGSMITH_PROJECT]
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }
    
    if (LANGSMITH_API_KEY.startsWith("lsv2_")) {
      headers["x-api-key"] = LANGSMITH_API_KEY
    } else {
      headers["Authorization"] = `Bearer ${LANGSMITH_API_KEY}`
      headers["x-api-key"] = LANGSMITH_API_KEY
    }

    const response = await fetch(
      `${LANGSMITH_ENDPOINT}/runs/query`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(requestBody),
      }
    )

    const responseText = await response.text()
    let data: any

    try {
      data = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse LangSmith API response:", responseText)
      throw new Error(`Invalid JSON response from LangSmith API: ${response.status} ${response.statusText}`)
    }

    if (!response.ok) {
      console.error("LangSmith API Error Response:", data)
      
      // If 403 and we're using a project filter, try without project to diagnose
      if (response.status === 403 && LANGSMITH_PROJECT) {
        console.log("403 Forbidden with project filter, trying without project...")
        const fallbackBody: any = {
          limit,
          order: "desc",
          order_by: "start_time",
          filter: `and(eq(parent_run_id, null),gte(start_time, "${startTimeISO}"),lte(start_time, "${endTimeISO}"))`,
        }
        
        const fallbackResponse = await fetch(
          `${LANGSMITH_ENDPOINT}/runs/query`,
          {
            method: "POST",
            headers,
            body: JSON.stringify(fallbackBody),
          }
        )
        
        if (fallbackResponse.ok) {
          const fallbackText = await fallbackResponse.text()
          const fallbackData = JSON.parse(fallbackText)
          console.warn(`⚠️ Successfully fetched WITHOUT project filter. This means:`)
          console.warn(`1. Your API key is valid`)
          console.warn(`2. The project "${LANGSMITH_PROJECT}" may not exist or you don't have access to it`)
          console.warn(`3. Found ${fallbackData?.runs?.length || 0} runs without project filter`)
          console.warn(`4. Continuing with fetched data - check your LangSmith dashboard for the correct project name`)
          
          // Use the fallback data instead of throwing error
          const fallbackRuns: LangSmithRun[] = fallbackData?.runs || []
          
          // Process the fallback runs
          const traces: LangSmithTrace[] = []
          for (const run of fallbackRuns) {
            const fullRun = await fetchRunDetails(run.id)
            const trace: LangSmithTrace = {
              traceId: fullRun.trace_id || fullRun.id,
              name: fullRun.name,
              startTime: new Date(fullRun.start_time).getTime(),
              endTime: fullRun.end_time ? new Date(fullRun.end_time).getTime() : undefined,
              status: mapStatus(fullRun.status),
              rootNode: convertRunToTraceNode(fullRun),
              totalDuration: fullRun.end_time
                ? new Date(fullRun.end_time).getTime() - new Date(fullRun.start_time).getTime()
                : undefined,
              totalCost: fullRun.extra?.metadata?.total_cost,
            }
            traces.push(trace)
          }
          return traces
        } else {
          console.error("Even without project filter, API returned:", fallbackResponse.status)
        }
      }
      
      const errorDetail = data?.detail || data?.message || responseText
      const helpfulMessage = response.status === 403 
        ? `403 Forbidden: ${errorDetail || "Your API key may not have access to this project, or the project name '${LANGSMITH_PROJECT}' doesn't exist. Check your LangSmith dashboard for the correct project name."}`
        : `LangSmith API error: ${response.status} ${response.statusText}. ${errorDetail}`
      
      throw new Error(helpfulMessage)
    }

    const runs: LangSmithRun[] = data?.runs || data || []

    // Convert to our trace format
    const traces: LangSmithTrace[] = []

    for (const run of runs) {
      // Fetch full run details including children
      const fullRun = await fetchRunDetails(run.id)

      const trace: LangSmithTrace = {
        traceId: fullRun.trace_id || fullRun.id,
        name: fullRun.name,
        startTime: new Date(fullRun.start_time).getTime(),
        endTime: fullRun.end_time ? new Date(fullRun.end_time).getTime() : undefined,
        status: mapStatus(fullRun.status),
        rootNode: convertRunToTraceNode(fullRun),
        totalDuration: fullRun.end_time
          ? new Date(fullRun.end_time).getTime() - new Date(fullRun.start_time).getTime()
          : undefined,
        totalCost: fullRun.extra?.metadata?.total_cost,
      }

      traces.push(trace)
    }

    return traces
  } catch (error) {
    console.error("Error fetching traces by time range:", error)
    throw error
  }
}

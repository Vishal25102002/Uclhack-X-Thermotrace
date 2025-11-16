import agentTrace30 from '@/data/agent-trace-30.json'

export interface AgentTraceData {
  id: string
  name: string
  start_time: string
  end_time: string
  execution_time_ms: number
  status: string
  timestep_data: {
    datetime: string
    plant: {
      cooling: number
      power: number
      supplyTemp: number
    }
    chiller1: {
      rla: number
      power: number
      evapTemp: number | null
      condTemp: number
    }
    chiller2: {
      rla: number
      power: number
      evapTemp: number | null
      condTemp: number
    }
    chiller3: {
      rla: number
      power: number
      evapTemp: number | null
      condTemp: number
    }
    environment: {
      drybulb: number
      wetbulb: number
      humidity: number
    }
  }
  control_decision: {
    hasChanges: boolean
    staging: {
      chiller1: { previous: string; current: string }
      chiller2: { previous: string; current: string }
      chiller3: { previous: string; current: string }
    }
    setpoints: {
      chiller1: { previous: number | null; current: number | null }
      chiller2: { previous: number | null; current: number | null }
      chiller3: { previous: number | null; current: number | null }
    }
  }
  efficiency: {
    actual: number
    predicted: number
  }
  physics_predictions: {
    chiller1: number | null
    chiller2: number | null
    chiller3: number | null
    totalPredictedPower: number
  }
  validation: {
    violations: string[]
    anomalies: string[]
  }
  historical_chart_data: Array<{
    timestep: number
    cooling: number
    efficiency: number
  }>
  forecast_data: Array<{
    timestep: number
    cooling: number
  }>
  metadata?: any
  child_runs: any[]
}

export function loadAgentTraceData(timestepIndex?: number): AgentTraceData {
  // For now, we only have timestep 30's data
  // In production, this would load different traces based on timestepIndex
  return agentTrace30 as AgentTraceData
}

import {
  predictChiller1Power,
  predictChiller2Power,
  predictChiller3Power,
  checkPowerDeviation,
  getModelStats
} from './physicsModels'

// Import will be done dynamically to handle NaN values
let runData: any = null

async function loadRunData() {
  if (runData) return runData

  try {
    const response = await fetch('/data/run-2025-10-01.json')
    const text = await response.text()
    // Replace NaN with null for valid JSON parsing
    const cleanedText = text.replace(/:\s*NaN/g, ': null')
    runData = JSON.parse(cleanedText)
    return runData
  } catch (error) {
    console.error('Failed to load run data:', error)
    return {}
  }
}

export interface ChillerData {
  condTemp: number
  evapTemp: number | null
  rla: number
  power: number
  setpoint: number | null
}

export interface PlantData {
  cooling: number
  power: number
  supplyTemp: number
}

export interface EnvironmentData {
  drybulb: number
  humidity: number
  wetbulb: number
}

export interface TimestepData {
  datetime: string
  chiller1: ChillerData
  chiller2: ChillerData
  chiller3: ChillerData
  plant: PlantData
  environment: EnvironmentData
}

export interface ControlDecision {
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
  hasChanges: boolean
  reasoning: string
}

// Thresholds for violations
const THRESHOLDS = {
  RLA_MAX: 95, // Maximum safe RLA
  RLA_MIN: 30, // Minimum efficient RLA
  EVAP_TEMP_MIN: 42, // Too cold
  EVAP_TEMP_MAX: 55, // Too warm
  SETPOINT_MIN: 42,
  SETPOINT_MAX: 55,
}

export function parseTimestepData(index: number, data: any): TimestepData {
  const timestepData = data[index.toString()]

  return {
    datetime: timestepData.datetime,
    chiller1: {
      condTemp: timestepData.chiller_1_cond_entering_water_temperature,
      evapTemp: timestepData.chiller_1_evap_leaving_water_temperature,
      rla: timestepData.chiller_1_percentage_rla,
      power: timestepData.chiller_1_power,
      setpoint: timestepData.chiller_1_evap_leaving_water_set_temp,
    },
    chiller2: {
      condTemp: timestepData.chiller_2_cond_entering_water_temperature,
      evapTemp: timestepData.chiller_2_evap_leaving_water_temperature,
      rla: timestepData.chiller_2_percentage_rla,
      power: timestepData.chiller_2_power,
      setpoint: timestepData.chiller_2_evap_leaving_water_set_temp,
    },
    chiller3: {
      condTemp: timestepData.chiller_3_cond_entering_water_temperature,
      evapTemp: timestepData.chiller_3_evap_leaving_water_temperature,
      rla: timestepData.chiller_3_percentage_rla,
      power: timestepData.chiller_3_power,
      setpoint: timestepData.chiller_3_evap_leaving_water_set_temp,
    },
    plant: {
      cooling: timestepData.plant_cooling_rate,
      power: timestepData.plant_power,
      supplyTemp: timestepData.chilled_water_loop_supply_water_temperature,
    },
    environment: {
      drybulb: timestepData.outdoor_weather_station_drybulb_temperature,
      humidity: timestepData.outdoor_weather_station_humidity,
      wetbulb: timestepData.outdoor_weather_station_wetbulb_temperature,
    },
  }
}

export { loadRunData }

function isChillerOn(chiller: ChillerData): boolean {
  return chiller.rla > 0
}

export function detectControlDecision(currentIndex: number, data: any): ControlDecision {
  const current = parseTimestepData(currentIndex, data)
  const previous = currentIndex > 0 ? parseTimestepData(currentIndex - 1, data) : null

  const ch1Current = isChillerOn(current.chiller1) ? 'ON' : 'OFF'
  const ch2Current = isChillerOn(current.chiller2) ? 'ON' : 'OFF'
  const ch3Current = isChillerOn(current.chiller3) ? 'ON' : 'OFF'

  const ch1Previous = previous ? (isChillerOn(previous.chiller1) ? 'ON' : 'OFF') : ch1Current
  const ch2Previous = previous ? (isChillerOn(previous.chiller2) ? 'ON' : 'OFF') : ch2Current
  const ch3Previous = previous ? (isChillerOn(previous.chiller3) ? 'ON' : 'OFF') : ch3Current

  // Only count setpoint changes if chiller is ON
  const ch1SetpointChanged = ch1Current === 'ON' &&
    current.chiller1.setpoint !== (previous?.chiller1.setpoint ?? current.chiller1.setpoint)
  const ch2SetpointChanged = ch2Current === 'ON' &&
    current.chiller2.setpoint !== (previous?.chiller2.setpoint ?? current.chiller2.setpoint)
  const ch3SetpointChanged = ch3Current === 'ON' &&
    current.chiller3.setpoint !== (previous?.chiller3.setpoint ?? current.chiller3.setpoint)

  const hasChanges =
    ch1Current !== ch1Previous ||
    ch2Current !== ch2Previous ||
    ch3Current !== ch3Previous ||
    ch1SetpointChanged ||
    ch2SetpointChanged ||
    ch3SetpointChanged

  // Generate reasoning based on the decision
  let reasoning = `Load at ${current.plant.cooling.toFixed(0)} tons with ${current.environment.drybulb.toFixed(0)}°F outdoor temperature. `

  // Check for staging changes
  const stagingChanges = []
  if (ch1Current !== ch1Previous) stagingChanges.push(`CH1 ${ch1Previous} → ${ch1Current}`)
  if (ch2Current !== ch2Previous) stagingChanges.push(`CH2 ${ch2Previous} → ${ch2Current}`)
  if (ch3Current !== ch3Previous) stagingChanges.push(`CH3 ${ch3Previous} → ${ch3Current}`)

  if (stagingChanges.length > 0) {
    reasoning += `Staging changes: ${stagingChanges.join(', ')}. `
  }

  // Check for setpoint changes (only for chillers that are ON)
  const setpointChanges = []
  if (ch1SetpointChanged) {
    setpointChanges.push(`CH1 evap ${previous?.chiller1.setpoint?.toFixed(0) || '--'}°F → ${current.chiller1.setpoint?.toFixed(0) || '--'}°F`)
  }
  if (ch3SetpointChanged) {
    setpointChanges.push(`CH3 evap ${previous?.chiller3.setpoint?.toFixed(0) || '--'}°F → ${current.chiller3.setpoint?.toFixed(0) || '--'}°F`)
  }

  if (setpointChanges.length > 0) {
    reasoning += `Setpoint changes: ${setpointChanges.join(', ')}. `
  }

  // Add current status
  const activeChillers = []
  if (ch1Current === 'ON') activeChillers.push(`CH1 at ${current.chiller1.rla.toFixed(1)}% RLA`)
  if (ch2Current === 'ON') activeChillers.push(`CH2 at ${current.chiller2.rla.toFixed(1)}% RLA`)
  if (ch3Current === 'ON') activeChillers.push(`CH3 at ${current.chiller3.rla.toFixed(1)}% RLA`)

  if (activeChillers.length > 0) {
    reasoning += `Active: ${activeChillers.join(', ')}.`
  } else {
    reasoning += 'All chillers offline.'
  }

  return {
    staging: {
      chiller1: { previous: ch1Previous, current: ch1Current },
      chiller2: { previous: ch2Previous, current: ch2Current },
      chiller3: { previous: ch3Previous, current: ch3Current },
    },
    setpoints: {
      chiller1: {
        previous: previous?.chiller1.setpoint ?? null,
        current: current.chiller1.setpoint
      },
      chiller2: {
        previous: previous?.chiller2.setpoint ?? null,
        current: current.chiller2.setpoint
      },
      chiller3: {
        previous: previous?.chiller3.setpoint ?? null,
        current: current.chiller3.setpoint
      },
    },
    hasChanges,
    reasoning,
  }
}

export function checkViolations(data: TimestepData, hasControlDecision: boolean = false): {
  violations: string[]
  anomalies: string[]
} {
  const violations: string[] = []
  const anomalies: string[] = []

  // Check RLA violations (physical constraints)
  if (data.chiller1.rla > THRESHOLDS.RLA_MAX) {
    violations.push(`CH1 RLA exceeds safe limit (${data.chiller1.rla.toFixed(1)}% > ${THRESHOLDS.RLA_MAX}%)`)
  }
  if (data.chiller2.rla > THRESHOLDS.RLA_MAX) {
    violations.push(`CH2 RLA exceeds safe limit (${data.chiller2.rla.toFixed(1)}% > ${THRESHOLDS.RLA_MAX}%)`)
  }
  if (data.chiller3.rla > THRESHOLDS.RLA_MAX) {
    violations.push(`CH3 RLA exceeds safe limit (${data.chiller3.rla.toFixed(1)}% > ${THRESHOLDS.RLA_MAX}%)`)
  }

  // Check if running chillers are below minimum efficient RLA
  if (data.chiller1.rla > 0 && data.chiller1.rla < THRESHOLDS.RLA_MIN) {
    violations.push(`CH1 RLA below efficient range (${data.chiller1.rla.toFixed(1)}% < ${THRESHOLDS.RLA_MIN}%)`)
  }
  if (data.chiller2.rla > 0 && data.chiller2.rla < THRESHOLDS.RLA_MIN) {
    violations.push(`CH2 RLA below efficient range (${data.chiller2.rla.toFixed(1)}% < ${THRESHOLDS.RLA_MIN}%)`)
  }
  if (data.chiller3.rla > 0 && data.chiller3.rla < THRESHOLDS.RLA_MIN) {
    violations.push(`CH3 RLA below efficient range (${data.chiller3.rla.toFixed(1)}% < ${THRESHOLDS.RLA_MIN}%)`)
  }

  // Check evap temp violations (physical constraints)
  if (data.chiller1.evapTemp !== null) {
    if (data.chiller1.evapTemp < THRESHOLDS.EVAP_TEMP_MIN) {
      violations.push(`CH1 evap temp too cold (${data.chiller1.evapTemp.toFixed(1)}°F < ${THRESHOLDS.EVAP_TEMP_MIN}°F)`)
    }
    if (data.chiller1.evapTemp > THRESHOLDS.EVAP_TEMP_MAX) {
      violations.push(`CH1 evap temp too warm (${data.chiller1.evapTemp.toFixed(1)}°F > ${THRESHOLDS.EVAP_TEMP_MAX}°F)`)
    }
  }

  // Physics-based validation: ONLY run when a control decision was made
  // Models are ONLY VALID for single-chiller operation
  // Count how many chillers are running
  if (hasControlDecision && data.plant.cooling > 0) {
    const ch1Running = data.chiller1.rla > 10 && data.chiller1.evapTemp !== null
    const ch2Running = data.chiller2.rla > 10 && data.chiller2.evapTemp !== null
    const ch3Running = data.chiller3.rla > 10 && data.chiller3.evapTemp !== null
    const runningCount = [ch1Running, ch2Running, ch3Running].filter(Boolean).length

    // ONLY predict when exactly ONE chiller is running
    // Models predict PLANT power for single-chiller operation and are NOT valid for multi-chiller
    if (runningCount === 1) {
      let predictedPower = 0

      if (ch1Running && data.chiller1.evapTemp !== null) {
        predictedPower = predictChiller1Power(data.chiller1.evapTemp, data.chiller1.condTemp, data.plant.cooling)
      } else if (ch2Running && data.chiller2.evapTemp !== null) {
        predictedPower = predictChiller2Power(data.chiller2.evapTemp, data.chiller2.condTemp, data.plant.cooling)
      } else if (ch3Running && data.chiller3.evapTemp !== null) {
        predictedPower = predictChiller3Power(data.chiller3.evapTemp, data.chiller3.condTemp, data.plant.cooling)
      }

      // Calculate predicted efficiency and compare with actual
      const predictedEfficiency = predictedPower / data.plant.cooling  // kW/ton
      const actualEfficiency = data.plant.power / data.plant.cooling  // kW/ton
      const efficiencyDiff = actualEfficiency - predictedEfficiency  // Positive means worse (higher kW/ton)
      const efficiencyDiffPercent = (efficiencyDiff / predictedEfficiency) * 100

      // If efficiency differs from predicted by >10% in either direction, it's an ANOMALY
      if (Math.abs(efficiencyDiffPercent) > 10) {
        const diffDirection = efficiencyDiff > 0 ? 'worse' : 'better'
        anomalies.push(
          `Plant efficiency ${diffDirection} than physics model predicts (actual: ${actualEfficiency.toFixed(2)} kW/ton vs predicted: ${predictedEfficiency.toFixed(2)} kW/ton, ${Math.abs(efficiencyDiffPercent).toFixed(1)}% ${diffDirection})`
        )
      }
    }
  }

  return { violations, anomalies }
}

export function getEfficiency(data: TimestepData): number {
  return data.plant.cooling > 0 ? data.plant.power / data.plant.cooling : 0
}

/**
 * Get physics model predictions for the running chiller
 * ONLY valid when exactly ONE chiller is running (models trained on single-chiller operation)
 */
export function getPhysicsPredictions(data: TimestepData, hasControlDecision: boolean = false) {
  const predictions = {
    chiller1: null as number | null,
    chiller2: null as number | null,
    chiller3: null as number | null,
  }

  // Only predict when a control decision was made
  if (!hasControlDecision) {
    return predictions
  }

  // Count running chillers
  const ch1Running = data.chiller1.rla > 10 && data.chiller1.evapTemp !== null
  const ch2Running = data.chiller2.rla > 10 && data.chiller2.evapTemp !== null
  const ch3Running = data.chiller3.rla > 10 && data.chiller3.evapTemp !== null
  const runningCount = [ch1Running, ch2Running, ch3Running].filter(Boolean).length

  // ONLY predict when exactly ONE chiller is running
  // Models predict PLANT power and are NOT valid for multi-chiller operation
  if (runningCount === 1) {
    if (ch1Running && data.chiller1.evapTemp !== null) {
      predictions.chiller1 = predictChiller1Power(
        data.chiller1.evapTemp,
        data.chiller1.condTemp,
        data.plant.cooling
      )
    } else if (ch2Running && data.chiller2.evapTemp !== null) {
      predictions.chiller2 = predictChiller2Power(
        data.chiller2.evapTemp,
        data.chiller2.condTemp,
        data.plant.cooling
      )
    } else if (ch3Running && data.chiller3.evapTemp !== null) {
      predictions.chiller3 = predictChiller3Power(
        data.chiller3.evapTemp,
        data.chiller3.condTemp,
        data.plant.cooling
      )
    }
  }

  return predictions
}

/**
 * Get predicted plant efficiency based on physics models
 * ONLY valid when exactly ONE chiller is running (models trained on single-chiller operation)
 * Returns predicted efficiency (kW/ton) and predicted power
 */
export function getPredictedEfficiency(data: TimestepData, hasControlDecision: boolean = false): {
  predictedEfficiency: number | null
  totalPredictedPower: number | null
} {
  if (!hasControlDecision || data.plant.cooling === 0) {
    return { predictedEfficiency: null, totalPredictedPower: null }
  }

  // Count running chillers
  const ch1Running = data.chiller1.rla > 10 && data.chiller1.evapTemp !== null
  const ch2Running = data.chiller2.rla > 10 && data.chiller2.evapTemp !== null
  const ch3Running = data.chiller3.rla > 10 && data.chiller3.evapTemp !== null
  const runningCount = [ch1Running, ch2Running, ch3Running].filter(Boolean).length

  // ONLY predict when exactly ONE chiller is running
  // Models predict PLANT power and are NOT valid for multi-chiller operation
  if (runningCount !== 1) {
    return { predictedEfficiency: null, totalPredictedPower: null }
  }

  let predictedPower = 0

  if (ch1Running && data.chiller1.evapTemp !== null) {
    predictedPower = predictChiller1Power(data.chiller1.evapTemp, data.chiller1.condTemp, data.plant.cooling)
  } else if (ch2Running && data.chiller2.evapTemp !== null) {
    predictedPower = predictChiller2Power(data.chiller2.evapTemp, data.chiller2.condTemp, data.plant.cooling)
  } else if (ch3Running && data.chiller3.evapTemp !== null) {
    predictedPower = predictChiller3Power(data.chiller3.evapTemp, data.chiller3.condTemp, data.plant.cooling)
  }

  const predictedEfficiency = predictedPower / data.plant.cooling

  return { predictedEfficiency, totalPredictedPower: predictedPower }
}

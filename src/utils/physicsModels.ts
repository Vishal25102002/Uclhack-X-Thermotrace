// Physics-based chiller performance models
// Trained polynomial regression models for PLANT POWER prediction
// IMPORTANT: Models predict total plant power when ONLY ONE chiller is running
// Models are NOT VALID for multi-chiller operation

interface ChillerModelCoefficients {
  intercept: number
  coefficients: number[]
  rmse: number
  r2: number
}

// Chiller 1 Model (500 tons)
// R² = 0.8522, RMSE = 13.20 kW
const CHILLER_1_MODEL: ChillerModelCoefficients = {
  intercept: 4721.09,
  coefficients: [
    -8.078101,    // evap_temp
    -122.343705,  // cond_temp
    2.216326,     // cooling_rate
    -0.189299,    // evap_temp^2
    0.326569,     // evap_temp × cond_temp
    0.002742,     // evap_temp × cooling_rate
    0.765678,     // cond_temp^2
    -0.033574,    // cond_temp × cooling_rate
    0.001007      // cooling_rate^2
  ],
  rmse: 13.20,
  r2: 0.8522
}

// Chiller 2 Model (500 tons)
// R² = 0.8733, RMSE = 12.32 kW
const CHILLER_2_MODEL: ChillerModelCoefficients = {
  intercept: 2285.38,
  coefficients: [
    17.175637,    // evap_temp
    -69.869946,   // cond_temp
    0.979994,     // cooling_rate
    -0.024797,    // evap_temp^2
    -0.197040,    // evap_temp × cond_temp
    0.005032,     // evap_temp × cooling_rate
    0.523248,     // cond_temp^2
    -0.007353,    // cond_temp × cooling_rate
    -0.000037     // cooling_rate^2
  ],
  rmse: 12.32,
  r2: 0.8733
}

// Chiller 3 Model (375 tons)
// R² = 0.9792, RMSE = 4.69 kW
const CHILLER_3_MODEL: ChillerModelCoefficients = {
  intercept: 1503.01,
  coefficients: [
    -52.879134,   // evap_temp
    -10.888671,   // cond_temp
    1.547344,     // cooling_rate
    0.125490,     // evap_temp^2
    0.657254,     // evap_temp × cond_temp
    -0.039538,    // evap_temp × cooling_rate
    -0.109687,    // cond_temp^2
    -0.001288,    // cond_temp × cooling_rate
    0.001866      // cooling_rate^2
  ],
  rmse: 4.69,
  r2: 0.9792
}

/**
 * Generate polynomial features (degree 2) from input features
 * Matches sklearn's PolynomialFeatures with degree=2, include_bias=False
 *
 * Input: [x1, x2, x3]
 * Output: [x1, x2, x3, x1^2, x1*x2, x1*x3, x2^2, x2*x3, x3^2]
 */
function polynomialFeatures(features: number[]): number[] {
  const [x1, x2, x3] = features

  return [
    x1,           // evap_temp
    x2,           // cond_temp
    x3,           // cooling_rate
    x1 * x1,      // evap_temp^2
    x1 * x2,      // evap_temp × cond_temp
    x1 * x3,      // evap_temp × cooling_rate
    x2 * x2,      // cond_temp^2
    x2 * x3,      // cond_temp × cooling_rate
    x3 * x3       // cooling_rate^2
  ]
}

/**
 * Predict PLANT power consumption using polynomial regression model
 * IMPORTANT: Only valid when the specified chiller is the ONLY one running
 *
 * @param evapTemp - Evaporator leaving water temperature (°F)
 * @param condTemp - Condenser entering water temperature (°F)
 * @param coolingRate - Plant cooling rate (tons)
 * @param model - Model coefficients
 * @returns Predicted PLANT power consumption (kW)
 */
function predictPower(
  evapTemp: number,
  condTemp: number,
  coolingRate: number,
  model: ChillerModelCoefficients
): number {
  const features = polynomialFeatures([evapTemp, condTemp, coolingRate])

  let power = model.intercept
  for (let i = 0; i < model.coefficients.length; i++) {
    power += model.coefficients[i] * features[i]
  }

  return power
}

/**
 * Predict PLANT power when ONLY Chiller 1 (500 tons) is running
 * Model trained on 6551 samples of single-chiller operation
 */
export function predictChiller1Power(
  evapTemp: number,
  condTemp: number,
  coolingRate: number
): number {
  return predictPower(evapTemp, condTemp, coolingRate, CHILLER_1_MODEL)
}

/**
 * Predict PLANT power when ONLY Chiller 2 (500 tons) is running
 * Model trained on 3857 samples of single-chiller operation
 */
export function predictChiller2Power(
  evapTemp: number,
  condTemp: number,
  coolingRate: number
): number {
  return predictPower(evapTemp, condTemp, coolingRate, CHILLER_2_MODEL)
}

/**
 * Predict PLANT power when ONLY Chiller 3 (375 tons) is running
 * Model trained on 455 samples of single-chiller operation
 */
export function predictChiller3Power(
  evapTemp: number,
  condTemp: number,
  coolingRate: number
): number {
  return predictPower(evapTemp, condTemp, coolingRate, CHILLER_3_MODEL)
}

/**
 * Get model statistics for a chiller
 */
export function getModelStats(chillerNumber: 1 | 2 | 3): { rmse: number; r2: number } {
  const model = chillerNumber === 1 ? CHILLER_1_MODEL :
                chillerNumber === 2 ? CHILLER_2_MODEL :
                CHILLER_3_MODEL

  return { rmse: model.rmse, r2: model.r2 }
}

/**
 * Check if actual power deviates significantly from predicted
 * Uses 2× RMSE as threshold (95% confidence interval for normal distribution)
 */
export function checkPowerDeviation(
  actualPower: number,
  predictedPower: number,
  rmse: number
): { isDeviation: boolean; errorPercent: number; errorAbsolute: number } {
  const errorAbsolute = Math.abs(actualPower - predictedPower)
  const errorPercent = (errorAbsolute / predictedPower) * 100
  const threshold = 2 * rmse // 2× RMSE for 95% confidence

  return {
    isDeviation: errorAbsolute > threshold,
    errorPercent,
    errorAbsolute
  }
}

// Validation thresholds
// This file will be implemented later

export const VALIDATION_THRESHOLDS = {
  // Accuracy thresholds (percentage)
  EXCELLENT: 95,
  GOOD: 85,
  FAIR: 70,
  POOR: 50,

  // Temperature thresholds (Celsius)
  TEMPERATURE_MIN: 15,
  TEMPERATURE_MAX: 35,
  TEMPERATURE_OPTIMAL_MIN: 18,
  TEMPERATURE_OPTIMAL_MAX: 24,

  // Power thresholds (kW)
  POWER_WARNING: 1000,
  POWER_CRITICAL: 1500,
  POWER_MAX: 2000,

  // Confidence thresholds (percentage)
  CONFIDENCE_HIGH: 90,
  CONFIDENCE_MEDIUM: 70,
  CONFIDENCE_LOW: 50,
} as const;

export function getAccuracyLevel(accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (accuracy >= VALIDATION_THRESHOLDS.EXCELLENT) return 'excellent';
  if (accuracy >= VALIDATION_THRESHOLDS.GOOD) return 'good';
  if (accuracy >= VALIDATION_THRESHOLDS.FAIR) return 'fair';
  return 'poor';
}

export function isTemperatureOptimal(temp: number): boolean {
  return temp >= VALIDATION_THRESHOLDS.TEMPERATURE_OPTIMAL_MIN &&
         temp <= VALIDATION_THRESHOLDS.TEMPERATURE_OPTIMAL_MAX;
}

export function getPowerStatus(power: number): 'normal' | 'warning' | 'critical' {
  if (power >= VALIDATION_THRESHOLDS.POWER_CRITICAL) return 'critical';
  if (power >= VALIDATION_THRESHOLDS.POWER_WARNING) return 'warning';
  return 'normal';
}

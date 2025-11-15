// Prediction vs reality diff calculations
// This file will be implemented later

export function calculateDifference(predicted: number, actual: number): number {
  // Stub implementation
  return actual - predicted;
}

export function calculatePercentageDifference(predicted: number, actual: number): number {
  // Stub implementation
  if (predicted === 0) return 0;
  return ((actual - predicted) / predicted) * 100;
}

export function calculateAbsoluteDifference(predicted: number, actual: number): number {
  // Stub implementation
  return Math.abs(actual - predicted);
}

export interface DifferenceStats {
  absolute: number;
  percentage: number;
  isOverPredicted: boolean;
  isUnderPredicted: boolean;
}

export function getDifferenceStats(predicted: number, actual: number): DifferenceStats {
  // Stub implementation
  const diff = calculateDifference(predicted, actual);
  return {
    absolute: Math.abs(diff),
    percentage: calculatePercentageDifference(predicted, actual),
    isOverPredicted: diff < 0,
    isUnderPredicted: diff > 0,
  };
}

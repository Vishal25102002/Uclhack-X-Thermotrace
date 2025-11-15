// Validation result types
// This file will be implemented later

export type ValidationStatus = 'valid' | 'invalid' | 'warning' | 'pending';

export interface ValidationResult {
  status: ValidationStatus;
  message?: string;
  errors?: string[];
  warnings?: string[];
}

export interface ValidationMetrics {
  accuracy: number;
  precision: number;
  recall: number;
  f1Score: number;
  timestamp: string;
}

export interface ValidationComparison {
  predicted: number;
  actual: number;
  difference: number;
  percentageDifference: number;
  isValid: boolean;
  threshold: number;
}

export interface ValidationReport {
  id: string;
  timestamp: string;
  metrics: ValidationMetrics;
  comparisons: ValidationComparison[];
  summary: {
    totalSamples: number;
    validSamples: number;
    invalidSamples: number;
    averageAccuracy: number;
  };
}

export type ValidationType = 'prediction' | 'threshold' | 'range' | 'custom';

export interface ValidationRule {
  type: ValidationType;
  field: string;
  threshold?: number;
  min?: number;
  max?: number;
  customValidator?: (value: unknown) => boolean;
}

// Color constants matching CSS variables
// Uniform colors - no gradients

export const colors = {
  // Status colors
  success: "#10B981", // Green-500
  warning: "#F59E0B", // Amber-500
  error: "#EF4444", // Red-500
  info: "#3B82F6", // Blue-500

  // Event type colors - Energy status
  agentDecision: "#10B981", // Green-500 - Normal operation
  alert: "#F59E0B", // Yellow/Amber-500 - Warning
  manualOverride: "#EF4444", // Red-500 - Critical/Override

  // Neutral colors
  background: "#FFFFFF",
  backgroundSecondary: "#F9FAFB",
  textPrimary: "#111827",
  textSecondary: "#6B7280",
  border: "#E5E7EB",
} as const;

// Temperature color mapping
export const temperatureColors = {
  cold: "#3B82F6", // Blue: < 15°C
  moderate: "#10B981", // Green: 15-25°C
  warm: "#F59E0B", // Orange: 25-35°C
  hot: "#EF4444", // Red: > 35°C
} as const;

// Status color map
export const statusColors = {
  normal: colors.success,
  warning: colors.warning,
  critical: colors.error,
  info: colors.info,
} as const;

// Get temperature color based on value
export function getTemperatureColor(temp: number): string {
  if (temp < 15) return temperatureColors.cold;
  if (temp <= 25) return temperatureColors.moderate;
  if (temp <= 35) return temperatureColors.warm;
  return temperatureColors.hot;
}

// Get status color
export function getStatusColor(status: "normal" | "warning" | "critical" | "info"): string {
  return statusColors[status];
}

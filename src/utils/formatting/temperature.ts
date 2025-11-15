// Temperature formatting
// This file will be implemented later

export function formatTemperature(temp: number, unit: 'C' | 'F' = 'C', decimals: number = 1): string {
  // Stub implementation
  const value = unit === 'F' ? celsiusToFahrenheit(temp) : temp;
  return `${value.toFixed(decimals)}°${unit}`;
}

export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9/5) + 32;
}

export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5/9;
}

export function formatTemperatureRange(min: number, max: number, unit: 'C' | 'F' = 'C'): string {
  return `${formatTemperature(min, unit)} - ${formatTemperature(max, unit)}`;
}

export function getTemperatureStatus(temp: number): 'cold' | 'normal' | 'warm' | 'hot' {
  if (temp < 15) return 'cold';
  if (temp <= 25) return 'normal';
  if (temp <= 35) return 'warm';
  return 'hot';
}

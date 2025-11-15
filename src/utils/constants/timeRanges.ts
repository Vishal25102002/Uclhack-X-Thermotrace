// Time range presets (24h, 7d, 30d)
// This file will be implemented later

export const TIME_RANGES = {
  TWENTY_FOUR_HOURS: '24h',
  SEVEN_DAYS: '7d',
  THIRTY_DAYS: '30d',
  CUSTOM: 'custom',
} as const;

export type TimeRangeKey = typeof TIME_RANGES[keyof typeof TIME_RANGES];

export interface TimeRangeConfig {
  label: string;
  value: TimeRangeKey;
  milliseconds: number;
}

export const TIME_RANGE_CONFIGS: TimeRangeConfig[] = [
  {
    label: 'Last 24 Hours',
    value: TIME_RANGES.TWENTY_FOUR_HOURS,
    milliseconds: 24 * 60 * 60 * 1000,
  },
  {
    label: 'Last 7 Days',
    value: TIME_RANGES.SEVEN_DAYS,
    milliseconds: 7 * 24 * 60 * 60 * 1000,
  },
  {
    label: 'Last 30 Days',
    value: TIME_RANGES.THIRTY_DAYS,
    milliseconds: 30 * 24 * 60 * 60 * 1000,
  },
  {
    label: 'Custom Range',
    value: TIME_RANGES.CUSTOM,
    milliseconds: 0,
  },
];

export function getTimeRangeMilliseconds(range: TimeRangeKey): number {
  const config = TIME_RANGE_CONFIGS.find(c => c.value === range);
  return config?.milliseconds || 0;
}

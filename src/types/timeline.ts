export type TimelineEventType = "decision" | "alert" | "override"

export interface TimelineEvent {
  id: string
  timestamp: Date
  type: TimelineEventType
  title: string
  description?: string
  confidence?: number
  impact?: string
  data?: Record<string, unknown>
}

export type TimeRange = "24h" | "7d" | "30d" | "custom"

export interface TimelineViewState {
  timeRange: TimeRange
  startDate: Date
  endDate: Date
  selectedEventId?: string
  zoomLevel: number // 1 = 1 minute per pixel, etc.
}

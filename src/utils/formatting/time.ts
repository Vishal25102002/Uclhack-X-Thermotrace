/**
 * Format time utilities for display
 */

export function formatTime(date: Date): string {
  return date.toLocaleTimeString("en-US", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString("en-US", {
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  })
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  })
}

export function getTimeRangeDates(range: "24h" | "7d" | "30d" | "custom", customStart?: Date, customEnd?: Date): { start: Date; end: Date } {
  const now = new Date()
  let start: Date

  switch (range) {
    case "24h":
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    case "7d":
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      break
    case "30d":
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      break
    case "custom":
      start = customStart || new Date(now.getTime() - 24 * 60 * 60 * 1000)
      break
    default:
      start = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  }

  return {
    start,
    end: range === "custom" && customEnd ? customEnd : now,
  }
}

export function getHoursInRange(start: Date, end: Date): Date[] {
  const hours: Date[] = []
  const current = new Date(start)
  current.setMinutes(0, 0, 0)

  while (current <= end) {
    hours.push(new Date(current))
    current.setHours(current.getHours() + 1)
  }

  return hours
}

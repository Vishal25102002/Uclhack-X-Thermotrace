import { TimelineEvent } from "@/types/timeline"

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: "event-1",
    timestamp: new Date(Date.now() - 3600000), // 1 hour ago
    type: "decision",
    title: "Cooling Adjustment",
    description: "AI agent adjusted cooling setpoint by -2°C",
    confidence: 0.92,
    data: {
      previousTemp: 24.5,
      newTemp: 22.5,
      status: "success"
    }
  },
  {
    id: "event-2",
    timestamp: new Date(Date.now() - 7200000), // 2 hours ago
    type: "alert",
    title: "Temperature Anomaly Detected",
    description: "Unusual temperature spike in Zone A",
    confidence: 0.85,
    data: {
      zone: "A",
      peakTemp: 26.8,
      status: "warning"
    }
  },
  {
    id: "event-3",
    timestamp: new Date(Date.now() - 10800000), // 3 hours ago
    type: "decision",
    title: "Energy Optimization",
    description: "System optimized for energy efficiency",
    confidence: 0.88,
    impact: "positive",
    data: {
      savingsPercent: 15,
      status: "success"
    }
  },
  {
    id: "event-4",
    timestamp: new Date(Date.now() - 14400000), // 4 hours ago
    type: "decision",
    title: "Fan Speed Increase",
    description: "Increased fan speed to improve circulation",
    confidence: 0.78,
    data: {
      previousSpeed: 60,
      newSpeed: 75,
      status: "success"
    }
  },
  {
    id: "event-5",
    timestamp: new Date(Date.now() - 18000000), // 5 hours ago
    type: "decision",
    title: "System Health Check",
    description: "All systems operational",
    confidence: 0.98,
    data: {
      healthScore: 98,
      status: "success"
    }
  }
]

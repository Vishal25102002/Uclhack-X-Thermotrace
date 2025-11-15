// WebSocket configuration
// This file will be implemented later

export const WEBSOCKET_CONFIG = {
  url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3000/api/websocket',
  reconnectInterval: 5000,
  maxReconnectAttempts: 5,
} as const

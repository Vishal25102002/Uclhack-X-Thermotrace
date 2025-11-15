// WebSocket message types
// This file will be implemented later

export type WebSocketMessageType =
  | 'connect'
  | 'disconnect'
  | 'data'
  | 'error'
  | 'ping'
  | 'pong';

export interface WebSocketMessage {
  type: WebSocketMessageType;
  timestamp: string;
  payload?: unknown;
}

export interface WebSocketDataMessage extends WebSocketMessage {
  type: 'data';
  payload: {
    channel: string;
    data: unknown;
  };
}

export interface WebSocketErrorMessage extends WebSocketMessage {
  type: 'error';
  payload: {
    code: string;
    message: string;
  };
}

export interface WebSocketConfig {
  url: string;
  reconnect?: boolean;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
}

export type WebSocketStatus = 'connecting' | 'connected' | 'disconnected' | 'error';

export interface WebSocketState {
  status: WebSocketStatus;
  error?: string;
  lastMessage?: WebSocketMessage;
}

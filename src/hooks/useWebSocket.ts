import { useEffect, useRef, useState } from 'react';

export interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: unknown | null;
  send: (data: unknown) => void;
  connect: () => void;
  disconnect: () => void;
}

export default function useWebSocket(url?: string): UseWebSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<unknown | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const connect = () => {
    // Stub implementation - will be implemented later
    setIsConnected(true);
  };

  const disconnect = () => {
    // Stub implementation - will be implemented later
    setIsConnected(false);
  };

  const send = (data: unknown) => {
    // Stub implementation - will be implemented later
    console.log('WebSocket send (stub):', data);
  };

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  return {
    isConnected,
    lastMessage,
    send,
    connect,
    disconnect,
  };
}

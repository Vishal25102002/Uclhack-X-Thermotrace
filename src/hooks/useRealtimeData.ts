import { useState, useEffect } from 'react';

export interface UseRealtimeDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export default function useRealtimeData<T = unknown>(
  channel?: string
): UseRealtimeDataReturn<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = () => {
    // Stub implementation - will be implemented later
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
    }, 100);
  };

  useEffect(() => {
    // Stub implementation - simulate initial load
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [channel]);

  return {
    data,
    loading,
    error,
    refetch,
  };
}

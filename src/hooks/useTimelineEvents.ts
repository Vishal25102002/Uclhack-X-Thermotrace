import { useState, useEffect } from 'react';
import type { TimelineEvent } from '@/types/timeline';

export interface UseTimelineEventsReturn {
  events: TimelineEvent[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export default function useTimelineEvents(
  timeRange?: string
): UseTimelineEventsReturn {
  const [events, setEvents] = useState<TimelineEvent[]>([]);
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
      setEvents([]);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [timeRange]);

  return {
    events,
    loading,
    error,
    refetch,
  };
}

import { useState, useCallback } from 'react';
import type { TimelineViewState, TimeRange } from '@/types/timeline';

export interface UseTimelineZoomReturn {
  viewState: TimelineViewState;
  setTimeRange: (range: TimeRange) => void;
  setZoomLevel: (level: number) => void;
  setCustomRange: (start: Date, end: Date) => void;
  selectEvent: (eventId: string | undefined) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

export default function useTimelineZoom(): UseTimelineZoomReturn {
  const [viewState, setViewState] = useState<TimelineViewState>({
    timeRange: '24h',
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
    endDate: new Date(),
    zoomLevel: 1,
  });

  const setTimeRange = useCallback((range: TimeRange) => {
    // Stub implementation - will be implemented later
    setViewState((prev) => ({
      ...prev,
      timeRange: range,
    }));
  }, []);

  const setZoomLevel = useCallback((level: number) => {
    // Stub implementation - will be implemented later
    setViewState((prev) => ({
      ...prev,
      zoomLevel: Math.max(0.1, Math.min(10, level)),
    }));
  }, []);

  const setCustomRange = useCallback((start: Date, end: Date) => {
    // Stub implementation - will be implemented later
    setViewState((prev) => ({
      ...prev,
      timeRange: 'custom',
      startDate: start,
      endDate: end,
    }));
  }, []);

  const selectEvent = useCallback((eventId: string | undefined) => {
    // Stub implementation - will be implemented later
    setViewState((prev) => ({
      ...prev,
      selectedEventId: eventId,
    }));
  }, []);

  const zoomIn = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoomLevel: Math.min(10, prev.zoomLevel * 1.5),
    }));
  }, []);

  const zoomOut = useCallback(() => {
    setViewState((prev) => ({
      ...prev,
      zoomLevel: Math.max(0.1, prev.zoomLevel / 1.5),
    }));
  }, []);

  return {
    viewState,
    setTimeRange,
    setZoomLevel,
    setCustomRange,
    selectEvent,
    zoomIn,
    zoomOut,
  };
}

import { useState, useEffect } from 'react';

export interface Decision {
  id: string;
  timestamp: Date;
  type: string;
  description: string;
  confidence?: number;
  outcome?: string;
  [key: string]: unknown;
}

export interface UseDecisionDetailReturn {
  decision: Decision | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

export default function useDecisionDetail(
  decisionId?: string
): UseDecisionDetailReturn {
  const [decision, setDecision] = useState<Decision | null>(null);
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
    if (!decisionId) {
      setLoading(false);
      return;
    }

    // Stub implementation - simulate initial load
    setLoading(true);
    const timer = setTimeout(() => {
      setDecision(null);
      setLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, [decisionId]);

  return {
    decision,
    loading,
    error,
    refetch,
  };
}

// Decision-related types (Decision, Action, Outcome)
// This file will be implemented later

export type DecisionStatus = 'pending' | 'approved' | 'rejected' | 'executed' | 'cancelled';

export type DecisionType = 'automated' | 'manual' | 'hybrid';

export interface Decision {
  id: string;
  type: DecisionType;
  status: DecisionStatus;
  timestamp: string;
  description: string;
  confidence?: number;
  rationale?: string;
  actions: Action[];
  outcome?: Outcome;
  metadata?: Record<string, unknown>;
}

export type ActionType =
  | 'adjust_temperature'
  | 'adjust_power'
  | 'start_equipment'
  | 'stop_equipment'
  | 'alert'
  | 'custom';

export interface Action {
  id: string;
  type: ActionType;
  description: string;
  parameters: Record<string, unknown>;
  executedAt?: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: unknown;
}

export interface Outcome {
  id: string;
  decisionId: string;
  success: boolean;
  timestamp: string;
  metrics: {
    predicted: Record<string, number>;
    actual: Record<string, number>;
  };
  impact?: {
    energySaved?: number;
    costSaved?: number;
    efficiency?: number;
  };
  notes?: string;
}

export interface DecisionCriteria {
  minConfidence: number;
  requiresApproval: boolean;
  allowedTypes: DecisionType[];
  maxActions: number;
}

export interface DecisionContext {
  systemState: unknown;
  historicalData?: unknown[];
  constraints?: Record<string, unknown>;
  objectives?: string[];
}

export interface DecisionRecommendation {
  decision: Omit<Decision, 'id' | 'status'>;
  reasoning: string;
  alternatives?: Omit<Decision, 'id' | 'status'>[];
  risks?: string[];
  benefits?: string[];
}

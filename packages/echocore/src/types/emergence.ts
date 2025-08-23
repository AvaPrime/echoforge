export type EmergenceEventType =
  | 'ConflictCascade'
  | 'VectorClockDivergence'
  | 'RollbackChain';

export interface EmergencePattern {
  type: EmergenceEventType;
  timestamp: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: Record<string, any>;
}

export interface ConflictEvent {
  id: string;
  nodeId: string;
  timestamp: number;
  vectorClockSkew: number;
  type: string;
}

export interface RollbackEvent {
  id: string;
  nodeId: string;
  timestamp: number;
  cause: 'conflict' | 'rollback' | 'timeout';
  depth: number;
}

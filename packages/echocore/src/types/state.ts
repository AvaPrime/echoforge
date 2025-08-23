export interface AgentState {
  id: string;
  memory: any;
  state: string;
}

export interface Snapshot {
  timestamp: number;
  agents: AgentState[];
  metrics: any;
  clocks: Record<string, number>;
  hash: string;
}

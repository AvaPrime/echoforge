import { AgentState, Snapshot } from '../types/state';
import { hashObject } from '../utils/hash';

export class StateSnapshotEncoder {
  constructor(
    private getAgentStates: () => AgentState[],
    private getMetrics: () => any,
    private getVectorClocks: () => Record<string, number>
  ) {}

  createSnapshot(): Snapshot {
    const state = {
      timestamp: Date.now(),
      agents: this.getAgentStates(),
      metrics: this.getMetrics(),
      clocks: this.getVectorClocks(),
    };

    return {
      ...state,
      hash: hashObject(state),
    };
  }

  restoreSnapshot(snapshot: Snapshot): void {
    // Implementation would dispatch restoration events
    // to orchestrator components
  }

  compareSnapshots(a: Snapshot, b: Snapshot): boolean {
    return a.hash === b.hash;
  }

  getSnapshotDiff(before: Snapshot, after: Snapshot): any {
    return {
      agentChanges: after.agents.length - before.agents.length,
      clockDrift: Object.keys(after.clocks).reduce((drift, nodeId) => {
        return Math.max(
          drift,
          Math.abs(after.clocks[nodeId] - (before.clocks[nodeId] || 0))
        );
      }, 0),
      timeDelta: after.timestamp - before.timestamp,
    };
  }
}

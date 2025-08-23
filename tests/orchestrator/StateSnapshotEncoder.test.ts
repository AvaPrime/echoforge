import { StateSnapshotEncoder } from '../../packages/echocore/src/orchestrator/StateSnapshotEncoder';
import { AgentState } from '../../packages/echocore/src/types/state';

describe('StateSnapshotEncoder', () => {
  const mockAgents: AgentState[] = [
    { id: 'agent-1', memory: { key: 'value' }, state: 'idle' },
  ];

  const encoder = new StateSnapshotEncoder(
    () => mockAgents,
    () => ({ conflicts: 0, resolved: 0 }),
    () => ({ 'agent-1': 1, 'agent-2': 2 })
  );

  test('creates snapshot with hash', () => {
    const snapshot = encoder.createSnapshot();

    expect(snapshot.hash).toBeDefined();
    expect(snapshot.agents).toEqual(mockAgents);
    expect(snapshot.metrics.conflicts).toBe(0);
    expect(snapshot.clocks['agent-1']).toBe(1);
  });

  test('compares snapshots correctly', () => {
    const snap1 = encoder.createSnapshot();
    const snap2 = encoder.createSnapshot();

    expect(encoder.compareSnapshots(snap1, snap2)).toBe(true);
  });

  test('calculates snapshot diff', () => {
    const before = encoder.createSnapshot();

    // Simulate state change
    mockAgents.push({ id: 'agent-2', memory: {}, state: 'active' });

    const after = encoder.createSnapshot();
    const diff = encoder.getSnapshotDiff(before, after);

    expect(diff.agentChanges).toBe(1);
    expect(diff.timeDelta).toBeGreaterThan(0);
  });
});

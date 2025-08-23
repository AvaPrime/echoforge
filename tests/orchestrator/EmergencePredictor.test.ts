import { EmergencePredictor } from '../../packages/echocore/src/orchestrator/EmergencePredictor';
import {
  ConflictEvent,
  RollbackEvent,
  EmergencePattern,
} from '../../packages/echocore/src/types/emergence';

describe('EmergencePredictor', () => {
  let events: EmergencePattern[];
  let predictor: EmergencePredictor;

  beforeEach(() => {
    events = [];
    predictor = new EmergencePredictor((pattern) => events.push(pattern));
  });

  test('detects conflict cascade', () => {
    for (let i = 0; i < 3; i++) {
      const conflict: ConflictEvent = {
        id: `conflict-${i}`,
        nodeId: 'node-a',
        timestamp: Date.now(),
        vectorClockSkew: 100,
        type: 'state_merge',
      };
      predictor.handleConflict(conflict);
    }

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('ConflictCascade');
  });

  test('detects vector clock divergence', () => {
    const conflict: ConflictEvent = {
      id: 'conflict-1',
      nodeId: 'node-a',
      timestamp: Date.now(),
      vectorClockSkew: 2000,
      type: 'vector_clock',
    };

    predictor.handleConflict(conflict);

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('VectorClockDivergence');
  });

  test('detects rollback chain', () => {
    for (let i = 0; i < 2; i++) {
      const rollback: RollbackEvent = {
        id: `rollback-${i}`,
        nodeId: 'node-a',
        timestamp: Date.now(),
        cause: 'rollback',
        depth: i + 1,
      };
      predictor.handleRollback(rollback);
    }

    expect(events).toHaveLength(1);
    expect(events[0].type).toBe('RollbackChain');
  });
});

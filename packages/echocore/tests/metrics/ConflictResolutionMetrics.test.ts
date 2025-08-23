/**
 * Tests for the ConflictResolutionMetrics class
 */

import {
  ConflictResolutionMetrics,
  ConflictEvent,
  RollbackEvent,
} from '../../src/metrics/ConflictResolutionMetrics';
import { MetricsEngine } from '../../src/metrics/MetricsEngine';
import { SoulMeshProtocol } from '../../src/memory/consolidation/codesig/soulmesh/SoulMeshProtocol';

// Mock MetricsEngine
class MockMetricsEngine {
  public registeredMetrics: Record<string, any> = {};
  public recordedMetrics: Array<{
    name: string;
    value: any;
    tags: Record<string, string>;
  }> = [];

  registerMetric(metric: any): void {
    this.registeredMetrics[metric.name] = metric;
  }

  record(name: string, value: any, tags: Record<string, string> = {}): void {
    this.recordedMetrics.push({ name, value, tags });
  }

  getRecordedMetrics(
    name: string
  ): Array<{ value: any; tags: Record<string, string> }> {
    return this.recordedMetrics
      .filter((metric) => metric.name === name)
      .map(({ value, tags }) => ({ value, tags }));
  }
}

// Mock SoulMeshProtocol
class MockSoulMeshProtocol {
  // Mock implementation
}

describe('ConflictResolutionMetrics', () => {
  let metricsEngine: MockMetricsEngine;
  let soulMeshProtocol: MockSoulMeshProtocol;
  let conflictMetrics: ConflictResolutionMetrics;

  beforeEach(() => {
    // Set up mocks
    metricsEngine = new MockMetricsEngine();
    soulMeshProtocol = new MockSoulMeshProtocol();

    // Create ConflictResolutionMetrics instance
    conflictMetrics = new ConflictResolutionMetrics({
      metricsEngine: metricsEngine as unknown as MetricsEngine,
      soulMeshProtocol: soulMeshProtocol as unknown as SoulMeshProtocol,
      enableHistoricalTracking: true,
      maxHistoricalEvents: 100,
    });

    // Spy on console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    jest.restoreAllMocks();
  });

  describe('Metric Registration', () => {
    it('should register all required metrics', () => {
      // Check that all expected metrics are registered
      expect(metricsEngine.registeredMetrics).toHaveProperty(
        'conflict_detected'
      );
      expect(metricsEngine.registeredMetrics).toHaveProperty(
        'conflict_resolution_success_rate'
      );
      expect(metricsEngine.registeredMetrics).toHaveProperty(
        'conflict_resolution_time'
      );
      expect(metricsEngine.registeredMetrics).toHaveProperty('rollback_event');
    });
  });

  describe('Conflict Detection', () => {
    it('should record conflict detection events', () => {
      // Record a conflict detection
      const component = 'memory.consciousness';
      const nodes = ['node1', 'node2'];
      conflictMetrics.recordConflictDetected(component, nodes);

      // Check that the metric was recorded
      const recordedMetrics =
        metricsEngine.getRecordedMetrics('conflict_detected');
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0].value).toBe(1);
      expect(recordedMetrics[0].tags).toEqual({
        component,
        nodes: nodes.join(','),
      });

      // Check that the event was added to historical tracking
      const historicalConflicts = conflictMetrics.getHistoricalConflicts();
      expect(historicalConflicts.length).toBe(1);
      expect(historicalConflicts[0].component).toBe(component);
      expect(historicalConflicts[0].nodes).toEqual(nodes);
      expect(historicalConflicts[0].resolved).toBe(false);
    });
  });

  describe('Conflict Resolution', () => {
    it('should record successful conflict resolution events', () => {
      // Record a successful conflict resolution
      const component = 'memory.consciousness';
      const nodes = ['node1', 'node2'];
      const strategy = 'vector_clock_merge';
      const resolutionTimeMs = 150;
      conflictMetrics.recordConflictResolution(
        component,
        nodes,
        strategy,
        resolutionTimeMs,
        true
      );

      // Check that the success rate metric was recorded
      const successRateMetrics = metricsEngine.getRecordedMetrics(
        'conflict_resolution_success_rate'
      );
      expect(successRateMetrics.length).toBe(1);
      expect(successRateMetrics[0].value).toBe(1); // 1 for success
      expect(successRateMetrics[0].tags).toEqual({
        component,
        strategy,
      });

      // Check that the resolution time metric was recorded
      const timeMetrics = metricsEngine.getRecordedMetrics(
        'conflict_resolution_time'
      );
      expect(timeMetrics.length).toBe(1);
      expect(timeMetrics[0].value).toBe(resolutionTimeMs);
      expect(timeMetrics[0].tags).toEqual({
        component,
        strategy,
      });

      // Check that the event was added to historical tracking
      const historicalConflicts = conflictMetrics.getHistoricalConflicts();
      expect(historicalConflicts.length).toBe(1);
      expect(historicalConflicts[0].component).toBe(component);
      expect(historicalConflicts[0].nodes).toEqual(nodes);
      expect(historicalConflicts[0].resolved).toBe(true);
      expect(historicalConflicts[0].strategy).toBe(strategy);
      expect(historicalConflicts[0].resolutionTimeMs).toBe(resolutionTimeMs);
    });

    it('should record failed conflict resolution events', () => {
      // Record a failed conflict resolution
      const component = 'memory.consciousness';
      const nodes = ['node1', 'node2'];
      const strategy = 'vector_clock_merge';
      const resolutionTimeMs = 200;
      conflictMetrics.recordConflictResolution(
        component,
        nodes,
        strategy,
        resolutionTimeMs,
        false
      );

      // Check that the success rate metric was recorded
      const successRateMetrics = metricsEngine.getRecordedMetrics(
        'conflict_resolution_success_rate'
      );
      expect(successRateMetrics.length).toBe(1);
      expect(successRateMetrics[0].value).toBe(0); // 0 for failure
      expect(successRateMetrics[0].tags).toEqual({
        component,
        strategy,
      });

      // Check that the event was added to historical tracking
      const historicalConflicts = conflictMetrics.getHistoricalConflicts();
      expect(historicalConflicts.length).toBe(1);
      expect(historicalConflicts[0].resolved).toBe(false);
    });
  });

  describe('Rollback Events', () => {
    it('should record rollback events', () => {
      // Record a rollback event
      const component = 'memory.consciousness';
      const reason = 'conflict_unresolvable';
      conflictMetrics.recordRollbackEvent(component, reason, true);

      // Check that the metric was recorded
      const recordedMetrics =
        metricsEngine.getRecordedMetrics('rollback_event');
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0].value).toBe(1);
      expect(recordedMetrics[0].tags).toEqual({
        component,
        reason,
      });

      // Check that the event was added to historical tracking
      const historicalRollbacks = conflictMetrics.getHistoricalRollbacks();
      expect(historicalRollbacks.length).toBe(1);
      expect(historicalRollbacks[0].component).toBe(component);
      expect(historicalRollbacks[0].reason).toBe(reason);
      expect(historicalRollbacks[0].successful).toBe(true);
    });
  });

  describe('Historical Tracking', () => {
    it('should limit the number of historical events', () => {
      // Create a metrics instance with a small max events limit
      const limitedMetrics = new ConflictResolutionMetrics({
        metricsEngine: metricsEngine as unknown as MetricsEngine,
        soulMeshProtocol: soulMeshProtocol as unknown as SoulMeshProtocol,
        enableHistoricalTracking: true,
        maxHistoricalEvents: 3,
      });

      // Record more events than the limit
      for (let i = 0; i < 5; i++) {
        limitedMetrics.recordConflictDetected(`component${i}`, [`node${i}`]);
      }

      // Check that only the most recent events are kept
      const historicalConflicts = limitedMetrics.getHistoricalConflicts();
      expect(historicalConflicts.length).toBe(3);
      expect(historicalConflicts[0].component).toBe('component2');
      expect(historicalConflicts[1].component).toBe('component3');
      expect(historicalConflicts[2].component).toBe('component4');

      // Do the same for rollbacks
      for (let i = 0; i < 5; i++) {
        limitedMetrics.recordRollbackEvent(`component${i}`, `reason${i}`, true);
      }

      const historicalRollbacks = limitedMetrics.getHistoricalRollbacks();
      expect(historicalRollbacks.length).toBe(3);
    });

    it('should disable historical tracking when configured', () => {
      // Create a metrics instance with historical tracking disabled
      const noHistoryMetrics = new ConflictResolutionMetrics({
        metricsEngine: metricsEngine as unknown as MetricsEngine,
        soulMeshProtocol: soulMeshProtocol as unknown as SoulMeshProtocol,
        enableHistoricalTracking: false,
      });

      // Record some events
      noHistoryMetrics.recordConflictDetected('component', ['node1']);
      noHistoryMetrics.recordRollbackEvent('component', 'reason', true);

      // Check that no events were stored
      expect(noHistoryMetrics.getHistoricalConflicts().length).toBe(0);
      expect(noHistoryMetrics.getHistoricalRollbacks().length).toBe(0);

      // Check that trying to get metrics throws an error
      expect(() => {
        noHistoryMetrics.getConflictResolutionSuccessRate('component');
      }).toThrow('Historical tracking is not enabled');
    });
  });

  describe('Metrics Analysis', () => {
    beforeEach(() => {
      // Mock Date.now to return a fixed timestamp
      const now = 1609459200000; // 2021-01-01T00:00:00.000Z
      jest.spyOn(Date, 'now').mockImplementation(() => now);

      // Record some test data
      // Component 1: All successful resolutions
      conflictMetrics.recordConflictResolution(
        'component1',
        ['node1', 'node2'],
        'strategy1',
        100,
        true
      );
      conflictMetrics.recordConflictResolution(
        'component1',
        ['node1', 'node3'],
        'strategy1',
        150,
        true
      );
      conflictMetrics.recordConflictResolution(
        'component1',
        ['node2', 'node3'],
        'strategy2',
        200,
        true
      );

      // Component 2: Mixed success/failure
      conflictMetrics.recordConflictResolution(
        'component2',
        ['node1', 'node2'],
        'strategy1',
        120,
        true
      );
      conflictMetrics.recordConflictResolution(
        'component2',
        ['node1', 'node3'],
        'strategy2',
        180,
        false
      );
      conflictMetrics.recordConflictResolution(
        'component2',
        ['node2', 'node3'],
        'strategy2',
        220,
        false
      );

      // Rollbacks
      conflictMetrics.recordRollbackEvent('component1', 'reason1', true);
      conflictMetrics.recordRollbackEvent('component2', 'reason1', true);
      conflictMetrics.recordRollbackEvent('component2', 'reason2', true);
      conflictMetrics.recordRollbackEvent('component2', 'reason2', false);
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should calculate conflict resolution success rate correctly', () => {
      // Check component1 (all successful)
      const rate1 =
        conflictMetrics.getConflictResolutionSuccessRate('component1');
      expect(rate1).toBe(1); // 100% success

      // Check component2 (1/3 successful)
      const rate2 =
        conflictMetrics.getConflictResolutionSuccessRate('component2');
      expect(rate2).toBe(1 / 3); // 33.3% success

      // Check non-existent component
      const rate3 =
        conflictMetrics.getConflictResolutionSuccessRate('component3');
      expect(rate3).toBe(1); // No conflicts means 100% success
    });

    it('should calculate rollback rate correctly', () => {
      // Check component1 (1 rollback)
      const rate1 = conflictMetrics.getRollbackRate('component1');
      expect(rate1).toBe(1);

      // Check component2 (3 rollbacks)
      const rate2 = conflictMetrics.getRollbackRate('component2');
      expect(rate2).toBe(3);

      // Check non-existent component
      const rate3 = conflictMetrics.getRollbackRate('component3');
      expect(rate3).toBe(0);
    });

    it('should analyze conflict patterns correctly', () => {
      const analysis = conflictMetrics.analyzeConflictPatterns();

      // Check overall metrics
      expect(analysis.totalConflicts).toBe(6);
      expect(analysis.totalRollbacks).toBe(4);
      expect(analysis.overallSuccessRate).toBe(4 / 6); // 4 successful out of 6 conflicts

      // Check component breakdown
      expect(analysis.componentBreakdown).toHaveProperty('component1');
      expect(analysis.componentBreakdown).toHaveProperty('component2');

      // Check component1 metrics
      const comp1 = analysis.componentBreakdown.component1;
      expect(comp1.conflictCount).toBe(3);
      expect(comp1.rollbackCount).toBe(1);
      expect(comp1.successRate).toBe(1); // All successful
      expect(comp1.averageResolutionTimeMs).toBe((100 + 150 + 200) / 3);

      // Check component2 metrics
      const comp2 = analysis.componentBreakdown.component2;
      expect(comp2.conflictCount).toBe(3);
      expect(comp2.rollbackCount).toBe(3);
      expect(comp2.successRate).toBe(1 / 3); // 1 out of 3 successful
      expect(comp2.averageResolutionTimeMs).toBe((120 + 180 + 220) / 3);
      expect(comp2.rollbackReasons).toEqual({
        reason1: 1,
        reason2: 2,
      });
    });
  });
});

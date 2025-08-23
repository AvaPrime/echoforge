import { EventEmitter } from 'events';
import {
  ConflictResolutionMetrics,
  ConflictEvent,
  ResolutionResult,
  RollbackTrace,
} from '../../packages/echocore/src/metrics/ConflictResolutionMetrics';

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

describe('ConflictResolutionMetrics', () => {
  let metricsEngine: MockMetricsEngine;
  let mockSoulMesh: EventEmitter;
  let metrics: ConflictResolutionMetrics;

  beforeEach(() => {
    metricsEngine = new MockMetricsEngine();
    mockSoulMesh = new EventEmitter();

    // Create ConflictResolutionMetrics instance with the new constructor pattern
    metrics = new ConflictResolutionMetrics({
      metricsEngine: metricsEngine as any,
      soulMeshProtocol: mockSoulMesh,
      enableHistoricalTracking: true,
    });
  });

  test('records conflict detection', () => {
    const conflict: ConflictEvent = {
      component: 'memory.consciousness',
      nodes: ['node-a', 'node-b'],
      type: 'vector_clock',
    };

    mockSoulMesh.emit('conflict_detected', conflict);

    const result = metrics.getMetrics();
    expect(result.counters.detected).toBe(1);
    expect(result.activeConflicts).toBe(1);

    // Check that the metric was recorded in the metrics engine
    const recordedMetrics =
      metricsEngine.getRecordedMetrics('conflict_detected');
    expect(recordedMetrics.length).toBe(1);
  });

  test('records conflict resolution', () => {
    const resolution: ResolutionResult = {
      component: 'memory.consciousness',
      nodes: ['node-a', 'node-b'],
      strategy: 'timestamp_priority',
      resolutionTimeMs: 150,
      successful: true,
    };

    mockSoulMesh.emit('conflict_resolved', resolution);

    const result = metrics.getMetrics();
    expect(result.counters.resolved).toBe(1);
    expect(result.avgResolutionTime).toBe(150);

    // Check that the metrics were recorded in the metrics engine
    const successRateMetrics = metricsEngine.getRecordedMetrics(
      'conflict_resolution_success_rate'
    );
    expect(successRateMetrics.length).toBe(1);

    const timeMetrics = metricsEngine.getRecordedMetrics(
      'conflict_resolution_time'
    );
    expect(timeMetrics.length).toBe(1);
  });

  test('records rollback events', () => {
    const rollback: RollbackTrace = {
      component: 'memory.consciousness',
      reason: 'conflict_unresolvable',
      successful: true,
      timestamp: Date.now(),
    };

    mockSoulMesh.emit('rollback', rollback);

    const result = metrics.getMetrics();
    expect(result.counters.rollbacks).toBe(1);

    // Check that the metric was recorded in the metrics engine
    const recordedMetrics = metricsEngine.getRecordedMetrics('rollback_event');
    expect(recordedMetrics.length).toBe(1);
  });
});

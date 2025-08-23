/**
 * Tests for the SoulMesh Metrics Integration
 */

import { SoulMeshMetricsIntegration } from '../../../src/metrics/integration/SoulMeshMetricsIntegration';
import { ConflictResolutionMetrics } from '../../../src/metrics/ConflictResolutionMetrics';
import { MetricsEngine } from '../../../src/metrics/MetricsEngine';
import { SoulMeshProtocol } from '../../../src/memory/consolidation/codesig/soulmesh/SoulMeshProtocol';

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

// Mock SoulMeshProtocol with event emitter functionality
class MockSoulMeshProtocol {
  private eventHandlers: Record<string, Array<(event: any) => void>> = {};

  on(eventName: string, handler: (event: any) => void): void {
    if (!this.eventHandlers[eventName]) {
      this.eventHandlers[eventName] = [];
    }
    this.eventHandlers[eventName].push(handler);
  }

  emit(eventName: string, event: any): void {
    const handlers = this.eventHandlers[eventName] || [];
    handlers.forEach((handler) => handler(event));
  }
}

describe('SoulMeshMetricsIntegration', () => {
  let metricsEngine: MockMetricsEngine;
  let soulMeshProtocol: MockSoulMeshProtocol;
  let integration: SoulMeshMetricsIntegration;

  beforeEach(() => {
    // Set up mocks
    metricsEngine = new MockMetricsEngine();
    soulMeshProtocol = new MockSoulMeshProtocol();

    // Create integration instance
    integration = new SoulMeshMetricsIntegration({
      metricsEngine: metricsEngine as unknown as MetricsEngine,
      soulMeshProtocol: soulMeshProtocol as unknown as SoulMeshProtocol,
      enableHistoricalTracking: true,
    });

    // Initialize integration
    integration.initialize();

    // Spy on console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore console.log
    jest.restoreAllMocks();
  });

  describe('Event Handling', () => {
    it('should record conflict detection events', () => {
      // Emit a conflict detection event
      const event = {
        component: 'memory.consciousness',
        nodes: ['node1', 'node2'],
      };
      soulMeshProtocol.emit('conflict_detected', event);

      // Check that the metric was recorded
      const recordedMetrics =
        metricsEngine.getRecordedMetrics('conflict_detected');
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0].value).toBe(1);
      expect(recordedMetrics[0].tags).toEqual({
        component: event.component,
        nodes: event.nodes.join(','),
      });
    });

    it('should record conflict resolution events', () => {
      // Emit a conflict resolution event
      const event = {
        component: 'memory.consciousness',
        nodes: ['node1', 'node2'],
        strategy: 'vector_clock_merge',
        resolutionTimeMs: 150,
        successful: true,
      };
      soulMeshProtocol.emit('conflict_resolved', event);

      // Check that the success rate metric was recorded
      const successRateMetrics = metricsEngine.getRecordedMetrics(
        'conflict_resolution_success_rate'
      );
      expect(successRateMetrics.length).toBe(1);
      expect(successRateMetrics[0].value).toBe(1); // 1 for success
      expect(successRateMetrics[0].tags).toEqual({
        component: event.component,
        strategy: event.strategy,
      });

      // Check that the resolution time metric was recorded
      const timeMetrics = metricsEngine.getRecordedMetrics(
        'conflict_resolution_time'
      );
      expect(timeMetrics.length).toBe(1);
      expect(timeMetrics[0].value).toBe(event.resolutionTimeMs);
      expect(timeMetrics[0].tags).toEqual({
        component: event.component,
        strategy: event.strategy,
      });
    });

    it('should record rollback events', () => {
      // Emit a rollback event
      const event = {
        component: 'memory.consciousness',
        reason: 'conflict_unresolvable',
        successful: true,
      };
      soulMeshProtocol.emit('rollback', event);

      // Check that the metric was recorded
      const recordedMetrics =
        metricsEngine.getRecordedMetrics('rollback_event');
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0].value).toBe(1);
      expect(recordedMetrics[0].tags).toEqual({
        component: event.component,
        reason: event.reason,
      });
    });

    it('should record vector clock update events', () => {
      // Emit a vector clock update event
      const event = {
        component: 'memory.consciousness',
        node: 'node1',
      };
      soulMeshProtocol.emit('vector_clock_updated', event);

      // Check that the metric was recorded
      const recordedMetrics = metricsEngine.getRecordedMetrics(
        'vector_clock_update'
      );
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0].value).toBe(1);
      expect(recordedMetrics[0].tags).toEqual({
        component: event.component,
        node: event.node,
      });
    });

    it('should record state validation events', () => {
      // Emit a state validation event
      const event = {
        component: 'memory.consciousness',
        type: 'integrity_check',
        valid: true,
      };
      soulMeshProtocol.emit('state_validation', event);

      // Check that the metric was recorded
      const recordedMetrics =
        metricsEngine.getRecordedMetrics('state_validation');
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0].value).toBe(1); // 1 for valid
      expect(recordedMetrics[0].tags).toEqual({
        component: event.component,
        validationType: event.type,
      });
    });

    it('should record state broadcast events', () => {
      // Emit a state broadcast event
      const event = {
        component: 'memory.consciousness',
        targetNodes: ['node1', 'node2', 'node3'],
      };
      soulMeshProtocol.emit('state_broadcast', event);

      // Check that the metric was recorded
      const recordedMetrics =
        metricsEngine.getRecordedMetrics('state_broadcast');
      expect(recordedMetrics.length).toBe(1);
      expect(recordedMetrics[0].value).toBe(1);
      expect(recordedMetrics[0].tags).toEqual({
        component: event.component,
        targetNodes: event.targetNodes.join(','),
      });
    });
  });

  describe('Integration Functionality', () => {
    it('should provide access to the metrics instance', () => {
      const metrics = integration.getMetrics();
      expect(metrics).toBeInstanceOf(ConflictResolutionMetrics);
    });

    it('should handle missing event properties gracefully', () => {
      // Emit events with missing properties
      soulMeshProtocol.emit('conflict_detected', {
        component: 'memory.consciousness',
      }); // Missing nodes
      soulMeshProtocol.emit('conflict_resolved', {
        component: 'memory.consciousness',
      }); // Missing everything else
      soulMeshProtocol.emit('rollback', { component: 'memory.consciousness' }); // Missing reason and successful

      // Check that metrics were still recorded
      expect(metricsEngine.getRecordedMetrics('conflict_detected').length).toBe(
        1
      );
      expect(
        metricsEngine.getRecordedMetrics('conflict_resolution_success_rate')
          .length
      ).toBe(1);
      expect(metricsEngine.getRecordedMetrics('rollback_event').length).toBe(1);
    });

    it('should not initialize twice', () => {
      // Try to initialize again
      integration.initialize();

      // Emit an event
      soulMeshProtocol.emit('conflict_detected', {
        component: 'memory.consciousness',
        nodes: ['node1'],
      });

      // Check that the metric was recorded only once
      expect(metricsEngine.getRecordedMetrics('conflict_detected').length).toBe(
        1
      );
    });
  });
});

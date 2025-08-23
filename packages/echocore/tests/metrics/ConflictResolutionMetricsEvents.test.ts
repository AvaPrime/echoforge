/**
 * Tests for the ConflictResolutionMetrics event listeners
 */

import { ConflictResolutionMetrics } from '../../src/metrics/ConflictResolutionMetrics';
import { MetricsEngine } from '../../src/metrics/MetricsEngine';
import { SoulMeshProtocol } from '../../src/memory/consolidation/codesig/soulmesh/SoulMeshProtocol';
import { EventEmitter } from 'events';

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
class MockSoulMeshProtocol extends EventEmitter {
  constructor() {
    super();
  }
}

// Mock fs and path modules
const mockFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
};

const mockPath = {
  join: jest.fn((dir, file) => `${dir}/${file}`),
};

// Mock require function
const originalRequire = global.require;
let requireMock: jest.Mock;

describe('ConflictResolutionMetrics Event Listeners', () => {
  let metricsEngine: MockMetricsEngine;
  let soulMeshProtocol: MockSoulMeshProtocol;
  let metrics: ConflictResolutionMetrics;

  beforeEach(() => {
    // Set up mocks
    metricsEngine = new MockMetricsEngine();
    soulMeshProtocol = new MockSoulMeshProtocol();

    // Mock require function
    requireMock = jest.fn((module) => {
      if (module === 'fs') return mockFs;
      if (module === 'path') return mockPath;
      return originalRequire(module);
    });
    global.require = requireMock;

    // Reset mock fs functions
    mockFs.existsSync.mockReset().mockReturnValue(false);
    mockFs.mkdirSync.mockReset();
    mockFs.writeFileSync.mockReset();
    mockFs.readFileSync.mockReset();
    mockPath.join.mockClear();

    // Create metrics instance
    metrics = new ConflictResolutionMetrics({
      metricsEngine: metricsEngine as unknown as MetricsEngine,
      soulMeshProtocol: soulMeshProtocol as unknown as SoulMeshProtocol,
      enableHistoricalTracking: true,
    });

    // Spy on console.log
    jest.spyOn(console, 'log').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restore mocks
    jest.restoreAllMocks();
    global.require = originalRequire;
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
  });

  describe('Historical Tracking', () => {
    it('should store conflict events in history', () => {
      // Emit multiple conflict events
      soulMeshProtocol.emit('conflict_detected', {
        component: 'memory.consciousness',
        nodes: ['node1', 'node2'],
      });

      soulMeshProtocol.emit('conflict_resolved', {
        component: 'memory.consciousness',
        nodes: ['node1', 'node2'],
        strategy: 'vector_clock_merge',
        resolutionTimeMs: 150,
        successful: true,
      });

      // Check historical conflicts
      const historicalConflicts = metrics.getHistoricalConflicts();
      expect(historicalConflicts.length).toBe(2);
      expect(historicalConflicts[0].component).toBe('memory.consciousness');
      expect(historicalConflicts[0].resolved).toBe(false);
      expect(historicalConflicts[1].component).toBe('memory.consciousness');
      expect(historicalConflicts[1].resolved).toBe(true);
      expect(historicalConflicts[1].strategy).toBe('vector_clock_merge');
    });

    it('should store rollback events in history', () => {
      // Emit rollback event
      soulMeshProtocol.emit('rollback', {
        component: 'memory.consciousness',
        reason: 'conflict_unresolvable',
        successful: true,
      });

      // Check historical rollbacks
      const historicalRollbacks = metrics.getHistoricalRollbacks();
      expect(historicalRollbacks.length).toBe(1);
      expect(historicalRollbacks[0].component).toBe('memory.consciousness');
      expect(historicalRollbacks[0].reason).toBe('conflict_unresolvable');
      expect(historicalRollbacks[0].successful).toBe(true);
    });
  });

  describe('Metrics Persistence', () => {
    beforeEach(() => {
      // Create metrics instance with storage directory
      metrics = new ConflictResolutionMetrics({
        metricsEngine: metricsEngine as unknown as MetricsEngine,
        soulMeshProtocol: soulMeshProtocol as unknown as SoulMeshProtocol,
        enableHistoricalTracking: true,
        storageDir: '/logs/metrics',
      });
    });

    it('should create storage directory if it does not exist', () => {
      expect(mockFs.existsSync).toHaveBeenCalledWith('/logs/metrics');
      expect(mockFs.mkdirSync).toHaveBeenCalledWith('/logs/metrics', {
        recursive: true,
      });
    });

    it('should persist conflict events to disk', () => {
      // Emit a conflict event
      soulMeshProtocol.emit('conflict_detected', {
        component: 'memory.consciousness',
        nodes: ['node1', 'node2'],
      });

      // Check that data was persisted
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/logs/metrics/historical_conflicts.json',
        expect.any(String)
      );
    });

    it('should persist resolution events to disk', () => {
      // Emit a resolution event
      soulMeshProtocol.emit('conflict_resolved', {
        component: 'memory.consciousness',
        nodes: ['node1', 'node2'],
        strategy: 'vector_clock_merge',
        resolutionTimeMs: 150,
        successful: true,
      });

      // Check that data was persisted
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/logs/metrics/historical_conflicts.json',
        expect.any(String)
      );
    });

    it('should persist rollback events to disk', () => {
      // Emit a rollback event
      soulMeshProtocol.emit('rollback', {
        component: 'memory.consciousness',
        reason: 'conflict_unresolvable',
        successful: true,
      });

      // Check that data was persisted
      expect(mockFs.writeFileSync).toHaveBeenCalledWith(
        '/logs/metrics/historical_rollbacks.json',
        expect.any(String)
      );
    });

    it('should load historical data on initialization', () => {
      // Mock existing files
      mockFs.existsSync.mockReturnValue(true);
      mockFs.readFileSync.mockImplementation((path) => {
        if (path === '/logs/metrics/historical_conflicts.json') {
          return JSON.stringify([
            {
              timestamp: Date.now(),
              component: 'memory.persistence',
              nodes: ['node3', 'node4'],
              resolved: true,
              strategy: 'timestamp_priority',
              resolutionTimeMs: 200,
              successful: true,
            },
          ]);
        } else if (path === '/logs/metrics/historical_rollbacks.json') {
          return JSON.stringify([
            {
              timestamp: Date.now(),
              component: 'memory.persistence',
              reason: 'validation_failed',
              successful: false,
            },
          ]);
        }
        return '{}';
      });

      // Create new metrics instance to trigger loading
      const newMetrics = new ConflictResolutionMetrics({
        metricsEngine: metricsEngine as unknown as MetricsEngine,
        soulMeshProtocol: soulMeshProtocol as unknown as SoulMeshProtocol,
        enableHistoricalTracking: true,
        storageDir: '/logs/metrics',
      });

      // Check that data was loaded
      const conflicts = newMetrics.getHistoricalConflicts();
      const rollbacks = newMetrics.getHistoricalRollbacks();

      expect(conflicts.length).toBe(1);
      expect(conflicts[0].component).toBe('memory.persistence');
      expect(conflicts[0].strategy).toBe('timestamp_priority');

      expect(rollbacks.length).toBe(1);
      expect(rollbacks[0].component).toBe('memory.persistence');
      expect(rollbacks[0].reason).toBe('validation_failed');
    });
  });
});

import { EventEmitter } from 'events';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Interface for a conflict detection event
 */
export interface ConflictEvent {
  component: string;
  nodes: string[];
  timestamp?: number;
  type?: 'vector_clock' | 'state_merge' | 'operation_order';
  id?: string;
}

/**
 * Interface for a conflict resolution result
 */
export interface ResolutionResult {
  component: string;
  nodes: string[];
  strategy: string;
  resolutionTimeMs: number;
  successful: boolean;
  conflictId?: string;
}

/**
 * Interface for a rollback event
 */
export interface RollbackTrace {
  component: string;
  reason: string;
  successful: boolean;
  depth?: number;
  nodeId?: string;
  conflictId?: string;
  timestamp?: number;
}

/**
 * Configuration options for ConflictResolutionMetrics
 */
export interface ConflictResolutionMetricsConfig {
  metricsEngine: any; // MetricsEngine interface
  soulMeshProtocol: EventEmitter;
  enableHistoricalTracking?: boolean;
  maxHistoricalEvents?: number;
  historyStoragePath?: string;
}

/**
 * Historical event with timestamp for tracking
 */
interface HistoricalEvent {
  timestamp: number;
  type: 'conflict_detected' | 'conflict_resolved' | 'rollback';
  component: string;
  nodes?: string[];
  strategy?: string;
  resolved?: boolean;
  reason?: string;
  successful?: boolean;
  resolutionTimeMs?: number;
}

/**
 * Class for tracking conflict resolution metrics from SoulMeshProtocol
 */
export class ConflictResolutionMetrics extends EventEmitter {
  private conflicts: Map<string, ConflictEvent> = new Map();
  private resolutions: ResolutionResult[] = [];
  private rollbacks: RollbackTrace[] = [];
  private counters = { detected: 0, resolved: 0, rollbacks: 0 };
  private metricsEngine: any;
  private soulMeshProtocol: EventEmitter;

  // Historical tracking
  private enableHistoricalTracking: boolean;
  private maxHistoricalEvents: number;
  private historyStoragePath?: string;
  private historicalEvents: HistoricalEvent[] = [];

  /**
   * Creates a new ConflictResolutionMetrics instance
   */
  constructor(config: ConflictResolutionMetricsConfig) {
    super();
    this.metricsEngine = config.metricsEngine;
    this.soulMeshProtocol = config.soulMeshProtocol;
    this.enableHistoricalTracking = config.enableHistoricalTracking || false;
    this.maxHistoricalEvents = config.maxHistoricalEvents || 100;
    this.historyStoragePath = config.historyStoragePath;

    // Register metrics
    this.registerMetrics();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Registers metrics with the metrics engine
   */
  private registerMetrics(): void {
    // Register conflict detection metric
    this.metricsEngine.registerMetric({
      name: 'conflict_detected',
      description: 'Number of conflicts detected in the SoulMesh',
      type: 'counter',
      tags: ['component', 'nodes'],
    });

    // Register conflict resolution success rate metric
    this.metricsEngine.registerMetric({
      name: 'conflict_resolution_success_rate',
      description: 'Success rate of conflict resolutions',
      type: 'gauge',
      tags: ['component', 'strategy'],
    });

    // Register conflict resolution time metric
    this.metricsEngine.registerMetric({
      name: 'conflict_resolution_time',
      description: 'Time taken to resolve conflicts in milliseconds',
      type: 'histogram',
      tags: ['component', 'strategy'],
    });

    // Register rollback event metric
    this.metricsEngine.registerMetric({
      name: 'rollback_event',
      description: 'Number of rollback events',
      type: 'counter',
      tags: ['component', 'reason'],
    });
  }

  /**
   * Sets up event listeners for SoulMeshProtocol events
   */
  private setupEventListeners(): void {
    this.soulMeshProtocol.on(
      'conflict_detected',
      this.onConflictDetected.bind(this)
    );
    this.soulMeshProtocol.on(
      'conflict_resolved',
      this.onConflictResolved.bind(this)
    );
    this.soulMeshProtocol.on('rollback', this.onRollbackInitiated.bind(this));
  }

  /**
   * Handles conflict detection events
   */
  private onConflictDetected(conflict: ConflictEvent): void {
    // Generate a conflict ID if not provided
    const conflictId = conflict.id || `${conflict.component}-${Date.now()}`;

    // Store conflict with ID
    const conflictWithId = {
      ...conflict,
      id: conflictId,
      timestamp: conflict.timestamp || Date.now(),
    };

    this.conflicts.set(conflictId, conflictWithId);
    this.counters.detected++;

    // Record metric
    this.metricsEngine.record('conflict_detected', 1, {
      component: conflict.component,
      nodes: conflict.nodes.join(','),
    });

    // Add to historical tracking
    if (this.enableHistoricalTracking) {
      this.addHistoricalEvent({
        timestamp: conflictWithId.timestamp,
        type: 'conflict_detected',
        component: conflict.component,
        nodes: conflict.nodes,
        resolved: false,
      });
    }

    // Emit event
    this.emit('metrics:updated', {
      type: 'conflict_detected',
      data: conflictWithId,
    });
  }

  /**
   * Handles conflict resolution events
   */
  private onConflictResolved(result: ResolutionResult): void {
    this.resolutions.push(result);
    this.counters.resolved++;

    // Remove from active conflicts if ID is provided
    if (result.conflictId) {
      this.conflicts.delete(result.conflictId);
    }

    // Record success rate metric
    this.metricsEngine.record(
      'conflict_resolution_success_rate',
      result.successful ? 1 : 0,
      {
        component: result.component,
        strategy: result.strategy,
      }
    );

    // Record resolution time metric
    this.metricsEngine.record(
      'conflict_resolution_time',
      result.resolutionTimeMs,
      {
        component: result.component,
        strategy: result.strategy,
      }
    );

    // Add to historical tracking
    if (this.enableHistoricalTracking) {
      this.addHistoricalEvent({
        timestamp: Date.now(),
        type: 'conflict_resolved',
        component: result.component,
        nodes: result.nodes,
        strategy: result.strategy,
        resolved: true,
        successful: result.successful,
        resolutionTimeMs: result.resolutionTimeMs,
      });
    }

    // Emit event
    this.emit('metrics:updated', {
      type: 'conflict_resolved',
      data: result,
    });
  }

  /**
   * Handles rollback events
   */
  private onRollbackInitiated(trace: RollbackTrace): void {
    this.rollbacks.push(trace);
    this.counters.rollbacks++;

    // Record metric
    this.metricsEngine.record('rollback_event', 1, {
      component: trace.component,
      reason: trace.reason,
    });

    // Add to historical tracking
    if (this.enableHistoricalTracking) {
      this.addHistoricalEvent({
        timestamp: trace.timestamp || Date.now(),
        type: 'rollback',
        component: trace.component,
        reason: trace.reason,
        successful: trace.successful,
      });
    }

    // Emit event
    this.emit('metrics:updated', {
      type: 'rollback_initiated',
      data: trace,
    });
  }

  /**
   * Adds an event to historical tracking
   */
  private addHistoricalEvent(event: HistoricalEvent): void {
    this.historicalEvents.push(event);

    // Trim history if it exceeds the maximum size
    if (this.historicalEvents.length > this.maxHistoricalEvents) {
      this.historicalEvents = this.historicalEvents.slice(
        -this.maxHistoricalEvents
      );
    }

    // Persist history if storage path is provided
    if (this.historyStoragePath) {
      this.persistHistoricalEvents();
    }
  }

  /**
   * Persists historical events to disk
   */
  private persistHistoricalEvents(): void {
    try {
      const dirPath = path.dirname(this.historyStoragePath!);

      // Create directory if it doesn't exist
      if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
      }

      // Write events to file
      fs.writeFileSync(
        this.historyStoragePath!,
        JSON.stringify(this.historicalEvents, null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Failed to persist historical events:', error);
    }
  }

  /**
   * Gets current metrics
   */
  getMetrics() {
    return {
      counters: { ...this.counters },
      activeConflicts: this.conflicts.size,
      avgResolutionTime: this.calculateAverageResolutionTime(),
      successRate: this.calculateSuccessRate(),
    };
  }

  /**
   * Calculates the average resolution time
   */
  private calculateAverageResolutionTime(): number {
    if (this.resolutions.length === 0) {
      return 0;
    }

    const totalTime = this.resolutions.reduce(
      (sum, r) => sum + r.resolutionTimeMs,
      0
    );
    return totalTime / this.resolutions.length;
  }

  /**
   * Calculates the success rate of conflict resolutions
   */
  private calculateSuccessRate(): number {
    if (this.resolutions.length === 0) {
      return 0;
    }

    const successfulResolutions = this.resolutions.filter(
      (r) => r.successful
    ).length;
    return successfulResolutions / this.resolutions.length;
  }

  /**
   * Gets historical conflicts
   */
  getHistoricalConflicts(): HistoricalEvent[] {
    return [...this.historicalEvents];
  }

  /**
   * Gets historical rollbacks
   */
  getHistoricalRollbacks(): HistoricalEvent[] {
    return this.historicalEvents.filter((event) => event.type === 'rollback');
  }

  /**
   * Records a conflict detection event
   */
  recordConflictDetected(
    component: string,
    nodes: string[],
    type?: 'vector_clock' | 'state_merge' | 'operation_order'
  ): void {
    const conflict: ConflictEvent = {
      component,
      nodes,
      type,
      timestamp: Date.now(),
    };

    // Generate a conflict ID
    const conflictId = `${component}-${Date.now()}`;

    // Use the existing event handler
    this.onConflictDetected({
      ...conflict,
      id: conflictId,
    });
  }

  /**
   * Records a conflict resolution event
   */
  recordConflictResolution(
    component: string,
    nodes: string[],
    strategy: string,
    resolutionTimeMs: number,
    successful: boolean
  ): void {
    const result: ResolutionResult = {
      component,
      nodes,
      strategy,
      resolutionTimeMs,
      successful,
    };

    // Use the existing event handler
    this.onConflictResolved(result);
  }

  /**
   * Records a rollback event
   */
  recordRollbackEvent(
    component: string,
    reason: string,
    successful: boolean
  ): void {
    const trace: RollbackTrace = {
      component,
      reason,
      successful,
      timestamp: Date.now(),
    };

    // Use the existing event handler
    this.onRollbackInitiated(trace);
  }

  /**
   * Gets conflict resolution success rate for a specific component
   */
  getConflictResolutionSuccessRate(component: string): number {
    const componentResolutions = this.resolutions.filter(
      (r) => r.component === component
    );

    if (componentResolutions.length === 0) {
      return 1; // No conflicts means 100% success
    }

    const successfulResolutions = componentResolutions.filter(
      (r) => r.successful
    ).length;
    return successfulResolutions / componentResolutions.length;
  }

  /**
   * Gets rollback rate for a specific component
   */
  getRollbackRate(component: string): number {
    return this.rollbacks.filter((r) => r.component === component).length;
  }

  /**
   * Analyzes conflict patterns
   */
  analyzeConflictPatterns() {
    const componentBreakdown: Record<string, any> = {};
    const allComponents = new Set<string>();

    // Collect all components
    this.resolutions.forEach((r) => allComponents.add(r.component));
    this.rollbacks.forEach((r) => allComponents.add(r.component));

    // Calculate metrics for each component
    allComponents.forEach((component) => {
      const componentResolutions = this.resolutions.filter(
        (r) => r.component === component
      );
      const componentRollbacks = this.rollbacks.filter(
        (r) => r.component === component
      );

      const successfulResolutions = componentResolutions.filter(
        (r) => r.successful
      ).length;
      const totalResolutionTime = componentResolutions.reduce(
        (sum, r) => sum + r.resolutionTimeMs,
        0
      );

      // Count rollback reasons
      const rollbackReasons: Record<string, number> = {};
      componentRollbacks.forEach((r) => {
        rollbackReasons[r.reason] = (rollbackReasons[r.reason] || 0) + 1;
      });

      componentBreakdown[component] = {
        conflictCount: componentResolutions.length,
        rollbackCount: componentRollbacks.length,
        successRate:
          componentResolutions.length > 0
            ? successfulResolutions / componentResolutions.length
            : 1,
        averageResolutionTimeMs:
          componentResolutions.length > 0
            ? totalResolutionTime / componentResolutions.length
            : 0,
        rollbackReasons,
      };
    });

    // Calculate overall metrics
    const totalConflicts = this.resolutions.length;
    const successfulConflicts = this.resolutions.filter(
      (r) => r.successful
    ).length;

    return {
      totalConflicts,
      totalRollbacks: this.rollbacks.length,
      overallSuccessRate:
        totalConflicts > 0 ? successfulConflicts / totalConflicts : 1,
      componentBreakdown,
    };
  }
}

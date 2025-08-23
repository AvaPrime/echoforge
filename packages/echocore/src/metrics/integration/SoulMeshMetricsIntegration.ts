/**
 * SoulMesh Protocol Metrics Integration
 *
 * This file integrates the SoulMeshProtocol with the ConflictResolutionMetrics
 * to track important events like conflict detection, resolution, and rollbacks.
 */

import { SoulMeshProtocol } from '../../memory/consolidation/codesig/soulmesh/SoulMeshProtocol';
import { ConflictResolutionMetrics } from '../ConflictResolutionMetrics';
import { MetricsEngine } from '../MetricsEngine';

/**
 * Configuration options for the SoulMesh Metrics Integration
 */
export interface SoulMeshMetricsIntegrationConfig {
  /** Reference to the SoulMesh protocol */
  soulMeshProtocol: SoulMeshProtocol;

  /** Reference to the metrics engine */
  metricsEngine: MetricsEngine;

  /** Whether to enable historical tracking for pattern analysis */
  enableHistoricalTracking?: boolean;

  /** Maximum number of historical events to store */
  maxHistoricalEvents?: number;
}

/**
 * Integrates the SoulMeshProtocol with the ConflictResolutionMetrics
 */
export class SoulMeshMetricsIntegration {
  private config: SoulMeshMetricsIntegrationConfig;
  private metrics: ConflictResolutionMetrics;
  private initialized: boolean = false;

  /**
   * Creates a new SoulMesh Metrics Integration instance
   * @param config Configuration options for the integration
   */
  constructor(config: SoulMeshMetricsIntegrationConfig) {
    this.config = config;

    // Set default values
    if (this.config.enableHistoricalTracking === undefined) {
      this.config.enableHistoricalTracking = true;
    }

    if (!this.config.maxHistoricalEvents) {
      this.config.maxHistoricalEvents = 1000;
    }

    // Create metrics instance
    this.metrics = new ConflictResolutionMetrics({
      metricsEngine: this.config.metricsEngine,
      soulMeshProtocol: this.config.soulMeshProtocol,
      enableHistoricalTracking: this.config.enableHistoricalTracking,
      maxHistoricalEvents: this.config.maxHistoricalEvents,
    });
  }

  /**
   * Initializes the integration by setting up event listeners
   */
  public initialize(): void {
    if (this.initialized) {
      return;
    }

    this.setupEventListeners();
    this.initialized = true;

    console.log('SoulMesh Metrics Integration initialized');
  }

  /**
   * Gets the conflict resolution metrics instance
   */
  public getMetrics(): ConflictResolutionMetrics {
    return this.metrics;
  }

  /**
   * Sets up event listeners on the SoulMeshProtocol
   */
  private setupEventListeners(): void {
    const protocol = this.config.soulMeshProtocol;

    // Listen for conflict detection events
    protocol.on('conflict_detected', (event: any) => {
      this.metrics.recordConflictDetected(event.component, event.nodes || []);
    });

    // Listen for conflict resolution events
    protocol.on('conflict_resolved', (event: any) => {
      this.metrics.recordConflictResolution(
        event.component,
        event.nodes || [],
        event.strategy || 'unknown',
        event.resolutionTimeMs || 0,
        event.successful || false
      );
    });

    // Listen for rollback events
    protocol.on('rollback', (event: any) => {
      this.metrics.recordRollbackEvent(
        event.component,
        event.reason || 'unknown',
        event.successful || false
      );
    });

    // Listen for vector clock updates
    protocol.on('vector_clock_updated', (event: any) => {
      this.config.metricsEngine.record('vector_clock_update', 1, {
        component: event.component,
        node: event.node,
      });
    });

    // Listen for state validation events
    protocol.on('state_validation', (event: any) => {
      this.config.metricsEngine.record(
        'state_validation',
        event.valid ? 1 : 0,
        {
          component: event.component,
          validationType: event.type || 'unknown',
        }
      );
    });

    // Listen for state broadcast events
    protocol.on('state_broadcast', (event: any) => {
      this.config.metricsEngine.record('state_broadcast', 1, {
        component: event.component,
        targetNodes: (event.targetNodes || []).join(','),
      });
    });
  }
}

/**
 * Factory function to create and initialize a SoulMesh Metrics Integration instance
 * @param config Configuration options for the integration
 */
export function createSoulMeshMetricsIntegration(
  config: SoulMeshMetricsIntegrationConfig
): SoulMeshMetricsIntegration {
  const integration = new SoulMeshMetricsIntegration(config);
  integration.initialize();
  return integration;
}

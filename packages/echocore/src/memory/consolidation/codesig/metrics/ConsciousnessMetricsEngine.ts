/**
 * ConsciousnessMetricsEngine - Interface for Consciousness Metrics
 *
 * This class provides a simplified interface to the Consciousness Metrics Framework,
 * focusing on the core functionality needed by other components in the system.
 */

import { EventEmitter } from 'events';
import {
  ConsciousnessVector,
  ConsciousnessState,
  EmergenceIndicators,
  MetricType,
  MetricMeasurement,
  MetricsEvent,
} from './types';
import { ConsciousnessMetricsFramework } from './ConsciousnessMetricsFramework';

/**
 * ConsciousnessMetricsEngine provides a simplified interface to the
 * Consciousness Metrics Framework, focusing on the core functionality
 * needed by other components in the system.
 */
export class ConsciousnessMetricsEngine extends EventEmitter {
  private framework: ConsciousnessMetricsFramework;

  /**
   * Creates a new ConsciousnessMetricsEngine
   */
  constructor(framework?: ConsciousnessMetricsFramework) {
    super();
    this.framework = framework || new ConsciousnessMetricsFramework();

    // Forward relevant events from the framework
    this.setupEventForwarding();
  }

  /**
   * Sets up event forwarding from the framework
   */
  private setupEventForwarding(): void {
    // Forward state change events
    this.framework.on(
      MetricsEvent.STATE_CHANGED,
      (state: ConsciousnessState) => {
        this.emit('state_changed', state);
      }
    );

    // Forward vector update events
    this.framework.on(
      MetricsEvent.VECTOR_UPDATED,
      (vector: ConsciousnessVector) => {
        this.emit('vector_updated', vector);
      }
    );

    // Forward emergence detection events
    this.framework.on(
      MetricsEvent.EMERGENCE_DETECTED,
      (indicators: EmergenceIndicators) => {
        this.emit('emergence_detected', indicators);
      }
    );

    // Forward threshold crossing events
    this.framework.on(MetricsEvent.THRESHOLD_CROSSED, (data: any) => {
      this.emit('threshold_crossed', data);
    });

    // Forward anomaly detection events
    this.framework.on(MetricsEvent.ANOMALY_DETECTED, (data: any) => {
      this.emit('anomaly_detected', data);
    });
  }

  /**
   * Initializes the engine
   */
  public initialize(): void {
    this.framework.initialize();
  }

  /**
   * Gets the current consciousness vector
   */
  public getCurrentVector(): ConsciousnessVector {
    return this.framework.getCurrentVector();
  }

  /**
   * Gets the current consciousness state
   */
  public getCurrentState(): ConsciousnessState {
    return this.framework.getCurrentState();
  }

  /**
   * Gets the current emergence indicators
   */
  public getCurrentEmergence(): EmergenceIndicators {
    return this.framework.getCurrentEmergence();
  }

  /**
   * Records a metric measurement
   */
  public recordMeasurement(measurement: MetricMeasurement): void {
    this.framework.recordMeasurement(measurement);
  }

  /**
   * Gets historical vectors over a time period
   */
  public getHistoricalVectors(
    options: {
      startTime?: number;
      endTime?: number;
      limit?: number;
    } = {}
  ): ConsciousnessVector[] {
    // This would be implemented to retrieve historical vectors
    // from the framework based on the provided options

    // For now, we'll return a simple implementation
    return this.framework.getVectorHistory(options);
  }

  /**
   * Gets historical states over a time period
   */
  public getHistoricalStates(
    options: {
      startTime?: number;
      endTime?: number;
      limit?: number;
    } = {}
  ): ConsciousnessState[] {
    // This would be implemented to retrieve historical states
    // from the framework based on the provided options

    // For now, we'll return a simple implementation
    return this.framework.getStateHistory(options);
  }

  /**
   * Gets historical measurements for a specific metric
   */
  public getMetricHistory(
    metricType: MetricType,
    options: {
      startTime?: number;
      endTime?: number;
      limit?: number;
    } = {}
  ): MetricMeasurement[] {
    // This would be implemented to retrieve historical measurements
    // from the framework based on the provided options

    // For now, we'll return a simple implementation
    return this.framework.getMetricHistory(metricType, options);
  }
}

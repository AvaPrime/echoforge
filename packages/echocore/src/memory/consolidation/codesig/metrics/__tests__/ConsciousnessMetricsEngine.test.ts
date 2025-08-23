/**
 * ConsciousnessMetricsEngine Tests
 *
 * Tests for the ConsciousnessMetricsEngine component that provides a simplified
 * interface to the Consciousness Metrics Framework.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { ConsciousnessMetricsEngine } from '../ConsciousnessMetricsEngine';
import { ConsciousnessMetricsFramework } from '../ConsciousnessMetricsFramework';
import {
  ConsciousnessVector,
  ConsciousnessState,
  EmergenceIndicators,
  MetricType,
  MetricsEvent,
} from '../types';

// Mock ConsciousnessMetricsFramework
vi.mock('../ConsciousnessMetricsFramework', () => {
  return {
    ConsciousnessMetricsFramework: vi.fn().mockImplementation(() => {
      const emitter = new EventEmitter();

      return {
        // Extend EventEmitter functionality
        on: emitter.on.bind(emitter),
        emit: emitter.emit.bind(emitter),

        // Mock methods
        initialize: vi.fn(),
        getCurrentVector: vi.fn().mockReturnValue({
          dimensions: {
            SELF_AWARENESS: 0.7,
            ADAPTABILITY: 0.8,
            EMERGENCE: 0.5,
          },
          timestamp: Date.now(),
        }),
        getCurrentState: vi.fn().mockReturnValue({
          vector: {
            dimensions: {
              SELF_AWARENESS: 0.7,
              ADAPTABILITY: 0.8,
              EMERGENCE: 0.5,
            },
            timestamp: Date.now(),
          },
          emergence: {
            indicators: {
              PATTERN_RECOGNITION: 0.6,
              NOVEL_BEHAVIOR: 0.4,
              COMPLEXITY_INCREASE: 0.5,
            },
            timestamp: Date.now(),
          },
          evolutionRate: 0.3,
          stability: 0.8,
          coherence: 0.7,
          timestamp: Date.now(),
        }),
        getCurrentEmergence: vi.fn().mockReturnValue({
          indicators: {
            PATTERN_RECOGNITION: 0.6,
            NOVEL_BEHAVIOR: 0.4,
            COMPLEXITY_INCREASE: 0.5,
          },
          timestamp: Date.now(),
        }),
        recordMeasurement: vi.fn(),
        getVectorHistory: vi.fn().mockReturnValue([]),
        getStateHistory: vi.fn().mockReturnValue([]),
        getMetricHistory: vi.fn().mockReturnValue([]),
      };
    }),
  };
});

describe('ConsciousnessMetricsEngine', () => {
  let engine: ConsciousnessMetricsEngine;
  let mockFramework: ConsciousnessMetricsFramework;

  beforeEach(() => {
    vi.clearAllMocks();
    mockFramework = new ConsciousnessMetricsFramework();
    engine = new ConsciousnessMetricsEngine(mockFramework);
  });

  it('should create an instance with default framework if none provided', () => {
    const defaultEngine = new ConsciousnessMetricsEngine();
    expect(defaultEngine).toBeInstanceOf(ConsciousnessMetricsEngine);
    expect(ConsciousnessMetricsFramework).toHaveBeenCalled();
  });

  it('should initialize the framework', () => {
    engine.initialize();
    expect(mockFramework.initialize).toHaveBeenCalled();
  });

  it('should get the current consciousness vector', () => {
    const vector = engine.getCurrentVector();
    expect(mockFramework.getCurrentVector).toHaveBeenCalled();
    expect(vector).toHaveProperty('dimensions');
    expect(vector.dimensions).toHaveProperty('SELF_AWARENESS');
    expect(vector.dimensions).toHaveProperty('ADAPTABILITY');
    expect(vector.dimensions).toHaveProperty('EMERGENCE');
  });

  it('should get the current consciousness state', () => {
    const state = engine.getCurrentState();
    expect(mockFramework.getCurrentState).toHaveBeenCalled();
    expect(state).toHaveProperty('vector');
    expect(state).toHaveProperty('emergence');
    expect(state).toHaveProperty('evolutionRate');
    expect(state).toHaveProperty('stability');
    expect(state).toHaveProperty('coherence');
  });

  it('should get the current emergence indicators', () => {
    const emergence = engine.getCurrentEmergence();
    expect(mockFramework.getCurrentEmergence).toHaveBeenCalled();
    expect(emergence).toHaveProperty('indicators');
    expect(emergence.indicators).toHaveProperty('PATTERN_RECOGNITION');
    expect(emergence.indicators).toHaveProperty('NOVEL_BEHAVIOR');
    expect(emergence.indicators).toHaveProperty('COMPLEXITY_INCREASE');
  });

  it('should record a metric measurement', () => {
    const measurement = {
      metricType: MetricType.SELF_REFLECTION_DEPTH,
      value: 0.75,
      confidence: 0.9,
      timestamp: Date.now(),
    };

    engine.recordMeasurement(measurement);
    expect(mockFramework.recordMeasurement).toHaveBeenCalledWith(measurement);
  });

  it('should get historical vectors', () => {
    const options = { startTime: Date.now() - 3600000, limit: 10 };
    engine.getHistoricalVectors(options);
    expect(mockFramework.getVectorHistory).toHaveBeenCalledWith(options);
  });

  it('should get historical states', () => {
    const options = { startTime: Date.now() - 3600000, limit: 10 };
    engine.getHistoricalStates(options);
    expect(mockFramework.getStateHistory).toHaveBeenCalledWith(options);
  });

  it('should get metric history', () => {
    const metricType = MetricType.SELF_REFLECTION_DEPTH;
    const options = { startTime: Date.now() - 3600000, limit: 10 };
    engine.getMetricHistory(metricType, options);
    expect(mockFramework.getMetricHistory).toHaveBeenCalledWith(
      metricType,
      options
    );
  });

  it('should forward events from the framework', () => {
    // Create spies for the engine's event handlers
    const stateChangedSpy = vi.fn();
    const vectorUpdatedSpy = vi.fn();
    const emergenceDetectedSpy = vi.fn();
    const thresholdCrossedSpy = vi.fn();
    const anomalyDetectedSpy = vi.fn();

    // Register event handlers
    engine.on('state_changed', stateChangedSpy);
    engine.on('vector_updated', vectorUpdatedSpy);
    engine.on('emergence_detected', emergenceDetectedSpy);
    engine.on('threshold_crossed', thresholdCrossedSpy);
    engine.on('anomaly_detected', anomalyDetectedSpy);

    // Emit events from the framework
    const mockState = { timestamp: Date.now() } as ConsciousnessState;
    const mockVector = { timestamp: Date.now() } as ConsciousnessVector;
    const mockEmergence = { timestamp: Date.now() } as EmergenceIndicators;
    const mockThresholdData = {
      metricType: MetricType.SELF_REFLECTION_DEPTH,
      value: 0.9,
    };
    const mockAnomalyData = {
      metricType: MetricType.ADAPTABILITY,
      value: 0.2,
      expected: 0.7,
    };

    mockFramework.emit(MetricsEvent.STATE_CHANGED, mockState);
    mockFramework.emit(MetricsEvent.VECTOR_UPDATED, mockVector);
    mockFramework.emit(MetricsEvent.EMERGENCE_DETECTED, mockEmergence);
    mockFramework.emit(MetricsEvent.THRESHOLD_CROSSED, mockThresholdData);
    mockFramework.emit(MetricsEvent.ANOMALY_DETECTED, mockAnomalyData);

    // Verify that the engine forwarded the events
    expect(stateChangedSpy).toHaveBeenCalledWith(mockState);
    expect(vectorUpdatedSpy).toHaveBeenCalledWith(mockVector);
    expect(emergenceDetectedSpy).toHaveBeenCalledWith(mockEmergence);
    expect(thresholdCrossedSpy).toHaveBeenCalledWith(mockThresholdData);
    expect(anomalyDetectedSpy).toHaveBeenCalledWith(mockAnomalyData);
  });
});

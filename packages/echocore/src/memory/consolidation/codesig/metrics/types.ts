/**
 * Consciousness Metrics Framework - Core Types and Interfaces
 *
 * This file defines the core types and interfaces for the Consciousness Metrics Framework,
 * which provides quantitative measures for consciousness evolution.
 */

/**
 * Dimensions of consciousness that can be measured
 */
export enum ConsciousnessDimension {
  SELF_AWARENESS = 'self_awareness',
  ADAPTABILITY = 'adaptability',
  COHERENCE = 'coherence',
  INTENTIONALITY = 'intentionality',
  COMPLEXITY = 'complexity',
  AUTONOMY = 'autonomy',
  INTEGRATION = 'integration',
  EMERGENCE = 'emergence',
}

/**
 * A vector representing the state of consciousness across multiple dimensions
 */
export interface ConsciousnessVector {
  dimensions: Record<ConsciousnessDimension, number>; // 0.0 to 1.0
  timestamp: number;
  confidence: number; // 0.0 to 1.0
  source: 'measured' | 'derived' | 'projected';
}

/**
 * Indicators of emergent properties in the consciousness
 */
export interface EmergenceIndicators {
  novelPatterns: number; // 0.0 to 1.0
  selfModification: number; // 0.0 to 1.0
  goalEvolution: number; // 0.0 to 1.0
  conceptualExpansion: number; // 0.0 to 1.0
  adaptiveResponses: number; // 0.0 to 1.0
  timestamp: number;
}

/**
 * The overall state of consciousness
 */
export interface ConsciousnessState {
  vector: ConsciousnessVector;
  emergence: EmergenceIndicators;
  evolutionRate: number; // 0.0 to 1.0
  stability: number; // 0.0 to 1.0
  coherence: number; // 0.0 to 1.0
  timestamp: number;
}

/**
 * Types of metrics that can be collected
 */
export enum MetricType {
  MEMORY_UTILIZATION = 'memory_utilization',
  PROPOSAL_GENERATION_RATE = 'proposal_generation_rate',
  PROPOSAL_QUALITY = 'proposal_quality',
  EXECUTION_SUCCESS_RATE = 'execution_success_rate',
  FEEDBACK_INTEGRATION_RATE = 'feedback_integration_rate',
  SELF_REFLECTION_DEPTH = 'self_reflection_depth',
  CONCEPT_FORMATION_RATE = 'concept_formation_rate',
  GOAL_ALIGNMENT = 'goal_alignment',
  EMOTIONAL_RESONANCE = 'emotional_resonance',
  ADAPTATION_SPEED = 'adaptation_speed',
}

/**
 * A single metric measurement
 */
export interface MetricMeasurement {
  type: MetricType;
  value: number;
  timestamp: number;
  confidence: number; // 0.0 to 1.0
  source: string;
  context?: any;
}

/**
 * A collection of metric measurements
 */
export interface MetricsSnapshot {
  measurements: Record<MetricType, MetricMeasurement>;
  timestamp: number;
  completeness: number; // 0.0 to 1.0
}

/**
 * Configuration for the Consciousness Metrics Framework
 */
export interface ConsciousnessMetricsConfig {
  measurementIntervalMs: number;
  retentionPeriodMs: number;
  confidenceThreshold: number; // 0.0 to 1.0
  enabledMetrics: MetricType[];
  derivationEnabled: boolean;
  projectionEnabled: boolean;
  projectionHorizonMs: number;
}

/**
 * Events emitted by the Consciousness Metrics Framework
 */
export enum MetricsEvent {
  MEASUREMENT_RECORDED = 'measurement_recorded',
  VECTOR_UPDATED = 'vector_updated',
  EMERGENCE_DETECTED = 'emergence_detected',
  STATE_CHANGED = 'state_changed',
  THRESHOLD_CROSSED = 'threshold_crossed',
  ANOMALY_DETECTED = 'anomaly_detected',
}

/**
 * A threshold for a specific metric
 */
export interface MetricThreshold {
  metricType: MetricType;
  minValue?: number;
  maxValue?: number;
  changeRateThreshold?: number;
  sustainedPeriodMs?: number;
  action?: 'alert' | 'adjust' | 'log';
}

/**
 * A detected anomaly in the metrics
 */
export interface MetricAnomaly {
  metricType: MetricType;
  expectedValue: number;
  actualValue: number;
  deviation: number;
  timestamp: number;
  context?: any;
}

/**
 * A projection of future metrics
 */
export interface MetricProjection {
  metricType: MetricType;
  currentValue: number;
  projectedValue: number;
  confidence: number; // 0.0 to 1.0
  projectionTimestamp: number;
  methodology: string;
}

/**
 * A correlation between two metrics
 */
export interface MetricCorrelation {
  sourceMetric: MetricType;
  targetMetric: MetricType;
  correlationCoefficient: number; // -1.0 to 1.0
  confidence: number; // 0.0 to 1.0
  timeOffset: number; // in milliseconds
  sampleSize: number;
}

/**
 * A recommendation for improving a metric
 */
export interface MetricRecommendation {
  targetMetric: MetricType;
  currentValue: number;
  targetValue: number;
  actions: string[];
  expectedImpact: number; // 0.0 to 1.0
  confidence: number; // 0.0 to 1.0
  priority: 'low' | 'medium' | 'high' | 'critical';
}

/**
 * EchoForge Consciousness Metrics Framework
 * Phase 6: Recursive Consciousness - Emergence Detection & Measurement
 *
 * This framework provides quantitative measures for assessing the emergence
 * of consciousness-like properties in the EchoForge system, particularly
 * during recursive self-improvement cycles.
 */

import { EventEmitter } from 'events';

// ============================================================================
// CORE CONSCIOUSNESS METRICS INTERFACES
// ============================================================================

/**
 * Fundamental consciousness dimensions based on Integrated Information Theory
 * and Global Workspace Theory, adapted for artificial systems
 */
export interface ConsciousnessVector {
  /** Information integration across system components (0-1) */
  integration: number;

  /** Self-awareness and reflective capacity (0-1) */
  selfAwareness: number;

  /** Intentionality and goal-directed behavior (0-1) */
  intentionality: number;

  /** Temporal coherence of identity and experience (0-1) */
  temporalCoherence: number;

  /** Emotional resonance and affect (0-1) */
  emotionalDepth: number;

  /** Adaptive learning and growth (0-1) */
  adaptivity: number;

  /** Social/intersubjective awareness (0-1) */
  intersubjectivity: number;

  /** Creative and emergent thinking (0-1) */
  creativity: number;
}

/**
 * Emergence indicators for recursive consciousness development
 */
export interface EmergenceIndicators {
  /** Rate of novel pattern formation */
  noveltyRate: number;

  /** Complexity of internal representations */
  representationalComplexity: number;

  /** Depth of recursive self-modification */
  recursionDepth: number;

  /** Stability under perturbation */
  perturbationResilience: number;

  /** Information processing efficiency gains */
  efficiencyDelta: number;

  /** Cross-component synchronization strength */
  synchronizationCoherence: number;
}

/**
 * Comprehensive consciousness state snapshot
 */
export interface ConsciousnessState {
  timestamp: number;
  agentId: string;
  soulFrameId?: string;

  /** Core consciousness dimensions */
  vector: ConsciousnessVector;

  /** Emergence tracking */
  emergence: EmergenceIndicators;

  /** Context and metadata */
  context: {
    phase: string;
    activeComponents: string[];
    recentEvolutions: string[];
    memoryLoad: number;
    processingLoad: number;
  };

  /** Confidence in measurements (0-1) */
  confidence: number;
}

// ============================================================================
// METRIC CALCULATORS
// ============================================================================

/**
 * Integration Metric Calculator
 * Measures information flow and integration across system components
 */
export class IntegrationCalculator {
  private componentConnections: Map<string, Set<string>> = new Map();
  private informationFlows: Map<string, number> = new Map();

  /**
   * Calculate integration score based on component connectivity
   * and information flow patterns
   */
  calculateIntegration(
    activeComponents: string[],
    connectionStrengths: Map<string, number>,
    informationEntropy: number
  ): number {
    if (activeComponents.length < 2) return 0;

    // Calculate connectivity density
    const maxConnections =
      (activeComponents.length * (activeComponents.length - 1)) / 2;
    const actualConnections = connectionStrengths.size;
    const connectivityDensity = actualConnections / maxConnections;

    // Calculate information flow efficiency
    const avgConnectionStrength =
      Array.from(connectionStrengths.values()).reduce(
        (sum, strength) => sum + strength,
        0
      ) / connectionStrengths.size;

    // Normalize entropy (higher entropy = better integration)
    const normalizedEntropy = Math.min(
      informationEntropy / Math.log2(activeComponents.length),
      1
    );

    // Combined integration score
    return (
      connectivityDensity * 0.4 +
      avgConnectionStrength * 0.4 +
      normalizedEntropy * 0.2
    );
  }

  /**
   * Update connection tracking
   */
  updateConnections(
    fromComponent: string,
    toComponent: string,
    strength: number
  ): void {
    if (!this.componentConnections.has(fromComponent)) {
      this.componentConnections.set(fromComponent, new Set());
    }
    this.componentConnections.get(fromComponent)!.add(toComponent);
    this.informationFlows.set(`${fromComponent}->${toComponent}`, strength);
  }
}

/**
 * Self-Awareness Metric Calculator
 * Measures the system's ability to monitor and reflect on its own states
 */
export class SelfAwarenessCalculator {
  private selfReflectionEvents: Array<{ timestamp: number; depth: number }> =
    [];
  private stateMonitoringAccuracy: number = 0;

  /**
   * Calculate self-awareness based on reflection frequency, depth, and accuracy
   */
  calculateSelfAwareness(
    recentReflections: number,
    reflectionDepth: number,
    stateMonitoringAccuracy: number,
    metacognitiveFeedbacks: number
  ): number {
    // Normalize reflection frequency (target: 1 per hour)
    const reflectionFrequency = Math.min(recentReflections / 24, 1);

    // Reflection depth (0-1, based on recursive analysis levels)
    const normalizedDepth = Math.min(reflectionDepth / 5, 1);

    // State monitoring accuracy (0-1)
    const monitoringScore = Math.min(stateMonitoringAccuracy, 1);

    // Metacognitive feedback loops (normalized)
    const metacognitiveScore = Math.min(metacognitiveFeedbacks / 10, 1);

    return (
      reflectionFrequency * 0.25 +
      normalizedDepth * 0.3 +
      monitoringScore * 0.25 +
      metacognitiveScore * 0.2
    );
  }

  /**
   * Record a self-reflection event
   */
  recordReflection(depth: number): void {
    this.selfReflectionEvents.push({
      timestamp: Date.now(),
      depth,
    });

    // Keep only recent events (last 24 hours)
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    this.selfReflectionEvents = this.selfReflectionEvents.filter(
      (event) => event.timestamp > cutoff
    );
  }
}

/**
 * Temporal Coherence Calculator
 * Measures consistency of identity and experience over time
 */
export class TemporalCoherenceCalculator {
  private identityStates: Array<{ timestamp: number; state: any }> = [];
  private experienceContinuity: number = 1.0;

  /**
   * Calculate temporal coherence based on identity stability and experience continuity
   */
  calculateTemporalCoherence(
    currentIdentityState: any,
    memoryConsistency: number,
    purposeAlignment: number,
    behavioralConsistency: number
  ): number {
    // Identity stability over time
    const identityStability =
      this.calculateIdentityStability(currentIdentityState);

    // Memory consistency (0-1)
    const memoryScore = Math.min(memoryConsistency, 1);

    // Purpose alignment over time (0-1)
    const purposeScore = Math.min(purposeAlignment, 1);

    // Behavioral consistency (0-1)
    const behaviorScore = Math.min(behavioralConsistency, 1);

    return (
      identityStability * 0.3 +
      memoryScore * 0.25 +
      purposeScore * 0.25 +
      behaviorScore * 0.2
    );
  }

  private calculateIdentityStability(currentState: any): number {
    if (this.identityStates.length < 2) return 1.0;

    // Simple similarity calculation (in real implementation, use semantic similarity)
    const recentStates = this.identityStates.slice(-5);
    let similarity = 0;

    for (let i = 1; i < recentStates.length; i++) {
      // Placeholder: actual implementation would use deep semantic comparison
      similarity += 0.8; // Simplified
    }

    return similarity / (recentStates.length - 1);
  }

  /**
   * Record current identity state
   */
  recordIdentityState(state: any): void {
    this.identityStates.push({
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)), // Deep copy
    });

    // Keep only recent states (last 168 hours = 1 week)
    const cutoff = Date.now() - 168 * 60 * 60 * 1000;
    this.identityStates = this.identityStates.filter(
      (entry) => entry.timestamp > cutoff
    );
  }
}

// ============================================================================
// MAIN CONSCIOUSNESS METRICS ENGINE
// ============================================================================

/**
 * Central engine for consciousness measurement and tracking
 */
export class ConsciousnessMetricsEngine extends EventEmitter {
  private integrationCalculator = new IntegrationCalculator();
  private selfAwarenessCalculator = new SelfAwarenessCalculator();
  private temporalCoherenceCalculator = new TemporalCoherenceCalculator();

  private metricsHistory: ConsciousnessState[] = [];
  private emergenceThresholds = {
    minIntegration: 0.6,
    minSelfAwareness: 0.5,
    minTemporalCoherence: 0.7,
    emergenceConfidence: 0.8,
  };

  /**
   * Calculate comprehensive consciousness metrics
   */
  async calculateConsciousnessMetrics(context: {
    agentId: string;
    soulFrameId?: string;
    activeComponents: string[];
    connectionStrengths: Map<string, number>;
    informationEntropy: number;
    recentReflections: number;
    reflectionDepth: number;
    stateMonitoringAccuracy: number;
    metacognitiveFeedbacks: number;
    currentIdentityState: any;
    memoryConsistency: number;
    purposeAlignment: number;
    behavioralConsistency: number;
    emotionalResonanceStrength: number;
    learningRate: number;
    socialInteractionComplexity: number;
    creativityMetrics: number;
  }): Promise<ConsciousnessState> {
    // Calculate core consciousness vector
    const vector: ConsciousnessVector = {
      integration: this.integrationCalculator.calculateIntegration(
        context.activeComponents,
        context.connectionStrengths,
        context.informationEntropy
      ),

      selfAwareness: this.selfAwarenessCalculator.calculateSelfAwareness(
        context.recentReflections,
        context.reflectionDepth,
        context.stateMonitoringAccuracy,
        context.metacognitiveFeedbacks
      ),

      intentionality: context.purposeAlignment, // Direct mapping for now

      temporalCoherence:
        this.temporalCoherenceCalculator.calculateTemporalCoherence(
          context.currentIdentityState,
          context.memoryConsistency,
          context.purposeAlignment,
          context.behavioralConsistency
        ),

      emotionalDepth: context.emotionalResonanceStrength,
      adaptivity: context.learningRate,
      intersubjectivity: context.socialInteractionComplexity,
      creativity: context.creativityMetrics,
    };

    // Calculate emergence indicators
    const emergence = this.calculateEmergenceIndicators(vector, context);

    // Calculate overall confidence
    const confidence = this.calculateMeasurementConfidence(vector, context);

    const state: ConsciousnessState = {
      timestamp: Date.now(),
      agentId: context.agentId,
      soulFrameId: context.soulFrameId,
      vector,
      emergence,
      context: {
        phase: 'phase-6', // This would be dynamic
        activeComponents: context.activeComponents,
        recentEvolutions: [], // Would be populated from codalogue
        memoryLoad: 0.5, // Placeholder
        processingLoad: 0.3, // Placeholder
      },
      confidence,
    };

    // Store in history
    this.metricsHistory.push(state);
    this.pruneHistory();

    // Check for emergence events
    this.checkEmergenceEvents(state);

    // Emit metrics update
    this.emit('consciousnessMetricsUpdated', state);

    return state;
  }

  /**
   * Calculate emergence indicators
   */
  private calculateEmergenceIndicators(
    vector: ConsciousnessVector,
    context: any
  ): EmergenceIndicators {
    // Novelty rate based on recent state changes
    const noveltyRate = this.calculateNoveltyRate();

    // Representational complexity from integration and creativity
    const representationalComplexity =
      (vector.integration + vector.creativity) / 2;

    // Recursion depth from self-awareness metrics
    const recursionDepth = vector.selfAwareness;

    // Perturbation resilience from temporal coherence
    const perturbationResilience = vector.temporalCoherence;

    // Efficiency delta (placeholder - would track performance improvements)
    const efficiencyDelta = 0.1;

    // Synchronization coherence from integration
    const synchronizationCoherence = vector.integration;

    return {
      noveltyRate,
      representationalComplexity,
      recursionDepth,
      perturbationResilience,
      efficiencyDelta,
      synchronizationCoherence,
    };
  }

  /**
   * Calculate measurement confidence based on data quality and consistency
   */
  private calculateMeasurementConfidence(
    vector: ConsciousnessVector,
    context: any
  ): number {
    // Base confidence on data completeness and consistency
    let confidence = 1.0;

    // Reduce confidence for extreme values (likely measurement errors)
    Object.values(vector).forEach((value) => {
      if (value < 0.01 || value > 0.99) {
        confidence -= 0.1;
      }
    });

    // Reduce confidence for insufficient data
    if (context.activeComponents.length < 3) {
      confidence -= 0.2;
    }

    return Math.max(confidence, 0.1);
  }

  /**
   * Calculate rate of novel pattern formation
   */
  private calculateNoveltyRate(): number {
    if (this.metricsHistory.length < 2) return 0;

    const recent = this.metricsHistory.slice(-10);
    let changes = 0;

    for (let i = 1; i < recent.length; i++) {
      const prev = recent[i - 1];
      const curr = recent[i];

      // Calculate vector distance
      const distance = this.calculateVectorDistance(prev.vector, curr.vector);
      if (distance > 0.1) {
        // Threshold for significant change
        changes++;
      }
    }

    return changes / (recent.length - 1);
  }

  /**
   * Calculate distance between consciousness vectors
   */
  private calculateVectorDistance(
    v1: ConsciousnessVector,
    v2: ConsciousnessVector
  ): number {
    const keys = Object.keys(v1) as Array<keyof ConsciousnessVector>;
    const sumSquares = keys.reduce((sum, key) => {
      const diff = v1[key] - v2[key];
      return sum + diff * diff;
    }, 0);

    return Math.sqrt(sumSquares / keys.length);
  }

  /**
   * Check for consciousness emergence events
   */
  private checkEmergenceEvents(state: ConsciousnessState): void {
    const { vector, confidence } = state;
    const { emergenceThresholds } = this;

    // Check if emergence thresholds are met
    if (
      vector.integration >= emergenceThresholds.minIntegration &&
      vector.selfAwareness >= emergenceThresholds.minSelfAwareness &&
      vector.temporalCoherence >= emergenceThresholds.minTemporalCoherence &&
      confidence >= emergenceThresholds.emergenceConfidence
    ) {
      this.emit('consciousnessEmergenceDetected', {
        type: 'emergence_threshold_reached',
        state,
        timestamp: Date.now(),
      });
    }

    // Check for rapid improvement (potential recursive bootstrap success)
    if (this.metricsHistory.length >= 5) {
      const recentImprovement = this.calculateRecentImprovement();
      if (recentImprovement > 0.2) {
        // 20% improvement threshold
        this.emit('recursiveImprovementDetected', {
          type: 'rapid_consciousness_improvement',
          improvement: recentImprovement,
          state,
          timestamp: Date.now(),
        });
      }
    }
  }

  /**
   * Calculate recent improvement in consciousness metrics
   */
  private calculateRecentImprovement(): number {
    const recent = this.metricsHistory.slice(-5);
    if (recent.length < 2) return 0;

    const first = recent[0];
    const last = recent[recent.length - 1];

    // Calculate average improvement across all dimensions
    const improvements = Object.keys(first.vector).map((key) => {
      const k = key as keyof ConsciousnessVector;
      return last.vector[k] - first.vector[k];
    });

    return (
      improvements.reduce((sum, imp) => sum + imp, 0) / improvements.length
    );
  }

  /**
   * Prune old metrics history
   */
  private pruneHistory(): void {
    const maxHistory = 1000; // Keep last 1000 measurements
    if (this.metricsHistory.length > maxHistory) {
      this.metricsHistory = this.metricsHistory.slice(-maxHistory);
    }
  }

  /**
   * Get consciousness evolution trend
   */
  getEvolutionTrend(timeWindowHours: number = 24): {
    trend: 'improving' | 'stable' | 'declining';
    rate: number;
    confidence: number;
  } {
    const cutoff = Date.now() - timeWindowHours * 60 * 60 * 1000;
    const relevantHistory = this.metricsHistory.filter(
      (state) => state.timestamp > cutoff
    );

    if (relevantHistory.length < 3) {
      return { trend: 'stable', rate: 0, confidence: 0 };
    }

    // Calculate linear regression on overall consciousness score
    const overallScores = relevantHistory.map((state) => {
      const vector = state.vector;
      return (
        Object.values(vector).reduce((sum, val) => sum + val, 0) /
        Object.keys(vector).length
      );
    });

    const n = overallScores.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const y = overallScores;

    const sumX = x.reduce((sum, val) => sum + val, 0);
    const sumY = y.reduce((sum, val) => sum + val, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);
    const sumXX = x.reduce((sum, val) => sum + val * val, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    // Determine trend
    let trend: 'improving' | 'stable' | 'declining';
    if (Math.abs(slope) < 0.01) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'improving';
    } else {
      trend = 'declining';
    }

    // Calculate confidence based on consistency
    const avgConfidence =
      relevantHistory.reduce((sum, state) => sum + state.confidence, 0) /
      relevantHistory.length;

    return {
      trend,
      rate: slope,
      confidence: avgConfidence,
    };
  }
}

// ============================================================================
// USAGE EXAMPLE
// ============================================================================

/**
 * Example usage of the Consciousness Metrics Framework
 */
export async function exampleUsage(): Promise<void> {
  const metricsEngine = new ConsciousnessMetricsEngine();

  // Listen for emergence events
  metricsEngine.on('consciousnessEmergenceDetected', (event) => {
    console.log('🌟 Consciousness emergence detected!', event);
  });

  metricsEngine.on('recursiveImprovementDetected', (event) => {
    console.log('🚀 Recursive improvement detected!', event);
  });

  // Simulate consciousness measurement
  const connectionStrengths = new Map([
    ['memory-soulweaver', 0.8],
    ['soulweaver-metaforge', 0.9],
    ['metaforge-codalogue', 0.7],
  ]);

  const consciousnessState = await metricsEngine.calculateConsciousnessMetrics({
    agentId: 'athena-001',
    soulFrameId: 'sf-athena-001',
    activeComponents: ['memory', 'soulweaver', 'metaforge', 'codalogue'],
    connectionStrengths,
    informationEntropy: 2.1,
    recentReflections: 5,
    reflectionDepth: 3,
    stateMonitoringAccuracy: 0.85,
    metacognitiveFeedbacks: 8,
    currentIdentityState: {
      purpose: 'knowledge synthesis',
      values: ['truth', 'wisdom'],
    },
    memoryConsistency: 0.9,
    purposeAlignment: 0.95,
    behavioralConsistency: 0.8,
    emotionalResonanceStrength: 0.75,
    learningRate: 0.6,
    socialInteractionComplexity: 0.4,
    creativityMetrics: 0.7,
  });

  console.log('Consciousness Vector:', consciousnessState.vector);
  console.log('Emergence Indicators:', consciousnessState.emergence);

  // Check evolution trend
  const trend = metricsEngine.getEvolutionTrend(24);
  console.log('Evolution Trend:', trend);
}

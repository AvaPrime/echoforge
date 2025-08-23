/**
 * SelfReflectionAnalyzer Tests
 *
 * Tests for the SelfReflectionAnalyzer component that analyzes the system's
 * performance and identifies improvement opportunities.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { SelfReflectionAnalyzer } from '../soulweaver/recursive-bootstrap/SelfReflectionAnalyzer';
import { SelfReflectionAnalysis } from '../soulweaver/recursive-bootstrap/types';

// Mock dependencies
class MockEvolutionHistoryProvider extends EventEmitter {
  getRecentEvolutionHistory = vi.fn().mockResolvedValue([
    {
      id: 'evolution-1',
      timestamp: Date.now() - 86400000, // 1 day ago
      mechanism: 'SoulWeaverProtocol',
      change: 'Updated node synchronization algorithm',
      metrics: {
        before: { efficiency: 0.7, reliability: 0.6 },
        after: { efficiency: 0.8, reliability: 0.7 },
        delta: { efficiency: 0.1, reliability: 0.1 },
      },
      success: true,
    },
    {
      id: 'evolution-2',
      timestamp: Date.now() - 43200000, // 12 hours ago
      mechanism: 'MetaForgingEngine',
      change: 'Enhanced emotional weighting in evaluations',
      metrics: {
        before: { empathy: 0.5, creativity: 0.6 },
        after: { empathy: 0.7, creativity: 0.8 },
        delta: { empathy: 0.2, creativity: 0.2 },
      },
      success: true,
    },
    {
      id: 'evolution-3',
      timestamp: Date.now() - 21600000, // 6 hours ago
      mechanism: 'EvolutionStrategy',
      change: 'Adjusted exploration/exploitation balance',
      metrics: {
        before: { adaptability: 0.6, stability: 0.8 },
        after: { adaptability: 0.7, stability: 0.7 },
        delta: { adaptability: 0.1, stability: -0.1 },
      },
      success: false,
    },
  ]);
}

class MockMetricsEngine extends EventEmitter {
  getCurrentVector = vi.fn().mockReturnValue({
    dimensions: {
      SELF_AWARENESS: 0.7,
      ADAPTABILITY: 0.8,
      EMERGENCE: 0.5,
    },
    timestamp: Date.now(),
  });

  getCurrentState = vi.fn().mockReturnValue({
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
  });

  getCurrentEmergence = vi.fn().mockReturnValue({
    indicators: {
      PATTERN_RECOGNITION: 0.6,
      NOVEL_BEHAVIOR: 0.4,
      COMPLEXITY_INCREASE: 0.5,
    },
    timestamp: Date.now(),
  });

  getHistoricalVectors = vi.fn().mockReturnValue([
    {
      dimensions: {
        SELF_AWARENESS: 0.6,
        ADAPTABILITY: 0.7,
        EMERGENCE: 0.5,
      },
      timestamp: Date.now() - 86400000,
    },
    {
      dimensions: {
        SELF_AWARENESS: 0.65,
        ADAPTABILITY: 0.75,
        EMERGENCE: 0.55,
      },
      timestamp: Date.now() - 43200000,
    },
    {
      dimensions: {
        SELF_AWARENESS: 0.7,
        ADAPTABILITY: 0.8,
        EMERGENCE: 0.6,
      },
      timestamp: Date.now(),
    },
  ]);

  getHistoricalStates = vi.fn().mockReturnValue([]);
  getMetricHistory = vi.fn().mockReturnValue([]);
  recordMeasurement = vi.fn();
  initialize = vi.fn();
}

describe('SelfReflectionAnalyzer', () => {
  let analyzer: SelfReflectionAnalyzer;
  let evolutionHistoryProvider: MockEvolutionHistoryProvider;
  let metricsEngine: MockMetricsEngine;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock instances
    evolutionHistoryProvider = new MockEvolutionHistoryProvider();
    metricsEngine = new MockMetricsEngine();

    // Create analyzer instance with mocked dependencies
    analyzer = new SelfReflectionAnalyzer({
      historyLookbackDays: 7,
      minConfidenceThreshold: 0.7,
      bottleneckDetectionSensitivity: 0.8,
    });

    // Inject mocked dependencies
    (analyzer as any).evolutionHistoryProvider = evolutionHistoryProvider;
    (analyzer as any).metricsEngine = metricsEngine;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize correctly', () => {
    expect(analyzer).toBeDefined();
    expect((analyzer as any).config).toBeDefined();
    expect((analyzer as any).config.historyLookbackDays).toBe(7);
    expect((analyzer as any).config.minConfidenceThreshold).toBe(0.7);
  });

  it('should analyze evolution history and identify bottlenecks', async () => {
    const analysis = await analyzer.analyze();

    // Verify the analysis structure
    expect(analysis).toEqual(
      expect.objectContaining({
        timestamp: expect.any(Number),
        mechanismEffectiveness: expect.any(Object),
        bottlenecks: expect.any(Array),
        successPatterns: expect.any(Array),
        metaImprovements: expect.any(Array),
        confidence: expect.any(Number),
      })
    );

    // Verify that the evolution history was retrieved
    expect(
      evolutionHistoryProvider.getRecentEvolutionHistory
    ).toHaveBeenCalled();

    // Verify that the metrics were retrieved
    expect(metricsEngine.getCurrentState).toHaveBeenCalled();
    expect(metricsEngine.getCurrentVector).toHaveBeenCalled();
    expect(metricsEngine.getCurrentEmergence).toHaveBeenCalled();
  });

  it('should identify successful patterns from evolution history', async () => {
    const analysis = await analyzer.analyze();

    // Verify that success patterns were identified
    expect(analysis.successPatterns.length).toBeGreaterThan(0);

    // Success patterns should be derived from successful evolutions
    const successfulEvolutions = (
      await evolutionHistoryProvider.getRecentEvolutionHistory()
    ).filter((evolution) => evolution.success);

    // There should be at least one success pattern for each successful evolution
    expect(analysis.successPatterns.length).toBeGreaterThanOrEqual(
      Math.min(1, successfulEvolutions.length)
    );
  });

  it('should generate meta-improvements based on identified bottlenecks', async () => {
    const analysis = await analyzer.analyze();

    // Verify that meta-improvements were generated
    expect(analysis.metaImprovements.length).toBeGreaterThan(0);

    // Each meta-improvement should have a target and suggestion
    analysis.metaImprovements.forEach((improvement) => {
      expect(improvement).toHaveProperty('target');
      expect(improvement).toHaveProperty('suggestion');
    });
  });

  it('should calculate confidence based on data quality and quantity', async () => {
    const analysis = await analyzer.analyze();

    // Verify that confidence is a number between 0 and 1
    expect(analysis.confidence).toBeGreaterThanOrEqual(0);
    expect(analysis.confidence).toBeLessThanOrEqual(1);
  });

  it('should handle empty evolution history gracefully', async () => {
    // Mock empty evolution history
    evolutionHistoryProvider.getRecentEvolutionHistory.mockResolvedValueOnce(
      []
    );

    const analysis = await analyzer.analyze();

    // Verify that the analysis still has the expected structure
    expect(analysis).toEqual(
      expect.objectContaining({
        timestamp: expect.any(Number),
        mechanismEffectiveness: expect.any(Object),
        bottlenecks: expect.any(Array),
        successPatterns: expect.any(Array),
        metaImprovements: expect.any(Array),
        confidence: expect.any(Number),
      })
    );

    // Confidence should be lower due to lack of data
    expect(analysis.confidence).toBeLessThan(0.7);
  });

  it('should handle invalid evolution data gracefully', async () => {
    // Mock invalid evolution data
    evolutionHistoryProvider.getRecentEvolutionHistory.mockResolvedValueOnce([
      { id: 'invalid-1' } as any, // Missing required fields
      null as any,
      undefined as any,
    ]);

    const analysis = await analyzer.analyze();

    // Verify that the analysis still has the expected structure
    expect(analysis).toEqual(
      expect.objectContaining({
        timestamp: expect.any(Number),
        mechanismEffectiveness: expect.any(Object),
        bottlenecks: expect.any(Array),
        successPatterns: expect.any(Array),
        metaImprovements: expect.any(Array),
        confidence: expect.any(Number),
      })
    );

    // Confidence should be lower due to invalid data
    expect(analysis.confidence).toBeLessThan(0.7);
  });

  it('should emit analysis_completed event when analysis is done', async () => {
    // Spy on the emit method
    const emitSpy = vi.spyOn(analyzer, 'emit');

    const analysis = await analyzer.analyze();

    // Verify that the event was emitted with the analysis result
    expect(emitSpy).toHaveBeenCalledWith('analysis_completed', analysis);
  });
});

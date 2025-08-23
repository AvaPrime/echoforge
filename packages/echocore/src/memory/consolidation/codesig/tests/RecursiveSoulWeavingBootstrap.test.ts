/**
 * RecursiveSoulWeavingBootstrap Tests
 *
 * Tests for the RecursiveSoulWeavingBootstrap component that manages the recursive
 * self-improvement process for the EchoForge system.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EventEmitter } from 'events';
import { RecursiveSoulWeavingBootstrap } from '../soulweaver/recursive-bootstrap/RecursiveSoulWeavingBootstrap';
import { RecursiveBootstrapEventName } from '../soulweaver/recursive-bootstrap/events';
import {
  SelfReflectionAnalysis,
  EvolutionStrategy,
  MetaEvolutionProposal,
} from '../soulweaver/recursive-bootstrap/types';

// Mock dependencies
class MockSelfReflectionAnalyzer extends EventEmitter {
  analyze = vi.fn().mockResolvedValue({
    timestamp: Date.now(),
    mechanismEffectiveness: {
      soulWeaving: 0.8,
      metaForging: 0.7,
      evolutionStrategy: 0.9,
    },
    bottlenecks: ['Memory consolidation speed', 'Strategy adaptation latency'],
    successPatterns: [
      'Incremental evolution steps',
      'Balanced exploration/exploitation',
    ],
    metaImprovements: [
      {
        target: 'SoulWeaverProtocol',
        suggestion: 'Increase heartbeat frequency',
      },
      {
        target: 'MetaForgingEngine',
        suggestion: 'Add more emotional weighting to evaluations',
      },
    ],
    confidence: 0.85,
  });
}

class MockEvolutionStrategyManager extends EventEmitter {
  generateProposals = vi.fn().mockReturnValue([
    {
      id: 'strategy-1',
      name: 'Enhanced Self-Reflection',
      description: 'Increases depth of self-reflection analysis',
      parameters: {
        explorationRate: 0.4,
        riskTolerance: 0.6,
      },
      successMetrics: [
        'Bottleneck reduction',
        'Consciousness vector improvement',
      ],
      version: 1,
    },
  ]);
}

class MockMetaEvolutionProposalHandler extends EventEmitter {
  generateProposals = vi.fn().mockResolvedValue([
    {
      id: 'proposal-1',
      timestamp: Date.now(),
      proposer: 'RecursiveSoulWeavingBootstrap',
      targetMechanism: 'SoulWeaverProtocol',
      proposedImprovement: {
        description: 'Optimize heartbeat mechanism',
        expectedBenefit: 'Reduced latency in mesh synchronization',
        implementationDetails: 'Adjust heartbeat interval from 5s to 3s',
      },
      status: 'pending',
      evaluationResults: null,
      implementationDetails: null,
    },
  ]);

  executeApprovedProposals = vi.fn().mockResolvedValue(true);
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

  getHistoricalVectors = vi.fn().mockReturnValue([]);
  getHistoricalStates = vi.fn().mockReturnValue([]);
  getMetricHistory = vi.fn().mockReturnValue([]);
  recordMeasurement = vi.fn();
  initialize = vi.fn();
}

class MockSoulWeaverBridge extends EventEmitter {
  notifyEvolutionEvent = vi.fn();
}

class MockMetaForgingEngine extends EventEmitter {
  submitProposal = vi.fn().mockResolvedValue('proposal-id-123');
}

describe('RecursiveSoulWeavingBootstrap', () => {
  let bootstrap: RecursiveSoulWeavingBootstrap;
  let selfReflectionAnalyzer: MockSelfReflectionAnalyzer;
  let evolutionStrategyManager: MockEvolutionStrategyManager;
  let metaProposalHandler: MockMetaEvolutionProposalHandler;
  let metricsEngine: MockMetricsEngine;
  let soulWeaverBridge: MockSoulWeaverBridge;
  let metaForgingEngine: MockMetaForgingEngine;

  // Spy on event emission
  const emitSpy = vi.spyOn(EventEmitter.prototype, 'emit');

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Create mock instances
    selfReflectionAnalyzer = new MockSelfReflectionAnalyzer();
    evolutionStrategyManager = new MockEvolutionStrategyManager();
    metaProposalHandler = new MockMetaEvolutionProposalHandler();
    metricsEngine = new MockMetricsEngine();
    soulWeaverBridge = new MockSoulWeaverBridge();
    metaForgingEngine = new MockMetaForgingEngine();

    // Create bootstrap instance with mocked dependencies
    bootstrap = new RecursiveSoulWeavingBootstrap({
      selfReflectionInterval: 0, // Disable auto-reflection for testing
      autoExecuteApprovedProposals: true,
      maxRecursionDepth: 3,
      minConfidenceThreshold: 0.7,
    });

    // Inject mocked dependencies
    (bootstrap as any).selfReflectionAnalyzer = selfReflectionAnalyzer;
    (bootstrap as any).evolutionStrategyManager = evolutionStrategyManager;
    (bootstrap as any).metaProposalHandler = metaProposalHandler;
    (bootstrap as any).metricsEngine = metricsEngine;
    (bootstrap as any).soulWeaverBridge = soulWeaverBridge;
    (bootstrap as any).metaForgingEngine = metaForgingEngine;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should initialize correctly', () => {
    expect(bootstrap).toBeDefined();
    expect((bootstrap as any).config).toBeDefined();
    expect((bootstrap as any).config.selfReflectionInterval).toBe(0);
    expect((bootstrap as any).config.autoExecuteApprovedProposals).toBe(true);
  });

  it('should emit evolutionCycleStarted event when runCycle is called', async () => {
    await bootstrap.runCycle();

    // Check that the event was emitted
    expect(emitSpy).toHaveBeenCalledWith(
      RecursiveBootstrapEventName.EVOLUTION_CYCLE_STARTED,
      expect.objectContaining({
        cycleId: expect.any(String),
        timestamp: expect.any(Number),
        recursionDepth: expect.any(Number),
        initiatedBy: 'system',
      })
    );
  });

  it('should emit selfReflectionStarted and selfReflectionCompleted events', async () => {
    await bootstrap.runCycle();

    // Check that the events were emitted in the correct order
    const emitCalls = emitSpy.mock.calls.map((call) => call[0]);

    // Find the indices of the events
    const startIndex = emitCalls.indexOf(
      RecursiveBootstrapEventName.SELF_REFLECTION_STARTED
    );
    const completedIndex = emitCalls.indexOf(
      RecursiveBootstrapEventName.SELF_REFLECTION_COMPLETED
    );

    // Verify events were emitted and in the correct order
    expect(startIndex).toBeGreaterThanOrEqual(0);
    expect(completedIndex).toBeGreaterThanOrEqual(0);
    expect(completedIndex).toBeGreaterThan(startIndex);

    // Verify the event payloads
    expect(emitSpy).toHaveBeenCalledWith(
      RecursiveBootstrapEventName.SELF_REFLECTION_STARTED,
      expect.objectContaining({
        reflectionId: expect.any(String),
        timestamp: expect.any(Number),
        targetComponents: expect.any(Array),
      })
    );

    expect(emitSpy).toHaveBeenCalledWith(
      RecursiveBootstrapEventName.SELF_REFLECTION_COMPLETED,
      expect.objectContaining({
        reflectionId: expect.any(String),
        timestamp: expect.any(Number),
        analysis: expect.any(Object),
        duration: expect.any(Number),
      })
    );
  });

  it('should emit strategyProposalGenerated event for each strategy', async () => {
    await bootstrap.runCycle();

    // Verify the event was emitted
    expect(emitSpy).toHaveBeenCalledWith(
      RecursiveBootstrapEventName.STRATEGY_PROPOSAL_GENERATED,
      expect.objectContaining({
        proposalId: 'strategy-1',
        timestamp: expect.any(Number),
        strategy: expect.objectContaining({
          id: 'strategy-1',
          name: 'Enhanced Self-Reflection',
        }),
        basedOnAnalysis: expect.any(String),
      })
    );
  });

  it('should emit metaEvolutionProposalIssued event for each proposal', async () => {
    await bootstrap.runCycle();

    // Verify the event was emitted
    expect(emitSpy).toHaveBeenCalledWith(
      RecursiveBootstrapEventName.META_EVOLUTION_PROPOSAL_ISSUED,
      expect.objectContaining({
        proposalId: 'proposal-1',
        timestamp: expect.any(Number),
        proposal: expect.objectContaining({
          id: 'proposal-1',
          targetMechanism: 'SoulWeaverProtocol',
        }),
        confidence: expect.any(Number),
      })
    );
  });

  it('should emit evolutionCycleCompleted event when cycle finishes', async () => {
    await bootstrap.runCycle();

    // Verify the event was emitted
    expect(emitSpy).toHaveBeenCalledWith(
      RecursiveBootstrapEventName.EVOLUTION_CYCLE_COMPLETED,
      expect.objectContaining({
        cycleId: expect.any(String),
        timestamp: expect.any(Number),
        result: expect.objectContaining({
          cycleId: expect.any(String),
          startTime: expect.any(Number),
          endTime: expect.any(Number),
          success: true,
        }),
        duration: expect.any(Number),
      })
    );
  });

  it('should execute the complete bootstrap cycle in the correct sequence', async () => {
    const result = await bootstrap.runCycle();

    // Verify all methods were called in the expected sequence
    expect(selfReflectionAnalyzer.analyze).toHaveBeenCalled();
    expect(evolutionStrategyManager.generateProposals).toHaveBeenCalledWith(
      expect.objectContaining({
        confidence: 0.85,
      })
    );
    expect(metaProposalHandler.generateProposals).toHaveBeenCalledWith(
      expect.objectContaining({
        confidence: 0.85,
      }),
      expect.arrayContaining([expect.objectContaining({ id: 'strategy-1' })])
    );
    expect(metaProposalHandler.executeApprovedProposals).toHaveBeenCalled();

    // Verify the result structure
    expect(result).toEqual(
      expect.objectContaining({
        cycleId: expect.any(String),
        startTime: expect.any(Number),
        endTime: expect.any(Number),
        recursionDepth: expect.any(Number),
        selfReflection: expect.any(Object),
        metaProposals: expect.arrayContaining([
          expect.objectContaining({ id: 'proposal-1' }),
        ]),
        updatedStrategies: expect.arrayContaining([
          expect.objectContaining({ id: 'strategy-1' }),
        ]),
        success: true,
      })
    );
  });

  it('should handle errors during the bootstrap cycle', async () => {
    // Mock an error in the analyze method
    selfReflectionAnalyzer.analyze.mockRejectedValueOnce(
      new Error('Test error')
    );

    // Expect the runCycle method to throw an error
    await expect(bootstrap.runCycle()).rejects.toThrow('Test error');
  });
});

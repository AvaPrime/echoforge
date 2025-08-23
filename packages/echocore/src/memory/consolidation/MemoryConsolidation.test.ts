/**
 * Memory Consolidation Tests
 *
 * Tests for the memory consolidation system, including clustering and summarization.
 */

import { MemoryManager } from '../MemoryManager';
import { InMemoryProvider } from '../InMemoryProvider';
import { MemoryEntry } from '../MemoryContract';
import { MemoryConsolidator } from './MemoryConsolidator';
import {
  MemoryCluster,
  MemoryClusteringStrategy,
  MemorySummarizationStrategy,
} from './MemoryConsolidationContract';

// Mock clustering strategy
class MockClusteringStrategy implements MemoryClusteringStrategy {
  async identifyClusters(entries: MemoryEntry[]): Promise<MemoryCluster[]> {
    // Simple mock implementation that creates a single cluster with all entries
    return [
      {
        id: 'test-cluster-1',
        entries,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        consolidated: false,
        coherenceScore: 0.8,
      },
    ];
  }
}

// Mock summarization strategy
class MockSummarizationStrategy implements MemorySummarizationStrategy {
  async summarizeCluster(cluster: MemoryCluster): Promise<MemoryEntry> {
    // Simple mock implementation that creates a summary memory
    return {
      id: 'summary-1',
      type: 'consolidated',
      timestamp: Date.now(),
      content: `Summary of ${cluster.entries.length} entries`,
      tags: ['consolidated', 'test'],
      scope: 'agent',
      agentId: 'test-agent',
      visibility: 'private',
    };
  }
}

describe('Memory Consolidation System', () => {
  let memoryManager: MemoryManager;
  let memoryProvider: InMemoryProvider;
  let consolidator: MemoryConsolidator;
  let clusteringStrategy: MockClusteringStrategy;
  let summarizationStrategy: MockSummarizationStrategy;

  beforeEach(() => {
    // Set up memory system
    memoryProvider = new InMemoryProvider();
    memoryManager = new MemoryManager([memoryProvider]);

    // Set up consolidation system
    clusteringStrategy = new MockClusteringStrategy();
    summarizationStrategy = new MockSummarizationStrategy();
    consolidator = new MemoryConsolidator(
      memoryManager,
      clusteringStrategy,
      summarizationStrategy
    );
  });

  test('should consolidate memories', async () => {
    // Store test memories
    const testMemories = [
      {
        id: 'test-1',
        type: 'note',
        timestamp: Date.now(),
        content: 'Test note 1',
        tags: ['test', 'note'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
      {
        id: 'test-2',
        type: 'note',
        timestamp: Date.now(),
        content: 'Test note 2',
        tags: ['test', 'note'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
      {
        id: 'test-3',
        type: 'note',
        timestamp: Date.now(),
        content: 'Test note 3',
        tags: ['test', 'note'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
    ] as MemoryEntry[];

    for (const memory of testMemories) {
      await memoryManager.store(memory);
    }

    // Spy on the strategies
    const identifyClustersSpy = jest.spyOn(
      clusteringStrategy,
      'identifyClusters'
    );
    const summarizeClusterSpy = jest.spyOn(
      summarizationStrategy,
      'summarizeCluster'
    );

    // Run consolidation
    const results = await consolidator.consolidate({
      type: 'note',
      agentId: 'test-agent',
    });

    // Verify results
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(results[0].consolidatedMemory).toBeDefined();
    expect(results[0].consolidatedMemory?.type).toBe('consolidated');
    expect(results[0].consolidatedMemory?.content).toContain(
      'Summary of 3 entries'
    );

    // Verify strategy calls
    expect(identifyClustersSpy).toHaveBeenCalledTimes(1);
    expect(summarizeClusterSpy).toHaveBeenCalledTimes(1);

    // Verify the consolidated memory was stored
    const allMemories = await memoryManager.query({});
    expect(allMemories).toHaveLength(4); // 3 original + 1 consolidated

    const consolidatedMemories = await memoryManager.query({
      type: 'consolidated',
    });
    expect(consolidatedMemories).toHaveLength(1);
  });

  test('should apply consolidation options', async () => {
    // Store test memories with different timestamps
    const now = Date.now();
    const testMemories = [
      {
        id: 'old-1',
        type: 'note',
        timestamp: now - 10 * 24 * 60 * 60 * 1000, // 10 days old
        content: 'Old note 1',
        tags: ['test', 'old'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
      {
        id: 'recent-1',
        type: 'note',
        timestamp: now - 1 * 24 * 60 * 60 * 1000, // 1 day old
        content: 'Recent note 1',
        tags: ['test', 'recent'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
      {
        id: 'recent-2',
        type: 'note',
        timestamp: now - 2 * 24 * 60 * 60 * 1000, // 2 days old
        content: 'Recent note 2',
        tags: ['test', 'recent'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
    ] as MemoryEntry[];

    for (const memory of testMemories) {
      await memoryManager.store(memory);
    }

    // Spy on the clustering strategy
    const identifyClustersSpy = jest.spyOn(
      clusteringStrategy,
      'identifyClusters'
    );

    // Run consolidation with maxMemoryAge option
    const results = await consolidator.consolidate(
      {
        type: 'note',
        agentId: 'test-agent',
      },
      {
        maxMemoryAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      }
    );

    // Verify that only recent memories were considered
    expect(identifyClustersSpy).toHaveBeenCalledTimes(1);
    const entriesPassedToClustering = identifyClustersSpy.mock.calls[0][0];
    expect(entriesPassedToClustering).toHaveLength(2); // Only the 2 recent entries
    expect(entriesPassedToClustering.map((e) => e.id)).toContain('recent-1');
    expect(entriesPassedToClustering.map((e) => e.id)).toContain('recent-2');
    expect(entriesPassedToClustering.map((e) => e.id)).not.toContain('old-1');
  });

  test('should handle errors during consolidation', async () => {
    // Store test memories
    const testMemory = {
      id: 'test-1',
      type: 'note',
      timestamp: Date.now(),
      content: 'Test note',
      scope: 'agent',
      agentId: 'test-agent',
      visibility: 'private',
    } as MemoryEntry;

    await memoryManager.store(testMemory);

    // Make the summarization strategy throw an error
    summarizationStrategy.summarizeCluster = jest
      .fn()
      .mockRejectedValue(new Error('Test error'));

    // Run consolidation
    const results = await consolidator.consolidate({
      type: 'note',
    });

    // Verify results
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('Test error');
    expect(results[0].consolidatedMemory).toBeUndefined();
  });

  test('should skip already consolidated clusters', async () => {
    // Create a mock cluster that is already consolidated
    clusteringStrategy.identifyClusters = jest.fn().mockResolvedValue([
      {
        id: 'already-consolidated',
        entries: [{ id: 'test-1' } as MemoryEntry],
        createdAt: Date.now(),
        updatedAt: Date.now(),
        consolidated: true, // Already consolidated
        coherenceScore: 0.5,
      },
    ]);

    // Run consolidation
    const results = await consolidator.consolidate({
      type: 'note',
    });

    // Verify results
    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(false);
    expect(results[0].error).toContain('already consolidated');

    // Verify summarization was not called
    expect(summarizationStrategy.summarizeCluster).not.toHaveBeenCalled();
  });
});

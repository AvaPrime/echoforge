/**
 * Semantic Memory Tests
 *
 * Tests for the semantic memory system, including VectorStoreProvider and embedding providers.
 */

import { VectorStoreProvider } from './providers/VectorStoreProvider';
import { OpenAIEmbeddingProvider, LocalEmbeddingProvider } from './embeddings';
import { MemoryEntry, MemoryManager } from '.';
import { InMemoryProvider } from './InMemoryProvider';

// Mock embedding provider for testing
class MockEmbeddingProvider extends LocalEmbeddingProvider {
  // Override with deterministic embeddings for testing
  async embedText(text: string): Promise<number[]> {
    // Simple deterministic embedding based on text length and first character
    const baseVector = Array(128).fill(0.1);

    // Modify a few dimensions based on text content for simple similarity testing
    if (text.includes('preference')) baseVector[0] = 0.9;
    if (text.includes('communication')) baseVector[1] = 0.9;
    if (text.includes('background')) baseVector[2] = 0.9;
    if (text.includes('profession')) baseVector[3] = 0.9;
    if (text.includes('deadline')) baseVector[4] = 0.9;
    if (text.includes('schedule')) baseVector[5] = 0.9;
    if (text.includes('interest')) baseVector[6] = 0.9;
    if (text.includes('topic')) baseVector[7] = 0.9;

    return baseVector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.all(texts.map((text) => this.embedText(text)));
  }

  calculateSimilarity(embedding1: number[], embedding2: number[]): number {
    // Simple dot product for testing
    return embedding1.reduce((sum, val, i) => sum + val * embedding2[i], 0);
  }
}

describe('Semantic Memory System', () => {
  let vectorProvider: VectorStoreProvider;
  let mockEmbeddingProvider: MockEmbeddingProvider;
  let memoryManager: MemoryManager;

  beforeEach(() => {
    mockEmbeddingProvider = new MockEmbeddingProvider();
    vectorProvider = new VectorStoreProvider({
      embeddingProvider: mockEmbeddingProvider,
    });

    // Create memory manager with vector provider
    const inMemoryProvider = new InMemoryProvider();
    memoryManager = new MemoryManager([inMemoryProvider, vectorProvider]);
  });

  test('should store and retrieve semantic memories', async () => {
    // Create test memory entries
    const memory1: MemoryEntry = {
      id: 'test-1',
      type: 'semantic',
      timestamp: Date.now(),
      content: 'The user prefers concise responses with bullet points',
      tags: ['preference', 'communication-style'],
      scope: 'agent',
      agentId: 'test-agent',
      visibility: 'private',
    };

    const memory2: MemoryEntry = {
      id: 'test-2',
      type: 'semantic',
      timestamp: Date.now(),
      content:
        'The user is a software developer working on a machine learning project',
      tags: ['background', 'profession'],
      scope: 'agent',
      agentId: 'test-agent',
      visibility: 'private',
    };

    // Store memories
    await vectorProvider.store(memory1);
    await vectorProvider.store(memory2);

    // Query by similarity
    const results = await vectorProvider.semanticSearch({
      type: 'semantic',
      similarityTo: 'How does the user like to communicate?',
      maxResults: 1,
    });

    // Verify results
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('test-1');
    expect(results[0].similarity).toBeGreaterThan(0.5);
  });

  test('should perform semantic search through memory manager', async () => {
    // Create test memory entries
    const memories = [
      {
        id: 'fact-1',
        type: 'semantic',
        timestamp: Date.now(),
        content: 'The user prefers concise responses with bullet points',
        tags: ['preference', 'communication-style'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
      {
        id: 'fact-2',
        type: 'semantic',
        timestamp: Date.now(),
        content:
          'The user is a software developer working on a machine learning project',
        tags: ['background', 'profession'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
      {
        id: 'fact-3',
        type: 'semantic',
        timestamp: Date.now(),
        content:
          'The user mentioned they have a deadline next Friday for their project',
        tags: ['schedule', 'deadline'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
    ] as MemoryEntry[];

    // Store all memories
    for (const memory of memories) {
      await memoryManager.store(memory);
    }

    // Perform semantic search
    const results = await memoryManager.query({
      type: 'semantic',
      similarityTo: 'What is the user working on professionally?',
      maxResults: 2,
    });

    // Verify results
    expect(results.length).toBe(2);
    expect(results.some((r) => r.id === 'fact-2')).toBe(true);
  });

  test('should handle hybrid queries with tags and semantic search', async () => {
    // Create test memory entries
    const memories = [
      {
        id: 'fact-1',
        type: 'semantic',
        timestamp: Date.now(),
        content: 'The user prefers concise responses with bullet points',
        tags: ['preference', 'communication-style'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
      {
        id: 'fact-2',
        type: 'semantic',
        timestamp: Date.now(),
        content:
          'The user is a software developer working on a machine learning project',
        tags: ['background', 'profession'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
      {
        id: 'fact-3',
        type: 'semantic',
        timestamp: Date.now(),
        content:
          'The user mentioned they have a deadline next Friday for their project',
        tags: ['schedule', 'deadline'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
    ] as MemoryEntry[];

    // Store all memories
    for (const memory of memories) {
      await memoryManager.store(memory);
    }

    // Perform hybrid search (semantic + tag filtering)
    const results = await memoryManager.query({
      type: 'semantic',
      similarityTo: "What are the user's time constraints?",
      tags: ['schedule'],
      maxResults: 2,
    });

    // Verify results
    expect(results.length).toBe(1);
    expect(results[0].id).toBe('fact-3');
  });
});

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MemoryEntry, MemoryQuery } from './MemoryContract';
import { InMemoryProvider } from './InMemoryProvider';
import { MemoryManager } from './MemoryManager';

describe('Memory System', () => {
  let memoryProvider: InMemoryProvider;
  let memoryManager: MemoryManager;

  beforeEach(() => {
    memoryProvider = new InMemoryProvider();
    memoryManager = new MemoryManager([memoryProvider]);
  });

  afterEach(() => {
    // Clean up any resources
  });

  describe('InMemoryProvider', () => {
    it('should store and retrieve a memory entry', async () => {
      const entry: MemoryEntry = {
        id: 'test-1',
        type: 'short-term',
        timestamp: Date.now(),
        content: { message: 'Test memory' },
        tags: ['test'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      };

      await memoryProvider.store(entry);

      const query: MemoryQuery = {
        type: 'short-term',
        tags: ['test'],
      };

      const results = await memoryProvider.query(query);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('test-1');
      expect(results[0].content).toEqual({ message: 'Test memory' });
    });

    it('should delete a memory entry', async () => {
      const entry: MemoryEntry = {
        id: 'test-2',
        type: 'short-term',
        timestamp: Date.now(),
        content: { message: 'Test memory to delete' },
        tags: ['test', 'delete'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      };

      await memoryProvider.store(entry);
      await memoryProvider.delete('test-2');

      const query: MemoryQuery = {
        id: 'test-2',
      };

      const results = await memoryProvider.query(query);

      expect(results).toHaveLength(0);
    });

    it('should respect time range in queries', async () => {
      const now = Date.now();
      const pastEntry: MemoryEntry = {
        id: 'past',
        type: 'short-term',
        timestamp: now - 10000, // 10 seconds ago
        content: { message: 'Past memory' },
        tags: ['test', 'time'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      };

      const recentEntry: MemoryEntry = {
        id: 'recent',
        type: 'short-term',
        timestamp: now,
        content: { message: 'Recent memory' },
        tags: ['test', 'time'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      };

      await memoryProvider.store(pastEntry);
      await memoryProvider.store(recentEntry);

      const query: MemoryQuery = {
        tags: ['time'],
        timeRange: { from: now - 5000, to: now + 1000 }, // Last 5 seconds
      };

      const results = await memoryProvider.query(query);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('recent');
    });
  });

  describe('MemoryManager', () => {
    it('should route queries to the appropriate provider', async () => {
      const entry: MemoryEntry = {
        id: 'manager-test',
        type: 'short-term',
        timestamp: Date.now(),
        content: { message: 'Manager test' },
        tags: ['manager'],
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      };

      await memoryManager.store(entry);

      const query: MemoryQuery = {
        tags: ['manager'],
      };

      const results = await memoryManager.query(query);

      expect(results).toHaveLength(1);
      expect(results[0].id).toBe('manager-test');
    });
  });
});

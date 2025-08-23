/**
 * Reflexive Memory Tests
 *
 * Tests for the reflexive memory system, including hooks and event triggering.
 */

import { ReflexiveMemoryManager } from './ReflexiveMemoryManager';
import {
  MemoryEventContextUnion,
  MemoryEventType,
} from './ReflexiveMemoryContract';
import { MemoryEntry, MemoryQuery } from '../MemoryContract';

describe('Reflexive Memory System', () => {
  let reflexiveManager: ReflexiveMemoryManager;

  beforeEach(() => {
    reflexiveManager = new ReflexiveMemoryManager();
  });

  test('should register and trigger hooks', async () => {
    // Create a mock hook function
    const mockHook = jest.fn();

    // Register the hook
    reflexiveManager.registerHook(
      {
        id: 'test-hook',
        events: ['onStore', 'onQuery'],
        priority: 10,
      },
      mockHook
    );

    // Create a test event
    const storeEvent: MemoryEventContextUnion = {
      eventType: 'onStore',
      timestamp: Date.now(),
      agentId: 'test-agent',
      entry: {
        id: 'test-1',
        type: 'short-term',
        timestamp: Date.now(),
        content: 'Test content',
        scope: 'agent',
        agentId: 'test-agent',
        visibility: 'private',
      },
    };

    // Trigger the event
    await reflexiveManager.triggerEvent(storeEvent);

    // Verify the hook was called
    expect(mockHook).toHaveBeenCalledTimes(1);
    expect(mockHook).toHaveBeenCalledWith(storeEvent);
  });

  test('should respect hook priority order', async () => {
    // Create an array to track execution order
    const executionOrder: string[] = [];

    // Register hooks with different priorities
    reflexiveManager.registerHook(
      {
        id: 'low-priority',
        events: ['onStore'],
        priority: 1,
      },
      async () => {
        executionOrder.push('low');
      }
    );

    reflexiveManager.registerHook(
      {
        id: 'medium-priority',
        events: ['onStore'],
        priority: 5,
      },
      async () => {
        executionOrder.push('medium');
      }
    );

    reflexiveManager.registerHook(
      {
        id: 'high-priority',
        events: ['onStore'],
        priority: 10,
      },
      async () => {
        executionOrder.push('high');
      }
    );

    // Trigger an event
    await reflexiveManager.triggerEvent({
      eventType: 'onStore',
      timestamp: Date.now(),
      entry: {} as MemoryEntry,
    });

    // Verify execution order (highest priority first)
    expect(executionOrder).toEqual(['high', 'medium', 'low']);
  });

  test('should filter hooks by event type', async () => {
    // Create mock hooks
    const storeHook = jest.fn();
    const queryHook = jest.fn();
    const deleteHook = jest.fn();

    // Register hooks for different event types
    reflexiveManager.registerHook(
      { id: 'store-hook', events: ['onStore'] },
      storeHook
    );

    reflexiveManager.registerHook(
      { id: 'query-hook', events: ['onQuery'] },
      queryHook
    );

    reflexiveManager.registerHook(
      { id: 'delete-hook', events: ['onDelete'] },
      deleteHook
    );

    // Trigger a store event
    await reflexiveManager.triggerEvent({
      eventType: 'onStore',
      timestamp: Date.now(),
      entry: {} as MemoryEntry,
    });

    // Verify only the store hook was called
    expect(storeHook).toHaveBeenCalledTimes(1);
    expect(queryHook).not.toHaveBeenCalled();
    expect(deleteHook).not.toHaveBeenCalled();
  });

  test('should filter hooks by memory type', async () => {
    // Create mock hooks
    const shortTermHook = jest.fn();
    const longTermHook = jest.fn();

    // Register hooks for different memory types
    reflexiveManager.registerHook(
      {
        id: 'short-term-hook',
        events: ['onStore'],
        memoryTypes: ['short-term'],
      },
      shortTermHook
    );

    reflexiveManager.registerHook(
      {
        id: 'long-term-hook',
        events: ['onStore'],
        memoryTypes: ['long-term'],
      },
      longTermHook
    );

    // Trigger a store event for short-term memory
    await reflexiveManager.triggerEvent({
      eventType: 'onStore',
      timestamp: Date.now(),
      entry: {
        id: 'test-1',
        type: 'short-term',
        timestamp: Date.now(),
        content: 'Test content',
        scope: 'agent',
        visibility: 'private',
      },
    });

    // Verify only the short-term hook was called
    expect(shortTermHook).toHaveBeenCalledTimes(1);
    expect(longTermHook).not.toHaveBeenCalled();
  });

  test('should unregister hooks', async () => {
    // Create a mock hook
    const mockHook = jest.fn();

    // Register the hook
    reflexiveManager.registerHook(
      { id: 'test-hook', events: ['onStore'] },
      mockHook
    );

    // Unregister the hook
    const result = reflexiveManager.unregisterHook('test-hook');
    expect(result).toBe(true);

    // Trigger an event
    await reflexiveManager.triggerEvent({
      eventType: 'onStore',
      timestamp: Date.now(),
      entry: {} as MemoryEntry,
    });

    // Verify the hook was not called
    expect(mockHook).not.toHaveBeenCalled();
  });

  test('should handle errors in hooks gracefully', async () => {
    // Create hooks that throw errors
    const errorHook = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });

    const successHook = jest.fn();

    // Register the hooks
    reflexiveManager.registerHook(
      { id: 'error-hook', events: ['onStore'] },
      errorHook
    );

    reflexiveManager.registerHook(
      { id: 'success-hook', events: ['onStore'] },
      successHook
    );

    // Trigger an event (should not throw)
    await expect(
      reflexiveManager.triggerEvent({
        eventType: 'onStore',
        timestamp: Date.now(),
        entry: {} as MemoryEntry,
      })
    ).resolves.not.toThrow();

    // Verify both hooks were called
    expect(errorHook).toHaveBeenCalledTimes(1);
    expect(successHook).toHaveBeenCalledTimes(1);
  });
});

/**
 * Reflexive Memory Manager
 *
 * Manages reflexive hooks for memory events, allowing agents to observe
 * and respond to memory operations.
 */

import { createLogger } from '@echoforge/forgekit';
import {
  MemoryEventType,
  MemoryEventContextUnion,
  ReflexiveHook,
  ReflexiveHookOptions,
  ReflexiveMemoryManager as IReflexiveMemoryManager,
} from './ReflexiveMemoryContract';
import { MemoryEntry } from '../MemoryContract';

const logger = createLogger('reflexive-memory');

/**
 * Internal representation of a registered hook
 */
interface RegisteredHook {
  id: string;
  events: MemoryEventType[];
  memoryTypes?: string[];
  agentId?: string;
  priority: number;
  hook: ReflexiveHook;
}

/**
 * Implementation of the ReflexiveMemoryManager
 */
export class ReflexiveMemoryManager implements IReflexiveMemoryManager {
  private hooks: RegisteredHook[] = [];

  /**
   * Register a reflexive hook
   */
  registerHook(options: ReflexiveHookOptions, hook: ReflexiveHook): void {
    // Check if hook with this ID already exists
    const existingIndex = this.hooks.findIndex((h) => h.id === options.id);
    if (existingIndex >= 0) {
      // Replace existing hook
      this.hooks[existingIndex] = {
        id: options.id,
        events: options.events,
        memoryTypes: options.memoryTypes,
        agentId: options.agentId,
        priority: options.priority ?? 0,
        hook,
      };
      logger.debug(`Replaced existing hook: ${options.id}`);
    } else {
      // Add new hook
      this.hooks.push({
        id: options.id,
        events: options.events,
        memoryTypes: options.memoryTypes,
        agentId: options.agentId,
        priority: options.priority ?? 0,
        hook,
      });
      logger.debug(`Registered new hook: ${options.id}`);
    }

    // Sort hooks by priority (higher numbers first)
    this.hooks.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Unregister a reflexive hook by ID
   */
  unregisterHook(id: string): boolean {
    const initialLength = this.hooks.length;
    this.hooks = this.hooks.filter((h) => h.id !== id);
    const removed = this.hooks.length < initialLength;

    if (removed) {
      logger.debug(`Unregistered hook: ${id}`);
    } else {
      logger.debug(`Hook not found for unregistering: ${id}`);
    }

    return removed;
  }

  /**
   * Trigger a memory event
   */
  async triggerEvent(context: MemoryEventContextUnion): Promise<void> {
    const { eventType } = context;
    const matchingHooks = this.hooks.filter((hook) => {
      // Check if hook is registered for this event type
      if (!hook.events.includes(eventType)) {
        return false;
      }

      // Check memory type filter if applicable
      if (hook.memoryTypes && hook.memoryTypes.length > 0) {
        // For store events, check the entry type
        if (eventType === 'onStore' && 'entry' in context) {
          const entry = context.entry as MemoryEntry;
          if (!hook.memoryTypes.includes(entry.type)) {
            return false;
          }
        }
        // For query events, check the query type
        else if (
          eventType === 'onQuery' &&
          'query' in context &&
          context.query.type
        ) {
          if (!hook.memoryTypes.includes(context.query.type)) {
            return false;
          }
        }
      }

      // Check agent ID filter if applicable
      if (hook.agentId) {
        // For store events, check the entry agentId
        if (eventType === 'onStore' && 'entry' in context) {
          const entry = context.entry as MemoryEntry;
          if (entry.agentId !== hook.agentId) {
            return false;
          }
        }
        // For query events, check the query agentId
        else if (
          eventType === 'onQuery' &&
          'query' in context &&
          context.query.agentId
        ) {
          if (context.query.agentId !== hook.agentId) {
            return false;
          }
        }
        // For other events, check the context agentId
        else if (context.agentId !== hook.agentId) {
          return false;
        }
      }

      return true;
    });

    logger.debug(
      `Triggering ${matchingHooks.length} hooks for event: ${eventType}`
    );

    // Execute all matching hooks
    const hookPromises = matchingHooks.map(async ({ id, hook }) => {
      try {
        await Promise.resolve(hook(context));
      } catch (error) {
        logger.error(`Error in reflexive hook ${id}:`, error);
      }
    });

    await Promise.all(hookPromises);
  }

  /**
   * Get all registered hooks (for debugging)
   */
  getRegisteredHooks(): {
    id: string;
    events: MemoryEventType[];
    priority: number;
  }[] {
    return this.hooks.map(({ id, events, priority }) => ({
      id,
      events,
      priority,
    }));
  }
}

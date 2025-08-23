/**
 * Reflexive Memory Contracts
 *
 * Defines the core interfaces for the EchoForge reflexive memory system,
 * including memory events, hooks, and observer patterns.
 */

import { MemoryEntry, MemoryQuery } from '../MemoryContract';

/**
 * Types of memory events that can trigger reflexive hooks
 */
export type MemoryEventType =
  | 'onStore'
  | 'onQuery'
  | 'onDelete'
  | 'onConsolidate';

/**
 * Context for memory events
 */
export interface MemoryEventContext {
  /**
   * The type of memory event
   */
  eventType: MemoryEventType;

  /**
   * Timestamp when the event occurred
   */
  timestamp: number;

  /**
   * The agent ID associated with the event, if any
   */
  agentId?: string;

  /**
   * Additional context specific to the event type
   */
  [key: string]: any;
}

/**
 * Context for store events
 */
export interface StoreEventContext extends MemoryEventContext {
  eventType: 'onStore';
  entry: MemoryEntry;
}

/**
 * Context for query events
 */
export interface QueryEventContext extends MemoryEventContext {
  eventType: 'onQuery';
  query: MemoryQuery;
  results: MemoryEntry[];
}

/**
 * Context for delete events
 */
export interface DeleteEventContext extends MemoryEventContext {
  eventType: 'onDelete';
  entryId: string;
}

/**
 * Context for consolidate events
 */
export interface ConsolidateEventContext extends MemoryEventContext {
  eventType: 'onConsolidate';
  affectedEntries?: MemoryEntry[];
}

/**
 * Union type for all memory event contexts
 */
export type MemoryEventContextUnion =
  | StoreEventContext
  | QueryEventContext
  | DeleteEventContext
  | ConsolidateEventContext;

/**
 * Reflexive hook function signature
 */
export type ReflexiveHook = (
  context: MemoryEventContextUnion
) => Promise<void> | void;

/**
 * Options for registering a reflexive hook
 */
export interface ReflexiveHookOptions {
  /**
   * ID for the hook, used for removing it later
   */
  id: string;

  /**
   * Event types to listen for
   */
  events: MemoryEventType[];

  /**
   * Filter by memory types
   */
  memoryTypes?: string[];

  /**
   * Filter by agent ID
   */
  agentId?: string;

  /**
   * Priority of the hook (higher numbers run first)
   */
  priority?: number;
}

/**
 * Interface for reflexive memory management
 */
export interface ReflexiveMemoryManager {
  /**
   * Register a reflexive hook
   */
  registerHook(options: ReflexiveHookOptions, hook: ReflexiveHook): void;

  /**
   * Unregister a reflexive hook by ID
   */
  unregisterHook(id: string): boolean;

  /**
   * Trigger a memory event
   */
  triggerEvent(context: MemoryEventContextUnion): Promise<void>;
}

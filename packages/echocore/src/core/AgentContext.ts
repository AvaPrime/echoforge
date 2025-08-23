/**
 * AgentContext for the EchoForge ecosystem
 * Provides a runtime context for agents with access to core utilities
 */

import { createLogger, EventEmitter } from '@echoforge/forgekit';
import { config, Config } from '@org/config';
import { MemoryManager } from '../memory/MemoryManager';

/**
 * Context object passed to agents during initialization
 */
export interface AgentContext {
  /**
   * Logger instance for the agent
   */
  logger: ReturnType<typeof createLogger>;

  /**
   * Configuration for the agent
   */
  config: Config;

  /**
   * Event emitter for agent events
   */
  events: EventEmitter;

  /**
   * Memory manager for agent memory operations
   */
  memory?: MemoryManager;

  /**
   * Additional context properties
   */
  [key: string]: any;
}

/**
 * Build a new agent context with default values
 * @param options Optional configuration options
 * @returns A new agent context
 */
export const buildAgentContext = (
  options: {
    loggerName?: string;
    memory?: MemoryManager;
  } = {}
): AgentContext => {
  const { loggerName = 'agent', memory } = options;

  // Use centralized config from @org/config
  return {
    logger: createLogger(loggerName),
    config,
    events: new EventEmitter(),
    memory,
  };
};

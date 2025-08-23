/**
 * Agent interface for the EchoForge ecosystem
 * Defines the contract for all agent implementations
 */

import { EventEmitter } from '@echoforge/forgekit';
import { AgentContext } from './AgentContext';

export interface AgentMetadata {
  id: string;
  name: string;
  description: string;
  version: string;
  capabilities?: string[];
  [key: string]: any;
}

export interface AgentTask {
  id: string;
  type: string;
  data: Record<string, any>;
  priority?: number;
  [key: string]: any;
}

export interface AgentResult {
  taskId: string;
  success: boolean;
  data?: Record<string, any>;
  error?: Error;
  [key: string]: any;
}

/**
 * Base interface for all agents in the EchoForge ecosystem
 */
export interface Agent {
  /**
   * Unique identifier for the agent
   */
  readonly id: string;

  /**
   * Metadata describing the agent
   */
  readonly metadata: AgentMetadata;

  /**
   * Event emitter for agent events
   */
  readonly events: EventEmitter;

  /**
   * Initialize the agent with a context
   */
  initialize(context: AgentContext): Promise<void>;

  /**
   * Start the agent
   */
  start(): Promise<void>;

  /**
   * Stop the agent
   */
  stop(): Promise<void>;

  /**
   * Execute a task
   */
  executeTask(task: AgentTask): Promise<AgentResult>;

  /**
   * Get the current status of the agent
   */
  getStatus(): Record<string, any>;
}

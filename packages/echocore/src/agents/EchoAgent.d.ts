/**
 * EchoAgent - A simple agent implementation for testing the agent lifecycle
 */
import {
  Agent,
  AgentContext,
  AgentMetadata,
  AgentTask,
  AgentResult,
} from '../core';
import { EventEmitter } from '@echoforge/forgekit';
/**
 * A basic ping/log agent to test the full lifecycle
 */
export declare class EchoAgent implements Agent {
  readonly id: string;
  readonly metadata: AgentMetadata;
  readonly events: EventEmitter;
  private isRunning;
  private context;
  /**
   * Create a new EchoAgent
   * @param id Optional agent ID (defaults to 'echo')
   */
  constructor(id?: string);
  /**
   * Initialize the agent with the provided context
   * @param context The agent context
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
   * Execute a task with the agent
   * @param task The task to execute
   */
  executeTask(task: AgentTask): Promise<AgentResult>;
  /**
   * Get the current status of the agent
   */
  getStatus(): Record<string, any>;
  /**
   * Handle ping events
   */
  private handlePing;
}
//# sourceMappingURL=EchoAgent.d.ts.map

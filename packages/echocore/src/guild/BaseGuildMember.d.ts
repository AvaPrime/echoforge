/**
 * Base Guild Member Implementation
 *
 * Provides a foundation for implementing GuildMembers with common functionality
 * for handling tasks, events, and lifecycle management.
 */
import { EventEmitter } from '@echoforge/forgekit';
import { Agent } from '../core/Agent';
import { AgentContext } from '../core/AgentContext';
import {
  GuildMember,
  GuildTask,
  GuildResult,
  GuildEvent,
} from './GuildContract';
/**
 * Base implementation of the GuildMember interface that can be extended
 * by specific agent implementations
 */
export declare abstract class BaseGuildMember implements GuildMember {
  readonly id: string;
  readonly role: string;
  readonly capabilities: string[];
  readonly events: EventEmitter;
  readonly metadata: {
    name: string;
    description: string;
    version: string;
  };
  protected context: AgentContext | null;
  protected isInitialized: boolean;
  protected isRunning: boolean;
  /**
   * Create a new BaseGuildMember
   *
   * @param id Unique identifier for this member
   * @param role The role this member fulfills in the guild
   * @param capabilities Array of capabilities this member provides
   * @param metadata Additional metadata about this member
   */
  constructor(
    id: string,
    role: string,
    capabilities: string[],
    metadata: {
      name: string;
      description: string;
      version: string;
    }
  );
  /**
   * Initialize the member with a context
   */
  initialize(context: AgentContext): Promise<void>;
  /**
   * Start the member
   */
  start(): Promise<void>;
  /**
   * Stop the member
   */
  stop(): Promise<void>;
  /**
   * Get the current status of the member
   */
  getStatus(): Record<string, any>;
  /**
   * Handle a task assigned by the Guild
   */
  handleGuildTask(task: GuildTask): Promise<GuildResult>;
  /**
   * Handle an event from the Guild
   */
  onGuildEvent(event: GuildEvent): void;
  /**
   * Hook for subclasses to implement initialization logic
   */
  protected abstract onInitialize(): Promise<void>;
  /**
   * Hook for subclasses to implement start logic
   */
  protected abstract onStart(): Promise<void>;
  /**
   * Hook for subclasses to implement stop logic
   */
  protected abstract onStop(): Promise<void>;
  /**
   * Execute a task - to be implemented by subclasses
   */
  protected abstract executeTask(task: GuildTask): Promise<GuildResult>;
  /**
   * Process an event - to be implemented by subclasses
   */
  protected abstract processEvent(event: GuildEvent): void;
}
/**
 * Adapter class that wraps an Agent as a GuildMember
 */
export declare class AgentGuildMember extends BaseGuildMember {
  private agent;
  /**
   * Create a new AgentGuildMember that wraps an existing Agent
   *
   * @param agent The Agent to wrap
   * @param role The role this member fulfills in the guild
   * @param capabilities Array of capabilities this member provides
   */
  constructor(
    agent: Agent,
    role: string,
    capabilities: string[],
    metadata?: {
      name?: string;
      description?: string;
      version?: string;
    }
  );
  /**
   * Initialize the agent
   */
  protected onInitialize(): Promise<void>;
  /**
   * Start the agent
   */
  protected onStart(): Promise<void>;
  /**
   * Stop the agent
   */
  protected onStop(): Promise<void>;
  /**
   * Execute a task by delegating to the agent
   */
  protected executeTask(task: GuildTask): Promise<GuildResult>;
  /**
   * Process an event by forwarding to the agent
   */
  protected processEvent(event: GuildEvent): void;
}
//# sourceMappingURL=BaseGuildMember.d.ts.map

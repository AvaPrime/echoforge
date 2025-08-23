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
export abstract class BaseGuildMember implements GuildMember {
  public readonly id: string;
  public readonly role: string;
  public readonly capabilities: string[];
  public readonly events: EventEmitter;
  public readonly metadata: {
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
    metadata: { name: string; description: string; version: string }
  ) {
    this.id = id;
    this.role = role;
    this.capabilities = [...capabilities];
    this.metadata = { ...metadata };
    this.events = new EventEmitter();
    this.context = null;
    this.isInitialized = false;
    this.isRunning = false;
  }

  /**
   * Initialize the member with a context
   */
  async initialize(context: AgentContext): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.context = context;
    this.context.logger.info(
      `Initializing guild member '${this.metadata.name}' (${this.id})`
    );

    await this.onInitialize();

    this.isInitialized = true;
    this.events.emit('initialized', { memberId: this.id });
    this.context.logger.info(
      `Guild member '${this.metadata.name}' initialized`
    );
  }

  /**
   * Start the member
   */
  async start(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('Member must be initialized before starting');
    }

    if (this.isRunning) {
      return;
    }

    this.context!.logger.info(`Starting guild member '${this.metadata.name}'`);

    await this.onStart();

    this.isRunning = true;
    this.events.emit('started', { memberId: this.id });
    this.context!.logger.info(`Guild member '${this.metadata.name}' started`);
  }

  /**
   * Stop the member
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.context!.logger.info(`Stopping guild member '${this.metadata.name}'`);

    await this.onStop();

    this.isRunning = false;
    this.events.emit('stopped', { memberId: this.id });
    this.context!.logger.info(`Guild member '${this.metadata.name}' stopped`);
  }

  /**
   * Get the current status of the member
   */
  getStatus(): Record<string, any> {
    return {
      id: this.id,
      role: this.role,
      capabilities: this.capabilities,
      initialized: this.isInitialized,
      running: this.isRunning,
      metadata: this.metadata,
    };
  }

  /**
   * Handle a task assigned by the Guild
   */
  async handleGuildTask(task: GuildTask): Promise<GuildResult> {
    if (!this.isRunning) {
      throw new Error('Member must be running to handle tasks');
    }

    this.context!.logger.info(
      `Member '${this.metadata.name}' handling task ${task.id} of type ${task.type}`
    );

    try {
      // Emit task received event
      this.events.emit('task:received', { taskId: task.id, type: task.type });

      // Execute the task
      const result = await this.executeTask(task);

      // Emit task completed event
      this.events.emit('task:completed', {
        taskId: task.id,
        type: task.type,
        success: result.success,
      });

      return {
        taskId: task.id,
        success: result.success,
        data: result.data,
        error: result.error,
        completedAt: new Date(),
      };
    } catch (error) {
      // Emit task failed event
      this.events.emit('task:failed', {
        taskId: task.id,
        type: task.type,
        error: (error as Error).message,
      });

      this.context!.logger.error(`Error executing task ${task.id}`, {
        metadata: { error: (error as Error).message },
      });

      return {
        taskId: task.id,
        success: false,
        data: {},
        error: error as Error,
        completedAt: new Date(),
      };
    }
  }

  /**
   * Handle an event from the Guild
   */
  onGuildEvent(event: GuildEvent): void {
    if (!this.isRunning) {
      // Silently ignore events when not running
      return;
    }

    this.context!.logger.debug(
      `Member '${this.metadata.name}' received event ${event.type} from ${event.source}`
    );

    // Skip events that originated from this member to avoid loops
    if (event.source === this.id) {
      return;
    }

    // Process the event
    this.processEvent(event);
  }

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
export class AgentGuildMember extends BaseGuildMember {
  private agent: Agent;

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
    metadata?: { name?: string; description?: string; version?: string }
  ) {
    super(agent.id, role, capabilities, {
      name: metadata?.name || agent.id,
      description: metadata?.description || 'Agent-based Guild Member',
      version: metadata?.version || '1.0.0',
    });

    this.agent = agent;

    // Forward agent events to member events
    this.agent.events.on('*', (eventType: string, data: any) => {
      this.events.emit(`agent:${eventType}`, data);
    });
  }

  /**
   * Initialize the agent
   */
  protected async onInitialize(): Promise<void> {
    if (!this.agent.isInitialized()) {
      await this.agent.initialize(this.context!);
    }
  }

  /**
   * Start the agent
   */
  protected async onStart(): Promise<void> {
    await this.agent.start();
  }

  /**
   * Stop the agent
   */
  protected async onStop(): Promise<void> {
    await this.agent.stop();
  }

  /**
   * Execute a task by delegating to the agent
   */
  protected async executeTask(task: GuildTask): Promise<GuildResult> {
    // Convert GuildTask to Agent task format
    const agentTask = {
      id: task.id,
      type: task.type,
      data: task.data,
      metadata: {
        source: 'guild',
        requiredCapabilities: task.requiredCapabilities,
        preferredRole: task.preferredRole,
        priority: task.priority,
      },
    };

    // Execute the task on the agent
    const result = await this.agent.executeTask(agentTask);

    // Convert Agent result to GuildResult format
    return {
      taskId: task.id,
      success: result.success,
      data: result.data,
      error: result.error,
      completedAt: new Date(),
    };
  }

  /**
   * Process an event by forwarding to the agent
   */
  protected processEvent(event: GuildEvent): void {
    // Convert GuildEvent to a format the agent can understand
    this.agent.events.emit(`guild:${event.type}`, {
      source: event.source,
      type: event.type,
      data: event.data,
      timestamp: event.timestamp,
    });
  }
}

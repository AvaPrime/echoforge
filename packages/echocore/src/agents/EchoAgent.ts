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
export class EchoAgent implements Agent {
  public readonly id: string;
  public readonly metadata: AgentMetadata;
  public readonly events: EventEmitter;

  private isRunning = false;
  private context: AgentContext | null = null;

  /**
   * Create a new EchoAgent
   * @param id Optional agent ID (defaults to 'echo')
   */
  constructor(id: string = 'echo') {
    this.id = id;
    this.metadata = {
      id: id,
      name: `EchoAgent-${id}`,
      description: 'A simple agent that echoes messages and logs activity',
      version: '0.1.0',
    };
    this.events = new EventEmitter();
  }

  /**
   * Initialize the agent with the provided context
   * @param context The agent context
   */
  async initialize(context: AgentContext): Promise<void> {
    this.context = context;
    context.logger.info(`[${this.id}] EchoAgent is initializing...`, {
      metadata: { agent: this.metadata },
    });

    // Set up event handlers
    context.events.on('echo:ping', this.handlePing.bind(this));

    // Register our own event emitter with the context
    this.events.on('echo:command', (data) => {
      context.logger.info(`[${this.id}] Received command`, {
        metadata: { data },
      });
    });
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    if (!this.context) {
      throw new Error('Agent must be initialized before starting');
    }

    this.context.logger.info(`[${this.id}] EchoAgent is starting up.`);
    this.isRunning = true;
    this.events.emit('agent:started', { agentId: this.id });
    return Promise.resolve();
  }

  /**
   * Stop the agent
   */
  async stop(): Promise<void> {
    if (!this.context) {
      throw new Error('Agent must be initialized before stopping');
    }

    this.context.logger.info(`[${this.id}] EchoAgent is shutting down.`);
    this.isRunning = false;
    this.events.emit('agent:stopped', { agentId: this.id });
    return Promise.resolve();
  }

  /**
   * Execute a task with the agent
   * @param task The task to execute
   */
  async executeTask(task: AgentTask): Promise<AgentResult> {
    if (!this.context) {
      return {
        taskId: task.id,
        success: false,
        error: new Error('Agent must be initialized before executing tasks'),
      };
    }

    if (!this.isRunning) {
      return {
        taskId: task.id,
        success: false,
        error: new Error('Agent is not running'),
      };
    }

    this.context.logger.info(`[${this.id}] Executing task: ${task.id}`, {
      metadata: { task },
    });

    // Echo the task data as output
    const result: AgentResult = {
      taskId: task.id,
      success: true,
      data: {
        echo: task.data,
        timestamp: new Date().toISOString(),
        agent: this.id,
      },
    };

    this.events.emit('echo:task-complete', {
      taskId: task.id,
      result,
    });

    return result;
  }

  /**
   * Get the current status of the agent
   */
  getStatus(): Record<string, any> {
    return {
      id: this.id,
      running: this.isRunning,
      initialized: this.context !== null,
    };
  }

  /**
   * Handle ping events
   */
  private handlePing(data: any): void {
    if (!this.context) return;

    this.context.logger.info(`[${this.id}] Received ping`, {
      metadata: { data },
    });
    this.events.emit('echo:pong', {
      timestamp: new Date().toISOString(),
      agent: this.id,
      originalPing: data,
    });
  }
}

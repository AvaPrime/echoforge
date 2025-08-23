/**
 * AgentManager for the EchoForge ecosystem
 * Manages the lifecycle and registration of agents
 */

import {
  createLogger,
  EventEmitter,
  ValidationError,
} from '@echoforge/forgekit';
import { Agent } from './Agent';
import { AgentContext, buildAgentContext } from './AgentContext';
import { MemoryManager, MemoryProvider } from '../memory';

/**
 * Manager for agent registration, discovery, and lifecycle
 */
export class AgentManager {
  private agents: Map<string, Agent> = new Map();
  private context: AgentContext;
  private logger = createLogger('agent-manager');
  private events = new EventEmitter();
  private memoryProviders: MemoryProvider[] = [];
  private memoryManager?: MemoryManager;

  /**
   * Create a new agent manager
   * @param contextOptions Optional context configuration
   * @param memoryProviders Optional memory providers
   */
  constructor(
    contextOptions: Parameters<typeof buildAgentContext>[0] = {},
    memoryProviders?: MemoryProvider[]
  ) {
    this.context = buildAgentContext(contextOptions);

    if (memoryProviders && memoryProviders.length > 0) {
      this.memoryProviders = memoryProviders;
      this.memoryManager = new MemoryManager(memoryProviders);
      this.context.memory = this.memoryManager;
    }
  }

  /**
   * Register an agent with the manager
   * @param agent The agent to register
   */
  async registerAgent(agent: Agent): Promise<void> {
    if (this.agents.has(agent.id)) {
      throw new ValidationError(
        `Agent with ID ${agent.id} is already registered`
      );
    }

    this.agents.set(agent.id, agent);
    this.logger.info(`Registered agent: ${agent.id}`, {
      metadata: agent.metadata,
    });

    // Initialize the agent with the context
    await agent.initialize(this.context);

    this.events.emit('agent:registered', { agentId: agent.id });
  }

  /**
   * Unregister an agent from the manager
   * @param agentId The ID of the agent to unregister
   */
  async unregisterAgent(agentId: string): Promise<void> {
    const agent = this.agents.get(agentId);
    if (!agent) {
      throw new ValidationError(`Agent with ID ${agentId} is not registered`);
    }

    // Stop the agent if it's running
    await agent.stop();

    this.agents.delete(agentId);
    this.logger.info(`Unregistered agent: ${agentId}`);

    this.events.emit('agent:unregistered', { agentId });
  }

  /**
   * Get an agent by ID
   * @param agentId The ID of the agent to get
   */
  getAgent(agentId: string): Agent | undefined {
    return this.agents.get(agentId);
  }

  /**
   * Get all registered agents
   */
  getAllAgents(): Agent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Start all registered agents
   */
  async startAllAgents(): Promise<void> {
    this.logger.info(`Starting ${this.agents.size} agents`);

    const startPromises = Array.from(this.agents.values()).map(
      async (agent) => {
        try {
          await agent.start();
          this.logger.info(`Started agent: ${agent.id}`);
          this.events.emit('agent:started', { agentId: agent.id });
        } catch (error) {
          const err = error as Error;
          this.logger.error(`Failed to start agent: ${agent.id}`, {
            metadata: { error: err.message },
          });
          this.events.emit('agent:error', { agentId: agent.id, error });
        }
      }
    );

    await Promise.all(startPromises);
  }

  /**
   * Stop all registered agents
   */
  async stopAllAgents(): Promise<void> {
    this.logger.info(`Stopping ${this.agents.size} agents`);

    const stopPromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await agent.stop();
        this.logger.info(`Stopped agent: ${agent.id}`);
        this.events.emit('agent:stopped', { agentId: agent.id });
      } catch (error) {
        const err = error as Error;
        this.logger.error(`Failed to stop agent: ${agent.id}`, {
          metadata: { error: err.message },
        });
        this.events.emit('agent:error', { agentId: agent.id, error });
      }
    });

    await Promise.all(stopPromises);
  }

  /**
   * Get the agent context
   * @returns The agent context
   */
  getContext(): AgentContext {
    return this.context;
  }

  /**
   * Add a memory provider to the agent manager
   * @param provider The memory provider to add
   */
  addMemoryProvider(provider: MemoryProvider): void {
    this.memoryProviders.push(provider);

    // Initialize memory manager if it doesn't exist
    if (!this.memoryManager) {
      this.memoryManager = new MemoryManager(this.memoryProviders);
      this.context.memory = this.memoryManager;
    } else {
      // Reinitialize memory manager with updated providers
      this.memoryManager = new MemoryManager(this.memoryProviders);
      this.context.memory = this.memoryManager;
    }
  }

  /**
   * Get the memory manager
   * @returns The memory manager or undefined if not initialized
   */
  getMemoryManager(): MemoryManager | undefined {
    return this.memoryManager;
  }
}

/**
 * AgentManager for the EchoForge ecosystem
 * Manages the lifecycle and registration of agents
 */
import {
  createLogger,
  EventEmitter,
  ValidationError,
} from '@echoforge/forgekit';
import { buildAgentContext } from './AgentContext';
/**
 * Manager for agent registration, discovery, and lifecycle
 */
export class AgentManager {
  agents = new Map();
  context;
  logger = createLogger('agent-manager');
  events = new EventEmitter();
  /**
   * Create a new agent manager
   * @param contextOptions Optional context configuration
   */
  constructor(contextOptions = {}) {
    this.context = buildAgentContext(contextOptions);
  }
  /**
   * Register an agent with the manager
   * @param agent The agent to register
   */
  async registerAgent(agent) {
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
  async unregisterAgent(agentId) {
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
  getAgent(agentId) {
    return this.agents.get(agentId);
  }
  /**
   * Get all registered agents
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }
  /**
   * Start all registered agents
   */
  async startAllAgents() {
    this.logger.info(`Starting ${this.agents.size} agents`);
    const startPromises = Array.from(this.agents.values()).map(
      async (agent) => {
        try {
          await agent.start();
          this.logger.info(`Started agent: ${agent.id}`);
          this.events.emit('agent:started', { agentId: agent.id });
        } catch (error) {
          const err = error;
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
  async stopAllAgents() {
    this.logger.info(`Stopping ${this.agents.size} agents`);
    const stopPromises = Array.from(this.agents.values()).map(async (agent) => {
      try {
        await agent.stop();
        this.logger.info(`Stopped agent: ${agent.id}`);
        this.events.emit('agent:stopped', { agentId: agent.id });
      } catch (error) {
        const err = error;
        this.logger.error(`Failed to stop agent: ${agent.id}`, {
          metadata: { error: err.message },
        });
        this.events.emit('agent:error', { agentId: agent.id, error });
      }
    });
    await Promise.all(stopPromises);
  }
}
//# sourceMappingURL=AgentManager.js.map

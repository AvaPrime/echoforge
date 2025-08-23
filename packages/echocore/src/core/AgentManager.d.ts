/**
 * AgentManager for the EchoForge ecosystem
 * Manages the lifecycle and registration of agents
 */
import { Agent } from './Agent';
import { buildAgentContext } from './AgentContext';
/**
 * Manager for agent registration, discovery, and lifecycle
 */
export declare class AgentManager {
  private agents;
  private context;
  private logger;
  private events;
  /**
   * Create a new agent manager
   * @param contextOptions Optional context configuration
   */
  constructor(contextOptions?: Parameters<typeof buildAgentContext>[0]);
  /**
   * Register an agent with the manager
   * @param agent The agent to register
   */
  registerAgent(agent: Agent): Promise<void>;
  /**
   * Unregister an agent from the manager
   * @param agentId The ID of the agent to unregister
   */
  unregisterAgent(agentId: string): Promise<void>;
  /**
   * Get an agent by ID
   * @param agentId The ID of the agent to get
   */
  getAgent(agentId: string): Agent | undefined;
  /**
   * Get all registered agents
   */
  getAllAgents(): Agent[];
  /**
   * Start all registered agents
   */
  startAllAgents(): Promise<void>;
  /**
   * Stop all registered agents
   */
  stopAllAgents(): Promise<void>;
}
//# sourceMappingURL=AgentManager.d.ts.map

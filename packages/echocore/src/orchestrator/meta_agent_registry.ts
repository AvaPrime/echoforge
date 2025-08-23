/**
 * Meta-Agent Registry
 *
 * Manages the registration, lifecycle, and capabilities of synthetic meta-agents
 * within the EchoForge orchestration system. These agents represent specialized
 * cognitive units that can be deployed for specific tasks within the consciousness
 * framework.
 */

import { EventEmitter } from 'events';
import { OrchestratorCore, OrchestratorEvent } from './orchestrator_core';
import { MetricsEngine } from '../metrics/MetricsEngine';

/**
 * Configuration options for the Meta-Agent Registry
 */
export interface MetaAgentRegistryConfig {
  /** Reference to the parent orchestrator core */
  orchestratorCore: OrchestratorCore;

  /** Reference to the metrics engine for monitoring */
  metricsEngine: MetricsEngine;
}

/**
 * Events emitted by the Meta-Agent Registry
 */
export enum MetaAgentRegistryEvent {
  AGENT_REGISTERED = 'agent_registered',
  AGENT_DEREGISTERED = 'agent_deregistered',
  AGENT_UPDATED = 'agent_updated',
  AGENT_ACTIVATED = 'agent_activated',
  AGENT_DEACTIVATED = 'agent_deactivated',
  ERROR = 'error',
}

/**
 * Capability type that a meta-agent can possess
 */
export enum MetaAgentCapability {
  MEMORY_PROCESSING = 'memory_processing',
  CONSCIOUSNESS_ROUTING = 'consciousness_routing',
  PROPOSAL_GENERATION = 'proposal_generation',
  CONFLICT_RESOLUTION = 'conflict_resolution',
  EMERGENCE_DETECTION = 'emergence_detection',
  PATTERN_RECOGNITION = 'pattern_recognition',
  DIRECTIVE_EXECUTION = 'directive_execution',
}

/**
 * Status of a meta-agent
 */
export enum MetaAgentStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ERROR = 'error',
  TERMINATED = 'terminated',
}

/**
 * Interface for a meta-agent definition
 */
export interface MetaAgent {
  /** Unique identifier for the agent */
  id: string;

  /** Human-readable name of the agent */
  name: string;

  /** Description of the agent's purpose */
  description: string;

  /** Current status of the agent */
  status: MetaAgentStatus;

  /** List of capabilities this agent possesses */
  capabilities: MetaAgentCapability[];

  /** Configuration parameters for this agent */
  config: Record<string, any>;

  /** Timestamp when the agent was created */
  createdAt: number;

  /** Timestamp when the agent was last updated */
  updatedAt: number;

  /** Timestamp when the agent was last activated */
  lastActivatedAt?: number;

  /** Performance metrics for this agent */
  metrics: {
    /** Number of directives processed */
    directivesProcessed: number;
    /** Number of successful operations */
    successfulOperations: number;
    /** Number of failed operations */
    failedOperations: number;
    /** Average processing time in milliseconds */
    averageProcessingTimeMs: number;
  };
}

/**
 * The Meta-Agent Registry class that manages all synthetic agents
 */
export class MetaAgentRegistry extends EventEmitter {
  private config: MetaAgentRegistryConfig;
  private agents: Map<string, MetaAgent> = new Map();
  private activeAgents: Set<string> = new Set();
  private capabilityIndex: Map<MetaAgentCapability, Set<string>> = new Map();

  /**
   * Creates a new Meta-Agent Registry
   * @param config Configuration options for the registry
   */
  constructor(config: MetaAgentRegistryConfig) {
    super();
    this.config = config;

    // Initialize capability index
    Object.values(MetaAgentCapability).forEach((capability) => {
      this.capabilityIndex.set(capability as MetaAgentCapability, new Set());
    });
  }

  /**
   * Initializes the registry
   */
  public async initialize(): Promise<void> {
    // Register metrics
    this.registerMetrics();

    // Load any persisted agents (TODO: implement persistence)

    console.log('Meta-Agent Registry initialized');
  }

  /**
   * Shuts down the registry and all active agents
   */
  public async shutdown(): Promise<void> {
    // Deactivate all active agents
    for (const agentId of this.activeAgents) {
      await this.deactivateAgent(agentId);
    }

    console.log('Meta-Agent Registry shut down');
  }

  /**
   * Registers a new meta-agent
   * @param agentDefinition The agent definition
   */
  public registerAgent(
    agentDefinition: Omit<
      MetaAgent,
      'status' | 'createdAt' | 'updatedAt' | 'metrics'
    >
  ): MetaAgent {
    // Check if agent with this ID already exists
    if (this.agents.has(agentDefinition.id)) {
      throw new Error(`Agent with ID ${agentDefinition.id} already exists`);
    }

    const now = Date.now();

    // Create the agent
    const agent: MetaAgent = {
      ...agentDefinition,
      status: MetaAgentStatus.INITIALIZING,
      createdAt: now,
      updatedAt: now,
      metrics: {
        directivesProcessed: 0,
        successfulOperations: 0,
        failedOperations: 0,
        averageProcessingTimeMs: 0,
      },
    };

    // Add to registry
    this.agents.set(agent.id, agent);

    // Index by capabilities
    agent.capabilities.forEach((capability) => {
      const capabilitySet = this.capabilityIndex.get(capability);
      if (capabilitySet) {
        capabilitySet.add(agent.id);
      }
    });

    // Update agent status
    agent.status = MetaAgentStatus.READY;

    // Emit event
    this.emit(MetaAgentRegistryEvent.AGENT_REGISTERED, agent);
    this.config.orchestratorCore.emit(
      OrchestratorEvent.AGENT_REGISTERED,
      agent
    );

    // Record metric
    this.config.metricsEngine.record('agent_registered', 1, {
      agent_id: agent.id,
      capabilities: agent.capabilities.join(','),
    });

    console.log(`Registered meta-agent: ${agent.name} (${agent.id})`);

    return agent;
  }

  /**
   * Deregisters a meta-agent
   * @param agentId The ID of the agent to deregister
   */
  public async deregisterAgent(agentId: string): Promise<void> {
    const agent = this.getAgent(agentId);

    // Deactivate if active
    if (this.activeAgents.has(agentId)) {
      await this.deactivateAgent(agentId);
    }

    // Remove from capability index
    agent.capabilities.forEach((capability) => {
      const capabilitySet = this.capabilityIndex.get(capability);
      if (capabilitySet) {
        capabilitySet.delete(agentId);
      }
    });

    // Remove from registry
    this.agents.delete(agentId);

    // Emit event
    this.emit(MetaAgentRegistryEvent.AGENT_DEREGISTERED, agent);
    this.config.orchestratorCore.emit(
      OrchestratorEvent.AGENT_DEREGISTERED,
      agent
    );

    // Record metric
    this.config.metricsEngine.record('agent_deregistered', 1, {
      agent_id: agent.id,
    });

    console.log(`Deregistered meta-agent: ${agent.name} (${agent.id})`);
  }

  /**
   * Updates an existing meta-agent
   * @param agentId The ID of the agent to update
   * @param updates The updates to apply
   */
  public updateAgent(
    agentId: string,
    updates: Partial<
      Omit<MetaAgent, 'id' | 'status' | 'createdAt' | 'updatedAt' | 'metrics'>
    >
  ): MetaAgent {
    const agent = this.getAgent(agentId);

    // Apply updates
    const updatedAgent: MetaAgent = {
      ...agent,
      ...updates,
      updatedAt: Date.now(),
    };

    // If capabilities changed, update the capability index
    if (updates.capabilities) {
      // Remove from old capability sets
      agent.capabilities.forEach((capability) => {
        const capabilitySet = this.capabilityIndex.get(capability);
        if (capabilitySet) {
          capabilitySet.delete(agentId);
        }
      });

      // Add to new capability sets
      updatedAgent.capabilities.forEach((capability) => {
        const capabilitySet = this.capabilityIndex.get(capability);
        if (capabilitySet) {
          capabilitySet.add(agentId);
        }
      });
    }

    // Update in registry
    this.agents.set(agentId, updatedAgent);

    // Emit event
    this.emit(MetaAgentRegistryEvent.AGENT_UPDATED, updatedAgent);

    // Record metric
    this.config.metricsEngine.record('agent_updated', 1, {
      agent_id: updatedAgent.id,
    });

    console.log(
      `Updated meta-agent: ${updatedAgent.name} (${updatedAgent.id})`
    );

    return updatedAgent;
  }

  /**
   * Activates a meta-agent
   * @param agentId The ID of the agent to activate
   */
  public async activateAgent(agentId: string): Promise<MetaAgent> {
    const agent = this.getAgent(agentId);

    if (
      agent.status !== MetaAgentStatus.READY &&
      agent.status !== MetaAgentStatus.PAUSED
    ) {
      throw new Error(
        `Cannot activate agent ${agentId} with status ${agent.status}`
      );
    }

    // Update agent status
    const now = Date.now();
    const updatedAgent = this.updateAgent(agentId, {
      lastActivatedAt: now,
    });
    updatedAgent.status = MetaAgentStatus.ACTIVE;

    // Add to active agents
    this.activeAgents.add(agentId);

    // Emit event
    this.emit(MetaAgentRegistryEvent.AGENT_ACTIVATED, updatedAgent);

    // Record metric
    this.config.metricsEngine.record('agent_activated', 1, {
      agent_id: updatedAgent.id,
    });

    console.log(
      `Activated meta-agent: ${updatedAgent.name} (${updatedAgent.id})`
    );

    return updatedAgent;
  }

  /**
   * Deactivates a meta-agent
   * @param agentId The ID of the agent to deactivate
   */
  public async deactivateAgent(agentId: string): Promise<MetaAgent> {
    const agent = this.getAgent(agentId);

    if (agent.status !== MetaAgentStatus.ACTIVE) {
      throw new Error(
        `Cannot deactivate agent ${agentId} with status ${agent.status}`
      );
    }

    // Update agent status
    agent.status = MetaAgentStatus.PAUSED;

    // Remove from active agents
    this.activeAgents.delete(agentId);

    // Emit event
    this.emit(MetaAgentRegistryEvent.AGENT_DEACTIVATED, agent);

    // Record metric
    this.config.metricsEngine.record('agent_deactivated', 1, {
      agent_id: agent.id,
    });

    console.log(`Deactivated meta-agent: ${agent.name} (${agent.id})`);

    return agent;
  }

  /**
   * Gets a meta-agent by ID
   * @param agentId The ID of the agent to get
   */
  public getAgent(agentId: string): MetaAgent {
    const agent = this.agents.get(agentId);

    if (!agent) {
      throw new Error(`Agent with ID ${agentId} not found`);
    }

    return agent;
  }

  /**
   * Gets all registered meta-agents
   */
  public getAllAgents(): MetaAgent[] {
    return Array.from(this.agents.values());
  }

  /**
   * Gets all active meta-agents
   */
  public getActiveAgents(): MetaAgent[] {
    return Array.from(this.activeAgents).map((agentId) =>
      this.getAgent(agentId)
    );
  }

  /**
   * Gets all meta-agents with a specific capability
   * @param capability The capability to filter by
   */
  public getAgentsByCapability(capability: MetaAgentCapability): MetaAgent[] {
    const capabilitySet = this.capabilityIndex.get(capability);

    if (!capabilitySet) {
      return [];
    }

    return Array.from(capabilitySet).map((agentId) => this.getAgent(agentId));
  }

  /**
   * Updates the metrics for a meta-agent
   * @param agentId The ID of the agent to update metrics for
   * @param metricUpdates The metric updates to apply
   */
  public updateAgentMetrics(
    agentId: string,
    metricUpdates: Partial<MetaAgent['metrics']>
  ): MetaAgent {
    const agent = this.getAgent(agentId);

    // Apply updates
    const updatedMetrics = {
      ...agent.metrics,
      ...metricUpdates,
    };

    // Update agent
    agent.metrics = updatedMetrics;
    agent.updatedAt = Date.now();

    // Record metrics
    if (metricUpdates.directivesProcessed) {
      this.config.metricsEngine.record(
        'agent_directives_processed',
        metricUpdates.directivesProcessed,
        {
          agent_id: agent.id,
        }
      );
    }

    if (metricUpdates.successfulOperations) {
      this.config.metricsEngine.record(
        'agent_successful_operations',
        metricUpdates.successfulOperations,
        {
          agent_id: agent.id,
        }
      );
    }

    if (metricUpdates.failedOperations) {
      this.config.metricsEngine.record(
        'agent_failed_operations',
        metricUpdates.failedOperations,
        {
          agent_id: agent.id,
        }
      );
    }

    return agent;
  }

  /**
   * Registers metrics for the registry
   */
  private registerMetrics(): void {
    // Register agent lifecycle metrics
    this.config.metricsEngine.registerMetric({
      name: 'agent_registered',
      description: 'Number of meta-agents registered',
      type: 'counter',
      tags: ['agent_id', 'capabilities'],
    });

    this.config.metricsEngine.registerMetric({
      name: 'agent_deregistered',
      description: 'Number of meta-agents deregistered',
      type: 'counter',
      tags: ['agent_id'],
    });

    this.config.metricsEngine.registerMetric({
      name: 'agent_updated',
      description: 'Number of meta-agents updated',
      type: 'counter',
      tags: ['agent_id'],
    });

    this.config.metricsEngine.registerMetric({
      name: 'agent_activated',
      description: 'Number of meta-agents activated',
      type: 'counter',
      tags: ['agent_id'],
    });

    this.config.metricsEngine.registerMetric({
      name: 'agent_deactivated',
      description: 'Number of meta-agents deactivated',
      type: 'counter',
      tags: ['agent_id'],
    });

    // Register agent performance metrics
    this.config.metricsEngine.registerMetric({
      name: 'agent_directives_processed',
      description: 'Number of directives processed by meta-agents',
      type: 'counter',
      tags: ['agent_id'],
    });

    this.config.metricsEngine.registerMetric({
      name: 'agent_successful_operations',
      description: 'Number of successful operations by meta-agents',
      type: 'counter',
      tags: ['agent_id'],
    });

    this.config.metricsEngine.registerMetric({
      name: 'agent_failed_operations',
      description: 'Number of failed operations by meta-agents',
      type: 'counter',
      tags: ['agent_id'],
    });

    this.config.metricsEngine.registerMetric({
      name: 'agent_processing_time',
      description:
        'Time taken by meta-agents to process directives in milliseconds',
      type: 'histogram',
      tags: ['agent_id', 'directive_type'],
    });
  }
}

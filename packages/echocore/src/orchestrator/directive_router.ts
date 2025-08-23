/**
 * Directive Router
 *
 * Routes consciousness directives to appropriate meta-agents for processing.
 * Manages the flow of directives through the system, ensuring proper handling,
 * prioritization, and execution tracking.
 */

import { EventEmitter } from 'events';
import { OrchestratorCore, OrchestratorEvent } from './orchestrator_core';
import {
  MetaAgentRegistry,
  MetaAgent,
  MetaAgentCapability,
  MetaAgentStatus,
} from './meta_agent_registry';

/**
 * Configuration options for the Directive Router
 */
export interface DirectiveRouterConfig {
  /** Reference to the parent orchestrator core */
  orchestratorCore: OrchestratorCore;

  /** Reference to the meta-agent registry */
  metaAgentRegistry: MetaAgentRegistry;

  /** Maximum number of concurrent directives to process */
  maxConcurrentDirectives: number;
}

/**
 * Events emitted by the Directive Router
 */
export enum DirectiveRouterEvent {
  DIRECTIVE_RECEIVED = 'directive_received',
  DIRECTIVE_ROUTED = 'directive_routed',
  DIRECTIVE_COMPLETED = 'directive_completed',
  DIRECTIVE_FAILED = 'directive_failed',
  DIRECTIVE_CANCELLED = 'directive_cancelled',
  ERROR = 'error',
}

/**
 * Priority levels for directives
 */
export enum DirectivePriority {
  CRITICAL = 'critical', // Highest priority, must be processed immediately
  HIGH = 'high', // High priority, process as soon as possible
  NORMAL = 'normal', // Normal priority, process in order
  LOW = 'low', // Low priority, process when resources available
  BACKGROUND = 'background', // Lowest priority, process only when system is idle
}

/**
 * Status of a directive
 */
export enum DirectiveStatus {
  PENDING = 'pending', // Waiting to be processed
  ROUTING = 'routing', // Finding appropriate agent(s)
  ASSIGNED = 'assigned', // Assigned to agent(s) but not yet processing
  PROCESSING = 'processing', // Currently being processed
  COMPLETED = 'completed', // Successfully completed
  FAILED = 'failed', // Failed to complete
  CANCELLED = 'cancelled', // Cancelled before completion
}

/**
 * Type of directive
 */
export enum DirectiveType {
  MEMORY_QUERY = 'memory_query', // Query the memory system
  MEMORY_UPDATE = 'memory_update', // Update the memory system
  CONSCIOUSNESS_EVALUATION = 'consciousness_evaluation', // Evaluate consciousness state
  PROPOSAL_GENERATION = 'proposal_generation', // Generate proposals
  CONFLICT_RESOLUTION = 'conflict_resolution', // Resolve conflicts
  EMERGENCE_RESPONSE = 'emergence_response', // Respond to emergence events
  SYSTEM_MAINTENANCE = 'system_maintenance', // Perform system maintenance
  CUSTOM = 'custom', // Custom directive type
}

/**
 * Interface for a directive
 */
export interface Directive {
  /** Unique identifier for the directive */
  id: string;

  /** Type of directive */
  type: DirectiveType;

  /** Priority of the directive */
  priority: DirectivePriority;

  /** Current status of the directive */
  status: DirectiveStatus;

  /** Payload containing directive-specific data */
  payload: Record<string, any>;

  /** Required capabilities for processing this directive */
  requiredCapabilities: MetaAgentCapability[];

  /** ID of the agent assigned to process this directive */
  assignedAgentId?: string;

  /** Timestamp when the directive was created */
  createdAt: number;

  /** Timestamp when the directive was last updated */
  updatedAt: number;

  /** Timestamp when the directive started processing */
  startedAt?: number;

  /** Timestamp when the directive completed processing */
  completedAt?: number;

  /** Result of the directive processing */
  result?: Record<string, any>;

  /** Error information if the directive failed */
  error?: {
    message: string;
    code?: string;
    details?: Record<string, any>;
  };
}

/**
 * The Directive Router class that manages directive flow
 */
export class DirectiveRouter extends EventEmitter {
  private config: DirectiveRouterConfig;
  private directives: Map<string, Directive> = new Map();
  private pendingDirectives: string[] = [];
  private processingDirectives: Set<string> = new Set();
  private processingInterval: NodeJS.Timeout | null = null;

  /**
   * Creates a new Directive Router
   * @param config Configuration options for the router
   */
  constructor(config: DirectiveRouterConfig) {
    super();
    this.config = config;
  }

  /**
   * Initializes the router
   */
  public async initialize(): Promise<void> {
    // Set up processing interval
    this.processingInterval = setInterval(() => {
      this.processNextDirectives();
    }, 100); // Process directives every 100ms

    console.log('Directive Router initialized');
  }

  /**
   * Shuts down the router
   */
  public async shutdown(): Promise<void> {
    // Clear processing interval
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
      this.processingInterval = null;
    }

    // Cancel all pending directives
    for (const directiveId of this.pendingDirectives) {
      await this.cancelDirective(directiveId, 'System shutdown');
    }

    console.log('Directive Router shut down');
  }

  /**
   * Submits a new directive for processing
   * @param directiveData The directive data
   */
  public submitDirective(
    directiveData: Omit<Directive, 'id' | 'status' | 'createdAt' | 'updatedAt'>
  ): Directive {
    const now = Date.now();
    const id = `directive-${now}-${Math.random().toString(36).substr(2, 9)}`;

    // Create the directive
    const directive: Directive = {
      ...directiveData,
      id,
      status: DirectiveStatus.PENDING,
      createdAt: now,
      updatedAt: now,
    };

    // Add to registry
    this.directives.set(directive.id, directive);

    // Add to pending queue based on priority
    this.addToPendingQueue(directive);

    // Emit event
    this.emit(DirectiveRouterEvent.DIRECTIVE_RECEIVED, directive);
    this.config.orchestratorCore.emit(
      OrchestratorEvent.DIRECTIVE_RECEIVED,
      directive
    );

    console.log(`Submitted directive: ${directive.id} (${directive.type})`);

    return directive;
  }

  /**
   * Cancels a directive
   * @param directiveId The ID of the directive to cancel
   * @param reason The reason for cancellation
   */
  public async cancelDirective(
    directiveId: string,
    reason: string
  ): Promise<Directive> {
    const directive = this.getDirective(directiveId);

    if (
      directive.status === DirectiveStatus.COMPLETED ||
      directive.status === DirectiveStatus.FAILED ||
      directive.status === DirectiveStatus.CANCELLED
    ) {
      throw new Error(
        `Cannot cancel directive ${directiveId} with status ${directive.status}`
      );
    }

    // Update directive status
    directive.status = DirectiveStatus.CANCELLED;
    directive.updatedAt = Date.now();
    directive.error = {
      message: `Directive cancelled: ${reason}`,
    };

    // Remove from pending queue if present
    const pendingIndex = this.pendingDirectives.indexOf(directiveId);
    if (pendingIndex !== -1) {
      this.pendingDirectives.splice(pendingIndex, 1);
    }

    // Remove from processing set if present
    this.processingDirectives.delete(directiveId);

    // Emit event
    this.emit(DirectiveRouterEvent.DIRECTIVE_CANCELLED, directive);

    console.log(`Cancelled directive: ${directive.id} (${reason})`);

    return directive;
  }

  /**
   * Gets a directive by ID
   * @param directiveId The ID of the directive to get
   */
  public getDirective(directiveId: string): Directive {
    const directive = this.directives.get(directiveId);

    if (!directive) {
      throw new Error(`Directive with ID ${directiveId} not found`);
    }

    return directive;
  }

  /**
   * Gets all directives
   */
  public getAllDirectives(): Directive[] {
    return Array.from(this.directives.values());
  }

  /**
   * Gets all pending directives
   */
  public getPendingDirectives(): Directive[] {
    return this.pendingDirectives.map((id) => this.getDirective(id));
  }

  /**
   * Gets all processing directives
   */
  public getProcessingDirectives(): Directive[] {
    return Array.from(this.processingDirectives).map((id) =>
      this.getDirective(id)
    );
  }

  /**
   * Completes a directive with a result
   * @param directiveId The ID of the directive to complete
   * @param result The result of the directive processing
   */
  public completeDirective(
    directiveId: string,
    result: Record<string, any>
  ): Directive {
    const directive = this.getDirective(directiveId);

    if (directive.status !== DirectiveStatus.PROCESSING) {
      throw new Error(
        `Cannot complete directive ${directiveId} with status ${directive.status}`
      );
    }

    // Update directive
    directive.status = DirectiveStatus.COMPLETED;
    directive.updatedAt = Date.now();
    directive.completedAt = Date.now();
    directive.result = result;

    // Remove from processing set
    this.processingDirectives.delete(directiveId);

    // Emit event
    this.emit(DirectiveRouterEvent.DIRECTIVE_COMPLETED, directive);
    this.config.orchestratorCore.emit(
      OrchestratorEvent.DIRECTIVE_COMPLETED,
      directive
    );

    // Update agent metrics if assigned
    if (directive.assignedAgentId) {
      try {
        const agent = this.config.metaAgentRegistry.getAgent(
          directive.assignedAgentId
        );
        this.config.metaAgentRegistry.updateAgentMetrics(agent.id, {
          directivesProcessed: agent.metrics.directivesProcessed + 1,
          successfulOperations: agent.metrics.successfulOperations + 1,
          averageProcessingTimeMs: this.calculateAverageProcessingTime(
            agent.metrics.averageProcessingTimeMs,
            agent.metrics.directivesProcessed,
            directive.completedAt! - directive.startedAt!
          ),
        });
      } catch (error) {
        console.error(
          `Failed to update agent metrics for ${directive.assignedAgentId}:`,
          error
        );
      }
    }

    console.log(`Completed directive: ${directive.id}`);

    return directive;
  }

  /**
   * Fails a directive with an error
   * @param directiveId The ID of the directive to fail
   * @param error The error that caused the failure
   */
  public failDirective(
    directiveId: string,
    error: Directive['error']
  ): Directive {
    const directive = this.getDirective(directiveId);

    if (
      directive.status !== DirectiveStatus.PROCESSING &&
      directive.status !== DirectiveStatus.ROUTING &&
      directive.status !== DirectiveStatus.ASSIGNED
    ) {
      throw new Error(
        `Cannot fail directive ${directiveId} with status ${directive.status}`
      );
    }

    // Update directive
    directive.status = DirectiveStatus.FAILED;
    directive.updatedAt = Date.now();
    directive.completedAt = Date.now();
    directive.error = error;

    // Remove from processing set
    this.processingDirectives.delete(directiveId);

    // Emit event
    this.emit(DirectiveRouterEvent.DIRECTIVE_FAILED, directive);
    this.config.orchestratorCore.emit(
      OrchestratorEvent.DIRECTIVE_FAILED,
      directive
    );

    // Update agent metrics if assigned
    if (directive.assignedAgentId) {
      try {
        const agent = this.config.metaAgentRegistry.getAgent(
          directive.assignedAgentId
        );
        this.config.metaAgentRegistry.updateAgentMetrics(agent.id, {
          directivesProcessed: agent.metrics.directivesProcessed + 1,
          failedOperations: agent.metrics.failedOperations + 1,
        });
      } catch (error) {
        console.error(
          `Failed to update agent metrics for ${directive.assignedAgentId}:`,
          error
        );
      }
    }

    console.log(`Failed directive: ${directive.id} (${error.message})`);

    return directive;
  }

  /**
   * Processes the next batch of directives
   */
  private processNextDirectives(): void {
    // Check if we can process more directives
    const availableSlots =
      this.config.maxConcurrentDirectives - this.processingDirectives.size;

    if (availableSlots <= 0 || this.pendingDirectives.length === 0) {
      return;
    }

    // Process up to availableSlots directives
    const directivesToProcess = Math.min(
      availableSlots,
      this.pendingDirectives.length
    );

    for (let i = 0; i < directivesToProcess; i++) {
      const directiveId = this.pendingDirectives.shift();

      if (directiveId) {
        this.processDirective(directiveId).catch((error) => {
          console.error(`Error processing directive ${directiveId}:`, error);
          this.emit(DirectiveRouterEvent.ERROR, { directiveId, error });
        });
      }
    }
  }

  /**
   * Processes a single directive
   * @param directiveId The ID of the directive to process
   */
  private async processDirective(directiveId: string): Promise<void> {
    const directive = this.getDirective(directiveId);

    // Update status to routing
    directive.status = DirectiveStatus.ROUTING;
    directive.updatedAt = Date.now();

    try {
      // Find an appropriate agent
      const agent = await this.findAppropriateAgent(directive);

      if (!agent) {
        // No suitable agent found, fail the directive
        this.failDirective(directiveId, {
          message: 'No suitable agent found for directive',
          code: 'NO_SUITABLE_AGENT',
        });
        return;
      }

      // Assign the directive to the agent
      directive.assignedAgentId = agent.id;
      directive.status = DirectiveStatus.ASSIGNED;
      directive.updatedAt = Date.now();

      // Add to processing set
      this.processingDirectives.add(directiveId);

      // Update status to processing
      directive.status = DirectiveStatus.PROCESSING;
      directive.startedAt = Date.now();
      directive.updatedAt = Date.now();

      // Emit event
      this.emit(DirectiveRouterEvent.DIRECTIVE_ROUTED, { directive, agent });

      console.log(`Routed directive ${directive.id} to agent ${agent.id}`);

      // TODO: Actually process the directive with the agent
      // This would involve calling into the agent's processing logic
      // For now, we'll simulate processing with a timeout

      setTimeout(
        () => {
          // Simulate successful completion
          if (Math.random() > 0.1) {
            // 90% success rate
            this.completeDirective(directiveId, {
              message: 'Directive processed successfully',
              // Add directive-specific result data here
            });
          } else {
            // Simulate failure
            this.failDirective(directiveId, {
              message: 'Failed to process directive',
              code: 'PROCESSING_ERROR',
              details: {
                reason: 'Simulated failure',
              },
            });
          }
        },
        1000 + Math.random() * 2000
      ); // Random processing time between 1-3 seconds
    } catch (error) {
      // Handle errors during routing
      this.failDirective(directiveId, {
        message: `Error routing directive: ${error instanceof Error ? error.message : String(error)}`,
        code: 'ROUTING_ERROR',
      });
    }
  }

  /**
   * Finds an appropriate agent for a directive
   * @param directive The directive to find an agent for
   */
  private async findAppropriateAgent(
    directive: Directive
  ): Promise<MetaAgent | null> {
    // Get all agents with the required capabilities
    const capableAgents: MetaAgent[] = [];

    for (const capability of directive.requiredCapabilities) {
      const agents =
        this.config.metaAgentRegistry.getAgentsByCapability(capability);

      // Filter to only active agents
      const activeAgents = agents.filter(
        (agent) => agent.status === MetaAgentStatus.ACTIVE
      );

      if (activeAgents.length === 0) {
        // No active agents with this capability
        return null;
      }

      // Add to capable agents
      capableAgents.push(...activeAgents);
    }

    // Find agents that have all required capabilities
    const eligibleAgents = capableAgents.filter((agent) => {
      return directive.requiredCapabilities.every((capability) =>
        agent.capabilities.includes(capability)
      );
    });

    if (eligibleAgents.length === 0) {
      return null;
    }

    // For now, just pick the first eligible agent
    // TODO: Implement more sophisticated agent selection based on load, performance, etc.
    return eligibleAgents[0];
  }

  /**
   * Adds a directive to the pending queue based on priority
   * @param directive The directive to add
   */
  private addToPendingQueue(directive: Directive): void {
    // Simple implementation: just add to the end of the queue
    // TODO: Implement priority-based queueing
    this.pendingDirectives.push(directive.id);

    // Sort the queue by priority
    this.sortPendingQueue();
  }

  /**
   * Sorts the pending queue by priority
   */
  private sortPendingQueue(): void {
    // Sort by priority (higher priority first) and then by creation time (older first)
    this.pendingDirectives.sort((a, b) => {
      const directiveA = this.getDirective(a);
      const directiveB = this.getDirective(b);

      // Compare priorities
      const priorityOrder =
        this.getPriorityOrder(directiveA.priority) -
        this.getPriorityOrder(directiveB.priority);

      if (priorityOrder !== 0) {
        return priorityOrder;
      }

      // If same priority, sort by creation time (older first)
      return directiveA.createdAt - directiveB.createdAt;
    });
  }

  /**
   * Gets the numeric order of a priority
   * @param priority The priority to get the order for
   */
  private getPriorityOrder(priority: DirectivePriority): number {
    switch (priority) {
      case DirectivePriority.CRITICAL:
        return 0;
      case DirectivePriority.HIGH:
        return 1;
      case DirectivePriority.NORMAL:
        return 2;
      case DirectivePriority.LOW:
        return 3;
      case DirectivePriority.BACKGROUND:
        return 4;
      default:
        return 5;
    }
  }

  /**
   * Calculates the new average processing time
   * @param currentAverage The current average processing time
   * @param currentCount The current count of processed directives
   * @param newTime The new processing time to include in the average
   */
  private calculateAverageProcessingTime(
    currentAverage: number,
    currentCount: number,
    newTime: number
  ): number {
    return (currentAverage * currentCount + newTime) / (currentCount + 1);
  }
}

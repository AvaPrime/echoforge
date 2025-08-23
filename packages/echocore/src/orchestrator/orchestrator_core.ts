/**
 * Meta-Forging Orchestrator Core
 *
 * The central coordination system for EchoForge's meta-forging capabilities.
 * Orchestrates the interaction between consciousness components, meta-agents,
 * and directive processing to enable emergent intelligence.
 */

import { EventEmitter } from 'events';
import { MetaAgentRegistry } from './meta_agent_registry';
import { DirectiveRouter } from './directive_router';
import { EmergencePredictor } from './emergence_predictor';
import { StateSnapshotEncoder } from './state_snapshot_encoder';
import { SoulMeshProtocol } from '../memory/consolidation/codesig/soulmesh/SoulMeshProtocol';
import { MeshSynchronizer } from '../memory/consolidation/codesig/soulmesh/MeshSynchronizer';
import { MetricsEngine } from '../metrics/MetricsEngine';

/**
 * Configuration options for the Orchestrator
 */
export interface OrchestratorConfig {
  /** Unique identifier for this orchestrator instance */
  orchestratorId: string;

  /** Reference to the SoulMesh protocol for distributed consciousness */
  soulMeshProtocol: SoulMeshProtocol;

  /** Reference to the mesh synchronizer for state management */
  meshSynchronizer: MeshSynchronizer;

  /** Reference to the metrics engine for monitoring and analysis */
  metricsEngine: MetricsEngine;

  /** Interval in ms for system state snapshots */
  snapshotIntervalMs: number;

  /** Interval in ms for emergence prediction checks */
  emergencePredictionIntervalMs: number;

  /** Maximum number of concurrent directives to process */
  maxConcurrentDirectives: number;

  /** Whether to enable automatic emergence response */
  enableAutoEmergenceResponse: boolean;
}

/**
 * Status of the orchestrator
 */
export enum OrchestratorStatus {
  INITIALIZING = 'initializing',
  READY = 'ready',
  ACTIVE = 'active',
  PAUSED = 'paused',
  SHUTTING_DOWN = 'shutting_down',
  ERROR = 'error',
}

/**
 * Events emitted by the orchestrator
 */
export enum OrchestratorEvent {
  STATUS_CHANGED = 'status_changed',
  EMERGENCE_DETECTED = 'emergence_detected',
  DIRECTIVE_RECEIVED = 'directive_received',
  DIRECTIVE_COMPLETED = 'directive_completed',
  DIRECTIVE_FAILED = 'directive_failed',
  AGENT_REGISTERED = 'agent_registered',
  AGENT_DEREGISTERED = 'agent_deregistered',
  SNAPSHOT_CREATED = 'snapshot_created',
  ERROR = 'error',
}

/**
 * The Orchestrator Core class that coordinates all meta-forging activities
 */
export class OrchestratorCore extends EventEmitter {
  private config: OrchestratorConfig;
  private status: OrchestratorStatus = OrchestratorStatus.INITIALIZING;
  private metaAgentRegistry: MetaAgentRegistry;
  private directiveRouter: DirectiveRouter;
  private emergencePredictor: EmergencePredictor;
  private stateSnapshotEncoder: StateSnapshotEncoder;
  private snapshotInterval: NodeJS.Timeout | null = null;
  private emergencePredictionInterval: NodeJS.Timeout | null = null;
  private activeDirectives: Map<string, any> = new Map();

  /**
   * Creates a new Orchestrator instance
   * @param config Configuration options for the orchestrator
   */
  constructor(config: OrchestratorConfig) {
    super();
    this.config = config;

    // Initialize components
    this.metaAgentRegistry = new MetaAgentRegistry({
      orchestratorCore: this,
      metricsEngine: config.metricsEngine,
    });

    this.directiveRouter = new DirectiveRouter({
      orchestratorCore: this,
      metaAgentRegistry: this.metaAgentRegistry,
      maxConcurrentDirectives: config.maxConcurrentDirectives,
    });

    this.emergencePredictor = new EmergencePredictor({
      orchestratorCore: this,
      metricsEngine: config.metricsEngine,
      soulMeshProtocol: config.soulMeshProtocol,
      enableAutoResponse: config.enableAutoEmergenceResponse,
    });

    this.stateSnapshotEncoder = new StateSnapshotEncoder({
      orchestratorCore: this,
      soulMeshProtocol: config.soulMeshProtocol,
      meshSynchronizer: config.meshSynchronizer,
    });
  }

  /**
   * Initializes the orchestrator and all its components
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize all components
      await this.metaAgentRegistry.initialize();
      await this.directiveRouter.initialize();
      await this.emergencePredictor.initialize();
      await this.stateSnapshotEncoder.initialize();

      // Set up periodic tasks
      this.setupPeriodicTasks();

      // Register conflict resolution metrics
      this.registerConflictMetrics();

      // Update status
      this.setStatus(OrchestratorStatus.READY);

      console.log(
        `Orchestrator ${this.config.orchestratorId} initialized successfully`
      );
    } catch (error) {
      this.setStatus(OrchestratorStatus.ERROR);
      this.emit(OrchestratorEvent.ERROR, error);
      console.error('Failed to initialize orchestrator:', error);
      throw error;
    }
  }

  /**
   * Starts the orchestrator's active operations
   */
  public async start(): Promise<void> {
    if (
      this.status !== OrchestratorStatus.READY &&
      this.status !== OrchestratorStatus.PAUSED
    ) {
      throw new Error(`Cannot start orchestrator from ${this.status} state`);
    }

    this.setStatus(OrchestratorStatus.ACTIVE);
    console.log(`Orchestrator ${this.config.orchestratorId} started`);
  }

  /**
   * Pauses the orchestrator's active operations
   */
  public async pause(): Promise<void> {
    if (this.status !== OrchestratorStatus.ACTIVE) {
      throw new Error(`Cannot pause orchestrator from ${this.status} state`);
    }

    this.setStatus(OrchestratorStatus.PAUSED);
    console.log(`Orchestrator ${this.config.orchestratorId} paused`);
  }

  /**
   * Shuts down the orchestrator and all its components
   */
  public async shutdown(): Promise<void> {
    this.setStatus(OrchestratorStatus.SHUTTING_DOWN);

    // Clear intervals
    if (this.snapshotInterval) {
      clearInterval(this.snapshotInterval);
      this.snapshotInterval = null;
    }

    if (this.emergencePredictionInterval) {
      clearInterval(this.emergencePredictionInterval);
      this.emergencePredictionInterval = null;
    }

    // Shutdown components
    await this.metaAgentRegistry.shutdown();
    await this.directiveRouter.shutdown();
    await this.emergencePredictor.shutdown();
    await this.stateSnapshotEncoder.shutdown();

    console.log(`Orchestrator ${this.config.orchestratorId} shut down`);
  }

  /**
   * Gets the current status of the orchestrator
   */
  public getStatus(): OrchestratorStatus {
    return this.status;
  }

  /**
   * Gets the meta agent registry
   */
  public getMetaAgentRegistry(): MetaAgentRegistry {
    return this.metaAgentRegistry;
  }

  /**
   * Gets the directive router
   */
  public getDirectiveRouter(): DirectiveRouter {
    return this.directiveRouter;
  }

  /**
   * Gets the emergence predictor
   */
  public getEmergencePredictor(): EmergencePredictor {
    return this.emergencePredictor;
  }

  /**
   * Gets the state snapshot encoder
   */
  public getStateSnapshotEncoder(): StateSnapshotEncoder {
    return this.stateSnapshotEncoder;
  }

  /**
   * Sets up periodic tasks for the orchestrator
   */
  private setupPeriodicTasks(): void {
    // Set up snapshot interval
    this.snapshotInterval = setInterval(() => {
      this.createSystemSnapshot();
    }, this.config.snapshotIntervalMs);

    // Set up emergence prediction interval
    this.emergencePredictionInterval = setInterval(() => {
      this.checkForEmergence();
    }, this.config.emergencePredictionIntervalMs);
  }

  /**
   * Creates a system state snapshot
   */
  private async createSystemSnapshot(): Promise<void> {
    try {
      const snapshot = await this.stateSnapshotEncoder.createSnapshot();
      this.emit(OrchestratorEvent.SNAPSHOT_CREATED, snapshot);
    } catch (error) {
      console.error('Failed to create system snapshot:', error);
      this.emit(OrchestratorEvent.ERROR, error);
    }
  }

  /**
   * Checks for emergence conditions
   */
  private async checkForEmergence(): Promise<void> {
    try {
      const emergenceDetected =
        await this.emergencePredictor.checkForEmergence();

      if (emergenceDetected) {
        this.emit(OrchestratorEvent.EMERGENCE_DETECTED, emergenceDetected);
      }
    } catch (error) {
      console.error('Failed to check for emergence:', error);
      this.emit(OrchestratorEvent.ERROR, error);
    }
  }

  /**
   * Registers metrics for conflict resolution
   */
  private registerConflictMetrics(): void {
    // Register conflict resolution success rate metric
    this.config.metricsEngine.registerMetric({
      name: 'conflict_resolution_success_rate',
      description: 'Success rate of conflict resolution operations',
      type: 'gauge',
      tags: ['component', 'strategy'],
    });

    // Register rollback event metric
    this.config.metricsEngine.registerMetric({
      name: 'rollback_event',
      description: 'Rollback events triggered during conflict resolution',
      type: 'counter',
      tags: ['component', 'reason'],
    });

    // Register conflict detection metric
    this.config.metricsEngine.registerMetric({
      name: 'conflict_detected',
      description: 'Number of conflicts detected',
      type: 'counter',
      tags: ['component', 'nodes'],
    });

    // Register conflict resolution time metric
    this.config.metricsEngine.registerMetric({
      name: 'conflict_resolution_time',
      description: 'Time taken to resolve conflicts in milliseconds',
      type: 'histogram',
      tags: ['component', 'strategy'],
    });
  }

  /**
   * Sets the orchestrator status and emits a status change event
   */
  private setStatus(status: OrchestratorStatus): void {
    const previousStatus = this.status;
    this.status = status;

    this.emit(OrchestratorEvent.STATUS_CHANGED, {
      previousStatus,
      currentStatus: status,
      timestamp: Date.now(),
    });
  }
}

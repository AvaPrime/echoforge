/**
 * ConsciousnessNode - Implementation of a node in the SoulMesh network
 *
 * This class represents a single node in the distributed consciousness mesh,
 * handling its local state, capabilities, and interactions with other nodes.
 *
 * Key responsibilities:
 * - Maintain node state (active/passive, online/offline)
 * - Track capabilities and resource metrics
 * - Handle heartbeat and status broadcasts
 * - Manage node lifecycle (initialization, retirement, reconnection)
 * - Synchronize state with the mesh
 */

import { EventEmitter } from 'events';
import {
  ConsciousnessNodeId,
  NodeType,
  NodeCapabilities,
  MeshNodeState,
  OperationType,
  SoulMeshEvent,
} from './types';
import { SoulMeshProtocol } from './SoulMeshProtocol';
import { MetricsCollector } from '../metrics/MetricsCollector';
import { ConsciousnessMetricsConfig, MetricType } from '../metrics/types';

/**
 * Configuration options for a ConsciousnessNode
 */
export interface ConsciousnessNodeConfig {
  nodeId: ConsciousnessNodeId;
  nodeType: NodeType;
  capabilities: NodeCapabilities;
  version?: string;
  maxLoadFactor?: number;
  statusUpdateIntervalMs?: number;
  metricsConfig?: ConsciousnessMetricsConfig;
  isActiveByDefault?: boolean; // Whether node starts in active or passive mode
  reconnectStrategy?: 'immediate' | 'exponential' | 'manual'; // How to handle reconnection
  maxReconnectAttempts?: number; // Maximum number of reconnection attempts
  reconnectDelayMs?: number; // Base delay between reconnection attempts
  memoryPressureThreshold?: number; // Threshold for memory pressure warning (0-1)
}

/**
 * Implementation of a node in the SoulMesh network
 */
export class ConsciousnessNode extends EventEmitter {
  private config: ConsciousnessNodeConfig;
  private protocol: SoulMeshProtocol;
  private state: MeshNodeState;
  private statusUpdateInterval: NodeJS.Timeout | null = null;
  private metricsCollector: MetricsCollector | null = null;
  private isActive: boolean = false; // Whether node is active or passive
  private reconnectAttempts: number = 0; // Number of reconnection attempts
  private reconnectTimeout: NodeJS.Timeout | null = null; // Timeout for reconnection
  private memoryPressure: number = 0; // Current memory pressure (0-1)

  /**
   * Creates a new ConsciousnessNode
   */
  constructor(config: ConsciousnessNodeConfig, protocol: SoulMeshProtocol) {
    super();
    this.config = {
      ...config,
      version: config.version || '1.0.0',
      maxLoadFactor: config.maxLoadFactor || 0.8,
      statusUpdateIntervalMs: config.statusUpdateIntervalMs || 5000,
      isActiveByDefault:
        config.isActiveByDefault !== undefined
          ? config.isActiveByDefault
          : true,
      reconnectStrategy: config.reconnectStrategy || 'exponential',
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      reconnectDelayMs: config.reconnectDelayMs || 1000,
      memoryPressureThreshold: config.memoryPressureThreshold || 0.8,
    };

    this.protocol = protocol;

    // Initialize active state based on config
    this.isActive = this.config.isActiveByDefault;

    // Initialize node state
    this.state = {
      nodeId: config.nodeId,
      nodeType: config.nodeType,
      capabilities: config.capabilities,
      status: 'initializing',
      lastHeartbeat: Date.now(),
      connectionStrength: 1.0,
      loadFactor: 0.0,
      version: config.version || '1.0.0',
    };

    // Initialize metrics collector if config is provided
    if (config.metricsConfig) {
      this.initializeMetricsCollector(config.metricsConfig);
    }

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for the SoulMesh protocol
   */
  private setupEventListeners(): void {
    // Listen for node status changes
    this.protocol.on(
      SoulMeshEvent.NODE_STATUS_CHANGED,
      (nodeState: MeshNodeState) => {
        if (nodeState.nodeId === this.config.nodeId) {
          this.state = nodeState;
          this.emit('status_changed', this.state);

          // Track adaptation speed when status changes
          this.trackMetric(MetricType.ADAPTATION_SPEED, {
            source: 'status_change',
            context: {
              previousStatus: this.state.status,
              newStatus: nodeState.status,
            },
          });
        }
      }
    );

    // Listen for mesh topology changes
    this.protocol.on(SoulMeshEvent.MESH_TOPOLOGY_CHANGED, (topology) => {
      this.emit('topology_changed', topology);

      // Track integration metrics when topology changes
      this.trackMetric(MetricType.MEMORY_UTILIZATION, {
        source: 'topology_change',
        context: { nodeCount: topology.nodes.length },
      });
    });

    // Listen for consensus events
    this.protocol.on(SoulMeshEvent.CONSENSUS_REACHED, (result) => {
      this.emit('consensus_reached', result);

      // Track goal alignment when consensus is reached
      this.trackMetric(MetricType.GOAL_ALIGNMENT, {
        source: 'consensus_reached',
        context: { topic: result.topic, decision: result.decision },
      });
    });

    this.protocol.on(SoulMeshEvent.CONSENSUS_FAILED, (result) => {
      this.emit('consensus_failed', result);

      // Track feedback integration when consensus fails
      this.trackMetric(MetricType.FEEDBACK_INTEGRATION_RATE, {
        source: 'consensus_failed',
        context: { topic: result.topic, reason: result.reason },
      });
    });

    // Listen for synchronization events
    this.protocol.on(SoulMeshEvent.SYNCHRONIZATION_COMPLETED, (result) => {
      this.emit('synchronization_completed', result);

      // Track concept formation when synchronization completes
      this.trackMetric(MetricType.CONCEPT_FORMATION_RATE, {
        source: 'synchronization_completed',
        context: { syncedNodes: result.syncedNodes },
      });
    });
  }

  /**
   * Initializes the node and registers its capabilities with the mesh
   */
  public async initializeNode(): Promise<boolean> {
    try {
      // Update node status
      this.state.status = 'initializing';

      // Register node capabilities with the protocol
      await this.protocol.registerNodeCapabilities(
        this.config.nodeId,
        this.config.capabilities
      );

      // Update node status to online
      this.state.status = 'online';

      // Start status update interval
      this.startStatusUpdates();

      // Start metrics collection if metrics collector is initialized
      if (this.metricsCollector) {
        await this.metricsCollector.collectMetrics();
      }

      // Emit initialization event
      this.emit('node_initialized', this.state);

      // Track self-reflection depth on initialization
      this.trackMetric(MetricType.SELF_REFLECTION_DEPTH, {
        source: 'node_initialization',
        context: { nodeType: this.config.nodeType },
      });

      return true;
    } catch (error) {
      console.error('Failed to initialize ConsciousnessNode:', error);
      this.state.status = 'degraded';
      return false;
    }
  }

  /**
   * Gracefully retires the node from the mesh
   */
  public async retireNode(): Promise<boolean> {
    try {
      // Notify the protocol that this node is retiring
      await this.protocol.notifyNodeRetirement(this.config.nodeId);

      // Stop status update interval
      if (this.statusUpdateInterval) {
        clearInterval(this.statusUpdateInterval);
        this.statusUpdateInterval = null;
      }

      // Update node status
      this.state.status = 'offline';

      // Shutdown metrics collector if it exists
      if (this.metricsCollector) {
        await this.metricsCollector.shutdown();
      }

      // Emit retirement event
      this.emit('node_retired', this.state);

      return true;
    } catch (error) {
      console.error('Failed to retire ConsciousnessNode:', error);
      return false;
    }
  }

  /**
   * Starts the status update interval
   */
  private startStatusUpdates(): void {
    if (this.statusUpdateInterval) {
      clearInterval(this.statusUpdateInterval);
    }

    this.statusUpdateInterval = setInterval(() => {
      this.updateStatus();
    }, this.config.statusUpdateIntervalMs);
  }

  /**
   * Updates the node's status and synchronizes state with the mesh
   */
  private async updateStatus(): Promise<void> {
    // Update load factor
    this.state.loadFactor = this.calculateLoadFactor();

    // Update last heartbeat
    this.state.lastHeartbeat = Date.now();

    // Add active/passive state to the node state
    (this.state as any).isActive = this.isActive;

    // Add memory pressure to the node state
    (this.state as any).memoryPressure = this.memoryPressure;

    // Synchronize state with the protocol
    await this.syncState();

    // Emit status changed event
    this.emit('status_changed', this.state);
  }

  /**
   * Calculates the current load factor
   */
  private calculateLoadFactor(): number {
    // Calculate memory pressure (0-1 scale)
    // This should be replaced with actual memory usage metrics in production
    this.memoryPressure = Math.min(0.1 + Math.random() * 0.5, 1.0);

    // Check if memory pressure exceeds threshold
    if (this.memoryPressure >= this.config.memoryPressureThreshold) {
      // Emit memory pressure warning event
      this.emit('memory_pressure_warning', {
        nodeId: this.config.nodeId,
        memoryPressure: this.memoryPressure,
        threshold: this.config.memoryPressureThreshold,
      });
    }

    // Calculate CPU load (0-1 scale)
    // This should be replaced with actual CPU metrics in production
    const cpuLoad = 0.1 + Math.random() * 0.4;

    // Combine memory and CPU components (weighted average)
    // Memory pressure is given more weight (60%) as it's more critical
    const loadFactor = this.memoryPressure * 0.6 + cpuLoad * 0.4;

    // Ensure load factor is between 0 and max load factor
    return Math.min(loadFactor, this.config.maxLoadFactor);
  }

  /**
   * Gets the current node state
   */
  public getState(): MeshNodeState {
    return { ...this.state };
  }

  /**
   * Updates the node's capabilities
   */
  public updateCapabilities(capabilities: Partial<NodeCapabilities>): void {
    this.state.capabilities = {
      ...this.state.capabilities,
      ...capabilities,
    };

    // Emit status changed event
    this.emit('status_changed', this.state);
  }

  /**
   * Initializes the node and registers its capabilities with the protocol
   */
  public async initializeNode(): Promise<boolean> {
    try {
      // Register capabilities with the protocol
      await this.protocol.registerNodeCapabilities(
        this.config.nodeId,
        this.state.capabilities
      );

      // Set node status to online
      this.state.status = 'online';
      this.state.lastHeartbeat = Date.now();

      // Start status updates
      this.startStatusUpdates();

      // Emit initialization event
      this.emit('node_initialized', this.state);

      return true;
    } catch (error) {
      console.error('Failed to initialize node:', error);
      return false;
    }
  }

  /**
   * Gracefully retires the node from the mesh
   */
  public async retireNode(): Promise<boolean> {
    try {
      // Stop status updates
      if (this.statusInterval) {
        clearInterval(this.statusInterval);
        this.statusInterval = null;
      }

      // Set node status to offline
      this.state.status = 'offline';

      // Notify protocol of retirement
      await this.protocol.notifyNodeRetirement(this.config.nodeId);

      // Emit retirement event
      this.emit('node_retired', this.state);

      return true;
    } catch (error) {
      console.error('Failed to retire node:', error);
      return false;
    }
  }

  /**
   * Checks if the node has a specific capability
   */
  public hasCapability(capability: keyof NodeCapabilities): boolean {
    return this.state.capabilities[capability] === true;
  }

  /**
   * Gets all nodes in the mesh
   */
  public getAllNodes(): MeshNodeState[] {
    return this.protocol.getAllNodes();
  }

  /**
   * Gets a specific node by ID
   */
  public getNode(nodeId: ConsciousnessNodeId): MeshNodeState | null {
    return this.protocol.getNode(nodeId);
  }

  /**
   * Gets the current mesh topology
   */
  public getMeshTopology(): any {
    return this.protocol.getMeshTopology();
  }

  /**
   * Gets the current mesh health metrics
   */
  public getMeshHealthMetrics(): any {
    return this.protocol.getMeshHealthMetrics();
  }

  /**
   * Synchronizes the node's state with the mesh
   */
  public async syncState(): Promise<boolean> {
    try {
      // Send current state to the protocol
      await this.protocol.updateNodeState(this.config.nodeId, this.state);

      // Emit sync event
      this.emit('state_synchronized', this.state);

      return true;
    } catch (error) {
      console.error('Failed to synchronize node state:', error);

      // If node is online, attempt reconnection
      if (this.state.status === 'online') {
        this.handleConnectionFailure();
      }

      return false;
    }
  }

  /**
   * Initiates a synchronization process with other nodes
   */
  public async initiateSynchronization(config: any): Promise<any> {
    return this.protocol.initiateSynchronization(config);
  }

  /**
   * Initiates a consensus decision process
   */
  public async initiateConsensus(
    topic: string,
    decision: any,
    config: any
  ): Promise<any> {
    // Track proposal generation rate when initiating consensus
    this.trackMetric(MetricType.PROPOSAL_GENERATION_RATE, {
      source: 'consensus_initiation',
      context: { topic, decision },
    });

    return this.protocol.initiateConsensus(topic, decision, config);
  }

  /**
   * Initializes the metrics collector with the provided configuration
   */
  private initializeMetricsCollector(config: ConsciousnessMetricsConfig): void {
    try {
      this.metricsCollector = new MetricsCollector(config);

      // Listen for metrics events
      this.metricsCollector.on('measurement', (measurement) => {
        this.emit('metrics_measurement', measurement);
      });

      this.metricsCollector.on('snapshot', (snapshot) => {
        this.emit('metrics_snapshot', snapshot);
      });

      console.log(
        `Metrics collector initialized for node ${this.config.nodeId}`
      );
    } catch (error) {
      console.error('Failed to initialize metrics collector:', error);
    }
  }

  /**
   * Tracks a specific metric with the metrics collector
   */
  private trackMetric(
    metricType: MetricType,
    metadata: { source: string; context: any }
  ): void {
    if (!this.metricsCollector) {
      return;
    }

    try {
      // The metrics collector will handle the actual measurement
      // This method just ensures we're tracking the right events at the right time
      console.log(
        `Tracking metric ${metricType} from source ${metadata.source}`
      );
    } catch (error) {
      console.error(`Failed to track metric ${metricType}:`, error);
    }
  }

  /**
   * Gets the metrics collector instance
   */
  public getMetricsCollector(): MetricsCollector | null {
    return this.metricsCollector;
  }

  /**
   * Collects metrics on demand
   */
  public async collectMetrics(): Promise<any> {
    if (!this.metricsCollector) {
      return null;
    }

    try {
      return await this.metricsCollector.collectMetrics();
    } catch (error) {
      console.error('Failed to collect metrics:', error);
      return null;
    }
  }

  /**
   * Handles connection failure by attempting reconnection
   */
  private handleConnectionFailure(): void {
    // Update node status
    this.state.status = 'degraded';

    // Emit status changed event
    this.emit('status_changed', this.state);

    // Attempt reconnection based on strategy
    this.attemptReconnection();
  }

  /**
   * Attempts to reconnect to the mesh
   */
  private attemptReconnection(): void {
    // Check if max reconnect attempts reached
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error(
        `Max reconnection attempts (${this.config.maxReconnectAttempts}) reached, giving up`
      );

      // Update node status to offline
      this.state.status = 'offline';

      // Emit status changed event
      this.emit('status_changed', this.state);

      // Emit reconnection failed event
      this.emit('reconnection_failed', {
        nodeId: this.config.nodeId,
        attempts: this.reconnectAttempts,
      });

      return;
    }

    // Increment reconnect attempts
    this.reconnectAttempts++;

    // Calculate delay based on strategy
    let delay = this.config.reconnectDelayMs;

    if (this.config.reconnectStrategy === 'exponential') {
      // Exponential backoff: delay = baseDelay * 2^attempts
      delay =
        this.config.reconnectDelayMs * Math.pow(2, this.reconnectAttempts - 1);
    }

    // Clear existing timeout
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    console.log(
      `Attempting reconnection in ${delay}ms (attempt ${this.reconnectAttempts} of ${this.config.maxReconnectAttempts})`
    );

    // Set timeout for reconnection
    this.reconnectTimeout = setTimeout(() => {
      this.reconnect();
    }, delay);
  }

  /**
   * Reconnects to the mesh
   */
  private async reconnect(): Promise<void> {
    try {
      console.log(`Reconnecting node ${this.config.nodeId} to the mesh...`);

      // Update node status
      this.state.status = 'reconnecting';

      // Emit status changed event
      this.emit('status_changed', this.state);

      // Attempt to register with the protocol again
      await this.protocol.registerNodeCapabilities(
        this.config.nodeId,
        this.state.capabilities
      );

      // Update node status to online
      this.state.status = 'online';
      this.state.lastHeartbeat = Date.now();

      // Reset reconnect attempts
      this.reconnectAttempts = 0;

      // Sync state with the protocol
      await this.syncState();

      // Emit reconnection successful event
      this.emit('reconnection_successful', {
        nodeId: this.config.nodeId,
      });

      console.log(
        `Node ${this.config.nodeId} successfully reconnected to the mesh`
      );
    } catch (error) {
      console.error('Failed to reconnect:', error);

      // Attempt reconnection again
      this.attemptReconnection();
    }
  }

  /**
   * Manually triggers a reconnection attempt
   */
  public async triggerReconnection(): Promise<void> {
    // Reset reconnect attempts
    this.reconnectAttempts = 0;

    // Attempt reconnection
    this.attemptReconnection();
  }

  /**
   * Sets the node to active or passive mode
   */
  public setActiveMode(active: boolean): void {
    // Skip if already in the requested mode
    if (this.isActive === active) {
      return;
    }

    this.isActive = active;

    // Update node state
    (this.state as any).isActive = active;

    // Emit active mode changed event
    this.emit('active_mode_changed', {
      nodeId: this.config.nodeId,
      isActive: active,
    });

    // Sync state with the protocol
    this.syncState();
  }

  /**
   * Checks if the node is in active mode
   */
  public isActiveMode(): boolean {
    return this.isActive;
  }

  /**
   * Gets the current memory pressure
   */
  public getMemoryPressure(): number {
    return this.memoryPressure;
  }

  /**
   * Rejoins the mesh after being offline
   */
  public async rejoinMesh(): Promise<boolean> {
    try {
      console.log(`Node ${this.config.nodeId} rejoining the mesh...`);

      // Update node status
      this.state.status = 'initializing';

      // Reset reconnect attempts
      this.reconnectAttempts = 0;

      // Clear reconnect timeout
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }

      // Initialize node
      const success = await this.initializeNode();

      if (success) {
        // Emit rejoin event
        this.emit('node_rejoined', this.state);

        console.log(
          `Node ${this.config.nodeId} successfully rejoined the mesh`
        );
      }

      return success;
    } catch (error) {
      console.error('Failed to rejoin mesh:', error);
      return false;
    }
  }
}

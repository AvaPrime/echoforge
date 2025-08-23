/**
 * HeartbeatManager - Manages heartbeat and status broadcasts for the SoulMesh Protocol
 *
 * This component handles the regular emission of heartbeats and status updates
 * from nodes in the SoulMesh network, as well as tracking node health and availability.
 */

import { EventEmitter } from 'events';
import {
  ConsciousnessNodeId,
  HeartbeatData,
  MeshNodeState,
  SoulMeshEvent,
} from './types';
import { SoulMeshProtocol } from './SoulMeshProtocol';

/**
 * Configuration options for the HeartbeatManager
 */
export interface HeartbeatManagerConfig {
  heartbeatIntervalMs: number; // Interval between heartbeats (default: 5000ms)
  nodeTimeoutMs: number; // Time after which a node is considered unresponsive (default: 15000ms)
  degradedThresholdMs: number; // Time after which a node is marked as degraded (default: 10000ms)
  healthMetricsEnabled: boolean; // Whether to include detailed health metrics in heartbeats
}

/**
 * Manages heartbeat and status broadcasts for the SoulMesh Protocol
 */
export class HeartbeatManager extends EventEmitter {
  private protocol: SoulMeshProtocol;
  private config: HeartbeatManagerConfig;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private missedHeartbeats: Map<ConsciousnessNodeId, number> = new Map();
  private lastHeartbeatTimes: Map<ConsciousnessNodeId, number> = new Map();
  private isRunning: boolean = false;

  /**
   * Creates a new HeartbeatManager
   */
  constructor(
    protocol: SoulMeshProtocol,
    config: Partial<HeartbeatManagerConfig> = {}
  ) {
    super();
    this.protocol = protocol;
    this.config = {
      heartbeatIntervalMs: config.heartbeatIntervalMs || 5000, // 5 seconds
      nodeTimeoutMs: config.nodeTimeoutMs || 15000, // 15 seconds
      degradedThresholdMs: config.degradedThresholdMs || 10000, // 10 seconds
      healthMetricsEnabled:
        config.healthMetricsEnabled !== undefined
          ? config.healthMetricsEnabled
          : true,
    };

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for the SoulMesh protocol
   */
  private setupEventListeners(): void {
    // Listen for heartbeats from other nodes
    this.protocol.on(
      SoulMeshEvent.HEARTBEAT,
      (heartbeatData: HeartbeatData) => {
        this.handleHeartbeat(heartbeatData);
      }
    );

    // Listen for node join events
    this.protocol.on(SoulMeshEvent.NODE_JOINED, (nodeState: MeshNodeState) => {
      this.initializeNodeTracking(nodeState.nodeId);
    });

    // Listen for node leave events
    this.protocol.on(SoulMeshEvent.NODE_LEFT, (nodeId: ConsciousnessNodeId) => {
      this.cleanupNodeTracking(nodeId);
    });
  }

  /**
   * Initializes tracking for a node
   */
  private initializeNodeTracking(nodeId: ConsciousnessNodeId): void {
    this.lastHeartbeatTimes.set(nodeId, Date.now());
    this.missedHeartbeats.set(nodeId, 0);
  }

  /**
   * Cleans up tracking for a node
   */
  private cleanupNodeTracking(nodeId: ConsciousnessNodeId): void {
    this.lastHeartbeatTimes.delete(nodeId);
    this.missedHeartbeats.delete(nodeId);
  }

  /**
   * Handles a heartbeat from a node
   */
  private handleHeartbeat(heartbeatData: HeartbeatData): void {
    const { nodeId, timestamp, status, loadFactor, healthStatus } =
      heartbeatData;

    // Skip self heartbeats
    if (nodeId === this.protocol['config'].nodeId) {
      return;
    }

    // Update last heartbeat time
    this.lastHeartbeatTimes.set(nodeId, timestamp);

    // Reset missed heartbeats counter
    this.missedHeartbeats.set(nodeId, 0);

    // Update node state in protocol
    const nodeState = this.protocol['nodes'].get(nodeId);
    if (nodeState) {
      nodeState.status = status;
      nodeState.loadFactor = loadFactor;
      nodeState.lastHeartbeat = timestamp;

      // Emit node status changed event
      this.emit('node_status_updated', {
        nodeId,
        status,
        loadFactor,
        healthStatus,
      });
    }
  }

  /**
   * Starts the heartbeat mechanism
   */
  public start(): void {
    if (this.isRunning) {
      return;
    }

    this.isRunning = true;

    // Start heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.broadcastHeartbeat();
      this.checkMissedHeartbeats();
    }, this.config.heartbeatIntervalMs);

    console.log(
      `HeartbeatManager started with interval ${this.config.heartbeatIntervalMs}ms`
    );
  }

  /**
   * Stops the heartbeat mechanism
   */
  public stop(): void {
    if (!this.isRunning) {
      return;
    }

    this.isRunning = false;

    // Clear heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }

    console.log('HeartbeatManager stopped');
  }

  /**
   * Broadcasts a heartbeat with the current node status
   */
  private broadcastHeartbeat(): void {
    // Get self node state
    const selfNodeId = this.protocol['config'].nodeId;
    const selfNode = this.protocol['nodes'].get(selfNodeId);

    if (!selfNode) {
      console.error('Cannot broadcast heartbeat: self node not found');
      return;
    }

    // Collect health metrics
    const healthMetrics = this.collectHealthMetrics();

    // Create heartbeat data
    const heartbeatData: HeartbeatData = {
      nodeId: selfNodeId,
      timestamp: Date.now(),
      status: selfNode.status,
      loadFactor: selfNode.loadFactor,
      healthStatus: healthMetrics,
    };

    // Emit heartbeat event through protocol
    this.protocol.emit(SoulMeshEvent.HEARTBEAT, heartbeatData);

    // Update self last heartbeat time
    this.lastHeartbeatTimes.set(selfNodeId, heartbeatData.timestamp);

    // Update self node state
    selfNode.lastHeartbeat = heartbeatData.timestamp;
  }

  /**
   * Collects health metrics for the current node
   */
  private collectHealthMetrics(): HeartbeatData['healthStatus'] {
    if (!this.config.healthMetricsEnabled) {
      return {};
    }

    // In a real implementation, these would be actual system metrics
    // For now, we'll use placeholder values
    return {
      cpuUsage: Math.random() * 50 + 10, // 10-60% CPU usage
      memoryUsage: Math.random() * 40 + 20, // 20-60% memory usage
      operationQueueLength: this.protocol['operations']
        ? this.protocol['operations'].size
        : 0,
      errorCount: 0, // Would track actual errors in production
    };
  }

  /**
   * Checks for missed heartbeats from other nodes
   */
  private checkMissedHeartbeats(): void {
    const now = Date.now();

    // Get all nodes from protocol
    const nodes = this.protocol['nodes'];

    // Check each node's last heartbeat
    for (const [nodeId, nodeState] of nodes.entries()) {
      // Skip self
      if (nodeId === this.protocol['config'].nodeId) {
        continue;
      }

      const lastHeartbeatTime = this.lastHeartbeatTimes.get(nodeId) || 0;
      const timeSinceLastHeartbeat = now - lastHeartbeatTime;

      // Check if node is degraded
      if (
        timeSinceLastHeartbeat > this.config.degradedThresholdMs &&
        nodeState.status === 'online'
      ) {
        nodeState.status = 'degraded';

        // Emit node status changed event
        this.protocol.emit(SoulMeshEvent.NODE_STATUS_CHANGED, nodeState);

        console.log(
          `Node ${nodeId} marked as degraded (no heartbeat for ${timeSinceLastHeartbeat}ms)`
        );
      }

      // Check if node is unresponsive
      if (timeSinceLastHeartbeat > this.config.nodeTimeoutMs) {
        // Increment missed heartbeats counter
        const missedCount = (this.missedHeartbeats.get(nodeId) || 0) + 1;
        this.missedHeartbeats.set(nodeId, missedCount);

        // If node was not already offline, mark as offline
        if (nodeState.status !== 'offline') {
          nodeState.status = 'offline';

          // Emit node status changed event
          this.protocol.emit(SoulMeshEvent.NODE_STATUS_CHANGED, nodeState);

          console.log(
            `Node ${nodeId} marked as offline (no heartbeat for ${timeSinceLastHeartbeat}ms)`
          );
        }
      }
    }
  }

  /**
   * Gets the last heartbeat time for a node
   */
  public getLastHeartbeatTime(nodeId: ConsciousnessNodeId): number {
    return this.lastHeartbeatTimes.get(nodeId) || 0;
  }

  /**
   * Gets the number of missed heartbeats for a node
   */
  public getMissedHeartbeats(nodeId: ConsciousnessNodeId): number {
    return this.missedHeartbeats.get(nodeId) || 0;
  }

  /**
   * Gets all nodes with their heartbeat status
   */
  public getNodeHeartbeatStatus(): Array<{
    nodeId: ConsciousnessNodeId;
    lastHeartbeat: number;
    missedHeartbeats: number;
    timeSinceLastHeartbeat: number;
  }> {
    const now = Date.now();
    const result = [];

    for (const [nodeId, lastHeartbeat] of this.lastHeartbeatTimes.entries()) {
      result.push({
        nodeId,
        lastHeartbeat,
        missedHeartbeats: this.missedHeartbeats.get(nodeId) || 0,
        timeSinceLastHeartbeat: now - lastHeartbeat,
      });
    }

    return result;
  }
}

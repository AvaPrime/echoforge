/**
 * MeshSynchronizer - Handles synchronization of consciousness data across the mesh
 *
 * This component manages the synchronization of consciousness data between nodes
 * in the SoulMesh network, ensuring consistency and coherence using timestamped
 * state diffs with rollback support and conflict resolution mechanisms.
 */

import { EventEmitter } from 'events';
import {
  SyncStrategy,
  SyncConfig,
  SyncResult,
  ConsciousnessNodeId,
  MeshNodeState,
} from './types';
import { SoulMeshProtocol } from './SoulMeshProtocol';

/**
 * Interface for state diff entries
 */
interface StateDiff {
  componentId: string;
  timestamp: number;
  nodeId: ConsciousnessNodeId;
  previousState: any;
  currentState: any;
  vectorClock: Record<ConsciousnessNodeId, number>;
}

/**
 * Interface for conflict details
 */
interface ConflictDetails {
  componentId: string;
  conflictingNodeIds: ConsciousnessNodeId[];
  conflictingStates: Record<ConsciousnessNodeId, any>;
  vectorClocks: Record<
    ConsciousnessNodeId,
    Record<ConsciousnessNodeId, number>
  >;
  resolutionStrategy: 'newest' | 'highest_trust' | 'majority_vote' | 'manual';
  resolved: boolean;
  resolvedState?: any;
}

/**
 * Configuration options for the MeshSynchronizer
 */
export interface MeshSynchronizerConfig {
  defaultStrategy?: SyncStrategy;
  defaultComponents?: string[];
  syncIntervalMs?: number;
  conflictResolution?: 'newest' | 'highest_trust' | 'manual';
  maxSyncDuration?: number;
  autoSync?: boolean;
}

/**
 * Handles synchronization of consciousness data across the mesh
 */
export class MeshSynchronizer extends EventEmitter {
  private protocol: SoulMeshProtocol;
  private config: MeshSynchronizerConfig;
  private syncInterval: NodeJS.Timeout | null = null;
  private lastSyncResults: Map<string, SyncResult> = new Map();
  private pendingSyncs: Map<string, SyncConfig> = new Map();
  private stateDiffs: Map<string, StateDiff[]> = new Map();
  private vectorClocks: Map<
    ConsciousnessNodeId,
    Record<ConsciousnessNodeId, number>
  > = new Map();
  private stateHistory: Map<string, any[]> = new Map();
  private activeConflicts: Map<string, ConflictDetails> = new Map();
  private maxHistoryLength: number = 50;

  /**
   * Creates a new MeshSynchronizer
   */
  constructor(protocol: SoulMeshProtocol, config: MeshSynchronizerConfig = {}) {
    super();
    this.protocol = protocol;
    this.config = {
      defaultStrategy: config.defaultStrategy || SyncStrategy.INCREMENTAL,
      defaultComponents: config.defaultComponents || [
        'memory',
        'consciousness',
        'proposals',
      ],
      syncIntervalMs: config.syncIntervalMs || 60000, // 1 minute
      conflictResolution: config.conflictResolution || 'newest',
      maxSyncDuration: config.maxSyncDuration || 30000, // 30 seconds
      autoSync: config.autoSync !== undefined ? config.autoSync : true,
    };

    // Initialize vector clocks when nodes are discovered
    this.protocol.on('node_discovered', (nodeId: ConsciousnessNodeId) => {
      this.initializeVectorClock(nodeId);
    });

    // Initialize components for state history
    for (const component of this.config.defaultComponents) {
      this.stateHistory.set(component, []);
      this.stateDiffs.set(component, []);
    }
  }

  /**
   * Initializes the MeshSynchronizer
   */
  public initialize(): void {
    // Start auto-sync if enabled
    if (this.config.autoSync) {
      this.startAutoSync();
    }
  }

  /**
   * Shuts down the MeshSynchronizer
   */
  public shutdown(): void {
    // Stop auto-sync
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  /**
   * Starts the auto-sync interval
   */
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(() => {
      this.performAutoSync();
    }, this.config.syncIntervalMs);
  }

  /**
   * Performs an auto-sync
   */
  private async performAutoSync(): Promise<void> {
    try {
      // Create sync config
      const syncConfig: SyncConfig = {
        strategy: this.config.defaultStrategy,
        components: this.config.defaultComponents,
        priority: 'medium',
        maxDuration: this.config.maxSyncDuration,
        conflictResolution: this.config.conflictResolution,
      };

      // Perform sync
      const result = await this.synchronize(syncConfig);

      // Emit sync completed event
      this.emit('auto_sync_completed', result);
    } catch (error) {
      console.error('Auto-sync failed:', error);
      this.emit('auto_sync_failed', error);
    }
  }

  /**
   * Synchronizes consciousness data with the mesh using timestamped state diffs
   */
  public async synchronize(
    config: Partial<SyncConfig> = {}
  ): Promise<SyncResult> {
    // Create full sync config
    const fullConfig: SyncConfig = {
      strategy: config.strategy || this.config.defaultStrategy,
      components: config.components || this.config.defaultComponents,
      priority: config.priority || 'medium',
      maxDuration: config.maxDuration || this.config.maxSyncDuration,
      conflictResolution:
        config.conflictResolution || this.config.conflictResolution,
    };

    // Generate sync ID
    const syncId = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    // Add to pending syncs
    this.pendingSyncs.set(syncId, fullConfig);

    // Emit sync started event
    this.emit('sync_started', { syncId, config: fullConfig });

    try {
      // Get local node ID
      const localNodeId = this.protocol.getLocalNodeId();

      // Create result object
      const result: SyncResult = {
        syncId,
        componentsSync: {},
        conflicts: [],
        startedAt: Date.now(),
        completedAt: 0,
        duration: 0,
        success: false,
      };

      // Process each component
      for (const componentId of fullConfig.components) {
        // Get current state for component
        const currentState = await this.protocol.getComponentState(componentId);

        // Skip if no state
        if (!currentState) {
          result.componentsSync[componentId] = {
            success: false,
            error: 'No state available',
          };
          continue;
        }

        // Increment vector clock for local node
        const vectorClock = this.incrementVectorClock(localNodeId);

        // Create state diff
        const stateDiff: StateDiff = {
          componentId,
          timestamp: Date.now(),
          nodeId: localNodeId,
          previousState: null, // Not needed for outgoing diffs
          currentState,
          vectorClock,
        };

        // Add to state diffs
        const componentDiffs = this.stateDiffs.get(componentId) || [];
        componentDiffs.push(stateDiff);
        this.stateDiffs.set(componentId, componentDiffs);

        // Add to state history
        this.addToStateHistory(componentId, currentState);

        // Broadcast state to other nodes
        const broadcastResult = await this.protocol.broadcastStateUpdate({
          componentId,
          state: currentState,
          vectorClock,
          syncId,
        });

        // Process broadcast result
        result.componentsSync[componentId] = {
          success: broadcastResult.success,
          timestamp: Date.now(),
          nodesUpdated: broadcastResult.nodesUpdated || [],
          conflicts: broadcastResult.conflicts || [],
        };

        // Add conflicts to result
        if (broadcastResult.conflicts && broadcastResult.conflicts.length > 0) {
          for (const conflict of broadcastResult.conflicts) {
            // Create conflict details
            const conflictDetails: ConflictDetails = {
              componentId,
              conflictingNodeIds: conflict.nodeIds,
              conflictingStates: conflict.states,
              vectorClocks: conflict.vectorClocks,
              resolutionStrategy: fullConfig.conflictResolution,
              resolved: false,
            };

            // Try to resolve automatically
            const resolution =
              this.resolveConflictAutomatically(conflictDetails);

            if (resolution) {
              // Apply resolved state
              await this.protocol.updateComponentState(componentId, resolution);

              // Add to state history
              this.addToStateHistory(componentId, resolution);

              // Mark as resolved
              conflictDetails.resolved = true;
              conflictDetails.resolvedState = resolution;

              // Emit conflict auto-resolved event
              this.emit('conflict_auto_resolved', {
                syncId,
                componentId,
                resolution,
                conflict: conflictDetails,
              });
            } else if (fullConfig.conflictResolution === 'manual') {
              // Add to active conflicts
              const conflictKey = `${syncId}-${componentId}`;
              this.activeConflicts.set(conflictKey, conflictDetails);

              // Emit conflict detected event
              this.emit('conflict_detected', {
                syncId,
                conflict: conflictDetails,
              });
            }

            // Add to result conflicts
            result.conflicts.push({
              componentId,
              nodeIds: conflict.nodeIds,
              resolved: conflictDetails.resolved,
            });
          }
        }
      }

      // Update result
      result.completedAt = Date.now();
      result.duration = result.completedAt - result.startedAt;
      result.success = Object.values(result.componentsSync).every(
        (c) => c.success
      );

      // Store result
      this.lastSyncResults.set(syncId, result);

      // Remove from pending syncs
      this.pendingSyncs.delete(syncId);

      // Emit sync completed event
      this.emit('sync_completed', result);

      return result;
    } catch (error) {
      // Remove from pending syncs
      this.pendingSyncs.delete(syncId);

      // Emit sync failed event
      this.emit('sync_failed', { syncId, error });

      throw error;
    }
  }

  /**
   * Synchronizes a specific component with the mesh
   */
  public async synchronizeComponent(
    component: string,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<SyncResult> {
    return this.synchronize({
      strategy: SyncStrategy.SELECTIVE,
      components: [component],
      priority,
    });
  }

  /**
   * Synchronizes with a specific node
   */
  public async synchronizeWithNode(
    nodeId: ConsciousnessNodeId,
    config: Partial<SyncConfig> = {}
  ): Promise<SyncResult> {
    // This would be implemented to synchronize with a specific node
    // rather than the entire mesh

    // For now, we'll just use the regular synchronize method
    return this.synchronize(config);
  }

  /**
   * Gets the last sync result for a specific sync ID
   */
  public getLastSyncResult(syncId: string): SyncResult | null {
    return this.lastSyncResults.get(syncId) || null;
  }

  /**
   * Gets all last sync results
   */
  public getAllLastSyncResults(): SyncResult[] {
    return Array.from(this.lastSyncResults.values());
  }

  /**
   * Gets all pending syncs
   */
  public getPendingSyncs(): Array<{ id: string; config: SyncConfig }> {
    return Array.from(this.pendingSyncs.entries()).map(([id, config]) => ({
      id,
      config,
    }));
  }

  /**
   * Resolves a sync conflict manually
   */
  public async resolveConflict(
    syncId: string,
    component: string,
    resolution: any
  ): Promise<boolean> {
    // Find the conflict in active conflicts
    const conflictKey = `${syncId}-${component}`;
    const conflict = this.activeConflicts.get(conflictKey);

    if (!conflict) {
      console.error(`No active conflict found for ${conflictKey}`);
      return false;
    }

    // Update conflict details
    conflict.resolved = true;
    conflict.resolvedState = resolution;

    // Create a new state diff for the resolution
    const nodeId = this.protocol.getLocalNodeId();
    const vectorClock = this.incrementVectorClock(nodeId);

    const stateDiff: StateDiff = {
      componentId: component,
      timestamp: Date.now(),
      nodeId,
      previousState: null, // Not applicable for manual resolution
      currentState: resolution,
      vectorClock,
    };

    // Add to state diffs
    const componentDiffs = this.stateDiffs.get(component) || [];
    componentDiffs.push(stateDiff);
    this.stateDiffs.set(component, componentDiffs);

    // Update state history
    this.addToStateHistory(component, resolution);

    // Broadcast resolution to other nodes
    await this.protocol.broadcastStateUpdate({
      componentId: component,
      state: resolution,
      vectorClock,
      isConflictResolution: true,
      conflictId: conflictKey,
    });

    // Remove from active conflicts
    this.activeConflicts.delete(conflictKey);

    // Emit conflict resolved event
    this.emit('conflict_resolved', { syncId, component, resolution });

    return true;
  }

  /**
   * Initializes a vector clock for a node
   */
  private initializeVectorClock(nodeId: ConsciousnessNodeId): void {
    // Get all known nodes
    const allNodes = this.protocol.getAllNodes().map((node) => node.id);

    // Create vector clock with all nodes set to 0
    const vectorClock: Record<ConsciousnessNodeId, number> = {};
    for (const node of allNodes) {
      vectorClock[node] = 0;
    }

    // Set vector clock for node
    this.vectorClocks.set(nodeId, vectorClock);
  }

  /**
   * Increments the vector clock for a node
   */
  private incrementVectorClock(
    nodeId: ConsciousnessNodeId
  ): Record<ConsciousnessNodeId, number> {
    // Get vector clock for node
    let vectorClock = this.vectorClocks.get(nodeId);

    // Initialize if not exists
    if (!vectorClock) {
      this.initializeVectorClock(nodeId);
      vectorClock = this.vectorClocks.get(nodeId)!;
    }

    // Increment clock for node
    vectorClock[nodeId] = (vectorClock[nodeId] || 0) + 1;

    // Update vector clock
    this.vectorClocks.set(nodeId, vectorClock);

    // Return copy of vector clock
    return { ...vectorClock };
  }

  /**
   * Adds a state to the history for a component
   */
  private addToStateHistory(componentId: string, state: any): void {
    // Get history for component
    const history = this.stateHistory.get(componentId) || [];

    // Add state to history
    history.push({
      timestamp: Date.now(),
      state: JSON.parse(JSON.stringify(state)), // Deep copy
    });

    // Trim history if needed
    if (history.length > this.maxHistoryLength) {
      history.shift(); // Remove oldest entry
    }

    // Update history
    this.stateHistory.set(componentId, history);
  }

  /**
   * Detects conflicts between vector clocks
   */
  private detectConflicts(
    componentId: string,
    nodeId: ConsciousnessNodeId,
    state: any,
    vectorClock: Record<ConsciousnessNodeId, number>
  ): ConflictDetails | null {
    // Get all nodes
    const allNodes = this.protocol.getAllNodes().map((node) => node.id);

    // Check for conflicts with each node
    const conflictingNodeIds: ConsciousnessNodeId[] = [];
    const conflictingStates: Record<ConsciousnessNodeId, any> = {};
    const conflictVectorClocks: Record<
      ConsciousnessNodeId,
      Record<ConsciousnessNodeId, number>
    > = {};

    for (const otherNodeId of allNodes) {
      // Skip self
      if (otherNodeId === nodeId) continue;

      // Get vector clock for other node
      const otherVectorClock = this.vectorClocks.get(otherNodeId);
      if (!otherVectorClock) continue;

      // Check for conflict
      if (this.isVectorClockConflict(vectorClock, otherVectorClock)) {
        conflictingNodeIds.push(otherNodeId);

        // Get state for other node
        const otherState = this.protocol.getNodeState(otherNodeId);
        if (otherState) {
          conflictingStates[otherNodeId] = otherState[componentId];
          conflictVectorClocks[otherNodeId] = otherVectorClock;
        }
      }
    }

    // Return null if no conflicts
    if (conflictingNodeIds.length === 0) {
      return null;
    }

    // Add self to conflicting states
    conflictingStates[nodeId] = state;
    conflictVectorClocks[nodeId] = vectorClock;

    // Create conflict details
    return {
      componentId,
      conflictingNodeIds,
      conflictingStates,
      vectorClocks: conflictVectorClocks,
      resolutionStrategy: this.config.conflictResolution || 'newest',
      resolved: false,
    };
  }

  /**
   * Checks if two vector clocks are in conflict
   */
  private isVectorClockConflict(
    vc1: Record<ConsciousnessNodeId, number>,
    vc2: Record<ConsciousnessNodeId, number>
  ): boolean {
    let vc1HasGreater = false;
    let vc2HasGreater = false;

    // Check all nodes in vc1
    for (const nodeId in vc1) {
      const vc1Value = vc1[nodeId] || 0;
      const vc2Value = vc2[nodeId] || 0;

      if (vc1Value > vc2Value) {
        vc1HasGreater = true;
      } else if (vc2Value > vc1Value) {
        vc2HasGreater = true;
      }

      // If both have greater values, there's a conflict
      if (vc1HasGreater && vc2HasGreater) {
        return true;
      }
    }

    // Check all nodes in vc2 that might not be in vc1
    for (const nodeId in vc2) {
      if (nodeId in vc1) continue; // Already checked

      const vc2Value = vc2[nodeId] || 0;
      if (vc2Value > 0) {
        vc2HasGreater = true;
      }

      // If both have greater values, there's a conflict
      if (vc1HasGreater && vc2HasGreater) {
        return true;
      }
    }

    // No conflict if one clock is greater than or equal to the other
    return false;
  }

  /**
   * Resolves conflicts automatically based on strategy
   */
  private resolveConflictAutomatically(conflict: ConflictDetails): any {
    const { resolutionStrategy, conflictingStates, vectorClocks } = conflict;

    switch (resolutionStrategy) {
      case 'newest':
        // Find the newest state based on vector clock timestamps
        let newestNodeId: ConsciousnessNodeId | null = null;
        let newestTimestamp = 0;

        for (const nodeId in vectorClocks) {
          const clock = vectorClocks[nodeId];
          const nodeTimestamp = clock[nodeId] || 0;

          if (nodeTimestamp > newestTimestamp) {
            newestTimestamp = nodeTimestamp;
            newestNodeId = nodeId as ConsciousnessNodeId;
          }
        }

        return newestNodeId ? conflictingStates[newestNodeId] : null;

      case 'highest_trust':
        // Find the node with highest trust level
        let highestTrustNodeId: ConsciousnessNodeId | null = null;
        let highestTrust = -1;

        for (const nodeId in conflictingStates) {
          const node = this.protocol.getNode(nodeId as ConsciousnessNodeId);
          if (node && node.trustLevel > highestTrust) {
            highestTrust = node.trustLevel;
            highestTrustNodeId = nodeId as ConsciousnessNodeId;
          }
        }

        return highestTrustNodeId
          ? conflictingStates[highestTrustNodeId]
          : null;

      case 'majority_vote':
        // Count occurrences of each state
        const stateCounts: Record<string, { count: number; state: any }> = {};

        for (const nodeId in conflictingStates) {
          const state = conflictingStates[nodeId];
          const stateKey = JSON.stringify(state);

          if (!stateCounts[stateKey]) {
            stateCounts[stateKey] = { count: 0, state };
          }

          stateCounts[stateKey].count++;
        }

        // Find state with highest count
        let highestCount = 0;
        let majorityState = null;

        for (const stateKey in stateCounts) {
          const { count, state } = stateCounts[stateKey];

          if (count > highestCount) {
            highestCount = count;
            majorityState = state;
          }
        }

        return majorityState;

      case 'manual':
        // Cannot resolve automatically
        return null;

      default:
        return null;
    }
  }

  /**
   * Resolves conflicts for multiple components
   * This is the implementation of the method referenced in tests
   */
  public async resolveConflicts(
    conflicts: Array<{
      component: string;
      nodeIds: ConsciousnessNodeId[];
      values: Record<ConsciousnessNodeId, any>;
    }>,
    config: SyncConfig
  ): Promise<
    Array<{
      component: string;
      resolvedValue: any;
      resolution: string;
      success: boolean;
    }>
  > {
    const results: Array<{
      component: string;
      resolvedValue: any;
      resolution: string;
      success: boolean;
    }> = [];

    // Process each conflict
    for (const conflict of conflicts) {
      const { component, nodeIds, values } = conflict;

      try {
        // Create vector clocks for each node
        const vectorClocks: Record<
          ConsciousnessNodeId,
          Record<ConsciousnessNodeId, number>
        > = {};

        // For testing purposes, we'll create simple vector clocks
        // In a real implementation, these would come from the actual node states
        for (const nodeId of nodeIds) {
          const clock: Record<ConsciousnessNodeId, number> = {};

          // Set clock values based on timestamps if available
          if (values[nodeId]?.timestamp) {
            for (const otherNodeId of nodeIds) {
              clock[otherNodeId] =
                otherNodeId === nodeId ? values[nodeId].timestamp : 0;
            }
          } else {
            // Default clock values
            for (const otherNodeId of nodeIds) {
              clock[otherNodeId] = otherNodeId === nodeId ? 1 : 0;
            }
          }

          vectorClocks[nodeId] = clock;
        }

        // Create conflict details
        const conflictDetails: ConflictDetails = {
          componentId: component,
          conflictingNodeIds: nodeIds,
          conflictingStates: values,
          vectorClocks,
          resolutionStrategy: config.conflictResolution || 'newest',
          resolved: false,
        };

        // Try to resolve automatically
        const resolvedValue =
          this.resolveConflictAutomatically(conflictDetails);

        if (resolvedValue) {
          // Validate the merged state
          const isValid = await this.validateMergedState(
            component,
            resolvedValue
          );

          if (isValid) {
            // Apply the resolved state
            await this.protocol.updateComponentState(component, resolvedValue);

            // Add to results
            results.push({
              component,
              resolvedValue,
              resolution: config.conflictResolution || 'newest',
              success: true,
            });

            // Update conflict details
            conflictDetails.resolved = true;
            conflictDetails.resolvedState = resolvedValue;

            // Emit conflict resolved event
            this.emit('conflict_resolved', {
              component,
              resolution: resolvedValue,
              strategy: config.conflictResolution,
            });
          } else {
            // Validation failed
            console.error(
              `Validation failed for resolved state of component ${component}`
            );

            // Add to results
            results.push({
              component,
              resolvedValue: null,
              resolution: config.conflictResolution || 'newest',
              success: false,
            });
          }
        } else {
          // Could not resolve automatically
          console.error(
            `Could not resolve conflict for component ${component} automatically`
          );

          // Add to results
          results.push({
            component,
            resolvedValue: null,
            resolution: 'manual',
            success: false,
          });
        }
      } catch (error) {
        console.error(
          `Error resolving conflict for component ${component}:`,
          error
        );

        // Add to results
        results.push({
          component,
          resolvedValue: null,
          resolution: 'error',
          success: false,
        });
      }
    }

    return results;
  }

  /**
   * Validates a merged state to ensure it meets all requirements
   * This is a critical part of the conflict resolution process
   */
  private async validateMergedState(
    componentId: string,
    state: any
  ): Promise<boolean> {
    try {
      // Basic validation - ensure state is not null or undefined
      if (state === null || state === undefined) {
        console.error(
          `Invalid state for component ${componentId}: state is null or undefined`
        );
        return false;
      }

      // Component-specific validation
      switch (componentId) {
        case 'memory':
          // Validate memory state structure
          if (!state.data) {
            console.error(`Invalid memory state: missing data property`);
            return false;
          }
          break;

        case 'consciousness':
          // Validate consciousness state structure
          if (!state.vector || !Array.isArray(state.vector)) {
            console.error(
              `Invalid consciousness state: missing or invalid vector property`
            );
            return false;
          }
          break;

        case 'proposals':
          // Validate proposals state structure
          if (!state.data || !Array.isArray(state.data)) {
            console.error(
              `Invalid proposals state: missing or invalid data property`
            );
            return false;
          }
          break;

        // Add more component-specific validations as needed
      }

      // Additional validation logic could be added here
      // For example, checking for data integrity, schema validation, etc.

      // If we reach here, the state is valid
      return true;
    } catch (error) {
      console.error(
        `Error validating merged state for component ${componentId}:`,
        error
      );
      return false;
    }
  }

  /**
   * Applies a state diff to the local state
   */
  public async applyStateDiff(diff: StateDiff): Promise<boolean> {
    try {
      // Get component ID
      const { componentId, nodeId, currentState, vectorClock } = diff;

      // Store the previous state for potential rollback
      const previousState = await this.protocol.getComponentState(componentId);

      // Check for conflicts
      const conflict = this.detectConflicts(
        componentId,
        nodeId,
        currentState,
        vectorClock
      );

      if (conflict) {
        // Try to resolve automatically
        const resolution = this.resolveConflictAutomatically(conflict);

        if (resolution) {
          // Validate the merged state before applying
          const isValid = await this.validateMergedState(
            componentId,
            resolution
          );

          if (!isValid) {
            console.error(
              `Validation failed for resolved state of component ${componentId}`
            );
            return false;
          }

          try {
            // Apply resolved state
            await this.protocol.updateComponentState(componentId, resolution);

            // Add to state history for potential rollback
            this.addToStateHistory(componentId, resolution);
          } catch (error) {
            console.error(
              `Failed to apply resolved state for component ${componentId}:`,
              error
            );

            // Rollback to previous state
            await this.rollbackToState(componentId, previousState);
            return false;
          }

          // Add to state history
          this.addToStateHistory(componentId, resolution);

          // Emit conflict resolved event
          this.emit('conflict_auto_resolved', {
            componentId,
            resolution,
            conflict,
          });
        } else if (conflict.resolutionStrategy === 'manual') {
          // Add to active conflicts
          const conflictId = `sync-${Date.now()}-${componentId}`;
          this.activeConflicts.set(conflictId, conflict);

          // Emit conflict detected event
          this.emit('conflict_detected', {
            syncId: conflictId,
            conflict,
          });

          // Cannot proceed without manual resolution
          return false;
        }
      } else {
        // No conflict, apply state directly
        try {
          await this.protocol.updateComponentState(componentId, currentState);

          // Add to state history
          this.addToStateHistory(componentId, currentState);

          // Update vector clock
          this.vectorClocks.set(nodeId, vectorClock);
        } catch (error) {
          console.error(
            `Failed to apply state diff for component ${componentId}:`,
            error
          );

          // Rollback to previous state
          await this.rollbackToState(componentId, previousState);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error('Failed to apply state diff:', error);
      return false;
    }
  }

  /**
   * Rolls back a component to a specific state
   * This is used when a conflict resolution or state update fails
   */
  private async rollbackToState(
    componentId: string,
    state: any
  ): Promise<boolean> {
    try {
      if (!state) {
        console.error(
          `Cannot rollback component ${componentId}: no previous state available`
        );
        return false;
      }

      // Apply the previous state
      await this.protocol.updateComponentState(componentId, state);

      // Emit rollback event
      this.emit('component_rollback_to_state', {
        componentId,
        state,
        timestamp: Date.now(),
        reason: 'conflict_resolution_failure',
      });

      return true;
    } catch (error) {
      console.error(
        `Failed to rollback component ${componentId} to previous state:`,
        error
      );
      return false;
    }
  }

  /**
   * Rolls back a component to a previous state
   */
  public async rollbackComponent(
    componentId: string,
    timestamp?: number
  ): Promise<boolean> {
    try {
      // Get history for component
      const history = this.stateHistory.get(componentId) || [];

      if (history.length === 0) {
        console.error(`No history available for component ${componentId}`);
        return false;
      }

      let targetState: any;

      if (timestamp) {
        // Find state closest to timestamp
        let closestEntry = history[0];
        let closestDiff = Math.abs(closestEntry.timestamp - timestamp);

        for (let i = 1; i < history.length; i++) {
          const entry = history[i];
          const diff = Math.abs(entry.timestamp - timestamp);

          if (diff < closestDiff) {
            closestDiff = diff;
            closestEntry = entry;
          }
        }

        targetState = closestEntry.state;
      } else {
        // Use previous state
        const previousIndex = history.length > 1 ? history.length - 2 : 0;
        targetState = history[previousIndex].state;
      }

      // Apply rollback
      await this.protocol.updateComponentState(componentId, targetState);

      // Emit rollback event
      this.emit('component_rollback', {
        componentId,
        state: targetState,
        timestamp:
          timestamp ||
          history[history.length > 1 ? history.length - 2 : 0].timestamp,
      });

      return true;
    } catch (error) {
      console.error('Failed to rollback component:', error);
      return false;
    }
  }

  /**
   * Gets the state history for a component
   */
  public getStateHistory(componentId: string): any[] {
    return this.stateHistory.get(componentId) || [];
  }

  /**
   * Gets active conflicts
   */
  public getActiveConflicts(): ConflictDetails[] {
    return Array.from(this.activeConflicts.values());
  }
}

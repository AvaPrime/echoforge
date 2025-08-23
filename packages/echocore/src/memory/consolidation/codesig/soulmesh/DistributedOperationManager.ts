/**
 * DistributedOperationManager - Manages operations across the mesh
 *
 * This component handles the submission, tracking, and execution of
 * distributed operations across the SoulMesh network.
 */

import { EventEmitter } from 'events';
import {
  DistributedOperation,
  OperationType,
  OperationStatus,
  ConsciousnessNodeId,
} from './types';
import { SoulMeshProtocol } from './SoulMeshProtocol';

/**
 * Configuration options for the DistributedOperationManager
 */
export interface DistributedOperationManagerConfig {
  maxConcurrentOperations?: number;
  operationTimeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
  priorityQueueEnabled?: boolean;
}

/**
 * Manages operations across the mesh
 */
export class DistributedOperationManager extends EventEmitter {
  private protocol: SoulMeshProtocol;
  private config: DistributedOperationManagerConfig;
  private operations: Map<string, DistributedOperation> = new Map();
  private pendingOperations: Map<string, DistributedOperation> = new Map();
  private activeOperations: Map<string, DistributedOperation> = new Map();
  private completedOperations: Map<string, DistributedOperation> = new Map();
  private operationTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private operationRetries: Map<string, number> = new Map();

  /**
   * Creates a new DistributedOperationManager
   */
  constructor(
    protocol: SoulMeshProtocol,
    config: DistributedOperationManagerConfig = {}
  ) {
    super();
    this.protocol = protocol;
    this.config = {
      maxConcurrentOperations: config.maxConcurrentOperations || 10,
      operationTimeoutMs: config.operationTimeoutMs || 30000, // 30 seconds
      retryCount: config.retryCount || 3,
      retryDelayMs: config.retryDelayMs || 1000, // 1 second
      priorityQueueEnabled:
        config.priorityQueueEnabled !== undefined
          ? config.priorityQueueEnabled
          : true,
    };

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for the SoulMesh protocol
   */
  private setupEventListeners(): void {
    // Listen for operation status changes
    this.protocol.on(
      'operation_status_changed',
      (operation: DistributedOperation) => {
        this.handleOperationStatusChanged(operation);
      }
    );
  }

  /**
   * Handles operation status changes
   */
  private handleOperationStatusChanged(operation: DistributedOperation): void {
    // Update operation in maps
    this.operations.set(operation.operationId, operation);

    switch (operation.status) {
      case OperationStatus.PENDING:
        this.pendingOperations.set(operation.operationId, operation);
        break;
      case OperationStatus.IN_PROGRESS:
        this.pendingOperations.delete(operation.operationId);
        this.activeOperations.set(operation.operationId, operation);
        break;
      case OperationStatus.COMPLETED:
      case OperationStatus.FAILED:
      case OperationStatus.ABORTED:
        this.pendingOperations.delete(operation.operationId);
        this.activeOperations.delete(operation.operationId);
        this.completedOperations.set(operation.operationId, operation);

        // Clear timeout
        const timeout = this.operationTimeouts.get(operation.operationId);
        if (timeout) {
          clearTimeout(timeout);
          this.operationTimeouts.delete(operation.operationId);
        }

        // Clear retry count
        this.operationRetries.delete(operation.operationId);

        // Process next pending operation
        this.processNextPendingOperation();
        break;
    }

    // Emit operation status changed event
    this.emit('operation_status_changed', operation);
  }

  /**
   * Processes the next pending operation
   */
  private processNextPendingOperation(): void {
    // Check if we can process more operations
    if (this.activeOperations.size >= this.config.maxConcurrentOperations) {
      return;
    }

    // Get pending operations
    const pendingOperations = Array.from(this.pendingOperations.values());

    // Sort by priority if enabled
    if (this.config.priorityQueueEnabled) {
      pendingOperations.sort((a, b) => {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    }

    // Get next operation
    const nextOperation = pendingOperations[0];

    if (nextOperation) {
      // Submit operation
      this.submitOperation(nextOperation);
    }
  }

  /**
   * Submits an operation to the protocol
   */
  private async submitOperation(
    operation: DistributedOperation
  ): Promise<void> {
    try {
      // Submit operation
      await this.protocol.submitOperation(operation);

      // Set timeout
      const timeout = setTimeout(() => {
        this.handleOperationTimeout(operation.operationId);
      }, this.config.operationTimeoutMs);

      this.operationTimeouts.set(operation.operationId, timeout);
    } catch (error) {
      console.error('Failed to submit operation:', error);

      // Update operation status
      operation.status = OperationStatus.FAILED;
      operation.error = error.message;
      operation.completedAt = Date.now();

      // Handle operation status change
      this.handleOperationStatusChanged(operation);
    }
  }

  /**
   * Handles operation timeout
   */
  private handleOperationTimeout(operationId: string): void {
    const operation = this.operations.get(operationId);

    if (!operation) {
      return;
    }

    // Check if operation is still active
    if (operation.status === OperationStatus.IN_PROGRESS) {
      // Get retry count
      const retryCount = this.operationRetries.get(operationId) || 0;

      if (retryCount < this.config.retryCount) {
        // Increment retry count
        this.operationRetries.set(operationId, retryCount + 1);

        // Retry operation after delay
        setTimeout(() => {
          // Reset operation status
          operation.status = OperationStatus.PENDING;
          operation.error = undefined;

          // Submit operation again
          this.submitOperation(operation);
        }, this.config.retryDelayMs);
      } else {
        // Max retries reached, mark as failed
        operation.status = OperationStatus.FAILED;
        operation.error = 'Operation timed out after max retries';
        operation.completedAt = Date.now();

        // Handle operation status change
        this.handleOperationStatusChanged(operation);
      }
    }
  }

  /**
   * Creates a new distributed operation
   */
  public createOperation(
    type: OperationType,
    targetNodeIds: ConsciousnessNodeId[],
    payload: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): DistributedOperation {
    const operationId = `op-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;

    const operation: DistributedOperation = {
      operationId,
      type,
      initiatorNodeId: this.protocol['config'].nodeId, // Access protocol's nodeId
      targetNodeIds,
      priority,
      payload,
      status: OperationStatus.PENDING,
      submittedAt: Date.now(),
    };

    return operation;
  }

  /**
   * Submits a new operation
   */
  public async submitNewOperation(
    type: OperationType,
    targetNodeIds: ConsciousnessNodeId[],
    payload: any,
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<string> {
    // Create operation
    const operation = this.createOperation(
      type,
      targetNodeIds,
      payload,
      priority
    );

    // Add to operations and pending operations
    this.operations.set(operation.operationId, operation);
    this.pendingOperations.set(operation.operationId, operation);

    // Emit operation created event
    this.emit('operation_created', operation);

    // Process pending operations
    this.processNextPendingOperation();

    return operation.operationId;
  }

  /**
   * Aborts an operation
   */
  public abortOperation(operationId: string): boolean {
    const operation = this.operations.get(operationId);

    if (!operation) {
      return false;
    }

    // Check if operation can be aborted
    if (
      operation.status === OperationStatus.PENDING ||
      operation.status === OperationStatus.IN_PROGRESS
    ) {
      // Update operation status
      operation.status = OperationStatus.ABORTED;
      operation.completedAt = Date.now();

      // Handle operation status change
      this.handleOperationStatusChanged(operation);

      return true;
    }

    return false;
  }

  /**
   * Gets an operation by ID
   */
  public getOperation(operationId: string): DistributedOperation | null {
    return this.operations.get(operationId) || null;
  }

  /**
   * Gets all operations
   */
  public getAllOperations(): DistributedOperation[] {
    return Array.from(this.operations.values());
  }

  /**
   * Gets pending operations
   */
  public getPendingOperations(): DistributedOperation[] {
    return Array.from(this.pendingOperations.values());
  }

  /**
   * Gets active operations
   */
  public getActiveOperations(): DistributedOperation[] {
    return Array.from(this.activeOperations.values());
  }

  /**
   * Gets completed operations
   */
  public getCompletedOperations(): DistributedOperation[] {
    return Array.from(this.completedOperations.values());
  }

  /**
   * Gets operations by type
   */
  public getOperationsByType(type: OperationType): DistributedOperation[] {
    return this.getAllOperations().filter((op) => op.type === type);
  }

  /**
   * Gets operations by status
   */
  public getOperationsByStatus(
    status: OperationStatus
  ): DistributedOperation[] {
    return this.getAllOperations().filter((op) => op.status === status);
  }

  /**
   * Gets operations by target node
   */
  public getOperationsByTargetNode(
    nodeId: ConsciousnessNodeId
  ): DistributedOperation[] {
    return this.getAllOperations().filter((op) =>
      op.targetNodeIds.includes(nodeId)
    );
  }

  /**
   * Clears completed operations
   */
  public clearCompletedOperations(): void {
    for (const [operationId, operation] of this.completedOperations.entries()) {
      this.operations.delete(operationId);
      this.completedOperations.delete(operationId);
    }
  }
}

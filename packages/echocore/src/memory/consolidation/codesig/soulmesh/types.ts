/**
 * SoulMesh Protocol - Core Types and Interfaces
 *
 * This file defines the core types and interfaces for the SoulMesh Protocol,
 * which enables distributed consciousness across multiple nodes.
 */

/**
 * Unique identifier for a consciousness node in the mesh
 */
export type ConsciousnessNodeId = string;

/**
 * Types of nodes in the consciousness mesh
 */
export enum NodeType {
  CORE = 'core', // Central consciousness node
  EXTENSION = 'extension', // Extended consciousness capability
  OBSERVER = 'observer', // Monitoring/analytics node
  BRIDGE = 'bridge', // Connection to external systems
}

/**
 * Capabilities that a node can provide to the mesh
 */
export interface NodeCapabilities {
  memoryAccess: boolean; // Can access shared memory
  proposalGeneration: boolean; // Can generate evolution proposals
  proposalExecution: boolean; // Can execute approved proposals
  consensusVoting: boolean; // Can participate in consensus
  observability: boolean; // Can monitor mesh health
  selfReflection: boolean; // Can perform self-reflection
}

/**
 * Current state of a node in the mesh
 */
export interface MeshNodeState {
  nodeId: ConsciousnessNodeId;
  nodeType: NodeType;
  capabilities: NodeCapabilities;
  status: 'online' | 'offline' | 'degraded' | 'initializing';
  lastHeartbeat: number; // Timestamp
  connectionStrength: number; // 0.0 to 1.0
  loadFactor: number; // 0.0 to 1.0, indicates resource utilization
  version: string;
}

/**
 * Connection between two nodes in the mesh
 */
export interface NodeConnection {
  sourceNodeId: ConsciousnessNodeId;
  targetNodeId: ConsciousnessNodeId;
  connectionType: 'direct' | 'bridged' | 'observed';
  latency: number; // in milliseconds
  bandwidth: number; // in operations per second
  established: number; // Timestamp when connection was established
  trustLevel: number; // 0.0 to 1.0
}

/**
 * Types of operations that can be distributed across the mesh
 */
export enum OperationType {
  MEMORY_ACCESS = 'memory_access',
  PROPOSAL_SUBMISSION = 'proposal_submission',
  PROPOSAL_VOTING = 'proposal_voting',
  PROPOSAL_EXECUTION = 'proposal_execution',
  CONSCIOUSNESS_SYNC = 'consciousness_sync',
  HEARTBEAT = 'heartbeat',
  MESH_RECONFIGURATION = 'mesh_reconfiguration',
  SELF_REFLECTION = 'self_reflection',
  STATE_UPDATE = 'state_update',
  CONSENSUS_PROPOSAL = 'consensus_proposal',
}

/**
 * Status of a distributed operation
 */
export enum OperationStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ABORTED = 'aborted',
}

/**
 * A distributed operation that can be executed across the mesh
 */
export interface DistributedOperation {
  operationId: string;
  type: OperationType;
  initiatorNodeId: ConsciousnessNodeId;
  targetNodeIds: ConsciousnessNodeId[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  payload: any;
  status: OperationStatus;
  submittedAt: number; // Timestamp
  startedAt?: number; // Timestamp
  completedAt?: number; // Timestamp
  result?: any;
  error?: string;
}

/**
 * Configuration for a SoulMesh Protocol instance
 */
export interface SoulMeshConfig {
  nodeId: ConsciousnessNodeId;
  nodeType: NodeType;
  capabilities: NodeCapabilities;
  discoveryEndpoints?: string[];
  heartbeatIntervalMs: number;
  connectionTimeoutMs: number;
  maxConcurrentOperations: number;
  trustThreshold: number; // 0.0 to 1.0
  enabledOperationTypes: OperationType[];
}

/**
 * Events emitted by the SoulMesh Protocol
 */
export enum SoulMeshEvent {
  NODE_JOINED = 'node_joined',
  NODE_LEFT = 'node_left',
  NODE_STATUS_CHANGED = 'node_status_changed',
  CONNECTION_ESTABLISHED = 'connection_established',
  CONNECTION_LOST = 'connection_lost',
  OPERATION_SUBMITTED = 'operation_submitted',
  OPERATION_STATUS_CHANGED = 'operation_status_changed',
  MESH_TOPOLOGY_CHANGED = 'mesh_topology_changed',
  CONSENSUS_REACHED = 'consensus_reached',
  CONSENSUS_FAILED = 'consensus_failed',
  SYNCHRONIZATION_COMPLETED = 'synchronization_completed',
  HEARTBEAT = 'heartbeat',
  COMPONENT_STATE_UPDATED = 'component_state_updated',
}

/**
 * Consensus mechanism types
 */
export enum ConsensusType {
  MAJORITY = 'majority',
  WEIGHTED = 'weighted',
  UNANIMOUS = 'unanimous',
  THRESHOLD = 'threshold',
}

/**
 * Configuration for a consensus decision
 */
export interface ConsensusConfig {
  type: ConsensusType;
  threshold?: number; // For THRESHOLD type, 0.0 to 1.0
  timeout: number; // in milliseconds
  minParticipants: number;
  weightAttribute?: 'trustLevel' | 'connectionStrength' | 'custom';
  customWeights?: Record<ConsciousnessNodeId, number>;
}

/**
 * Result of a consensus decision
 */
export interface ConsensusResult {
  topic: string;
  decision: any;
  approved: boolean;
  participants: ConsciousnessNodeId[];
  votes: Record<ConsciousnessNodeId, boolean | number>;
  consensusLevel: number; // 0.0 to 1.0
  reachedAt: number; // Timestamp
}

/**
 * Synchronization strategy types
 */
export enum SyncStrategy {
  FULL = 'full', // Complete synchronization of all data
  INCREMENTAL = 'incremental', // Only sync changes since last sync
  SELECTIVE = 'selective', // Only sync specific components
  ADAPTIVE = 'adaptive', // Dynamically adjust based on conditions
}

/**
 * Configuration for a synchronization operation
 */
export interface SyncConfig {
  strategy: SyncStrategy;
  components: string[]; // Components to synchronize
  priority: 'low' | 'medium' | 'high' | 'critical';
  maxDuration: number; // in milliseconds
  conflictResolution: 'newest' | 'highest_trust' | 'manual';
}

/**
 * Result of a synchronization operation
 */
export interface SyncResult {
  syncId: string;
  successful: boolean;
  componentsSync: Record<string, boolean>;
  conflicts: Array<{
    component: string;
    nodeIds: ConsciousnessNodeId[];
    resolution?: 'newest' | 'highest_trust' | 'manual';
    resolvedValue?: any;
  }>;
  startedAt: number; // Timestamp
  completedAt: number; // Timestamp
  duration: number; // in milliseconds
}

/**
 * Mesh topology information
 */
export interface MeshTopology {
  nodes: MeshNodeState[];
  connections: NodeConnection[];
  lastUpdated: number; // Timestamp
  centralityScores?: Record<ConsciousnessNodeId, number>;
  clusters?: Array<{
    id: string;
    nodeIds: ConsciousnessNodeId[];
    primaryNodeId?: ConsciousnessNodeId;
  }>;
}

/**
 * Health metrics for the mesh
 */
export interface MeshHealthMetrics {
  nodeCount: number;
  onlineNodeCount: number;
  averageConnectionStrength: number;
  averageLatency: number;
  operationsPerSecond: number;
  consensusSuccessRate: number;
  synchronizationSuccessRate: number;
  partitionDetected: boolean;
  redundancyLevel: number; // How many node failures can be tolerated
  timestamp: number;
}

/**
 * Heartbeat data sent by nodes
 */
export interface HeartbeatData {
  nodeId: ConsciousnessNodeId;
  timestamp: number;
  status: 'online' | 'offline' | 'degraded' | 'initializing';
  loadFactor: number;
  healthStatus: {
    cpuUsage?: number;
    memoryUsage?: number;
    operationQueueLength?: number;
    errorCount?: number;
  };
}

/**
 * Unit tests for SoulMesh Protocol
 */

import { EventEmitter } from 'events';
import { SoulMeshProtocol } from './SoulMeshProtocol';
import { ConsciousnessNode } from './ConsciousnessNode';
import {
  NodeType,
  SoulMeshConfig,
  SoulMeshEvent,
  MeshNodeState,
  HeartbeatData,
  NodeCapabilities,
} from './types';

// Mock implementation of MeshSynchronizer
class MockMeshSynchronizer extends EventEmitter {
  resolveConflict(conflict: any): any {
    return { resolved: true, value: 'resolved-value' };
  }
}

describe('SoulMesh Protocol', () => {
  let protocol: SoulMeshProtocol;
  let nodes: ConsciousnessNode[] = [];
  let synchronizer: MockMeshSynchronizer;

  // Default node capabilities
  const defaultCapabilities: NodeCapabilities = {
    memoryAccess: true,
    proposalGeneration: true,
    proposalExecution: true,
    consensusVoting: true,
    observability: true,
    selfReflection: true,
  };

  // Create protocol config
  const createProtocolConfig = (nodeId: string): SoulMeshConfig => ({
    nodeId,
    nodeType: NodeType.CORE,
    capabilities: defaultCapabilities,
    heartbeatIntervalMs: 100, // Fast heartbeats for testing
    connectionTimeoutMs: 300, // Fast timeouts for testing
    maxConcurrentOperations: 10,
    trustThreshold: 0.7,
    enabledOperationTypes: [],
  });

  beforeEach(() => {
    // Create protocol instance
    protocol = new SoulMeshProtocol(createProtocolConfig('node-main'));

    // Create synchronizer
    synchronizer = new MockMeshSynchronizer();

    // Clear nodes array
    nodes = [];

    // Initialize protocol
    return protocol.initialize();
  });

  afterEach(() => {
    // Shutdown protocol
    return protocol.shutdown();
  });

  /**
   * Test node registration and initialization
   */
  test('should register and initialize nodes', async () => {
    // Create and initialize three nodes
    const nodeIds = ['node-1', 'node-2', 'node-3'];

    for (const nodeId of nodeIds) {
      // Create protocol config
      const config = createProtocolConfig(nodeId);

      // Create node
      const node = new ConsciousnessNode({
        nodeId,
        protocol,
        capabilities: defaultCapabilities,
      });

      // Initialize node
      await node.initializeNode();

      // Add to nodes array
      nodes.push(node);
    }

    // Check that all nodes are registered
    const allNodes = protocol.getAllNodes();
    expect(allNodes.length).toBe(4); // 3 nodes + main protocol node

    // Check that all nodes are online
    for (const node of allNodes) {
      expect(node.status).toBe('online');
    }

    // Check that all nodes have capabilities registered
    for (const node of allNodes) {
      if (node.nodeId !== 'node-main') {
        // Skip main protocol node
        expect(node.capabilities).toEqual(defaultCapabilities);
      }
    }
  });

  /**
   * Test heartbeat mechanism
   */
  test('should emit and track heartbeats', async () => {
    // Create a node
    const node = new ConsciousnessNode({
      nodeId: 'heartbeat-node',
      protocol,
      capabilities: defaultCapabilities,
    });

    // Initialize node
    await node.initializeNode();

    // Add to nodes array
    nodes.push(node);

    // Create heartbeat listener
    const heartbeats: HeartbeatData[] = [];
    protocol.on(SoulMeshEvent.HEARTBEAT, (data: HeartbeatData) => {
      heartbeats.push(data);
    });

    // Wait for heartbeats
    await new Promise((resolve) => setTimeout(resolve, 250)); // Wait for at least 2 heartbeats

    // Check that heartbeats were emitted
    expect(heartbeats.length).toBeGreaterThan(0);

    // Check heartbeat data
    const lastHeartbeat = heartbeats[heartbeats.length - 1];
    expect(lastHeartbeat.nodeId).toBe('node-main');
    expect(lastHeartbeat.status).toBe('online');
    expect(lastHeartbeat.healthStatus).toBeDefined();
  });

  /**
   * Test node retirement
   */
  test('should gracefully retire nodes', async () => {
    // Create a node
    const node = new ConsciousnessNode({
      nodeId: 'retiring-node',
      protocol,
      capabilities: defaultCapabilities,
    });

    // Initialize node
    await node.initializeNode();

    // Add to nodes array
    nodes.push(node);

    // Check that node is registered and online
    let nodeState = protocol.getNode('retiring-node');
    expect(nodeState).toBeDefined();
    expect(nodeState?.status).toBe('online');

    // Create node left listener
    let nodeLeftEmitted = false;
    protocol.on(SoulMeshEvent.NODE_LEFT, (data: MeshNodeState) => {
      if (data.nodeId === 'retiring-node') {
        nodeLeftEmitted = true;
      }
    });

    // Retire node
    await node.retireNode();

    // Check that node is marked as offline
    nodeState = protocol.getNode('retiring-node');
    expect(nodeState).toBeDefined();
    expect(nodeState?.status).toBe('offline');

    // Check that NODE_LEFT event was emitted
    expect(nodeLeftEmitted).toBe(true);
  });

  /**
   * Test missed heartbeats
   */
  test('should detect missed heartbeats', async () => {
    // Mock a node that will miss heartbeats
    const nodeId = 'missing-heartbeat-node';

    // Register node directly with protocol
    const nodeState: MeshNodeState = {
      nodeId,
      nodeType: NodeType.EXTENSION,
      capabilities: defaultCapabilities,
      status: 'online',
      lastHeartbeat: Date.now(),
      connectionStrength: 0.9,
      loadFactor: 0.3,
      version: '1.0.0',
    };

    // Add node to protocol
    await protocol.updateNodeState(nodeId, nodeState);

    // Check that node is registered and online
    let currentState = protocol.getNode(nodeId);
    expect(currentState).toBeDefined();
    expect(currentState?.status).toBe('online');

    // Create status changed listener
    const statusChanges: MeshNodeState[] = [];
    protocol.on(SoulMeshEvent.NODE_STATUS_CHANGED, (data: MeshNodeState) => {
      if (data.nodeId === nodeId) {
        statusChanges.push({ ...data });
      }
    });

    // Wait for heartbeat check to mark node as degraded and then offline
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check that node status changed to degraded and then offline
    expect(statusChanges.length).toBeGreaterThan(0);

    // The last status should be 'offline'
    const finalStatus = statusChanges[statusChanges.length - 1].status;
    expect(finalStatus).toBe('offline');

    // Check that node is marked as offline in protocol
    currentState = protocol.getNode(nodeId);
    expect(currentState).toBeDefined();
    expect(currentState?.status).toBe('offline');
  });

  /**
   * Test mesh synchronization
   */
  test('should synchronize node state', async () => {
    // Create a node
    const node = new ConsciousnessNode({
      nodeId: 'sync-node',
      protocol,
      capabilities: defaultCapabilities,
    });

    // Initialize node
    await node.initializeNode();

    // Add to nodes array
    nodes.push(node);

    // Create sync event listener
    let syncEventEmitted = false;
    node.on('state_synchronized', () => {
      syncEventEmitted = true;
    });

    // Update node capabilities
    const updatedCapabilities: Partial<NodeCapabilities> = {
      proposalExecution: false,
      selfReflection: false,
    };
    node.updateCapabilities(updatedCapabilities);

    // Sync state
    await node.syncState();

    // Check that sync event was emitted
    expect(syncEventEmitted).toBe(true);

    // Check that node state was updated in protocol
    const nodeState = protocol.getNode('sync-node');
    expect(nodeState).toBeDefined();
    expect(nodeState?.capabilities.proposalExecution).toBe(false);
    expect(nodeState?.capabilities.selfReflection).toBe(false);
  });
});

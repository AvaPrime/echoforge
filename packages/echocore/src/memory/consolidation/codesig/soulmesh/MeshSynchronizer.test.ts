/**
 * Unit tests for MeshSynchronizer
 */

import { EventEmitter } from 'events';
import { MeshSynchronizer } from './MeshSynchronizer';
import { SoulMeshProtocol } from './SoulMeshProtocol';
import { ConsciousnessNode } from './ConsciousnessNode';
import {
  NodeType,
  SoulMeshConfig,
  SyncConfig,
  SyncStrategy,
  NodeCapabilities,
} from './types';

describe('MeshSynchronizer', () => {
  let synchronizer: MeshSynchronizer;
  let protocol: SoulMeshProtocol;
  let nodes: ConsciousnessNode[] = [];

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

  beforeEach(async () => {
    // Create protocol instance
    protocol = new SoulMeshProtocol(createProtocolConfig('sync-main-node'));

    // Create synchronizer
    synchronizer = new MeshSynchronizer(protocol);

    // Clear nodes array
    nodes = [];

    // Initialize protocol
    await protocol.initialize();

    // Create and initialize three nodes
    const nodeIds = ['sync-node-1', 'sync-node-2', 'sync-node-3'];

    for (const nodeId of nodeIds) {
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
  });

  afterEach(async () => {
    // Retire all nodes
    for (const node of nodes) {
      await node.retireNode();
    }

    // Shutdown protocol
    await protocol.shutdown();
  });

  /**
   * Test conflict resolution with newest strategy
   */
  test('should resolve conflicts using newest strategy', async () => {
    // Create sync config with newest conflict resolution
    const syncConfig: SyncConfig = {
      strategy: SyncStrategy.FULL,
      components: ['memory', 'proposals'],
      priority: 'high',
      maxDuration: 5000,
      conflictResolution: 'newest',
    };

    // Create conflicting data
    const conflicts = [
      {
        component: 'memory',
        nodeIds: ['sync-node-1', 'sync-node-2', 'sync-node-3'],
        values: {
          'sync-node-1': { data: 'value1', timestamp: Date.now() - 3000 },
          'sync-node-2': { data: 'value2', timestamp: Date.now() - 1000 },
          'sync-node-3': { data: 'value3', timestamp: Date.now() - 2000 },
        },
      },
    ];

    // Resolve conflicts
    const results = await synchronizer.resolveConflicts(conflicts, syncConfig);

    // Check that conflicts were resolved
    expect(results.length).toBe(1);
    expect(results[0].component).toBe('memory');
    expect(results[0].resolvedValue.data).toBe('value2'); // Node 2 has newest timestamp
    expect(results[0].resolution).toBe('newest');
  });

  /**
   * Test conflict resolution with highest trust strategy
   */
  test('should resolve conflicts using highest trust strategy', async () => {
    // Create sync config with highest trust conflict resolution
    const syncConfig: SyncConfig = {
      strategy: SyncStrategy.FULL,
      components: ['memory', 'proposals'],
      priority: 'high',
      maxDuration: 5000,
      conflictResolution: 'highest_trust',
    };

    // Mock node trust levels
    const trustLevels = {
      'sync-node-1': 0.5,
      'sync-node-2': 0.7,
      'sync-node-3': 0.9,
    };

    // Mock getTrustLevel method
    synchronizer.getTrustLevel = jest
      .fn()
      .mockImplementation((nodeId: string) => {
        return trustLevels[nodeId] || 0.5;
      });

    // Create conflicting data
    const conflicts = [
      {
        component: 'proposals',
        nodeIds: ['sync-node-1', 'sync-node-2', 'sync-node-3'],
        values: {
          'sync-node-1': { data: 'proposal1' },
          'sync-node-2': { data: 'proposal2' },
          'sync-node-3': { data: 'proposal3' },
        },
      },
    ];

    // Resolve conflicts
    const results = await synchronizer.resolveConflicts(conflicts, syncConfig);

    // Check that conflicts were resolved
    expect(results.length).toBe(1);
    expect(results[0].component).toBe('proposals');
    expect(results[0].resolvedValue.data).toBe('proposal3'); // Node 3 has highest trust
    expect(results[0].resolution).toBe('highest_trust');
  });

  /**
   * Test synchronization process
   */
  test('should synchronize components across nodes', async () => {
    // Create sync config
    const syncConfig: SyncConfig = {
      strategy: SyncStrategy.FULL,
      components: ['memory', 'proposals'],
      priority: 'high',
      maxDuration: 5000,
      conflictResolution: 'newest',
    };

    // Mock component data
    const componentData = {
      memory: {
        'sync-node-1': { data: 'memory1', timestamp: Date.now() },
        'sync-node-2': { data: 'memory2', timestamp: Date.now() - 1000 },
        'sync-node-3': { data: 'memory3', timestamp: Date.now() - 2000 },
      },
      proposals: {
        'sync-node-1': { data: 'proposal1', timestamp: Date.now() - 3000 },
        'sync-node-2': { data: 'proposal2', timestamp: Date.now() - 1000 },
        'sync-node-3': { data: 'proposal3', timestamp: Date.now() },
      },
    };

    // Mock getComponentData method
    synchronizer.getComponentData = jest
      .fn()
      .mockImplementation((component: string, nodeId: string) => {
        return componentData[component]?.[nodeId] || null;
      });

    // Create sync result listener
    let syncResult: any = null;
    synchronizer.on('sync_completed', (result) => {
      syncResult = result;
    });

    // Perform synchronization
    await synchronizer.synchronize(syncConfig);

    // Check that sync was completed
    expect(syncResult).not.toBeNull();
    expect(syncResult.successful).toBe(true);

    // Check that components were synchronized
    expect(syncResult.componentsSync.memory).toBe(true);
    expect(syncResult.componentsSync.proposals).toBe(true);

    // Check that conflicts were resolved
    expect(syncResult.conflicts.length).toBe(2); // One for each component

    // Check memory conflict resolution
    const memoryConflict = syncResult.conflicts.find(
      (c: any) => c.component === 'memory'
    );
    expect(memoryConflict).toBeDefined();
    expect(memoryConflict.resolvedValue.data).toBe('memory1'); // Node 1 has newest timestamp

    // Check proposals conflict resolution
    const proposalsConflict = syncResult.conflicts.find(
      (c: any) => c.component === 'proposals'
    );
    expect(proposalsConflict).toBeDefined();
    expect(proposalsConflict.resolvedValue.data).toBe('proposal3'); // Node 3 has newest timestamp
  });
});

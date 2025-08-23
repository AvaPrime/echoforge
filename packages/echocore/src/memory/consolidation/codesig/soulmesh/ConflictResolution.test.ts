/**
 * Tests for SoulMesh Protocol conflict resolution
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
  NodeCapabilities
} from './types';

describe('SoulMesh Conflict Resolution', () => {
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
    selfReflection: true
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
    enabledOperationTypes: []
  });
  
  beforeEach(async () => {
    // Create protocol instance
    protocol = new SoulMeshProtocol(createProtocolConfig('test-main-node'));
    
    // Create synchronizer
    synchronizer = new MeshSynchronizer(protocol);
    
    // Clear nodes array
    nodes = [];
    
    // Initialize protocol
    await protocol.initialize();
    
    // Create and initialize three nodes
    const nodeIds = ['test-node-1', 'test-node-2', 'test-node-3'];
    
    for (const nodeId of nodeIds) {
      // Create node
      const node = new ConsciousnessNode({
        nodeId,
        protocol,
        capabilities: defaultCapabilities
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
   * Test conflict detection
   */
  test('should detect conflicts between vector clocks', async () => {
    // Mock vector clocks
    const clock1 = {
      'test-node-1': 2,
      'test-node-2': 1,
      'test-node-3': 0
    };
    
    const clock2 = {
      'test-node-1': 1,
      'test-node-2': 2,
      'test-node-3': 0
    };
    
    // Access private method for testing
    const isConflict = (synchronizer as any).isVectorClockConflict(clock1, clock2);
    
    // Should detect conflict
    expect(isConflict).toBe(true);
  });
  
  /**
   * Test conflict resolution with newest strategy
   */
  test('should resolve conflicts using newest strategy', async () => {
    // Create sync config with newest conflict resolution
    const syncConfig: SyncConfig = {
      strategy: SyncStrategy.FULL,
      components: ['memory'],
      priority: 'high',
      maxDuration: 5000,
      conflictResolution: 'newest'
    };
    
    // Create conflicting data
    const conflicts = [
      {
        component: 'memory',
        nodeIds: ['test-node-1', 'test-node-2', 'test-node-3'],
        values: {
          'test-node-1': { data: 'value1', timestamp: Date.now() - 3000 },
          'test-node-2': { data: 'value2', timestamp: Date.now() - 1000 },
          'test-node-3': { data: 'value3', timestamp: Date.now() - 2000 }
        }
      }
    ];
    
    // Mock validateMergedState to return true
    (synchronizer as any).validateMergedState = jest.fn().mockResolvedValue(true);
    
    // Mock protocol.updateComponentState
    protocol.updateComponentState = jest.fn().mockResolvedValue(true);
    
    // Resolve conflicts
    const results = await synchronizer.resolveConflicts(conflicts, syncConfig);
    
    // Check that conflicts were resolved
    expect(results.length).toBe(1);
    expect(results[0].component).toBe('memory');
    expect(results[0].resolvedValue.data).toBe('value2'); // Node 2 has newest timestamp
    expect(results[0].resolution).toBe('newest');
    expect(results[0].success).toBe(true);
  });
  
  /**
   * Test validation failure during conflict resolution
   */
  test('should handle validation failure during conflict resolution', async () => {
    // Create sync config
    const syncConfig: SyncConfig = {
      strategy: SyncStrategy.FULL,
      components: ['consciousness'],
      priority: 'high',
      maxDuration: 5000,
      conflictResolution: 'newest'
    };
    
    // Create conflicting data with invalid structure
    const conflicts = [
      {
        component: 'consciousness',
        nodeIds: ['test-node-1', 'test-node-2'],
        values: {
          'test-node-1': { data: 'invalid-consciousness-state', timestamp: Date.now() },
          'test-node-2': { data: 'another-invalid-state', timestamp: Date.now() - 1000 }
        }
      }
    ];
    
    // Mock validateMergedState to return false (validation failure)
    (synchronizer as any).validateMergedState = jest.fn().mockResolvedValue(false);
    
    // Resolve conflicts
    const results = await synchronizer.resolveConflicts(conflicts, syncConfig);
    
    // Check that validation failed
    expect(results.length).toBe(1);
    expect(results[0].component).toBe('consciousness');
    expect(results[0].resolvedValue).toBeNull();
    expect(results[0].success).toBe(false);
  });
  
  /**
   * Test rollback functionality
   */
  test('should rollback to previous state when update fails', async () => {
    // Mock component state
    const previousState = { data: 'previous-state' };
    const newState = { data: 'new-state' };
    
    // Mock protocol methods
    protocol.getComponentState = jest.fn().mockResolvedValue(previousState);
    protocol.updateComponentState = jest.fn().mockImplementation(async () => {
      throw new Error('Update failed');
    });
    
    // Store previous state for rollback
    (protocol as any)._previousStates = {
      'memory': previousState
    };
    
    // Mock rollback method
    protocol.rollbackComponentState = jest.fn().mockResolvedValue(true);
    
    // Attempt to update state
    const result = await protocol.updateComponentState('memory', newState);
    
    // Check that update failed
    expect(result).toBe(false);
    
    // Check that rollback was called
    expect(protocol.rollbackComponentState).toHaveBeenCalledWith('memory');
  });
  
  /**
   * Test peer conflict handling
   */
  test('should handle peer conflict and merge vector clocks', async () => {
    // Mock component states
    const localState = { entries: [{ id: '1', content: 'Local memory', timestamp: Date.now() - 1000 }] };
    const remoteState = { entries: [{ id: '1', content: 'Remote memory', timestamp: Date.now() }] };
    
    // Mock vector clocks
    const localVectorClock = { 'test-main-node': 1, 'test-node-1': 0 };
    const remoteVectorClock = { 'test-main-node': 0, 'test-node-1': 1 };
    
    // Mock protocol methods
    protocol.getComponentState = jest.fn().mockResolvedValue(localState);
    protocol.getVectorClock = jest.fn().mockReturnValue(localVectorClock);
    protocol.detectVectorClockConflict = jest.fn().mockReturnValue(true);
    protocol.validateComponentState = jest.fn().mockReturnValue(true);
    protocol.updateComponentState = jest.fn().mockResolvedValue(true);
    protocol.mergeVectorClocks = jest.fn().mockReturnValue({
      'test-main-node': 1,
      'test-node-1': 1
    });
    protocol.setVectorClock = jest.fn();
    protocol.broadcastStateUpdate = jest.fn().mockResolvedValue(undefined);
    
    // Handle peer conflict
    const result = await protocol.handlePeerConflict('memory', 'test-node-1', remoteState, remoteVectorClock);
    
    // Check that conflict was resolved
    expect(result).toBe(true);
    
    // Check that vector clock was merged
    expect(protocol.mergeVectorClocks).toHaveBeenCalledWith(localVectorClock, remoteVectorClock);
    
    // Check that state was updated
    expect(protocol.updateComponentState).toHaveBeenCalledWith('memory', remoteState);
    
    // Check that resolution was broadcast
    expect(protocol.broadcastStateUpdate).toHaveBeenCalled();
  });
     
     // Mock protocol methods for the original test
     protocol.updateComponentState = jest.fn().mockImplementation((componentId, state) => {
      if (state === newState) {
        throw new Error('Update failed');
      }
      return Promise.resolve(true);
    });
    
    // Create a spy for the rollbackToState method
    const rollbackSpy = jest.spyOn(synchronizer as any, 'rollbackToState');
    
    // Create a state diff
    const diff = {
      componentId: 'memory',
      timestamp: Date.now(),
      nodeId: 'test-node-1',
      previousState: null,
      currentState: newState,
      vectorClock: { 'test-node-1': 1 }
    };
    
    // Apply state diff (should fail and trigger rollback)
    const result = await synchronizer.applyStateDiff(diff);
    
    // Check that rollback was called
    expect(result).toBe(false);
    expect(rollbackSpy).toHaveBeenCalledWith('memory', previousState);
  });
});
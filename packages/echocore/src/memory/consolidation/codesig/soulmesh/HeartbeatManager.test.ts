/**
 * HeartbeatManager Tests
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HeartbeatManager } from './HeartbeatManager';
import { SoulMeshProtocol } from './SoulMeshProtocol';
import { SoulMeshEvent, NodeType } from './types';

// Mock SoulMeshProtocol
vi.mock('./SoulMeshProtocol', () => {
  return {
    SoulMeshProtocol: vi.fn().mockImplementation(() => {
      return {
        on: vi.fn(),
        emit: vi.fn(),
        config: {
          nodeId: 'test-node-1',
          heartbeatIntervalMs: 1000,
          connectionTimeoutMs: 3000,
        },
        nodes: new Map([
          [
            'test-node-1',
            {
              nodeId: 'test-node-1',
              nodeType: NodeType.CORE,
              status: 'online',
              lastHeartbeat: Date.now(),
              loadFactor: 0.5,
              connectionStrength: 1.0,
            },
          ],
        ]),
        operations: new Map(),
      };
    }),
  };
});

describe('HeartbeatManager', () => {
  let heartbeatManager: HeartbeatManager;
  let protocol: SoulMeshProtocol;

  beforeEach(() => {
    vi.useFakeTimers();
    protocol = new SoulMeshProtocol({
      nodeId: 'test-node-1',
      nodeType: NodeType.CORE,
      capabilities: {
        memoryAccess: true,
        proposalGeneration: true,
        proposalExecution: true,
        consensusVoting: true,
        observability: true,
        selfReflection: true,
      },
      heartbeatIntervalMs: 1000,
      connectionTimeoutMs: 3000,
      maxConcurrentOperations: 10,
      trustThreshold: 0.7,
      enabledOperationTypes: [],
    });

    heartbeatManager = new HeartbeatManager(protocol, {
      heartbeatIntervalMs: 1000,
      nodeTimeoutMs: 3000,
      degradedThresholdMs: 2000,
      healthMetricsEnabled: true,
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.useRealTimers();
    heartbeatManager.stop();
  });

  it('should initialize correctly', () => {
    expect(heartbeatManager).toBeDefined();
    expect(protocol.on).toHaveBeenCalledWith(
      SoulMeshEvent.HEARTBEAT,
      expect.any(Function)
    );
    expect(protocol.on).toHaveBeenCalledWith(
      SoulMeshEvent.NODE_JOINED,
      expect.any(Function)
    );
    expect(protocol.on).toHaveBeenCalledWith(
      SoulMeshEvent.NODE_LEFT,
      expect.any(Function)
    );
  });

  it('should start and stop heartbeat mechanism', () => {
    const setIntervalSpy = vi.spyOn(global, 'setInterval');
    const clearIntervalSpy = vi.spyOn(global, 'clearInterval');

    heartbeatManager.start();
    expect(setIntervalSpy).toHaveBeenCalledTimes(1);
    expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);

    heartbeatManager.stop();
    expect(clearIntervalSpy).toHaveBeenCalledTimes(1);
  });

  it('should broadcast heartbeat when interval triggers', () => {
    heartbeatManager.start();

    // Advance timer to trigger heartbeat
    vi.advanceTimersByTime(1000);

    expect(protocol.emit).toHaveBeenCalledWith(
      SoulMeshEvent.HEARTBEAT,
      expect.objectContaining({
        nodeId: 'test-node-1',
        timestamp: expect.any(Number),
        status: 'online',
        loadFactor: 0.5,
        healthStatus: expect.objectContaining({
          cpuUsage: expect.any(Number),
          memoryUsage: expect.any(Number),
          operationQueueLength: 0,
        }),
      })
    );
  });

  it('should handle heartbeat from another node', () => {
    const nodeStatusUpdatedSpy = vi.spyOn(heartbeatManager, 'emit');

    // Mock receiving a heartbeat from another node
    const heartbeatHandler = (protocol.on as jest.Mock).mock.calls.find(
      (call) => call[0] === SoulMeshEvent.HEARTBEAT
    )[1];

    const mockHeartbeat = {
      nodeId: 'test-node-2',
      timestamp: Date.now(),
      status: 'online',
      loadFactor: 0.3,
      healthStatus: {
        cpuUsage: 30,
        memoryUsage: 40,
      },
    };

    // Add the node to the protocol's nodes map
    protocol.nodes.set('test-node-2', {
      nodeId: 'test-node-2',
      nodeType: NodeType.EXTENSION,
      status: 'initializing',
      lastHeartbeat: Date.now() - 5000,
      loadFactor: 0,
      connectionStrength: 0.8,
    });

    // Call the heartbeat handler
    heartbeatHandler(mockHeartbeat);

    // Check that the node's status was updated
    expect(nodeStatusUpdatedSpy).toHaveBeenCalledWith(
      'node_status_updated',
      expect.objectContaining({
        nodeId: 'test-node-2',
        status: 'online',
        loadFactor: 0.3,
      })
    );

    // Check that the last heartbeat time was updated
    expect(heartbeatManager.getLastHeartbeatTime('test-node-2')).toBe(
      mockHeartbeat.timestamp
    );

    // Check that missed heartbeats were reset
    expect(heartbeatManager.getMissedHeartbeats('test-node-2')).toBe(0);
  });

  it('should mark nodes as degraded after degraded threshold', () => {
    // Add a node that will be marked as degraded
    protocol.nodes.set('test-node-3', {
      nodeId: 'test-node-3',
      nodeType: NodeType.EXTENSION,
      status: 'online',
      lastHeartbeat: Date.now() - 1000,
      loadFactor: 0.2,
      connectionStrength: 0.9,
    });

    // Initialize tracking for the node
    const nodeJoinedHandler = (protocol.on as jest.Mock).mock.calls.find(
      (call) => call[0] === SoulMeshEvent.NODE_JOINED
    )[1];

    nodeJoinedHandler({
      nodeId: 'test-node-3',
      nodeType: NodeType.EXTENSION,
      status: 'online',
    });

    // Start heartbeat manager
    heartbeatManager.start();

    // Advance time past degraded threshold but before offline threshold
    vi.advanceTimersByTime(2100);

    // Check that the node was marked as degraded
    expect(protocol.emit).toHaveBeenCalledWith(
      SoulMeshEvent.NODE_STATUS_CHANGED,
      expect.objectContaining({
        nodeId: 'test-node-3',
        status: 'degraded',
      })
    );
  });

  it('should mark nodes as offline after timeout threshold', () => {
    // Add a node that will be marked as offline
    protocol.nodes.set('test-node-4', {
      nodeId: 'test-node-4',
      nodeType: NodeType.BRIDGE,
      status: 'degraded',
      lastHeartbeat: Date.now() - 2500,
      loadFactor: 0.7,
      connectionStrength: 0.6,
    });

    // Initialize tracking for the node
    const nodeJoinedHandler = (protocol.on as jest.Mock).mock.calls.find(
      (call) => call[0] === SoulMeshEvent.NODE_JOINED
    )[1];

    nodeJoinedHandler({
      nodeId: 'test-node-4',
      nodeType: NodeType.BRIDGE,
      status: 'degraded',
    });

    // Start heartbeat manager
    heartbeatManager.start();

    // Advance time past offline threshold
    vi.advanceTimersByTime(3100);

    // Check that the node was marked as offline
    expect(protocol.emit).toHaveBeenCalledWith(
      SoulMeshEvent.NODE_STATUS_CHANGED,
      expect.objectContaining({
        nodeId: 'test-node-4',
        status: 'offline',
      })
    );
  });

  it('should provide node heartbeat status information', () => {
    // Add some nodes with different heartbeat times
    const now = Date.now();

    // Set up last heartbeat times
    heartbeatManager['lastHeartbeatTimes'].set('test-node-1', now);
    heartbeatManager['lastHeartbeatTimes'].set('test-node-2', now - 1000);
    heartbeatManager['lastHeartbeatTimes'].set('test-node-3', now - 2500);

    // Set up missed heartbeats
    heartbeatManager['missedHeartbeats'].set('test-node-1', 0);
    heartbeatManager['missedHeartbeats'].set('test-node-2', 1);
    heartbeatManager['missedHeartbeats'].set('test-node-3', 2);

    // Get node heartbeat status
    const status = heartbeatManager.getNodeHeartbeatStatus();

    // Check that all nodes are included
    expect(status.length).toBe(3);

    // Check that each node has the correct information
    const node1Status = status.find((s) => s.nodeId === 'test-node-1');
    const node2Status = status.find((s) => s.nodeId === 'test-node-2');
    const node3Status = status.find((s) => s.nodeId === 'test-node-3');

    expect(node1Status).toBeDefined();
    expect(node1Status?.lastHeartbeat).toBe(now);
    expect(node1Status?.missedHeartbeats).toBe(0);
    expect(node1Status?.timeSinceLastHeartbeat).toBe(0);

    expect(node2Status).toBeDefined();
    expect(node2Status?.lastHeartbeat).toBe(now - 1000);
    expect(node2Status?.missedHeartbeats).toBe(1);
    expect(node2Status?.timeSinceLastHeartbeat).toBe(1000);

    expect(node3Status).toBeDefined();
    expect(node3Status?.lastHeartbeat).toBe(now - 2500);
    expect(node3Status?.missedHeartbeats).toBe(2);
    expect(node3Status?.timeSinceLastHeartbeat).toBe(2500);
  });
});

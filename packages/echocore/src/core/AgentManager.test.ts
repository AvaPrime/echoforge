import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AgentManager } from './AgentManager';
import { Agent, AgentMetadata } from './Agent';
import { AgentContext } from './AgentContext';

// Create a mock agent for testing
class MockAgent implements Agent {
  readonly id: string;
  readonly metadata: AgentMetadata;
  readonly events: any;

  // Track method calls for testing
  initializeCalled = false;
  startCalled = false;
  stopCalled = false;

  constructor(id: string, metadata?: Partial<AgentMetadata>) {
    this.id = id;
    this.metadata = {
      id,
      name: `Mock Agent ${id}`,
      description: 'A mock agent for testing',
      version: '1.0.0',
      ...metadata,
    };
    this.events = {
      on: vi.fn(),
      emit: vi.fn(),
    };
  }

  async initialize(context: AgentContext): Promise<void> {
    this.initializeCalled = true;
  }

  async start(): Promise<void> {
    this.startCalled = true;
  }

  async stop(): Promise<void> {
    this.stopCalled = true;
  }

  async executeTask(task: any): Promise<any> {
    return { taskId: task.id, success: true };
  }

  getStatus(): Record<string, any> {
    return { status: 'ok' };
  }
}

describe('AgentManager', () => {
  let manager: AgentManager;

  beforeEach(() => {
    manager = new AgentManager();
  });

  it('should register an agent', async () => {
    const agent = new MockAgent('test-agent');
    await manager.registerAgent(agent);

    expect(agent.initializeCalled).toBe(true);
    expect(manager.getAgent('test-agent')).toBe(agent);
  });

  it('should not register the same agent twice', async () => {
    const agent = new MockAgent('test-agent');
    await manager.registerAgent(agent);

    await expect(manager.registerAgent(agent)).rejects.toThrow();
  });

  it('should unregister an agent', async () => {
    const agent = new MockAgent('test-agent');
    await manager.registerAgent(agent);
    await manager.unregisterAgent('test-agent');

    expect(agent.stopCalled).toBe(true);
    expect(manager.getAgent('test-agent')).toBeUndefined();
  });

  it('should get all registered agents', async () => {
    const agent1 = new MockAgent('agent-1');
    const agent2 = new MockAgent('agent-2');

    await manager.registerAgent(agent1);
    await manager.registerAgent(agent2);

    const allAgents = manager.getAllAgents();
    expect(allAgents).toHaveLength(2);
    expect(allAgents).toContain(agent1);
    expect(allAgents).toContain(agent2);
  });

  it('should start all agents', async () => {
    const agent1 = new MockAgent('agent-1');
    const agent2 = new MockAgent('agent-2');

    await manager.registerAgent(agent1);
    await manager.registerAgent(agent2);
    await manager.startAllAgents();

    expect(agent1.startCalled).toBe(true);
    expect(agent2.startCalled).toBe(true);
  });

  it('should stop all agents', async () => {
    const agent1 = new MockAgent('agent-1');
    const agent2 = new MockAgent('agent-2');

    await manager.registerAgent(agent1);
    await manager.registerAgent(agent2);
    await manager.stopAllAgents();

    expect(agent1.stopCalled).toBe(true);
    expect(agent2.stopCalled).toBe(true);
  });
});

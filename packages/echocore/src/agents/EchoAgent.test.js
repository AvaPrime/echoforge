import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { EchoAgent } from './EchoAgent';
import { EventEmitter } from '@echoforge/forgekit';
describe('EchoAgent', () => {
  let agent;
  let mockContext;
  let mockLogger;
  let mockEvents;
  beforeEach(() => {
    // Create a mock logger
    mockLogger = {
      debug: vi.fn(),
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    };
    // Create a real event emitter for testing events
    mockEvents = new EventEmitter();
    // Create a mock context
    mockContext = {
      logger: mockLogger,
      events: mockEvents,
      config: {},
    };
    // Create the agent
    agent = new EchoAgent('test-echo');
  });
  afterEach(() => {
    vi.clearAllMocks();
  });
  it('should initialize with the correct ID and metadata', () => {
    expect(agent.id).toBe('test-echo');
    expect(agent.metadata).toEqual({
      id: 'test-echo',
      name: 'EchoAgent-test-echo',
      description: 'A simple agent that echoes messages and logs activity',
      version: '0.1.0',
    });
    expect(agent.events).toBeInstanceOf(EventEmitter);
  });
  it('should initialize and log information', async () => {
    await agent.initialize(mockContext);
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[test-echo] EchoAgent is initializing...',
      { metadata: { agent: agent.metadata } }
    );
  });
  it('should register event handlers during initialization', async () => {
    const spy = vi.spyOn(mockEvents, 'on');
    await agent.initialize(mockContext);
    expect(spy).toHaveBeenCalledWith('echo:ping', expect.any(Function));
  });
  it('should start and update running status', async () => {
    await agent.initialize(mockContext);
    await agent.start();
    expect(agent.getStatus().running).toBe(true);
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[test-echo] EchoAgent is starting up.'
    );
  });
  it('should stop and update running status', async () => {
    await agent.initialize(mockContext);
    await agent.start();
    await agent.stop();
    expect(agent.getStatus().running).toBe(false);
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[test-echo] EchoAgent is shutting down.'
    );
  });
  it('should throw error when starting without initialization', async () => {
    await expect(agent.start()).rejects.toThrow(
      'Agent must be initialized before starting'
    );
  });
  it('should throw error when stopping without initialization', async () => {
    await expect(agent.stop()).rejects.toThrow(
      'Agent must be initialized before stopping'
    );
  });
  it('should execute tasks and return results when running', async () => {
    await agent.initialize(mockContext);
    await agent.start();
    const task = {
      id: 'test-task-1',
      type: 'echo',
      data: { message: 'Hello, Agent!' },
    };
    const result = await agent.executeTask(task);
    expect(result.success).toBe(true);
    expect(result.taskId).toBe('test-task-1');
    expect(result.data?.echo.message).toBe('Hello, Agent!');
    expect(mockLogger.info).toHaveBeenCalledWith(
      '[test-echo] Executing task: test-task-1',
      { metadata: { task } }
    );
  });
  it('should fail tasks when not running', async () => {
    await agent.initialize(mockContext);
    // Don't start the agent
    const task = {
      id: 'test-task-2',
      type: 'echo',
      data: { message: 'This should fail' },
    };
    const result = await agent.executeTask(task);
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe('Agent is not running');
  });
  it('should fail tasks when not initialized', async () => {
    // Don't initialize the agent
    const task = {
      id: 'test-task-3',
      type: 'echo',
      data: { message: 'This should fail' },
    };
    const result = await agent.executeTask(task);
    expect(result.success).toBe(false);
    expect(result.error?.message).toBe(
      'Agent must be initialized before executing tasks'
    );
  });
  it('should emit events when tasks complete', async () => {
    await agent.initialize(mockContext);
    await agent.start();
    const eventSpy = vi.fn();
    agent.events.on('echo:task-complete', eventSpy);
    const task = {
      id: 'test-task-3',
      type: 'echo',
      data: { message: 'Event test' },
    };
    await agent.executeTask(task);
    expect(eventSpy).toHaveBeenCalledWith({
      taskId: 'test-task-3',
      result: expect.objectContaining({
        success: true,
        taskId: 'test-task-3',
      }),
    });
  });
  it('should respond to ping events with pong events', async () => {
    await agent.initialize(mockContext);
    const pongSpy = vi.fn();
    agent.events.on('echo:pong', pongSpy);
    mockEvents.emit('echo:ping', { message: 'Ping test' });
    expect(mockLogger.info).toHaveBeenCalledWith('[test-echo] Received ping', {
      metadata: { data: { message: 'Ping test' } },
    });
    expect(pongSpy).toHaveBeenCalledWith({
      timestamp: expect.any(String),
      agent: 'test-echo',
      originalPing: { message: 'Ping test' },
    });
  });
});
//# sourceMappingURL=EchoAgent.test.js.map

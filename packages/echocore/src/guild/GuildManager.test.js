/**
 * Guild Manager Tests
 *
 * Tests for the Guild Protocol implementation, focusing on member registration,
 * task dispatching, and event broadcasting.
 */
import { EventEmitter } from '@echoforge/forgekit';
import { GuildManager } from './GuildManager';
import { AgentGuildMember, BaseGuildMember } from './BaseGuildMember';
import { EchoAgent } from '../agents/EchoAgent';
// Mock implementation of a GuildMember for testing
class TestGuildMember extends BaseGuildMember {
  taskHistory = [];
  eventHistory = [];
  initializeCalled = false;
  startCalled = false;
  stopCalled = false;
  constructor(id, role, capabilities) {
    super(id, role, capabilities, {
      name: `Test Member ${id}`,
      description: 'A test guild member for unit tests',
      version: '1.0.0',
    });
  }
  async onInitialize() {
    this.initializeCalled = true;
  }
  async onStart() {
    this.startCalled = true;
  }
  async onStop() {
    this.stopCalled = true;
  }
  async executeTask(task) {
    this.taskHistory.push(task);
    // Simulate task execution
    return {
      taskId: task.id,
      success: true,
      data: { processed: true, memberId: this.id },
      completedAt: new Date(),
    };
  }
  processEvent(event) {
    this.eventHistory.push(event);
  }
  // Helper method to simulate task failure
  setFailNextTask(shouldFail) {
    this.executeTask = async (task) => {
      this.taskHistory.push(task);
      if (shouldFail) {
        throw new Error('Task execution failed');
      }
      return {
        taskId: task.id,
        success: true,
        data: { processed: true, memberId: this.id },
        completedAt: new Date(),
      };
    };
  }
}
describe('GuildManager', () => {
  let context;
  let guild;
  beforeEach(() => {
    // Create a test context
    context = new AgentContext({
      id: 'test-context',
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      },
      events: new EventEmitter(),
      config: {},
    });
    // Create a new guild for each test
    guild = new GuildManager('test-guild', 'Test Guild', context);
  });
  describe('Member Registration', () => {
    test('should register a new member', async () => {
      const member = new TestGuildMember('member1', 'worker', [
        'task1',
        'task2',
      ]);
      await guild.registerMember(member);
      expect(guild.getMember('member1')).toBe(member);
      expect(member.initializeCalled).toBe(true);
    });
    test('should throw error when registering duplicate member', async () => {
      const member = new TestGuildMember('member1', 'worker', ['task1']);
      await guild.registerMember(member);
      await expect(guild.registerMember(member)).rejects.toThrow(
        'Member with ID member1 is already registered'
      );
    });
    test('should remove a member', async () => {
      const member = new TestGuildMember('member1', 'worker', ['task1']);
      await guild.registerMember(member);
      await guild.removeMember('member1');
      expect(guild.getMember('member1')).toBeUndefined();
    });
    test('should throw error when removing non-existent member', async () => {
      await expect(guild.removeMember('nonexistent')).rejects.toThrow(
        'Member with ID nonexistent is not registered'
      );
    });
  });
  describe('Member Queries', () => {
    beforeEach(async () => {
      // Register test members with different roles and capabilities
      await guild.registerMember(
        new TestGuildMember('worker1', 'worker', ['task1', 'task2'])
      );
      await guild.registerMember(
        new TestGuildMember('worker2', 'worker', ['task2', 'task3'])
      );
      await guild.registerMember(
        new TestGuildMember('manager1', 'manager', ['admin', 'task1'])
      );
    });
    test('should find members by role', () => {
      const workers = guild.findMembersByRole('worker');
      const managers = guild.findMembersByRole('manager');
      expect(workers.length).toBe(2);
      expect(managers.length).toBe(1);
      expect(workers[0].id).toBe('worker1');
      expect(workers[1].id).toBe('worker2');
      expect(managers[0].id).toBe('manager1');
    });
    test('should find members by capability', () => {
      const task1Members = guild.findMembersByCapability('task1');
      const task2Members = guild.findMembersByCapability('task2');
      const task3Members = guild.findMembersByCapability('task3');
      const adminMembers = guild.findMembersByCapability('admin');
      expect(task1Members.length).toBe(2);
      expect(task2Members.length).toBe(2);
      expect(task3Members.length).toBe(1);
      expect(adminMembers.length).toBe(1);
    });
    test('should get all members', () => {
      const allMembers = guild.getAllMembers();
      expect(allMembers.length).toBe(3);
      expect(allMembers.map((m) => m.id).sort()).toEqual([
        'manager1',
        'worker1',
        'worker2',
      ]);
    });
  });
  describe('Task Dispatching', () => {
    let worker1;
    let worker2;
    let manager;
    beforeEach(async () => {
      // Create test members
      worker1 = new TestGuildMember('worker1', 'worker', ['task1', 'task2']);
      worker2 = new TestGuildMember('worker2', 'worker', ['task2', 'task3']);
      manager = new TestGuildMember('manager1', 'manager', ['admin', 'task1']);
      // Register members
      await guild.registerMember(worker1);
      await guild.registerMember(worker2);
      await guild.registerMember(manager);
      // Start the guild and members
      await guild.start();
    });
    test('should dispatch task to member with required capabilities', async () => {
      const task = {
        id: 'task-1',
        type: 'test-task',
        requiredCapabilities: ['task3'],
        data: { test: true },
      };
      const result = await guild.dispatchTask(task);
      expect(result.success).toBe(true);
      expect(result.executedBy).toBe('worker2');
      expect(worker1.taskHistory.length).toBe(0);
      expect(worker2.taskHistory.length).toBe(1);
      expect(manager.taskHistory.length).toBe(0);
    });
    test('should dispatch task to member with preferred role', async () => {
      const task = {
        id: 'task-2',
        type: 'test-task',
        requiredCapabilities: ['task1'],
        preferredRole: 'manager',
        data: { test: true },
      };
      const result = await guild.dispatchTask(task);
      expect(result.success).toBe(true);
      expect(result.executedBy).toBe('manager1');
      expect(worker1.taskHistory.length).toBe(0);
      expect(worker2.taskHistory.length).toBe(0);
      expect(manager.taskHistory.length).toBe(1);
    });
    test('should return error when no eligible members found', async () => {
      const task = {
        id: 'task-3',
        type: 'test-task',
        requiredCapabilities: ['nonexistent'],
        data: { test: true },
      };
      const result = await guild.dispatchTask(task);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error.message).toContain('No eligible members found');
    });
    test('should handle task execution failure', async () => {
      // Set worker1 to fail the next task
      worker1.setFailNextTask(true);
      const task = {
        id: 'task-4',
        type: 'test-task',
        requiredCapabilities: ['task1'],
        preferredRole: 'worker',
        data: { test: true },
      };
      const result = await guild.dispatchTask(task);
      expect(result.success).toBe(false);
      expect(result.executedBy).toBe('worker1');
      expect(result.error).toBeDefined();
      expect(result.error.message).toBe('Task execution failed');
    });
  });
  describe('Event Broadcasting', () => {
    let worker1;
    let worker2;
    let manager;
    beforeEach(async () => {
      // Create test members
      worker1 = new TestGuildMember('worker1', 'worker', ['task1', 'task2']);
      worker2 = new TestGuildMember('worker2', 'worker', ['task2', 'task3']);
      manager = new TestGuildMember('manager1', 'manager', ['admin', 'task1']);
      // Register members
      await guild.registerMember(worker1);
      await guild.registerMember(worker2);
      await guild.registerMember(manager);
      // Start the guild and members
      await guild.start();
    });
    test('should broadcast event to all members', () => {
      const event = {
        source: 'test',
        type: 'test-event',
        data: { test: true },
        timestamp: new Date(),
      };
      guild.broadcastEvent(event);
      expect(worker1.eventHistory.length).toBe(1);
      expect(worker2.eventHistory.length).toBe(1);
      expect(manager.eventHistory.length).toBe(1);
    });
    test('should broadcast event only to members with target role', () => {
      const event = {
        source: 'test',
        type: 'test-event',
        targetRoles: ['manager'],
        data: { test: true },
        timestamp: new Date(),
      };
      guild.broadcastEvent(event);
      expect(worker1.eventHistory.length).toBe(0);
      expect(worker2.eventHistory.length).toBe(0);
      expect(manager.eventHistory.length).toBe(1);
    });
    test('should broadcast event only to members with target capabilities', () => {
      const event = {
        source: 'test',
        type: 'test-event',
        targetCapabilities: ['task3'],
        data: { test: true },
        timestamp: new Date(),
      };
      guild.broadcastEvent(event);
      expect(worker1.eventHistory.length).toBe(0);
      expect(worker2.eventHistory.length).toBe(1);
      expect(manager.eventHistory.length).toBe(0);
    });
    test('should not send event back to source member', () => {
      const event = {
        source: 'worker1',
        type: 'test-event',
        data: { test: true },
        timestamp: new Date(),
      };
      guild.broadcastEvent(event);
      expect(worker1.eventHistory.length).toBe(0); // Source member should not receive its own event
      expect(worker2.eventHistory.length).toBe(1);
      expect(manager.eventHistory.length).toBe(1);
    });
  });
  describe('Lifecycle Management', () => {
    let worker1;
    let worker2;
    beforeEach(async () => {
      // Create test members
      worker1 = new TestGuildMember('worker1', 'worker', ['task1']);
      worker2 = new TestGuildMember('worker2', 'worker', ['task2']);
      // Register members
      await guild.registerMember(worker1);
      await guild.registerMember(worker2);
    });
    test('should start all members when guild starts', async () => {
      await guild.start();
      expect(worker1.startCalled).toBe(true);
      expect(worker2.startCalled).toBe(true);
    });
    test('should stop all members when guild stops', async () => {
      await guild.start();
      await guild.stop();
      expect(worker1.stopCalled).toBe(true);
      expect(worker2.stopCalled).toBe(true);
    });
    test('should automatically start new members when guild is already running', async () => {
      await guild.start();
      const worker3 = new TestGuildMember('worker3', 'worker', ['task3']);
      await guild.registerMember(worker3);
      expect(worker3.startCalled).toBe(true);
    });
    test('should stop member when removing while guild is running', async () => {
      await guild.start();
      await guild.removeMember('worker1');
      expect(worker1.stopCalled).toBe(true);
    });
  });
  describe('Integration with EchoAgent', () => {
    test('should wrap EchoAgent as a GuildMember', async () => {
      // Create an EchoAgent
      const echoAgent = new EchoAgent('echo1');
      await echoAgent.initialize(context);
      // Create an AgentGuildMember that wraps the EchoAgent
      const echoMember = new AgentGuildMember(
        echoAgent,
        'echo',
        ['echo', 'respond'],
        {
          name: 'Echo Member',
          description: 'A guild member that echoes messages',
          version: '1.0.0',
        }
      );
      // Register the member with the guild
      await guild.registerMember(echoMember);
      await guild.start();
      // Verify the member was registered
      const member = guild.getMember('echo1');
      expect(member).toBeDefined();
      expect(member.role).toBe('echo');
      expect(member.capabilities).toContain('echo');
      expect(member.capabilities).toContain('respond');
      // Dispatch a task to the echo agent
      const task = {
        id: 'echo-task',
        type: 'echo',
        requiredCapabilities: ['echo'],
        data: { message: 'Hello Guild!' },
      };
      const result = await guild.dispatchTask(task);
      // Verify the task was handled by the echo agent
      expect(result.success).toBe(true);
      expect(result.executedBy).toBe('echo1');
    });
  });
});
//# sourceMappingURL=GuildManager.test.js.map

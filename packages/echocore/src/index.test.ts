import { describe, it, expect } from 'vitest';
import { version, AgentManager, buildAgentContext } from './index';

describe('@echoforge/echocore', () => {
  describe('Core Module', () => {
    it('should export version information', () => {
      expect(version).toBeDefined();
      expect(typeof version).toBe('string');
    });

    it('should export AgentContext interface and builder', () => {
      expect(buildAgentContext).toBeDefined();
      expect(typeof buildAgentContext).toBe('function');

      const context = buildAgentContext();
      expect(context.logger).toBeDefined();
      expect(context.config).toBeDefined();
      expect(context.events).toBeDefined();
    });

    it('should export AgentManager', () => {
      expect(AgentManager).toBeDefined();
      expect(typeof AgentManager).toBe('function');

      const manager = new AgentManager();
      expect(manager).toBeDefined();
      expect(typeof manager.registerAgent).toBe('function');
      expect(typeof manager.unregisterAgent).toBe('function');
      expect(typeof manager.getAgent).toBe('function');
      expect(typeof manager.getAllAgents).toBe('function');
      expect(typeof manager.startAllAgents).toBe('function');
      expect(typeof manager.stopAllAgents).toBe('function');
    });
  });

  // Future test structure for EchoCore functionality
  describe('Runtime System (Future)', () => {
    it.todo('should initialize runtime environment');
    it.todo('should manage compilation targets');
    it.todo('should handle virtual machine operations');
    it.todo('should execute EchoCore programs');
    it.todo('should support multiple architectures');
  });
});

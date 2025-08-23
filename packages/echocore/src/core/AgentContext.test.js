import { describe, it, expect } from 'vitest';
import { buildAgentContext } from './AgentContext';
describe('AgentContext', () => {
  it('should initialize with logger, config, and events', () => {
    const ctx = buildAgentContext();
    expect(ctx.logger).toBeDefined();
    expect(ctx.config).toBeDefined();
    expect(ctx.events).toBeDefined();
  });
  it('should allow custom logger name', () => {
    const ctx = buildAgentContext({ loggerName: 'test-agent' });
    expect(ctx.logger).toBeDefined();
    // The logger name is internal to the logger instance and not directly testable
    // but we can verify the logger was created
    expect(typeof ctx.logger.info).toBe('function');
  });
  it('should create a config instance', () => {
    const ctx = buildAgentContext();
    expect(ctx.config).toBeDefined();
    expect(typeof ctx.config.get).toBe('function');
    expect(typeof ctx.config.set).toBe('function');
  });
  it('should create an event emitter', () => {
    const ctx = buildAgentContext();
    expect(ctx.events).toBeDefined();
    expect(typeof ctx.events.on).toBe('function');
    expect(typeof ctx.events.emit).toBe('function');
  });
});
//# sourceMappingURL=AgentContext.test.js.map

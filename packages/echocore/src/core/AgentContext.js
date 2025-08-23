/**
 * AgentContext for the EchoForge ecosystem
 * Provides a runtime context for agents with access to core utilities
 */
import { createLogger, EventEmitter } from '@echoforge/forgekit';
import { config } from '@org/config';
/**
 * Build a new agent context with default values
 * @param options Optional configuration options
 * @returns A new agent context
 */
export const buildAgentContext = (options = {}) => {
  const { loggerName = 'agent' } = options;
  // Use centralized config from @org/config
  return {
    logger: createLogger(loggerName),
    config,
    events: new EventEmitter(),
  };
};
//# sourceMappingURL=AgentContext.js.map

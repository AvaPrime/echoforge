/**
 * AgentContext for the EchoForge ecosystem
 * Provides a runtime context for agents with access to core utilities
 */
import { createLogger, Config, EventEmitter } from '@echoforge/forgekit';
/**
 * Context object passed to agents during initialization
 */
export interface AgentContext {
  /**
   * Logger instance for the agent
   */
  logger: ReturnType<typeof createLogger>;
  /**
   * Configuration for the agent
   */
  config: Config;
  /**
   * Event emitter for agent events
   */
  events: EventEmitter;
  /**
   * Additional context properties
   */
  [key: string]: any;
}
/**
 * Build a new agent context with default values
 * @param options Optional configuration options
 * @returns A new agent context
 */
export declare const buildAgentContext: (options?: {
  loggerName?: string;
  configPath?: string;
  configEnv?: string;
}) => AgentContext;
//# sourceMappingURL=AgentContext.d.ts.map

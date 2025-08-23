/**
 * Agent Plugin System
 *
 * Provides interfaces and utilities for dynamically loading and managing
 * agent plugins from the file system or configuration.
 */
import { Agent } from './Agent';
import { AgentContext } from './AgentContext';
import { AgentManager } from './AgentManager';
/**
 * Interface for an Agent Plugin module
 */
export interface AgentPlugin {
  /**
   * The default export should be an Agent class constructor
   */
  default: new (id: string, context?: AgentContext) => Agent;
}
/**
 * Configuration for an agent plugin
 */
export interface AgentPluginConfig {
  /**
   * Path to the plugin module (relative to the project root or absolute)
   */
  path: string;
  /**
   * Unique ID for the agent instance
   */
  id: string;
  /**
   * Whether to enable hot reloading of this plugin
   */
  hotReload?: boolean;
  /**
   * Whether to use a shared context or create a new isolated context
   */
  sharedContext?: boolean;
  /**
   * Additional configuration to pass to the agent
   */
  config?: Record<string, any>;
}
/**
 * Plugin Manager for dynamically loading and managing agent plugins
 */
export declare class AgentPluginManager {
  private agentManager;
  private plugins;
  /**
   * Create a new AgentPluginManager
   *
   * @param agentManager The AgentManager instance to register agents with
   */
  constructor(agentManager: AgentManager);
  /**
   * Load an agent plugin from a configuration
   *
   * @param pluginConfig Configuration for the plugin to load
   * @returns The loaded agent instance
   */
  loadPlugin(pluginConfig: AgentPluginConfig): Promise<Agent>;
  /**
   * Load multiple agent plugins from configurations
   *
   * @param pluginConfigs Array of plugin configurations to load
   * @returns Map of plugin IDs to loaded agent instances
   */
  loadPlugins(pluginConfigs: AgentPluginConfig[]): Promise<Map<string, Agent>>;
  /**
   * Reload an agent plugin
   *
   * @param id ID of the plugin to reload
   * @returns The reloaded agent instance
   */
  reloadPlugin(id: string): Promise<Agent>;
  /**
   * Unload an agent plugin
   *
   * @param id ID of the plugin to unload
   */
  unloadPlugin(id: string): Promise<void>;
  /**
   * Get all loaded plugins
   *
   * @returns Map of plugin IDs to agent instances
   */
  getLoadedPlugins(): Map<string, Agent>;
  /**
   * Set up hot reloading for a plugin
   *
   * @param id ID of the plugin to set up hot reloading for
   * @param path Path to the plugin module
   */
  private setupHotReload;
}
//# sourceMappingURL=AgentPlugin.d.ts.map

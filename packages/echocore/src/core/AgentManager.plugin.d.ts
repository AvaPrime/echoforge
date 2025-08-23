/**
 * Agent Manager Plugin Integration
 *
 * Extends the AgentManager with plugin system capabilities for dynamic
 * loading and management of agents.
 */
import { AgentManager } from './AgentManager';
import { AgentPluginConfig } from './AgentPlugin';
import { Agent } from './Agent';
/**
 * Extended AgentManager with plugin system integration
 */
export declare class PluginEnabledAgentManager extends AgentManager {
  private pluginManager;
  constructor();
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
   * Load plugins from a configuration file
   *
   * @param configPath Path to the configuration file
   * @returns Map of plugin IDs to loaded agent instances
   */
  loadPluginsFromConfig(configPath: string): Promise<Map<string, Agent>>;
}
//# sourceMappingURL=AgentManager.plugin.d.ts.map

/**
 * Agent Manager Plugin Integration
 *
 * Extends the AgentManager with plugin system capabilities for dynamic
 * loading and management of agents.
 */
import { AgentManager } from './AgentManager';
import { AgentPluginManager } from './AgentPlugin';
/**
 * Extended AgentManager with plugin system integration
 */
export class PluginEnabledAgentManager extends AgentManager {
  pluginManager;
  constructor() {
    super();
    this.pluginManager = new AgentPluginManager(this);
  }
  /**
   * Load an agent plugin from a configuration
   *
   * @param pluginConfig Configuration for the plugin to load
   * @returns The loaded agent instance
   */
  async loadPlugin(pluginConfig) {
    return this.pluginManager.loadPlugin(pluginConfig);
  }
  /**
   * Load multiple agent plugins from configurations
   *
   * @param pluginConfigs Array of plugin configurations to load
   * @returns Map of plugin IDs to loaded agent instances
   */
  async loadPlugins(pluginConfigs) {
    return this.pluginManager.loadPlugins(pluginConfigs);
  }
  /**
   * Reload an agent plugin
   *
   * @param id ID of the plugin to reload
   * @returns The reloaded agent instance
   */
  async reloadPlugin(id) {
    return this.pluginManager.reloadPlugin(id);
  }
  /**
   * Unload an agent plugin
   *
   * @param id ID of the plugin to unload
   */
  async unloadPlugin(id) {
    return this.pluginManager.unloadPlugin(id);
  }
  /**
   * Get all loaded plugins
   *
   * @returns Map of plugin IDs to agent instances
   */
  getLoadedPlugins() {
    return this.pluginManager.getLoadedPlugins();
  }
  /**
   * Load plugins from a configuration file
   *
   * @param configPath Path to the configuration file
   * @returns Map of plugin IDs to loaded agent instances
   */
  async loadPluginsFromConfig(configPath) {
    try {
      // Import the configuration file
      const config = await import(configPath);
      if (!config.plugins || !Array.isArray(config.plugins)) {
        throw new Error(
          'Invalid plugin configuration: plugins array not found'
        );
      }
      return this.loadPlugins(config.plugins);
    } catch (error) {
      throw new Error(
        `Failed to load plugins from config ${configPath}: ${error.message}`
      );
    }
  }
}
//# sourceMappingURL=AgentManager.plugin.js.map

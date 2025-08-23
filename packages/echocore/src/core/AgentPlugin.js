/**
 * Agent Plugin System
 *
 * Provides interfaces and utilities for dynamically loading and managing
 * agent plugins from the file system or configuration.
 */
/**
 * Plugin Manager for dynamically loading and managing agent plugins
 */
export class AgentPluginManager {
  agentManager;
  plugins;
  /**
   * Create a new AgentPluginManager
   *
   * @param agentManager The AgentManager instance to register agents with
   */
  constructor(agentManager) {
    this.agentManager = agentManager;
    this.plugins = new Map();
  }
  /**
   * Load an agent plugin from a configuration
   *
   * @param pluginConfig Configuration for the plugin to load
   * @returns The loaded agent instance
   */
  async loadPlugin(pluginConfig) {
    const {
      path,
      id,
      hotReload = false,
      sharedContext = true,
      config = {},
    } = pluginConfig;
    try {
      // Import the plugin module
      const plugin = await import(path);
      if (!plugin.default) {
        throw new Error(`Plugin at ${path} does not have a default export`);
      }
      // Get or create a context for the agent
      const context = sharedContext
        ? this.agentManager.getContext()
        : this.agentManager.createContext(id, config);
      // Create the agent instance
      const agent = new plugin.default(id, context);
      // Register the agent with the manager
      this.agentManager.register(agent);
      // Store the plugin information
      this.plugins.set(id, { config: pluginConfig, agent });
      // Set up hot reloading if enabled
      if (hotReload) {
        this.setupHotReload(id, path);
      }
      return agent;
    } catch (error) {
      throw new Error(`Failed to load plugin from ${path}: ${error.message}`);
    }
  }
  /**
   * Load multiple agent plugins from configurations
   *
   * @param pluginConfigs Array of plugin configurations to load
   * @returns Map of plugin IDs to loaded agent instances
   */
  async loadPlugins(pluginConfigs) {
    const agents = new Map();
    for (const config of pluginConfigs) {
      const agent = await this.loadPlugin(config);
      agents.set(config.id, agent);
    }
    return agents;
  }
  /**
   * Reload an agent plugin
   *
   * @param id ID of the plugin to reload
   * @returns The reloaded agent instance
   */
  async reloadPlugin(id) {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin with ID ${id} is not loaded`);
    }
    // Stop and unregister the current agent instance
    if (plugin.agent.isRunning()) {
      await plugin.agent.stop();
    }
    this.agentManager.unregister(id);
    // Clear the module cache for the plugin path
    const modulePath = require.resolve(plugin.config.path);
    delete require.cache[modulePath];
    // Reload the plugin
    return this.loadPlugin(plugin.config);
  }
  /**
   * Unload an agent plugin
   *
   * @param id ID of the plugin to unload
   */
  async unloadPlugin(id) {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      throw new Error(`Plugin with ID ${id} is not loaded`);
    }
    // Stop and unregister the agent
    if (plugin.agent.isRunning()) {
      await plugin.agent.stop();
    }
    this.agentManager.unregister(id);
    // Remove any file watchers
    if (plugin.watcher) {
      plugin.watcher.close();
    }
    // Remove from the plugins map
    this.plugins.delete(id);
  }
  /**
   * Get all loaded plugins
   *
   * @returns Map of plugin IDs to agent instances
   */
  getLoadedPlugins() {
    const agents = new Map();
    for (const [id, plugin] of this.plugins.entries()) {
      agents.set(id, plugin.agent);
    }
    return agents;
  }
  /**
   * Set up hot reloading for a plugin
   *
   * @param id ID of the plugin to set up hot reloading for
   * @param path Path to the plugin module
   */
  setupHotReload(id, path) {
    // This is a placeholder for actual file watching logic
    // In a real implementation, you would use a file watcher like chokidar
    // to watch for changes to the plugin file and reload it automatically
    // Example implementation with chokidar (would require the chokidar package):
    /*
        const chokidar = require('chokidar');
        
        const watcher = chokidar.watch(path, {
          persistent: true,
          ignoreInitial: true
        });
        
        watcher.on('change', async () => {
          try {
            this.agentManager.getContext().logger.info(`Plugin ${id} changed, reloading...`);
            await this.reloadPlugin(id);
            this.agentManager.getContext().logger.info(`Plugin ${id} reloaded successfully`);
          } catch (error) {
            this.agentManager.getContext().logger.error(`Failed to reload plugin ${id}`, {
              metadata: { error: (error as Error).message }
            });
          }
        });
        
        const plugin = this.plugins.get(id);
        if (plugin) {
          plugin.watcher = watcher;
        }
        */
  }
}
//# sourceMappingURL=AgentPlugin.js.map

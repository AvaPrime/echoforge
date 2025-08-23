/**
 * Agent Plugin System Example
 *
 * Demonstrates how to use the plugin system to dynamically load and manage agents.
 */
import path from 'path';
import { EventEmitter } from '@echoforge/forgekit';
import { PluginEnabledAgentManager } from '../core/AgentManager.plugin';
/**
 * Run the Agent Plugin System example
 */
async function runPluginExample() {
  console.log('Starting Agent Plugin System Example');
  // Create a shared context for all agents
  const context = new AgentContext({
    id: 'plugin-example',
    logger: console,
    events: new EventEmitter(),
    config: {},
  });
  // Create a plugin-enabled agent manager
  const manager = new PluginEnabledAgentManager();
  // Set the shared context
  manager.setContext(context);
  // Define plugin configurations
  const pluginConfigs = [
    {
      path: path.resolve(__dirname, '../agents/EchoAgent'),
      id: 'echo1',
      hotReload: true,
      sharedContext: true,
    },
    {
      path: path.resolve(__dirname, '../agents/EchoAgent'),
      id: 'echo2',
      hotReload: false,
      sharedContext: true,
      config: {
        // Custom configuration for this agent instance
        customSetting: 'value',
      },
    },
  ];
  // Load the plugins
  console.log('Loading plugins...');
  const agents = await manager.loadPlugins(pluginConfigs);
  console.log(`Loaded ${agents.size} plugins:`);
  for (const [id, agent] of agents.entries()) {
    console.log(`- ${id}: ${agent.constructor.name}`);
  }
  // Start all agents
  console.log('\nStarting all agents...');
  await manager.startAll();
  // Execute a task on each agent
  console.log('\nExecuting tasks on agents...');
  for (const [id, agent] of agents.entries()) {
    const task = {
      id: `task-${id}`,
      type: 'echo',
      data: { message: `Hello from plugin ${id}!` },
    };
    const result = await agent.executeTask(task);
    console.log(`Task result from ${id}:`, result);
  }
  // Demonstrate reloading a plugin
  console.log('\nReloading echo1 plugin...');
  try {
    const reloadedAgent = await manager.reloadPlugin('echo1');
    console.log(`Reloaded ${reloadedAgent.id} successfully`);
    // Execute a task on the reloaded agent
    const task = {
      id: 'reload-task',
      type: 'echo',
      data: { message: 'Hello from reloaded plugin!' },
    };
    const result = await reloadedAgent.executeTask(task);
    console.log('Task result from reloaded agent:', result);
  } catch (error) {
    console.error('Error reloading plugin:', error);
  }
  // Unload a plugin
  console.log('\nUnloading echo2 plugin...');
  try {
    await manager.unloadPlugin('echo2');
    console.log('Plugin unloaded successfully');
    // Verify the plugin was unloaded
    const loadedPlugins = manager.getLoadedPlugins();
    console.log(`Remaining plugins: ${loadedPlugins.size}`);
    for (const id of loadedPlugins.keys()) {
      console.log(`- ${id}`);
    }
  } catch (error) {
    console.error('Error unloading plugin:', error);
  }
  // Stop all remaining agents
  console.log('\nStopping all agents...');
  await manager.stopAll();
  console.log('Agent Plugin System Example completed');
}
// Run the example if this file is executed directly
if (require.main === module) {
  runPluginExample().catch((error) => {
    console.error('Error running Plugin example:', error);
    process.exit(1);
  });
}
export { runPluginExample };
//# sourceMappingURL=plugin-example.js.map

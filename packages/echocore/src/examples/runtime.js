/**
 * Example runtime script for EchoForge agents
 * Demonstrates how to use the AgentManager to register and start agents
 */
import { AgentManager } from '../core/AgentManager';
import { buildAgentContext } from '../core/AgentContext';
import { EchoAgent } from '../agents/EchoAgent';
/**
 * Main function to run the agent system
 */
async function main() {
  console.log('Starting EchoForge runtime...');
  // Create the agent context
  const context = buildAgentContext({
    loggerName: 'echoforge-runtime',
  });
  // Create the agent manager
  const manager = new AgentManager();
  // Create and register agents
  const echoAgent1 = new EchoAgent('echo-1');
  const echoAgent2 = new EchoAgent('echo-2');
  try {
    // Initialize the agents with context
    await echoAgent1.initialize(context);
    await echoAgent2.initialize(context);
    // Register the agents
    await manager.registerAgent(echoAgent1);
    await manager.registerAgent(echoAgent2);
    context.logger.info(`Registered ${manager.getAllAgents().length} agents`);
    // Start all agents
    await manager.startAllAgents();
    // Send a ping event to the echo agents
    context.events.emit('echo:ping', {
      message: 'Hello from runtime!',
      timestamp: new Date().toISOString(),
    });
    // Execute a task on the first echo agent
    const task = {
      id: 'runtime-task-1',
      type: 'echo',
      data: {
        message: 'This is a test task from the runtime',
        timestamp: new Date().toISOString(),
      },
    };
    const result = await echoAgent1.executeTask(task);
    context.logger.info('Task execution result:', { metadata: { result } });
    // Wait a bit before shutting down
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Stop all agents
    await manager.stopAllAgents();
    context.logger.info('Runtime shutdown complete');
  } catch (error) {
    context.logger.error('Runtime error:', { metadata: { error } });
  }
}
// Run the main function if this script is executed directly
if (require.main === module) {
  main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}
export { main };
//# sourceMappingURL=runtime.js.map

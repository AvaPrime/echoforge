#!/usr/bin/env node
/**
 * CLI script to run EchoForge agents
 */

import { AgentManager } from '../core/AgentManager';
import { buildAgentContext } from '../core/AgentContext';
import { EchoAgent } from '../agents/EchoAgent';
import { InMemoryProvider } from '../memory';

async function runCli() {
  console.log('🔥 EchoForge Agent Runner 🔥');
  console.log('----------------------------');

  // Create the agent context
  const context = buildAgentContext({
    loggerName: 'echoforge-cli',
  });

  // Initialize memory provider
  const memoryProvider = new InMemoryProvider();

  // Create the agent manager with memory support
  const manager = new AgentManager({}, [memoryProvider]);

  // Parse command line arguments
  const agentId = process.argv[2] || 'echo-cli';

  try {
    // Create and initialize the agent
    const agent = new EchoAgent(agentId);
    await agent.initialize(context);

    // Register the agent
    await manager.registerAgent(agent);

    console.log(`Registered agent: ${agent.id}`);

    // Set up event listeners
    agent.events.on('echo:pong', (data: Record<string, any>) => {
      console.log('📣 Received pong:', data);
    });

    // Start the agent
    await agent.start();
    console.log(`Started agent: ${agent.id}`);

    // Send a ping event
    context.events.emit('echo:ping', {
      message: 'Hello from CLI!',
      timestamp: new Date().toISOString(),
    });

    // Keep the process running until Ctrl+C
    console.log('\nAgent is running. Press Ctrl+C to stop.');

    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nShutting down...');
      await manager.stopAllAgents();
      console.log('Goodbye!');
      process.exit(0);
    });
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the CLI
runCli().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

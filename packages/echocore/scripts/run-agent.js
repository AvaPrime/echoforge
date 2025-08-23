#!/usr/bin/env node

/**
 * Simple CLI script to run the EchoAgent
 */

const { AgentManager } = require('../dist/core/AgentManager');
const { buildAgentContext } = require('../dist/core/AgentContext');
const { EchoAgent } = require('../dist/agents/EchoAgent');

async function runCli() {
  console.log('🔥 EchoForge Agent Runner 🔥');
  console.log('----------------------------');

  // Create the agent context
  const context = buildAgentContext({
    loggerName: 'echoforge-cli',
  });

  // Create the agent manager
  const manager = new AgentManager();

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
    agent.events.on('echo:pong', (data) => {
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

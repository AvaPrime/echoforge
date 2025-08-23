/**
 * Guild Protocol Example
 *
 * Demonstrates how to use the Guild Protocol to create a coordinated society of agents
 * that can work together to accomplish tasks.
 */
import { EventEmitter } from '@echoforge/forgekit';
import { EchoAgent } from '../agents/EchoAgent';
import { GuildManager } from '../guild/GuildManager';
import { AgentGuildMember } from '../guild/BaseGuildMember';
/**
 * Run the Guild Protocol example
 */
async function runGuildExample() {
  console.log('Starting Guild Protocol Example');
  // Create a shared context for all agents
  const context = new AgentContext({
    id: 'guild-example',
    logger: console,
    events: new EventEmitter(),
    config: {},
  });
  // Create a Guild Manager
  const guild = new GuildManager('example-guild', 'Example Guild', context);
  // Create some agents with different capabilities
  const echoAgent1 = new EchoAgent('echo1');
  const echoAgent2 = new EchoAgent('echo2');
  // Initialize the agents
  await echoAgent1.initialize(context);
  await echoAgent2.initialize(context);
  // Create Guild Members that wrap the agents
  const echoMember1 = new AgentGuildMember(
    echoAgent1,
    'responder',
    ['echo', 'respond'],
    {
      name: 'Echo Responder',
      description: 'A guild member that responds to echo requests',
      version: '1.0.0',
    }
  );
  const echoMember2 = new AgentGuildMember(
    echoAgent2,
    'broadcaster',
    ['echo', 'broadcast'],
    {
      name: 'Echo Broadcaster',
      description: 'A guild member that broadcasts messages',
      version: '1.0.0',
    }
  );
  // Register the members with the guild
  await guild.registerMember(echoMember1);
  await guild.registerMember(echoMember2);
  // Start the guild (which starts all members)
  await guild.start();
  console.log('Guild started with the following members:');
  console.log(guild.getStatus());
  // Dispatch tasks to the guild
  console.log('\nDispatching tasks to the guild...');
  // Task for a responder
  const responderTask = {
    id: 'task-1',
    type: 'echo',
    requiredCapabilities: ['respond'],
    data: { message: 'Hello from the responder task!' },
  };
  // Task for a broadcaster
  const broadcasterTask = {
    id: 'task-2',
    type: 'echo',
    requiredCapabilities: ['broadcast'],
    data: { message: 'Hello from the broadcaster task!' },
  };
  // Execute the tasks
  const result1 = await guild.dispatchTask(responderTask);
  console.log('Responder task result:', result1);
  const result2 = await guild.dispatchTask(broadcasterTask);
  console.log('Broadcaster task result:', result2);
  // Broadcast an event to all members
  console.log('\nBroadcasting event to all members...');
  guild.broadcastEvent({
    source: 'example',
    type: 'announcement',
    data: { message: 'This is a broadcast to all members' },
    timestamp: new Date(),
  });
  // Broadcast an event only to responders
  console.log('\nBroadcasting event only to responders...');
  guild.broadcastEvent({
    source: 'example',
    type: 'private-message',
    targetRoles: ['responder'],
    data: { message: 'This is only for responders' },
    timestamp: new Date(),
  });
  // Stop the guild
  console.log('\nStopping the guild...');
  await guild.stop();
  console.log('Guild Protocol Example completed');
}
// Run the example if this file is executed directly
if (require.main === module) {
  runGuildExample().catch((error) => {
    console.error('Error running Guild example:', error);
    process.exit(1);
  });
}
export { runGuildExample };
//# sourceMappingURL=guild-example.js.map

/**
 * Memory System Example
 *
 * This example demonstrates how to use the memory system with agents.
 */

import { createLogger } from '@echoforge/forgekit';
import { AgentManager } from '../core/AgentManager';
import { InMemoryProvider, SQLiteProvider, MemoryEntry } from '../memory';

const logger = createLogger('memory-example');

async function runMemoryExample() {
  logger.info('Starting memory system example');

  // Initialize memory providers
  const shortTermMemory = new InMemoryProvider();
  const longTermMemory = new SQLiteProvider(':memory:'); // In-memory SQLite for demo

  // Create agent manager with memory providers
  const manager = new AgentManager({}, [shortTermMemory, longTermMemory]);

  // Get the memory manager from the agent context
  const memoryManager = manager.getMemoryManager();

  if (!memoryManager) {
    logger.error('Memory manager not initialized');
    return;
  }

  // Store some memory entries
  const shortTermEntry: MemoryEntry = {
    id: 'thought-1',
    type: 'short-term',
    timestamp: Date.now(),
    content: { thought: 'I need to process this user request' },
    tags: ['thought', 'processing'],
    scope: 'agent',
    agentId: 'example-agent',
    visibility: 'private',
  };

  const longTermEntry: MemoryEntry = {
    id: 'fact-1',
    type: 'long-term',
    timestamp: Date.now(),
    content: { fact: 'The user prefers concise responses' },
    tags: ['preference', 'user-model'],
    scope: 'agent',
    agentId: 'example-agent',
    visibility: 'private',
  };

  // Store the entries
  await memoryManager.store(shortTermEntry);
  await memoryManager.store(longTermEntry);

  logger.info('Stored memory entries');

  // Query for recent thoughts
  const recentThoughts = await memoryManager.query({
    type: 'short-term',
    tags: ['thought'],
    agentId: 'example-agent',
  });

  logger.info(`Found ${recentThoughts.length} recent thoughts:`);
  recentThoughts.forEach((thought) => {
    logger.info(JSON.stringify(thought.content));
  });

  // Query for user preferences
  const userPreferences = await memoryManager.query({
    tags: ['preference'],
    agentId: 'example-agent',
  });

  logger.info(`Found ${userPreferences.length} user preferences:`);
  userPreferences.forEach((pref) => {
    logger.info(JSON.stringify(pref.content));
  });

  // Clean up
  await longTermMemory.close();

  logger.info('Memory example completed');
}

// Run the example if this file is executed directly
if (require.main === module) {
  runMemoryExample().catch((err) => {
    logger.error('Error running memory example:', err);
  });
}

export { runMemoryExample };

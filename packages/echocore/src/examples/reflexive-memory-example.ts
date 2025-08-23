/**
 * Reflexive Memory Example
 *
 * This example demonstrates how to use the reflexive memory system with hooks
 * that respond to memory events.
 */

import { createLogger } from '@echoforge/forgekit';
import { AgentManager } from '../core/AgentManager';
import {
  InMemoryProvider,
  SQLiteProvider,
  MemoryEntry,
  MemoryQuery,
  MemoryEventContextUnion,
  MemoryEventType,
} from '../memory';

const logger = createLogger('reflexive-memory-example');

async function runReflexiveMemoryExample() {
  logger.info('Starting reflexive memory example');

  // Initialize memory providers
  const shortTermMemory = new InMemoryProvider();
  const longTermMemory = new SQLiteProvider({ dbPath: ':memory:' }); // In-memory SQLite for demo

  // Create agent manager with memory providers
  const manager = new AgentManager({}, [shortTermMemory, longTermMemory]);

  // Get the memory manager from the agent context
  const memoryManager = manager.getMemoryManager();

  if (!memoryManager) {
    logger.error('Memory manager not initialized');
    return;
  }

  // Register a reflexive hook for store events
  memoryManager.registerHook(
    {
      id: 'store-observer',
      events: ['onStore'],
      priority: 10,
    },
    async (context) => {
      if (context.eventType === 'onStore') {
        const { entry } = context;
        logger.info(`🔔 Reflexive hook triggered: Memory stored - ${entry.id}`);
        logger.info(
          `   Type: ${entry.type}, Tags: ${entry.tags?.join(', ') || 'none'}`
        );

        // Example of reflexive behavior: Automatically tag memories based on content
        if (
          typeof entry.content === 'string' &&
          entry.content.includes('important')
        ) {
          logger.info('   🏷️ Auto-tagging as important');
          const tags = entry.tags || [];
          if (!tags.includes('important')) {
            // Update the memory with the new tag
            await memoryManager.store({
              ...entry,
              tags: [...tags, 'important'],
            });
          }
        }
      }
    }
  );

  // Register a reflexive hook for query events
  memoryManager.registerHook(
    {
      id: 'query-observer',
      events: ['onQuery'],
    },
    (context) => {
      if (context.eventType === 'onQuery') {
        const { query, results } = context;
        logger.info(`🔍 Reflexive hook triggered: Memory queried`);
        logger.info(
          `   Query type: ${query.type || 'any'}, Found: ${results.length} results`
        );

        // Example of reflexive behavior: Log when certain types of memories are accessed
        if (query.tags?.includes('important')) {
          logger.info('   ⚠️ Important memories were accessed');
        }
      }
    }
  );

  // Register a reflexive hook for delete events
  memoryManager.registerHook(
    {
      id: 'delete-observer',
      events: ['onDelete'],
    },
    (context) => {
      if (context.eventType === 'onDelete') {
        const { entryId } = context;
        logger.info(`🗑️ Reflexive hook triggered: Memory deleted - ${entryId}`);
      }
    }
  );

  // Register a multi-event hook
  memoryManager.registerHook(
    {
      id: 'memory-activity-tracker',
      events: ['onStore', 'onQuery', 'onDelete', 'onConsolidate'],
      priority: 1, // Lower priority, runs after other hooks
    },
    (context) => {
      // This hook could be used to track all memory activity for an agent
      // For example, to build a meta-awareness of memory usage patterns
      logger.debug(
        `📊 Memory activity: ${context.eventType} at ${new Date(context.timestamp).toISOString()}`
      );
    }
  );

  // Store some memory entries to trigger the hooks
  logger.info('\nStoring memories...');

  const memories = [
    {
      id: 'note-1',
      type: 'short-term',
      content: 'Remember to check the latest updates',
      tags: ['reminder', 'task'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
    },
    {
      id: 'note-2',
      type: 'long-term',
      content:
        'This is an important configuration setting that should not be changed',
      tags: ['configuration', 'system'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
    },
  ] as MemoryEntry[];

  // Store memories and observe the hooks being triggered
  for (const memory of memories) {
    await memoryManager.store(memory);
  }

  // Query memories to trigger query hooks
  logger.info('\nQuerying memories...');

  const queryResults = await memoryManager.query({
    tags: ['important'],
    maxResults: 5,
  });

  logger.info(`Query returned ${queryResults.length} results`);

  // Delete a memory to trigger delete hooks
  logger.info('\nDeleting a memory...');
  await memoryManager.delete('note-1');

  // Unregister a hook
  logger.info('\nUnregistering the store-observer hook...');
  const unregistered = memoryManager.unregisterHook('store-observer');
  logger.info(`Hook unregistered: ${unregistered}`);

  // Store another memory to show the hook is no longer triggered
  logger.info('\nStoring another memory after unregistering hook...');
  await memoryManager.store({
    id: 'note-3',
    type: 'short-term',
    content: 'This memory should not trigger the store-observer hook',
    tags: ['test'],
    scope: 'agent',
    agentId: 'example-agent',
    visibility: 'private',
  } as MemoryEntry);

  logger.info('\nReflexive memory example completed');
}

// Run the example if this file is executed directly
if (require.main === module) {
  runReflexiveMemoryExample().catch((error) => {
    console.error('Error running reflexive memory example:', error);
  });
}

export { runReflexiveMemoryExample };

/**
 * Semantic Memory Example
 *
 * This example demonstrates how to use the semantic memory system with vector embeddings.
 */

import { createLogger } from '@echoforge/forgekit';
import { AgentManager } from '../core/AgentManager';
import {
  InMemoryProvider,
  SQLiteProvider,
  VectorStoreProvider,
  OpenAIEmbeddingProvider,
  LocalEmbeddingProvider,
  MemoryEntry,
} from '../memory';

const logger = createLogger('semantic-memory-example');

async function runSemanticMemoryExample() {
  logger.info('Starting semantic memory example');

  // Choose embedding provider based on environment
  // If OPENAI_API_KEY is set, use OpenAI, otherwise use local embeddings
  const embeddingProvider = process.env.OPENAI_API_KEY
    ? new OpenAIEmbeddingProvider()
    : new LocalEmbeddingProvider();

  // Initialize memory providers
  const shortTermMemory = new InMemoryProvider();
  const longTermMemory = new SQLiteProvider({ dbPath: ':memory:' }); // In-memory SQLite for demo
  const semanticMemory = new VectorStoreProvider({ embeddingProvider });

  // Create agent manager with all memory providers
  const manager = new AgentManager({}, [
    shortTermMemory,
    longTermMemory,
    semanticMemory,
  ]);

  // Get the memory manager from the agent context
  const memoryManager = manager.getMemoryManager();

  if (!memoryManager) {
    logger.error('Memory manager not initialized');
    return;
  }

  // Store some semantic memory entries
  const memories = [
    {
      id: 'fact-1',
      type: 'semantic',
      timestamp: Date.now(),
      content: 'The user prefers concise responses with bullet points',
      tags: ['preference', 'communication-style'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
    },
    {
      id: 'fact-2',
      type: 'semantic',
      timestamp: Date.now(),
      content:
        'The user is a software developer working on a machine learning project',
      tags: ['background', 'profession'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
    },
    {
      id: 'fact-3',
      type: 'semantic',
      timestamp: Date.now(),
      content:
        'The user mentioned they have a deadline next Friday for their project',
      tags: ['schedule', 'deadline'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
    },
    {
      id: 'fact-4',
      type: 'semantic',
      timestamp: Date.now(),
      content:
        'The user is interested in natural language processing and large language models',
      tags: ['interest', 'topic'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
    },
  ] as MemoryEntry[];

  // Store all memories
  for (const memory of memories) {
    await memoryManager.store(memory);
    logger.info(`Stored memory: ${memory.id}`);
  }

  // Perform semantic search
  logger.info('Performing semantic search for communication preferences...');
  const communicationResults = await memoryManager.query({
    type: 'semantic',
    similarityTo: 'How does the user like to receive information?',
    maxResults: 2,
  });

  logger.info('Communication preference results:');
  communicationResults.forEach((result) => {
    logger.info(`- ${result.content}`);
  });

  // Perform another semantic search
  logger.info('Performing semantic search for user background...');
  const backgroundResults = await memoryManager.query({
    type: 'semantic',
    similarityTo: 'What is the user working on professionally?',
    maxResults: 2,
  });

  logger.info('User background results:');
  backgroundResults.forEach((result) => {
    logger.info(`- ${result.content}`);
  });

  // Demonstrate hybrid search (semantic + tag filtering)
  logger.info('Performing hybrid search (semantic + tags)...');
  const hybridResults = await memoryManager.query({
    type: 'semantic',
    similarityTo: "What are the user's time constraints?",
    tags: ['schedule'],
    maxResults: 2,
  });

  logger.info('Hybrid search results:');
  hybridResults.forEach((result) => {
    logger.info(`- ${result.content}`);
  });
}

// Run the example if this file is executed directly
if (require.main === module) {
  runSemanticMemoryExample().catch((error) => {
    console.error('Error running semantic memory example:', error);
  });
}

export { runSemanticMemoryExample };

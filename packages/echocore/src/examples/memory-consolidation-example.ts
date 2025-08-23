/**
 * Memory Consolidation Example
 *
 * This example demonstrates how to use the memory consolidation system
 * to identify clusters of related memories and generate consolidated summaries.
 */

import { createLogger } from '@echoforge/forgekit';
import { AgentManager } from '../core/AgentManager';
import {
  InMemoryProvider,
  SQLiteProvider,
  MemoryEntry,
  MemoryManager,
  MemoryConsolidator,
  SemanticClusteringStrategy,
  LLMSummarizationStrategy,
  OpenAIEmbeddingProvider,
} from '../memory';

const logger = createLogger('memory-consolidation-example');

// Simple mock LLM provider for demonstration purposes
class MockLanguageModelProvider {
  async generateText(prompt: string): Promise<string> {
    logger.info('Generating text with mock LLM provider');
    logger.debug('Prompt:', prompt);

    // In a real implementation, this would call an actual LLM API
    // For this example, we'll just return a simple summary
    return `This is a consolidated summary of the provided memory entries.
    The entries appear to be related to project planning and task management.
    Key points include upcoming deadlines, meeting notes, and priority tasks.`;
  }
}

async function runMemoryConsolidationExample() {
  logger.info('Starting memory consolidation example');

  // Initialize memory providers
  const memoryProvider = new InMemoryProvider();

  // Create agent manager with memory provider
  const manager = new AgentManager({}, [memoryProvider]);

  // Get the memory manager from the agent context
  const memoryManager = manager.getMemoryManager();

  if (!memoryManager) {
    logger.error('Memory manager not initialized');
    return;
  }

  // Store some sample memory entries
  logger.info('\nStoring sample memory entries...');

  const sampleMemories = [
    {
      id: 'meeting-1',
      type: 'note',
      content:
        'Team meeting discussed the upcoming product launch. Marketing team needs assets by Friday.',
      tags: ['meeting', 'product-launch'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000, // 3 days ago
    },
    {
      id: 'task-1',
      type: 'task',
      content: 'Prepare product launch materials for marketing team',
      tags: ['task', 'product-launch', 'marketing'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000, // 2 days ago
    },
    {
      id: 'note-1',
      type: 'note',
      content:
        'Marketing team requested additional product screenshots for the launch campaign',
      tags: ['product-launch', 'marketing'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
      timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000, // 1 day ago
    },
    {
      id: 'reminder-1',
      type: 'reminder',
      content: 'Deadline for marketing assets is tomorrow',
      tags: ['reminder', 'deadline', 'product-launch'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
      timestamp: Date.now() - 12 * 60 * 60 * 1000, // 12 hours ago
    },
    {
      id: 'meeting-2',
      type: 'note',
      content:
        'Budget planning meeting for Q3. Need to allocate resources for new server infrastructure.',
      tags: ['meeting', 'budget', 'planning'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
      timestamp: Date.now() - 4 * 24 * 60 * 60 * 1000, // 4 days ago
    },
    {
      id: 'task-2',
      type: 'task',
      content: 'Research cloud providers for new server infrastructure',
      tags: ['task', 'infrastructure', 'research'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
      timestamp: Date.now() - 3.5 * 24 * 60 * 60 * 1000, // 3.5 days ago
    },
    {
      id: 'note-2',
      type: 'note',
      content:
        'AWS and Azure both offer solutions that meet our requirements. Azure has better integration with our existing tools.',
      tags: ['infrastructure', 'research', 'cloud'],
      scope: 'agent',
      agentId: 'example-agent',
      visibility: 'private',
      timestamp: Date.now() - 2.5 * 24 * 60 * 60 * 1000, // 2.5 days ago
    },
  ] as MemoryEntry[];

  // Store memories
  for (const memory of sampleMemories) {
    await memoryManager.store(memory);
    logger.info(`Stored memory: ${memory.id}`);
  }

  // Initialize embedding provider
  // Note: In a real application, you would use a real embedding provider
  const embeddingProvider = new OpenAIEmbeddingProvider({
    apiKey: process.env.OPENAI_API_KEY || 'mock-api-key',
    model: 'text-embedding-ada-002',
  });

  // Mock the generateEmbedding method for this example
  embeddingProvider.generateEmbedding = async (text: string) => {
    // Generate a simple mock embedding based on the text content
    // In a real application, this would call the OpenAI API
    const hash = Array.from(text).reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

    // Generate a 10-dimensional embedding for simplicity
    return Array(10)
      .fill(0)
      .map((_, i) => Math.sin(hash + i));
  };

  // Initialize language model provider
  const languageModelProvider = new MockLanguageModelProvider();

  // Initialize clustering strategy
  const clusteringStrategy = new SemanticClusteringStrategy({
    embeddingProvider,
    similarityThreshold: 0.6,
    maxClusters: 5,
  });

  // Initialize summarization strategy
  const summarizationStrategy = new LLMSummarizationStrategy({
    languageModelProvider,
    consolidatedMemoryType: 'summary',
    maxEntriesInPrompt: 10,
  });

  // Initialize memory consolidator
  const consolidator = new MemoryConsolidator(
    memoryManager,
    clusteringStrategy,
    summarizationStrategy
  );

  // Run consolidation
  logger.info('\nRunning memory consolidation...');

  const consolidationResults = await consolidator.consolidate(
    {
      // Query all memories
      maxResults: 100,
      // Additional options
      agentId: 'example-agent',
    },
    {
      similarityThreshold: 0.6,
      minClusterSize: 2,
      maxMemoryAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      includePrivate: true,
    }
  );

  // Display results
  logger.info(
    `\nConsolidation complete. Generated ${consolidationResults.length} consolidated memories.`
  );

  for (const result of consolidationResults) {
    if (result.success && result.consolidatedMemory) {
      logger.info(`\nConsolidated Memory: ${result.consolidatedMemory.id}`);
      logger.info(`Type: ${result.consolidatedMemory.type}`);
      logger.info(`Tags: ${result.consolidatedMemory.tags?.join(', ')}`);
      logger.info(`Content: ${result.consolidatedMemory.content}`);
      logger.info(`Source Entries: ${result.sourceCluster.entries.length}`);
      logger.info(`Coherence Score: ${result.sourceCluster.coherenceScore}`);
    } else {
      logger.error(`Consolidation failed: ${result.error}`);
    }
  }

  // Query all memories including consolidated ones
  const allMemories = await memoryManager.query({
    maxResults: 100,
  });

  logger.info(`\nTotal memories after consolidation: ${allMemories.length}`);

  // Count by type
  const typeCount = allMemories.reduce(
    (acc, memory) => {
      acc[memory.type] = (acc[memory.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  logger.info('Memory counts by type:');
  for (const [type, count] of Object.entries(typeCount)) {
    logger.info(`  ${type}: ${count}`);
  }

  logger.info('\nMemory consolidation example completed');
}

// Run the example if this file is executed directly
if (require.main === module) {
  runMemoryConsolidationExample().catch((error) => {
    console.error('Error running memory consolidation example:', error);
  });
}

export { runMemoryConsolidationExample };

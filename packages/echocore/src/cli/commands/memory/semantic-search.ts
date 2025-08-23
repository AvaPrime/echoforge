import { Command } from 'commander';
import { createLogger } from '@echoforge/forgekit';
import {
  AgentManager,
  InMemoryProvider,
  SQLiteProvider,
  VectorStoreProvider,
  OpenAIEmbeddingProvider,
} from '../../../index';

const logger = createLogger('cli:memory:semantic-search');

export const semanticSearchCommand = new Command('semantic-search')
  .description('Search memories using semantic similarity')
  .requiredOption('--query <query>', 'The semantic query to search for')
  .option('--type <type>', 'Memory type to search in', 'semantic')
  .option('--agent <agentId>', 'Filter by agent ID')
  .option('--max-results <number>', 'Maximum number of results to return', '5')
  .option('--threshold <number>', 'Similarity threshold (0-1)', '0.7')
  .option('--db-path <path>', 'Path to SQLite database', './echoforge.db')
  .action(async (options) => {
    try {
      logger.info('Performing semantic search...');

      // Check for OpenAI API key
      if (!process.env.OPENAI_API_KEY) {
        logger.warn(
          'OPENAI_API_KEY environment variable not set. Semantic search requires embeddings.'
        );
        logger.warn(
          'Please set OPENAI_API_KEY or use a local embedding provider.'
        );
        return;
      }

      // Initialize providers
      const embeddingProvider = new OpenAIEmbeddingProvider();
      const shortTermMemory = new InMemoryProvider();
      const longTermMemory = new SQLiteProvider({ dbPath: options.dbPath });
      const semanticMemory = new VectorStoreProvider({ embeddingProvider });

      // Create agent manager with memory providers
      const manager = new AgentManager({}, [
        shortTermMemory,
        longTermMemory,
        semanticMemory,
      ]);
      const memoryManager = manager.getMemoryManager();

      if (!memoryManager) {
        logger.error('Memory manager not initialized');
        return;
      }

      // Prepare query
      const query = {
        type: options.type,
        similarityTo: options.query,
        maxResults: parseInt(options.maxResults, 10),
        similarityThreshold: parseFloat(options.threshold),
      };

      // Add agent filter if specified
      if (options.agent) {
        query['agentId'] = options.agent;
      }

      // Execute query
      const results = await memoryManager.query(query);

      // Display results
      logger.info(`Found ${results.length} results:`);

      if (results.length === 0) {
        logger.info('No matching memories found.');
        return;
      }

      results.forEach((result, index) => {
        const similarity = result['similarity']
          ? ` (similarity: ${result['similarity'].toFixed(2)})`
          : '';
        logger.info(`\n[${index + 1}] ID: ${result.id}${similarity}`);
        logger.info(`Type: ${result.type}`);
        logger.info(`Tags: ${result.tags?.join(', ') || 'none'}`);
        logger.info(
          `Content: ${typeof result.content === 'object' ? JSON.stringify(result.content) : result.content}`
        );
        logger.info(`Timestamp: ${new Date(result.timestamp).toISOString()}`);
      });
    } catch (error) {
      logger.error('Error performing semantic search:', error);
    }
  });

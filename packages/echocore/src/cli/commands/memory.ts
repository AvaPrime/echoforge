import { Command } from 'commander';
import { createLogger } from '@echoforge/forgekit';
import { InMemoryProvider, MemoryManager, MemoryQuery } from '../../memory';
import { semanticSearchCommand } from './memory/semantic-search';

const logger = createLogger('memory-cli');

/**
 * Register memory-related CLI commands
 * @param program The commander program instance
 */
export function registerMemoryCommands(program: Command): void {
  const memoryCommand = program
    .command('memory')
    .description('Memory system management and inspection');

  // Create a memory provider and manager for CLI operations
  const memoryProvider = new InMemoryProvider();
  const memoryManager = new MemoryManager([memoryProvider]);

  memoryCommand
    .command('inspect')
    .description('Inspect memory entries')
    .option('-t, --type <type>', 'Filter by memory type')
    .option('-a, --agent <agentId>', 'Filter by agent ID')
    .option('-s, --scope <scope>', 'Filter by scope (agent, guild, global)')
    .option('-g, --tags <tags>', 'Filter by tags (comma-separated)')
    .option('-l, --limit <limit>', 'Limit the number of results', '10')
    .action(async (options) => {
      try {
        const query: MemoryQuery = {};

        if (options.type) query.type = options.type;
        if (options.agent) query.agentId = options.agent;
        if (options.scope) query.scope = options.scope;
        if (options.tags) query.tags = options.tags.split(',');
        if (options.limit) query.maxResults = parseInt(options.limit, 10);

        logger.info(`Querying memory with filters: ${JSON.stringify(query)}`);

        const results = await memoryManager.query(query);

        if (results.length === 0) {
          logger.info('No memory entries found matching the criteria');
          return;
        }

        logger.info(`Found ${results.length} memory entries:`);
        results.forEach((entry, index) => {
          logger.info(`[${index + 1}] ID: ${entry.id}`);
          logger.info(`    Type: ${entry.type}`);
          logger.info(`    Agent: ${entry.agentId || 'N/A'}`);
          logger.info(`    Scope: ${entry.scope}`);
          logger.info(`    Tags: ${entry.tags?.join(', ') || 'none'}`);
          logger.info(
            `    Timestamp: ${new Date(entry.timestamp).toISOString()}`
          );
          logger.info(`    Content: ${JSON.stringify(entry.content, null, 2)}`);
          logger.info('---');
        });
      } catch (error) {
        logger.error('Error inspecting memory:', error);
      }
    });

  memoryCommand
    .command('store')
    .description('Store a new memory entry')
    .requiredOption('-i, --id <id>', 'Memory entry ID')
    .requiredOption(
      '-t, --type <type>',
      'Memory type (short-term, long-term, semantic, procedural)'
    )
    .requiredOption('-c, --content <content>', 'Memory content (JSON string)')
    .option('-a, --agent <agentId>', 'Agent ID')
    .option('-s, --scope <scope>', 'Scope (agent, guild, global)', 'agent')
    .option('-g, --tags <tags>', 'Tags (comma-separated)')
    .option(
      '-v, --visibility <visibility>',
      'Visibility (private, public, protected)',
      'private'
    )
    .action(async (options) => {
      try {
        const content = JSON.parse(options.content);
        const tags = options.tags ? options.tags.split(',') : undefined;

        const entry = {
          id: options.id,
          type: options.type,
          timestamp: Date.now(),
          content,
          tags,
          scope: options.scope,
          agentId: options.agent,
          visibility: options.visibility,
        };

        logger.info(`Storing memory entry: ${JSON.stringify(entry, null, 2)}`);

        await memoryManager.store(entry);

        logger.info(`Successfully stored memory entry with ID: ${options.id}`);
      } catch (error) {
        logger.error('Error storing memory:', error);
      }
    });

  memoryCommand
    .command('delete')
    .description('Delete a memory entry by ID')
    .requiredOption('-i, --id <id>', 'Memory entry ID')
    .action(async (options) => {
      try {
        logger.info(`Deleting memory entry with ID: ${options.id}`);

        await memoryManager.delete(options.id);

        logger.info(`Successfully deleted memory entry with ID: ${options.id}`);
      } catch (error) {
        logger.error('Error deleting memory:', error);
      }
    });

  // Add semantic search command
  memoryCommand.addCommand(semanticSearchCommand);
}

/**
 * LLM Summarization Strategy
 *
 * Implements a summarization strategy that uses a language model
 * to generate consolidated memories from clusters.
 */

import { MemoryEntry } from '../../MemoryContract';
import {
  MemoryCluster,
  MemorySummarizationStrategy,
  ConsolidationOptions,
} from '../MemoryConsolidationContract';
import { createLogger } from '@echoforge/forgekit';
import { v4 as uuidv4 } from 'uuid';

const logger = createLogger('LLMSummarizationStrategy');

/**
 * Interface for language model providers that can generate text.
 */
export interface LanguageModelProvider {
  /**
   * Generates text based on a prompt.
   *
   * @param prompt The prompt to send to the language model
   * @param options Optional generation options
   * @returns Generated text
   */
  generateText(prompt: string, options?: any): Promise<string>;
}

/**
 * Configuration options for the LLM summarization strategy.
 */
export interface LLMSummarizationOptions {
  /** Language model provider to use for generating summaries */
  languageModelProvider: LanguageModelProvider;

  /** Custom prompt template for summarization */
  promptTemplate?: string;

  /** Maximum number of entries to include in the prompt */
  maxEntriesInPrompt?: number;

  /** Memory type to use for consolidated memories */
  consolidatedMemoryType?: string;
}

/**
 * Default prompt template for summarization.
 */
const DEFAULT_PROMPT_TEMPLATE = `
You are an AI assistant tasked with consolidating related memories into a concise summary.

Below are ${count} related memory entries:

${entries}

Please create a consolidated memory that captures the key information, patterns, and insights from these entries.
Your summary should be concise but comprehensive, highlighting the most important aspects.

Consolidated Memory:
`;

/**
 * A summarization strategy that uses a language model to generate
 * consolidated memories from clusters.
 */
export class LLMSummarizationStrategy implements MemorySummarizationStrategy {
  private languageModelProvider: LanguageModelProvider;
  private promptTemplate: string;
  private maxEntriesInPrompt: number;
  private consolidatedMemoryType: string;

  /**
   * Creates a new LLMSummarizationStrategy instance.
   *
   * @param options Configuration options
   */
  constructor(options: LLMSummarizationOptions) {
    this.languageModelProvider = options.languageModelProvider;
    this.promptTemplate = options.promptTemplate || DEFAULT_PROMPT_TEMPLATE;
    this.maxEntriesInPrompt = options.maxEntriesInPrompt || 10;
    this.consolidatedMemoryType =
      options.consolidatedMemoryType || 'consolidated';
  }

  /**
   * Generates a consolidated memory from a cluster of related memories.
   *
   * @param cluster Cluster of related memories
   * @param options Consolidation options
   * @returns Consolidated memory entry
   */
  async summarizeCluster(
    cluster: MemoryCluster,
    options?: ConsolidationOptions
  ): Promise<MemoryEntry> {
    // Limit the number of entries to include in the prompt
    const limitedEntries = cluster.entries.slice(0, this.maxEntriesInPrompt);

    // Sort entries by timestamp (oldest first)
    limitedEntries.sort((a, b) => a.timestamp - b.timestamp);

    // Format entries for the prompt
    const formattedEntries = limitedEntries
      .map((entry, index) => {
        const content =
          typeof entry.content === 'string'
            ? entry.content
            : JSON.stringify(entry.content, null, 2);

        const timestamp = new Date(entry.timestamp).toISOString();
        const tags = entry.tags ? `[${entry.tags.join(', ')}]` : '';

        return `Entry ${index + 1} (${timestamp}) ${tags}:\n${content}\n`;
      })
      .join('\n');

    // Create the prompt
    const prompt = this.promptTemplate
      .replace('${count}', limitedEntries.length.toString())
      .replace('${entries}', formattedEntries);

    // Generate summary using language model
    logger.debug(
      `Generating summary for cluster ${cluster.id} with ${limitedEntries.length} entries`
    );
    const summary = await this.languageModelProvider.generateText(prompt);

    // Extract tags from the cluster entries
    const allTags = new Set<string>();
    for (const entry of cluster.entries) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          allTags.add(tag);
        }
      }
    }

    // Determine the agent ID and scope
    // If all entries have the same agent ID, use that; otherwise, use the first entry's agent ID
    const agentIds = new Set(
      cluster.entries.map((entry) => entry.agentId).filter(Boolean)
    );
    const agentId =
      agentIds.size === 1
        ? cluster.entries[0].agentId
        : cluster.entries[0].agentId;

    // If all entries have the same scope, use that; otherwise, use 'agent'
    const scopes = new Set(
      cluster.entries.map((entry) => entry.scope).filter(Boolean)
    );
    const scope = scopes.size === 1 ? cluster.entries[0].scope : 'agent';

    // Create the consolidated memory entry
    const consolidatedMemory: MemoryEntry = {
      id: `consolidated-${uuidv4()}`,
      type: this.consolidatedMemoryType,
      timestamp: Date.now(),
      content: summary,
      tags: [
        ...Array.from(allTags),
        'consolidated',
        `source:${cluster.entries.length}-entries`,
      ],
      scope,
      agentId,
      visibility: 'private',
      metadata: {
        consolidation: {
          sourceClusterId: cluster.id,
          sourceEntryIds: cluster.entries.map((entry) => entry.id),
          sourceEntryCount: cluster.entries.length,
          coherenceScore: cluster.coherenceScore,
          timestamp: Date.now(),
        },
        ...(options?.consolidationMetadata || {}),
      },
    };

    logger.debug(`Generated consolidated memory ${consolidatedMemory.id}`);
    return consolidatedMemory;
  }
}

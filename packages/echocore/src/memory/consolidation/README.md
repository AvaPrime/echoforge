# Memory Consolidation System

The Memory Consolidation System is a powerful component of EchoForge's cognitive architecture that enables agents to identify patterns across memory entries and generate consolidated insights.

## Overview

Memory consolidation is the process of organizing and synthesizing related memories into more compact, meaningful representations. This system provides:

1. **Pattern Recognition**: Identifying clusters of semantically related memories
2. **Memory Summarization**: Generating concise summaries from related memory clusters
3. **Knowledge Distillation**: Extracting key insights from large volumes of memories
4. **Cognitive Efficiency**: Reducing memory load while preserving important information

## Core Components

### MemoryConsolidator

The central orchestrator that manages the consolidation process:

- Queries memories based on specified criteria
- Delegates clustering to the configured strategy
- Delegates summarization to the configured strategy
- Stores consolidated memories back into the memory system

### Clustering Strategies

Responsible for identifying groups of related memories:

- **SemanticClusteringStrategy**: Uses embedding similarity to cluster semantically related memories
- Custom strategies can be implemented for different clustering approaches

### Summarization Strategies

Responsible for generating consolidated memories from clusters:

- **LLMSummarizationStrategy**: Uses language models to generate summaries
- Custom strategies can be implemented for different summarization approaches

## Usage Examples

### Basic Consolidation

```typescript
import {
  MemoryManager,
  MemoryConsolidator,
  SemanticClusteringStrategy,
  LLMSummarizationStrategy,
} from '@echoforge/echocore';

// Initialize strategies
const clusteringStrategy = new SemanticClusteringStrategy({
  embeddingProvider,
  similarityThreshold: 0.7,
});

const summarizationStrategy = new LLMSummarizationStrategy({
  languageModelProvider,
  consolidatedMemoryType: 'summary',
});

// Create consolidator
const consolidator = new MemoryConsolidator(
  memoryManager,
  clusteringStrategy,
  summarizationStrategy
);

// Run consolidation
const results = await consolidator.consolidate({
  type: ['note', 'thought', 'observation'],
  agentId: 'my-agent',
});

// Process results
console.log(`Generated ${results.length} consolidated memories`);
```

### Scheduled Consolidation

```typescript
import { MemoryConsolidator } from '@echoforge/echocore';

// Set up a scheduled consolidation process
function setupConsolidationSchedule(
  consolidator: MemoryConsolidator,
  intervalMs: number
) {
  setInterval(async () => {
    console.log('Running scheduled memory consolidation...');

    const results = await consolidator.consolidate(
      {
        timeRange: {
          start: Date.now() - 24 * 60 * 60 * 1000, // Last 24 hours
        },
        maxResults: 100,
      },
      {
        minClusterSize: 3,
        maxMemoryAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      }
    );

    console.log(`Consolidated ${results.length} memory clusters`);
  }, intervalMs);
}

// Run consolidation every hour
setupConsolidationSchedule(consolidator, 60 * 60 * 1000);
```

## Implementing Custom Strategies

### Custom Clustering Strategy

```typescript
import {
  MemoryEntry,
  MemoryCluster,
  MemoryClusteringStrategy,
} from '@echoforge/echocore';

class TopicBasedClusteringStrategy implements MemoryClusteringStrategy {
  async identifyClusters(entries: MemoryEntry[]): Promise<MemoryCluster[]> {
    // Group entries by topic tags
    const topicGroups = new Map<string, MemoryEntry[]>();

    for (const entry of entries) {
      if (entry.tags) {
        for (const tag of entry.tags) {
          if (tag.startsWith('topic:')) {
            const topic = tag.substring(6);
            if (!topicGroups.has(topic)) {
              topicGroups.set(topic, []);
            }
            topicGroups.get(topic)!.push(entry);
          }
        }
      }
    }

    // Convert groups to clusters
    const clusters: MemoryCluster[] = [];
    for (const [topic, topicEntries] of topicGroups.entries()) {
      if (topicEntries.length >= 2) {
        // Minimum cluster size
        clusters.push({
          id: `topic-${topic}-${Date.now()}`,
          entries: topicEntries,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          consolidated: false,
          metadata: { topic },
        });
      }
    }

    return clusters;
  }
}
```

### Custom Summarization Strategy

```typescript
import {
  MemoryEntry,
  MemoryCluster,
  MemorySummarizationStrategy,
} from '@echoforge/echocore';
import { v4 as uuidv4 } from 'uuid';

class KeyPointsSummarizationStrategy implements MemorySummarizationStrategy {
  async summarizeCluster(cluster: MemoryCluster): Promise<MemoryEntry> {
    // Extract key points from each entry
    const keyPoints = new Set<string>();

    for (const entry of cluster.entries) {
      const content =
        typeof entry.content === 'string'
          ? entry.content
          : JSON.stringify(entry.content);

      // Simple extraction of sentences containing key phrases
      const sentences = content.split(/[.!?]\s+/);
      for (const sentence of sentences) {
        if (
          sentence.includes('important') ||
          sentence.includes('key') ||
          sentence.includes('critical')
        ) {
          keyPoints.add(sentence.trim());
        }
      }
    }

    // Create summary content
    const summaryContent = Array.from(keyPoints).join('\n\n');

    // Create consolidated memory
    return {
      id: `keypoints-${uuidv4()}`,
      type: 'key-points-summary',
      timestamp: Date.now(),
      content: summaryContent,
      tags: ['consolidated', 'key-points'],
      scope: cluster.entries[0].scope,
      agentId: cluster.entries[0].agentId,
      visibility: 'private',
    };
  }
}
```

## Best Practices

1. **Tune Similarity Thresholds**: Adjust the similarity threshold based on your specific use case. Higher thresholds create more focused clusters but may miss some relationships.

2. **Balance Cluster Size**: Set appropriate minimum cluster sizes to avoid generating summaries for trivial clusters while capturing meaningful patterns.

3. **Consider Memory Age**: Use the `maxMemoryAge` option to focus consolidation on recent memories or specific time periods.

4. **Preserve Context**: Ensure that consolidated memories include references to their source memories to maintain traceability.

5. **Schedule Consolidation**: Run consolidation on a regular schedule or in response to specific triggers rather than on every memory operation.

6. **Monitor Performance**: Keep an eye on the performance of your consolidation process, especially with large memory stores.

## Future Enhancements

- **Hierarchical Consolidation**: Consolidating already-consolidated memories into higher-level insights
- **Cross-Agent Consolidation**: Identifying patterns across multiple agents' memories
- **Temporal Pattern Recognition**: Detecting patterns that evolve over time
- **Interactive Consolidation**: Allowing agents to guide the consolidation process based on their goals

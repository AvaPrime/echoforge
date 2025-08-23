# EchoForge Memory System

The Memory System is a core component of the EchoForge ecosystem, providing agents with the ability to store, retrieve, and manage different types of memories.

## Architecture

The Memory System is built around the following key components:

### Core Interfaces

- **MemoryEntry**: Represents a single memory entry with properties like id, type, timestamp, content, tags, scope, agentId, and visibility.
- **MemoryQuery**: Defines query parameters for retrieving memories, including type, tags, timeRange, similarityTo, and maxResults.
- **MemoryProvider**: Interface for memory storage backends, with methods for store, query, delete, and consolidate operations.

### Memory Types

- **Short-Term Memory**: Fast, in-memory storage with optional TTL for ephemeral memories.
- **Long-Term Memory**: Persistent storage for important memories that should be retained across sessions.
- **Semantic Memory**: Vector-based storage for semantic search capabilities using embeddings.
- **Procedural Memory**: Storage for action patterns and skills (future enhancement).

### Memory Providers

- **InMemoryProvider**: Implements short-term memory storage using JavaScript Maps.
- **SQLiteProvider**: Implements long-term memory storage using SQLite database.
- **VectorStoreProvider**: Implements semantic memory storage using vector embeddings for similarity search.

### Memory Manager

The `MemoryManager` serves as the central controller for orchestrating different memory providers, routing memory operations to the appropriate provider based on memory type.

## Usage

### Basic Usage

```typescript
import {
  InMemoryProvider,
  MemoryManager,
  MemoryEntry,
} from '@echoforge/echocore';

// Initialize memory provider
const memoryProvider = new InMemoryProvider();

// Create memory manager
const memoryManager = new MemoryManager([memoryProvider]);

// Store a memory entry
const entry: MemoryEntry = {
  id: 'thought-1',
  type: 'short-term',
  timestamp: Date.now(),
  content: { thought: 'I need to process this request' },
  tags: ['thought', 'processing'],
  scope: 'agent',
  agentId: 'my-agent',
  visibility: 'private',
};

await memoryManager.store(entry);

// Query memories
const results = await memoryManager.query({
  type: 'short-term',
  tags: ['thought'],
  agentId: 'my-agent',
});
```

### Semantic Memory Usage

```typescript
import {
  VectorStoreProvider,
  OpenAIEmbeddingProvider,
  MemoryManager,
  MemoryEntry,
} from '@echoforge/echocore';

// Initialize embedding provider
const embeddingProvider = new OpenAIEmbeddingProvider();

// Initialize vector store provider for semantic memory
const semanticProvider = new VectorStoreProvider({ embeddingProvider });

// Create memory manager with semantic capabilities
const memoryManager = new MemoryManager([semanticProvider]);

// Store a semantic memory entry
const entry: MemoryEntry = {
  id: 'fact-1',
  type: 'semantic',
  timestamp: Date.now(),
  content: 'The user prefers concise responses with bullet points',
  tags: ['preference', 'communication-style'],
  scope: 'agent',
  agentId: 'my-agent',
  visibility: 'private',
};

await memoryManager.store(entry);

// Query memories by semantic similarity
const results = await memoryManager.query({
  type: 'semantic',
  similarityTo: 'How does the user like to receive information?',
  maxResults: 5,
});

// Results will contain semantically similar entries, ranked by relevance
```

### Integration with AgentContext

The memory system is integrated with the `AgentContext` to provide agents with access to memory operations:

```typescript
import { AgentManager, InMemoryProvider } from '@echoforge/echocore';

// Initialize memory provider
const memoryProvider = new InMemoryProvider();

// Create agent manager with memory support
const manager = new AgentManager({}, [memoryProvider]);

// Register an agent
const agent = new MyAgent();
manager.registerAgent('my-agent', agent);

// Agent can access memory through context
// Inside agent implementation:
// this.context.memory.store(...)
// this.context.memory.query(...)
```

## CLI Commands

The memory system includes CLI commands for debugging and inspection:

```bash
# Inspect memory entries
npx echoforge memory inspect --type short-term --agent my-agent

# Store a memory entry
npx echoforge memory store --id test-1 --type short-term --content '{"message":"test"}' --agent my-agent

# Delete a memory entry
npx echoforge memory delete --id test-1

# Semantic search in memory
npx echoforge memory semantic-search --query "How does the user prefer to communicate?" --max-results 5 --threshold 0.7
```

## Reflexive Memory System

The Reflexive Memory System enables agents to respond to memory events and implement meta-cognitive behaviors:

```typescript
import {
  MemoryManager,
  InMemoryProvider,
  MemoryEventType,
} from '@echoforge/echocore';

// Initialize memory manager
const memoryProvider = new InMemoryProvider();
const memoryManager = new MemoryManager([memoryProvider], {
  enableReflexiveHooks: true,
});

// Register a reflexive hook for store events
memoryManager.registerHook(
  {
    id: 'store-observer',
    events: ['onStore'],
    priority: 10,
    memoryTypes: ['short-term'], // Optional filter by memory type
  },
  async (context) => {
    if (context.eventType === 'onStore') {
      const { entry } = context;
      console.log(`Memory stored: ${entry.id}`);

      // Implement reflexive behavior
      if (entry.content.includes('important')) {
        // Auto-tag important memories
        await memoryManager.store({
          ...entry,
          tags: [...(entry.tags || []), 'important'],
        });
      }
    }
  }
);

// Unregister a hook when no longer needed
memoryManager.unregisterHook('store-observer');
```

### Supported Event Types

- **onStore**: Triggered when a memory is stored
- **onQuery**: Triggered when memories are queried
- **onDelete**: Triggered when a memory is deleted
- **onConsolidate**: Triggered during memory consolidation

## Memory Consolidation System

The Memory Consolidation System enables agents to identify patterns across memory entries and generate consolidated summaries:

```typescript
import {
  MemoryManager,
  MemoryConsolidator,
  SemanticClusteringStrategy,
  LLMSummarizationStrategy,
  OpenAIEmbeddingProvider,
} from '@echoforge/echocore';

// Initialize providers and strategies
const embeddingProvider = new OpenAIEmbeddingProvider();
const languageModelProvider = myLLMProvider; // Your LLM implementation

// Create clustering strategy
const clusteringStrategy = new SemanticClusteringStrategy({
  embeddingProvider,
  similarityThreshold: 0.7,
});

// Create summarization strategy
const summarizationStrategy = new LLMSummarizationStrategy({
  languageModelProvider,
  consolidatedMemoryType: 'summary',
});

// Initialize memory consolidator
const consolidator = new MemoryConsolidator(
  memoryManager,
  clusteringStrategy,
  summarizationStrategy
);

// Run consolidation
const results = await consolidator.consolidate(
  {
    // Query parameters to select memories for consolidation
    agentId: 'my-agent',
    maxResults: 100,
  },
  {
    // Consolidation options
    similarityThreshold: 0.7,
    minClusterSize: 3,
    maxMemoryAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  }
);

// Process results
for (const result of results) {
  if (result.success) {
    console.log(`Created consolidated memory: ${result.consolidatedMemory.id}`);
  }
}
```

### Supported Strategies

- **SemanticClusteringStrategy**: Uses embedding similarity to identify related memories
- **LLMSummarizationStrategy**: Uses language models to generate summaries from memory clusters

## Future Enhancements

- **Distributed Memory**: Shared memory across multiple agents in a guild.
- **Advanced Vector Stores**: Integration with more sophisticated vector databases like Pinecone, Weaviate, or Milvus.

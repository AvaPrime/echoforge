# Reflexive Memory System

The Reflexive Memory System is a powerful extension to EchoForge's memory architecture that enables agents to respond to memory events and implement meta-cognitive behaviors.

## Overview

Reflexive memory provides a hook-based system that allows agents to:

1. **Observe memory operations**: Monitor when memories are stored, queried, deleted, or consolidated
2. **React to memory events**: Implement custom behaviors in response to memory operations
3. **Implement meta-cognition**: Enable agents to reflect on their own memory usage patterns
4. **Build adaptive memory systems**: Automatically tag, categorize, or transform memories based on content

## Core Components

### ReflexiveMemoryContract

Defines the core interfaces for the reflexive memory system:

- **MemoryEventType**: Enum of supported event types (`onStore`, `onQuery`, `onDelete`, `onConsolidate`)
- **MemoryEventContext**: Context information provided to hooks when events are triggered
- **ReflexiveHook**: Function signature for hook callbacks
- **ReflexiveHookOptions**: Configuration options for registering hooks

### ReflexiveMemoryManager

Manages the registration, unregistration, and triggering of memory event hooks:

- **registerHook**: Register a new hook with filtering options
- **unregisterHook**: Remove a previously registered hook
- **triggerEvent**: Trigger hooks for a specific event

## Integration with MemoryManager

The reflexive memory system is integrated with the `MemoryManager` class, which provides:

- **enableReflexiveHooks**: Option to enable/disable the reflexive system
- **registerHook**: Method to register hooks for memory events
- **unregisterHook**: Method to unregister hooks
- **getReflexiveManager**: Method to access the underlying reflexive manager

## Usage Examples

### Basic Hook Registration

```typescript
import { MemoryManager, InMemoryProvider } from '@echoforge/echocore';

// Initialize memory manager with reflexive hooks enabled
const memoryProvider = new InMemoryProvider();
const memoryManager = new MemoryManager([memoryProvider], {
  enableReflexiveHooks: true,
});

// Register a simple logging hook
memoryManager.registerHook(
  {
    id: 'memory-logger',
    events: ['onStore', 'onQuery', 'onDelete'],
  },
  (context) => {
    console.log(
      `Memory event: ${context.eventType} at ${new Date(context.timestamp).toISOString()}`
    );
  }
);
```

### Advanced Filtering

```typescript
// Register a hook for specific memory types
memoryManager.registerHook(
  {
    id: 'important-memory-observer',
    events: ['onStore'],
    memoryTypes: ['long-term'], // Only trigger for long-term memories
    agentIds: ['agent-1'], // Only trigger for a specific agent
  },
  (context) => {
    if (context.eventType === 'onStore') {
      const { entry } = context;
      // Process important memories
    }
  }
);
```

### Implementing Auto-Tagging

```typescript
// Register a hook that automatically tags memories based on content
memoryManager.registerHook(
  {
    id: 'auto-tagger',
    events: ['onStore'],
    priority: 10, // Higher priority hooks run first
  },
  async (context) => {
    if (context.eventType === 'onStore') {
      const { entry } = context;

      if (typeof entry.content === 'string') {
        // Auto-tag based on content analysis
        const newTags = [];

        if (entry.content.includes('meeting')) newTags.push('meeting');
        if (entry.content.includes('deadline')) newTags.push('deadline');
        if (entry.content.includes('important')) newTags.push('important');

        if (newTags.length > 0) {
          // Update the memory with new tags
          const existingTags = entry.tags || [];
          const uniqueTags = [...new Set([...existingTags, ...newTags])];

          await memoryManager.store({
            ...entry,
            tags: uniqueTags,
          });
        }
      }
    }
  }
);
```

## Best Practices

1. **Use unique hook IDs**: Ensure each hook has a unique ID for proper management
2. **Set appropriate priorities**: Higher priority hooks (larger numbers) run first
3. **Handle errors gracefully**: Hook errors are caught internally but should be handled in your implementation
4. **Be mindful of performance**: Hooks run on every matching memory operation, so keep them efficient
5. **Avoid infinite loops**: Be careful when storing memories within onStore hooks to prevent recursion

## Future Enhancements

- **Hook timeouts**: Ability to set timeouts for long-running hooks
- **Hook statistics**: Track hook performance and execution metrics
- **Conditional execution**: More advanced filtering based on memory content
- **Batch processing**: Optimize for bulk memory operations

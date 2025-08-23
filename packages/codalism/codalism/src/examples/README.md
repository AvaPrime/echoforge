# Codalism Examples

This directory contains examples demonstrating the Codalism paradigm and its integration with EchoForge components.

## Soulframe Example

The `soulframe-example.ts` demonstrates the integration between the Soulframe and Codalogue components, which form the foundation of Stage II in the Codalism evolution ("The Soulframe & Codalogue").

**Description:**  
This example shows how to:

- Create a Soulframe with identity, essence, memory, voice, growth, and relationships
- Initialize a Codalogue to track the dialogue-driven evolution of the system
- Simulate a design dialogue between human and system
- Update the Soulframe based on the dialogue
- Record system reflections and evolution
- Track the history and statistics of the system's development

**Running the Example:**

```bash
# From the package root directory

# Development mode (using ts-node)
pnpm run soulframe:dev

# Production mode (builds first, then runs from dist)
pnpm run soulframe

# Skip the build step if already built
pnpm run soulframe -- --skip-build
```

## Basic Examples

### Basic Interpreter Example

`basic-interpreter-example.ts` demonstrates the core functionality of the Codalism Interpreter, showing how to transform natural language input into a semantic blueprint.

```typescript
const interpreter = new CodalismInterpreter();
const input =
  'Create a system that reads user input from a CLI, stores it in a searchable memory, and analyzes it for emotional tone.';
const blueprint = await interpreter.interpret(input);

console.log('Blueprint created:');
console.log(`- Name: ${blueprint.name}`);
console.log(
  `- Intents: ${blueprint.intents.map((i) => i.description).join(', ')}`
);
console.log(`- Modules: ${blueprint.modules.map((m) => m.name).join(', ')}`);
```

### Advanced Interpreter Example

`advanced-interpreter-example.ts` shows how to use the Codalism Interpreter with a language model provider for enhanced interpretation capabilities.

```typescript
class MockLanguageModelProvider implements LanguageModelProvider {
  async complete(prompt: string): Promise<string> {
    // Implementation details...
  }
}

const mockLLM = new MockLanguageModelProvider();
const interpreter = new CodalismInterpreter({
  languageModelProvider: mockLLM,
});

const blueprint = await interpreter.interpret(input);
```

## Integration Examples

### Blueprint Evolution Example

`blueprint-evolution-example.ts` demonstrates how to use the Codalism Interpreter with the Memory Consolidation system to track and evolve blueprints over time.

```typescript
const memoryManager = new MemoryManager({
  enableReflexiveHooks: true,
});

const consolidator = new MemoryConsolidator(
  memoryManager,
  clusteringStrategy,
  summarizationStrategy
);

// Process multiple inputs as an evolution of the system
for (let i = 0; i < inputs.length; i++) {
  const blueprint = await interpreter.interpret(inputs[i]);
  await memoryManager.store({
    type: 'blueprint',
    content: blueprint.toJSON(),
    tags: ['blueprint', 'system_design'],
    metadata: { version: i + 1 },
  });
}

// Consolidate blueprints to identify patterns
const results = await consolidator.consolidate({
  type: ['blueprint'],
  tags: ['system_design'],
});
```

### Reflexive Blueprint Example

`reflexive-blueprint-example.ts` demonstrates how to use the Codalism Interpreter with the Reflexive Memory system to create a self-evolving blueprint.

```typescript
class BlueprintEvolver {
  async suggestImprovements(blueprint: SemanticBlueprint): Promise<any> {
    // Implementation details...
  }

  async applyImprovements(
    blueprint: SemanticBlueprint,
    improvements: any
  ): Promise<SemanticBlueprint> {
    // Implementation details...
  }
}

// Register a hook to trigger blueprint evolution when a new blueprint is stored
memoryManager.registerHook({
  eventType: MemoryEventType.onStore,
  memoryType: 'blueprint',
  hook: async (context) => {
    // Implementation details...
  },
});
```

### Semantic Graph Example

`semantic-graph-example.ts` demonstrates how to use the Codalism Interpreter with a semantic graph representation to visualize and analyze system components and their relationships.

```typescript
function blueprintToGraph(blueprint: SemanticBlueprint): SemanticGraph {
  // Implementation details...
}

function generateDotGraph(graph: SemanticGraph): string {
  // Implementation details...
}

const blueprint = await interpreter.interpret(input);
const graph = blueprintToGraph(blueprint);
const dot = generateDotGraph(graph);
```

## Running the Examples

To run any of these examples, use the following command:

```bash
pnpm --filter @echoforge/codalism run build
node dist/examples/[example-file-name].js
```

For example, to run the basic interpreter example:

```bash
pnpm --filter @echoforge/codalism run build
node dist/examples/basic-interpreter-example.js
```

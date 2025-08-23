# EchoForge Recomposer Examples

This directory contains example scripts demonstrating how to use the `@echoforge/recomposer` package for blueprint composition, capability extraction, and blueprint diffing.

## Example Blueprints

The `example-blueprints` directory contains sample blueprint files:

- `agent1.json`: A TextAnalyzer blueprint with capabilities for sentiment analysis, entity extraction, and key phrase identification
- `agent2.json`: A ContentGenerator blueprint with capabilities for generating articles, social media posts, emails, and creative content

## Example Scripts

### 1. Blueprint Composition

`compose-blueprints.js` demonstrates how to:

- Load multiple blueprints
- Compose them into a new blueprint
- Extract a capability
- Generate a diff between the original and composed blueprints

```bash
node compose-blueprints.js
```

### 2. Capability Extraction

`extract-capability.js` demonstrates how to:

- Extract a single function
- Extract a function with related functions
- Extract capabilities by intent tag
- Extract a capability with dependencies

```bash
node extract-capability.js
```

### 3. Blueprint Diffing

`blueprint-diff.js` demonstrates how to:

- Compare two blueprints
- Generate a diff summary
- Create a narrative of the changes
- Generate a detailed diff report

```bash
node blueprint-diff.js
```

## Integration Examples

### 4. Validator Integration

`validator-integration.js` demonstrates how to:

- Validate individual blueprints before composition
- Configure the composer to validate after composition
- Generate validation reports

```bash
node validator-integration.js
```

### 5. Reflexive Memory Integration

`memory-integration.js` demonstrates how to:

- Store blueprints in Reflexive Memory
- Track blueprint composition events
- Generate agent evolution reports
- Store diff narratives for cognitive tracing

```bash
node memory-integration.js
```

## Output

All example scripts save their output to the `output` directory, which is created automatically if it doesn't exist.

## Usage Notes

1. These examples assume you have built the `@echoforge/recomposer` package. If you haven't, run:

   ```bash
   cd ../
   npm run build
   ```

2. The examples use Node.js's `require()` to import the package. In a TypeScript project, you would use:

   ```typescript
   import {
     BlueprintComposer,
     CapabilityExtractor,
     BlueprintDiff,
   } from '@echoforge/recomposer';
   ```

3. For CLI usage, refer to the Codessa CLI documentation or run:

   ```bash
   codessa compose --help
   ```

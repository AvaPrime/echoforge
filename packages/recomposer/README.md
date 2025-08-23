# @echoforge/recomposer

> Agent Recomposer Module for EchoForge - enables blueprint fusion, capability extraction, and agent evolution

## Overview

The Agent Recomposer Module is a core component of the EchoForge platform that enables the composition, decomposition, and evolution of agent blueprints. It allows for:

- **Blueprint Fusion**: Combine multiple validated blueprints into a new, cohesive agent
- **Capability Extraction**: Extract specific capabilities from blueprints to create reusable modules
- **Blueprint Inheritance**: Build new agents that inherit and extend capabilities from existing ones
- **Agent Evolution**: Support for self-modifying and self-optimizing agents

[![Test Coverage](https://img.shields.io/badge/coverage-75%25-yellow.svg)](./coverage/lcov-report/index.html)
[![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)](../../.github/workflows/ci.yml)

## Features

- **Capability Merging**: Combine capabilities from multiple blueprints with configurable conflict resolution
- **Metadata Harmonization**: Maintain agent ID lineage and capability provenance during composition
- **Auto-Refinement**: Optional automatic refinement of composed blueprints
- **Minimal Viable Capability Modules**: Extract only the essential components needed for a specific capability
- **Blueprint Diffing**: Compare original and recomposed blueprints for auditing and cognitive tracing

## Testing

The recomposer package includes comprehensive test coverage for all core components:

- **Unit Tests**: Complete test suite for BlueprintComposer, CapabilityExtractor, and BlueprintDiff
- **Coverage Reports**: Automated coverage reporting with thresholds
- **Analysis Tools**: Coverage analyzer and blueprint test analyzer

For more information on testing, see [TESTING.md](./TESTING.md).

To run tests:

```bash
# Run all tests
npm test

# Run tests with coverage reporting
npm run test:coverage

# Run tests in watch mode during development
npm run test:watch
```

- **Validation Integration**: Ensure recomposed blueprints maintain integrity and meet validation requirements

## Installation

```bash
npm install @echoforge/recomposer
```

## Usage

### Basic Blueprint Composition

```typescript
import { BlueprintComposer } from '@echoforge/recomposer';

// Create a new composer instance
const composer = new BlueprintComposer();

// Compose multiple blueprints into a new one
const composedBlueprint = await composer.compose(
  [blueprint1, blueprint2, blueprint3],
  {
    conflictStrategy: 'conservative',
    autoRefine: true,
    maintainLineage: true,
  }
);

// Save the composed blueprint
await saveBlueprint(composedBlueprint, 'path/to/composed-blueprint.json');
```

### Capability Extraction

```typescript
import { CapabilityExtractor } from '@echoforge/recomposer';

// Create a new extractor instance
const extractor = new CapabilityExtractor();

// Extract a specific capability from a blueprint
const capabilityModule = await extractor.extract(blueprint, {
  selector: 'fetchAndProcessData',
  includeRelatedFunctions: true,
  generateMinimalViableModule: true,
});

// Save the extracted capability as a new blueprint
await saveBlueprint(capabilityModule, 'path/to/capability-module.json');
```

### Blueprint Diffing

```typescript
import { BlueprintDiff } from '@echoforge/recomposer';

// Create a diff between original and recomposed blueprints
const diff = BlueprintDiff.compare(originalBlueprint, recomposedBlueprint);

// Generate a narrative of the changes
const narrative = diff.generateNarrative();
console.log(narrative);

// Check if specific capabilities were modified
const dataProcessingChanges = diff.getCapabilityChanges('dataProcessing');
console.log(dataProcessingChanges);
```

### CLI Usage

```bash
# Compose multiple blueprints
codessa compose --blueprints agent1.json,agent2.json --output merged.json --strategy conservative

# Extract a capability
codessa compose --extract fetchAndProcess --blueprint agent1.json --output capability.json

# Compose and validate
codessa compose --blueprints agent1.json,agent2.json --output merged.json --validate
```

## API Reference

### BlueprintComposer

- `compose(blueprints, options)`: Compose multiple blueprints into a new one
- `mergeCapabilities(capabilities, options)`: Merge capabilities with conflict resolution
- `resolveConflicts(conflicts, strategy)`: Resolve conflicts using the specified strategy
- `finalizeBlueprint(blueprint)`: Finalize a blueprint after composition

### CapabilityExtractor

- `extract(blueprint, options)`: Extract a capability from a blueprint
- `createMinimalViableModule(capability)`: Create a minimal viable module from a capability
- `identifyDependencies(capability)`: Identify dependencies for a capability

### BlueprintDiff

- `compare(original, recomposed)`: Compare two blueprints and generate a diff
- `generateNarrative()`: Generate a narrative of the changes
- `getCapabilityChanges(capability)`: Get changes for a specific capability

## Configuration Options

### Composition Options

- `conflictStrategy`: Strategy for resolving conflicts (`conservative`, `aggressive`, `manual`)
- `autoRefine`: Whether to automatically refine the composed blueprint
- `maintainLineage`: Whether to maintain agent ID lineage and capability provenance
- `validateAfterComposition`: Whether to validate the composed blueprint

### Extraction Options

- `selector`: Function, class, or intent tag to extract
- `includeRelatedFunctions`: Whether to include related functions
- `generateMinimalViableModule`: Whether to generate a minimal viable module

## Integration

### With Validator Engine

```typescript
import { BlueprintComposer } from '@echoforge/recomposer';
import { ValidatorEngine } from '@echoforge/validator';

const composer = new BlueprintComposer();
const validator = new ValidatorEngine();

// Compose and validate
const composedBlueprint = await composer.compose([blueprint1, blueprint2]);
const validationResult = await validator.validate(composedBlueprint);

if (validationResult.status === 'success') {
  console.log('Composed blueprint is valid!');
} else {
  console.error(
    'Composed blueprint failed validation:',
    validationResult.summary
  );
}
```

### With Reflexive Memory

```typescript
import { BlueprintComposer, BlueprintDiff } from '@echoforge/recomposer';
import { ReflexiveMemory } from '@echoforge/mirror';

const composer = new BlueprintComposer();
const memory = new ReflexiveMemory();

// Compose blueprints
const composedBlueprint = await composer.compose([blueprint1, blueprint2]);

// Generate diff and store in memory
const diff = BlueprintDiff.compare(blueprint1, composedBlueprint);
const narrative = diff.generateNarrative();

await memory.store({
  type: 'composition_event',
  agent: composedBlueprint.id,
  parents: [blueprint1.id, blueprint2.id],
  narrative,
  timestamp: new Date().toISOString(),
});
```

## License

MIT

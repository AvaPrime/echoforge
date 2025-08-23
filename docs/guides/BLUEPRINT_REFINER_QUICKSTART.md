# BlueprintRefiner Quick Start Guide

## Overview

The BlueprintRefiner is a powerful tool for interactively enhancing Codalism blueprints and generating agents. This guide will help you get started with using the BlueprintRefiner in your EchoForge projects.

## Installation

The BlueprintRefiner is included in the EchoForge codebase. Make sure you have the latest version of EchoForge installed:

```bash
# Clone the repository if you haven't already
git clone https://github.com/your-org/echoforge.git
cd echoforge

# Install dependencies
pnpm install
```

## Basic Usage

### Creating a BlueprintRefiner

```typescript
import { BlueprintRefiner } from '../codalism-interpreter/blueprint_refiner';
import { CodalBlueprint } from '../codalism-interpreter/codalism_interpreter';

// Create a refiner with default options
const refiner = new BlueprintRefiner();

// Or with specific options
const refinerWithOptions = new BlueprintRefiner({
  interactive: true, // Enable interactive mode (default: true)
  saveMemory: true, // Save to reflexive memory (default: false)
});
```

### Refining a Blueprint

```typescript
// Assuming you have a CodalBlueprint object
const blueprint: CodalBlueprint = {
  id: 'example-blueprint',
  intent: 'Process data and send notifications',
  confidence: 0.85,
  dominantSequence: ['dataProcessing', 'notification'],
  suggestedAgents: ['DataProcessor', 'NotificationService'],
  // ... other blueprint properties
};

// Refine the blueprint
const refinedBlueprint = await refiner.refineBlueprint(blueprint);

console.log('Refined blueprint:', refinedBlueprint);
```

### Refining Multiple Blueprints

```typescript
// Assuming you have an array of blueprints
const blueprints: CodalBlueprint[] = [
  // ... multiple blueprint objects
];

// Refine all blueprints
const refinedBlueprints = await refiner.refineMultipleBlueprints(blueprints);

console.log(`Refined ${refinedBlueprints.length} blueprints`);
```

### Generating Agents from Blueprints

```typescript
// Generate agents from refined blueprints
await refiner.generateAgents(refinedBlueprints);
```

## Refinement Modes

### Interactive Mode

In interactive mode, the BlueprintRefiner will prompt you with questions to refine the blueprint:

```typescript
const refiner = new BlueprintRefiner({ interactive: true });
const refinedBlueprint = await refiner.refineBlueprint(blueprint);
```

When running in interactive mode, you'll be presented with options:

1. **Interactive Q&A**: Answer questions to refine the blueprint
2. **Edit JSON directly**: Manually edit the blueprint JSON
3. **Skip refinement**: Use the blueprint as-is

### Batch Mode

In batch mode, the BlueprintRefiner will apply default refinements without user interaction:

```typescript
const refiner = new BlueprintRefiner({ interactive: false });
const refinedBlueprints = await refiner.refineMultipleBlueprints(blueprints);
```

### Headless Mode

Headless mode outputs blueprints for manual editing:

```typescript
const refiner = new BlueprintRefiner();
await refiner.handleHeadlessMode(blueprint);
```

## Working with Test Suite Generator

The TestSuiteGenerator creates test suites for refined blueprints:

```typescript
import { TestSuiteGenerator } from '../codalism-interpreter/test_suite_generator';

// Create a test suite generator
const testGenerator = new TestSuiteGenerator();

// Generate tests for a blueprint
const tests = testGenerator.generateTests(refinedBlueprint);
console.log('Generated tests:', tests);

// Generate tests for multiple blueprints
const allTests =
  testGenerator.generateTestsForMultipleBlueprints(refinedBlueprints);
console.log(`Generated ${allTests.length} test suites`);
```

## Storage and Integration

### Blueprint Storage

Refined blueprints are automatically stored in the `.codessa/blueprints` directory:

```
.codessa/
  blueprints/
    blueprint-123456.json
    blueprint-789012.json
```

### Reflexive Memory Integration

When enabled, blueprints are also saved to reflexive memory:

```typescript
const refiner = new BlueprintRefiner({ saveMemory: true });
const refinedBlueprint = await refiner.refineBlueprint(blueprint);
// Blueprint is automatically saved to reflexive memory
```

## Advanced Usage

### Custom Refinement Annotations

```typescript
import { RefinementAnnotation } from '../codalism-interpreter/blueprint_refiner';

// Create a custom annotation
const annotation: RefinementAnnotation = {
  timestamp: new Date().toISOString(),
  author: 'Developer Name',
  notes: 'Refined to improve agent capabilities',
  changes: ['Updated intent', 'Added new capabilities'],
};

// Apply the annotation manually
refinedBlueprint.refinementAnnotation = annotation;
```

## Troubleshooting

### Common Issues

- **TypeScript Errors**: Make sure you're using the correct interfaces and types
- **Missing Dependencies**: Ensure all required packages are installed
- **Permission Issues**: Check file permissions when saving to `.codessa` directory

### Getting Help

If you encounter issues with the BlueprintRefiner, check the following resources:

- [Blueprint Refiner TODO](BLUEPRINT_REFINER_TODO.md) - Known issues and planned fixes
- [Blueprint Refiner Roadmap](BLUEPRINT_REFINER_ROADMAP.md) - Future enhancements
- [Developer Onboarding Guide](DEVELOPER_ONBOARDING.md) - General EchoForge development guidance

---

_This quick start guide is maintained by the EchoForge team and will be updated as the BlueprintRefiner evolves._

# @echoforge/validator

> Blueprint Test Validator Engine for the EchoForge platform

## Overview

The Blueprint Test Validator Engine creates a trust layer between blueprint generation and agent deployment. It ensures Codessa's cognitive agents behave as semantically expected — a prerequisite for advanced features like reflexive self-healing agents, guild-level contract enforcement, multi-agent swarm composition, and Codessa Forge visual simulation.

## Features

For each generated agent or behavior unit, the Blueprint Test Validator Engine:

- Parses expected behaviors from blueprint annotations (intent + capability + context)
- Synthesizes assertion contracts (pre/post-conditions, invariants, triggers)
- Runs simulated or mock-based tests in both headless and interactive modes
- Stores results in Reflexive Memory (optionally), annotating blueprint lineage

## Installation

```bash
pnpm add @echoforge/validator
```

## Usage

### Basic Usage

```typescript
import { ValidatorEngine } from '@echoforge/validator';

// Create a validator engine with default options
const validator = new ValidatorEngine();

// Validate a blueprint
const blueprint = {
  id: 'data-harvester-001',
  name: 'DataHarvesterAgent',
  intent: 'Collect and process data from specified web sources',
  // ... other blueprint properties
};

const result = await validator.validateBlueprint(blueprint);
console.log(result.status); // PASSED, FAILED, ERROR, etc.
```

### Interactive Mode

```typescript
import { ValidatorEngine } from '@echoforge/validator';

// Create a validator engine in interactive mode
const validator = ValidatorEngine.createInteractive();

// Validate a blueprint
const result = await validator.validateBlueprint(blueprint);
```

### Headless Mode

```typescript
import { ValidatorEngine } from '@echoforge/validator';

// Create a validator engine in headless mode
const validator = ValidatorEngine.createHeadless();

// Validate a blueprint
const result = await validator.validateBlueprint(blueprint);
```

### Batch Validation

```typescript
import { ValidatorEngine } from '@echoforge/validator';

// Create a validator engine
const validator = new ValidatorEngine();

// Validate multiple blueprints
const blueprints = [
  // ... array of blueprints
];

const results = await validator.validateBlueprintBatch(blueprints);
```

### CLI Usage

```bash
# Validate a single blueprint
codessa validate path/to/blueprint.json

# Validate a single blueprint in interactive mode
codessa validate path/to/blueprint.json --interactive

# Validate all blueprints in a directory
codessa validate path/to/blueprints/

# Validate with autofix enabled
codessa validate path/to/blueprint.json --autofix

# Validate with Guild behavioral contracts
codessa validate path/to/blueprint.json --guild-mode
```

## Configuration

```typescript
import {
  ValidatorEngine,
  ValidationMode,
  ValidationLevel,
} from '@echoforge/validator';

// Create a validator engine with custom options
const validator = new ValidatorEngine({
  mode: ValidationMode.INTERACTIVE,
  validationLevel: ValidationLevel.STRICT,
  autofix: true,
  useGuildContracts: true,
  storeInReflexiveMemory: true,
  continueOnFailure: false,
  timeout: 10000,
});
```

## Integration

For detailed integration guides, see the [Blueprint Validator Integration Guide](../../docs/BLUEPRINT_VALIDATOR_INTEGRATION.md).

## License

MIT

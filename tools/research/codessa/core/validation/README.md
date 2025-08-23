# Blueprint Test Validator Engine

The Blueprint Test Validator Engine creates a trust layer between blueprint generation and agent deployment. It ensures Codessa's cognitive agents behave as semantically expected — a prerequisite for advanced features like reflexive self-healing agents, guild-level contract enforcement, multi-agent swarm composition, and Codessa Forge visual simulation.

## Features

For each generated agent or behavior unit, the Blueprint Test Validator Engine:

- Parses expected behaviors from blueprint annotations (intent + capability + context)
- Synthesizes assertion contracts (pre/post-conditions, invariants, triggers)
- Runs simulated or mock-based tests in both headless and interactive modes
- Stores results in Reflexive Memory (optionally), annotating blueprint lineage

## Module Structure

```
/codessa/core/validation/
├── ValidatorEngine.ts            // Main orchestrator
├── AssertionSynthesizer.ts       // Converts blueprint into test specs
├── TestCaseGenerator.ts          // Generates test cases per capability
├── BlueprintTestRunner.ts        // Executes and validates agent behaviors
├── ValidatorConfig.ts            // Config options (modes, thresholds, mocks)
└── interfaces/
    ├── TestAssertion.ts
    ├── ValidationResult.ts
    └── ValidatorOptions.ts
```

## Usage

### CLI Usage

The Blueprint Test Validator Engine can be used via the Codessa CLI:

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

### Programmatic Usage

```typescript
import { ValidatorEngine } from 'codessa/core/validation/ValidatorEngine';

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

// Create a validator engine in interactive mode
const interactiveValidator = ValidatorEngine.createInteractive();

// Create a validator engine in headless mode
const headlessValidator = ValidatorEngine.createHeadless();
```

## Assertion Types

The Blueprint Test Validator Engine supports the following assertion types:

- **Precondition**: Conditions that must be true before a function is executed
- **Postcondition**: Conditions that must be true after a function is executed
- **Invariant**: Conditions that must remain true throughout execution
- **Trigger**: Events that should cause specific behaviors
- **Capability**: Abilities that an agent should possess

## Configuration Options

The Blueprint Test Validator Engine can be configured with the following options:

- **Mode**: Interactive or headless
- **Validation Level**: Strict, normal, or relaxed
- **Autofix**: Attempt to automatically fix validation issues
- **Guild Contracts**: Compare against Guild behavioral contracts
- **Reflexive Memory**: Store validation results in Reflexive Memory
- **Timeout**: Maximum time for validation
- **Continue on Failure**: Continue validation even if assertions fail

## Extensions

- **Autofix Mode**: Suggests and refines agent logic if validation fails
- **Guild Mode**: Compares against Guild behavioral contracts
- **Visual Test Flow Maps**: Visualizes test flows in Codessa Forge UI (v2)

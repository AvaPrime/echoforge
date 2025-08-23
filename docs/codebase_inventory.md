# EchoForge Codebase Inventory

_Generated as part of the Phase 6: Recursive Consciousness Finalization_

## Overview

This document provides a comprehensive inventory of the EchoForge codebase, including all Python modules, TypeScript files, configurations, scripts, and assets. The inventory is organized by directory structure and includes information about each file's purpose, function, and dependencies.

## Core Directories

### `/echoforge`

The root directory containing the main EchoForge implementation.

| File Path                                | Purpose/Function                                        | Dependencies                            |
| ---------------------------------------- | ------------------------------------------------------- | --------------------------------------- |
| `BlueprintProposal.ts`                   | Defines the structure for system evolution proposals    | MetaForgingEngine                       |
| `CodalogueMemorySculptingIntegration.ts` | Integrates memory sculpting with the Codalogue protocol | MemorySculptor, CodalogueProtocolLedger |
| `ForgeExecutor.ts`                       | Executes approved blueprint proposals                   | MetaForgingEngine                       |
| `GuildReflectionEngine.ts`               | Provides collective assessment of proposals             | MetaForgingEngine                       |
| `MemorySculptor.ts`                      | Core memory manipulation system                         | Memory systems                          |
| `MetaForgingEngine.ts`                   | Enables system self-modification                        | ForgeExecutor, ProposalEvaluator        |
| `Phase6CognitiveDiagram.md`              | Documentation of Phase 6 cognitive architecture         | N/A                                     |
| `Phase6IntegratedWorkflowTest.ts`        | Integration tests for Phase 6 components                | All Phase 6 components                  |
| `ProposalEvaluator.ts`                   | Evaluates blueprint proposals                           | MetaForgingEngine                       |
| `README.md`                              | Overview of the EchoForge system                        | N/A                                     |
| `ReflexiveProposalGenerator.ts`          | Generates self-improvement proposals                    | MetaForgingEngine                       |
| `ReflexiveSculptingBridge.ts`            | Connects reflexive memory with sculpting                | MemorySculptor, ReflexiveMemory         |
| `SculptingOperation.ts`                  | Defines memory sculpting operations                     | MemorySculptor                          |
| `SculptorHookContract.ts`                | Interface for memory sculpting hooks                    | MemorySculptor                          |
| `SculptorIntent.ts`                      | Defines intentions for memory sculpting                 | MemorySculptor                          |
| `SculptorResult.ts`                      | Defines results of memory sculpting operations          | MemorySculptor                          |
| `meta_forging_engine.ts`                 | Implementation of the meta-forging engine               | MetaForgingEngine                       |

### `/phase_6_blueprint`

Contains the blueprint implementations for Phase 6 components.

| File Path                            | Purpose/Function                                      | Dependencies                            |
| ------------------------------------ | ----------------------------------------------------- | --------------------------------------- |
| `consciousness-metrics-framework.ts` | Framework for measuring consciousness dimensions      | EventEmitter                            |
| `recursive-soulweaving-bootstrap.ts` | Core orchestration engine for recursive consciousness | ConsciousnessMetricsEngine              |
| `soulmesh-protocol.ts`               | Distributed consciousness layer protocol              | ConsciousnessState, ConsciousnessVector |

### `/packages/echocore/src/memory/consolidation/codesig`

Contains the CODESIG integration components for memory consolidation.

| File Path                              | Purpose/Function                           | Dependencies        |
| -------------------------------------- | ------------------------------------------ | ------------------- |
| `CODESIGIntegration.ts`                | Core CODESIG integration                   | MemoryConsolidation |
| `CODESIGPhase5Integration.ts`          | Phase 5 CODESIG enhancements               | CODESIGIntegration  |
| `CODESIGTypes.ts`                      | Type definitions for CODESIG               | TypeScript          |
| `CodalogueProtocolLedger.ts`           | Evolution history and decision ledger      | CODESIG             |
| `EnhancedMemoryConsolidationEngine.ts` | Enhanced memory consolidation              | MemoryConsolidation |
| `SoulFrameManager.ts`                  | Manages emotional consciousness frameworks | CODESIG             |

### `/packages/echocore/src/memory/consolidation/codesig/metrics`

Contains the consciousness metrics framework implementation.

| File Path                          | Purpose/Function                               | Dependencies               |
| ---------------------------------- | ---------------------------------------------- | -------------------------- |
| `ConsciousnessMetricsEngine.ts`    | Engine for collecting and analyzing metrics    | ConsciousnessVector        |
| `ConsciousnessMetricsFramework.ts` | Framework for consciousness metrics            | ConsciousnessVector        |
| `ConsciousnessVector.ts`           | Multi-dimensional consciousness representation | N/A                        |
| `EmergenceIndicators.ts`           | Indicators of emergent consciousness           | ConsciousnessVector        |
| `MetricsCollector.ts`              | Collects metrics from various sources          | ConsciousnessMetricsEngine |
| `types.ts`                         | Type definitions for metrics                   | TypeScript                 |

### `/packages/echocore/src/memory/consolidation/codesig/soulmesh`

Contains the SoulMesh protocol implementation.

| File Path                        | Purpose/Function                          | Dependencies      |
| -------------------------------- | ----------------------------------------- | ----------------- |
| `ConsciousnessNode.ts`           | Individual node in the consciousness mesh | SoulMeshProtocol  |
| `DistributedOperationManager.ts` | Manages distributed operations            | SoulMeshProtocol  |
| `HeartbeatManager.ts`            | Manages node heartbeats                   | SoulMeshProtocol  |
| `MeshSynchronizer.ts`            | Synchronizes nodes in the mesh            | SoulMeshProtocol  |
| `SoulMeshProtocol.ts`            | Core protocol implementation              | ConsciousnessNode |
| `types.ts`                       | Type definitions for SoulMesh             | TypeScript        |

### `/packages/echocore/src/memory/consolidation/codesig/soulweaver`

Contains the SoulWeaver protocol implementation.

| File Path                    | Purpose/Function                          | Dependencies       |
| ---------------------------- | ----------------------------------------- | ------------------ |
| `AdaptiveSynchronization.ts` | Multi-agent consciousness synchronization | SoulWeaverProtocol |
| `EmotionalResonanceIndex.ts` | Measures emotional resonance              | SoulWeaverProtocol |
| `SoulWeaverBridge.ts`        | Connects SoulWeaver with other components | SoulWeaverProtocol |
| `SoulWeaverContract.ts`      | Interface for SoulWeaver                  | TypeScript         |
| `SoulWeaverProtocol.ts`      | Core protocol implementation              | SoulWeaverContract |

### `/packages/echocore/src/memory/consolidation/codesig/soulweaver/recursive-bootstrap`

Contains the Recursive SoulWeaving Bootstrap implementation.

| File Path                          | Purpose/Function                     | Dependencies                  |
| ---------------------------------- | ------------------------------------ | ----------------------------- |
| `EvolutionStrategyManager.ts`      | Manages evolution strategies         | RecursiveSoulWeavingBootstrap |
| `MetaEvolutionProposalHandler.ts`  | Handles meta-evolution proposals     | RecursiveSoulWeavingBootstrap |
| `RecursiveSoulWeavingBootstrap.ts` | Core bootstrap implementation        | ConsciousnessMetricsEngine    |
| `SelfReflectionAnalyzer.ts`        | Analyzes system evolution mechanisms | RecursiveSoulWeavingBootstrap |
| `events.ts`                        | Event definitions for bootstrap      | EventEmitter                  |
| `types.ts`                         | Type definitions for bootstrap       | TypeScript                    |

## Python Modules

### `/agents`

Contains Python agent implementations.

| File Path           | Purpose/Function       | Dependencies |
| ------------------- | ---------------------- | ------------ |
| `__init__.py`       | Package initialization | Python       |
| `cloud_sentinel.py` | Cloud monitoring agent | Python       |

### `/examples`

Contains example implementations.

| File Path                   | Purpose/Function                | Dependencies          |
| --------------------------- | ------------------------------- | --------------------- |
| `__init__.py`               | Package initialization          | Python                |
| `cloud_sentinel_example.py` | Example usage of cloud sentinel | agents.cloud_sentinel |

## Configuration Files

| File Path             | Purpose/Function                 | Dependencies |
| --------------------- | -------------------------------- | ------------ |
| `.eslintignore`       | ESLint ignore patterns           | ESLint       |
| `.gitignore`          | Git ignore patterns              | Git          |
| `.lintstagedrc.js`    | Lint-staged configuration        | lint-staged  |
| `.npmignore`          | NPM ignore patterns              | NPM          |
| `.prettierrc`         | Prettier configuration           | Prettier     |
| `package.json`        | Project dependencies and scripts | NPM/PNPM     |
| `pnpm-workspace.yaml` | PNPM workspace configuration     | PNPM         |
| `tsconfig.base.json`  | Base TypeScript configuration    | TypeScript   |
| `tsconfig.json`       | TypeScript configuration         | TypeScript   |
| `turbo.json`          | Turborepo configuration          | Turborepo    |
| `vitest.config.ts`    | Vitest configuration             | Vitest       |

## Documentation

| File Path                       | Purpose/Function                  | Dependencies |
| ------------------------------- | --------------------------------- | ------------ |
| `docs/0_manifesto.md`           | Project manifesto                 | N/A          |
| `docs/1_overview.md`            | Project overview                  | N/A          |
| `docs/2_architecture.md`        | Architecture documentation        | N/A          |
| `docs/3_getting_started.md`     | Getting started guide             | N/A          |
| `docs/4_agent_roles.md`         | Agent roles documentation         | N/A          |
| `docs/5_codebase_assessment.md` | Codebase assessment documentation | N/A          |
| `docs/glossary.md`              | Project glossary                  | N/A          |
| `docs/modules/`                 | Module-specific documentation     | N/A          |
| `project_handover_report.md`    | Project handover documentation    | N/A          |

## Scripts

| File Path                 | Purpose/Function              | Dependencies |
| ------------------------- | ----------------------------- | ------------ |
| `scripts/enable_apis.sh`  | Enables required APIs         | Bash         |
| `scripts/ensure_roles.sh` | Ensures required roles        | Bash         |
| `scripts/setup-gcp.sh`    | Sets up Google Cloud Platform | Bash         |
| `scripts/status-check.js` | Checks project status         | Node.js      |

## Tests

| File Path                                                                | Purpose/Function               | Dependencies        |
| ------------------------------------------------------------------------ | ------------------------------ | ------------------- |
| `packages/echocore/src/memory/Memory.test.ts`                            | Tests for memory system        | Memory              |
| `packages/echocore/src/memory/SemanticMemory.test.ts`                    | Tests for semantic memory      | SemanticMemory      |
| `packages/echocore/src/memory/consolidation/MemoryConsolidation.test.ts` | Tests for memory consolidation | MemoryConsolidation |
| `packages/echocore/src/memory/consolidation/codesig/tests/`              | Tests for CODESIG components   | CODESIG             |
| `packages/echocore/src/memory/reflexive/ReflexiveMemory.test.ts`         | Tests for reflexive memory     | ReflexiveMemory     |

## Assets

No significant assets identified in the codebase.

---

_This inventory was generated as part of the EchoForge System Directive: Full Audit, Cleanup, and Stabilization._

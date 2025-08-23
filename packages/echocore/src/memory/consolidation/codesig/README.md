# CODESIG Integration

CODESIG (Codalism Design, Evolution, and Synthesis Intelligence Gateway) is an integration layer that transforms EchoForge's Memory Consolidation System into a multi-agent, self-reflective, meta-cognitive substrate that empowers SoulFrames to evolve continuously through rich memory synthesis.

## Overview

CODESIG bridges the gap between the Memory Consolidation System and the Codalism components (SoulFrame and Codalogue), enabling:

- **Emotion-weighted memory clustering** that respects SoulFrame resonance
- **Intent-driven summarization** aligned with system purpose and values
- **Meta-consolidation** combining memories across multiple SoulFrames/agents
- **Semantic event ledger** capturing consolidation events and evolution proposals

## Architecture

CODESIG consists of three main components:

1. **SoulFrame Manager**: Manages SoulFrame entities and orchestrates memory consolidation based on growth lifecycle.
2. **Enhanced Memory Consolidation Engine**: Extends the core Memory Consolidation system with emotion-weighted clustering, intent-driven summarization, and meta-consolidation capabilities.
3. **Codalogue Protocol Ledger**: Implements a semantic event ledger for capturing memory consolidation events, evolution proposals, and system interactions.

## Usage

### Basic Setup

```typescript
// Initialize CODESIG integration
const codesig = new CODESIGIntegration(
  memoryProvider,
  memoryConsolidator,
  codalogue
);

// Register a SoulFrame
await codesig.registerSoulFrame(soulframe.identity.id);

// Trigger consolidation for a SoulFrame
const results = await codesig.triggerSoulFrameConsolidation(
  soulFrameId,
  timeRange,
  consolidationOptions
);
```

### Emotion-Weighted Consolidation

CODESIG extends the standard consolidation options with emotional weighting:

```typescript
const consolidationOptions: CODESIGConsolidationOptions = {
  similarityThreshold: 0.7,
  emotionalWeights: [
    { emotion: EmotionalResonance.CREATIVE, weight: 0.9 },
    { emotion: EmotionalResonance.REFLECTIVE, weight: 0.8 },
  ],
  intentMetadata: {
    primaryIntent: 'Improve system understanding',
    purposeAlignment: 0.9,
  },
  soulFrameId: soulFrameId,
  recordInCodalogue: true,
  triggerGrowthHooks: true,
};
```

### Meta-Consolidation Across SoulFrames

CODESIG enables consolidation across multiple SoulFrames:

```typescript
const metaResults = await codesig.metaConsolidate(
  [soulFrameId1, soulFrameId2],
  consolidationOptions
);
```

### Querying the Codalogue Protocol Ledger

```typescript
const codalogueEntries = await codesig.getCodalogueProtocolLedger().query({
  soulFrameId: soulFrameId,
  eventType: 'consolidation',
  timeRange: {
    from: new Date('2023-01-01'),
    to: new Date('2023-01-31'),
  },
});
```

## Development Roadmap

| Phase | Description                                             | Status    |
| ----- | ------------------------------------------------------- | --------- |
| 1     | Core SoulFrame module + basic consolidation integration | Completed |
| 2     | Emotion and intent integration in consolidation         | Completed |
| 3     | Codalogue ledger implementation                         | Completed |
| 4     | Multi-agent meta-consolidation                          | Completed |
| 5     | Reflexive growth automation                             | Planned   |

## Example

See the `codesig-example.ts` file for a complete example of how to use the CODESIG integration.

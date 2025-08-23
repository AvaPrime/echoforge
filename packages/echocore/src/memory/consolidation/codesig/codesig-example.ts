/**
 * CODESIG Integration Example
 *
 * This example demonstrates how to use the CODESIG integration to connect
 * the Memory Consolidation System with SoulFrame and Codalogue components.
 */

import { MemoryProvider } from '../../MemoryContract';
import { MemoryConsolidator } from '../MemoryConsolidator';
import { SemanticClusteringStrategy } from '../strategies/SemanticClusteringStrategy';
import { LLMSummarizationStrategy } from '../strategies/LLMSummarizationStrategy';
import { EmbeddingProvider } from '../../../embedding/EmbeddingContract';
import { LanguageModelProvider } from '../../../llm/LanguageModelContract';
import { Codalogue } from '../../../../codalism/src/models/Codalogue';
import { Soulframe } from '../../../../codalism/src/models/Soulframe';
import {
  EmotionalResonance,
  GrowthPattern,
} from '../../../../codalism/src/models/SoulframeTypes';
import { CODESIGIntegration } from './CODESIGIntegration';
import { CODESIGConsolidationOptions } from './CODESIGTypes';

/**
 * Example function that demonstrates how to set up and use the CODESIG integration
 */
async function codesigExample() {
  // Initialize providers (these would typically be injected)
  const memoryProvider = {} as MemoryProvider; // Mock memory provider
  const embeddingProvider = {} as EmbeddingProvider; // Mock embedding provider
  const languageModelProvider = {} as LanguageModelProvider; // Mock language model provider

  // Initialize the base memory consolidation components
  const clusteringStrategy = new SemanticClusteringStrategy(
    embeddingProvider,
    0.7
  );
  const summarizationStrategy = new LLMSummarizationStrategy(
    languageModelProvider,
    'Summarize the following memories into a consolidated memory: {{memories}}',
    10,
    'long-term'
  );

  const memoryConsolidator = new MemoryConsolidator(memoryProvider);
  memoryConsolidator.setClusteringStrategy(clusteringStrategy);
  memoryConsolidator.setSummarizationStrategy(summarizationStrategy);

  // Initialize Codalogue
  const codalogue = new Codalogue();

  // Initialize CODESIG integration
  const codesig = new CODESIGIntegration(
    memoryProvider,
    memoryConsolidator,
    codalogue
  );

  // Create and register a SoulFrame
  const soulframe = createExampleSoulFrame();
  await codesig.registerSoulFrame(soulframe.identity.id);

  // Define CODESIG-specific consolidation options
  const consolidationOptions: CODESIGConsolidationOptions = {
    similarityThreshold: 0.7,
    maxEntriesPerCluster: 10,
    emotionalWeights: [
      { emotion: EmotionalResonance.CREATIVE, weight: 0.9 },
      { emotion: EmotionalResonance.REFLECTIVE, weight: 0.8 },
      { emotion: EmotionalResonance.ANALYTICAL, weight: 0.7 },
    ],
    intentMetadata: {
      primaryIntent: 'Improve system understanding',
      secondaryIntents: ['Identify patterns', 'Generate insights'],
      purposeAlignment: 0.9,
    },
    soulFrameId: soulframe.identity.id,
    recordInCodalogue: true,
    triggerGrowthHooks: true,
  };

  // Trigger consolidation for the SoulFrame
  const timeRange = {
    from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    to: new Date(), // Now
  };

  console.log(
    `Triggering consolidation for SoulFrame ${soulframe.identity.name}...`
  );
  const results = await codesig.triggerSoulFrameConsolidation(
    soulframe.identity.id,
    timeRange,
    consolidationOptions
  );

  console.log(
    `Consolidation complete. Created ${results.length} consolidated memories.`
  );

  // Query the Codalogue for consolidation events
  const codalogueEntries = await codesig.getCodalogueProtocolLedger().query({
    soulFrameId: soulframe.identity.id,
    eventType: 'consolidation',
    timeRange: {
      from: timeRange.from,
      to: timeRange.to,
    },
  });

  console.log(
    `Found ${codalogueEntries.length} consolidation events in the Codalogue.`
  );

  // Perform meta-consolidation across multiple SoulFrames
  const otherSoulframe = createExampleSoulFrame(
    'OtherSoulFrame',
    'Assist with creative tasks'
  );
  await codesig.registerSoulFrame(otherSoulframe.identity.id);

  console.log('Performing meta-consolidation across multiple SoulFrames...');
  const metaResults = await codesig.metaConsolidate(
    [soulframe.identity.id, otherSoulframe.identity.id],
    {
      ...consolidationOptions,
      soulFrameId: undefined, // Not specific to a single SoulFrame
    }
  );

  console.log(
    `Meta-consolidation complete. Created ${metaResults.length} consolidated memories.`
  );
}

/**
 * Creates an example SoulFrame for demonstration purposes
 */
function createExampleSoulFrame(
  name: string = 'ExampleSoulFrame',
  purpose: string = 'Demonstrate CODESIG integration'
): Soulframe {
  const soulframe = new Soulframe();

  // Set identity
  soulframe.identity.name = name;
  soulframe.identity.purpose = purpose;
  soulframe.identity.creationDate = new Date();

  // Set essence
  soulframe.essence.emotionalResonance = [
    EmotionalResonance.CREATIVE,
    EmotionalResonance.REFLECTIVE,
  ];
  soulframe.essence.values = ['Knowledge', 'Growth', 'Collaboration'];

  // Set growth hooks
  soulframe.growth.hooks.push({
    id: `learning-${soulframe.identity.id}`,
    trigger: 'new-information',
    action: 'update-knowledge-base',
    pattern: GrowthPattern.INCREMENTAL,
    activationCount: 0,
  });

  return soulframe;
}

// Run the example (in a real application, this would be called from elsewhere)
// codesigExample().catch(console.error);

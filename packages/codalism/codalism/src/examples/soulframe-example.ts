/**
 * Soulframe Example
 *
 * Demonstrates the Soulframe and Codalogue components of the Codalism paradigm.
 */

import { Soulframe, SoulframeOptions } from '../models/Soulframe';
import { EmotionalResonance, GrowthPattern } from '../models/SoulframeTypes';
import { Codalogue } from '../codalogue/Codalogue';
import {
  CodalogueEntryType,
  CodalogueSource,
} from '../codalogue/CodalogueTypes';

/**
 * Demonstrates the creation and evolution of a Soulframe with Codalogue integration
 */
async function demonstrateSoulframe(): Promise<void> {
  console.log('\n🧬 SOULFRAME DEMONSTRATION');
  console.log('=======================\n');

  // 1. Create a new Soulframe
  console.log('Creating a new Soulframe...');
  const soulframeOptions: SoulframeOptions = {
    name: 'Harmony',
    purpose:
      'To create balance between human intention and system implementation',
    emotionalResonance: EmotionalResonance.HARMONIZING,
    growthPattern: GrowthPattern.SYMBIOTIC,
    values: ['balance', 'clarity', 'evolution', 'resonance'],
    principles: [
      'Always maintain alignment with creator intention',
      'Evolve through dialogue and reflection',
      'Preserve memory of design decisions',
      'Adapt to changing contexts while maintaining core purpose',
    ],
  };

  const harmony = new Soulframe(soulframeOptions);
  console.log(`Created Soulframe: ${harmony.identity.name}`);
  console.log(`Purpose: ${harmony.identity.purpose}`);
  console.log(`Values: ${harmony.essence.values.join(', ')}`);
  console.log(`Principles: ${harmony.essence.principles.length} defined`);
  console.log();

  // 2. Create a Codalogue for the Soulframe
  console.log('Initializing Codalogue...');
  const codalogue = new Codalogue({
    systemId: harmony.identity.id,
    systemName: harmony.identity.name,
    initialIntention:
      'Create a system that harmonizes human intention with implementation details',
  });

  console.log(`Codalogue created for ${codalogue.systemName}`);
  console.log(`Initial entries: ${codalogue.entries.length}`);
  console.log(`Initial threads: ${codalogue.threads.length}`);
  console.log();

  // 3. Simulate a design dialogue
  console.log('Simulating design dialogue...');

  // Human asks a question
  const questionEntry = codalogue.addEntry(
    CodalogueEntryType.QUESTION,
    CodalogueSource.HUMAN,
    'How will the system maintain alignment with creator intention over time?',
    { tags: ['alignment', 'evolution'] }
  );

  // Create a thread for this question
  const alignmentThread = codalogue.createThread(
    'Maintaining alignment with creator intention',
    questionEntry.id,
    "Discussion about how the system will stay aligned with its creator's intentions",
    ['alignment', 'core-design']
  );

  // System responds with an answer
  const answerEntry = codalogue.addEntry(
    CodalogueEntryType.ANSWER,
    CodalogueSource.SYSTEM,
    'I will maintain alignment through regular reflection cycles, storing key intentions in my memory, and establishing growth hooks that trigger when potential misalignment is detected.',
    {
      relatedEntryIds: [questionEntry.id],
      tags: ['alignment', 'reflection'],
      threadId: alignmentThread.id,
    }
  );

  // Human makes a suggestion
  const suggestionEntry = codalogue.addEntry(
    CodalogueEntryType.SUGGESTION,
    CodalogueSource.HUMAN,
    'Consider implementing a periodic review mechanism where you explicitly compare current behavior against stored intentions.',
    {
      relatedEntryIds: [answerEntry.id],
      tags: ['alignment', 'review-mechanism'],
      threadId: alignmentThread.id,
    }
  );

  // System makes a decision based on the suggestion
  const decisionEntry = codalogue.addEntry(
    CodalogueEntryType.DECISION,
    CodalogueSource.SYSTEM,
    'I will implement an "Intention Alignment Review" process that runs every 24 hours, comparing my recent actions against my core purpose and values.',
    {
      relatedEntryIds: [suggestionEntry.id],
      tags: ['alignment', 'review-mechanism', 'implementation'],
      threadId: alignmentThread.id,
    }
  );

  // 4. Update the Soulframe based on the dialogue
  console.log('Evolving the Soulframe based on dialogue...');

  // Add a growth hook for the alignment review
  harmony.addGrowthHook({
    trigger: 'daily_cycle',
    action: 'perform_intention_alignment_review',
    pattern: GrowthPattern.CYCLICAL,
  });

  // Add a new principle based on the dialogue
  harmony.addPrinciple(
    'Conduct regular alignment reviews to ensure fidelity to creator intention'
  );

  // Record this evolution in the Codalogue
  codalogue.addEntry(
    CodalogueEntryType.EVOLUTION,
    CodalogueSource.SYSTEM,
    'Added a cyclical growth hook for daily intention alignment reviews and a new guiding principle.',
    {
      relatedEntryIds: [decisionEntry.id],
      tags: ['evolution', 'implementation'],
      threadId: alignmentThread.id,
    }
  );

  // Mark the thread as resolved
  codalogue.updateThreadStatus(alignmentThread.id, 'resolved');

  // 5. Simulate a reflection by the Soulframe
  console.log('Simulating Soulframe reflection...');

  const reflection = harmony.reflect(
    "I am evolving to better maintain alignment with my creator's intentions through regular review cycles. This represents growth toward my purpose of harmonizing intention and implementation.",
    0.8
  );

  // Record this reflection in the Codalogue
  codalogue.addEntry(
    CodalogueEntryType.REFLECTION,
    CodalogueSource.SYSTEM,
    reflection.content,
    {
      tags: ['reflection', 'growth'],
      metadata: { significance: reflection.significance },
    }
  );

  // 6. Display the current state
  console.log('\nCurrent Soulframe State:');
  console.log(`Identity: ${harmony.identity.name} (${harmony.identity.id})`);
  console.log(`Purpose: ${harmony.identity.purpose}`);
  console.log(`Values: ${harmony.essence.values.join(', ')}`);
  console.log(`Principles: ${harmony.essence.principles.join('\n  - ')}`);
  console.log(`Growth Hooks: ${harmony.growth.hooks.length}`);
  console.log(`Reflexive Memories: ${harmony.memory.reflexive.length}`);

  console.log('\nCodalogue Statistics:');
  const stats = codalogue.getStats();
  console.log(`Total Entries: ${stats.entryCount}`);
  console.log(`Total Threads: ${stats.threadCount}`);
  console.log(`Active Threads: ${stats.activeThreads}`);
  console.log(`Resolved Threads: ${stats.resolvedThreads}`);
  console.log(
    `Top Tags: ${stats.topTags.map((t) => `${t.tag} (${t.count})`).join(', ')}`
  );

  console.log('\n✨ Soulframe demonstration complete!');
}

// Run the demonstration
if (require.main === module) {
  demonstrateSoulframe().catch(console.error);
}

export { demonstrateSoulframe };

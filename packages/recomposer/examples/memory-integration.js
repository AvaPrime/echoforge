/**
 * memory-integration.js
 * Example script demonstrating integration between the Recomposer and Reflexive Memory
 *
 * Note: This example assumes a simplified mock of the Reflexive Memory system
 * since the actual implementation may vary.
 */

const fs = require('fs');
const path = require('path');
const { BlueprintComposer, BlueprintDiff } = require('@echoforge/recomposer');

// Mock Reflexive Memory system
class ReflexiveMemory {
  constructor() {
    this.memories = [];
  }

  // Store a memory
  storeMemory(memory) {
    const timestamp = new Date().toISOString();
    const memoryWithTimestamp = {
      ...memory,
      timestamp,
      id: `memory-${Date.now()}`,
    };

    this.memories.push(memoryWithTimestamp);
    console.log(`Memory stored with ID: ${memoryWithTimestamp.id}`);
    return memoryWithTimestamp;
  }

  // Retrieve memories by type
  getMemoriesByType(type) {
    return this.memories.filter((memory) => memory.type === type);
  }

  // Retrieve memories by agent ID
  getMemoriesByAgentId(agentId) {
    return this.memories.filter((memory) => memory.agentId === agentId);
  }

  // Get all memories
  getAllMemories() {
    return [...this.memories];
  }
}

// Load blueprint
function loadBlueprint(filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  const content = fs.readFileSync(fullPath, 'utf8');
  return JSON.parse(content);
}

// Save blueprint to file
function saveBlueprint(blueprint, filePath) {
  const fullPath = path.resolve(__dirname, filePath);
  fs.writeFileSync(fullPath, JSON.stringify(blueprint, null, 2), 'utf8');
  console.log(`Blueprint saved to ${fullPath}`);
}

// Main function
async function main() {
  console.log('Recomposer-Reflexive Memory Integration Example');
  console.log('===========================================');

  // Initialize Reflexive Memory
  const memory = new ReflexiveMemory();

  // Load blueprints
  console.log('\nLoading blueprints...');
  const agent1 = loadBlueprint('./example-blueprints/agent1.json');
  const agent2 = loadBlueprint('./example-blueprints/agent2.json');

  console.log(`Loaded ${agent1.name} (${agent1.id})`);
  console.log(`Loaded ${agent2.name} (${agent2.id})`);

  // 1. Store original blueprints in memory
  console.log('\n1. Storing original blueprints in memory...');
  memory.storeMemory({
    type: 'blueprint',
    agentId: agent1.id,
    name: agent1.name,
    content: agent1,
    action: 'created',
  });

  memory.storeMemory({
    type: 'blueprint',
    agentId: agent2.id,
    name: agent2.name,
    content: agent2,
    action: 'created',
  });

  // 2. Compose blueprints with memory integration
  console.log('\n2. Composing blueprints with memory integration...');
  const composer = new BlueprintComposer({
    conflictStrategy: 'CONSERVATIVE',
    autoRefine: true,
    maintainLineage: true,
  });

  const composedBlueprint = await composer.compose([agent1, agent2]);
  console.log(
    `Created composed blueprint: ${composedBlueprint.name} (${composedBlueprint.id})`
  );

  // 3. Generate diff and store in memory
  console.log('\n3. Generating diff and storing in memory...');
  const diff = BlueprintDiff.compare(agent1, composedBlueprint);
  const narrative = diff.generateNarrative();

  // Store composition event in memory
  const compositionMemory = memory.storeMemory({
    type: 'composition',
    agentId: composedBlueprint.id,
    parentAgentIds: [agent1.id, agent2.id],
    name: composedBlueprint.name,
    content: composedBlueprint,
    diff: diff,
    narrative: narrative,
    action: 'composed',
  });

  // Save the composed blueprint
  saveBlueprint(composedBlueprint, './output/memory-composed-blueprint.json');

  // 4. Query memory for agent lineage
  console.log('\n4. Querying memory for agent lineage...');
  const compositionMemories = memory.getMemoriesByType('composition');
  console.log(`Found ${compositionMemories.length} composition memories`);

  if (compositionMemories.length > 0) {
    console.log('\nComposition History:');
    compositionMemories.forEach((mem) => {
      console.log(`- ${mem.timestamp}: ${mem.name} (${mem.agentId})`);
      console.log(`  Parents: ${mem.parentAgentIds.join(', ')}`);
    });
  }

  // 5. Generate agent evolution report
  console.log('\n5. Generating agent evolution report...');
  const evolutionReport = generateEvolutionReport(memory);

  // Save evolution report
  const reportPath = path.resolve(
    __dirname,
    './output/agent-evolution-report.txt'
  );
  fs.writeFileSync(reportPath, evolutionReport, 'utf8');
  console.log(`Agent evolution report saved to ${reportPath}`);

  console.log('\nExample completed successfully!');
}

// Generate an agent evolution report
function generateEvolutionReport(memory) {
  let report = 'Agent Evolution Report\n';
  report += '======================\n\n';

  // Get all memories
  const allMemories = memory.getAllMemories();
  const blueprintMemories = memory.getMemoriesByType('blueprint');
  const compositionMemories = memory.getMemoriesByType('composition');

  report += `Total Memories: ${allMemories.length}\n`;
  report += `Blueprint Memories: ${blueprintMemories.length}\n`;
  report += `Composition Memories: ${compositionMemories.length}\n\n`;

  // Original Blueprints
  report += 'Original Blueprints:\n';
  blueprintMemories.forEach((mem) => {
    report += `- ${mem.name} (${mem.agentId})\n`;
    report += `  Created: ${mem.timestamp}\n`;
    report += `  Capabilities: ${Object.keys(mem.content.capabilities || {}).length}\n`;
  });

  // Composition Events
  if (compositionMemories.length > 0) {
    report += '\nComposition Events:\n';
    compositionMemories.forEach((mem) => {
      report += `- ${mem.name} (${mem.agentId})\n`;
      report += `  Created: ${mem.timestamp}\n`;
      report += `  Parent Agents: ${mem.parentAgentIds.join(', ')}\n`;
      report += `  Capabilities: ${Object.keys(mem.content.capabilities || {}).length}\n`;
      report += `  Similarity to first parent: ${mem.diff.similarityScore.toFixed(2)}\n`;

      // Add a snippet of the narrative
      const narrativeSnippet = mem.narrative.split('\n').slice(0, 3).join('\n');
      report += `\n  Narrative Snippet:\n    ${narrativeSnippet}...\n`;
    });
  }

  return report;
}

// Create output directory if it doesn't exist
if (!fs.existsSync(path.resolve(__dirname, './output'))) {
  fs.mkdirSync(path.resolve(__dirname, './output'));
}

// Run the example
main().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});

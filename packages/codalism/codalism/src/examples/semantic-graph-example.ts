/**
 * Example demonstrating a semantic graph representation of a Codalism blueprint
 */

import { CodalismInterpreter } from '../interpreter/CodalismInterpreter';
import { SemanticBlueprint } from '../models/SemanticBlueprint';
import {
  BlueprintEntityType,
  RelationshipType,
} from '../models/BlueprintTypes';

/**
 * A simple graph representation for visualization and analysis
 */
interface GraphNode {
  id: string;
  type: BlueprintEntityType;
  name: string;
  description?: string;
}

interface GraphEdge {
  source: string;
  target: string;
  type: RelationshipType;
  description?: string;
}

interface SemanticGraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

/**
 * Converts a SemanticBlueprint to a graph representation
 */
function blueprintToGraph(blueprint: SemanticBlueprint): SemanticGraph {
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  // Add system node
  nodes.push({
    id: 'system',
    type: BlueprintEntityType.System,
    name: blueprint.name || 'System',
    description: blueprint.description,
  });

  // Add intent nodes
  blueprint.intents.forEach((intent, index) => {
    const id = `intent_${index}`;
    nodes.push({
      id,
      type: BlueprintEntityType.Intent,
      name: intent.name || `Intent ${index + 1}`,
      description: intent.description,
    });

    // Connect intent to system
    edges.push({
      source: id,
      target: 'system',
      type: RelationshipType.Defines,
      description: 'Defines system purpose',
    });
  });

  // Add constraint nodes
  blueprint.constraints.forEach((constraint, index) => {
    const id = `constraint_${index}`;
    nodes.push({
      id,
      type: BlueprintEntityType.Constraint,
      name: constraint.name || `Constraint ${index + 1}`,
      description: constraint.description,
    });

    // Connect constraint to system
    edges.push({
      source: id,
      target: 'system',
      type: RelationshipType.Constrains,
      description: 'Constrains system behavior',
    });
  });

  // Add module nodes
  blueprint.modules.forEach((module, index) => {
    const id = `module_${index}`;
    nodes.push({
      id,
      type: BlueprintEntityType.Module,
      name: module.name,
      description: module.description,
    });

    // Connect module to system
    edges.push({
      source: id,
      target: 'system',
      type: RelationshipType.PartOf,
      description: 'Component of system',
    });
  });

  // Add relationship edges between modules
  blueprint.relationships.forEach((relationship, index) => {
    // Find source and target nodes
    const sourceIndex = blueprint.modules.findIndex(
      (m) => m.name === relationship.source
    );
    const targetIndex = blueprint.modules.findIndex(
      (m) => m.name === relationship.target
    );

    if (sourceIndex >= 0 && targetIndex >= 0) {
      edges.push({
        source: `module_${sourceIndex}`,
        target: `module_${targetIndex}`,
        type: relationship.type,
        description: relationship.description,
      });
    }
  });

  return { nodes, edges };
}

/**
 * Generates a simple DOT format representation for visualization with Graphviz
 */
function generateDotGraph(graph: SemanticGraph): string {
  let dot = 'digraph G {\n';
  dot += '  rankdir=TB;\n';
  dot += '  node [shape=box, style=filled, fontname="Arial"];\n\n';

  // Node styling based on type
  const nodeStyles: Record<BlueprintEntityType, string> = {
    [BlueprintEntityType.System]: 'fillcolor="#f5f5f5", shape=doubleoctagon',
    [BlueprintEntityType.Intent]: 'fillcolor="#e1f5fe", shape=ellipse',
    [BlueprintEntityType.Constraint]: 'fillcolor="#ffebee", shape=diamond',
    [BlueprintEntityType.Module]: 'fillcolor="#e8f5e9", shape=box',
    [BlueprintEntityType.Interface]: 'fillcolor="#fff8e1", shape=component',
    [BlueprintEntityType.Operation]: 'fillcolor="#f3e5f5", shape=hexagon',
  };

  // Add nodes
  graph.nodes.forEach((node) => {
    const style = nodeStyles[node.type] || '';
    const label = `${node.name}${node.description ? '\n' + node.description : ''}`;
    dot += `  "${node.id}" [${style}, label="${label.replace(/"/g, '\\"')}"];\n`;
  });

  dot += '\n';

  // Edge styling based on type
  const edgeStyles: Record<RelationshipType, string> = {
    [RelationshipType.Defines]: 'color="#2196f3", style=dashed',
    [RelationshipType.Constrains]: 'color="#f44336", style=dotted',
    [RelationshipType.PartOf]: 'color="#4caf50"',
    [RelationshipType.DependsOn]: 'color="#ff9800"',
    [RelationshipType.Communicates]: 'color="#9c27b0"',
    [RelationshipType.Extends]: 'color="#795548"',
    [RelationshipType.Implements]: 'color="#607d8b"',
  };

  // Add edges
  graph.edges.forEach((edge) => {
    const style = edgeStyles[edge.type] || '';
    const label = edge.description || edge.type;
    dot += `  "${edge.source}" -> "${edge.target}" [${style}, label="${label.replace(/"/g, '\\"')}"];\n`;
  });

  dot += '}\n';
  return dot;
}

/**
 * Main function demonstrating semantic graph creation
 */
async function demonstrateSemanticGraph() {
  console.log('Starting Semantic Graph Example');

  // Create a Codalism interpreter
  const interpreter = new CodalismInterpreter();

  // Define a system using natural language
  const input = `
    Create a content management system with the following capabilities:
    - User authentication and role-based access control
    - Content creation, editing, and publishing workflow
    - Media asset management
    - Version control for content
    - Search and tagging
    - Analytics dashboard
  `;

  console.log('Interpreting system description...');
  const blueprint = await interpreter.interpret(input);

  // Display the blueprint
  console.log('\nBlueprint created:');
  console.log(`- Name: ${blueprint.name}`);
  console.log(`- Description: ${blueprint.description}`);
  console.log(
    `- Intents: ${blueprint.intents.map((i) => i.description).join(', ')}`
  );
  console.log(`- Modules: ${blueprint.modules.map((m) => m.name).join(', ')}`);

  // Add some explicit relationships between modules
  if (blueprint.modules.length >= 3) {
    blueprint.addRelationship({
      source: blueprint.modules[0].name,
      target: blueprint.modules[1].name,
      type: RelationshipType.DependsOn,
      description: 'Authentication required for content operations',
    });

    blueprint.addRelationship({
      source: blueprint.modules[1].name,
      target: blueprint.modules[2].name,
      type: RelationshipType.Communicates,
      description: 'Content operations use media assets',
    });
  }

  // Convert blueprint to graph
  console.log('\nConverting blueprint to semantic graph...');
  const graph = blueprintToGraph(blueprint);

  console.log(
    `Created graph with ${graph.nodes.length} nodes and ${graph.edges.length} edges`
  );

  // Generate DOT representation
  const dot = generateDotGraph(graph);

  console.log('\nGenerated DOT graph representation:');
  console.log(dot);

  console.log('\nSemantic Graph Example Complete');
  console.log(
    'You can visualize this graph using tools like Graphviz or online services like https://dreampuf.github.io/GraphvizOnline/'
  );
}

// Run the example
demonstrateSemanticGraph().catch(console.error);

import { v4 as uuidv4 } from 'uuid';
import {
  Intent,
  Constraint,
  Module,
  Interface,
  Relationship,
  BlueprintEntityType,
  RelationshipType,
} from './BlueprintTypes';

/**
 * Represents a semantic blueprint of a system derived from natural language intent
 */
export class SemanticBlueprint {
  /** Unique identifier for the blueprint */
  id: string;

  /** Name of the system */
  name: string;

  /** Description of the system */
  description: string;

  /** When the blueprint was created */
  createdAt: Date;

  /** When the blueprint was last updated */
  updatedAt: Date;

  /** System goals and intents */
  intents: Intent[];

  /** System constraints */
  constraints: Constraint[];

  /** System modules */
  modules: Module[];

  /** Relationships between entities */
  relationships: Relationship[];

  /** Original natural language input that generated this blueprint */
  originalInput?: string;

  /** Additional metadata */
  metadata: Record<string, any>;

  /**
   * Creates a new semantic blueprint
   */
  constructor(options: {
    name: string;
    description: string;
    originalInput?: string;
    metadata?: Record<string, any>;
  }) {
    this.id = uuidv4();
    this.name = options.name;
    this.description = options.description;
    this.createdAt = new Date();
    this.updatedAt = new Date();
    this.intents = [];
    this.constraints = [];
    this.modules = [];
    this.relationships = [];
    this.originalInput = options.originalInput;
    this.metadata = options.metadata || {};
  }

  /**
   * Adds an intent to the blueprint
   */
  addIntent(intent: Omit<Intent, 'id'>): Intent {
    const newIntent = {
      id: uuidv4(),
      ...intent,
    };
    this.intents.push(newIntent);
    this.updatedAt = new Date();
    return newIntent;
  }

  /**
   * Adds a constraint to the blueprint
   */
  addConstraint(constraint: Omit<Constraint, 'id'>): Constraint {
    const newConstraint = {
      id: uuidv4(),
      ...constraint,
    };
    this.constraints.push(newConstraint);
    this.updatedAt = new Date();
    return newConstraint;
  }

  /**
   * Adds a module to the blueprint
   */
  addModule(module: Omit<Module, 'id'>): Module {
    const newModule = {
      id: uuidv4(),
      ...module,
    };
    this.modules.push(newModule);
    this.updatedAt = new Date();
    return newModule;
  }

  /**
   * Adds a relationship between entities
   */
  addRelationship(relationship: Omit<Relationship, 'id'>): Relationship {
    const newRelationship = {
      id: uuidv4(),
      ...relationship,
    };
    this.relationships.push(newRelationship);
    this.updatedAt = new Date();
    return newRelationship;
  }

  /**
   * Creates a dependency relationship between two modules
   */
  addDependency(
    sourceModuleId: string,
    targetModuleId: string,
    description?: string
  ): Relationship {
    return this.addRelationship({
      type: RelationshipType.DEPENDS_ON,
      sourceId: sourceModuleId,
      targetId: targetModuleId,
      description:
        description ||
        `${this.getModuleName(sourceModuleId)} depends on ${this.getModuleName(targetModuleId)}`,
    });
  }

  /**
   * Creates a fulfillment relationship between a module and an intent
   */
  addFulfillment(
    moduleId: string,
    intentId: string,
    description?: string
  ): Relationship {
    return this.addRelationship({
      type: RelationshipType.FULFILLS,
      sourceId: moduleId,
      targetId: intentId,
      description:
        description ||
        `${this.getModuleName(moduleId)} fulfills intent: ${this.getIntentDescription(intentId)}`,
    });
  }

  /**
   * Gets a module by ID
   */
  getModule(id: string): Module | undefined {
    return this.modules.find((module) => module.id === id);
  }

  /**
   * Gets an intent by ID
   */
  getIntent(id: string): Intent | undefined {
    return this.intents.find((intent) => intent.id === id);
  }

  /**
   * Gets a module's name by ID
   */
  private getModuleName(id: string): string {
    const module = this.getModule(id);
    return module ? module.name : 'Unknown module';
  }

  /**
   * Gets an intent's description by ID
   */
  private getIntentDescription(id: string): string {
    const intent = this.getIntent(id);
    return intent ? intent.description : 'Unknown intent';
  }

  /**
   * Serializes the blueprint to JSON
   */
  toJSON(): Record<string, any> {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      createdAt: this.createdAt.toISOString(),
      updatedAt: this.updatedAt.toISOString(),
      intents: this.intents,
      constraints: this.constraints,
      modules: this.modules,
      relationships: this.relationships,
      originalInput: this.originalInput,
      metadata: this.metadata,
    };
  }

  /**
   * Creates a blueprint from JSON
   */
  static fromJSON(json: Record<string, any>): SemanticBlueprint {
    const blueprint = new SemanticBlueprint({
      name: json.name,
      description: json.description,
      originalInput: json.originalInput,
      metadata: json.metadata,
    });

    blueprint.id = json.id;
    blueprint.createdAt = new Date(json.createdAt);
    blueprint.updatedAt = new Date(json.updatedAt);
    blueprint.intents = json.intents;
    blueprint.constraints = json.constraints;
    blueprint.modules = json.modules;
    blueprint.relationships = json.relationships;

    return blueprint;
  }
}

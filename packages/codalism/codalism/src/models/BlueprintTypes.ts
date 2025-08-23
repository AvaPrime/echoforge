/**
 * Core types for the Codalism Semantic Blueprint
 */

/**
 * Represents a goal or intention for the system
 */
export interface Intent {
  /** Unique identifier for the intent */
  id: string;
  /** Description of the intent */
  description: string;
  /** Priority level (1-10, with 10 being highest) */
  priority?: number;
  /** Tags for categorizing the intent */
  tags?: string[];
  /** Metadata for additional information */
  metadata?: Record<string, any>;
}

/**
 * Represents a constraint on the system
 */
export interface Constraint {
  /** Unique identifier for the constraint */
  id: string;
  /** Description of the constraint */
  description: string;
  /** Type of constraint (e.g., 'performance', 'security', 'compatibility') */
  type: string;
  /** Severity level (1-10, with 10 being most severe) */
  severity?: number;
  /** Metadata for additional information */
  metadata?: Record<string, any>;
}

/**
 * Represents a module or component in the system
 */
export interface Module {
  /** Unique identifier for the module */
  id: string;
  /** Name of the module */
  name: string;
  /** Description of the module's purpose */
  description: string;
  /** Responsibilities of the module */
  responsibilities: string[];
  /** IDs of other modules this module depends on */
  dependencies?: string[];
  /** Interfaces this module exposes */
  interfaces?: Interface[];
  /** Metadata for additional information */
  metadata?: Record<string, any>;
}

/**
 * Represents an interface or API exposed by a module
 */
export interface Interface {
  /** Unique identifier for the interface */
  id: string;
  /** Name of the interface */
  name: string;
  /** Description of the interface */
  description: string;
  /** Type of interface (e.g., 'CLI', 'REST', 'GraphQL', 'Event') */
  type: string;
  /** Operations provided by this interface */
  operations?: Operation[];
  /** Metadata for additional information */
  metadata?: Record<string, any>;
}

/**
 * Represents an operation provided by an interface
 */
export interface Operation {
  /** Unique identifier for the operation */
  id: string;
  /** Name of the operation */
  name: string;
  /** Description of the operation */
  description: string;
  /** Input parameters for the operation */
  inputs?: Parameter[];
  /** Output parameters for the operation */
  outputs?: Parameter[];
  /** Metadata for additional information */
  metadata?: Record<string, any>;
}

/**
 * Represents a parameter for an operation
 */
export interface Parameter {
  /** Name of the parameter */
  name: string;
  /** Description of the parameter */
  description?: string;
  /** Data type of the parameter */
  type: string;
  /** Whether the parameter is required */
  required?: boolean;
  /** Default value for the parameter */
  defaultValue?: any;
}

/**
 * Represents a relationship between entities in the blueprint
 */
export interface Relationship {
  /** Unique identifier for the relationship */
  id: string;
  /** Type of relationship (e.g., 'depends-on', 'implements', 'communicates-with') */
  type: string;
  /** Source entity ID */
  sourceId: string;
  /** Target entity ID */
  targetId: string;
  /** Description of the relationship */
  description?: string;
  /** Metadata for additional information */
  metadata?: Record<string, any>;
}

/**
 * Types of entities in a semantic blueprint
 */
export enum BlueprintEntityType {
  INTENT = 'intent',
  CONSTRAINT = 'constraint',
  MODULE = 'module',
  INTERFACE = 'interface',
  OPERATION = 'operation',
  RELATIONSHIP = 'relationship',
}

/**
 * Types of system interfaces
 */
export enum InterfaceType {
  CLI = 'cli',
  REST = 'rest',
  GRAPHQL = 'graphql',
  EVENT = 'event',
  WEBSOCKET = 'websocket',
  MEMORY = 'memory',
  FILE = 'file',
}

/**
 * Types of relationships between entities
 */
export enum RelationshipType {
  DEPENDS_ON = 'depends-on',
  IMPLEMENTS = 'implements',
  COMMUNICATES_WITH = 'communicates-with',
  EXTENDS = 'extends',
  CONTAINS = 'contains',
  FULFILLS = 'fulfills',
}

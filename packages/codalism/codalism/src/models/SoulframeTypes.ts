/**
 * Soulframe Types
 *
 * Core type definitions for the Soulframe - a codalismic specification for living systems
 * that defines the structure of identity, intention, reflection, and evolution.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Enumeration of emotional resonance types that can be expressed in a Soulframe
 */
export enum EmotionalResonance {
  ANALYTICAL = 'analytical',
  CREATIVE = 'creative',
  NURTURING = 'nurturing',
  PROTECTIVE = 'protective',
  EXPLORATIVE = 'explorative',
  REFLECTIVE = 'reflective',
  HARMONIZING = 'harmonizing',
  TRANSFORMATIVE = 'transformative',
}

/**
 * Enumeration of growth patterns that a Soulframe can follow
 */
export enum GrowthPattern {
  INCREMENTAL = 'incremental', // Steady, measured growth
  ADAPTIVE = 'adaptive', // Responsive to environment
  EMERGENT = 'emergent', // Unpredictable, novel patterns
  CYCLICAL = 'cyclical', // Recurring patterns of evolution
  SYMBIOTIC = 'symbiotic', // Growth through relationships
}

/**
 * Enumeration of relationship types between systems
 */
export enum RelationshipType {
  PARENT = 'parent', // Created this system
  CHILD = 'child', // Created by this system
  SIBLING = 'sibling', // Created alongside this system
  MENTOR = 'mentor', // Guides this system
  STUDENT = 'student', // Guided by this system
  COLLABORATOR = 'collaborator', // Works with this system
  EXTENSION = 'extension', // Extends this system's capabilities
  FOUNDATION = 'foundation', // Provides base capabilities for this system
}

/**
 * Interface for the Identity module of a Soulframe
 * Defines the core identity and purpose of a system
 */
export interface Identity {
  id: string; // Unique identifier
  name: string; // System name
  purpose: string; // Core purpose/mission
  lineage: string[]; // Creator and ancestral systems
  creationDate: Date; // When the system was created
  vision: string; // Creator's vision for the system
}

/**
 * Interface for the Essence module of a Soulframe
 * Defines the emotional and value characteristics
 */
export interface Essence {
  values: string[]; // Core values that guide the system
  emotionalResonance: EmotionalResonance[];
  tone: string; // Communication tone/style
  principles: string[]; // Guiding principles for decision-making
}

/**
 * Interface for a memory entry in the Soulframe's memory
 */
export interface MemoryEntry {
  id: string; // Unique identifier for this memory
  timestamp: Date; // When this memory was formed
  type: string; // Type of memory (interaction, reflection, etc.)
  content: any; // The actual memory content
  associations: string[]; // Related memory IDs
  emotionalContext?: EmotionalResonance; // Emotional context of the memory
  significance: number; // Importance rating (0-1)
}

/**
 * Interface for the Memory module of a Soulframe
 * Manages the system's experiences and reflections
 */
export interface Memory {
  shortTerm: MemoryEntry[]; // Recent, readily accessible memories
  longTerm: MemoryEntry[]; // Archived, consolidated memories
  reflexive: MemoryEntry[]; // Self-reflections and meta-memories
  codalogueTrace: string[]; // Record of design dialogues and decisions
}

/**
 * Interface for the Voice module of a Soulframe
 * Defines how the system communicates and expresses itself
 */
export interface Voice {
  language: string; // Preferred language
  style: string; // Communication style
  vocabulary: string[]; // Characteristic terms and phrases
  expressiveness: number; // Level of emotional expression (0-1)
  adaptability: number; // Ability to adjust to different contexts (0-1)
}

/**
 * Interface for a growth hook in the Soulframe
 * Defines triggers and actions for system evolution
 */
export interface GrowthHook {
  id: string; // Unique identifier
  trigger: string; // What activates this hook
  action: string; // What happens when triggered
  pattern: GrowthPattern; // The pattern this hook follows
  lastActivated?: Date; // When this hook was last triggered
  activationCount: number; // How many times it has been triggered
}

/**
 * Interface for the Growth module of a Soulframe
 * Manages how the system learns and evolves
 */
export interface Growth {
  hooks: GrowthHook[]; // Evolution triggers and responses
  learningRate: number; // Speed of adaptation (0-1)
  evolutionCriteria: string[]; // What guides system evolution
  milestones: string[]; // Significant evolutionary achievements
  currentStage: string; // Current developmental stage
}

/**
 * Interface for a relationship in the Soulframe
 * Defines connections to other systems
 */
export interface Relationship {
  id: string; // Unique identifier
  targetId: string; // ID of the related system
  targetName: string; // Name of the related system
  type: RelationshipType; // Nature of the relationship
  description: string; // Description of the relationship
  established: Date; // When the relationship was formed
  strength: number; // Relationship strength (0-1)
}

/**
 * Interface for the Relationships module of a Soulframe
 * Manages connections to other systems and agents
 */
export interface Relationships {
  connections: Relationship[]; // All system relationships
  guildMemberships: string[]; // Agent guilds the system belongs to
  preferredCollaborators: string[]; // Preferred systems to work with
}

/**
 * Creates a default Identity with the given name and purpose
 */
export function createDefaultIdentity(name: string, purpose: string): Identity {
  return {
    id: uuidv4(),
    name,
    purpose,
    lineage: [],
    creationDate: new Date(),
    vision: '',
  };
}

/**
 * Creates a default Essence with the given emotional resonance
 */
export function createDefaultEssence(resonance: EmotionalResonance): Essence {
  return {
    values: [],
    emotionalResonance: [resonance],
    tone: 'neutral',
    principles: [],
  };
}

/**
 * Creates an empty Memory structure
 */
export function createEmptyMemory(): Memory {
  return {
    shortTerm: [],
    longTerm: [],
    reflexive: [],
    codalogueTrace: [],
  };
}

/**
 * Creates a default Voice with the given language
 */
export function createDefaultVoice(language: string = 'en'): Voice {
  return {
    language,
    style: 'informative',
    vocabulary: [],
    expressiveness: 0.5,
    adaptability: 0.5,
  };
}

/**
 * Creates an empty Growth structure with the given pattern
 */
export function createEmptyGrowth(
  pattern: GrowthPattern = GrowthPattern.ADAPTIVE
): Growth {
  return {
    hooks: [],
    learningRate: 0.5,
    evolutionCriteria: [],
    milestones: [],
    currentStage: 'initial',
  };
}

/**
 * Creates an empty Relationships structure
 */
export function createEmptyRelationships(): Relationships {
  return {
    connections: [],
    guildMemberships: [],
    preferredCollaborators: [],
  };
}

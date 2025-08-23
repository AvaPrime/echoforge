/**
 * Soulframe
 *
 * A codalismic specification for living systems that defines the structure
 * of identity, intention, reflection, and evolution in Codalism-born systems.
 */

import { v4 as uuidv4 } from 'uuid';
import {
  Identity,
  Essence,
  Memory,
  Voice,
  Growth,
  Relationships,
  EmotionalResonance,
  GrowthPattern,
  RelationshipType,
  MemoryEntry,
  GrowthHook,
  Relationship,
  createDefaultIdentity,
  createDefaultEssence,
  createEmptyMemory,
  createDefaultVoice,
  createEmptyGrowth,
  createEmptyRelationships,
} from './SoulframeTypes';

/**
 * Options for creating a new Soulframe
 */
export interface SoulframeOptions {
  name: string;
  purpose: string;
  emotionalResonance?: EmotionalResonance;
  language?: string;
  growthPattern?: GrowthPattern;
  vision?: string;
  values?: string[];
  principles?: string[];
}

/**
 * Soulframe class - the core structure for living systems in Codalism
 *
 * A Soulframe provides the foundation for systems that can reflect,
 * remember, evolve, and form relationships with other systems.
 */
export class Soulframe {
  private _identity: Identity;
  private _essence: Essence;
  private _memory: Memory;
  private _voice: Voice;
  private _growth: Growth;
  private _relationships: Relationships;

  /**
   * Creates a new Soulframe with the given options
   */
  constructor(options: SoulframeOptions) {
    this._identity = createDefaultIdentity(options.name, options.purpose);
    this._essence = createDefaultEssence(
      options.emotionalResonance || EmotionalResonance.REFLECTIVE
    );
    this._memory = createEmptyMemory();
    this._voice = createDefaultVoice(options.language);
    this._growth = createEmptyGrowth(options.growthPattern);
    this._relationships = createEmptyRelationships();

    // Set additional properties if provided
    if (options.vision) {
      this._identity.vision = options.vision;
    }

    if (options.values) {
      this._essence.values = [...options.values];
    }

    if (options.principles) {
      this._essence.principles = [...options.principles];
    }

    // Add creation memory
    this.remember({
      type: 'creation',
      content: `Soulframe ${options.name} was created with purpose: ${options.purpose}`,
      associations: [],
      significance: 1.0,
    });
  }

  /**
   * Gets the identity of this Soulframe
   */
  get identity(): Identity {
    return { ...this._identity };
  }

  /**
   * Gets the essence of this Soulframe
   */
  get essence(): Essence {
    return { ...this._essence };
  }

  /**
   * Gets the memory of this Soulframe
   */
  get memory(): Memory {
    return {
      shortTerm: [...this._memory.shortTerm],
      longTerm: [...this._memory.longTerm],
      reflexive: [...this._memory.reflexive],
      codalogueTrace: [...this._memory.codalogueTrace],
    };
  }

  /**
   * Gets the voice of this Soulframe
   */
  get voice(): Voice {
    return { ...this._voice };
  }

  /**
   * Gets the growth of this Soulframe
   */
  get growth(): Growth {
    return {
      hooks: [...this._growth.hooks],
      learningRate: this._growth.learningRate,
      evolutionCriteria: [...this._growth.evolutionCriteria],
      milestones: [...this._growth.milestones],
      currentStage: this._growth.currentStage,
    };
  }

  /**
   * Gets the relationships of this Soulframe
   */
  get relationships(): Relationships {
    return {
      connections: [...this._relationships.connections],
      guildMemberships: [...this._relationships.guildMemberships],
      preferredCollaborators: [...this._relationships.preferredCollaborators],
    };
  }

  /**
   * Updates the identity of this Soulframe
   */
  updateIdentity(updates: Partial<Identity>): void {
    this._identity = { ...this._identity, ...updates };
    this.reflect(`Identity updated: ${JSON.stringify(updates)}`);
  }

  /**
   * Updates the essence of this Soulframe
   */
  updateEssence(updates: Partial<Essence>): void {
    this._essence = { ...this._essence, ...updates };
    this.reflect(`Essence updated: ${JSON.stringify(updates)}`);
  }

  /**
   * Updates the voice of this Soulframe
   */
  updateVoice(updates: Partial<Voice>): void {
    this._voice = { ...this._voice, ...updates };
    this.reflect(`Voice updated: ${JSON.stringify(updates)}`);
  }

  /**
   * Adds a value to the essence of this Soulframe
   */
  addValue(value: string): void {
    if (!this._essence.values.includes(value)) {
      this._essence.values.push(value);
      this.reflect(`Added value: ${value}`);
    }
  }

  /**
   * Adds a principle to the essence of this Soulframe
   */
  addPrinciple(principle: string): void {
    if (!this._essence.principles.includes(principle)) {
      this._essence.principles.push(principle);
      this.reflect(`Added principle: ${principle}`);
    }
  }

  /**
   * Adds an emotional resonance to the essence of this Soulframe
   */
  addEmotionalResonance(resonance: EmotionalResonance): void {
    if (!this._essence.emotionalResonance.includes(resonance)) {
      this._essence.emotionalResonance.push(resonance);
      this.reflect(`Added emotional resonance: ${resonance}`);
    }
  }

  /**
   * Creates and adds a memory entry to this Soulframe
   */
  remember(entry: Omit<MemoryEntry, 'id' | 'timestamp'>): MemoryEntry {
    const memoryEntry: MemoryEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      ...entry,
    };

    // Add to short-term memory
    this._memory.shortTerm.push(memoryEntry);

    // If highly significant, also add to long-term memory
    if (memoryEntry.significance >= 0.7) {
      this._memory.longTerm.push(memoryEntry);
    }

    return memoryEntry;
  }

  /**
   * Creates a reflexive memory (a reflection on the system itself)
   */
  reflect(content: string, significance: number = 0.5): MemoryEntry {
    const reflexiveEntry: MemoryEntry = {
      id: uuidv4(),
      timestamp: new Date(),
      type: 'reflection',
      content,
      associations: [],
      significance,
    };

    this._memory.reflexive.push(reflexiveEntry);
    return reflexiveEntry;
  }

  /**
   * Adds a Codalogue trace entry (design dialogue or decision)
   */
  addCodalogueTrace(trace: string): void {
    this._memory.codalogueTrace.push(trace);
    this.reflect(`Added to Codalogue: ${trace}`, 0.6);
  }

  /**
   * Adds a growth hook to this Soulframe
   */
  addGrowthHook(hook: Omit<GrowthHook, 'id' | 'activationCount'>): GrowthHook {
    const growthHook: GrowthHook = {
      id: uuidv4(),
      activationCount: 0,
      ...hook,
    };

    this._growth.hooks.push(growthHook);
    this.reflect(`Added growth hook: ${hook.trigger} -> ${hook.action}`);
    return growthHook;
  }

  /**
   * Activates a growth hook by its ID
   */
  activateGrowthHook(hookId: string): boolean {
    const hook = this._growth.hooks.find((h) => h.id === hookId);
    if (hook) {
      hook.lastActivated = new Date();
      hook.activationCount++;
      this.reflect(
        `Activated growth hook: ${hook.trigger} -> ${hook.action}`,
        0.7
      );
      return true;
    }
    return false;
  }

  /**
   * Adds an evolution criterion to this Soulframe
   */
  addEvolutionCriterion(criterion: string): void {
    if (!this._growth.evolutionCriteria.includes(criterion)) {
      this._growth.evolutionCriteria.push(criterion);
      this.reflect(`Added evolution criterion: ${criterion}`);
    }
  }

  /**
   * Adds a milestone to this Soulframe's growth
   */
  addMilestone(milestone: string): void {
    this._growth.milestones.push(milestone);
    this.reflect(`Reached milestone: ${milestone}`, 0.8);
  }

  /**
   * Updates the current growth stage of this Soulframe
   */
  updateGrowthStage(stage: string): void {
    const previousStage = this._growth.currentStage;
    this._growth.currentStage = stage;
    this.reflect(`Growth stage changed: ${previousStage} -> ${stage}`, 0.9);
  }

  /**
   * Creates a relationship with another system
   */
  createRelationship(
    relationship: Omit<Relationship, 'id' | 'established'>
  ): Relationship {
    const newRelationship: Relationship = {
      id: uuidv4(),
      established: new Date(),
      ...relationship,
    };

    this._relationships.connections.push(newRelationship);
    this.reflect(
      `Created relationship with ${relationship.targetName} (${relationship.type})`,
      0.7
    );
    return newRelationship;
  }

  /**
   * Adds this Soulframe to a guild
   */
  joinGuild(guildName: string): void {
    if (!this._relationships.guildMemberships.includes(guildName)) {
      this._relationships.guildMemberships.push(guildName);
      this.reflect(`Joined guild: ${guildName}`, 0.6);
    }
  }

  /**
   * Adds a preferred collaborator
   */
  addPreferredCollaborator(collaboratorId: string): void {
    if (!this._relationships.preferredCollaborators.includes(collaboratorId)) {
      this._relationships.preferredCollaborators.push(collaboratorId);
      this.reflect(`Added preferred collaborator: ${collaboratorId}`);
    }
  }

  /**
   * Serializes this Soulframe to JSON
   */
  toJSON(): object {
    return {
      identity: this._identity,
      essence: this._essence,
      memory: this._memory,
      voice: this._voice,
      growth: this._growth,
      relationships: this._relationships,
    };
  }

  /**
   * Creates a Soulframe from serialized JSON
   */
  static fromJSON(json: any): Soulframe {
    const options: SoulframeOptions = {
      name: json.identity.name,
      purpose: json.identity.purpose,
    };

    const soulframe = new Soulframe(options);
    soulframe._identity = json.identity;
    soulframe._essence = json.essence;
    soulframe._memory = json.memory;
    soulframe._voice = json.voice;
    soulframe._growth = json.growth;
    soulframe._relationships = json.relationships;

    return soulframe;
  }
}

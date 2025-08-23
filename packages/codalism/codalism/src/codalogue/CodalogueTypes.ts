/**
 * Codalogue Types
 *
 * Type definitions for the Codalogue Protocol - a system for tracking
 * the dialogue-driven evolution of Codalism systems.
 */

import { v4 as uuidv4 } from 'uuid';

/**
 * Enumeration of Codalogue entry types
 */
export enum CodalogueEntryType {
  INTENTION = 'intention', // Initial design intent
  QUESTION = 'question', // Question about the system
  ANSWER = 'answer', // Answer to a question
  SUGGESTION = 'suggestion', // Suggestion for improvement
  DECISION = 'decision', // Design decision
  REFLECTION = 'reflection', // Reflection on the system
  EVOLUTION = 'evolution', // System evolution event
  MILESTONE = 'milestone', // Significant achievement
}

/**
 * Enumeration of Codalogue entry sources
 */
export enum CodalogueSource {
  HUMAN = 'human', // Human creator/collaborator
  SYSTEM = 'system', // The system itself
  AGENT = 'agent', // An AI agent
  EXTERNAL = 'external', // External system or process
}

/**
 * Interface for a Codalogue entry
 */
export interface CodalogueEntry {
  id: string; // Unique identifier
  timestamp: Date; // When this entry was created
  type: CodalogueEntryType; // Type of entry
  source: CodalogueSource; // Who/what created this entry
  sourceId?: string; // Identifier of the source (if applicable)
  content: string; // The actual content
  relatedEntryIds?: string[]; // Related entry IDs (e.g., question this answers)
  tags?: string[]; // Categorization tags
  metadata?: Record<string, any>; // Additional metadata
}

/**
 * Interface for a Codalogue thread - a sequence of related entries
 */
export interface CodalogueThread {
  id: string; // Unique identifier
  title: string; // Thread title
  description?: string; // Thread description
  entryIds: string[]; // IDs of entries in this thread
  created: Date; // When this thread was created
  updated: Date; // When this thread was last updated
  tags?: string[]; // Categorization tags
  status: 'active' | 'resolved' | 'archived'; // Thread status
}

/**
 * Interface for Codalogue statistics
 */
export interface CodalogueStats {
  entryCount: number; // Total number of entries
  threadCount: number; // Total number of threads
  entryTypeDistribution: Record<CodalogueEntryType, number>; // Count by type
  sourceDistribution: Record<CodalogueSource, number>; // Count by source
  activeThreads: number; // Number of active threads
  resolvedThreads: number; // Number of resolved threads
  archivedThreads: number; // Number of archived threads
  topTags: Array<{ tag: string; count: number }>; // Most used tags
}

/**
 * Creates a new Codalogue entry
 */
export function createCodalogueEntry(
  type: CodalogueEntryType,
  source: CodalogueSource,
  content: string,
  options: {
    sourceId?: string;
    relatedEntryIds?: string[];
    tags?: string[];
    metadata?: Record<string, any>;
  } = {}
): CodalogueEntry {
  return {
    id: uuidv4(),
    timestamp: new Date(),
    type,
    source,
    content,
    sourceId: options.sourceId,
    relatedEntryIds: options.relatedEntryIds || [],
    tags: options.tags || [],
    metadata: options.metadata || {},
  };
}

/**
 * Creates a new Codalogue thread
 */
export function createCodalogueThread(
  title: string,
  initialEntryId?: string,
  description?: string,
  tags?: string[]
): CodalogueThread {
  const now = new Date();
  return {
    id: uuidv4(),
    title,
    description,
    entryIds: initialEntryId ? [initialEntryId] : [],
    created: now,
    updated: now,
    tags: tags || [],
    status: 'active',
  };
}

/**
 * Creates empty Codalogue statistics
 */
export function createEmptyCodalogueStats(): CodalogueStats {
  return {
    entryCount: 0,
    threadCount: 0,
    entryTypeDistribution: {
      [CodalogueEntryType.INTENTION]: 0,
      [CodalogueEntryType.QUESTION]: 0,
      [CodalogueEntryType.ANSWER]: 0,
      [CodalogueEntryType.SUGGESTION]: 0,
      [CodalogueEntryType.DECISION]: 0,
      [CodalogueEntryType.REFLECTION]: 0,
      [CodalogueEntryType.EVOLUTION]: 0,
      [CodalogueEntryType.MILESTONE]: 0,
    },
    sourceDistribution: {
      [CodalogueSource.HUMAN]: 0,
      [CodalogueSource.SYSTEM]: 0,
      [CodalogueSource.AGENT]: 0,
      [CodalogueSource.EXTERNAL]: 0,
    },
    activeThreads: 0,
    resolvedThreads: 0,
    archivedThreads: 0,
    topTags: [],
  };
}

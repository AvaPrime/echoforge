/**
 * Codalogue
 *
 * Implementation of the Codalogue Protocol - a system for tracking
 * the dialogue-driven evolution of Codalism systems.
 */

import {
  CodalogueEntry,
  CodalogueThread,
  CodalogueStats,
  CodalogueEntryType,
  CodalogueSource,
  createCodalogueEntry,
  createCodalogueThread,
  createEmptyCodalogueStats,
} from './CodalogueTypes';

/**
 * Options for creating a new Codalogue
 */
export interface CodalogueOptions {
  systemId: string;
  systemName: string;
  initialIntention?: string;
}

/**
 * Codalogue class - manages the dialogue-driven evolution of a Codalism system
 *
 * The Codalogue records the history of intentions, questions, answers, suggestions,
 * decisions, reflections, and evolution events that shape a system over time.
 */
export class Codalogue {
  private _systemId: string;
  private _systemName: string;
  private _entries: Map<string, CodalogueEntry>;
  private _threads: Map<string, CodalogueThread>;
  private _entryToThreadMap: Map<string, string>;
  private _tags: Set<string>;

  /**
   * Creates a new Codalogue for the specified system
   */
  constructor(options: CodalogueOptions) {
    this._systemId = options.systemId;
    this._systemName = options.systemName;
    this._entries = new Map<string, CodalogueEntry>();
    this._threads = new Map<string, CodalogueThread>();
    this._entryToThreadMap = new Map<string, string>();
    this._tags = new Set<string>();

    // If an initial intention is provided, create an entry and thread for it
    if (options.initialIntention) {
      const entry = this.addEntry(
        CodalogueEntryType.INTENTION,
        CodalogueSource.HUMAN,
        options.initialIntention,
        { tags: ['initial-intention'] }
      );

      this.createThread(
        `Initial intention for ${options.systemName}`,
        entry.id,
        'The founding intention that initiated this system',
        ['initial-intention']
      );
    }
  }

  /**
   * Gets the system ID associated with this Codalogue
   */
  get systemId(): string {
    return this._systemId;
  }

  /**
   * Gets the system name associated with this Codalogue
   */
  get systemName(): string {
    return this._systemName;
  }

  /**
   * Gets all entries in this Codalogue
   */
  get entries(): CodalogueEntry[] {
    return Array.from(this._entries.values());
  }

  /**
   * Gets all threads in this Codalogue
   */
  get threads(): CodalogueThread[] {
    return Array.from(this._threads.values());
  }

  /**
   * Gets all tags used in this Codalogue
   */
  get tags(): string[] {
    return Array.from(this._tags);
  }

  /**
   * Gets an entry by its ID
   */
  getEntry(entryId: string): CodalogueEntry | undefined {
    return this._entries.get(entryId);
  }

  /**
   * Gets a thread by its ID
   */
  getThread(threadId: string): CodalogueThread | undefined {
    return this._threads.get(threadId);
  }

  /**
   * Gets the thread containing an entry
   */
  getThreadForEntry(entryId: string): CodalogueThread | undefined {
    const threadId = this._entryToThreadMap.get(entryId);
    return threadId ? this._threads.get(threadId) : undefined;
  }

  /**
   * Adds a new entry to the Codalogue
   */
  addEntry(
    type: CodalogueEntryType,
    source: CodalogueSource,
    content: string,
    options: {
      sourceId?: string;
      relatedEntryIds?: string[];
      tags?: string[];
      metadata?: Record<string, any>;
      threadId?: string;
    } = {}
  ): CodalogueEntry {
    // Create the entry
    const entry = createCodalogueEntry(type, source, content, options);
    this._entries.set(entry.id, entry);

    // Add tags to the set
    if (entry.tags) {
      entry.tags.forEach((tag) => this._tags.add(tag));
    }

    // If a thread ID is provided, add the entry to that thread
    if (options.threadId && this._threads.has(options.threadId)) {
      this.addEntryToThread(entry.id, options.threadId);
    }
    // If related entry IDs are provided, try to add to their thread
    else if (options.relatedEntryIds && options.relatedEntryIds.length > 0) {
      for (const relatedId of options.relatedEntryIds) {
        const threadId = this._entryToThreadMap.get(relatedId);
        if (threadId) {
          this.addEntryToThread(entry.id, threadId);
          break;
        }
      }
    }

    return entry;
  }

  /**
   * Creates a new thread in the Codalogue
   */
  createThread(
    title: string,
    initialEntryId?: string,
    description?: string,
    tags?: string[]
  ): CodalogueThread {
    // Create the thread
    const thread = createCodalogueThread(
      title,
      initialEntryId,
      description,
      tags
    );
    this._threads.set(thread.id, thread);

    // Add tags to the set
    if (thread.tags) {
      thread.tags.forEach((tag) => this._tags.add(tag));
    }

    // If an initial entry ID is provided, map it to this thread
    if (initialEntryId) {
      this._entryToThreadMap.set(initialEntryId, thread.id);
    }

    return thread;
  }

  /**
   * Adds an entry to a thread
   */
  addEntryToThread(entryId: string, threadId: string): boolean {
    const entry = this._entries.get(entryId);
    const thread = this._threads.get(threadId);

    if (!entry || !thread) {
      return false;
    }

    // Add the entry to the thread if it's not already there
    if (!thread.entryIds.includes(entryId)) {
      thread.entryIds.push(entryId);
      thread.updated = new Date();
      this._entryToThreadMap.set(entryId, threadId);
    }

    return true;
  }

  /**
   * Updates the status of a thread
   */
  updateThreadStatus(
    threadId: string,
    status: 'active' | 'resolved' | 'archived'
  ): boolean {
    const thread = this._threads.get(threadId);
    if (!thread) {
      return false;
    }

    thread.status = status;
    thread.updated = new Date();
    return true;
  }

  /**
   * Gets entries by type
   */
  getEntriesByType(type: CodalogueEntryType): CodalogueEntry[] {
    return this.entries.filter((entry) => entry.type === type);
  }

  /**
   * Gets entries by source
   */
  getEntriesBySource(source: CodalogueSource): CodalogueEntry[] {
    return this.entries.filter((entry) => entry.source === source);
  }

  /**
   * Gets entries by tag
   */
  getEntriesByTag(tag: string): CodalogueEntry[] {
    return this.entries.filter((entry) => entry.tags?.includes(tag));
  }

  /**
   * Gets threads by status
   */
  getThreadsByStatus(
    status: 'active' | 'resolved' | 'archived'
  ): CodalogueThread[] {
    return this.threads.filter((thread) => thread.status === status);
  }

  /**
   * Gets threads by tag
   */
  getThreadsByTag(tag: string): CodalogueThread[] {
    return this.threads.filter((thread) => thread.tags?.includes(tag));
  }

  /**
   * Gets statistics about this Codalogue
   */
  getStats(): CodalogueStats {
    const stats = createEmptyCodalogueStats();

    // Count entries
    stats.entryCount = this._entries.size;

    // Count threads
    stats.threadCount = this._threads.size;

    // Count by entry type
    this.entries.forEach((entry) => {
      stats.entryTypeDistribution[entry.type]++;
    });

    // Count by source
    this.entries.forEach((entry) => {
      stats.sourceDistribution[entry.source]++;
    });

    // Count threads by status
    this.threads.forEach((thread) => {
      if (thread.status === 'active') stats.activeThreads++;
      else if (thread.status === 'resolved') stats.resolvedThreads++;
      else if (thread.status === 'archived') stats.archivedThreads++;
    });

    // Count tag usage
    const tagCounts = new Map<string, number>();
    this.entries.forEach((entry) => {
      entry.tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });
    this.threads.forEach((thread) => {
      thread.tags?.forEach((tag) => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    // Get top tags
    stats.topTags = Array.from(tagCounts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    return stats;
  }

  /**
   * Serializes this Codalogue to JSON
   */
  toJSON(): object {
    return {
      systemId: this._systemId,
      systemName: this._systemName,
      entries: this.entries,
      threads: this.threads,
    };
  }

  /**
   * Creates a Codalogue from serialized JSON
   */
  static fromJSON(json: any): Codalogue {
    const codalogue = new Codalogue({
      systemId: json.systemId,
      systemName: json.systemName,
    });

    // Add entries
    json.entries.forEach((entry: CodalogueEntry) => {
      codalogue._entries.set(entry.id, {
        ...entry,
        timestamp: new Date(entry.timestamp),
      });

      // Add tags to the set
      entry.tags?.forEach((tag) => codalogue._tags.add(tag));
    });

    // Add threads
    json.threads.forEach((thread: CodalogueThread) => {
      codalogue._threads.set(thread.id, {
        ...thread,
        created: new Date(thread.created),
        updated: new Date(thread.updated),
      });

      // Add tags to the set
      thread.tags?.forEach((tag) => codalogue._tags.add(tag));

      // Map entries to this thread
      thread.entryIds.forEach((entryId) => {
        codalogue._entryToThreadMap.set(entryId, thread.id);
      });
    });

    return codalogue;
  }
}

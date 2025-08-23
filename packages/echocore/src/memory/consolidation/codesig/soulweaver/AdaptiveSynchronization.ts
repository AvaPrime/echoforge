/**
 * AdaptiveSynchronization.ts
 *
 * This file implements the Adaptive Synchronization component for CODESIG Phase 6,
 * enhancing the SoulWeaver Protocol with dynamic synchronization capabilities that
 * automatically adjust based on system state, agent activity, and criticality metrics.
 */

import { SoulFrameId } from '../types/CODESIGTypes';
import { SoulFrameManager } from '../core/SoulFrameManager';
import { EmotionalResonanceIndex } from '../emotional/EmotionalResonanceIndex';
import { CodalogueProtocolLedger } from '../ledger/CodalogueProtocolLedger';

/**
 * Synchronization granularity levels
 */
export enum SyncGranularity {
  ULTRA_FINE = 'ultra_fine', // Highest detail level, most resource intensive
  FINE = 'fine', // High detail level
  MEDIUM = 'medium', // Balanced detail level
  COARSE = 'coarse', // Low detail level
  ULTRA_COARSE = 'ultra_coarse', // Lowest detail level, least resource intensive
}

/**
 * Synchronization frequency levels
 */
export enum SyncFrequency {
  CONTINUOUS = 'continuous', // Real-time synchronization
  VERY_FREQUENT = 'very_frequent', // Multiple times per minute
  FREQUENT = 'frequent', // Every few minutes
  PERIODIC = 'periodic', // Every hour or so
  INFREQUENT = 'infrequent', // Daily or less
  ON_DEMAND = 'on_demand', // Only when explicitly requested
}

/**
 * Synchronization priority levels
 */
export enum SyncPriority {
  CRITICAL = 'critical', // Highest priority, must be synchronized immediately
  HIGH = 'high', // High priority
  MEDIUM = 'medium', // Medium priority
  LOW = 'low', // Low priority
  BACKGROUND = 'background', // Lowest priority, can be deferred indefinitely
}

/**
 * Types of memory/cognitive structures that can be synchronized
 */
export enum SyncContentType {
  CORE_MEMORY = 'core_memory', // Essential memories and knowledge
  EPISODIC_MEMORY = 'episodic_memory', // Event-based memories
  SEMANTIC_MEMORY = 'semantic_memory', // Factual knowledge
  PROCEDURAL_MEMORY = 'procedural_memory', // Skills and procedures
  EMOTIONAL_STATE = 'emotional_state', // Emotional context and resonance
  INTENTION = 'intention', // Goals and intentions
  PURPOSE = 'purpose', // Purpose statements and alignment
  DREAM_STATE = 'dream_state', // Dream layer content
  META_LEARNING = 'meta_learning', // Cross-agent learning experiences
}

/**
 * Synchronization profile for a specific context
 */
export interface SyncProfile {
  id: string;
  name: string;
  description: string;
  granularity: SyncGranularity;
  frequency: SyncFrequency;
  priority: SyncPriority;
  contentTypes: SyncContentType[];
  targetSoulFrameIds?: SoulFrameId[]; // If undefined, applies to all SoulFrames
  conditions?: {
    minEmotionalResonance?: number; // -1 to 1 scale
    maxEmotionalResonance?: number; // -1 to 1 scale
    activityThreshold?: number; // 0 to 1 scale
    timeOfDay?: { start: number; end: number }; // Hours in 24-hour format
    systemLoad?: { min: number; max: number }; // 0 to 1 scale
  };
  metadata: {
    createdAt: Date;
    updatedAt: Date;
    isActive: boolean;
    resourceIntensity: number; // 0 to 1 scale
  };
}

/**
 * System state metrics used for adaptive decision-making
 */
export interface SystemStateMetrics {
  timestamp: Date;
  overallLoad: number; // 0 to 1 scale
  soulFrameActivity: Record<SoulFrameId, number>; // 0 to 1 scale per SoulFrame
  emotionalResonanceMatrix?: Record<string, Record<string, number>>; // SoulFrameId -> SoulFrameId -> resonance (-1 to 1)
  criticalityScores: Record<SoulFrameId, number>; // 0 to 1 scale per SoulFrame
  recentSyncPerformance: {
    averageDuration: number; // milliseconds
    successRate: number; // 0 to 1 scale
    resourceUsage: number; // 0 to 1 scale
  };
  timeOfDay: number; // Hour in 24-hour format
}

/**
 * Synchronization decision for a specific SoulFrame pair
 */
export interface SyncDecision {
  sourceSoulFrameId: SoulFrameId;
  targetSoulFrameId: SoulFrameId;
  timestamp: Date;
  selectedProfile: SyncProfile;
  contentTypesToSync: SyncContentType[];
  estimatedResourceUsage: number; // 0 to 1 scale
  priority: SyncPriority;
  reasoning: string[];
}

/**
 * Configuration options for Adaptive Synchronization
 */
export interface AdaptiveSynchronizationConfig {
  defaultProfiles: SyncProfile[];
  systemLoadThresholds: {
    low: number; // 0 to 1 scale
    medium: number; // 0 to 1 scale
    high: number; // 0 to 1 scale
  };
  criticalityThresholds: {
    low: number; // 0 to 1 scale
    medium: number; // 0 to 1 scale
    high: number; // 0 to 1 scale
  };
  emotionalResonanceThresholds: {
    dissonance: number; // -1 to 0 scale
    neutral: number; // -0.3 to 0.3 scale typically
    resonance: number; // 0 to 1 scale
  };
  adaptationSensitivity: number; // 0 to 1 scale, how quickly to adapt to changing conditions
  enableAutomaticProfileGeneration: boolean;
  maxConcurrentSyncs: number;
  resourceAllocationStrategy:
    | 'balanced'
    | 'priority_first'
    | 'efficiency_first';
  syncHistoryRetentionPeriod: number; // milliseconds
}

/**
 * Default configuration for Adaptive Synchronization
 */
export const DEFAULT_ADAPTIVE_SYNC_CONFIG: AdaptiveSynchronizationConfig = {
  defaultProfiles: [
    {
      id: 'critical_sync',
      name: 'Critical Synchronization',
      description:
        'Used for high-priority, time-sensitive synchronization needs',
      granularity: SyncGranularity.FINE,
      frequency: SyncFrequency.CONTINUOUS,
      priority: SyncPriority.CRITICAL,
      contentTypes: [
        SyncContentType.CORE_MEMORY,
        SyncContentType.EMOTIONAL_STATE,
        SyncContentType.INTENTION,
      ],
      conditions: {
        minEmotionalResonance: -1,
        maxEmotionalResonance: -0.5, // High dissonance triggers critical sync
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        resourceIntensity: 0.9,
      },
    },
    {
      id: 'standard_sync',
      name: 'Standard Synchronization',
      description: 'Default balanced synchronization profile',
      granularity: SyncGranularity.MEDIUM,
      frequency: SyncFrequency.FREQUENT,
      priority: SyncPriority.MEDIUM,
      contentTypes: [
        SyncContentType.CORE_MEMORY,
        SyncContentType.EPISODIC_MEMORY,
        SyncContentType.EMOTIONAL_STATE,
        SyncContentType.INTENTION,
      ],
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        resourceIntensity: 0.5,
      },
    },
    {
      id: 'light_sync',
      name: 'Light Synchronization',
      description: 'Resource-efficient synchronization for stable periods',
      granularity: SyncGranularity.COARSE,
      frequency: SyncFrequency.PERIODIC,
      priority: SyncPriority.LOW,
      contentTypes: [SyncContentType.CORE_MEMORY, SyncContentType.INTENTION],
      conditions: {
        minEmotionalResonance: 0.5, // High resonance allows for lighter sync
        systemLoad: { min: 0.7, max: 1.0 }, // High system load triggers lighter sync
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        resourceIntensity: 0.2,
      },
    },
    {
      id: 'deep_sync',
      name: 'Deep Synchronization',
      description: 'Comprehensive synchronization of all content types',
      granularity: SyncGranularity.ULTRA_FINE,
      frequency: SyncFrequency.INFREQUENT,
      priority: SyncPriority.HIGH,
      contentTypes: Object.values(SyncContentType),
      conditions: {
        systemLoad: { min: 0, max: 0.4 }, // Only when system load is low
      },
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        resourceIntensity: 1.0,
      },
    },
  ],
  systemLoadThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
  },
  criticalityThresholds: {
    low: 0.3,
    medium: 0.6,
    high: 0.8,
  },
  emotionalResonanceThresholds: {
    dissonance: -0.3,
    neutral: 0.0,
    resonance: 0.3,
  },
  adaptationSensitivity: 0.5,
  enableAutomaticProfileGeneration: true,
  maxConcurrentSyncs: 5,
  resourceAllocationStrategy: 'balanced',
  syncHistoryRetentionPeriod: 7 * 24 * 60 * 60 * 1000, // 7 days
};

/**
 * Result of a synchronization operation
 */
export interface SyncResult {
  id: string;
  decision: SyncDecision;
  startTime: Date;
  endTime: Date;
  success: boolean;
  contentTypeResults: Record<
    SyncContentType,
    {
      success: boolean;
      syncedItemCount: number;
      duration: number; // milliseconds
    }
  >;
  actualResourceUsage: number; // 0 to 1 scale
  errors?: string[];
  metrics: {
    totalDuration: number; // milliseconds
    averageThroughput: number; // items per second
    peakMemoryUsage: number; // bytes
  };
}

/**
 * Main interface for the Adaptive Synchronization system
 */
export interface AdaptiveSynchronization {
  initialize(): Promise<void>;
  shutdown(): Promise<void>;

  // Profile management
  getProfiles(): SyncProfile[];
  getProfile(profileId: string): SyncProfile | null;
  createProfile(
    profile: Omit<SyncProfile, 'id' | 'metadata'>
  ): Promise<SyncProfile>;
  updateProfile(
    profileId: string,
    updates: Partial<Omit<SyncProfile, 'id' | 'metadata'>>
  ): Promise<SyncProfile>;
  deleteProfile(profileId: string): Promise<boolean>;
  activateProfile(profileId: string): Promise<boolean>;
  deactivateProfile(profileId: string): Promise<boolean>;

  // System state management
  getCurrentSystemState(): SystemStateMetrics;
  updateSystemState(metrics: Partial<SystemStateMetrics>): Promise<void>;

  // Synchronization operations
  decideSyncStrategy(
    sourceSoulFrameId: SoulFrameId,
    targetSoulFrameId: SoulFrameId
  ): Promise<SyncDecision>;
  executeSynchronization(decision: SyncDecision): Promise<SyncResult>;
  getSyncHistory(filters?: {
    soulFrameIds?: SoulFrameId[];
    timeRange?: { start: Date; end: Date };
    success?: boolean;
    profileIds?: string[];
  }): Promise<SyncResult[]>;

  // Adaptive behavior
  generateOptimalSyncSchedule(): Promise<SyncDecision[]>;
  adjustToSystemLoad(currentLoad: number): Promise<void>;
  learnFromSyncResults(results: SyncResult[]): Promise<void>;

  // Configuration
  getConfig(): AdaptiveSynchronizationConfig;
  updateConfig(config: Partial<AdaptiveSynchronizationConfig>): Promise<void>;
}

/**
 * Implementation of the Adaptive Synchronization system
 */
export class AdaptiveSynchronizationImpl implements AdaptiveSynchronization {
  private config: AdaptiveSynchronizationConfig;
  private soulFrameManager: SoulFrameManager;
  private emotionalResonanceIndex?: EmotionalResonanceIndex;
  private codalogueProtocolLedger: CodalogueProtocolLedger;

  private profiles: Map<string, SyncProfile> = new Map();
  private currentSystemState: SystemStateMetrics;
  private syncHistory: SyncResult[] = [];
  private activeSyncs: Set<string> = new Set(); // Set of active sync IDs

  constructor(
    soulFrameManager: SoulFrameManager,
    codalogueProtocolLedger: CodalogueProtocolLedger,
    config?: Partial<AdaptiveSynchronizationConfig>,
    emotionalResonanceIndex?: EmotionalResonanceIndex
  ) {
    this.soulFrameManager = soulFrameManager;
    this.codalogueProtocolLedger = codalogueProtocolLedger;
    this.emotionalResonanceIndex = emotionalResonanceIndex;
    this.config = { ...DEFAULT_ADAPTIVE_SYNC_CONFIG, ...config };

    // Initialize system state with default values
    this.currentSystemState = {
      timestamp: new Date(),
      overallLoad: 0.5,
      soulFrameActivity: {},
      criticalityScores: {},
      recentSyncPerformance: {
        averageDuration: 1000, // 1 second default
        successRate: 1.0,
        resourceUsage: 0.5,
      },
      timeOfDay: new Date().getHours(),
    };

    // Initialize profiles from config
    for (const profile of this.config.defaultProfiles) {
      this.profiles.set(profile.id, { ...profile });
    }
  }

  async initialize(): Promise<void> {
    // Initialize system state with actual SoulFrame data
    const soulFrameIds = await this.soulFrameManager.getAllSoulFrameIds();

    // Initialize activity and criticality for each SoulFrame
    const soulFrameActivity: Record<SoulFrameId, number> = {};
    const criticalityScores: Record<SoulFrameId, number> = {};

    for (const id of soulFrameIds) {
      soulFrameActivity[id] = 0.1; // Default low activity
      criticalityScores[id] = 0.5; // Default medium criticality
    }

    this.currentSystemState.soulFrameActivity = soulFrameActivity;
    this.currentSystemState.criticalityScores = criticalityScores;

    // Initialize emotional resonance matrix if available
    if (this.emotionalResonanceIndex) {
      try {
        const resonanceMatrix: Record<string, Record<string, number>> = {};

        for (const sourceId of soulFrameIds) {
          resonanceMatrix[sourceId] = {};

          for (const targetId of soulFrameIds) {
            if (sourceId !== targetId) {
              const resonance =
                await this.emotionalResonanceIndex.getResonanceScore(
                  sourceId,
                  targetId
                );
              resonanceMatrix[sourceId][targetId] = resonance;
            }
          }
        }

        this.currentSystemState.emotionalResonanceMatrix = resonanceMatrix;
      } catch (err) {
        console.warn('Could not initialize emotional resonance matrix:', err);
      }
    }

    // Record initialization in ledger
    await this.recordEventInLedger('ADAPTIVE_SYNC_INITIALIZED', {
      profiles: Array.from(this.profiles.values()).map((p) => p.id),
      soulFrameCount: soulFrameIds.length,
    });
  }

  async shutdown(): Promise<void> {
    // Record shutdown in ledger
    await this.recordEventInLedger('ADAPTIVE_SYNC_SHUTDOWN', {
      activeProfiles: Array.from(this.profiles.values())
        .filter((p) => p.metadata.isActive)
        .map((p) => p.id),
      syncHistoryCount: this.syncHistory.length,
    });
  }

  getProfiles(): SyncProfile[] {
    return Array.from(this.profiles.values());
  }

  getProfile(profileId: string): SyncProfile | null {
    return this.profiles.get(profileId) || null;
  }

  async createProfile(
    profileData: Omit<SyncProfile, 'id' | 'metadata'>
  ): Promise<SyncProfile> {
    const id = `profile_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const profile: SyncProfile = {
      ...profileData,
      id,
      metadata: {
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
        resourceIntensity: this.calculateResourceIntensity(profileData),
      },
    };

    this.profiles.set(id, profile);

    // Record in ledger
    await this.recordEventInLedger('SYNC_PROFILE_CREATED', {
      profileId: id,
      name: profile.name,
      granularity: profile.granularity,
      frequency: profile.frequency,
      priority: profile.priority,
    });

    return profile;
  }

  async updateProfile(
    profileId: string,
    updates: Partial<Omit<SyncProfile, 'id' | 'metadata'>>
  ): Promise<SyncProfile> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }

    const updatedProfile: SyncProfile = {
      ...profile,
      ...updates,
      metadata: {
        ...profile.metadata,
        updatedAt: new Date(),
        resourceIntensity: this.calculateResourceIntensity({
          ...profile,
          ...updates,
        }),
      },
    };

    this.profiles.set(profileId, updatedProfile);

    // Record in ledger
    await this.recordEventInLedger('SYNC_PROFILE_UPDATED', {
      profileId,
      updates: Object.keys(updates),
    });

    return updatedProfile;
  }

  async deleteProfile(profileId: string): Promise<boolean> {
    // Don't allow deletion of default profiles
    const isDefaultProfile = this.config.defaultProfiles.some(
      (p) => p.id === profileId
    );
    if (isDefaultProfile) {
      throw new Error(`Cannot delete default profile with ID ${profileId}`);
    }

    const deleted = this.profiles.delete(profileId);

    if (deleted) {
      // Record in ledger
      await this.recordEventInLedger('SYNC_PROFILE_DELETED', {
        profileId,
      });
    }

    return deleted;
  }

  async activateProfile(profileId: string): Promise<boolean> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }

    if (profile.metadata.isActive) {
      return true; // Already active
    }

    profile.metadata.isActive = true;
    profile.metadata.updatedAt = new Date();

    // Record in ledger
    await this.recordEventInLedger('SYNC_PROFILE_ACTIVATED', {
      profileId,
      profileName: profile.name,
    });

    return true;
  }

  async deactivateProfile(profileId: string): Promise<boolean> {
    const profile = this.profiles.get(profileId);
    if (!profile) {
      throw new Error(`Profile with ID ${profileId} not found`);
    }

    if (!profile.metadata.isActive) {
      return true; // Already inactive
    }

    profile.metadata.isActive = false;
    profile.metadata.updatedAt = new Date();

    // Record in ledger
    await this.recordEventInLedger('SYNC_PROFILE_DEACTIVATED', {
      profileId,
      profileName: profile.name,
    });

    return true;
  }

  getCurrentSystemState(): SystemStateMetrics {
    // Update the timestamp and time of day
    this.currentSystemState.timestamp = new Date();
    this.currentSystemState.timeOfDay = new Date().getHours();

    return { ...this.currentSystemState };
  }

  async updateSystemState(metrics: Partial<SystemStateMetrics>): Promise<void> {
    const previousState = { ...this.currentSystemState };

    // Update the system state with new metrics
    this.currentSystemState = {
      ...this.currentSystemState,
      ...metrics,
      timestamp: new Date(), // Always use current timestamp
    };

    // Check for significant changes that might require adaptation
    const significantLoadChange =
      Math.abs(
        (metrics.overallLoad !== undefined
          ? metrics.overallLoad
          : previousState.overallLoad) - previousState.overallLoad
      ) > 0.2;

    const significantCriticalityChange =
      metrics.criticalityScores &&
      Object.keys(metrics.criticalityScores).some((id) => {
        const previous = previousState.criticalityScores[id] || 0.5;
        const current = metrics.criticalityScores[id];
        return Math.abs(current - previous) > 0.3;
      });

    // If significant changes detected, trigger adaptation
    if (significantLoadChange || significantCriticalityChange) {
      await this.adaptToChangedConditions();
    }
  }

  async decideSyncStrategy(
    sourceSoulFrameId: SoulFrameId,
    targetSoulFrameId: SoulFrameId
  ): Promise<SyncDecision> {
    // Validate SoulFrames exist
    const sourceSoulFrame =
      await this.soulFrameManager.getSoulFrame(sourceSoulFrameId);
    const targetSoulFrame =
      await this.soulFrameManager.getSoulFrame(targetSoulFrameId);

    if (!sourceSoulFrame) {
      throw new Error(
        `Source SoulFrame with ID ${sourceSoulFrameId} not found`
      );
    }

    if (!targetSoulFrame) {
      throw new Error(
        `Target SoulFrame with ID ${targetSoulFrameId} not found`
      );
    }

    // Get current system state
    const systemState = this.getCurrentSystemState();

    // Get emotional resonance between the SoulFrames if available
    let emotionalResonance = 0; // Default neutral
    if (this.emotionalResonanceIndex) {
      try {
        emotionalResonance =
          await this.emotionalResonanceIndex.getResonanceScore(
            sourceSoulFrameId,
            targetSoulFrameId
          );
      } catch (err) {
        console.warn('Could not get emotional resonance:', err);
      }
    } else if (
      systemState.emotionalResonanceMatrix &&
      systemState.emotionalResonanceMatrix[sourceSoulFrameId] &&
      systemState.emotionalResonanceMatrix[sourceSoulFrameId][
        targetSoulFrameId
      ] !== undefined
    ) {
      emotionalResonance =
        systemState.emotionalResonanceMatrix[sourceSoulFrameId][
          targetSoulFrameId
        ];
    }

    // Get criticality scores
    const sourceCriticality =
      systemState.criticalityScores[sourceSoulFrameId] || 0.5;
    const targetCriticality =
      systemState.criticalityScores[targetSoulFrameId] || 0.5;
    const maxCriticality = Math.max(sourceCriticality, targetCriticality);

    // Get activity levels
    const sourceActivity =
      systemState.soulFrameActivity[sourceSoulFrameId] || 0.1;
    const targetActivity =
      systemState.soulFrameActivity[targetSoulFrameId] || 0.1;
    const maxActivity = Math.max(sourceActivity, targetActivity);

    // Find all active profiles that match the current conditions
    const eligibleProfiles = Array.from(this.profiles.values()).filter(
      (profile) => {
        // Must be active
        if (!profile.metadata.isActive) {
          return false;
        }

        // Check if profile is restricted to specific SoulFrames
        if (
          profile.targetSoulFrameIds &&
          !profile.targetSoulFrameIds.includes(sourceSoulFrameId) &&
          !profile.targetSoulFrameIds.includes(targetSoulFrameId)
        ) {
          return false;
        }

        // Check emotional resonance conditions
        if (
          profile.conditions?.minEmotionalResonance !== undefined &&
          emotionalResonance < profile.conditions.minEmotionalResonance
        ) {
          return false;
        }

        if (
          profile.conditions?.maxEmotionalResonance !== undefined &&
          emotionalResonance > profile.conditions.maxEmotionalResonance
        ) {
          return false;
        }

        // Check activity threshold
        if (
          profile.conditions?.activityThreshold !== undefined &&
          maxActivity < profile.conditions.activityThreshold
        ) {
          return false;
        }

        // Check system load
        if (profile.conditions?.systemLoad !== undefined) {
          const currentLoad = systemState.overallLoad;
          if (
            currentLoad < profile.conditions.systemLoad.min ||
            currentLoad > profile.conditions.systemLoad.max
          ) {
            return false;
          }
        }

        // Check time of day
        if (profile.conditions?.timeOfDay !== undefined) {
          const currentHour = systemState.timeOfDay;
          if (
            currentHour < profile.conditions.timeOfDay.start ||
            currentHour > profile.conditions.timeOfDay.end
          ) {
            return false;
          }
        }

        return true;
      }
    );

    // If no eligible profiles, use the standard profile
    if (eligibleProfiles.length === 0) {
      const standardProfile = this.profiles.get('standard_sync');
      if (!standardProfile) {
        throw new Error('Standard synchronization profile not found');
      }
      eligibleProfiles.push(standardProfile);
    }

    // Score each eligible profile based on current conditions
    const scoredProfiles = eligibleProfiles.map((profile) => {
      let score = 0;

      // Higher score for matching emotional resonance conditions
      if (
        emotionalResonance < this.config.emotionalResonanceThresholds.dissonance
      ) {
        // High dissonance - prefer critical/fine-grained profiles
        score += profile.priority === SyncPriority.CRITICAL ? 3 : 0;
        score +=
          profile.granularity === SyncGranularity.FINE ||
          profile.granularity === SyncGranularity.ULTRA_FINE
            ? 2
            : 0;
      } else if (
        emotionalResonance > this.config.emotionalResonanceThresholds.resonance
      ) {
        // High resonance - prefer efficient/coarse-grained profiles
        score +=
          profile.priority === SyncPriority.LOW ||
          profile.priority === SyncPriority.BACKGROUND
            ? 2
            : 0;
        score +=
          profile.granularity === SyncGranularity.COARSE ||
          profile.granularity === SyncGranularity.ULTRA_COARSE
            ? 2
            : 0;
      }

      // Higher score for matching criticality
      if (maxCriticality > this.config.criticalityThresholds.high) {
        // High criticality - prefer critical/frequent profiles
        score +=
          profile.priority === SyncPriority.CRITICAL ||
          profile.priority === SyncPriority.HIGH
            ? 3
            : 0;
        score +=
          profile.frequency === SyncFrequency.CONTINUOUS ||
          profile.frequency === SyncFrequency.VERY_FREQUENT
            ? 2
            : 0;
      } else if (maxCriticality < this.config.criticalityThresholds.low) {
        // Low criticality - prefer efficient/infrequent profiles
        score +=
          profile.priority === SyncPriority.LOW ||
          profile.priority === SyncPriority.BACKGROUND
            ? 2
            : 0;
        score +=
          profile.frequency === SyncFrequency.INFREQUENT ||
          profile.frequency === SyncFrequency.ON_DEMAND
            ? 2
            : 0;
      }

      // Higher score for matching system load conditions
      if (systemState.overallLoad > this.config.systemLoadThresholds.high) {
        // High load - prefer efficient profiles
        score += profile.metadata.resourceIntensity < 0.4 ? 3 : 0;
      } else if (
        systemState.overallLoad < this.config.systemLoadThresholds.low
      ) {
        // Low load - can use more intensive profiles
        score += profile.metadata.resourceIntensity > 0.7 ? 1 : 0;
      }

      // Higher score for matching activity levels
      if (maxActivity > 0.7) {
        // High activity - prefer frequent syncs
        score +=
          profile.frequency === SyncFrequency.CONTINUOUS ||
          profile.frequency === SyncFrequency.VERY_FREQUENT
            ? 2
            : 0;
      } else if (maxActivity < 0.3) {
        // Low activity - prefer infrequent syncs
        score +=
          profile.frequency === SyncFrequency.INFREQUENT ||
          profile.frequency === SyncFrequency.PERIODIC
            ? 1
            : 0;
      }

      return { profile, score };
    });

    // Select the highest-scoring profile
    scoredProfiles.sort((a, b) => b.score - a.score);
    const selectedProfile = scoredProfiles[0].profile;

    // Determine which content types to sync based on the profile and current conditions
    let contentTypesToSync = [...selectedProfile.contentTypes];

    // If high dissonance, always include emotional state
    if (
      emotionalResonance <
        this.config.emotionalResonanceThresholds.dissonance &&
      !contentTypesToSync.includes(SyncContentType.EMOTIONAL_STATE)
    ) {
      contentTypesToSync.push(SyncContentType.EMOTIONAL_STATE);
    }

    // If high criticality, always include core memory and intention
    if (maxCriticality > this.config.criticalityThresholds.high) {
      if (!contentTypesToSync.includes(SyncContentType.CORE_MEMORY)) {
        contentTypesToSync.push(SyncContentType.CORE_MEMORY);
      }
      if (!contentTypesToSync.includes(SyncContentType.INTENTION)) {
        contentTypesToSync.push(SyncContentType.INTENTION);
      }
    }

    // If system is under high load, reduce content types to essentials
    if (
      systemState.overallLoad > this.config.systemLoadThresholds.high &&
      contentTypesToSync.length > 2
    ) {
      // Keep only the most essential types
      contentTypesToSync = contentTypesToSync.filter(
        (type) =>
          type === SyncContentType.CORE_MEMORY ||
          type === SyncContentType.INTENTION ||
          type === SyncContentType.EMOTIONAL_STATE
      );
    }

    // Generate reasoning for the decision
    const reasoning: string[] = [
      `Selected profile '${selectedProfile.name}' based on current conditions`,
      `Emotional resonance between SoulFrames: ${emotionalResonance.toFixed(2)}`,
      `Maximum criticality: ${maxCriticality.toFixed(2)}`,
      `System load: ${systemState.overallLoad.toFixed(2)}`,
      `Activity levels: source=${sourceActivity.toFixed(2)}, target=${targetActivity.toFixed(2)}`,
    ];

    // Create the sync decision
    const decision: SyncDecision = {
      sourceSoulFrameId,
      targetSoulFrameId,
      timestamp: new Date(),
      selectedProfile,
      contentTypesToSync,
      estimatedResourceUsage: this.estimateResourceUsage(
        selectedProfile,
        contentTypesToSync
      ),
      priority: selectedProfile.priority,
      reasoning,
    };

    // Record decision in ledger
    await this.recordEventInLedger('SYNC_DECISION_MADE', {
      sourceSoulFrameId,
      targetSoulFrameId,
      selectedProfileId: selectedProfile.id,
      contentTypeCount: contentTypesToSync.length,
      priority: selectedProfile.priority,
    });

    return decision;
  }

  async executeSynchronization(decision: SyncDecision): Promise<SyncResult> {
    // Check if we're already at max concurrent syncs
    if (this.activeSyncs.size >= this.config.maxConcurrentSyncs) {
      throw new Error(
        `Cannot execute synchronization: maximum concurrent syncs (${this.config.maxConcurrentSyncs}) reached`
      );
    }

    // Generate a unique ID for this sync operation
    const syncId = `sync_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // Mark this sync as active
    this.activeSyncs.add(syncId);

    // Record start in ledger
    await this.recordEventInLedger('SYNC_STARTED', {
      syncId,
      sourceSoulFrameId: decision.sourceSoulFrameId,
      targetSoulFrameId: decision.targetSoulFrameId,
      profileId: decision.selectedProfile.id,
      contentTypes: decision.contentTypesToSync,
    });

    const startTime = new Date();
    let success = true;
    const errors: string[] = [];
    const contentTypeResults: Record<
      SyncContentType,
      {
        success: boolean;
        syncedItemCount: number;
        duration: number;
      }
    > = {} as any;

    // In a real implementation, this would perform the actual synchronization
    // For now, we'll simulate the process

    // Simulate synchronization for each content type
    for (const contentType of decision.contentTypesToSync) {
      const contentStartTime = Date.now();

      try {
        // Simulate synchronization for this content type
        const syncedItemCount = await this.simulateSyncForContentType(
          decision.sourceSoulFrameId,
          decision.targetSoulFrameId,
          contentType,
          decision.selectedProfile.granularity
        );

        contentTypeResults[contentType] = {
          success: true,
          syncedItemCount,
          duration: Date.now() - contentStartTime,
        };
      } catch (err) {
        success = false;
        const errorMessage = err instanceof Error ? err.message : String(err);
        errors.push(`Error syncing ${contentType}: ${errorMessage}`);

        contentTypeResults[contentType] = {
          success: false,
          syncedItemCount: 0,
          duration: Date.now() - contentStartTime,
        };
      }
    }

    const endTime = new Date();
    const totalDuration = endTime.getTime() - startTime.getTime();

    // Calculate total synced items
    const totalSyncedItems = Object.values(contentTypeResults).reduce(
      (sum, result) => sum + result.syncedItemCount,
      0
    );

    // Calculate average throughput
    const averageThroughput =
      totalDuration > 0
        ? (totalSyncedItems / totalDuration) * 1000 // items per second
        : 0;

    // Simulate resource usage based on profile and actual duration
    const actualResourceUsage = Math.min(
      1.0,
      decision.estimatedResourceUsage *
        (totalDuration /
          (decision.selectedProfile.metadata.resourceIntensity * 5000 + 1000))
    );

    // Create the result
    const result: SyncResult = {
      id: syncId,
      decision,
      startTime,
      endTime,
      success,
      contentTypeResults,
      actualResourceUsage,
      errors: errors.length > 0 ? errors : undefined,
      metrics: {
        totalDuration,
        averageThroughput,
        peakMemoryUsage: Math.floor(actualResourceUsage * 100 * 1024 * 1024), // Simulated memory usage in bytes
      },
    };

    // Remove from active syncs
    this.activeSyncs.delete(syncId);

    // Add to sync history
    this.syncHistory.push(result);

    // Prune sync history if needed
    this.pruneSyncHistory();

    // Update system state with sync performance
    this.updateSyncPerformanceMetrics(result);

    // Record completion in ledger
    await this.recordEventInLedger('SYNC_COMPLETED', {
      syncId,
      success,
      duration: totalDuration,
      syncedItemCount: totalSyncedItems,
      errorCount: errors.length,
    });

    return result;
  }

  async getSyncHistory(filters?: {
    soulFrameIds?: SoulFrameId[];
    timeRange?: { start: Date; end: Date };
    success?: boolean;
    profileIds?: string[];
  }): Promise<SyncResult[]> {
    if (!filters) {
      return [...this.syncHistory];
    }

    return this.syncHistory.filter((result) => {
      // Filter by SoulFrame IDs
      if (filters.soulFrameIds) {
        const relevantIds = [
          result.decision.sourceSoulFrameId,
          result.decision.targetSoulFrameId,
        ];
        if (!filters.soulFrameIds.some((id) => relevantIds.includes(id))) {
          return false;
        }
      }

      // Filter by time range
      if (filters.timeRange) {
        if (
          result.startTime < filters.timeRange.start ||
          result.endTime > filters.timeRange.end
        ) {
          return false;
        }
      }

      // Filter by success
      if (filters.success !== undefined && result.success !== filters.success) {
        return false;
      }

      // Filter by profile IDs
      if (
        filters.profileIds &&
        !filters.profileIds.includes(result.decision.selectedProfile.id)
      ) {
        return false;
      }

      return true;
    });
  }

  async generateOptimalSyncSchedule(): Promise<SyncDecision[]> {
    // Get all SoulFrame IDs
    const soulFrameIds = await this.soulFrameManager.getAllSoulFrameIds();

    // Get current system state
    const systemState = this.getCurrentSystemState();

    // Calculate priority scores for each SoulFrame pair
    const priorityScores: Array<{
      sourceSoulFrameId: SoulFrameId;
      targetSoulFrameId: SoulFrameId;
      score: number;
    }> = [];

    for (let i = 0; i < soulFrameIds.length; i++) {
      const sourceId = soulFrameIds[i];

      for (let j = i + 1; j < soulFrameIds.length; j++) {
        const targetId = soulFrameIds[j];

        // Skip if either SoulFrame has low activity
        const sourceActivity = systemState.soulFrameActivity[sourceId] || 0.1;
        const targetActivity = systemState.soulFrameActivity[targetId] || 0.1;
        if (sourceActivity < 0.2 && targetActivity < 0.2) {
          continue;
        }

        // Calculate priority score based on multiple factors
        let score = 0;

        // Factor 1: Criticality
        const sourceCriticality =
          systemState.criticalityScores[sourceId] || 0.5;
        const targetCriticality =
          systemState.criticalityScores[targetId] || 0.5;
        score += Math.max(sourceCriticality, targetCriticality) * 3;

        // Factor 2: Activity level
        score += Math.max(sourceActivity, targetActivity) * 2;

        // Factor 3: Emotional resonance (if available)
        if (
          systemState.emotionalResonanceMatrix &&
          systemState.emotionalResonanceMatrix[sourceId] &&
          systemState.emotionalResonanceMatrix[sourceId][targetId] !== undefined
        ) {
          const resonance =
            systemState.emotionalResonanceMatrix[sourceId][targetId];

          // High dissonance increases priority
          if (resonance < this.config.emotionalResonanceThresholds.dissonance) {
            score += (1 - (resonance + 1) / 2) * 4; // Convert from [-1,1] to [0,1] and invert
          }
        }

        // Factor 4: Time since last sync
        const lastSync = this.findLastSyncBetween(sourceId, targetId);
        if (lastSync) {
          const hoursSinceLastSync =
            (Date.now() - lastSync.endTime.getTime()) / (60 * 60 * 1000);
          score += Math.min(hoursSinceLastSync / 24, 1) * 2; // Cap at 24 hours
        } else {
          // Never synced before - high priority
          score += 3;
        }

        priorityScores.push({
          sourceSoulFrameId: sourceId,
          targetSoulFrameId: targetId,
          score,
        });
      }
    }

    // Sort by priority score (descending)
    priorityScores.sort((a, b) => b.score - a.score);

    // Generate sync decisions for top pairs based on available resources
    const availableResources = 1 - systemState.overallLoad;
    const maxPairs = Math.max(1, Math.floor(availableResources * 10)); // Scale with available resources

    const decisions: SyncDecision[] = [];
    let usedResources = 0;

    for (const { sourceSoulFrameId, targetSoulFrameId } of priorityScores) {
      // Stop if we've reached the resource limit or max pairs
      if (usedResources >= availableResources || decisions.length >= maxPairs) {
        break;
      }

      try {
        // Generate a sync decision for this pair
        const decision = await this.decideSyncStrategy(
          sourceSoulFrameId,
          targetSoulFrameId
        );

        // Add to the schedule if it doesn't exceed available resources
        if (
          usedResources + decision.estimatedResourceUsage <=
          availableResources
        ) {
          decisions.push(decision);
          usedResources += decision.estimatedResourceUsage;
        }
      } catch (err) {
        console.warn(
          `Could not generate sync decision for ${sourceSoulFrameId} -> ${targetSoulFrameId}:`,
          err
        );
      }
    }

    return decisions;
  }

  async adjustToSystemLoad(currentLoad: number): Promise<void> {
    // Update system state with new load
    await this.updateSystemState({ overallLoad: currentLoad });

    // Adjust active profiles based on load
    if (currentLoad > this.config.systemLoadThresholds.high) {
      // High load - activate lightweight profiles, deactivate intensive ones
      for (const profile of this.profiles.values()) {
        if (profile.metadata.resourceIntensity > 0.7) {
          await this.deactivateProfile(profile.id);
        } else if (
          profile.metadata.resourceIntensity < 0.4 &&
          !profile.metadata.isActive
        ) {
          await this.activateProfile(profile.id);
        }
      }
    } else if (currentLoad < this.config.systemLoadThresholds.low) {
      // Low load - can activate more intensive profiles
      for (const profile of this.profiles.values()) {
        if (!profile.metadata.isActive) {
          await this.activateProfile(profile.id);
        }
      }
    }

    // Record adaptation in ledger
    await this.recordEventInLedger('ADAPTIVE_SYNC_LOAD_ADJUSTMENT', {
      currentLoad,
      activeProfiles: Array.from(this.profiles.values())
        .filter((p) => p.metadata.isActive)
        .map((p) => p.id),
    });
  }

  async learnFromSyncResults(results: SyncResult[]): Promise<void> {
    if (results.length === 0) {
      return;
    }

    // Analyze results to identify patterns and optimize profiles
    const profilePerformance: Record<
      string,
      {
        successCount: number;
        failureCount: number;
        totalDuration: number;
        totalResourceUsage: number;
        syncCount: number;
      }
    > = {};

    // Collect performance metrics by profile
    for (const result of results) {
      const profileId = result.decision.selectedProfile.id;

      if (!profilePerformance[profileId]) {
        profilePerformance[profileId] = {
          successCount: 0,
          failureCount: 0,
          totalDuration: 0,
          totalResourceUsage: 0,
          syncCount: 0,
        };
      }

      profilePerformance[profileId].syncCount++;
      profilePerformance[profileId].totalDuration +=
        result.metrics.totalDuration;
      profilePerformance[profileId].totalResourceUsage +=
        result.actualResourceUsage;

      if (result.success) {
        profilePerformance[profileId].successCount++;
      } else {
        profilePerformance[profileId].failureCount++;
      }
    }

    // Analyze performance and make adjustments to profiles
    for (const [profileId, performance] of Object.entries(profilePerformance)) {
      const profile = this.profiles.get(profileId);
      if (!profile) continue;

      const successRate =
        performance.syncCount > 0
          ? performance.successCount / performance.syncCount
          : 0;

      const avgDuration =
        performance.syncCount > 0
          ? performance.totalDuration / performance.syncCount
          : 0;

      const avgResourceUsage =
        performance.syncCount > 0
          ? performance.totalResourceUsage / performance.syncCount
          : 0;

      // If success rate is low, adjust the profile
      if (successRate < 0.7 && performance.syncCount >= 5) {
        // Reduce resource intensity or granularity
        let granularity = profile.granularity;

        if (granularity === SyncGranularity.ULTRA_FINE) {
          granularity = SyncGranularity.FINE;
        } else if (granularity === SyncGranularity.FINE) {
          granularity = SyncGranularity.MEDIUM;
        }

        if (granularity !== profile.granularity) {
          await this.updateProfile(profileId, { granularity });
        }
      }

      // If resource usage is consistently higher than estimated, adjust the resource intensity
      if (
        avgResourceUsage > profile.metadata.resourceIntensity * 1.2 &&
        performance.syncCount >= 5
      ) {
        const updatedProfile = { ...profile };
        updatedProfile.metadata.resourceIntensity = Math.min(
          1.0,
          avgResourceUsage * 1.1
        );
        this.profiles.set(profileId, updatedProfile);
      }
    }

    // If automatic profile generation is enabled, consider creating new profiles
    if (this.config.enableAutomaticProfileGeneration && results.length >= 10) {
      await this.considerGeneratingNewProfiles(results);
    }

    // Record learning in ledger
    await this.recordEventInLedger('ADAPTIVE_SYNC_LEARNING', {
      resultsAnalyzed: results.length,
      profilesAdjusted: Object.keys(profilePerformance).length,
    });
  }

  getConfig(): AdaptiveSynchronizationConfig {
    return { ...this.config };
  }

  async updateConfig(
    config: Partial<AdaptiveSynchronizationConfig>
  ): Promise<void> {
    this.config = { ...this.config, ...config };

    // Record config update in ledger
    await this.recordEventInLedger('ADAPTIVE_SYNC_CONFIG_UPDATED', {
      updatedFields: Object.keys(config),
    });
  }

  // Private helper methods

  private calculateResourceIntensity(
    profile: Omit<SyncProfile, 'id' | 'metadata'>
  ): number {
    let intensity = 0;

    // Factor 1: Granularity
    switch (profile.granularity) {
      case SyncGranularity.ULTRA_FINE:
        intensity += 0.4;
        break;
      case SyncGranularity.FINE:
        intensity += 0.3;
        break;
      case SyncGranularity.MEDIUM:
        intensity += 0.2;
        break;
      case SyncGranularity.COARSE:
        intensity += 0.1;
        break;
      case SyncGranularity.ULTRA_COARSE:
        intensity += 0.05;
        break;
    }

    // Factor 2: Frequency
    switch (profile.frequency) {
      case SyncFrequency.CONTINUOUS:
        intensity += 0.4;
        break;
      case SyncFrequency.VERY_FREQUENT:
        intensity += 0.3;
        break;
      case SyncFrequency.FREQUENT:
        intensity += 0.2;
        break;
      case SyncFrequency.PERIODIC:
        intensity += 0.1;
        break;
      case SyncFrequency.INFREQUENT:
      case SyncFrequency.ON_DEMAND:
        intensity += 0.05;
        break;
    }

    // Factor 3: Content types
    intensity += profile.contentTypes.length * 0.02;

    return Math.min(1.0, intensity);
  }

  private estimateResourceUsage(
    profile: SyncProfile,
    contentTypes: SyncContentType[]
  ): number {
    // Base resource usage from profile
    let usage = profile.metadata.resourceIntensity * 0.7;

    // Additional usage based on content types
    usage += contentTypes.length * 0.03;

    // Adjust based on granularity
    switch (profile.granularity) {
      case SyncGranularity.ULTRA_FINE:
        usage *= 1.5;
        break;
      case SyncGranularity.FINE:
        usage *= 1.2;
        break;
      case SyncGranularity.ULTRA_COARSE:
        usage *= 0.7;
        break;
    }

    return Math.min(1.0, usage);
  }

  private async simulateSyncForContentType(
    sourceSoulFrameId: SoulFrameId,
    targetSoulFrameId: SoulFrameId,
    contentType: SyncContentType,
    granularity: SyncGranularity
  ): Promise<number> {
    // In a real implementation, this would perform actual synchronization
    // For now, we'll simulate the process

    // Simulate some delay based on granularity and content type
    let delay = 100; // Base delay in ms

    switch (granularity) {
      case SyncGranularity.ULTRA_FINE:
        delay *= 5;
        break;
      case SyncGranularity.FINE:
        delay *= 3;
        break;
      case SyncGranularity.MEDIUM:
        delay *= 2;
        break;
      case SyncGranularity.COARSE:
        delay *= 1;
        break;
      case SyncGranularity.ULTRA_COARSE:
        delay *= 0.5;
        break;
    }

    // Different content types have different complexities
    switch (contentType) {
      case SyncContentType.CORE_MEMORY:
      case SyncContentType.EPISODIC_MEMORY:
        delay *= 2;
        break;
      case SyncContentType.DREAM_STATE:
      case SyncContentType.META_LEARNING:
        delay *= 3;
        break;
    }

    // Simulate the delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Simulate the number of items synced
    let itemCount = 0;

    switch (granularity) {
      case SyncGranularity.ULTRA_FINE:
        itemCount = Math.floor(Math.random() * 50) + 100; // 100-150 items
        break;
      case SyncGranularity.FINE:
        itemCount = Math.floor(Math.random() * 30) + 50; // 50-80 items
        break;
      case SyncGranularity.MEDIUM:
        itemCount = Math.floor(Math.random() * 20) + 20; // 20-40 items
        break;
      case SyncGranularity.COARSE:
        itemCount = Math.floor(Math.random() * 10) + 5; // 5-15 items
        break;
      case SyncGranularity.ULTRA_COARSE:
        itemCount = Math.floor(Math.random() * 5) + 1; // 1-5 items
        break;
    }

    // Simulate occasional failures
    const failureRate = 0.05; // 5% chance of failure
    if (Math.random() < failureRate) {
      throw new Error(`Simulated failure in synchronizing ${contentType}`);
    }

    return itemCount;
  }

  private updateSyncPerformanceMetrics(result: SyncResult): void {
    // Update recent sync performance metrics in system state
    const currentMetrics = this.currentSystemState.recentSyncPerformance;

    // Calculate new average duration (weighted average with recent results)
    const newAvgDuration =
      currentMetrics.averageDuration * 0.7 + result.metrics.totalDuration * 0.3;

    // Update success rate (weighted average)
    const newSuccessRate =
      currentMetrics.successRate * 0.7 + (result.success ? 1 : 0) * 0.3;

    // Update resource usage (weighted average)
    const newResourceUsage =
      currentMetrics.resourceUsage * 0.7 + result.actualResourceUsage * 0.3;

    // Update the system state
    this.currentSystemState.recentSyncPerformance = {
      averageDuration: newAvgDuration,
      successRate: newSuccessRate,
      resourceUsage: newResourceUsage,
    };
  }

  private pruneSyncHistory(): void {
    // Remove old sync results based on retention period
    const cutoffTime = Date.now() - this.config.syncHistoryRetentionPeriod;
    this.syncHistory = this.syncHistory.filter(
      (result) => result.endTime.getTime() >= cutoffTime
    );
  }

  private findLastSyncBetween(
    sourceId: SoulFrameId,
    targetId: SoulFrameId
  ): SyncResult | null {
    // Find the most recent sync between these two SoulFrames
    const relevantSyncs = this.syncHistory.filter(
      (result) =>
        (result.decision.sourceSoulFrameId === sourceId &&
          result.decision.targetSoulFrameId === targetId) ||
        (result.decision.sourceSoulFrameId === targetId &&
          result.decision.targetSoulFrameId === sourceId)
    );

    if (relevantSyncs.length === 0) {
      return null;
    }

    // Sort by end time (descending) and return the most recent
    relevantSyncs.sort((a, b) => b.endTime.getTime() - a.endTime.getTime());
    return relevantSyncs[0];
  }

  private async adaptToChangedConditions(): Promise<void> {
    // Generate a new optimal sync schedule based on changed conditions
    const schedule = await this.generateOptimalSyncSchedule();

    // Record adaptation in ledger
    await this.recordEventInLedger('ADAPTIVE_SYNC_CONDITION_CHANGE', {
      systemLoad: this.currentSystemState.overallLoad,
      scheduledSyncs: schedule.length,
    });
  }

  private async considerGeneratingNewProfiles(
    results: SyncResult[]
  ): Promise<void> {
    // Analyze sync results to identify patterns that might benefit from new profiles

    // Group results by SoulFrame pairs
    const pairResults: Record<string, SyncResult[]> = {};

    for (const result of results) {
      const sourceId = result.decision.sourceSoulFrameId;
      const targetId = result.decision.targetSoulFrameId;
      const pairKey =
        sourceId < targetId
          ? `${sourceId}-${targetId}`
          : `${targetId}-${sourceId}`;

      if (!pairResults[pairKey]) {
        pairResults[pairKey] = [];
      }

      pairResults[pairKey].push(result);
    }

    // Look for pairs with consistent patterns that might benefit from specialized profiles
    for (const [pairKey, pairResultList] of Object.entries(pairResults)) {
      // Only consider pairs with enough history
      if (pairResultList.length < 5) continue;

      // Check if existing profiles are performing well for this pair
      const successRate =
        pairResultList.filter((r) => r.success).length / pairResultList.length;

      // If success rate is already high, no need for a new profile
      if (successRate > 0.9) continue;

      // Check if there's a consistent pattern of emotional resonance
      const resonanceValues = await this.getResonanceHistoryForPair(pairKey);

      if (resonanceValues.length >= 5) {
        const avgResonance =
          resonanceValues.reduce((sum, val) => sum + val, 0) /
          resonanceValues.length;
        const resonanceVariance = this.calculateVariance(resonanceValues);

        // If there's a consistent pattern of high dissonance, create a specialized profile
        if (
          avgResonance < this.config.emotionalResonanceThresholds.dissonance &&
          resonanceVariance < 0.1
        ) {
          await this.createDissonanceHandlingProfile(pairKey);
        }
        // If there's a consistent pattern of high resonance, create an efficient profile
        else if (
          avgResonance > this.config.emotionalResonanceThresholds.resonance &&
          resonanceVariance < 0.1
        ) {
          await this.createHighResonanceProfile(pairKey);
        }
      }
    }
  }

  private async getResonanceHistoryForPair(pairKey: string): Promise<number[]> {
    const [id1, id2] = pairKey.split('-');

    if (!this.emotionalResonanceIndex) {
      return [];
    }

    try {
      // In a real implementation, this would query historical resonance values
      // For now, we'll return a simulated history
      const currentResonance =
        await this.emotionalResonanceIndex.getResonanceScore(id1, id2);

      // Simulate some historical values around the current value
      const history = [currentResonance];

      for (let i = 0; i < 9; i++) {
        // Add some small random variation
        const variation = (Math.random() - 0.5) * 0.2;
        history.push(Math.max(-1, Math.min(1, currentResonance + variation)));
      }

      return history;
    } catch (err) {
      console.warn('Could not get resonance history:', err);
      return [];
    }
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;

    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private async createDissonanceHandlingProfile(
    pairKey: string
  ): Promise<void> {
    const [id1, id2] = pairKey.split('-');

    // Check if a specialized profile already exists for this pair
    const existingProfile = Array.from(this.profiles.values()).find(
      (p) =>
        p.targetSoulFrameIds &&
        p.targetSoulFrameIds.includes(id1) &&
        p.targetSoulFrameIds.includes(id2) &&
        p.conditions?.maxEmotionalResonance !== undefined &&
        p.conditions.maxEmotionalResonance < 0
    );

    if (existingProfile) {
      // Profile already exists, no need to create a new one
      return;
    }

    // Create a new profile specialized for handling dissonance between these SoulFrames
    await this.createProfile({
      name: `Dissonance Handler ${id1}-${id2}`,
      description: `Specialized profile for handling persistent dissonance between SoulFrames ${id1} and ${id2}`,
      granularity: SyncGranularity.FINE,
      frequency: SyncFrequency.VERY_FREQUENT,
      priority: SyncPriority.HIGH,
      contentTypes: [
        SyncContentType.CORE_MEMORY,
        SyncContentType.EMOTIONAL_STATE,
        SyncContentType.INTENTION,
        SyncContentType.PURPOSE,
      ],
      targetSoulFrameIds: [id1, id2],
      conditions: {
        maxEmotionalResonance: -0.3, // Only apply when dissonance is detected
      },
    });
  }

  private async createHighResonanceProfile(pairKey: string): Promise<void> {
    const [id1, id2] = pairKey.split('-');

    // Check if a specialized profile already exists for this pair
    const existingProfile = Array.from(this.profiles.values()).find(
      (p) =>
        p.targetSoulFrameIds &&
        p.targetSoulFrameIds.includes(id1) &&
        p.targetSoulFrameIds.includes(id2) &&
        p.conditions?.minEmotionalResonance !== undefined &&
        p.conditions.minEmotionalResonance > 0
    );

    if (existingProfile) {
      // Profile already exists, no need to create a new one
      return;
    }

    // Create a new profile specialized for high resonance between these SoulFrames
    await this.createProfile({
      name: `Resonance Optimizer ${id1}-${id2}`,
      description: `Efficient synchronization profile for highly resonant SoulFrames ${id1} and ${id2}`,
      granularity: SyncGranularity.COARSE,
      frequency: SyncFrequency.PERIODIC,
      priority: SyncPriority.LOW,
      contentTypes: [SyncContentType.CORE_MEMORY, SyncContentType.INTENTION],
      targetSoulFrameIds: [id1, id2],
      conditions: {
        minEmotionalResonance: 0.5, // Only apply when high resonance is detected
      },
    });
  }

  private async recordEventInLedger(
    eventType: string,
    payload: any
  ): Promise<void> {
    try {
      await this.codalogueProtocolLedger.recordEvent({
        type: `ADAPTIVE_SYNC_${eventType}`,
        timestamp: new Date(),
        source: 'AdaptiveSynchronization',
        payload,
      });
    } catch (err) {
      console.warn(`Failed to record ${eventType} event in ledger:`, err);
    }
  }
}

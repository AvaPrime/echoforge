/**
 * Purpose Alignment Engine
 *
 * Correlates summarizations with global mission statements and active intentions,
 * ensuring that memory consolidation and evolution align with the system's purpose.
 */

import { SoulFrameManager } from '../SoulFrameManager';
import { CodalogueProtocolLedger } from '../CodalogueProtocolLedger';
import { CODESIGConsolidationResult } from '../CODESIGTypes';
import { v4 as uuidv4 } from 'uuid';

/**
 * Purpose statement for a SoulFrame or the system as a whole
 */
export interface PurposeStatement {
  /** Unique identifier for the purpose statement */
  id: string;

  /** Title of the purpose statement */
  title: string;

  /** Detailed description of the purpose */
  description: string;

  /** Key principles that guide this purpose */
  principles: string[];

  /** Measurable objectives for this purpose */
  objectives: {
    /** Description of the objective */
    description: string;

    /** How to measure progress toward this objective */
    measurement: string;

    /** Target value or state */
    target: string;
  }[];

  /** Whether this is a system-wide purpose or specific to a SoulFrame */
  scope: 'system' | 'soulframe';

  /** ID of the SoulFrame this purpose belongs to (if scope is 'soulframe') */
  soulFrameId?: string;

  /** Priority level (1-10, with 10 being highest) */
  priority: number;

  /** Timestamp when this purpose was created */
  createdAt: Date;

  /** Timestamp when this purpose was last updated */
  updatedAt: Date;
}

/**
 * Active intention that guides current system behavior
 */
export interface ActiveIntention {
  /** Unique identifier for the intention */
  id: string;

  /** Short description of the intention */
  description: string;

  /** Related purpose statement ID */
  purposeStatementId: string;

  /** ID of the SoulFrame this intention belongs to (if applicable) */
  soulFrameId?: string;

  /** Strength of the intention (0-1) */
  strength: number;

  /** Context in which this intention is active */
  context: string;

  /** Timestamp when this intention was created */
  createdAt: Date;

  /** Timestamp when this intention expires (if applicable) */
  expiresAt?: Date;

  /** Whether this intention is currently active */
  isActive: boolean;
}

/**
 * Alignment analysis result
 */
export interface AlignmentAnalysis {
  /** Unique identifier for the analysis */
  id: string;

  /** Overall alignment score (0-1) */
  alignmentScore: number;

  /** Specific alignments with purpose statements */
  purposeAlignments: {
    /** ID of the purpose statement */
    purposeStatementId: string;

    /** Alignment score with this purpose (0-1) */
    score: number;

    /** Specific aspects that align well */
    alignedAspects: string[];

    /** Specific aspects that misalign */
    misalignedAspects: string[];
  }[];

  /** Specific alignments with active intentions */
  intentionAlignments: {
    /** ID of the active intention */
    intentionId: string;

    /** Alignment score with this intention (0-1) */
    score: number;

    /** How this alignment influences the overall score */
    influence: number;
  }[];

  /** Recommendations for improving alignment */
  recommendations: string[];

  /** Timestamp of the analysis */
  timestamp: Date;
}

/**
 * Configuration for the Purpose Alignment Engine
 */
export interface PurposeAlignmentConfig {
  /** Minimum alignment score threshold for acceptance */
  minAlignmentThreshold: number;

  /** Weight of system-wide purposes vs. SoulFrame-specific purposes */
  systemPurposeWeight: number;

  /** Weight of active intentions vs. long-term purposes */
  intentionWeight: number;

  /** Whether to automatically adjust intentions based on alignment */
  autoAdjustIntentions: boolean;

  /** Whether to record alignment analyses in the Codalogue */
  recordAlignmentInCodalogue: boolean;
}

/**
 * Default configuration for the Purpose Alignment Engine
 */
export const DEFAULT_ALIGNMENT_CONFIG: PurposeAlignmentConfig = {
  minAlignmentThreshold: 0.7,
  systemPurposeWeight: 0.6,
  intentionWeight: 0.4,
  autoAdjustIntentions: false,
  recordAlignmentInCodalogue: true,
};

/**
 * Purpose Alignment Engine
 *
 * Ensures that memory consolidation and evolution align with the system's purpose
 * and active intentions.
 */
export class PurposeAlignmentEngine {
  /** Purpose statements */
  private purposeStatements: Map<string, PurposeStatement> = new Map();

  /** Active intentions */
  private activeIntentions: Map<string, ActiveIntention> = new Map();

  /**
   * Creates a new Purpose Alignment Engine
   *
   * @param soulFrameManager Manager for accessing SoulFrames
   * @param codalogueProtocolLedger Ledger for recording events
   * @param config Configuration for the engine
   */
  constructor(
    private soulFrameManager: SoulFrameManager,
    private codalogueProtocolLedger: CodalogueProtocolLedger,
    private config: PurposeAlignmentConfig = DEFAULT_ALIGNMENT_CONFIG
  ) {}

  /**
   * Defines a new purpose statement
   *
   * @param title Title of the purpose statement
   * @param description Detailed description of the purpose
   * @param principles Key principles that guide this purpose
   * @param objectives Measurable objectives for this purpose
   * @param scope Whether this is a system-wide purpose or specific to a SoulFrame
   * @param soulFrameId ID of the SoulFrame this purpose belongs to (if scope is 'soulframe')
   * @param priority Priority level (1-10, with 10 being highest)
   * @returns The created purpose statement
   */
  async definePurposeStatement(
    title: string,
    description: string,
    principles: string[],
    objectives: { description: string; measurement: string; target: string }[],
    scope: 'system' | 'soulframe',
    soulFrameId?: string,
    priority: number = 5
  ): Promise<PurposeStatement> {
    // Validate input
    if (scope === 'soulframe' && !soulFrameId) {
      throw new Error(
        'SoulFrame ID is required for SoulFrame-specific purpose statements'
      );
    }

    if (soulFrameId) {
      const soulFrame = await this.soulFrameManager.getSoulFrame(soulFrameId);
      if (!soulFrame) {
        throw new Error(`SoulFrame with ID ${soulFrameId} not found`);
      }
    }

    // Create the purpose statement
    const purposeStatement: PurposeStatement = {
      id: uuidv4(),
      title,
      description,
      principles,
      objectives,
      scope,
      soulFrameId,
      priority,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Store the purpose statement
    this.purposeStatements.set(purposeStatement.id, purposeStatement);

    // Record the purpose statement in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'PURPOSE_STATEMENT_DEFINED',
      content: `Purpose statement defined: ${title}`,
      metadata: {
        purposeStatementId: purposeStatement.id,
        scope,
        soulFrameId,
        priority,
        timestamp: purposeStatement.createdAt,
      },
    });

    return purposeStatement;
  }

  /**
   * Updates an existing purpose statement
   *
   * @param purposeStatementId ID of the purpose statement to update
   * @param updates Updates to apply
   * @returns The updated purpose statement
   */
  async updatePurposeStatement(
    purposeStatementId: string,
    updates: Partial<{
      title: string;
      description: string;
      principles: string[];
      objectives: {
        description: string;
        measurement: string;
        target: string;
      }[];
      priority: number;
    }>
  ): Promise<PurposeStatement> {
    // Get the purpose statement
    const purposeStatement = this.purposeStatements.get(purposeStatementId);
    if (!purposeStatement) {
      throw new Error(
        `Purpose statement with ID ${purposeStatementId} not found`
      );
    }

    // Apply updates
    if (updates.title) purposeStatement.title = updates.title;
    if (updates.description) purposeStatement.description = updates.description;
    if (updates.principles) purposeStatement.principles = updates.principles;
    if (updates.objectives) purposeStatement.objectives = updates.objectives;
    if (updates.priority) purposeStatement.priority = updates.priority;

    // Update the timestamp
    purposeStatement.updatedAt = new Date();

    // Record the update in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'PURPOSE_STATEMENT_UPDATED',
      content: `Purpose statement updated: ${purposeStatement.title}`,
      metadata: {
        purposeStatementId,
        updates: Object.keys(updates),
        timestamp: purposeStatement.updatedAt,
      },
    });

    return purposeStatement;
  }

  /**
   * Deletes a purpose statement
   *
   * @param purposeStatementId ID of the purpose statement to delete
   */
  async deletePurposeStatement(purposeStatementId: string): Promise<void> {
    // Get the purpose statement
    const purposeStatement = this.purposeStatements.get(purposeStatementId);
    if (!purposeStatement) {
      throw new Error(
        `Purpose statement with ID ${purposeStatementId} not found`
      );
    }

    // Delete the purpose statement
    this.purposeStatements.delete(purposeStatementId);

    // Delete any active intentions associated with this purpose statement
    for (const [intentionId, intention] of this.activeIntentions.entries()) {
      if (intention.purposeStatementId === purposeStatementId) {
        this.activeIntentions.delete(intentionId);
      }
    }

    // Record the deletion in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'PURPOSE_STATEMENT_DELETED',
      content: `Purpose statement deleted: ${purposeStatement.title}`,
      metadata: {
        purposeStatementId,
        title: purposeStatement.title,
        scope: purposeStatement.scope,
        soulFrameId: purposeStatement.soulFrameId,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Creates a new active intention
   *
   * @param description Short description of the intention
   * @param purposeStatementId Related purpose statement ID
   * @param soulFrameId ID of the SoulFrame this intention belongs to (if applicable)
   * @param strength Strength of the intention (0-1)
   * @param context Context in which this intention is active
   * @param expiresAt Timestamp when this intention expires (if applicable)
   * @returns The created active intention
   */
  async createActiveIntention(
    description: string,
    purposeStatementId: string,
    soulFrameId?: string,
    strength: number = 0.8,
    context: string = 'general',
    expiresAt?: Date
  ): Promise<ActiveIntention> {
    // Validate input
    const purposeStatement = this.purposeStatements.get(purposeStatementId);
    if (!purposeStatement) {
      throw new Error(
        `Purpose statement with ID ${purposeStatementId} not found`
      );
    }

    if (soulFrameId) {
      const soulFrame = await this.soulFrameManager.getSoulFrame(soulFrameId);
      if (!soulFrame) {
        throw new Error(`SoulFrame with ID ${soulFrameId} not found`);
      }
    }

    // Create the active intention
    const activeIntention: ActiveIntention = {
      id: uuidv4(),
      description,
      purposeStatementId,
      soulFrameId,
      strength,
      context,
      createdAt: new Date(),
      expiresAt,
      isActive: true,
    };

    // Store the active intention
    this.activeIntentions.set(activeIntention.id, activeIntention);

    // Record the active intention in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'ACTIVE_INTENTION_CREATED',
      content: `Active intention created: ${description}`,
      metadata: {
        intentionId: activeIntention.id,
        purposeStatementId,
        soulFrameId,
        strength,
        context,
        expiresAt,
        timestamp: activeIntention.createdAt,
      },
    });

    return activeIntention;
  }

  /**
   * Updates an existing active intention
   *
   * @param intentionId ID of the intention to update
   * @param updates Updates to apply
   * @returns The updated active intention
   */
  async updateActiveIntention(
    intentionId: string,
    updates: Partial<{
      description: string;
      strength: number;
      context: string;
      expiresAt?: Date;
      isActive: boolean;
    }>
  ): Promise<ActiveIntention> {
    // Get the active intention
    const activeIntention = this.activeIntentions.get(intentionId);
    if (!activeIntention) {
      throw new Error(`Active intention with ID ${intentionId} not found`);
    }

    // Apply updates
    if (updates.description) activeIntention.description = updates.description;
    if (updates.strength !== undefined)
      activeIntention.strength = updates.strength;
    if (updates.context) activeIntention.context = updates.context;
    if (updates.expiresAt !== undefined)
      activeIntention.expiresAt = updates.expiresAt;
    if (updates.isActive !== undefined)
      activeIntention.isActive = updates.isActive;

    // Record the update in the Codalogue
    await this.codalogueProtocolLedger.recordSystemReflection({
      reflectionType: 'ACTIVE_INTENTION_UPDATED',
      content: `Active intention updated: ${activeIntention.description}`,
      metadata: {
        intentionId,
        updates: Object.keys(updates),
        timestamp: new Date(),
      },
    });

    return activeIntention;
  }

  /**
   * Deactivates an active intention
   *
   * @param intentionId ID of the intention to deactivate
   * @returns The deactivated intention
   */
  async deactivateIntention(intentionId: string): Promise<ActiveIntention> {
    return this.updateActiveIntention(intentionId, { isActive: false });
  }

  /**
   * Analyzes the alignment of a consolidation result with purpose statements and active intentions
   *
   * @param consolidationResult The consolidation result to analyze
   * @param soulFrameId ID of the SoulFrame that produced the consolidation result
   * @returns The alignment analysis
   */
  async analyzeAlignment(
    consolidationResult: CODESIGConsolidationResult,
    soulFrameId?: string
  ): Promise<AlignmentAnalysis> {
    // Get relevant purpose statements
    const relevantPurposeStatements = Array.from(
      this.purposeStatements.values()
    ).filter((ps) => {
      if (ps.scope === 'system') return true;
      if (ps.scope === 'soulframe' && ps.soulFrameId === soulFrameId)
        return true;
      return false;
    });

    // Get relevant active intentions
    const relevantIntentions = Array.from(
      this.activeIntentions.values()
    ).filter((ai) => {
      if (!ai.isActive) return false;
      if (ai.expiresAt && ai.expiresAt < new Date()) return false;
      if (!ai.soulFrameId) return true;
      if (ai.soulFrameId === soulFrameId) return true;
      return false;
    });

    // Calculate purpose alignments
    const purposeAlignments = await Promise.all(
      relevantPurposeStatements.map(async (ps) => {
        const alignmentScore = await this.calculatePurposeAlignment(
          consolidationResult,
          ps
        );
        const alignedAspects = await this.identifyAlignedAspects(
          consolidationResult,
          ps
        );
        const misalignedAspects = await this.identifyMisalignedAspects(
          consolidationResult,
          ps
        );

        return {
          purposeStatementId: ps.id,
          score: alignmentScore,
          alignedAspects,
          misalignedAspects,
        };
      })
    );

    // Calculate intention alignments
    const intentionAlignments = await Promise.all(
      relevantIntentions.map(async (ai) => {
        const alignmentScore = await this.calculateIntentionAlignment(
          consolidationResult,
          ai
        );
        const influence = ai.strength * this.config.intentionWeight;

        return {
          intentionId: ai.id,
          score: alignmentScore,
          influence,
        };
      })
    );

    // Calculate overall alignment score
    let overallScore = 0;
    let totalWeight = 0;

    // Add purpose statement scores
    for (const pa of purposeAlignments) {
      const ps = this.purposeStatements.get(pa.purposeStatementId)!;
      const weight =
        ps.scope === 'system'
          ? this.config.systemPurposeWeight * (ps.priority / 10)
          : (1 - this.config.systemPurposeWeight) * (ps.priority / 10);

      overallScore += pa.score * weight;
      totalWeight += weight;
    }

    // Add intention scores
    for (const ia of intentionAlignments) {
      overallScore += ia.score * ia.influence;
      totalWeight += ia.influence;
    }

    // Normalize the overall score
    if (totalWeight > 0) {
      overallScore /= totalWeight;
    }

    // Generate recommendations
    const recommendations = await this.generateRecommendations(
      consolidationResult,
      purposeAlignments,
      intentionAlignments,
      overallScore
    );

    // Create the alignment analysis
    const analysis: AlignmentAnalysis = {
      id: uuidv4(),
      alignmentScore: overallScore,
      purposeAlignments,
      intentionAlignments,
      recommendations,
      timestamp: new Date(),
    };

    // Record the analysis in the Codalogue if configured
    if (this.config.recordAlignmentInCodalogue) {
      await this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'ALIGNMENT_ANALYSIS',
        content: `Alignment analysis: score ${overallScore.toFixed(2)}`,
        metadata: {
          analysisId: analysis.id,
          consolidationResultId: consolidationResult.codalogueEntryId,
          soulFrameId,
          alignmentScore: overallScore,
          timestamp: analysis.timestamp,
        },
      });
    }

    // Auto-adjust intentions if configured
    if (this.config.autoAdjustIntentions) {
      await this.autoAdjustIntentions(analysis, consolidationResult);
    }

    return analysis;
  }

  /**
   * Calculates the alignment score between a consolidation result and a purpose statement
   *
   * @param consolidationResult The consolidation result
   * @param purposeStatement The purpose statement
   * @returns The alignment score (0-1)
   */
  private async calculatePurposeAlignment(
    consolidationResult: CODESIGConsolidationResult,
    purposeStatement: PurposeStatement
  ): Promise<number> {
    // This is a simplified implementation that could be enhanced with more sophisticated
    // semantic analysis in a real-world implementation

    // Check if the summary contains key terms from the purpose statement
    const summary = consolidationResult.summary.toLowerCase();
    const title = purposeStatement.title.toLowerCase();
    const description = purposeStatement.description.toLowerCase();

    // Calculate title match
    const titleWords = title.split(/\s+/).filter((w) => w.length > 3);
    const titleMatches = titleWords.filter((word) =>
      summary.includes(word)
    ).length;
    const titleScore =
      titleWords.length > 0 ? titleMatches / titleWords.length : 0;

    // Calculate description match
    const descWords = description.split(/\s+/).filter((w) => w.length > 3);
    const descMatches = descWords.filter((word) =>
      summary.includes(word)
    ).length;
    const descScore = descWords.length > 0 ? descMatches / descWords.length : 0;

    // Calculate principles match
    let principlesScore = 0;
    if (purposeStatement.principles.length > 0) {
      const principleMatches = purposeStatement.principles.filter(
        (principle) => {
          const principleWords = principle
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3);
          const matches = principleWords.filter((word) =>
            summary.includes(word)
          ).length;
          return matches / principleWords.length > 0.5;
        }
      ).length;

      principlesScore = principleMatches / purposeStatement.principles.length;
    }

    // Calculate objectives match
    let objectivesScore = 0;
    if (purposeStatement.objectives.length > 0) {
      const objectiveMatches = purposeStatement.objectives.filter(
        (objective) => {
          const objectiveWords = objective.description
            .toLowerCase()
            .split(/\s+/)
            .filter((w) => w.length > 3);
          const matches = objectiveWords.filter((word) =>
            summary.includes(word)
          ).length;
          return matches / objectiveWords.length > 0.5;
        }
      ).length;

      objectivesScore = objectiveMatches / purposeStatement.objectives.length;
    }

    // Calculate emotional resonance alignment
    // This assumes that higher emotional resonance generally aligns with purpose
    const emotionalScore = consolidationResult.emotionalResonance || 0;

    // Calculate intent alignment contribution
    const intentScore = consolidationResult.intentAlignment || 0;

    // Combine scores with appropriate weights
    return (
      titleScore * 0.15 +
      descScore * 0.25 +
      principlesScore * 0.2 +
      objectivesScore * 0.2 +
      emotionalScore * 0.1 +
      intentScore * 0.1
    );
  }

  /**
   * Identifies aspects of a consolidation result that align well with a purpose statement
   *
   * @param consolidationResult The consolidation result
   * @param purposeStatement The purpose statement
   * @returns Array of aligned aspects
   */
  private async identifyAlignedAspects(
    consolidationResult: CODESIGConsolidationResult,
    purposeStatement: PurposeStatement
  ): Promise<string[]> {
    const alignedAspects: string[] = [];
    const summary = consolidationResult.summary.toLowerCase();

    // Check for title alignment
    const titleWords = purposeStatement.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const titleMatches = titleWords.filter((word) =>
      summary.includes(word)
    ).length;
    if (titleWords.length > 0 && titleMatches / titleWords.length > 0.7) {
      alignedAspects.push(
        `Aligns with purpose title: ${purposeStatement.title}`
      );
    }

    // Check for principles alignment
    for (const principle of purposeStatement.principles) {
      const principleWords = principle
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const matches = principleWords.filter((word) =>
        summary.includes(word)
      ).length;
      if (principleWords.length > 0 && matches / principleWords.length > 0.6) {
        alignedAspects.push(`Aligns with principle: ${principle}`);
      }
    }

    // Check for objectives alignment
    for (const objective of purposeStatement.objectives) {
      const objectiveWords = objective.description
        .toLowerCase()
        .split(/\s+/)
        .filter((w) => w.length > 3);
      const matches = objectiveWords.filter((word) =>
        summary.includes(word)
      ).length;
      if (objectiveWords.length > 0 && matches / objectiveWords.length > 0.6) {
        alignedAspects.push(`Aligns with objective: ${objective.description}`);
      }
    }

    // Check for emotional resonance
    if ((consolidationResult.emotionalResonance || 0) > 0.7) {
      alignedAspects.push(
        'High emotional resonance supports purpose alignment'
      );
    }

    // Check for intent alignment
    if ((consolidationResult.intentAlignment || 0) > 0.7) {
      alignedAspects.push('Strong intent alignment with purpose');
    }

    return alignedAspects;
  }

  /**
   * Identifies aspects of a consolidation result that misalign with a purpose statement
   *
   * @param consolidationResult The consolidation result
   * @param purposeStatement The purpose statement
   * @returns Array of misaligned aspects
   */
  private async identifyMisalignedAspects(
    consolidationResult: CODESIGConsolidationResult,
    purposeStatement: PurposeStatement
  ): Promise<string[]> {
    const misalignedAspects: string[] = [];
    const summary = consolidationResult.summary.toLowerCase();

    // Check for title misalignment
    const titleWords = purposeStatement.title
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 3);
    const titleMatches = titleWords.filter((word) =>
      summary.includes(word)
    ).length;
    if (titleWords.length > 0 && titleMatches / titleWords.length < 0.3) {
      misalignedAspects.push(
        `Limited alignment with purpose title: ${purposeStatement.title}`
      );
    }

    // Check for principles misalignment
    const alignedPrinciples = purposeStatement.principles.filter(
      (principle) => {
        const principleWords = principle
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        const matches = principleWords.filter((word) =>
          summary.includes(word)
        ).length;
        return (
          principleWords.length > 0 && matches / principleWords.length > 0.6
        );
      }
    ).length;

    if (
      purposeStatement.principles.length > 0 &&
      alignedPrinciples / purposeStatement.principles.length < 0.3
    ) {
      misalignedAspects.push('Limited alignment with core principles');
    }

    // Check for objectives misalignment
    const alignedObjectives = purposeStatement.objectives.filter(
      (objective) => {
        const objectiveWords = objective.description
          .toLowerCase()
          .split(/\s+/)
          .filter((w) => w.length > 3);
        const matches = objectiveWords.filter((word) =>
          summary.includes(word)
        ).length;
        return (
          objectiveWords.length > 0 && matches / objectiveWords.length > 0.6
        );
      }
    ).length;

    if (
      purposeStatement.objectives.length > 0 &&
      alignedObjectives / purposeStatement.objectives.length < 0.3
    ) {
      misalignedAspects.push('Limited alignment with measurable objectives');
    }

    // Check for emotional resonance
    if ((consolidationResult.emotionalResonance || 0) < 0.4) {
      misalignedAspects.push(
        'Low emotional resonance may indicate purpose misalignment'
      );
    }

    // Check for intent alignment
    if ((consolidationResult.intentAlignment || 0) < 0.4) {
      misalignedAspects.push('Weak intent alignment with purpose');
    }

    return misalignedAspects;
  }

  /**
   * Calculates the alignment score between a consolidation result and an active intention
   *
   * @param consolidationResult The consolidation result
   * @param activeIntention The active intention
   * @returns The alignment score (0-1)
   */
  private async calculateIntentionAlignment(
    consolidationResult: CODESIGConsolidationResult,
    activeIntention: ActiveIntention
  ): Promise<number> {
    // Get the related purpose statement
    const purposeStatement = this.purposeStatements.get(
      activeIntention.purposeStatementId
    );
    if (!purposeStatement) {
      return 0;
    }

    // Check if the summary contains key terms from the intention
    const summary = consolidationResult.summary.toLowerCase();
    const description = activeIntention.description.toLowerCase();
    const context = activeIntention.context.toLowerCase();

    // Calculate description match
    const descWords = description.split(/\s+/).filter((w) => w.length > 3);
    const descMatches = descWords.filter((word) =>
      summary.includes(word)
    ).length;
    const descScore = descWords.length > 0 ? descMatches / descWords.length : 0;

    // Calculate context match
    const contextWords = context.split(/\s+/).filter((w) => w.length > 3);
    const contextMatches = contextWords.filter((word) =>
      summary.includes(word)
    ).length;
    const contextScore =
      contextWords.length > 0 ? contextMatches / contextWords.length : 0;

    // Calculate intent alignment contribution
    const intentScore = consolidationResult.intentAlignment || 0;

    // Combine scores with appropriate weights
    return (
      (descScore * 0.5 + contextScore * 0.2 + intentScore * 0.3) *
      activeIntention.strength
    );
  }

  /**
   * Generates recommendations for improving alignment
   *
   * @param consolidationResult The consolidation result
   * @param purposeAlignments Purpose alignment results
   * @param intentionAlignments Intention alignment results
   * @param overallScore Overall alignment score
   * @returns Array of recommendations
   */
  private async generateRecommendations(
    consolidationResult: CODESIGConsolidationResult,
    purposeAlignments: {
      purposeStatementId: string;
      score: number;
      alignedAspects: string[];
      misalignedAspects: string[];
    }[],
    intentionAlignments: {
      intentionId: string;
      score: number;
      influence: number;
    }[],
    overallScore: number
  ): Promise<string[]> {
    const recommendations: string[] = [];

    // Check if overall alignment is below threshold
    if (overallScore < this.config.minAlignmentThreshold) {
      recommendations.push(
        'Overall alignment is below threshold and requires attention'
      );
    }

    // Identify low-scoring purpose alignments
    const lowPurposeAlignments = purposeAlignments
      .filter((pa) => pa.score < 0.5)
      .map((pa) => this.purposeStatements.get(pa.purposeStatementId)!)
      .sort((a, b) => b.priority - a.priority);

    if (lowPurposeAlignments.length > 0) {
      for (const ps of lowPurposeAlignments.slice(0, 3)) {
        recommendations.push(`Improve alignment with purpose: ${ps.title}`);
      }
    }

    // Identify low-scoring intention alignments
    const lowIntentionAlignments = intentionAlignments
      .filter((ia) => ia.score < 0.5)
      .map((ia) => this.activeIntentions.get(ia.intentionId)!)
      .sort((a, b) => b.strength - a.strength);

    if (lowIntentionAlignments.length > 0) {
      for (const ai of lowIntentionAlignments.slice(0, 3)) {
        recommendations.push(
          `Address misalignment with active intention: ${ai.description}`
        );
      }
    }

    // Add general recommendations based on alignment score
    if (overallScore < 0.3) {
      recommendations.push(
        'Consider revising the consolidation approach to better align with system purpose'
      );
      recommendations.push(
        'Review active intentions for relevance to current operations'
      );
    } else if (overallScore < 0.7) {
      recommendations.push(
        'Enhance emotional resonance to strengthen purpose alignment'
      );
      recommendations.push(
        'Clarify intent metadata to better reflect system purpose'
      );
    }

    return recommendations;
  }

  /**
   * Automatically adjusts intentions based on alignment analysis
   *
   * @param analysis The alignment analysis
   * @param consolidationResult The consolidation result
   */
  private async autoAdjustIntentions(
    analysis: AlignmentAnalysis,
    consolidationResult: CODESIGConsolidationResult
  ): Promise<void> {
    // Only adjust intentions if overall alignment is below threshold
    if (analysis.alignmentScore >= this.config.minAlignmentThreshold) {
      return;
    }

    // Identify low-scoring intention alignments
    const lowIntentionAlignments = analysis.intentionAlignments
      .filter((ia) => ia.score < 0.5)
      .sort((a, b) => a.score - b.score);

    // Adjust the strength of low-scoring intentions
    for (const ia of lowIntentionAlignments) {
      const intention = this.activeIntentions.get(ia.intentionId);
      if (intention) {
        // Reduce the strength of the intention
        const newStrength = Math.max(0.1, intention.strength * 0.8);
        await this.updateActiveIntention(intention.id, {
          strength: newStrength,
        });
      }
    }

    // Record the adjustment in the Codalogue
    if (lowIntentionAlignments.length > 0) {
      await this.codalogueProtocolLedger.recordSystemReflection({
        reflectionType: 'INTENTIONS_AUTO_ADJUSTED',
        content: `Auto-adjusted ${lowIntentionAlignments.length} intentions based on alignment analysis`,
        metadata: {
          analysisId: analysis.id,
          consolidationResultId: consolidationResult.codalogueEntryId,
          adjustedIntentionIds: lowIntentionAlignments.map(
            (ia) => ia.intentionId
          ),
          timestamp: new Date(),
        },
      });
    }
  }

  /**
   * Gets all purpose statements
   *
   * @param scope Optional scope filter
   * @param soulFrameId Optional SoulFrame ID filter
   * @returns All purpose statements matching the filters
   */
  getAllPurposeStatements(
    scope?: 'system' | 'soulframe',
    soulFrameId?: string
  ): PurposeStatement[] {
    let statements = Array.from(this.purposeStatements.values());

    if (scope) {
      statements = statements.filter((ps) => ps.scope === scope);
    }

    if (soulFrameId) {
      statements = statements.filter((ps) => ps.soulFrameId === soulFrameId);
    }

    return statements.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Gets a specific purpose statement
   *
   * @param purposeStatementId ID of the purpose statement to get
   * @returns The purpose statement, or undefined if not found
   */
  getPurposeStatement(
    purposeStatementId: string
  ): PurposeStatement | undefined {
    return this.purposeStatements.get(purposeStatementId);
  }

  /**
   * Gets all active intentions
   *
   * @param activeOnly Whether to only include active intentions
   * @param soulFrameId Optional SoulFrame ID filter
   * @returns All active intentions matching the filters
   */
  getAllActiveIntentions(
    activeOnly: boolean = true,
    soulFrameId?: string
  ): ActiveIntention[] {
    let intentions = Array.from(this.activeIntentions.values());

    if (activeOnly) {
      intentions = intentions.filter(
        (ai) => ai.isActive && (!ai.expiresAt || ai.expiresAt > new Date())
      );
    }

    if (soulFrameId) {
      intentions = intentions.filter((ai) => ai.soulFrameId === soulFrameId);
    }

    return intentions.sort((a, b) => b.strength - a.strength);
  }

  /**
   * Gets a specific active intention
   *
   * @param intentionId ID of the intention to get
   * @returns The active intention, or undefined if not found
   */
  getActiveIntention(intentionId: string): ActiveIntention | undefined {
    return this.activeIntentions.get(intentionId);
  }
}

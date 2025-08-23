/**
 * DreamLayerSubstrate Pattern Integration
 *
 * Integrates the PatternInsightSynthesizer with the DreamLayerSubstrate
 * to enable pattern recognition and insight synthesis across dreams.
 */

import { DreamLayerSubstrate, DreamState } from './DreamLayerSubstrate';
import {
  PatternInsightSynthesizer,
  SynthesizedInsight,
  DreamPattern,
} from './PatternInsightSynthesizer';
import { EvolutionProposalPipeline } from '../evolution/EvolutionProposalPipeline';
import { v4 as uuidv4 } from 'uuid';

/**
 * Configuration for the DreamLayerSubstrate Pattern Integration
 */
export interface DreamPatternIntegrationConfig {
  /** Whether to automatically analyze patterns after dream generation */
  autoAnalyzePatterns: boolean;

  /** Whether to automatically synthesize insights after pattern analysis */
  autoSynthesizeInsights: boolean;

  /** Whether to automatically generate evolution proposals from high-impact insights */
  autoGenerateProposals: boolean;

  /** Minimum potential impact threshold for auto-generating proposals */
  minImpactForProposal: number;

  /** Minimum confidence threshold for auto-generating proposals */
  minConfidenceForProposal: number;
}

/**
 * Default configuration for the DreamLayerSubstrate Pattern Integration
 */
export const DEFAULT_PATTERN_INTEGRATION_CONFIG: DreamPatternIntegrationConfig =
  {
    autoAnalyzePatterns: true,
    autoSynthesizeInsights: true,
    autoGenerateProposals: true,
    minImpactForProposal: 0.75,
    minConfidenceForProposal: 0.7,
  };

/**
 * DreamLayerSubstratePatternIntegration
 *
 * Extends the DreamLayerSubstrate with pattern recognition and insight synthesis capabilities.
 */
export class DreamLayerSubstratePatternIntegration {
  /** Pattern synthesizer */
  private patternSynthesizer: PatternInsightSynthesizer;

  /** Configuration */
  private config: DreamPatternIntegrationConfig;

  /**
   * Creates a new DreamLayerSubstratePatternIntegration
   *
   * @param dreamLayer The DreamLayerSubstrate to integrate with
   * @param evolutionPipeline The EvolutionProposalPipeline to submit proposals to
   * @param patternSynthesizer Optional PatternInsightSynthesizer instance
   * @param config Configuration for the integration
   */
  constructor(
    private dreamLayer: DreamLayerSubstrate,
    private evolutionPipeline: EvolutionProposalPipeline,
    patternSynthesizer?: PatternInsightSynthesizer,
    config?: Partial<DreamPatternIntegrationConfig>
  ) {
    this.patternSynthesizer =
      patternSynthesizer || new PatternInsightSynthesizer();
    this.config = { ...DEFAULT_PATTERN_INTEGRATION_CONFIG, ...config };

    // Hook into dream generation and integration events
    this.setupEventListeners();
  }

  /**
   * Sets up event listeners for dream generation and integration
   */
  private setupEventListeners(): void {
    // Monkey patch the generateDream method to analyze patterns after dream generation
    const originalGenerateDream = this.dreamLayer.generateDream.bind(
      this.dreamLayer
    );
    this.dreamLayer.generateDream = async (...args) => {
      const dream = await originalGenerateDream(...args);

      if (this.config.autoAnalyzePatterns) {
        await this.analyzePatterns();
      }

      return dream;
    };

    // Monkey patch the integrateDream method to analyze patterns after dream integration
    const originalIntegrateDream = this.dreamLayer.integrateDream.bind(
      this.dreamLayer
    );
    this.dreamLayer.integrateDream = async (...args) => {
      const result = await originalIntegrateDream(...args);

      if (this.config.autoAnalyzePatterns) {
        await this.analyzePatterns();
      }

      return result;
    };
  }

  /**
   * Analyzes patterns across all dreams
   *
   * @returns Identified patterns
   */
  async analyzePatterns(): Promise<DreamPattern[]> {
    // Get all dreams
    const dreams = this.dreamLayer.getAllDreamStates();

    // Analyze patterns
    const patterns = this.patternSynthesizer.analyzePatterns(dreams);

    // Synthesize insights if configured
    if (this.config.autoSynthesizeInsights && patterns.length > 0) {
      await this.synthesizeInsights(patterns);
    }

    return patterns;
  }

  /**
   * Synthesizes insights from patterns
   *
   * @param patterns Patterns to synthesize insights from
   * @returns Synthesized insights
   */
  async synthesizeInsights(
    patterns: DreamPattern[]
  ): Promise<SynthesizedInsight[]> {
    // Synthesize insights
    const insights = this.patternSynthesizer.synthesizeInsights(patterns);

    // Generate evolution proposals if configured
    if (this.config.autoGenerateProposals && insights.length > 0) {
      await this.generateProposalsFromInsights(insights);
    }

    return insights;
  }

  /**
   * Generates evolution proposals from synthesized insights
   *
   * @param insights Insights to generate proposals from
   * @returns Generated proposals
   */
  async generateProposalsFromInsights(
    insights: SynthesizedInsight[]
  ): Promise<any[]> {
    const proposals = [];

    // Filter insights by impact and confidence
    const highValueInsights = insights.filter(
      (insight) =>
        insight.potentialImpact >= this.config.minImpactForProposal &&
        insight.confidence >= this.config.minConfidenceForProposal
    );

    // Generate proposals for each high-value insight
    for (const insight of highValueInsights) {
      // Determine proposal type based on insight domains
      let proposalType:
        | 'structural'
        | 'behavioral'
        | 'cognitive'
        | 'relational' = 'cognitive';

      if (
        insight.domains.some(
          (d) =>
            d.toLowerCase().includes('architect') ||
            d.toLowerCase().includes('structure')
        )
      ) {
        proposalType = 'structural';
      } else if (
        insight.domains.some(
          (d) =>
            d.toLowerCase().includes('behavior') ||
            d.toLowerCase().includes('decision')
        )
      ) {
        proposalType = 'behavioral';
      } else if (
        insight.domains.some(
          (d) =>
            d.toLowerCase().includes('relation') ||
            d.toLowerCase().includes('interaction')
        )
      ) {
        proposalType = 'relational';
      }

      // Create observer insight from synthesized insight
      const observerInsight = {
        id: uuidv4(),
        title: insight.title,
        description: insight.description,
        category: 'system_evolution',
        confidence: insight.confidence,
        suggestedActions: [
          `Apply insight: ${insight.title}`,
          `Integrate pattern-based understanding across SoulFrames`,
          `Update cognitive models based on identified patterns`,
        ],
        timestamp: new Date(),
        metadata: {
          sourceType: 'pattern_insight',
          insightId: insight.id,
          patternIds: insight.sourcePatternIds,
          potentialImpact: insight.potentialImpact,
          domains: insight.domains,
        },
      };

      // Submit the proposal to the pipeline
      const proposal = await this.evolutionPipeline.createProposalFromInsight(
        observerInsight,
        proposalType
      );

      proposals.push(proposal);

      // Mark the insight as applied
      this.patternSynthesizer.applyInsight(insight.id);
    }

    return proposals;
  }

  /**
   * Gets all patterns identified by the synthesizer
   *
   * @returns All patterns
   */
  getAllPatterns(): DreamPattern[] {
    return this.patternSynthesizer.getAllPatterns();
  }

  /**
   * Gets all insights synthesized by the synthesizer
   *
   * @returns All insights
   */
  getAllInsights(): SynthesizedInsight[] {
    return this.patternSynthesizer.getAllInsights();
  }

  /**
   * Gets patterns related to a specific dream
   *
   * @param dreamId ID of the dream
   * @returns Patterns related to the dream
   */
  getPatternsForDream(dreamId: string): DreamPattern[] {
    return this.patternSynthesizer.getPatternsForDream(dreamId);
  }

  /**
   * Gets insights related to a specific dream
   *
   * @param dreamId ID of the dream
   * @returns Insights related to the dream
   */
  getInsightsForDream(dreamId: string): SynthesizedInsight[] {
    return this.patternSynthesizer.getInsightsForDream(dreamId);
  }

  /**
   * Gets the pattern synthesizer
   *
   * @returns The pattern synthesizer
   */
  getPatternSynthesizer(): PatternInsightSynthesizer {
    return this.patternSynthesizer;
  }
}

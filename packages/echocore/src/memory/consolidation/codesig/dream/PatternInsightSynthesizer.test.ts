/**
 * Tests for PatternInsightSynthesizer
 */

import {
  PatternInsightSynthesizer,
  PatternType,
  DreamPattern,
  SynthesizedInsight,
} from './PatternInsightSynthesizer';
import { DreamState, DreamStateType } from './DreamLayerSubstrate';

describe('PatternInsightSynthesizer', () => {
  // Mock dream states for testing
  const mockDreams: DreamState[] = [
    {
      id: 'dream1',
      type: DreamStateType.ABSTRACT_PATTERN,
      title: 'Pattern Recognition in Neural Networks',
      narrative:
        'Exploring how neural networks identify and learn patterns from data.',
      insights: [
        'Pattern recognition is fundamental to learning',
        'Hierarchical pattern structures improve recognition',
        'Feedback loops enhance pattern learning',
      ],
      emotionalResonance: 0.75,
      intentAlignment: 0.8,
      sourceSoulFrameIds: ['frame1', 'frame2'],
      relatedSoulFrameIds: ['frame3'],
      integrationStatus: 'PENDING',
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date('2023-01-01'),
    },
    {
      id: 'dream2',
      type: DreamStateType.FUTURE_PROJECTION,
      title: 'Advanced Pattern Recognition Systems',
      narrative:
        'Projecting future developments in pattern recognition technologies.',
      insights: [
        'Pattern recognition will become more contextual',
        'Hierarchical pattern structures improve recognition',
        'Multi-modal pattern recognition will dominate',
      ],
      emotionalResonance: 0.8,
      intentAlignment: 0.85,
      sourceSoulFrameIds: ['frame2', 'frame4'],
      relatedSoulFrameIds: ['frame5'],
      integrationStatus: 'PENDING',
      createdAt: new Date('2023-01-02'),
      updatedAt: new Date('2023-01-02'),
    },
    {
      id: 'dream3',
      type: DreamStateType.COUNTERFACTUAL,
      title: 'Alternative Pattern Recognition Approaches',
      narrative:
        'Exploring alternative approaches to pattern recognition that might have developed.',
      insights: [
        'Non-hierarchical pattern recognition could be viable',
        'Pattern recognition without feedback is limited',
        'Biological pattern recognition differs from computational',
      ],
      emotionalResonance: 0.7,
      intentAlignment: 0.75,
      sourceSoulFrameIds: ['frame1', 'frame6'],
      relatedSoulFrameIds: ['frame7'],
      integrationStatus: 'PENDING',
      createdAt: new Date('2023-01-03'),
      updatedAt: new Date('2023-01-03'),
    },
    {
      id: 'dream4',
      type: DreamStateType.PERSPECTIVE_SHIFT,
      title: 'Pattern Recognition from Data Perspective',
      narrative:
        'Viewing pattern recognition from the perspective of the data being processed.',
      insights: [
        'Pattern recognition is fundamental to learning',
        'Data structure influences pattern recognition',
        'Pattern ambiguity challenges recognition systems',
      ],
      emotionalResonance: 0.85,
      intentAlignment: 0.8,
      sourceSoulFrameIds: ['frame8', 'frame9'],
      relatedSoulFrameIds: ['frame10'],
      integrationStatus: 'PENDING',
      createdAt: new Date('2023-01-04'),
      updatedAt: new Date('2023-01-04'),
    },
    {
      id: 'dream5',
      type: DreamStateType.CONCEPTUAL_BLEND,
      title: 'Pattern Recognition and Creativity',
      narrative:
        'Blending concepts of pattern recognition and creative processes.',
      insights: [
        'Pattern breaking is as important as pattern recognition',
        'Creative systems need both pattern recognition and generation',
        'Pattern recognition underlies creative intuition',
      ],
      emotionalResonance: 0.9,
      intentAlignment: 0.85,
      sourceSoulFrameIds: ['frame11', 'frame12'],
      relatedSoulFrameIds: ['frame13'],
      integrationStatus: 'PENDING',
      createdAt: new Date('2023-01-05'),
      updatedAt: new Date('2023-01-05'),
    },
  ];

  describe('Pattern Analysis', () => {
    let synthesizer: PatternInsightSynthesizer;

    beforeEach(() => {
      synthesizer = new PatternInsightSynthesizer({
        minDreamsForPattern: 2, // Lower threshold for testing
        minPatternsForInsight: 1, // Lower threshold for testing
      });
    });

    test('should identify recurring themes across dreams', () => {
      const patterns = synthesizer.analyzePatterns(mockDreams);

      // Expect at least one recurring theme pattern
      const themePatterns = patterns.filter(
        (p) => p.type === PatternType.RECURRING_THEME
      );
      expect(themePatterns.length).toBeGreaterThan(0);

      // Check that the pattern includes the recurring insight about pattern recognition
      const patternRecognitionPattern = themePatterns.find((p) =>
        p.description
          .toLowerCase()
          .includes('pattern recognition is fundamental')
      );
      expect(patternRecognitionPattern).toBeDefined();
      expect(patternRecognitionPattern?.relatedDreamIds).toContain('dream1');
      expect(patternRecognitionPattern?.relatedDreamIds).toContain('dream4');
    });

    test('should identify emotional signatures across dreams', () => {
      const patterns = synthesizer.analyzePatterns(mockDreams);

      // Expect at least one emotional signature pattern
      const emotionalPatterns = patterns.filter(
        (p) => p.type === PatternType.EMOTIONAL_SIGNATURE
      );
      expect(emotionalPatterns.length).toBeGreaterThan(0);

      // Check that high emotional resonance dreams are included
      const highResonancePattern = emotionalPatterns.find((p) =>
        p.name.toLowerCase().includes('high emotional')
      );
      expect(highResonancePattern).toBeDefined();
      expect(highResonancePattern?.relatedDreamIds).toContain('dream5'); // Highest resonance
    });

    test('should identify temporal sequences across dreams', () => {
      const patterns = synthesizer.analyzePatterns(mockDreams);

      // Expect at least one temporal sequence pattern
      const temporalPatterns = patterns.filter(
        (p) => p.type === PatternType.TEMPORAL_SEQUENCE
      );
      expect(temporalPatterns.length).toBeGreaterThan(0);

      // Check that the pattern includes all dreams in chronological order
      const evolutionPattern = temporalPatterns.find((p) =>
        p.name.toLowerCase().includes('evolution')
      );
      expect(evolutionPattern).toBeDefined();
      expect(evolutionPattern?.relatedDreamIds.length).toBe(mockDreams.length);
    });

    test('should identify causal relationships between future projections and counterfactuals', () => {
      const patterns = synthesizer.analyzePatterns(mockDreams);

      // Expect at least one causal relationship pattern
      const causalPatterns = patterns.filter(
        (p) => p.type === PatternType.CAUSAL_RELATIONSHIP
      );
      expect(causalPatterns.length).toBeGreaterThan(0);

      // Check that the pattern includes both future projection and counterfactual dreams
      const futureCounterfactualPattern = causalPatterns.find((p) =>
        p.name.toLowerCase().includes('future-counterfactual')
      );
      expect(futureCounterfactualPattern).toBeDefined();
      expect(futureCounterfactualPattern?.relatedDreamIds).toContain('dream2'); // Future projection
      expect(futureCounterfactualPattern?.relatedDreamIds).toContain('dream3'); // Counterfactual
    });
  });

  describe('Insight Synthesis', () => {
    let synthesizer: PatternInsightSynthesizer;
    let patterns: DreamPattern[];

    beforeEach(() => {
      synthesizer = new PatternInsightSynthesizer({
        minDreamsForPattern: 2, // Lower threshold for testing
        minPatternsForInsight: 1, // Lower threshold for testing
        autoApplyInsights: true,
        autoApplyThreshold: 0.8,
      });
      patterns = synthesizer.analyzePatterns(mockDreams);
    });

    test('should synthesize insights from patterns', () => {
      const insights = synthesizer.synthesizeInsights(patterns);

      // Expect at least one insight
      expect(insights.length).toBeGreaterThan(0);

      // Check insight properties
      const insight = insights[0];
      expect(insight.id).toBeDefined();
      expect(insight.title).toBeDefined();
      expect(insight.description).toBeDefined();
      expect(insight.sourcePatternIds).toContain(patterns[0].id);
      expect(insight.confidence).toBeGreaterThan(0);
      expect(insight.potentialImpact).toBeGreaterThan(0);
      expect(insight.domains.length).toBeGreaterThan(0);
      expect(insight.synthesizedAt).toBeInstanceOf(Date);
    });

    test('should auto-apply high-confidence insights', () => {
      // Create a pattern with high confidence
      const highConfidencePattern: DreamPattern = {
        id: 'high-confidence-pattern',
        type: PatternType.RECURRING_THEME,
        name: 'High Confidence Pattern',
        description: 'A pattern with high confidence for testing auto-apply',
        relatedDreamIds: ['dream1', 'dream2', 'dream3'],
        confidence: 0.95, // High confidence
        significance: 0.9,
        identifiedAt: new Date(),
      };

      // Synthesize insights from this pattern
      const insights = synthesizer.synthesizeInsights([highConfidencePattern]);

      // Expect the insight to be auto-applied
      expect(insights.length).toBe(1);
      expect(insights[0].isApplied).toBe(true);
      expect(insights[0].appliedAt).toBeDefined();
    });

    test('should not auto-apply low-confidence insights', () => {
      // Create a pattern with low confidence
      const lowConfidencePattern: DreamPattern = {
        id: 'low-confidence-pattern',
        type: PatternType.RECURRING_THEME,
        name: 'Low Confidence Pattern',
        description: 'A pattern with low confidence for testing auto-apply',
        relatedDreamIds: ['dream1', 'dream2'],
        confidence: 0.6, // Low confidence
        significance: 0.7,
        identifiedAt: new Date(),
      };

      // Synthesize insights from this pattern
      const insights = synthesizer.synthesizeInsights([lowConfidencePattern]);

      // Expect the insight to not be auto-applied
      expect(insights.length).toBe(1);
      expect(insights[0].isApplied).toBe(false);
      expect(insights[0].appliedAt).toBeUndefined();
    });
  });

  describe('Pattern and Insight Retrieval', () => {
    let synthesizer: PatternInsightSynthesizer;
    let patterns: DreamPattern[];
    let insights: SynthesizedInsight[];

    beforeEach(() => {
      synthesizer = new PatternInsightSynthesizer();
      patterns = synthesizer.analyzePatterns(mockDreams);
      insights = synthesizer.synthesizeInsights(patterns);
    });

    test('should retrieve all patterns', () => {
      const allPatterns = synthesizer.getAllPatterns();
      expect(allPatterns.length).toBe(patterns.length);
    });

    test('should retrieve all insights', () => {
      const allInsights = synthesizer.getAllInsights();
      expect(allInsights.length).toBe(insights.length);
    });

    test('should retrieve patterns for a specific dream', () => {
      const dream1Patterns = synthesizer.getPatternsForDream('dream1');
      expect(dream1Patterns.length).toBeGreaterThan(0);
      expect(
        dream1Patterns.every((p) => p.relatedDreamIds.includes('dream1'))
      ).toBe(true);
    });

    test('should retrieve insights for a specific dream', () => {
      // First, ensure we have insights that relate to dream1
      const dream1Patterns = synthesizer.getPatternsForDream('dream1');
      expect(dream1Patterns.length).toBeGreaterThan(0);

      // Now check if we can retrieve insights for dream1
      const dream1Insights = synthesizer.getInsightsForDream('dream1');
      expect(dream1Insights.length).toBeGreaterThan(0);
    });

    test('should retrieve insights for a specific pattern', () => {
      // Get the first pattern
      const pattern = patterns[0];

      // Get insights for this pattern
      const patternInsights = synthesizer.getInsightsForPattern(pattern.id);

      // Expect at least one insight that includes this pattern
      expect(patternInsights.length).toBeGreaterThan(0);
      expect(
        patternInsights.every((i) => i.sourcePatternIds.includes(pattern.id))
      ).toBe(true);
    });

    test('should apply an insight', () => {
      // Get the first insight
      const insight = insights[0];

      // Apply the insight
      const appliedInsight = synthesizer.applyInsight(insight.id);

      // Expect the insight to be applied
      expect(appliedInsight).toBeDefined();
      expect(appliedInsight?.isApplied).toBe(true);
      expect(appliedInsight?.appliedAt).toBeDefined();

      // Verify that the insight is also applied in the stored insights
      const storedInsight = synthesizer.getInsight(insight.id);
      expect(storedInsight?.isApplied).toBe(true);
    });
  });
});

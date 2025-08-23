/**
 * Tests for DreamLayerSubstratePatternIntegration
 */

import { DreamLayerSubstratePatternIntegration } from './DreamLayerSubstratePatternIntegration';
import { DreamLayerSubstrate, DreamState, DreamStateType } from './DreamLayerSubstrate';
import { PatternInsightSynthesizer, DreamPattern, SynthesizedInsight } from './PatternInsightSynthesizer';
import { EvolutionProposalPipeline } from '../evolution/EvolutionProposalPipeline';

// Mock dependencies
jest.mock('./DreamLayerSubstrate');
jest.mock('./PatternInsightSynthesizer');
jest.mock('../evolution/EvolutionProposalPipeline');

describe('DreamLayerSubstratePatternIntegration', () => {
  // Mock instances
  let mockDreamLayer: jest.Mocked<DreamLayerSubstrate>;
  let mockPatternSynthesizer: jest.Mocked<PatternInsightSynthesizer>;
  let mockEvolutionPipeline: jest.Mocked<EvolutionProposalPipeline>;
  let integration: DreamLayerSubstratePatternIntegration;
  
  // Mock dream states
  const mockDreams: DreamState[] = [
    {
      id: 'dream1',
      type: DreamStateType.ABSTRACT_PATTERN,
      title: 'Pattern Recognition',
      narrative: 'A dream about pattern recognition',
      insights: ['Patterns are important', 'Recognition requires context'],
      emotionalResonance: 0.8,
      intentAlignment: 0.7,
      sourceSoulFrameId: 'soul1',
      relatedSoulFrameIds: ['soul2'],
      sourceConsolidationIds: ['cons1'],
      isIntegrated: false,
      createdAt: new Date()
    },
    {
      id: 'dream2',
      type: DreamStateType.FUTURE_PROJECTION,
      title: 'Future Patterns',
      narrative: 'A dream about future patterns',
      insights: ['Future patterns will be more complex', 'Adaptation is key'],
      emotionalResonance: 0.7,
      intentAlignment: 0.8,
      sourceSoulFrameId: 'soul2',
      relatedSoulFrameIds: ['soul1'],
      sourceConsolidationIds: ['cons2'],
      isIntegrated: false,
      createdAt: new Date()
    }
  ];
  
  // Mock patterns
  const mockPatterns: DreamPattern[] = [
    {
      id: 'patter
      name: 'Pattern Importance',
      description: 'Recurring theme of pattern importance',
      relatedDreamIds: ['dream1', 'dream2'],
      confidence: 0.8,
      significance: 0.7,
      identifiedAt: new Date()
    }
  ];
  
  // Mock insights
  const mockInsights: SynthesizedInsight[] = [
    {
      id: 'insight1',
      title: 'Pattern Recognition Insight',
      description: 'Insight about pattern recognition',
      sourcePatternIds: ['pattern1'],
      relatedDreamIds: ['dream1', 'dream2'],
      confidence: 0.8,
      potentialImpact: 0.9,
      domains: ['Cognitive Structures', 'Pattern Recognition'],
      synthesizedAt: new Date(),
      isApplied: false
    }
  ];
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock instances
    mockDreamLayer = new DreamLayerSubstrate() as jest.Mocked<DreamLayerSubstrate>;
    mockPatternSynthesizer = new PatternInsightSynthesizer() as jest.Mocked<PatternInsightSynthesizer>;
    mockEvolutionPipeline = new EvolutionProposalPipeline() as jest.Mocked<EvolutionProposalPipeline>;
    
    // Setup mock implementations
    mockDreamLayer.getAllDreamStates.mockReturnValue(mockDreams);
    mockDreamLayer.generateDream.mockImplementation(async () => mockDreams[0]);
    mockDreamLayer.integrateDream.mockImplementation(async () => ({
      dream: mockDreams[0],
      integrationScore: 0.8,
      success: true,
      insights: ['Insight 1', 'Insight 2'],
      evolutionProposals: []
    }));
    
    mockPatternSynthesizer.analyzePatterns.mockReturnValue(mockPatterns);
    mockPatternSynthesizer.synthesizeInsights.mockReturnValue(mockInsights);
    mockPatternSynthesizer.getAllPatterns.mockReturnValue(mockPatterns);
    mockPatternSynthesizer.getAllInsights.mockReturnValue(mockInsights);
    mockPatternSynthesizer.getPatternsForDream.mockReturnValue(mockPatterns);
    mockPatternSynthesizer.getInsightsForDream.mockReturnValue(mockInsights);
    mockPatternSynthesizer.applyInsight.mockImplementation((id) => mockInsights.find(i => i.id === id));
    
    mockEvolutionPipeline.createProposalFromInsight.mockImplementation(async () => ({
      id: 'proposal1',
      sessionId: 'session1',
      type: 'cognitive',
      title: 'Test Proposal',
      description: 'A test proposal',
      rationale: 'Test rationale',
      proposedChanges: ['Change 1', 'Change 2'],
      expectedBenefits: ['Benefit 1'],
      potentialRisks: ['Risk 1'],
      proposedBy: 'test',
      affectedSoulFrameIds: ['soul1'],
      status: 'submitted'
    }));
    
    // Create integration instance
    integration = new DreamLayerSubstratePatternIntegration(
      mockDreamLayer,
      mockEvolutionPipeline,
      mockPatternSynthesizer
    );
  });
  
  describe('Pattern Analysis', () => {
    test('should analyze patterns across dreams', async () => {
      const patterns = await integration.analyzePatterns();
      
      expect(mockDreamLayer.getAllDreamStates).toHaveBeenCalled();
      expect(mockPatternSynthesizer.analyzePatterns).toHaveBeenCalledWith(mockDreams);
      expect(patterns).toEqual(mockPatterns);
    });
    
    test('should automatically analyze patterns after dream generation', async () => {
      // Call generateDream on the dream layer
      await mockDreamLayer.generateDream('soul1');
      
      // Verify that analyzePatterns was called
      expect(mockPatternSynthesizer.analyzePatterns).toHaveBeenCalled();
    });
    
    test('should automatically analyze patterns after dream integration', async () => {
      // Call integrateDream on the dream layer
      await mockDreamLayer.integrateDream('dream1');
      
      // Verify that analyzePatterns was called
      expect(mockPatternSynthesizer.analyzePatterns).toHaveBeenCalled();
    });
  });
  
  describe('Insight Synthesis', () => {
    test('should synthesize insights from patterns', async () => {
      const insights = await integration.synthesizeInsights(mockPatterns);
      
      expect(mockPatternSynthesizer.synthesizeInsights).toHaveBeenCalledWith(mockPatterns);
      expect(insights).toEqual(mockInsights);
    });
    
    test('should automatically synthesize insights after pattern analysis', async () => {
      await integration.analyzePatterns();
      
      expect(mockPatternSynthesizer.synthesizeInsights).toHaveBeenCalledWith(mockPatterns);
    });
  });
  
  describe('Evolution Proposal Generation', () => {
    test('should generate evolution proposals from high-impact insights', async () => {
      const proposals = await integration.generateProposalsFromInsights(mockInsights);
      
      expect(mockEvolutionPipeline.createProposalFromInsight).toHaveBeenCalled();
      expect(proposals.length).toBeGreaterThan(0);
    });
    
    test('should automatically generate proposals after insight synthesis', async () => {
      await integration.synthesizeInsights(mockPatterns);
      
      expect(mockEvolutionPipeline.createProposalFromInsight).toHaveBeenCalled();
    });
    
    test('should mark insights as applied after generating proposals', async () => {
      await integration.generateProposalsFromInsights(mockInsights);
      
      expect(mockPatternSynthesizer.applyInsight).toHaveBeenCalledWith(mockInsights[0].id);
    });
  });
  
  describe('Accessor Methods', () => {
    test('should get all patterns', () => {
      const patterns = integration.getAllPatterns();
      
      expect(mockPatternSynthesizer.getAllPatterns).toHaveBeenCalled();
      expect(patterns).toEqual(mockPatterns);
    });
    
    test('should get all insights', () => {
      const insights = integration.getAllInsights();
      
      expect(mockPatternSynthesizer.getAllInsights).toHaveBeenCalled();
      expect(insights).toEqual(mockInsights);
    });
    
    test('should get patterns for a specific dream', () => {
      const patterns = integration.getPatternsForDream('dream1');
      
      expect(mockPatternSynthesizer.getPatternsForDream).toHaveBeenCalledWith('dream1');
      expect(patterns).toEqual(mockPatterns);
    });
    
    test('should get insights for a specific dream', () => {
      const insights = integration.getInsightsForDream('dream1');
      
      expect(mockPatternSynthesizer.getInsightsForDream).toHaveBeenCalledWith('dream1');
      expect(insights).toEqual(mockInsights);
    });
    
    test('should get the pattern synthesizer', () => {
      const synthesizer = integration.getPatternSynthesizer();
      
      expect(synthesizer).toBe(mockPatternSynthesizer);
    });
  });
});
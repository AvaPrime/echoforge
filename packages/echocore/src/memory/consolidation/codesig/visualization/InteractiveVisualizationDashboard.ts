/**
 * InteractiveVisualizationDashboard.ts
 *
 * This file defines the interfaces and implementation for the CODESIG Phase 6
 * Interactive Visualization Dashboard, which provides real-time visibility into
 * the system's cognitive processes, emotional resonance, evolution proposals,
 * and purpose alignment.
 */

import { SoulFrame, SoulFrameId } from '../types/CODESIGTypes';
import { EvolutionProposal } from '../evolution/EvolutionProposalPipeline';
import { EmotionalResonanceData } from '../emotional/EmotionalResonanceIndex';
import {
  PurposeStatement,
  AlignmentAnalysis,
} from '../purpose/PurposeAlignmentEngine';
import { DreamState } from '../dream/DreamLayerSubstrate';
import { CodalogueEntry } from '../ledger/CodalogueProtocolLedger';

/**
 * Visualization data types that can be rendered in the dashboard
 */
export enum VisualizationDataType {
  SOUL_FRAME_NETWORK = 'soul_frame_network',
  EMOTIONAL_RESONANCE_HEATMAP = 'emotional_resonance_heatmap',
  EVOLUTION_PROPOSAL_FLOW = 'evolution_proposal_flow',
  PURPOSE_ALIGNMENT_TREE = 'purpose_alignment_tree',
  DREAM_STATE_CLOUD = 'dream_state_cloud',
  CODALOGUE_TIMELINE = 'codalogue_timeline',
  GOVERNANCE_DECISION_TREE = 'governance_decision_tree',
  META_LEARNING_GRAPH = 'meta_learning_graph',
}

/**
 * Configuration for a visualization component
 */
export interface VisualizationConfig {
  type: VisualizationDataType;
  title: string;
  description: string;
  refreshRate: number; // milliseconds
  dataFilters?: Record<string, any>;
  interactionEnabled: boolean;
  layout: {
    width: number;
    height: number;
    position: 'main' | 'sidebar' | 'floating';
    order?: number;
  };
}

/**
 * Dashboard layout configuration
 */
export interface DashboardLayout {
  theme: 'light' | 'dark' | 'system';
  panels: VisualizationConfig[];
  savedLayouts: Record<string, VisualizationConfig[]>;
  currentLayoutId: string;
}

/**
 * User interaction event with the visualization
 */
export interface VisualizationInteractionEvent {
  type:
    | 'click'
    | 'hover'
    | 'select'
    | 'filter'
    | 'drill_down'
    | 'expand'
    | 'collapse';
  target: {
    visualizationType: VisualizationDataType;
    elementId: string;
    elementType: string;
  };
  data: any;
  timestamp: Date;
}

/**
 * Simulation scenario for testing system responses
 */
export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  parameters: Record<string, any>;
  initialState: {
    soulFrames?: Partial<SoulFrame>[];
    emotionalResonance?: Partial<EmotionalResonanceData>;
    purposeStatements?: Partial<PurposeStatement>[];
    dreamStates?: Partial<DreamState>[];
  };
  events: Array<{
    timestamp: number; // milliseconds from start
    type: string;
    data: any;
  }>;
  expectedOutcomes: Record<string, any>;
}

/**
 * Data provider interface for visualization components
 */
export interface VisualizationDataProvider {
  getSoulFrameNetwork(): Promise<{
    nodes: Array<{ id: SoulFrameId; data: Partial<SoulFrame> }>;
    edges: Array<{
      source: SoulFrameId;
      target: SoulFrameId;
      type: string;
      weight: number;
    }>;
  }>;

  getEmotionalResonanceData(): Promise<{
    matrix: Array<Array<number>>; // NxN matrix of resonance values
    soulFrameIds: SoulFrameId[];
    metrics: Record<string, number>; // Overall metrics
  }>;

  getEvolutionProposals(): Promise<{
    active: EvolutionProposal[];
    historical: EvolutionProposal[];
    metrics: {
      proposalRate: number;
      acceptanceRate: number;
      implementationSuccessRate: number;
    };
  }>;

  getPurposeAlignmentData(): Promise<{
    statements: PurposeStatement[];
    hierarchy: Record<string, string[]>; // parent -> children
    alignmentScores: Record<string, number>;
    analyses: AlignmentAnalysis[];
  }>;

  getDreamStateData(): Promise<{
    recentDreams: DreamState[];
    dreamClusters: Array<{
      id: string;
      theme: string;
      dreamIds: string[];
      sentiment: number;
    }>;
    integrationMetrics: Record<string, number>;
  }>;

  getCodalogueTimeline(): Promise<{
    entries: CodalogueEntry[];
    patterns: Array<{
      id: string;
      description: string;
      relatedEntryIds: string[];
      confidence: number;
    }>;
  }>;

  getGovernanceDecisions(): Promise<{
    decisions: Array<{
      id: string;
      proposalId: string;
      outcome: 'approved' | 'rejected' | 'pending';
      votes: Record<string, boolean>;
      reasoning: string;
    }>;
    metrics: {
      approvalRate: number;
      humanInterventionRate: number;
      averageDeliberation: number; // time in ms
    };
  }>;

  getMetaLearningData(): Promise<{
    knowledgeGraph: {
      nodes: Array<{ id: string; type: string; data: any }>;
      edges: Array<{ source: string; target: string; type: string }>;
    };
    transferMetrics: Record<string, number>;
  }>;

  runSimulation(scenario: SimulationScenario): Promise<{
    results: Record<string, any>;
    metrics: Record<string, number>;
    timeline: Array<{ timestamp: number; state: Record<string, any> }>;
  }>;
}

/**
 * Interactive Visualization Dashboard main interface
 */
export interface InteractiveVisualizationDashboard {
  initialize(config?: Partial<DashboardLayout>): Promise<void>;
  shutdown(): Promise<void>;

  // Dashboard configuration
  getLayout(): DashboardLayout;
  updateLayout(layout: Partial<DashboardLayout>): Promise<void>;
  saveCurrentLayout(name: string): Promise<string>; // returns layout ID
  loadLayout(layoutId: string): Promise<void>;

  // Visualization management
  addVisualization(config: VisualizationConfig): Promise<string>; // returns panel ID
  removeVisualization(panelId: string): Promise<void>;
  updateVisualization(
    panelId: string,
    config: Partial<VisualizationConfig>
  ): Promise<void>;

  // Data access and refresh
  refreshData(visualizationType?: VisualizationDataType): Promise<void>;
  setRefreshInterval(
    visualizationType: VisualizationDataType,
    interval: number
  ): Promise<void>;

  // Interaction handling
  onInteraction(
    callback: (event: VisualizationInteractionEvent) => void
  ): () => void; // returns unsubscribe function
  drillDown(
    visualizationType: VisualizationDataType,
    elementId: string
  ): Promise<any>;
  filter(
    visualizationType: VisualizationDataType,
    filters: Record<string, any>
  ): Promise<void>;

  // Simulation capabilities
  createSimulation(scenario: Partial<SimulationScenario>): Promise<string>; // returns scenario ID
  runSimulation(scenarioId: string): Promise<any>;
  saveSimulationResults(simulationId: string, name: string): Promise<string>; // returns results ID
  compareSimulations(simulationIds: string[]): Promise<Record<string, any>>;

  // Export capabilities
  exportData(
    visualizationType: VisualizationDataType,
    format: 'json' | 'csv' | 'image'
  ): Promise<Blob>;
  generateReport(
    visualizationTypes: VisualizationDataType[],
    options?: Record<string, any>
  ): Promise<Blob>;

  // Human-in-the-loop integration
  requestHumanFeedback(
    proposalId: string,
    context: Record<string, any>
  ): Promise<{
    decision: 'approve' | 'reject' | 'modify';
    feedback: string;
    modifications?: Record<string, any>;
  }>;

  notifyHuman(
    level: 'info' | 'warning' | 'critical',
    message: string,
    context?: Record<string, any>
  ): Promise<void>;
}

/**
 * Implementation of the Interactive Visualization Dashboard
 */
export class InteractiveVisualizationDashboardImpl
  implements InteractiveVisualizationDashboard
{
  private dataProvider: VisualizationDataProvider;
  private currentLayout: DashboardLayout;
  private interactionListeners: Array<
    (event: VisualizationInteractionEvent) => void
  > = [];
  private refreshIntervals: Map<VisualizationDataType, NodeJS.Timeout> =
    new Map();
  private simulations: Map<string, SimulationScenario> = new Map();

  constructor(dataProvider: VisualizationDataProvider) {
    this.dataProvider = dataProvider;
    this.currentLayout = {
      theme: 'system',
      panels: [],
      savedLayouts: {},
      currentLayoutId: 'default',
    };
  }

  async initialize(config?: Partial<DashboardLayout>): Promise<void> {
    if (config) {
      this.currentLayout = {
        ...this.currentLayout,
        ...config,
        panels: config.panels || this.currentLayout.panels,
        savedLayouts: config.savedLayouts || this.currentLayout.savedLayouts,
      };
    }

    // Set up default visualizations if none exist
    if (this.currentLayout.panels.length === 0) {
      this.currentLayout.panels = [
        {
          type: VisualizationDataType.SOUL_FRAME_NETWORK,
          title: 'SoulFrame Network',
          description:
            'Visualization of SoulFrame connections and relationships',
          refreshRate: 5000,
          interactionEnabled: true,
          layout: { width: 2, height: 2, position: 'main', order: 1 },
        },
        {
          type: VisualizationDataType.EMOTIONAL_RESONANCE_HEATMAP,
          title: 'Emotional Resonance',
          description: 'Heatmap of emotional resonance between SoulFrames',
          refreshRate: 3000,
          interactionEnabled: true,
          layout: { width: 1, height: 1, position: 'sidebar', order: 1 },
        },
        {
          type: VisualizationDataType.EVOLUTION_PROPOSAL_FLOW,
          title: 'Evolution Pipeline',
          description: 'Flow of proposals through the evolution pipeline',
          refreshRate: 10000,
          interactionEnabled: true,
          layout: { width: 2, height: 1, position: 'main', order: 2 },
        },
        {
          type: VisualizationDataType.PURPOSE_ALIGNMENT_TREE,
          title: 'Purpose Alignment',
          description: 'Hierarchical view of purpose statements and alignment',
          refreshRate: 15000,
          interactionEnabled: true,
          layout: { width: 1, height: 2, position: 'sidebar', order: 2 },
        },
      ];
    }

    // Initialize refresh intervals
    for (const panel of this.currentLayout.panels) {
      this.setupRefreshInterval(panel.type, panel.refreshRate);
    }
  }

  async shutdown(): Promise<void> {
    // Clear all refresh intervals
    for (const interval of this.refreshIntervals.values()) {
      clearInterval(interval);
    }
    this.refreshIntervals.clear();
    this.interactionListeners = [];
  }

  getLayout(): DashboardLayout {
    return this.currentLayout;
  }

  async updateLayout(layout: Partial<DashboardLayout>): Promise<void> {
    this.currentLayout = {
      ...this.currentLayout,
      ...layout,
      panels: layout.panels || this.currentLayout.panels,
      savedLayouts: layout.savedLayouts || this.currentLayout.savedLayouts,
    };

    // Update refresh intervals if panels changed
    if (layout.panels) {
      // Clear existing intervals
      for (const interval of this.refreshIntervals.values()) {
        clearInterval(interval);
      }
      this.refreshIntervals.clear();

      // Set up new intervals
      for (const panel of this.currentLayout.panels) {
        this.setupRefreshInterval(panel.type, panel.refreshRate);
      }
    }
  }

  async saveCurrentLayout(name: string): Promise<string> {
    const layoutId = `layout_${Date.now()}`;
    this.currentLayout.savedLayouts[layoutId] = [...this.currentLayout.panels];
    this.currentLayout.currentLayoutId = layoutId;
    return layoutId;
  }

  async loadLayout(layoutId: string): Promise<void> {
    if (!this.currentLayout.savedLayouts[layoutId]) {
      throw new Error(`Layout with ID ${layoutId} not found`);
    }

    // Clear existing intervals
    for (const interval of this.refreshIntervals.values()) {
      clearInterval(interval);
    }
    this.refreshIntervals.clear();

    // Update layout and set up new intervals
    this.currentLayout.panels = [...this.currentLayout.savedLayouts[layoutId]];
    this.currentLayout.currentLayoutId = layoutId;

    for (const panel of this.currentLayout.panels) {
      this.setupRefreshInterval(panel.type, panel.refreshRate);
    }
  }

  async addVisualization(config: VisualizationConfig): Promise<string> {
    const panelId = `panel_${Date.now()}`;
    this.currentLayout.panels.push({
      ...config,
      layout: {
        ...config.layout,
        order: config.layout.order || this.currentLayout.panels.length + 1,
      },
    });

    this.setupRefreshInterval(config.type, config.refreshRate);
    return panelId;
  }

  async removeVisualization(panelId: string): Promise<void> {
    const index = this.currentLayout.panels.findIndex(
      (p, idx) => `panel_${idx}` === panelId
    );
    if (index === -1) {
      throw new Error(`Panel with ID ${panelId} not found`);
    }

    const panel = this.currentLayout.panels[index];
    this.currentLayout.panels.splice(index, 1);

    // Check if this was the last panel of this type
    const hasOtherPanelsOfSameType = this.currentLayout.panels.some(
      (p) => p.type === panel.type
    );
    if (!hasOtherPanelsOfSameType) {
      const interval = this.refreshIntervals.get(panel.type);
      if (interval) {
        clearInterval(interval);
        this.refreshIntervals.delete(panel.type);
      }
    }
  }

  async updateVisualization(
    panelId: string,
    config: Partial<VisualizationConfig>
  ): Promise<void> {
    const index = this.currentLayout.panels.findIndex(
      (p, idx) => `panel_${idx}` === panelId
    );
    if (index === -1) {
      throw new Error(`Panel with ID ${panelId} not found`);
    }

    const oldConfig = this.currentLayout.panels[index];
    const newConfig = {
      ...oldConfig,
      ...config,
      layout: config.layout
        ? { ...oldConfig.layout, ...config.layout }
        : oldConfig.layout,
    };

    this.currentLayout.panels[index] = newConfig;

    // Update refresh interval if rate changed
    if (config.refreshRate && config.refreshRate !== oldConfig.refreshRate) {
      this.setupRefreshInterval(oldConfig.type, config.refreshRate);
    }
  }

  async refreshData(visualizationType?: VisualizationDataType): Promise<void> {
    if (visualizationType) {
      // Refresh specific visualization type
      await this.fetchDataForType(visualizationType);
    } else {
      // Refresh all active visualization types
      const types = new Set(this.currentLayout.panels.map((p) => p.type));
      for (const type of types) {
        await this.fetchDataForType(type);
      }
    }
  }

  async setRefreshInterval(
    visualizationType: VisualizationDataType,
    interval: number
  ): Promise<void> {
    // Update all panels of this type
    for (const panel of this.currentLayout.panels) {
      if (panel.type === visualizationType) {
        panel.refreshRate = interval;
      }
    }

    this.setupRefreshInterval(visualizationType, interval);
  }

  onInteraction(
    callback: (event: VisualizationInteractionEvent) => void
  ): () => void {
    this.interactionListeners.push(callback);
    return () => {
      const index = this.interactionListeners.indexOf(callback);
      if (index !== -1) {
        this.interactionListeners.splice(index, 1);
      }
    };
  }

  async drillDown(
    visualizationType: VisualizationDataType,
    elementId: string
  ): Promise<any> {
    // Simulate interaction event
    const event: VisualizationInteractionEvent = {
      type: 'drill_down',
      target: {
        visualizationType,
        elementId,
        elementType: 'unknown', // Would be determined by actual implementation
      },
      data: null, // Would be populated by actual implementation
      timestamp: new Date(),
    };

    // Notify listeners
    this.notifyInteractionListeners(event);

    // Fetch detailed data based on visualization type
    switch (visualizationType) {
      case VisualizationDataType.SOUL_FRAME_NETWORK:
        // Get detailed data for a specific SoulFrame
        return {
          /* Detailed SoulFrame data */
        };

      case VisualizationDataType.EMOTIONAL_RESONANCE_HEATMAP:
        // Get detailed resonance data for a specific pair
        return {
          /* Detailed resonance data */
        };

      case VisualizationDataType.EVOLUTION_PROPOSAL_FLOW:
        // Get detailed proposal data
        return {
          /* Detailed proposal data */
        };

      case VisualizationDataType.PURPOSE_ALIGNMENT_TREE:
        // Get detailed purpose statement data
        return {
          /* Detailed purpose data */
        };

      case VisualizationDataType.DREAM_STATE_CLOUD:
        // Get detailed dream state data
        return {
          /* Detailed dream state data */
        };

      case VisualizationDataType.CODALOGUE_TIMELINE:
        // Get detailed codalogue entry data
        return {
          /* Detailed codalogue data */
        };

      case VisualizationDataType.GOVERNANCE_DECISION_TREE:
        // Get detailed governance decision data
        return {
          /* Detailed governance data */
        };

      case VisualizationDataType.META_LEARNING_GRAPH:
        // Get detailed meta-learning data
        return {
          /* Detailed meta-learning data */
        };

      default:
        throw new Error(`Unsupported visualization type: ${visualizationType}`);
    }
  }

  async filter(
    visualizationType: VisualizationDataType,
    filters: Record<string, any>
  ): Promise<void> {
    // Find all panels of this type and update their filters
    for (const panel of this.currentLayout.panels) {
      if (panel.type === visualizationType) {
        panel.dataFilters = { ...panel.dataFilters, ...filters };
      }
    }

    // Refresh data for this visualization type
    await this.refreshData(visualizationType);

    // Notify interaction listeners
    const event: VisualizationInteractionEvent = {
      type: 'filter',
      target: {
        visualizationType,
        elementId: 'filter',
        elementType: 'filter',
      },
      data: filters,
      timestamp: new Date(),
    };

    this.notifyInteractionListeners(event);
  }

  async createSimulation(
    scenario: Partial<SimulationScenario>
  ): Promise<string> {
    const id = `sim_${Date.now()}`;
    const fullScenario: SimulationScenario = {
      id,
      name: scenario.name || `Simulation ${id}`,
      description: scenario.description || '',
      parameters: scenario.parameters || {},
      initialState: scenario.initialState || {},
      events: scenario.events || [],
      expectedOutcomes: scenario.expectedOutcomes || {},
    };

    this.simulations.set(id, fullScenario);
    return id;
  }

  async runSimulation(scenarioId: string): Promise<any> {
    const scenario = this.simulations.get(scenarioId);
    if (!scenario) {
      throw new Error(`Simulation scenario with ID ${scenarioId} not found`);
    }

    return this.dataProvider.runSimulation(scenario);
  }

  async saveSimulationResults(
    simulationId: string,
    name: string
  ): Promise<string> {
    // In a real implementation, this would save the results to persistent storage
    const resultsId = `results_${Date.now()}`;
    return resultsId;
  }

  async compareSimulations(
    simulationIds: string[]
  ): Promise<Record<string, any>> {
    // In a real implementation, this would compare results from multiple simulations
    return {
      comparisonId: `comp_${Date.now()}`,
      metrics: {},
      differences: {},
      recommendations: [],
    };
  }

  async exportData(
    visualizationType: VisualizationDataType,
    format: 'json' | 'csv' | 'image'
  ): Promise<Blob> {
    // In a real implementation, this would export the data in the requested format
    const data = await this.fetchDataForType(visualizationType);

    // Convert data to requested format
    switch (format) {
      case 'json':
        return new Blob([JSON.stringify(data)], { type: 'application/json' });
      case 'csv':
        // Convert to CSV format
        return new Blob(['csv data'], { type: 'text/csv' });
      case 'image':
        // Generate image representation
        return new Blob(['image data'], { type: 'image/png' });
      default:
        throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async generateReport(
    visualizationTypes: VisualizationDataType[],
    options?: Record<string, any>
  ): Promise<Blob> {
    // In a real implementation, this would generate a comprehensive report
    const reportData = [];

    for (const type of visualizationTypes) {
      const data = await this.fetchDataForType(type);
      reportData.push({ type, data });
    }

    return new Blob([JSON.stringify(reportData)], { type: 'application/json' });
  }

  async requestHumanFeedback(
    proposalId: string,
    context: Record<string, any>
  ): Promise<{
    decision: 'approve' | 'reject' | 'modify';
    feedback: string;
    modifications?: Record<string, any>;
  }> {
    // In a real implementation, this would display a UI for human feedback
    // For now, we'll simulate a response
    return {
      decision: 'approve',
      feedback: 'Simulation of human feedback approval',
      modifications: {},
    };
  }

  async notifyHuman(
    level: 'info' | 'warning' | 'critical',
    message: string,
    context?: Record<string, any>
  ): Promise<void> {
    // In a real implementation, this would display a notification in the UI
    console.log(`[${level.toUpperCase()}] ${message}`, context);
  }

  // Private helper methods

  private setupRefreshInterval(
    type: VisualizationDataType,
    rate: number
  ): void {
    // Clear existing interval for this type if it exists
    const existingInterval = this.refreshIntervals.get(type);
    if (existingInterval) {
      clearInterval(existingInterval);
    }

    // Set up new interval
    const interval = setInterval(() => {
      this.fetchDataForType(type).catch((err) => {
        console.error(`Error refreshing data for ${type}:`, err);
      });
    }, rate);

    this.refreshIntervals.set(type, interval);
  }

  private async fetchDataForType(type: VisualizationDataType): Promise<any> {
    switch (type) {
      case VisualizationDataType.SOUL_FRAME_NETWORK:
        return this.dataProvider.getSoulFrameNetwork();

      case VisualizationDataType.EMOTIONAL_RESONANCE_HEATMAP:
        return this.dataProvider.getEmotionalResonanceData();

      case VisualizationDataType.EVOLUTION_PROPOSAL_FLOW:
        return this.dataProvider.getEvolutionProposals();

      case VisualizationDataType.PURPOSE_ALIGNMENT_TREE:
        return this.dataProvider.getPurposeAlignmentData();

      case VisualizationDataType.DREAM_STATE_CLOUD:
        return this.dataProvider.getDreamStateData();

      case VisualizationDataType.CODALOGUE_TIMELINE:
        return this.dataProvider.getCodalogueTimeline();

      case VisualizationDataType.GOVERNANCE_DECISION_TREE:
        return this.dataProvider.getGovernanceDecisions();

      case VisualizationDataType.META_LEARNING_GRAPH:
        return this.dataProvider.getMetaLearningData();

      default:
        throw new Error(`Unsupported visualization type: ${type}`);
    }
  }

  private notifyInteractionListeners(
    event: VisualizationInteractionEvent
  ): void {
    for (const listener of this.interactionListeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('Error in interaction listener:', err);
      }
    }
  }
}

/**
 * Factory function to create an Interactive Visualization Dashboard
 */
export function createVisualizationDashboard(
  dataProvider: VisualizationDataProvider,
  initialConfig?: Partial<DashboardLayout>
): InteractiveVisualizationDashboard {
  const dashboard = new InteractiveVisualizationDashboardImpl(dataProvider);
  dashboard.initialize(initialConfig);
  return dashboard;
}

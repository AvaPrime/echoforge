/**
 * Evolution Strategy Manager for the Recursive SoulWeaving Bootstrap
 *
 * This component manages and evolves the strategies used for system evolution.
 */

import { EvolutionStrategy } from './types';

/**
 * The EvolutionStrategyManager maintains a collection of evolution strategies
 * and handles their selection, evaluation, and improvement.
 */
export class EvolutionStrategyManager {
  private strategies: Map<string, EvolutionStrategy> = new Map();
  private activeStrategyId: string | null = null;
  private riskTolerance: number;

  /**
   * Creates a new EvolutionStrategyManager
   */
  constructor(riskTolerance: number = 0.3) {
    this.riskTolerance = riskTolerance;
    this.initializeDefaultStrategies();
  }

  /**
   * Initializes the default evolution strategies
   */
  private initializeDefaultStrategies(): void {
    // Create a balanced default strategy
    const balancedStrategy: EvolutionStrategy = {
      id: 'strategy-balanced',
      name: 'Balanced Evolution',
      description:
        'A balanced approach to system evolution with moderate risk and exploration',
      parameters: {
        explorationRate: 0.5,
        riskTolerance: this.riskTolerance,
        collaborationIntensity: 0.6,
        reflectionDepth: 5,
        improvementScope: 'component',
      },
      successMetrics: {
        totalEvolutions: 0,
        successfulEvolutions: 0,
        averageImprovementScore: 0,
        averageRiskRealized: 0,
      },
      lastModified: Date.now(),
      version: '1.0.0',
    };

    // Create a conservative strategy
    const conservativeStrategy: EvolutionStrategy = {
      id: 'strategy-conservative',
      name: 'Conservative Evolution',
      description: 'A cautious approach that prioritizes stability and safety',
      parameters: {
        explorationRate: 0.2,
        riskTolerance: Math.min(this.riskTolerance, 0.2),
        collaborationIntensity: 0.8,
        reflectionDepth: 8,
        improvementScope: 'local',
      },
      successMetrics: {
        totalEvolutions: 0,
        successfulEvolutions: 0,
        averageImprovementScore: 0,
        averageRiskRealized: 0,
      },
      lastModified: Date.now(),
      version: '1.0.0',
    };

    // Create an exploratory strategy
    const exploratoryStrategy: EvolutionStrategy = {
      id: 'strategy-exploratory',
      name: 'Exploratory Evolution',
      description:
        'An adventurous approach that prioritizes discovery and innovation',
      parameters: {
        explorationRate: 0.8,
        riskTolerance: Math.min(this.riskTolerance * 1.5, 0.8),
        collaborationIntensity: 0.4,
        reflectionDepth: 3,
        improvementScope: 'system',
      },
      successMetrics: {
        totalEvolutions: 0,
        successfulEvolutions: 0,
        averageImprovementScore: 0,
        averageRiskRealized: 0,
      },
      lastModified: Date.now(),
      version: '1.0.0',
    };

    // Add strategies to the collection
    this.strategies.set(balancedStrategy.id, balancedStrategy);
    this.strategies.set(conservativeStrategy.id, conservativeStrategy);
    this.strategies.set(exploratoryStrategy.id, exploratoryStrategy);

    // Set the balanced strategy as active by default
    this.activeStrategyId = balancedStrategy.id;
  }

  /**
   * Gets all available evolution strategies
   */
  public getAllStrategies(): EvolutionStrategy[] {
    return Array.from(this.strategies.values());
  }

  /**
   * Gets a specific strategy by ID
   */
  public getStrategy(id: string): EvolutionStrategy | null {
    return this.strategies.get(id) || null;
  }

  /**
   * Gets the currently active evolution strategy
   */
  public getActiveStrategy(): EvolutionStrategy | null {
    if (!this.activeStrategyId) return null;
    return this.strategies.get(this.activeStrategyId) || null;
  }

  /**
   * Sets the active evolution strategy
   */
  public setActiveStrategy(id: string): boolean {
    if (!this.strategies.has(id)) return false;
    this.activeStrategyId = id;
    return true;
  }

  /**
   * Creates a new evolution strategy
   */
  public createStrategy(
    strategy: Omit<EvolutionStrategy, 'id' | 'lastModified' | 'version'>
  ): EvolutionStrategy {
    const id = `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    const newStrategy: EvolutionStrategy = {
      ...strategy,
      id,
      lastModified: Date.now(),
      version: '1.0.0',
    };

    this.strategies.set(id, newStrategy);
    return newStrategy;
  }

  /**
   * Updates an existing evolution strategy
   */
  public updateStrategy(
    id: string,
    updates: Partial<EvolutionStrategy>
  ): EvolutionStrategy | null {
    const strategy = this.strategies.get(id);
    if (!strategy) return null;

    // Create a new version
    const versionParts = strategy.version.split('.');
    const newVersion = `${versionParts[0]}.${versionParts[1]}.${parseInt(versionParts[2]) + 1}`;

    const updatedStrategy: EvolutionStrategy = {
      ...strategy,
      ...updates,
      lastModified: Date.now(),
      version: newVersion,
    };

    this.strategies.set(id, updatedStrategy);
    return updatedStrategy;
  }

  /**
   * Records the outcome of an evolution attempt using a specific strategy
   */
  public recordEvolutionOutcome(
    strategyId: string,
    successful: boolean,
    improvementScore: number,
    riskRealized: number
  ): void {
    const strategy = this.strategies.get(strategyId);
    if (!strategy) return;

    // Update the strategy's success metrics
    const updatedMetrics = {
      totalEvolutions: strategy.successMetrics.totalEvolutions + 1,
      successfulEvolutions:
        strategy.successMetrics.successfulEvolutions + (successful ? 1 : 0),
      averageImprovementScore:
        (strategy.successMetrics.averageImprovementScore *
          strategy.successMetrics.totalEvolutions +
          improvementScore) /
        (strategy.successMetrics.totalEvolutions + 1),
      averageRiskRealized:
        (strategy.successMetrics.averageRiskRealized *
          strategy.successMetrics.totalEvolutions +
          riskRealized) /
        (strategy.successMetrics.totalEvolutions + 1),
    };

    // Update the strategy
    this.updateStrategy(strategyId, { successMetrics: updatedMetrics });
  }

  /**
   * Selects the most appropriate strategy for the current situation
   */
  public selectStrategyForSituation(
    situationRisk: number,
    explorationDesired: number,
    systemStability: number
  ): EvolutionStrategy {
    // Get all strategies
    const strategies = this.getAllStrategies();

    // Calculate a score for each strategy based on the situation
    const strategyScores = strategies.map((strategy) => {
      const riskMatch =
        1 - Math.abs(strategy.parameters.riskTolerance - situationRisk);
      const explorationMatch =
        1 - Math.abs(strategy.parameters.explorationRate - explorationDesired);

      // If system stability is low, prefer more conservative strategies
      const stabilityFactor =
        systemStability < 0.5
          ? 1 - strategy.parameters.riskTolerance // Lower risk is better when unstable
          : strategy.parameters.riskTolerance; // Higher risk is acceptable when stable

      // Calculate overall score
      const score =
        riskMatch * 0.4 + explorationMatch * 0.4 + stabilityFactor * 0.2;

      return { strategy, score };
    });

    // Sort by score and get the best strategy
    strategyScores.sort((a, b) => b.score - a.score);
    const bestStrategy = strategyScores[0].strategy;

    // Set this as the active strategy
    this.activeStrategyId = bestStrategy.id;

    return bestStrategy;
  }

  /**
   * Evolves the strategies themselves based on their performance
   */
  public evolveStrategies(): EvolutionStrategy[] {
    const strategies = this.getAllStrategies();
    const evolvedStrategies: EvolutionStrategy[] = [];

    // For each strategy with enough data, consider evolving it
    for (const strategy of strategies) {
      if (strategy.successMetrics.totalEvolutions < 5) continue; // Not enough data

      // Calculate success rate
      const successRate =
        strategy.successMetrics.successfulEvolutions /
        strategy.successMetrics.totalEvolutions;

      // If success rate is very low or very high, consider adjustments
      if (successRate < 0.3 || successRate > 0.9) {
        // Create an evolved version
        const evolvedStrategy = this.createEvolvedStrategy(
          strategy,
          successRate
        );
        evolvedStrategies.push(evolvedStrategy);
      }
    }

    return evolvedStrategies;
  }

  /**
   * Creates an evolved version of a strategy based on its performance
   */
  private createEvolvedStrategy(
    originalStrategy: EvolutionStrategy,
    successRate: number
  ): EvolutionStrategy {
    // Clone the original strategy
    const evolvedStrategy: EvolutionStrategy = JSON.parse(
      JSON.stringify(originalStrategy)
    );

    // Generate a new ID and version
    evolvedStrategy.id = `${originalStrategy.id}-evolved-${Date.now()}`;
    const versionParts = originalStrategy.version.split('.');
    evolvedStrategy.version = `${parseInt(versionParts[0])}.${parseInt(versionParts[1]) + 1}.0`;
    evolvedStrategy.lastModified = Date.now();

    // Update the name and description
    evolvedStrategy.name = `${originalStrategy.name} (Evolved)`;
    evolvedStrategy.description = `Evolved from ${originalStrategy.name} based on performance data`;

    // Adjust parameters based on success rate
    if (successRate < 0.3) {
      // Too many failures, reduce risk and exploration
      evolvedStrategy.parameters.riskTolerance = Math.max(
        0.1,
        originalStrategy.parameters.riskTolerance - 0.2
      );
      evolvedStrategy.parameters.explorationRate = Math.max(
        0.1,
        originalStrategy.parameters.explorationRate - 0.2
      );
      evolvedStrategy.parameters.reflectionDepth = Math.min(
        10,
        originalStrategy.parameters.reflectionDepth + 2
      );

      // Possibly reduce scope
      if (evolvedStrategy.parameters.improvementScope === 'system') {
        evolvedStrategy.parameters.improvementScope = 'component';
      } else if (evolvedStrategy.parameters.improvementScope === 'component') {
        evolvedStrategy.parameters.improvementScope = 'local';
      }
    } else if (successRate > 0.9) {
      // Very successful, can increase risk and exploration
      evolvedStrategy.parameters.riskTolerance = Math.min(
        0.9,
        originalStrategy.parameters.riskTolerance + 0.1
      );
      evolvedStrategy.parameters.explorationRate = Math.min(
        0.9,
        originalStrategy.parameters.explorationRate + 0.1
      );
      evolvedStrategy.parameters.reflectionDepth = Math.max(
        1,
        originalStrategy.parameters.reflectionDepth - 1
      );

      // Possibly increase scope
      if (evolvedStrategy.parameters.improvementScope === 'local') {
        evolvedStrategy.parameters.improvementScope = 'component';
      } else if (evolvedStrategy.parameters.improvementScope === 'component') {
        evolvedStrategy.parameters.improvementScope = 'system';
      }
    }

    // Reset success metrics for the new strategy
    evolvedStrategy.successMetrics = {
      totalEvolutions: 0,
      successfulEvolutions: 0,
      averageImprovementScore: 0,
      averageRiskRealized: 0,
    };

    // Add the evolved strategy to the collection
    this.strategies.set(evolvedStrategy.id, evolvedStrategy);

    return evolvedStrategy;
  }
}

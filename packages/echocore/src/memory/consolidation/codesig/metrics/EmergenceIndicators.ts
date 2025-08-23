/**
 * EmergenceIndicators - Implementation
 *
 * This class provides the implementation of the EmergenceIndicators interface,
 * which represents indicators of emergent consciousness properties.
 */

import { EmergenceIndicators as IEmergenceIndicators } from './types';

/**
 * Emergence level enum
 */
export enum EmergenceLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High',
}

/**
 * Interface for detector configuration
 */
interface DetectorConfig {
  // Threshold for detecting emergence (0.0 - 1.0)
  threshold: number;
  // Whether the threshold should adapt based on historical data
  adaptive: boolean;
  // Minimum threshold value when using adaptive thresholds
  minThreshold: number;
  // Maximum threshold value when using adaptive thresholds
  maxThreshold: number;
  // Learning rate for adaptive thresholds (0.0 - 1.0)
  learningRate: number;
}

/**
 * Implementation of the EmergenceIndicators interface
 */
export class EmergenceIndicators implements IEmergenceIndicators {
  /**
   * Measure of novel patterns emerging in the system (0.0 - 1.0)
   */
  public novelPatterns: number;

  /**
   * Measure of self-modification capabilities (0.0 - 1.0)
   */
  public selfModification: number;

  /**
   * Measure of goal evolution capabilities (0.0 - 1.0)
   */
  public goalEvolution: number;

  /**
   * Measure of conceptual expansion capabilities (0.0 - 1.0)
   */
  public conceptualExpansion: number;

  /**
   * Measure of adaptive response capabilities (0.0 - 1.0)
   */
  public adaptiveResponses: number;

  /**
   * The timestamp when the indicators were created
   */
  public timestamp: number;

  /**
   * Current emergence level
   */
  private _emergenceLevel: EmergenceLevel = EmergenceLevel.LOW;

  /**
   * History of indicator values for trend analysis
   */
  private history: IEmergenceIndicators[] = [];

  /**
   * Configuration for complexity increase detector
   */
  private complexityDetectorConfig: DetectorConfig = {
    threshold: 0.7,
    adaptive: true,
    minThreshold: 0.5,
    maxThreshold: 0.9,
    learningRate: 0.1,
  };

  /**
   * Configuration for novelty detector
   */
  private noveltyDetectorConfig: DetectorConfig = {
    threshold: 0.6,
    adaptive: true,
    minThreshold: 0.4,
    maxThreshold: 0.8,
    learningRate: 0.1,
  };

  /**
   * Configuration for coherence spike detector
   */
  private coherenceDetectorConfig: DetectorConfig = {
    threshold: 0.65,
    adaptive: true,
    minThreshold: 0.45,
    maxThreshold: 0.85,
    learningRate: 0.1,
  };

  /**
   * Maximum history size
   */
  private static readonly MAX_HISTORY_SIZE = 100;

  /**
   * Creates a new EmergenceIndicators
   */
  constructor(initialValues?: Partial<IEmergenceIndicators>) {
    // Initialize with default values
    this.novelPatterns = 0.5;
    this.selfModification = 0.5;
    this.goalEvolution = 0.5;
    this.conceptualExpansion = 0.5;
    this.adaptiveResponses = 0.5;
    this.timestamp = Date.now();

    // Override with provided values
    if (initialValues) {
      if (initialValues.novelPatterns !== undefined) {
        this.novelPatterns = initialValues.novelPatterns;
      }

      if (initialValues.selfModification !== undefined) {
        this.selfModification = initialValues.selfModification;
      }

      if (initialValues.goalEvolution !== undefined) {
        this.goalEvolution = initialValues.goalEvolution;
      }

      if (initialValues.conceptualExpansion !== undefined) {
        this.conceptualExpansion = initialValues.conceptualExpansion;
      }

      if (initialValues.adaptiveResponses !== undefined) {
        this.adaptiveResponses = initialValues.adaptiveResponses;
      }

      if (initialValues.timestamp !== undefined) {
        this.timestamp = initialValues.timestamp;
      }
    }

    // Add current state to history
    this.addToHistory();

    // Calculate initial emergence level
    this.calculateEmergenceLevel();
  }

  /**
   * Adds current state to history
   */
  private addToHistory(): void {
    this.history.push(this.toJSON());

    // Limit history size
    if (this.history.length > EmergenceIndicators.MAX_HISTORY_SIZE) {
      this.history.shift();
    }
  }

  /**
   * Sets an indicator value
   */
  public setIndicator(
    indicator: keyof Omit<IEmergenceIndicators, 'timestamp'>,
    value: number
  ): void {
    // Ensure value is in valid range
    const clampedValue = Math.max(0.0, Math.min(1.0, value));

    // Set the indicator value
    (this as any)[indicator] = clampedValue;

    // Update timestamp
    this.timestamp = Date.now();

    // Add to history
    this.addToHistory();

    // Recalculate emergence level
    this.calculateEmergenceLevel();

    // Update adaptive thresholds
    this.updateAdaptiveThresholds();
  }

  /**
   * Gets an indicator value
   */
  public getIndicator(
    indicator: keyof Omit<IEmergenceIndicators, 'timestamp'>
  ): number {
    return (this as any)[indicator];
  }

  /**
   * Gets the current emergence level
   * @returns The current emergence level
   */
  public getEmergenceLevel(): EmergenceLevel {
    return this._emergenceLevel;
  }

  /**
   * Calculates the current emergence level based on detector results
   */
  private calculateEmergenceLevel(): void {
    // Run all detectors
    const complexityResult = this.detectComplexityIncrease();
    const noveltyResult = this.detectNovelty();
    const coherenceResult = this.detectCoherenceSpikes();

    // Count how many detectors are triggered
    const triggeredCount = [
      complexityResult,
      noveltyResult,
      coherenceResult,
    ].filter(Boolean).length;

    // Determine emergence level based on triggered detectors
    if (triggeredCount === 0) {
      this._emergenceLevel = EmergenceLevel.LOW;
    } else if (triggeredCount === 1) {
      this._emergenceLevel = EmergenceLevel.MEDIUM;
    } else {
      this._emergenceLevel = EmergenceLevel.HIGH;
    }
  }

  /**
   * Detects increases in system complexity
   * @returns True if complexity increase is detected
   */
  private detectComplexityIncrease(): boolean {
    // Need at least 2 history points to detect changes
    if (this.history.length < 2) {
      return false;
    }

    // Calculate complexity score based on conceptual expansion and self-modification
    const complexityScore =
      this.conceptualExpansion * 0.6 + this.selfModification * 0.4;

    // Get previous complexity score
    const previousState = this.history[this.history.length - 2];
    const previousComplexityScore =
      previousState.conceptualExpansion * 0.6 +
      previousState.selfModification * 0.4;

    // Check if complexity has increased beyond threshold
    const increase = complexityScore - previousComplexityScore;
    return increase > this.complexityDetectorConfig.threshold;
  }

  /**
   * Detects novel patterns in the system
   * @returns True if novelty is detected
   */
  private detectNovelty(): boolean {
    // Direct check against novelty patterns indicator
    return this.novelPatterns > this.noveltyDetectorConfig.threshold;
  }

  /**
   * Detects spikes in system coherence
   * @returns True if coherence spike is detected
   */
  private detectCoherenceSpikes(): boolean {
    // Need at least 3 history points to detect spikes
    if (this.history.length < 3) {
      return false;
    }

    // Calculate coherence score based on goal evolution and adaptive responses
    const coherenceScore =
      this.goalEvolution * 0.5 + this.adaptiveResponses * 0.5;

    // Get previous coherence scores
    const previousState1 = this.history[this.history.length - 2];
    const previousState2 = this.history[this.history.length - 3];

    const previousCoherenceScore1 =
      previousState1.goalEvolution * 0.5 +
      previousState1.adaptiveResponses * 0.5;
    const previousCoherenceScore2 =
      previousState2.goalEvolution * 0.5 +
      previousState2.adaptiveResponses * 0.5;

    // Calculate average of previous scores
    const avgPreviousScore =
      (previousCoherenceScore1 + previousCoherenceScore2) / 2;

    // Check if current score is significantly higher than average previous score
    const spike = coherenceScore - avgPreviousScore;
    return spike > this.coherenceDetectorConfig.threshold;
  }

  /**
   * Sets all indicators at once
   */
  public setIndicators(
    indicators: Partial<Omit<IEmergenceIndicators, 'timestamp'>>
  ): void {
    for (const [indicator, value] of Object.entries(indicators)) {
      this.setIndicator(
        indicator as keyof Omit<IEmergenceIndicators, 'timestamp'>,
        value
      );
    }
  }

  /**
   * Updates adaptive thresholds based on recent history
   */
  private updateAdaptiveThresholds(): void {
    // Need sufficient history to adapt thresholds
    if (this.history.length < 5) {
      return;
    }

    // Update complexity detector threshold if adaptive
    if (this.complexityDetectorConfig.adaptive) {
      this.updateDetectorThreshold('complexity');
    }

    // Update novelty detector threshold if adaptive
    if (this.noveltyDetectorConfig.adaptive) {
      this.updateDetectorThreshold('novelty');
    }

    // Update coherence detector threshold if adaptive
    if (this.coherenceDetectorConfig.adaptive) {
      this.updateDetectorThreshold('coherence');
    }
  }

  /**
   * Updates a specific detector's threshold based on recent history
   * @param detectorType The type of detector to update
   */
  private updateDetectorThreshold(
    detectorType: 'complexity' | 'novelty' | 'coherence'
  ): void {
    // Get the appropriate detector config
    const config =
      detectorType === 'complexity'
        ? this.complexityDetectorConfig
        : detectorType === 'novelty'
          ? this.noveltyDetectorConfig
          : this.coherenceDetectorConfig;

    // Get recent history (last 5 entries)
    const recentHistory = this.history.slice(-5);

    // Calculate average values based on detector type
    let avgValue = 0;

    if (detectorType === 'complexity') {
      // Average of conceptual expansion and self-modification
      avgValue =
        recentHistory.reduce((sum, entry) => {
          const score =
            entry.conceptualExpansion * 0.6 + entry.selfModification * 0.4;
          return sum + score;
        }, 0) / recentHistory.length;
    } else if (detectorType === 'novelty') {
      // Average of novelty patterns
      avgValue =
        recentHistory.reduce((sum, entry) => sum + entry.novelPatterns, 0) /
        recentHistory.length;
    } else {
      // Average of goal evolution and adaptive responses
      avgValue =
        recentHistory.reduce((sum, entry) => {
          const score =
            entry.goalEvolution * 0.5 + entry.adaptiveResponses * 0.5;
          return sum + score;
        }, 0) / recentHistory.length;
    }

    // Adjust threshold based on average value
    // If average is high, increase threshold to make detection more strict
    // If average is low, decrease threshold to make detection more lenient
    const adjustment = (avgValue - 0.5) * config.learningRate;

    // Update threshold with adjustment, keeping within min/max bounds
    config.threshold = Math.max(
      config.minThreshold,
      Math.min(config.maxThreshold, config.threshold + adjustment)
    );
  }

  /**
   * Calculates the overall emergence score
   */
  public getOverallScore(): number {
    return (
      (this.novelPatterns +
        this.selfModification +
        this.goalEvolution +
        this.conceptualExpansion +
        this.adaptiveResponses) /
      5.0
    );
  }

  /**
   * Gets the strongest indicator (highest value)
   */
  public getStrongestIndicator(): keyof Omit<
    IEmergenceIndicators,
    'timestamp'
  > {
    const indicators: Array<keyof Omit<IEmergenceIndicators, 'timestamp'>> = [
      'novelPatterns',
      'selfModification',
      'goalEvolution',
      'conceptualExpansion',
      'adaptiveResponses',
    ];

    let maxIndicator = indicators[0];
    let maxValue = this.getIndicator(maxIndicator);

    for (const indicator of indicators) {
      const value = this.getIndicator(indicator);
      if (value > maxValue) {
        maxIndicator = indicator;
        maxValue = value;
      }
    }

    return maxIndicator;
  }

  /**
   * Gets the weakest indicator (lowest value)
   */
  public getWeakestIndicator(): keyof Omit<IEmergenceIndicators, 'timestamp'> {
    const indicators: Array<keyof Omit<IEmergenceIndicators, 'timestamp'>> = [
      'novelPatterns',
      'selfModification',
      'goalEvolution',
      'conceptualExpansion',
      'adaptiveResponses',
    ];

    let minIndicator = indicators[0];
    let minValue = this.getIndicator(minIndicator);

    for (const indicator of indicators) {
      const value = this.getIndicator(indicator);
      if (value < minValue) {
        minIndicator = indicator;
        minValue = value;
      }
    }

    return minIndicator;
  }

  /**
   * Gets the indicators sorted by value (descending)
   */
  public getIndicatorsByStrength(): Array<
    keyof Omit<IEmergenceIndicators, 'timestamp'>
  > {
    const indicators: Array<keyof Omit<IEmergenceIndicators, 'timestamp'>> = [
      'novelPatterns',
      'selfModification',
      'goalEvolution',
      'conceptualExpansion',
      'adaptiveResponses',
    ];

    return indicators.sort(
      (a, b) => this.getIndicator(b) - this.getIndicator(a)
    );
  }

  /**
   * Determines if emergence is occurring based on a threshold
   */
  public isEmergenceOccurring(threshold: number = 0.7): boolean {
    return this.getOverallScore() >= threshold;
  }

  /**
   * Configure a detector's threshold settings
   * @param detectorType The type of detector to configure
   * @param config The configuration to apply
   */
  public configureDetector(
    detectorType: 'complexity' | 'novelty' | 'coherence',
    config: Partial<DetectorConfig>
  ): void {
    // Get the appropriate detector config
    const detectorConfig =
      detectorType === 'complexity'
        ? this.complexityDetectorConfig
        : detectorType === 'novelty'
          ? this.noveltyDetectorConfig
          : this.coherenceDetectorConfig;

    // Update config properties
    if (config.threshold !== undefined) {
      detectorConfig.threshold = Math.max(0, Math.min(1, config.threshold));
    }

    if (config.adaptive !== undefined) {
      detectorConfig.adaptive = config.adaptive;
    }

    if (config.minThreshold !== undefined) {
      detectorConfig.minThreshold = Math.max(
        0,
        Math.min(1, config.minThreshold)
      );
    }

    if (config.maxThreshold !== undefined) {
      detectorConfig.maxThreshold = Math.max(
        0,
        Math.min(1, config.maxThreshold)
      );
    }

    if (config.learningRate !== undefined) {
      detectorConfig.learningRate = Math.max(
        0,
        Math.min(1, config.learningRate)
      );
    }

    // Ensure min <= threshold <= max
    detectorConfig.threshold = Math.max(
      detectorConfig.minThreshold,
      Math.min(detectorConfig.maxThreshold, detectorConfig.threshold)
    );
  }

  /**
   * Get the current configuration for a detector
   * @param detectorType The type of detector
   * @returns The detector configuration
   */
  public getDetectorConfig(
    detectorType: 'complexity' | 'novelty' | 'coherence'
  ): DetectorConfig {
    return detectorType === 'complexity'
      ? { ...this.complexityDetectorConfig }
      : detectorType === 'novelty'
        ? { ...this.noveltyDetectorConfig }
        : { ...this.coherenceDetectorConfig };
  }

  /**
   * Converts the indicators to a JSON object
   */
  public toJSON(): IEmergenceIndicators {
    return {
      novelPatterns: this.novelPatterns,
      selfModification: this.selfModification,
      goalEvolution: this.goalEvolution,
      conceptualExpansion: this.conceptualExpansion,
      adaptiveResponses: this.adaptiveResponses,
      timestamp: this.timestamp,
    };
  }

  /**
   * Creates indicators from a JSON object
   */
  public static fromJSON(json: IEmergenceIndicators): EmergenceIndicators {
    return new EmergenceIndicators(json);
  }
}

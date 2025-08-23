/**
 * ConsciousnessVector - Implementation
 *
 * This class provides the implementation of the ConsciousnessVector interface,
 * which represents a multi-dimensional vector of consciousness measurements.
 */

import {
  ConsciousnessDimension,
  ConsciousnessVector as IConsciousnessVector,
} from './types';

/**
 * Interface for tracking dimension-wise deltas over time
 */
interface DimensionDelta {
  dimension: ConsciousnessDimension;
  previousValue: number;
  currentValue: number;
  delta: number;
  timestamp: number;
}

/**
 * Interface for tracking rolling averages
 */
interface RollingAverage {
  dimension: ConsciousnessDimension;
  values: number[];
  average: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  windowSize: number;
}

/**
 * Implementation of the ConsciousnessVector interface
 */
export class ConsciousnessVector implements IConsciousnessVector {
  /**
   * The dimensions of the consciousness vector
   */
  public dimensions: Record<ConsciousnessDimension, number>;

  /**
   * The timestamp when the vector was created
   */
  public timestamp: number;

  /**
   * The confidence level of the vector (0.0 - 1.0)
   */
  public confidence: number;

  /**
   * The source of the vector (measured, derived, etc.)
   */
  public source: string;

  /**
   * Tracks dimension-wise deltas over time
   */
  private deltas: Map<ConsciousnessDimension, DimensionDelta[]> = new Map();

  /**
   * Tracks rolling averages for each dimension
   */
  private rollingAverages: Map<ConsciousnessDimension, RollingAverage> =
    new Map();

  /**
   * Default window size for rolling averages
   */
  private static readonly DEFAULT_WINDOW_SIZE = 10;

  /**
   * Creates a new ConsciousnessVector
   */
  constructor(initialValues?: Partial<IConsciousnessVector>) {
    // Initialize with default values
    this.dimensions = {
      [ConsciousnessDimension.SELF_AWARENESS]: 0.5,
      [ConsciousnessDimension.ADAPTABILITY]: 0.5,
      [ConsciousnessDimension.COHERENCE]: 0.5,
      [ConsciousnessDimension.INTENTIONALITY]: 0.5,
      [ConsciousnessDimension.COMPLEXITY]: 0.5,
      [ConsciousnessDimension.AUTONOMY]: 0.5,
      [ConsciousnessDimension.INTEGRATION]: 0.5,
      [ConsciousnessDimension.EMERGENCE]: 0.5,
    };

    this.timestamp = Date.now();
    this.confidence = 0.8;
    this.source = 'default';

    // Override with provided values
    if (initialValues) {
      if (initialValues.dimensions) {
        this.dimensions = {
          ...this.dimensions,
          ...initialValues.dimensions,
        };
      }

      if (initialValues.timestamp) {
        this.timestamp = initialValues.timestamp;
      }

      if (initialValues.confidence) {
        this.confidence = initialValues.confidence;
      }

      if (initialValues.source) {
        this.source = initialValues.source;
      }
    }

    // Initialize deltas and rolling averages for each dimension
    this.initializeTracking();
  }

  /**
   * Initializes tracking for deltas and rolling averages
   */
  private initializeTracking(): void {
    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      // Initialize deltas tracking
      this.deltas.set(dimension, []);

      // Initialize rolling averages
      this.rollingAverages.set(dimension, {
        dimension,
        values: [this.dimensions[dimension]],
        average: this.dimensions[dimension],
        trend: 'stable',
        windowSize: ConsciousnessVector.DEFAULT_WINDOW_SIZE,
      });
    }
  }

  /**
   * Sets a dimension value
   */
  public setDimension(dimension: ConsciousnessDimension, value: number): void {
    // Store previous value for delta tracking
    const previousValue = this.dimensions[dimension];

    // Ensure value is in valid range
    const clampedValue = Math.max(0.0, Math.min(1.0, value));
    this.dimensions[dimension] = clampedValue;

    // Track delta
    this.trackDelta(dimension, previousValue, clampedValue);

    // Update rolling average
    this.updateRollingAverage(dimension, clampedValue);
  }

  /**
   * Tracks a dimension delta
   */
  private trackDelta(
    dimension: ConsciousnessDimension,
    previousValue: number,
    currentValue: number
  ): void {
    const delta = currentValue - previousValue;
    const dimensionDeltas = this.deltas.get(dimension) || [];

    // Create new delta entry
    const deltaEntry: DimensionDelta = {
      dimension,
      previousValue,
      currentValue,
      delta,
      timestamp: Date.now(),
    };

    // Add to deltas array
    dimensionDeltas.push(deltaEntry);

    // Limit array size to prevent memory issues
    if (dimensionDeltas.length > 100) {
      dimensionDeltas.shift();
    }

    // Update deltas map
    this.deltas.set(dimension, dimensionDeltas);
  }

  /**
   * Updates rolling average for a dimension
   */
  private updateRollingAverage(
    dimension: ConsciousnessDimension,
    value: number
  ): void {
    const rollingAverage = this.rollingAverages.get(dimension);

    if (!rollingAverage) {
      return;
    }

    // Add new value
    rollingAverage.values.push(value);

    // Limit array size to window size
    if (rollingAverage.values.length > rollingAverage.windowSize) {
      rollingAverage.values.shift();
    }

    // Calculate new average
    const sum = rollingAverage.values.reduce((acc, val) => acc + val, 0);
    rollingAverage.average = sum / rollingAverage.values.length;

    // Determine trend
    if (rollingAverage.values.length >= 3) {
      const recentValues = rollingAverage.values.slice(-3);
      const isIncreasing =
        recentValues[0] < recentValues[1] && recentValues[1] < recentValues[2];
      const isDecreasing =
        recentValues[0] > recentValues[1] && recentValues[1] > recentValues[2];

      if (isIncreasing) {
        rollingAverage.trend = 'increasing';
      } else if (isDecreasing) {
        rollingAverage.trend = 'decreasing';
      } else {
        rollingAverage.trend = 'stable';
      }
    }

    // Update rolling averages map
    this.rollingAverages.set(dimension, rollingAverage);
  }

  /**
   * Gets a dimension value
   */
  public getDimension(dimension: ConsciousnessDimension): number {
    return this.dimensions[dimension];
  }

  /**
   * Sets all dimensions at once
   */
  public setDimensions(
    dimensions: Partial<Record<ConsciousnessDimension, number>>
  ): void {
    for (const [dimension, value] of Object.entries(dimensions)) {
      this.setDimension(dimension as ConsciousnessDimension, value);
    }
  }

  /**
   * Calculates the magnitude of the vector
   */
  public getMagnitude(): number {
    let sumSquared = 0;

    for (const value of Object.values(this.dimensions)) {
      sumSquared += value * value;
    }

    return Math.sqrt(sumSquared);
  }

  /**
   * Normalizes the vector to have a magnitude of 1.0
   */
  public normalize(): void {
    const magnitude = this.getMagnitude();

    if (magnitude === 0) {
      return;
    }

    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      this.dimensions[dimension] /= magnitude;
    }
  }

  /**
   * Calculates the dot product with another vector
   */
  public dotProduct(other: IConsciousnessVector): number {
    let sum = 0;

    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      sum += this.dimensions[dimension] * other.dimensions[dimension];
    }

    return sum;
  }

  /**
   * Calculates the cosine similarity with another vector
   */
  public cosineSimilarity(other: IConsciousnessVector): number {
    const dotProduct = this.dotProduct(other);
    const magnitude1 = this.getMagnitude();
    const magnitude2 = new ConsciousnessVector(other).getMagnitude();

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Calculates the Euclidean distance to another vector
   */
  public distance(other: IConsciousnessVector): number {
    let sumSquaredDiff = 0;

    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      const diff = this.dimensions[dimension] - other.dimensions[dimension];
      sumSquaredDiff += diff * diff;
    }

    return Math.sqrt(sumSquaredDiff);
  }

  /**
   * Alias for distance() method to match task requirements
   */
  public distanceTo(other: IConsciousnessVector): number {
    return this.distance(other);
  }

  /**
   * Adds another vector to this one
   */
  public add(other: IConsciousnessVector): void {
    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      this.dimensions[dimension] += other.dimensions[dimension];

      // Ensure value is in valid range
      this.dimensions[dimension] = Math.max(
        0.0,
        Math.min(1.0, this.dimensions[dimension])
      );
    }
  }

  /**
   * Subtracts another vector from this one
   */
  public subtract(other: IConsciousnessVector): void {
    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      this.dimensions[dimension] -= other.dimensions[dimension];

      // Ensure value is in valid range
      this.dimensions[dimension] = Math.max(
        0.0,
        Math.min(1.0, this.dimensions[dimension])
      );
    }
  }

  /**
   * Multiplies this vector by a scalar
   */
  public multiplyScalar(scalar: number): void {
    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      this.dimensions[dimension] *= scalar;

      // Ensure value is in valid range
      this.dimensions[dimension] = Math.max(
        0.0,
        Math.min(1.0, this.dimensions[dimension])
      );
    }
  }

  /**
   * Alias for multiplyScalar() method to match task requirements
   */
  public scale(scalar: number): void {
    this.multiplyScalar(scalar);
  }

  /**
   * Creates a new vector that is the average of this vector and another
   */
  public average(other: IConsciousnessVector): ConsciousnessVector {
    const result = new ConsciousnessVector(this.toJSON());

    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      result.dimensions[dimension] =
        (this.dimensions[dimension] + other.dimensions[dimension]) / 2;
    }

    result.confidence = (this.confidence + other.confidence) / 2;
    result.source = 'averaged';
    result.timestamp = Date.now();

    return result;
  }

  /**
   * Combines this vector with another using weighted averaging
   * @param other The other vector to combine with
   * @param weight The weight to give to the other vector (0.0 - 1.0)
   * @returns A new vector that is the weighted combination of this vector and the other
   */
  public combine(
    other: IConsciousnessVector,
    weight: number = 0.5
  ): ConsciousnessVector {
    // Ensure weight is in valid range
    const clampedWeight = Math.max(0.0, Math.min(1.0, weight));
    const thisWeight = 1.0 - clampedWeight;

    const result = new ConsciousnessVector(this.toJSON());

    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      result.dimensions[dimension] =
        this.dimensions[dimension] * thisWeight +
        other.dimensions[dimension] * clampedWeight;
    }

    result.confidence =
      this.confidence * thisWeight + other.confidence * clampedWeight;
    result.source = 'combined';
    result.timestamp = Date.now();

    return result;
  }

  /**
   * Gets the dominant dimension (highest value)
   */
  public getDominantDimension(): ConsciousnessDimension {
    let maxDimension = ConsciousnessDimension.SELF_AWARENESS;
    let maxValue = this.dimensions[maxDimension];

    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      if (this.dimensions[dimension] > maxValue) {
        maxDimension = dimension;
        maxValue = this.dimensions[dimension];
      }
    }

    return maxDimension;
  }

  /**
   * Gets the weakest dimension (lowest value)
   */
  public getWeakestDimension(): ConsciousnessDimension {
    let minDimension = ConsciousnessDimension.SELF_AWARENESS;
    let minValue = this.dimensions[minDimension];

    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      if (this.dimensions[dimension] < minValue) {
        minDimension = dimension;
        minValue = this.dimensions[dimension];
      }
    }

    return minDimension;
  }

  /**
   * Gets the dimensions sorted by value (descending)
   */
  public getDimensionsByStrength(): ConsciousnessDimension[] {
    return Object.keys(this.dimensions)
      .sort(
        (a, b) =>
          this.dimensions[b as ConsciousnessDimension] -
          this.dimensions[a as ConsciousnessDimension]
      )
      .map((d) => d as ConsciousnessDimension);
  }

  /**
   * Converts the vector to a JSON object
   */
  public toJSON(): IConsciousnessVector {
    return {
      dimensions: { ...this.dimensions },
      timestamp: this.timestamp,
      confidence: this.confidence,
      source: this.source,
    };
  }

  /**
   * Creates a vector from a JSON object
   */
  public static fromJSON(json: IConsciousnessVector): ConsciousnessVector {
    return new ConsciousnessVector(json);
  }

  /**
   * Gets the deltas for a specific dimension
   */
  public getDimensionDeltas(
    dimension: ConsciousnessDimension
  ): DimensionDelta[] {
    return this.deltas.get(dimension) || [];
  }

  /**
   * Gets all dimension deltas
   */
  public getAllDeltas(): Map<ConsciousnessDimension, DimensionDelta[]> {
    return new Map(this.deltas);
  }

  /**
   * Gets the rolling average for a specific dimension
   */
  public getRollingAverage(
    dimension: ConsciousnessDimension
  ): RollingAverage | undefined {
    return this.rollingAverages.get(dimension);
  }

  /**
   * Gets all rolling averages
   */
  public getAllRollingAverages(): Map<ConsciousnessDimension, RollingAverage> {
    return new Map(this.rollingAverages);
  }

  /**
   * Sets the window size for rolling averages
   */
  public setRollingAverageWindowSize(windowSize: number): void {
    const clampedWindowSize = Math.max(2, Math.min(100, windowSize));

    for (const dimension of Object.keys(
      this.dimensions
    ) as ConsciousnessDimension[]) {
      const rollingAverage = this.rollingAverages.get(dimension);

      if (rollingAverage) {
        rollingAverage.windowSize = clampedWindowSize;

        // Trim values array if needed
        if (rollingAverage.values.length > clampedWindowSize) {
          rollingAverage.values =
            rollingAverage.values.slice(-clampedWindowSize);

          // Recalculate average
          const sum = rollingAverage.values.reduce((acc, val) => acc + val, 0);
          rollingAverage.average = sum / rollingAverage.values.length;
        }

        this.rollingAverages.set(dimension, rollingAverage);
      }
    }
  }

  /**
   * Gets the trend for a specific dimension
   */
  public getDimensionTrend(
    dimension: ConsciousnessDimension
  ): 'increasing' | 'decreasing' | 'stable' {
    const rollingAverage = this.rollingAverages.get(dimension);
    return rollingAverage ? rollingAverage.trend : 'stable';
  }
}

import {
  ConflictEvent,
  RollbackEvent,
  EmergencePattern,
  EmergenceEventType,
} from '../types/emergence';

export class EmergencePredictor {
  private conflictBuffer: ConflictEvent[] = [];
  private rollbackBuffer: RollbackEvent[] = [];
  private readonly WINDOW_MS = 5000;

  constructor(
    private onEmergenceDetected: (pattern: EmergencePattern) => void
  ) {}

  handleConflict(event: ConflictEvent): void {
    this.conflictBuffer.push(event);
    this.trimOldConflicts();

    if (this.detectConflictCascade()) {
      this.emitEmergence('ConflictCascade');
    }

    if (this.detectVectorClockDivergence(event)) {
      this.emitEmergence('VectorClockDivergence');
    }
  }

  handleRollback(event: RollbackEvent): void {
    this.rollbackBuffer.push(event);
    this.trimOldRollbacks();

    if (this.detectRollbackChain()) {
      this.emitEmergence('RollbackChain');
    }
  }

  private trimOldConflicts(): void {
    const now = Date.now();
    this.conflictBuffer = this.conflictBuffer.filter(
      (e) => now - e.timestamp < this.WINDOW_MS
    );
  }

  private trimOldRollbacks(): void {
    const now = Date.now();
    this.rollbackBuffer = this.rollbackBuffer.filter(
      (e) => now - e.timestamp < this.WINDOW_MS
    );
  }

  private detectConflictCascade(): boolean {
    return this.conflictBuffer.length >= 3;
  }

  private detectVectorClockDivergence(event: ConflictEvent): boolean {
    return event.vectorClockSkew > 1000;
  }

  private detectRollbackChain(): boolean {
    const chains = this.rollbackBuffer.filter((e) => e.cause === 'rollback');
    return chains.length >= 2;
  }

  private emitEmergence(type: EmergenceEventType): void {
    const pattern: EmergencePattern = {
      type,
      timestamp: Date.now(),
      severity: 'critical',
    };
    this.onEmergenceDetected(pattern);
  }
}

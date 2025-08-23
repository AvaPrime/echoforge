import { SculptorIntent } from './SculptorIntent';
import { SculptorResult } from './SculptorResult';

/**
 * Hook interface for validating, observing, and logging memory sculpting operations.
 */
export interface SculptorHook {
  /**
   * Called before a sculpting operation is performed.
   * Return false to prevent the operation from proceeding.
   *
   * @param intent The sculpting intent
   * @returns Whether the operation should proceed
   */
  onPreSculpt(intent: SculptorIntent): boolean | Promise<boolean>;

  /**
   * Called after a sculpting operation has been performed.
   *
   * @param result The result of the sculpting operation
   */
  onPostSculpt(result: SculptorResult): void | Promise<void>;
}

/**
 * Options for registering a sculptor hook
 */
export interface SculptorHookOptions {
  /**
   * Unique identifier for the hook
   */
  id: string;

  /**
   * Optional description of what the hook does
   */
  description?: string;

  /**
   * Optional filter for specific operations
   */
  operations?: string[];

  /**
   * Optional filter for specific agent IDs
   */
  agentIds?: string[];

  /**
   * Priority of the hook (higher numbers run first)
   */
  priority?: number;
}

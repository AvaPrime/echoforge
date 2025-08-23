/**
 * Guild Manager Implementation
 *
 * Implements the Guild interface to manage a collection of GuildMembers,
 * coordinate task dispatching, and handle event broadcasting.
 */
import { AgentContext } from '../core/AgentContext';
import {
  Guild,
  GuildMember,
  GuildTask,
  GuildResult,
  GuildEvent,
} from './GuildContract';
/**
 * Implementation of the Guild interface that manages a collection of GuildMembers
 */
export declare class GuildManager implements Guild {
  readonly id: string;
  readonly name: string;
  readonly context: AgentContext;
  private members;
  private events;
  private isRunning;
  /**
   * Create a new GuildManager
   *
   * @param id Unique identifier for this Guild
   * @param name Human-readable name for this Guild
   * @param context Shared context for Guild operations
   */
  constructor(id: string, name: string, context: AgentContext);
  /**
   * Register a new member to the Guild
   */
  registerMember(member: GuildMember): Promise<void>;
  /**
   * Remove a member from the Guild
   */
  removeMember(memberId: string): Promise<void>;
  /**
   * Get a member by ID
   */
  getMember(memberId: string): GuildMember | undefined;
  /**
   * Get all members of the Guild
   */
  getAllMembers(): GuildMember[];
  /**
   * Find members by role
   */
  findMembersByRole(role: string): GuildMember[];
  /**
   * Find members by capability
   */
  findMembersByCapability(capability: string): GuildMember[];
  /**
   * Dispatch a task to the most appropriate member based on capabilities and role
   */
  dispatchTask(task: GuildTask): Promise<GuildResult>;
  /**
   * Broadcast an event to all relevant members
   */
  broadcastEvent(event: GuildEvent): void;
  /**
   * Handle a guild event from the context
   */
  private handleGuildEvent;
  /**
   * Start all Guild members
   */
  start(): Promise<void>;
  /**
   * Stop all Guild members
   */
  stop(): Promise<void>;
  /**
   * Get the status of the Guild
   */
  getStatus(): Record<string, any>;
}
//# sourceMappingURL=GuildManager.d.ts.map

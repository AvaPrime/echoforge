/**
 * Guild Protocol Contracts
 *
 * Defines the core interfaces for the Guild Protocol, which enables
 * agents to form coordinated societies with specialized roles and capabilities.
 */
import { Agent } from '../core/Agent';
import { AgentContext } from '../core/AgentContext';
/**
 * Represents a task that can be dispatched to Guild members
 */
export interface GuildTask {
  id: string;
  type: string;
  priority: number;
  data: Record<string, any>;
  requiredCapabilities?: string[];
  preferredRole?: string;
  deadline?: Date;
  metadata?: Record<string, any>;
}
/**
 * Represents the result of a Guild task execution
 */
export interface GuildResult {
  taskId: string;
  success: boolean;
  data: Record<string, any>;
  error?: Error;
  executedBy?: string;
  completedAt: Date;
  metadata?: Record<string, any>;
}
/**
 * Represents an event that can be broadcast across the Guild
 */
export interface GuildEvent {
  id: string;
  type: string;
  source: string;
  timestamp: Date;
  data: Record<string, any>;
  targetRoles?: string[];
  targetCapabilities?: string[];
}
/**
 * Represents a member of the Guild with specific role and capabilities
 */
export interface GuildMember extends Agent {
  role: string;
  capabilities: string[];
  handleGuildTask(task: GuildTask): Promise<GuildResult>;
  onGuildEvent(event: GuildEvent): void;
}
/**
 * Represents the Guild as a whole, managing members and coordinating tasks
 */
export interface Guild {
  readonly id: string;
  readonly name: string;
  readonly context: AgentContext;
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
//# sourceMappingURL=GuildContract.d.ts.map

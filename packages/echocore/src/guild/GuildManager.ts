/**
 * Guild Manager Implementation
 *
 * Implements the Guild interface to manage a collection of GuildMembers,
 * coordinate task dispatching, and handle event broadcasting.
 */

import { EventEmitter } from '@echoforge/forgekit';
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
export class GuildManager implements Guild {
  public readonly id: string;
  public readonly name: string;
  public readonly context: AgentContext;
  private members: Map<string, GuildMember>;
  private events: EventEmitter;
  private isRunning: boolean;

  /**
   * Create a new GuildManager
   *
   * @param id Unique identifier for this Guild
   * @param name Human-readable name for this Guild
   * @param context Shared context for Guild operations
   */
  constructor(id: string, name: string, context: AgentContext) {
    this.id = id;
    this.name = name;
    this.context = context;
    this.members = new Map<string, GuildMember>();
    this.events = new EventEmitter();
    this.isRunning = false;

    // Set up event forwarding from context to guild members
    this.context.events.on('guild:*', (event: GuildEvent) => {
      this.handleGuildEvent(event);
    });

    this.context.logger.info(`Guild '${this.name}' (${this.id}) created`);
  }

  /**
   * Register a new member to the Guild
   */
  async registerMember(member: GuildMember): Promise<void> {
    if (this.members.has(member.id)) {
      throw new Error(`Member with ID ${member.id} is already registered`);
    }

    // Initialize the member with the Guild context if not already initialized
    if (!member.getStatus()) {
      await member.initialize(this.context);
    }

    this.members.set(member.id, member);

    // Set up event forwarding for guild events
    member.events.on('*', (eventType: string, data: any) => {
      // Forward member events to the guild context
      this.context.events.emit(`member:${member.id}:${eventType}`, {
        source: member.id,
        type: eventType,
        data,
        timestamp: new Date(),
      });
    });

    this.context.logger.info(
      `Member '${member.metadata.name}' (${member.id}) registered with Guild '${this.name}'`
    );

    // Start the member if the guild is already running
    if (this.isRunning) {
      await member.start();
    }
  }

  /**
   * Remove a member from the Guild
   */
  async removeMember(memberId: string): Promise<void> {
    const member = this.members.get(memberId);
    if (!member) {
      throw new Error(`Member with ID ${memberId} is not registered`);
    }

    // Stop the member if the guild is running
    if (this.isRunning) {
      await member.stop();
    }

    this.members.delete(memberId);
    this.context.logger.info(
      `Member '${member.metadata.name}' (${memberId}) removed from Guild '${this.name}'`
    );
  }

  /**
   * Get a member by ID
   */
  getMember(memberId: string): GuildMember | undefined {
    return this.members.get(memberId);
  }

  /**
   * Get all members of the Guild
   */
  getAllMembers(): GuildMember[] {
    return Array.from(this.members.values());
  }

  /**
   * Find members by role
   */
  findMembersByRole(role: string): GuildMember[] {
    return this.getAllMembers().filter((member) => member.role === role);
  }

  /**
   * Find members by capability
   */
  findMembersByCapability(capability: string): GuildMember[] {
    return this.getAllMembers().filter((member) =>
      member.capabilities.includes(capability)
    );
  }

  /**
   * Dispatch a task to the most appropriate member based on capabilities and role
   */
  async dispatchTask(task: GuildTask): Promise<GuildResult> {
    this.context.logger.info(
      `Dispatching task ${task.id} of type ${task.type}`
    );

    // Find eligible members based on required capabilities
    let eligibleMembers = this.getAllMembers();

    if (task.requiredCapabilities && task.requiredCapabilities.length > 0) {
      eligibleMembers = eligibleMembers.filter((member) =>
        task.requiredCapabilities!.every((cap) =>
          member.capabilities.includes(cap)
        )
      );
    }

    // Further filter by preferred role if specified
    if (task.preferredRole) {
      const roleMembers = eligibleMembers.filter(
        (member) => member.role === task.preferredRole
      );
      if (roleMembers.length > 0) {
        eligibleMembers = roleMembers;
      }
    }

    if (eligibleMembers.length === 0) {
      this.context.logger.error(
        `No eligible members found for task ${task.id}`
      );
      return {
        taskId: task.id,
        success: false,
        data: {},
        error: new Error('No eligible members found for this task'),
        completedAt: new Date(),
      };
    }

    // For now, simply select the first eligible member
    // TODO: Implement more sophisticated selection strategies (load balancing, etc.)
    const selectedMember = eligibleMembers[0];

    try {
      this.context.logger.info(
        `Assigning task ${task.id} to member ${selectedMember.id}`
      );

      // Convert GuildTask to the format expected by the member
      const result = await selectedMember.handleGuildTask(task);

      return {
        ...result,
        executedBy: selectedMember.id,
        completedAt: new Date(),
      };
    } catch (error) {
      this.context.logger.error(
        `Error executing task ${task.id} by member ${selectedMember.id}`,
        {
          metadata: { error: (error as Error).message },
        }
      );

      return {
        taskId: task.id,
        success: false,
        data: {},
        error: error as Error,
        executedBy: selectedMember.id,
        completedAt: new Date(),
      };
    }
  }

  /**
   * Broadcast an event to all relevant members
   */
  broadcastEvent(event: GuildEvent): void {
    this.context.logger.debug(
      `Broadcasting event ${event.type} from ${event.source}`
    );

    // Emit the event to the guild context
    this.context.events.emit(`guild:${event.type}`, event);

    // Determine which members should receive this event
    let targetMembers = this.getAllMembers();

    // Filter by target roles if specified
    if (event.targetRoles && event.targetRoles.length > 0) {
      targetMembers = targetMembers.filter((member) =>
        event.targetRoles!.includes(member.role)
      );
    }

    // Filter by target capabilities if specified
    if (event.targetCapabilities && event.targetCapabilities.length > 0) {
      targetMembers = targetMembers.filter((member) =>
        event.targetCapabilities!.some((cap) =>
          member.capabilities.includes(cap)
        )
      );
    }

    // Forward the event to each target member
    for (const member of targetMembers) {
      try {
        member.onGuildEvent(event);
      } catch (error) {
        this.context.logger.error(
          `Error forwarding event ${event.type} to member ${member.id}`,
          {
            metadata: { error: (error as Error).message },
          }
        );
      }
    }
  }

  /**
   * Handle a guild event from the context
   */
  private handleGuildEvent(event: GuildEvent): void {
    // Skip events that originated from this guild to avoid loops
    if (event.source === this.id) {
      return;
    }

    this.broadcastEvent(event);
  }

  /**
   * Start all Guild members
   */
  async start(): Promise<void> {
    if (this.isRunning) {
      return;
    }

    this.context.logger.info(
      `Starting Guild '${this.name}' with ${this.members.size} members`
    );

    // Start all members
    const startPromises = Array.from(this.members.values()).map(
      async (member) => {
        try {
          await member.start();
          return { id: member.id, success: true };
        } catch (error) {
          this.context.logger.error(`Failed to start member ${member.id}`, {
            metadata: { error: (error as Error).message },
          });
          return { id: member.id, success: false, error };
        }
      }
    );

    const results = await Promise.all(startPromises);
    const failedStarts = results.filter((r) => !r.success);

    if (failedStarts.length > 0) {
      this.context.logger.warn(
        `Guild started with ${failedStarts.length} failed member starts`
      );
    } else {
      this.context.logger.info(`Guild '${this.name}' started successfully`);
    }

    this.isRunning = true;
  }

  /**
   * Stop all Guild members
   */
  async stop(): Promise<void> {
    if (!this.isRunning) {
      return;
    }

    this.context.logger.info(`Stopping Guild '${this.name}'`);

    // Stop all members
    const stopPromises = Array.from(this.members.values()).map(
      async (member) => {
        try {
          await member.stop();
          return { id: member.id, success: true };
        } catch (error) {
          this.context.logger.error(`Failed to stop member ${member.id}`, {
            metadata: { error: (error as Error).message },
          });
          return { id: member.id, success: false, error };
        }
      }
    );

    const results = await Promise.all(stopPromises);
    const failedStops = results.filter((r) => !r.success);

    if (failedStops.length > 0) {
      this.context.logger.warn(
        `Guild stopped with ${failedStops.length} failed member stops`
      );
    } else {
      this.context.logger.info(`Guild '${this.name}' stopped successfully`);
    }

    this.isRunning = false;
  }

  /**
   * Get the status of the Guild
   */
  getStatus(): Record<string, any> {
    const memberStatuses = {};
    for (const [id, member] of this.members.entries()) {
      memberStatuses[id] = {
        role: member.role,
        capabilities: member.capabilities,
        status: member.getStatus(),
      };
    }

    return {
      id: this.id,
      name: this.name,
      running: this.isRunning,
      memberCount: this.members.size,
      members: memberStatuses,
    };
  }
}

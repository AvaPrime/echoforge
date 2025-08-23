# Guild Protocol

The Guild Protocol transforms isolated agents into a coordinated society. It provides a framework for agent membership, task delegation, and communication within a collaborative environment.

## Core Components

### GuildContract

Defines the interfaces that govern the Guild Protocol:

- **GuildTask**: Represents a task that can be dispatched to guild members
- **GuildResult**: Represents the result of a task execution
- **GuildEvent**: Represents an event that can be broadcast to guild members
- **GuildMember**: Interface for agents that can join a guild
- **Guild**: Interface for the guild itself, which manages members and coordinates tasks

### GuildManager

Implements the Guild interface to manage a collection of GuildMembers, coordinate task dispatching, and handle event broadcasting.

Key features:

- Member registration and management
- Smart task routing based on capabilities and roles
- Event broadcasting with targeting by role or capability
- Lifecycle management for all members

### BaseGuildMember

Provides a foundation for implementing GuildMembers with common functionality for handling tasks, events, and lifecycle management.

### AgentGuildMember

Adapter class that wraps an Agent as a GuildMember, allowing existing agents to participate in the Guild Protocol.

## Usage Examples

### Creating a Guild

```typescript
// Create a shared context
const context = new AgentContext({
  id: 'my-guild',
  logger: console,
  events: new EventEmitter(),
  config: {},
});

// Create a Guild Manager
const guild = new GuildManager('my-guild', 'My Guild', context);
```

### Registering Members

```typescript
// Create an agent
const echoAgent = new EchoAgent('echo1');
await echoAgent.initialize(context);

// Create a Guild Member that wraps the agent
const echoMember = new AgentGuildMember(
  echoAgent,
  'responder',
  ['echo', 'respond'],
  {
    name: 'Echo Responder',
    description: 'A guild member that responds to echo requests',
    version: '1.0.0',
  }
);

// Register the member with the guild
await guild.registerMember(echoMember);
```

### Dispatching Tasks

```typescript
// Create a task
const task: GuildTask = {
  id: 'task-1',
  type: 'echo',
  requiredCapabilities: ['respond'],
  data: { message: 'Hello Guild!' },
};

// Dispatch the task to the guild
const result = await guild.dispatchTask(task);
console.log('Task result:', result);
```

### Broadcasting Events

```typescript
// Broadcast an event to all members
guild.broadcastEvent({
  source: 'system',
  type: 'announcement',
  data: { message: 'This is a broadcast to all members' },
  timestamp: new Date(),
});

// Broadcast an event only to members with a specific role
guild.broadcastEvent({
  source: 'system',
  type: 'private-message',
  targetRoles: ['responder'],
  data: { message: 'This is only for responders' },
  timestamp: new Date(),
});
```

### Lifecycle Management

```typescript
// Start the guild (which starts all members)
await guild.start();

// Stop the guild (which stops all members)
await guild.stop();
```

## Creating Custom Guild Members

You can create custom guild members by extending the BaseGuildMember class:

```typescript
class CustomGuildMember extends BaseGuildMember {
  constructor(id: string) {
    super(id, 'custom', ['capability1', 'capability2'], {
      name: 'Custom Member',
      description: 'A custom guild member',
      version: '1.0.0',
    });
  }

  protected async onInitialize(): Promise<void> {
    // Custom initialization logic
  }

  protected async onStart(): Promise<void> {
    // Custom start logic
  }

  protected async onStop(): Promise<void> {
    // Custom stop logic
  }

  protected async executeTask(task: GuildTask): Promise<GuildResult> {
    // Custom task execution logic
    return {
      taskId: task.id,
      success: true,
      data: {
        /* result data */
      },
      completedAt: new Date(),
    };
  }

  protected processEvent(event: GuildEvent): void {
    // Custom event processing logic
  }
}
```

## Future Enhancements

- Hierarchical command delegation
- Voting and quorum mechanisms
- Task prioritization and load balancing
- Member discovery and auto-registration
- Cross-guild communication

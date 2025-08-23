# EchoCore - Agent Framework for EchoForge
...existing code...
## TODO

- [ ] Complete agent lifecycle management
- [ ] Implement core orchestration logic
- [ ] Add robust error handling and logging
- [ ] Write unit and integration tests
- [ ] Document all public APIs

EchoCore is the agent framework layer of the EchoForge ecosystem, providing a standardized way to create, manage, and orchestrate intelligent agents.

## Features

- **Agent Interface**: Standardized contract for all agents
- **Agent Context**: Runtime environment with logging, config, and events
- **Agent Manager**: Centralized registry for agent lifecycle management
- **Event System**: Communication between agents and components

## Getting Started

### Installation

```bash
pnpm install @echoforge/echocore
```

### Creating an Agent

Implement the `Agent` interface to create your own agent:

```typescript
import {
  Agent,
  AgentContext,
  AgentTask,
  AgentResult,
} from '@echoforge/echocore';
import { EventEmitter } from '@echoforge/forgekit';

export class MyAgent implements Agent {
  public readonly id: string;
  public readonly metadata: AgentMetadata;
  public readonly events: EventEmitter;

  constructor(id: string) {
    this.id = id;
    this.metadata = {
      id,
      name: `MyAgent-${id}`,
      description: 'My custom agent',
      version: '0.1.0',
    };
    this.events = new EventEmitter();
  }

  async initialize(context: AgentContext): Promise<void> {
    // Initialize your agent
  }

  async start(): Promise<void> {
    // Start your agent
  }

  async stop(): Promise<void> {
    // Stop your agent
  }

  async executeTask(task: AgentTask): Promise<AgentResult> {
    // Execute a task
    return {
      taskId: task.id,
      success: true,
      data: { result: 'Task completed' },
    };
  }

  getStatus(): Record<string, any> {
    // Return agent status
    return { running: true };
  }
}
```

### Using the Agent Manager

```typescript
import { AgentManager, buildAgentContext } from '@echoforge/echocore';
import { MyAgent } from './MyAgent';

// Create a context and manager
const context = buildAgentContext();
const manager = new AgentManager();

// Create and initialize an agent
const agent = new MyAgent('my-agent-1');
await agent.initialize(context);

// Register the agent
await manager.registerAgent(agent);

// Start all registered agents
await manager.startAllAgents();

// Later, stop all agents
await manager.stopAllAgents();
```

### Running the Example Agent

EchoCore includes a simple EchoAgent for testing and demonstration:

```bash
# Build the package
pnpm build

# Run the agent
pnpm start:agent

# Or with a custom agent ID
pnpm start:agent my-custom-agent
```

## Architecture

EchoCore is built on top of ForgeKit, leveraging its utilities for logging, configuration, and event management. The agent framework provides a standardized way to create and manage agents, with a focus on modularity and extensibility.

## License

MIT

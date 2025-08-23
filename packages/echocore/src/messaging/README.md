# Agent-to-Agent Messaging System

The EchoForge Messaging System enables direct and broadcast communication between agents with support for topics, mailboxes, and persistent message storage.

## Core Components

### MessageContract

Defines the core interfaces for the messaging system:

- `Message`: The message data structure with sender, recipients, content, and metadata
- `MessageBroker`: Central message routing and delivery system
- `AgentMailbox`: Agent-specific interface for sending and receiving messages
- `MessageStore`: Persistence layer for storing and querying messages

### MessageBroker

The `DefaultMessageBroker` provides:

- Direct message delivery to specific recipients
- Topic-based broadcasting to subscribers
- Subscription management
- Message status tracking

### AgentMailbox

The `DefaultAgentMailbox` offers a convenient interface for agents to:

- Send direct messages to other agents
- Broadcast messages to topics
- Subscribe to topics of interest
- Register handlers for different message types and conversations
- Query message history

### MessageStore

Two implementations are provided:

- `InMemoryMessageStore`: For testing and development
- `IndexedDBMessageStore`: For persistent browser-based storage

## Usage Examples

### Setting Up the Messaging System

```typescript
// Create a message store and broker
const messageStore = new InMemoryMessageStore();
const messageBroker = new DefaultMessageBroker(messageStore);

// Create agent mailboxes
const mailboxA = new DefaultAgentMailbox('agent-a', messageBroker);
const mailboxB = new DefaultAgentMailbox('agent-b', messageBroker);
```

### Sending Direct Messages

```typescript
// Send a message from Agent A to Agent B
const messageId = await mailboxA.sendMessage(
  ['agent-b'],
  { text: 'Hello from Agent A' },
  { type: 'greeting', conversationId: 'conversation-1' }
);
```

### Topic Subscriptions and Broadcasting

```typescript
// Subscribe to a topic
mailboxB.subscribeTopic('announcements', (message) => {
  console.log(`Received announcement: ${message.content}`);
});

// Broadcast a message to all subscribers
await mailboxA.broadcastMessage(
  'announcements',
  'Important system update scheduled for tomorrow',
  { type: 'announcement', priority: 1 }
);
```

### Message Handlers

```typescript
// Handle all incoming messages
const unsubscribe = mailboxB.onMessage((message) => {
  console.log(`Received message: ${message.id} from ${message.senderId}`);
});

// Handle messages of a specific type
mailboxB.onMessageType('task', (message) => {
  console.log(`Received task: ${message.content.taskName}`);
  mailboxB.markAsProcessed(message.id);
});

// Handle messages in a specific conversation
mailboxB.onConversation('conversation-1', (message) => {
  console.log(`Received message in conversation: ${message.content}`);
});

// Clean up when done
unsubscribe();
```

### Querying Messages

```typescript
// Get all messages
const allMessages = await mailboxB.queryMessages();

// Get unread messages
const unreadMessages = await mailboxB.queryMessages({
  status: MessageStatus.SENT,
});

// Get messages from a specific sender
const messagesFromA = await mailboxB.queryMessages({
  senderId: 'agent-a',
});

// Get messages in a specific conversation
const conversationMessages = await mailboxB.queryMessages({
  conversationId: 'conversation-1',
});

// Get messages within a date range
const recentMessages = await mailboxB.queryMessages({
  fromDate: new Date('2023-01-01'),
  toDate: new Date(),
});
```

### Message Status Management

```typescript
// Mark a message as read
await mailboxB.markAsRead(messageId);

// Mark a message as processed
await mailboxB.markAsProcessed(messageId);
```

### Cleanup

```typescript
// Close mailboxes when done
mailboxA.close();
mailboxB.close();
```

## Integration with Agents

The messaging system can be integrated with the EchoForge agent system:

```typescript
// Create an agent with a mailbox
const agent = new EchoAgent('agent-id', new AgentContext());
const mailbox = new DefaultAgentMailbox('agent-id', messageBroker);

// Attach the mailbox to the agent
(agent as any).mailbox = mailbox;

// Use the mailbox in agent tasks
agent.registerTask('send-message', async (context, data) => {
  const { recipientId, content } = data;
  await agent.mailbox.sendMessage([recipientId], content);
  return { success: true };
});
```

## Integration with Guild Protocol

The messaging system can be used with the Guild Protocol to enable communication between guild members:

```typescript
// Create a guild with messaging capabilities
class MessagingGuild extends GuildManager {
  private messageBroker: DefaultMessageBroker;

  constructor() {
    super();
    const messageStore = new InMemoryMessageStore();
    this.messageBroker = new DefaultMessageBroker(messageStore);
  }

  registerMember(member: GuildMember): void {
    super.registerMember(member);

    // Create a mailbox for the member
    const mailbox = new DefaultAgentMailbox(member.id, this.messageBroker);
    (member as any).mailbox = mailbox;

    // Subscribe to guild-wide topics
    mailbox.subscribeTopic('guild-announcements');
  }

  broadcastToMembers(content: any, options: any = {}): Promise<string> {
    // Use the guild leader's mailbox to broadcast
    const leaderMailbox = new DefaultAgentMailbox(
      'guild-leader',
      this.messageBroker
    );
    return leaderMailbox.broadcastMessage(
      'guild-announcements',
      content,
      options
    );
  }
}
```

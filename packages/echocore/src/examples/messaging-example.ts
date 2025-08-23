/**
 * Messaging Example
 *
 * Demonstrates the Agent-to-Agent Messaging system with direct messages,
 * topic subscriptions, and message querying.
 */

import { EchoAgent } from '../core/EchoAgent';
import { DefaultMessageBroker } from '../messaging/MessageBroker';
import { DefaultAgentMailbox } from '../messaging/AgentMailbox';
import { InMemoryMessageStore } from '../messaging/InMemoryMessageStore';
import { AgentContext } from '../core/AgentContext';
import { MessageStatus } from '../messaging/MessageContract';

/**
 * Run the messaging example
 */
async function runMessagingExample() {
  console.log('🌐 Starting Agent-to-Agent Messaging Example');

  // Create a message store and broker
  const messageStore = new InMemoryMessageStore();
  const messageBroker = new DefaultMessageBroker(messageStore);

  // Create agents with mailboxes
  const agentA = createAgentWithMailbox('agent-a', messageBroker);
  const agentB = createAgentWithMailbox('agent-b', messageBroker);
  const agentC = createAgentWithMailbox('agent-c', messageBroker);

  // Start the agents
  await agentA.start();
  await agentB.start();
  await agentC.start();

  console.log('✅ Agents started with mailboxes');

  // Set up message handlers
  setupMessageHandlers(agentA, agentB, agentC);

  // Subscribe to topics
  agentA.mailbox.subscribeTopic('announcements');
  agentB.mailbox.subscribeTopic('announcements');
  agentC.mailbox.subscribeTopic('announcements');

  agentB.mailbox.subscribeTopic('data-processing');
  agentC.mailbox.subscribeTopic('data-processing');

  console.log('✅ Topic subscriptions set up');

  // Send direct messages
  await sendDirectMessages(agentA, agentB, agentC);

  // Broadcast messages
  await broadcastMessages(agentA, agentB);

  // Query messages
  await queryMessages(agentC);

  // Clean up
  await agentA.stop();
  await agentB.stop();
  await agentC.stop();

  console.log('🏁 Messaging example completed');
}

/**
 * Create an agent with a mailbox
 *
 * @param agentId The agent ID
 * @param messageBroker The message broker
 */
function createAgentWithMailbox(
  agentId: string,
  messageBroker: DefaultMessageBroker
) {
  // Create the agent
  const agent = new EchoAgent(agentId, new AgentContext());

  // Create and attach the mailbox
  const mailbox = new DefaultAgentMailbox(agentId, messageBroker);
  (agent as any).mailbox = mailbox;

  return agent as EchoAgent & { mailbox: DefaultAgentMailbox };
}

/**
 * Set up message handlers for the agents
 *
 * @param agentA The first agent
 * @param agentB The second agent
 * @param agentC The third agent
 */
function setupMessageHandlers(
  agentA: EchoAgent & { mailbox: DefaultAgentMailbox },
  agentB: EchoAgent & { mailbox: DefaultAgentMailbox },
  agentC: EchoAgent & { mailbox: DefaultAgentMailbox }
) {
  // Agent A handles all messages
  agentA.mailbox.onMessage((message) => {
    console.log(
      `[${agentA.id}] Received message: ${message.id} from ${message.senderId}`
    );
    agentA.mailbox.markAsRead(message.id);
  });

  // Agent B handles only task messages
  agentB.mailbox.onMessageType('task', (message) => {
    console.log(`[${agentB.id}] Received task: ${message.content.taskName}`);
    agentB.mailbox.markAsProcessed(message.id);
  });

  // Agent C handles messages in a specific conversation
  agentC.mailbox.onConversation('conversation-1', (message) => {
    console.log(
      `[${agentC.id}] Received message in conversation-1: ${message.content}`
    );
  });

  // All agents handle announcements
  const announcementHandler = (
    agent: EchoAgent & { mailbox: DefaultAgentMailbox }
  ) => {
    return (message: any) => {
      console.log(`[${agent.id}] Announcement: ${message.content}`);
    };
  };

  agentA.mailbox.eventEmitter.on(
    'topic:announcements',
    announcementHandler(agentA)
  );
  agentB.mailbox.eventEmitter.on(
    'topic:announcements',
    announcementHandler(agentB)
  );
  agentC.mailbox.eventEmitter.on(
    'topic:announcements',
    announcementHandler(agentC)
  );
}

/**
 * Send direct messages between agents
 *
 * @param agentA The first agent
 * @param agentB The second agent
 * @param agentC The third agent
 */
async function sendDirectMessages(
  agentA: EchoAgent & { mailbox: DefaultAgentMailbox },
  agentB: EchoAgent & { mailbox: DefaultAgentMailbox },
  agentC: EchoAgent & { mailbox: DefaultAgentMailbox }
) {
  console.log('\n📨 Sending direct messages...');

  // Agent A sends a task to Agent B
  const taskMessageId = await agentA.mailbox.sendMessage(
    [agentB.id],
    { taskName: 'process-data', priority: 'high' },
    { type: 'task', conversationId: 'conversation-1' }
  );

  console.log(`Sent task message: ${taskMessageId}`);

  // Agent B sends a message to both A and C
  const broadcastMessageId = await agentB.mailbox.sendMessage(
    [agentA.id, agentC.id],
    'Hello from Agent B!',
    { conversationId: 'conversation-1' }
  );

  console.log(`Sent broadcast message: ${broadcastMessageId}`);

  // Wait for message processing
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Broadcast messages to topics
 *
 * @param agentA The first agent
 * @param agentB The second agent
 */
async function broadcastMessages(
  agentA: EchoAgent & { mailbox: DefaultAgentMailbox },
  agentB: EchoAgent & { mailbox: DefaultAgentMailbox }
) {
  console.log('\n📢 Broadcasting messages...');

  // Agent A broadcasts an announcement
  const announcementId = await agentA.mailbox.broadcastMessage(
    'announcements',
    'Important system update scheduled for tomorrow',
    { type: 'announcement', priority: 1 }
  );

  console.log(`Sent announcement: ${announcementId}`);

  // Agent B broadcasts a data processing request
  const dataProcessingId = await agentB.mailbox.broadcastMessage(
    'data-processing',
    { operation: 'aggregate', dataset: 'sales-2023' },
    { type: 'data-request' }
  );

  console.log(`Sent data processing request: ${dataProcessingId}`);

  // Wait for message processing
  await new Promise((resolve) => setTimeout(resolve, 100));
}

/**
 * Query messages
 *
 * @param agentC The agent to query messages
 */
async function queryMessages(
  agentC: EchoAgent & { mailbox: DefaultAgentMailbox }
) {
  console.log('\n🔍 Querying messages...');

  // Query all messages for Agent C
  const allMessages = await agentC.mailbox.queryMessages();
  console.log(`Agent C has ${allMessages.length} messages total`);

  // Query unread messages
  const unreadMessages = await agentC.mailbox.queryMessages({
    status: MessageStatus.SENT,
  });
  console.log(`Agent C has ${unreadMessages.length} unread messages`);

  // Query messages in a specific conversation
  const conversationMessages = await agentC.mailbox.queryMessages({
    conversationId: 'conversation-1',
  });
  console.log(
    `Agent C has ${conversationMessages.length} messages in conversation-1`
  );

  // Query messages from a specific sender
  const messagesFromB = await agentC.mailbox.queryMessages({
    senderId: 'agent-b',
  });
  console.log(`Agent C has ${messagesFromB.length} messages from Agent B`);
}

// Run the example if this file is executed directly
if (require.main === module) {
  runMessagingExample().catch(console.error);
}

export { runMessagingExample };

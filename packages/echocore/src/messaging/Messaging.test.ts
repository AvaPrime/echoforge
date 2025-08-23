/**
 * Messaging System Tests
 *
 * Tests for the Agent-to-Agent Messaging system, including MessageBroker,
 * AgentMailbox, and MessageStore implementations.
 */

import { describe, it, expect, beforeEach, afterEach, test } from 'vitest';
import { DefaultMessageBroker } from './MessageBroker';
import { DefaultAgentMailbox } from './AgentMailbox';
import { InMemoryMessageStore } from './InMemoryMessageStore';
import { Message, MessageStatus } from './MessageContract';

describe('Messaging System', () => {
  let messageStore: InMemoryMessageStore;
  let messageBroker: DefaultMessageBroker;
  let mailboxA: DefaultAgentMailbox;
  let mailboxB: DefaultAgentMailbox;
  let mailboxC: DefaultAgentMailbox;

  beforeEach(() => {
    messageStore = new InMemoryMessageStore();
    messageBroker = new DefaultMessageBroker(messageStore);
    mailboxA = new DefaultAgentMailbox('agent-a', messageBroker);
    mailboxB = new DefaultAgentMailbox('agent-b', messageBroker);
    mailboxC = new DefaultAgentMailbox('agent-c', messageBroker);
  });

  afterEach(() => {
    mailboxA.close();
    mailboxB.close();
    mailboxC.close();
  });

  describe('Direct Messaging', () => {
    test('should send a message to a specific recipient', async () => {
      // Set up a message handler for mailbox B
      const receivedMessages: Message[] = [];
      const unsubscribe = mailboxB.onMessage((message) => {
        receivedMessages.push(message);
      });

      // Send a message from A to B
      const messageId = await mailboxA.sendMessage(
        ['agent-b'],
        { text: 'Hello from A' },
        { type: 'greeting' }
      );

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify the message was received
      expect(receivedMessages.length).toBe(1);
      expect(receivedMessages[0].id).toBe(messageId);
      expect(receivedMessages[0].senderId).toBe('agent-a');
      expect(receivedMessages[0].recipientIds).toContain('agent-b');
      expect(receivedMessages[0].content).toEqual({ text: 'Hello from A' });
      expect(receivedMessages[0].type).toBe('greeting');

      // Clean up
      unsubscribe();
    });

    test('should send a message to multiple recipients', async () => {
      // Set up message handlers
      const messagesB: Message[] = [];
      const messagesC: Message[] = [];

      const unsubscribeB = mailboxB.onMessage((message) => {
        messagesB.push(message);
      });

      const unsubscribeC = mailboxC.onMessage((message) => {
        messagesC.push(message);
      });

      // Send a message from A to B and C
      const messageId = await mailboxA.sendMessage(
        ['agent-b', 'agent-c'],
        'Broadcast message',
        { conversationId: 'test-conversation' }
      );

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify both recipients received the message
      expect(messagesB.length).toBe(1);
      expect(messagesC.length).toBe(1);
      expect(messagesB[0].id).toBe(messageId);
      expect(messagesC[0].id).toBe(messageId);
      expect(messagesB[0].conversationId).toBe('test-conversation');
      expect(messagesC[0].conversationId).toBe('test-conversation');

      // Clean up
      unsubscribeB();
      unsubscribeC();
    });
  });

  describe('Topic Subscriptions', () => {
    test('should broadcast a message to all topic subscribers', async () => {
      // Subscribe to topics
      const topicMessagesB: Message[] = [];
      const topicMessagesC: Message[] = [];

      mailboxB.subscribeTopic('test-topic', (message) => {
        topicMessagesB.push(message);
      });

      mailboxC.subscribeTopic('test-topic', (message) => {
        topicMessagesC.push(message);
      });

      // Broadcast a message
      const messageId = await mailboxA.broadcastMessage(
        'test-topic',
        { data: 'Important update' },
        { type: 'notification' }
      );

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify both subscribers received the message
      expect(topicMessagesB.length).toBe(1);
      expect(topicMessagesC.length).toBe(1);
      expect(topicMessagesB[0].id).toBe(messageId);
      expect(topicMessagesC[0].id).toBe(messageId);
      expect(topicMessagesB[0].topic).toBe('test-topic');
      expect(topicMessagesC[0].topic).toBe('test-topic');
    });

    test('should not receive messages after unsubscribing from a topic', async () => {
      // Subscribe to a topic
      const topicMessages: Message[] = [];
      mailboxB.subscribeTopic('test-topic', (message) => {
        topicMessages.push(message);
      });

      // Broadcast a message
      await mailboxA.broadcastMessage('test-topic', 'First message');

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify the message was received
      expect(topicMessages.length).toBe(1);

      // Unsubscribe from the topic
      mailboxB.unsubscribeTopic('test-topic');

      // Broadcast another message
      await mailboxA.broadcastMessage('test-topic', 'Second message');

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify no new message was received
      expect(topicMessages.length).toBe(1);
    });

    test('should get all topics an agent is subscribed to', async () => {
      // Subscribe to multiple topics
      mailboxA.subscribeTopic('topic1');
      mailboxA.subscribeTopic('topic2');
      mailboxA.subscribeTopic('topic3');

      // Get subscribed topics
      const topics = mailboxA.getSubscribedTopics();

      // Verify the topics
      expect(topics).toHaveLength(3);
      expect(topics).toContain('topic1');
      expect(topics).toContain('topic2');
      expect(topics).toContain('topic3');

      // Unsubscribe from a topic
      mailboxA.unsubscribeTopic('topic2');

      // Get subscribed topics again
      const updatedTopics = mailboxA.getSubscribedTopics();

      // Verify the topics
      expect(updatedTopics).toHaveLength(2);
      expect(updatedTopics).toContain('topic1');
      expect(updatedTopics).toContain('topic3');
      expect(updatedTopics).not.toContain('topic2');
    });
  });

  describe('Message Handlers', () => {
    test('should handle messages by type', async () => {
      // Set up a type-specific handler
      const taskMessages: Message[] = [];
      const unsubscribe = mailboxB.onMessageType('task', (message) => {
        taskMessages.push(message);
      });

      // Send messages of different types
      await mailboxA.sendMessage(['agent-b'], 'Task 1', { type: 'task' });
      await mailboxA.sendMessage(['agent-b'], 'Alert', { type: 'alert' });
      await mailboxA.sendMessage(['agent-b'], 'Task 2', { type: 'task' });

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify only task messages were handled
      expect(taskMessages.length).toBe(2);
      expect(taskMessages[0].content).toBe('Task 1');
      expect(taskMessages[1].content).toBe('Task 2');

      // Clean up
      unsubscribe();
    });

    test('should handle messages by conversation', async () => {
      // Set up a conversation-specific handler
      const conversationMessages: Message[] = [];
      const unsubscribe = mailboxC.onConversation('convo-123', (message) => {
        conversationMessages.push(message);
      });

      // Send messages in different conversations
      await mailboxA.sendMessage(['agent-c'], 'Message 1', {
        conversationId: 'convo-123',
      });
      await mailboxA.sendMessage(['agent-c'], 'Message 2', {
        conversationId: 'convo-456',
      });
      await mailboxB.sendMessage(['agent-c'], 'Message 3', {
        conversationId: 'convo-123',
      });

      // Wait for message processing
      await new Promise((resolve) => setTimeout(resolve, 50));

      // Verify only messages in the specific conversation were handled
      expect(conversationMessages.length).toBe(2);
      expect(conversationMessages[0].content).toBe('Message 1');
      expect(conversationMessages[1].content).toBe('Message 3');

      // Clean up
      unsubscribe();
    });
  });

  describe('Message Store', () => {
    test('should store and retrieve messages', async () => {
      // Send a message
      const messageId = await mailboxA.sendMessage(
        ['agent-b'],
        { text: 'Test message' },
        { type: 'test' }
      );

      // Retrieve the message from the store
      const message = await messageStore.getMessage(messageId);

      // Verify the message
      expect(message).not.toBeNull();
      expect(message!.id).toBe(messageId);
      expect(message!.senderId).toBe('agent-a');
      expect(message!.recipientIds).toContain('agent-b');
      expect(message!.content).toEqual({ text: 'Test message' });
      expect(message!.type).toBe('test');
    });

    test('should update message status', async () => {
      // Send a message
      const messageId = await mailboxA.sendMessage(['agent-b'], 'Status test');

      // Mark as read
      await mailboxB.markAsRead(messageId);

      // Verify status
      const message = await messageStore.getMessage(messageId);
      expect(message!.status).toBe(MessageStatus.READ);

      // Mark as processed
      await mailboxB.markAsProcessed(messageId);

      // Verify status
      const updatedMessage = await messageStore.getMessage(messageId);
      expect(updatedMessage!.status).toBe(MessageStatus.PROCESSED);
    });

    test('should query messages with filters', async () => {
      // Send various messages
      await mailboxA.sendMessage(['agent-b'], 'Message 1', { type: 'info' });
      await mailboxA.sendMessage(['agent-c'], 'Message 2', { type: 'info' });
      await mailboxB.sendMessage(['agent-a'], 'Message 3', {
        type: 'response',
      });
      await mailboxB.sendMessage(['agent-c'], 'Message 4', { type: 'info' });
      await mailboxC.sendMessage(['agent-a'], 'Message 5', { type: 'alert' });

      // Query by sender
      const messagesFromA = await mailboxB.queryMessages({
        senderId: 'agent-a',
      });
      expect(messagesFromA.length).toBe(1);
      expect(messagesFromA[0].content).toBe('Message 1');

      // Query by type
      const infoMessages = await mailboxC.queryMessages({ type: 'info' });
      expect(infoMessages.length).toBe(2);

      // Query by date range
      const now = new Date();
      const pastDate = new Date(now.getTime() - 1000 * 60 * 60); // 1 hour ago
      const futureDate = new Date(now.getTime() + 1000 * 60 * 60); // 1 hour from now

      const recentMessages = await mailboxA.queryMessages({
        fromDate: pastDate,
        toDate: futureDate,
      });

      expect(recentMessages.length).toBe(2); // Messages sent to agent-a
    });
  });
});

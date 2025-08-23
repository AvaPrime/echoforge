/**
 * Message Broker Implementation
 *
 * Provides a central message broker for agent-to-agent communication
 * with support for direct messaging, broadcasting, and subscription patterns.
 */

import { EventEmitter } from 'events';
import {
  Message,
  MessageBroker,
  MessageDeliveryOptions,
  MessageStatus,
  MessageStore,
} from './MessageContract';
import { v4 as uuidv4 } from 'uuid';

/**
 * Default implementation of the MessageBroker interface
 */
export class DefaultMessageBroker implements MessageBroker {
  // Added event types for better type safety
  private static readonly MESSAGE_EVENT = 'message:';
  private static readonly TOPIC_EVENT = 'topic:';
  private static readonly TOPIC_AGENT_EVENT = 'topic:%s:%s'; // topic:topicName:agentId

  // Use these constants in the code for consistency
  private getMessageEventName(agentId: string): string {
    return `${DefaultMessageBroker.MESSAGE_EVENT}${agentId}`;
  }

  private getTopicEventName(topic: string): string {
    return `${DefaultMessageBroker.TOPIC_EVENT}${topic}`;
  }

  private getTopicAgentEventName(topic: string, agentId: string): string {
    return `${DefaultMessageBroker.TOPIC_EVENT}${topic}:${agentId}`;
  }
  private eventEmitter: EventEmitter;
  private messageStore: MessageStore | null;
  private subscriptions: Map<string, Set<string>> = new Map();
  private agentSubscriptions: Map<string, Set<string>> = new Map();

  /**
   * Create a new DefaultMessageBroker
   *
   * @param messageStore Optional message store for persistence
   */
  constructor(messageStore: MessageStore | null = null) {
    this.eventEmitter = new EventEmitter();
    this.messageStore = messageStore;

    // Set a higher limit for message listeners
    this.eventEmitter.setMaxListeners(100);
  }

  /**
   * Send a message to specific recipients
   *
   * @param message The message to send
   * @param options Delivery options
   */
  async sendMessage(
    message: Message,
    options: MessageDeliveryOptions = {}
  ): Promise<string> {
    // Ensure the message has an ID
    if (!message.id) {
      message.id = uuidv4();
    }

    // Ensure createdAt is set
    if (!message.createdAt) {
      message.createdAt = new Date();
    }

    // Set initial status
    message.status = MessageStatus.SENT;

    // Store the message if a store is available
    if (this.messageStore) {
      await this.messageStore.saveMessage(message);
    }

    // Emit the message to each recipient
    for (const recipientId of message.recipientIds) {
      this.eventEmitter.emit(this.getMessageEventName(recipientId), message);

      // Also emit to any topic subscriptions that match
      if (message.topic && this.subscriptions.has(message.topic)) {
        const subscribers = this.subscriptions.get(message.topic);
        if (subscribers?.has(recipientId)) {
          this.eventEmitter.emit(
            this.getTopicAgentEventName(message.topic, recipientId),
            message
          );
        }
      }
    }

    return message.id;
  }

  /**
   * Broadcast a message to all subscribers of a topic
   *
   * @param message The message to broadcast
   * @param options Delivery options
   */
  async broadcastMessage(
    message: Message,
    options: MessageDeliveryOptions = {}
  ): Promise<string> {
    // Ensure the message has an ID
    if (!message.id) {
      message.id = uuidv4();
    }

    // Ensure createdAt is set
    if (!message.createdAt) {
      message.createdAt = new Date();
    }

    // Set initial status
    message.status = MessageStatus.SENT;

    // Ensure topic is set
    if (!message.topic) {
      throw new Error('Cannot broadcast a message without a topic');
    }

    // Get all subscribers for this topic
    const subscribers =
      this.subscriptions.get(message.topic) || new Set<string>();

    // Update the recipient IDs to include all subscribers
    message.recipientIds = Array.from(subscribers);

    // If there are no subscribers, just store the message
    if (message.recipientIds.length === 0) {
      if (this.messageStore) {
        await this.messageStore.saveMessage(message);
      }
      return message.id;
    }

    // Store the message if a store is available
    if (this.messageStore) {
      await this.messageStore.saveMessage(message);
    }

    // Emit the message to the topic
    this.eventEmitter.emit(this.getTopicEventName(message.topic), message);

    // Also emit to each recipient individually
    for (const recipientId of message.recipientIds) {
      this.eventEmitter.emit(this.getMessageEventName(recipientId), message);
      this.eventEmitter.emit(
        this.getTopicAgentEventName(message.topic, recipientId),
        message
      );
    }

    return message.id;
  }

  /**
   * Subscribe an agent to a topic
   *
   * @param agentId The ID of the agent subscribing
   * @param topic The topic to subscribe to
   */
  subscribeTopic(agentId: string, topic: string): void {
    // Create the topic subscription set if it doesn't exist
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(topic, new Set<string>());
    }

    // Add the agent to the topic subscribers
    this.subscriptions.get(topic)!.add(agentId);

    // Track the agent's subscriptions
    if (!this.agentSubscriptions.has(agentId)) {
      this.agentSubscriptions.set(agentId, new Set<string>());
    }
    this.agentSubscriptions.get(agentId)!.add(topic);
  }

  /**
   * Unsubscribe an agent from a topic
   *
   * @param agentId The ID of the agent unsubscribing
   * @param topic The topic to unsubscribe from
   */
  unsubscribeTopic(agentId: string, topic: string): void {
    // Remove the agent from the topic subscribers
    if (this.subscriptions.has(topic)) {
      this.subscriptions.get(topic)!.delete(agentId);

      // Clean up empty topic subscriptions
      if (this.subscriptions.get(topic)!.size === 0) {
        this.subscriptions.delete(topic);
      }
    }

    // Remove the topic from the agent's subscriptions
    if (this.agentSubscriptions.has(agentId)) {
      this.agentSubscriptions.get(agentId)!.delete(topic);

      // Clean up empty agent subscriptions
      if (this.agentSubscriptions.get(agentId)!.size === 0) {
        this.agentSubscriptions.delete(agentId);
      }
    }
  }

  /**
   * Get all topics an agent is subscribed to
   *
   * @param agentId The ID of the agent
   */
  getAgentSubscriptions(agentId: string): string[] {
    return Array.from(this.agentSubscriptions.get(agentId) || []);
  }

  /**
   * Get all agents subscribed to a topic
   *
   * @param topic The topic
   */
  getTopicSubscribers(topic: string): string[] {
    return Array.from(this.subscriptions.get(topic) || []);
  }

  /**
   * Register a message handler for an agent
   *
   * @param agentId The ID of the agent
   * @param handler The message handler function
   */
  registerMessageHandler(
    agentId: string,
    handler: (message: Message) => void
  ): () => void {
    const messageHandler = (message: Message) => {
      handler(message);
    };

    // Listen for direct messages to this agent
    const eventName = this.getMessageEventName(agentId);
    this.eventEmitter.on(eventName, messageHandler);

    // Return an unsubscribe function
    return () => {
      this.eventEmitter.off(eventName, messageHandler);
    };
  }

  /**
   * Register a topic handler for an agent
   *
   * @param agentId The ID of the agent
   * @param topic The topic to handle
   * @param handler The message handler function
   */
  registerTopicHandler(
    agentId: string,
    topic: string,
    handler: (message: Message) => void
  ): () => void {
    // Subscribe the agent to the topic
    this.subscribeTopic(agentId, topic);

    const topicHandler = (message: Message) => {
      handler(message);
    };

    // Listen for messages on this topic for this agent
    const eventName = this.getTopicAgentEventName(topic, agentId);
    this.eventEmitter.on(eventName, topicHandler);

    // Return an unsubscribe function
    return () => {
      this.unsubscribeTopic(agentId, topic);
      this.eventEmitter.off(eventName, topicHandler);
    };
  }

  /**
   * Update the status of a message
   *
   * @param messageId The ID of the message
   * @param status The new status
   */
  async updateMessageStatus(
    messageId: string,
    status: MessageStatus
  ): Promise<void> {
    if (!this.messageStore) {
      throw new Error('Cannot update message status without a message store');
    }

    const message = await this.messageStore.getMessage(messageId);
    if (!message) {
      throw new Error(`Message with ID ${messageId} not found`);
    }

    message.status = status;
    await this.messageStore.updateMessage(messageId, { status });
  }

  /**
   * Get the status of a message
   *
   * @param messageId The ID of the message
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus | null> {
    if (!this.messageStore) {
      throw new Error('Cannot get message status without a message store');
    }

    const message = await this.messageStore.getMessage(messageId);
    return message ? message.status || null : null;
  }

  /**
   * Acknowledge receipt of a message
   *
   * @param messageId The ID of the message
   */
  async acknowledgeMessage(messageId: string): Promise<void> {
    return this.updateMessageStatus(messageId, MessageStatus.DELIVERED);
  }

  /**
   * Get a message by ID
   *
   * @param messageId The ID of the message
   */
  async getMessage(messageId: string): Promise<Message | null> {
    if (!this.messageStore) {
      throw new Error('Cannot get message without a message store');
    }

    return this.messageStore.getMessage(messageId);
  }

  /**
   * Query messages based on criteria
   *
   * @param query Query parameters
   */
  async queryMessages(query: {
    senderId?: string;
    recipientId?: string;
    topic?: string;
    status?: MessageStatus;
    conversationId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Message[]> {
    if (!this.messageStore) {
      throw new Error('Cannot query messages without a message store');
    }

    return this.messageStore.queryMessages(query);
  }
}

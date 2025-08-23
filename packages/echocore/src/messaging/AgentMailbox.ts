/**
 * Agent Mailbox Implementation
 *
 * Provides a mailbox interface for agents to send and receive messages
 * with support for direct messaging, topic subscriptions, and message querying.
 */

import { EventEmitter } from 'events';
import {
  AgentMailbox,
  Message,
  MessageBroker,
  MessageDeliveryOptions,
  MessageStatus,
} from './MessageContract';
import { v4 as uuidv4 } from 'uuid';

/**
 * Default implementation of the AgentMailbox interface
 */
export class DefaultAgentMailbox implements AgentMailbox {
  private agentId: string;
  private broker: MessageBroker;
  private eventEmitter: EventEmitter;
  private messageHandlerUnsubscribe: (() => void) | null = null;
  private topicHandlers: Map<string, () => void> = new Map();

  /**
   * Create a new DefaultAgentMailbox
   *
   * @param agentId The ID of the agent this mailbox belongs to
   * @param broker The message broker to use
   */
  constructor(agentId: string, broker: MessageBroker) {
    this.agentId = agentId;
    this.broker = broker;
    this.eventEmitter = new EventEmitter();

    // Set a higher limit for message listeners
    this.eventEmitter.setMaxListeners(100);

    // Register with the broker to receive messages
    this.messageHandlerUnsubscribe = this.broker.registerMessageHandler(
      this.agentId,
      this.handleIncomingMessage.bind(this)
    );
  }

  /**
   * Handle an incoming message
   *
   * @param message The incoming message
   */
  private handleIncomingMessage(message: Message): void {
    // Emit the message to all listeners
    this.eventEmitter.emit('message', message);

    // Emit the message to topic-specific listeners
    if (message.topic) {
      this.eventEmitter.emit(`topic:${message.topic}`, message);
    }

    // Emit the message to type-specific listeners
    if (message.type) {
      this.eventEmitter.emit(`type:${message.type}`, message);
    }

    // Emit the message to conversation-specific listeners
    if (message.conversationId) {
      this.eventEmitter.emit(`conversation:${message.conversationId}`, message);
    }
  }

  /**
   * Send a message to specific recipients
   *
   * @param recipients The recipient agent IDs
   * @param content The message content
   * @param options Additional message options
   */
  async sendMessage(
    recipients: string[],
    content: any,
    options: {
      type?: string;
      topic?: string;
      conversationId?: string;
      priority?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const message: Message = {
      id: uuidv4(),
      senderId: this.agentId,
      recipientIds: [...recipients],
      content,
      createdAt: new Date(),
      status: MessageStatus.PENDING,
      ...options,
    };

    return this.broker.sendMessage(message);
  }

  /**
   * Broadcast a message to all subscribers of a topic
   *
   * @param topic The topic to broadcast to
   * @param content The message content
   * @param options Additional message options
   */
  async broadcastMessage(
    topic: string,
    content: any,
    options: {
      type?: string;
      conversationId?: string;
      priority?: number;
      metadata?: Record<string, any>;
    } = {}
  ): Promise<string> {
    const message: Message = {
      id: uuidv4(),
      senderId: this.agentId,
      recipientIds: [], // Will be filled by the broker
      topic, // Ensure topic is explicitly set and not overridden by options spread
      content,
      createdAt: new Date(),
      status: MessageStatus.PENDING,
      ...options,
    };

    // Make sure topic wasn't overridden by options spread
    if (!message.topic) {
      message.topic = topic;
    }

    return this.broker.broadcastMessage(message);
  }

  /**
   * Subscribe to a topic
   *
   * @param topic The topic to subscribe to
   * @param handler The message handler function
   */
  subscribeTopic(topic: string, handler?: (message: Message) => void): void {
    // Subscribe to the topic at the broker level
    if (this.topicHandlers.has(topic)) {
      // Already subscribed, just update the handler if provided
      if (handler) {
        this.eventEmitter.off(`topic:${topic}`, this.topicHandlers.get(topic)!);
        this.eventEmitter.on(`topic:${topic}`, handler);
      }
      return;
    }

    // Register with the broker
    const unsubscribe = this.broker.registerTopicHandler(
      this.agentId,
      topic,
      (message: Message) => {
        // The broker will call handleIncomingMessage, which will emit the topic event
      }
    );

    // Store the unsubscribe function
    this.topicHandlers.set(topic, unsubscribe);

    // Register the handler if provided
    if (handler) {
      this.eventEmitter.on(`topic:${topic}`, handler);
    }
  }

  /**
   * Unsubscribe from a topic
   *
   * @param topic The topic to unsubscribe from
   */
  unsubscribeTopic(topic: string): void {
    if (this.topicHandlers.has(topic)) {
      // Call the unsubscribe function
      this.topicHandlers.get(topic)!();
      this.topicHandlers.delete(topic);

      // Remove all listeners for this topic
      this.eventEmitter.removeAllListeners(`topic:${topic}`);
    }
  }

  /**
   * Get all topics this agent is subscribed to
   */
  getSubscribedTopics(): string[] {
    return this.broker.getAgentSubscriptions(this.agentId);
  }

  /**
   * Register a handler for all incoming messages
   *
   * @param handler The message handler function
   */
  onMessage(handler: (message: Message) => void): () => void {
    this.eventEmitter.on('message', handler);
    return () => {
      this.eventEmitter.off('message', handler);
    };
  }

  /**
   * Register a handler for messages of a specific type
   *
   * @param type The message type
   * @param handler The message handler function
   */
  onMessageType(type: string, handler: (message: Message) => void): () => void {
    this.eventEmitter.on(`type:${type}`, handler);
    return () => {
      this.eventEmitter.off(`type:${type}`, handler);
    };
  }

  /**
   * Register a handler for messages in a specific conversation
   *
   * @param conversationId The conversation ID
   * @param handler The message handler function
   */
  onConversation(
    conversationId: string,
    handler: (message: Message) => void
  ): () => void {
    this.eventEmitter.on(`conversation:${conversationId}`, handler);
    return () => {
      this.eventEmitter.off(`conversation:${conversationId}`, handler);
    };
  }

  /**
   * Query messages based on criteria
   *
   * @param query Query parameters
   */
  async queryMessages(
    query: {
      senderId?: string;
      topic?: string;
      type?: string;
      status?: MessageStatus;
      conversationId?: string;
      fromDate?: Date;
      toDate?: Date;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Message[]> {
    // Add this agent as the recipient
    return this.broker.queryMessages({
      ...query,
      recipientId: this.agentId,
    });
  }

  /**
   * Get a message by ID
   *
   * @param messageId The ID of the message
   */
  async getMessage(messageId: string): Promise<Message | null> {
    return this.broker.getMessage(messageId);
  }

  /**
   * Mark a message as read
   *
   * @param messageId The ID of the message
   */
  async markAsRead(messageId: string): Promise<void> {
    return this.broker.updateMessageStatus(messageId, MessageStatus.READ);
  }

  /**
   * Mark a message as processed
   *
   * @param messageId The ID of the message
   */
  async markAsProcessed(messageId: string): Promise<void> {
    return this.broker.updateMessageStatus(messageId, MessageStatus.PROCESSED);
  }

  /**
   * Close the mailbox and unsubscribe from all topics
   */
  close(): void {
    // Unsubscribe from direct messages
    if (this.messageHandlerUnsubscribe) {
      this.messageHandlerUnsubscribe();
      this.messageHandlerUnsubscribe = null;
    }

    // Unsubscribe from all topics
    for (const topic of this.topicHandlers.keys()) {
      this.unsubscribeTopic(topic);
    }

    // Remove all listeners
    this.eventEmitter.removeAllListeners();
  }
}

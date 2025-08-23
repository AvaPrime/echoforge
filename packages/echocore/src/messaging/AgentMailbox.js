/**
 * Agent Mailbox Implementation
 *
 * Provides a mailbox interface for agents to send and receive messages
 * with support for direct messaging, topic subscriptions, and message querying.
 */
import { EventEmitter } from 'events';
import { MessageStatus } from './MessageContract';
import { v4 as uuidv4 } from 'uuid';
/**
 * Default implementation of the AgentMailbox interface
 */
export class DefaultAgentMailbox {
  agentId;
  broker;
  eventEmitter;
  messageHandlerUnsubscribe = null;
  topicHandlers = new Map();
  /**
   * Create a new DefaultAgentMailbox
   *
   * @param agentId The ID of the agent this mailbox belongs to
   * @param broker The message broker to use
   */
  constructor(agentId, broker) {
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
  handleIncomingMessage(message) {
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
  async sendMessage(recipients, content, options = {}) {
    const message = {
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
  async broadcastMessage(topic, content, options = {}) {
    const message = {
      id: uuidv4(),
      senderId: this.agentId,
      recipientIds: [], // Will be filled by the broker
      topic,
      content,
      createdAt: new Date(),
      status: MessageStatus.PENDING,
      ...options,
    };
    return this.broker.broadcastMessage(message);
  }
  /**
   * Subscribe to a topic
   *
   * @param topic The topic to subscribe to
   * @param handler The message handler function
   */
  subscribeTopic(topic, handler) {
    // Subscribe to the topic at the broker level
    if (this.topicHandlers.has(topic)) {
      // Already subscribed, just update the handler if provided
      if (handler) {
        this.eventEmitter.off(`topic:${topic}`, this.topicHandlers.get(topic));
        this.eventEmitter.on(`topic:${topic}`, handler);
      }
      return;
    }
    // Register with the broker
    const unsubscribe = this.broker.registerTopicHandler(
      this.agentId,
      topic,
      (message) => {
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
  unsubscribeTopic(topic) {
    if (this.topicHandlers.has(topic)) {
      // Call the unsubscribe function
      this.topicHandlers.get(topic)();
      this.topicHandlers.delete(topic);
      // Remove all listeners for this topic
      this.eventEmitter.removeAllListeners(`topic:${topic}`);
    }
  }
  /**
   * Get all topics this agent is subscribed to
   */
  getSubscribedTopics() {
    return this.broker.getAgentSubscriptions(this.agentId);
  }
  /**
   * Register a handler for all incoming messages
   *
   * @param handler The message handler function
   */
  onMessage(handler) {
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
  onMessageType(type, handler) {
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
  onConversation(conversationId, handler) {
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
  async queryMessages(query = {}) {
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
  async getMessage(messageId) {
    return this.broker.getMessage(messageId);
  }
  /**
   * Mark a message as read
   *
   * @param messageId The ID of the message
   */
  async markAsRead(messageId) {
    return this.broker.updateMessageStatus(messageId, MessageStatus.READ);
  }
  /**
   * Mark a message as processed
   *
   * @param messageId The ID of the message
   */
  async markAsProcessed(messageId) {
    return this.broker.updateMessageStatus(messageId, MessageStatus.PROCESSED);
  }
  /**
   * Close the mailbox and unsubscribe from all topics
   */
  close() {
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
//# sourceMappingURL=AgentMailbox.js.map

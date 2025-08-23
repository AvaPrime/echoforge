/**
 * In-Memory Messaging Implementation
 *
 * Provides in-memory implementations of the MessageBroker and AgentMailbox
 * interfaces for agent-to-agent communication.
 */

import { v4 as uuidv4 } from 'uuid';
import { EventEmitter } from '@echoforge/forgekit';
import {
  Message,
  MessageBroker,
  MessageStatus,
  AgentMailbox,
  MessageStore,
} from './MessageContract';

/**
 * In-memory implementation of the MessageBroker interface
 */
export class InMemoryMessageBroker implements MessageBroker {
  private mailboxes: Map<string, InMemoryAgentMailbox>;
  private subscriptions: Map<string, Map<string, (message: Message) => void>>;
  private events: EventEmitter;
  private messageStore: MessageStore | null;

  /**
   * Create a new InMemoryMessageBroker
   *
   * @param messageStore Optional message store for persistence
   */
  constructor(messageStore: MessageStore | null = null) {
    this.mailboxes = new Map<string, InMemoryAgentMailbox>();
    this.subscriptions = new Map<
      string,
      Map<string, (message: Message) => void>
    >();
    this.events = new EventEmitter();
    this.messageStore = messageStore;
  }

  /**
   * Register a mailbox with the broker
   *
   * @param agentId The ID of the agent
   * @param mailbox The mailbox to register
   */
  registerMailbox(agentId: string, mailbox: InMemoryAgentMailbox): void {
    this.mailboxes.set(agentId, mailbox);
  }

  /**
   * Unregister a mailbox from the broker
   *
   * @param agentId The ID of the agent
   */
  unregisterMailbox(agentId: string): void {
    this.mailboxes.delete(agentId);
  }

  /**
   * Send a message to one or more recipients
   *
   * @param message The message to send
   * @returns Promise resolving to the sent message with updated status
   */
  async send(message: Message): Promise<Message> {
    // Ensure the message has an ID
    if (!message.id) {
      message.id = uuidv4();
    }

    // Set creation timestamp if not provided
    if (!message.createdAt) {
      message.createdAt = new Date();
    }

    // Set initial status
    message.status = MessageStatus.PENDING;

    // Store the message if a message store is provided
    if (this.messageStore && message.deliveryOptions?.persist) {
      await this.messageStore.saveMessage(message);
    }

    // If no recipients are specified, broadcast to all mailboxes
    if (!message.recipientIds || message.recipientIds.length === 0) {
      return this.broadcast('all', message);
    }

    // Deliver the message to each recipient
    const deliveryPromises = message.recipientIds.map(async (recipientId) => {
      const mailbox = this.mailboxes.get(recipientId);
      if (mailbox) {
        await mailbox.addMessage(message);
        return true;
      }
      return false;
    });

    // Wait for all deliveries to complete
    const deliveryResults = await Promise.all(deliveryPromises);
    const allDelivered = deliveryResults.every((result) => result);

    // Update message status based on delivery results
    if (allDelivered) {
      message.status = MessageStatus.DELIVERED;
    } else {
      message.status = MessageStatus.FAILED;
    }

    // Update the message in the store if it was persisted
    if (this.messageStore && message.deliveryOptions?.persist) {
      await this.messageStore.updateMessage(message.id, {
        status: message.status,
      });
    }

    // Emit message sent event
    this.events.emit('message:sent', message);

    return message;
  }

  /**
   * Broadcast a message to all subscribers of a topic
   *
   * @param topic The topic to broadcast to
   * @param message The message to broadcast
   * @returns Promise resolving to the sent message with updated status
   */
  async broadcast(topic: string, message: Message): Promise<Message> {
    // Ensure the message has an ID
    if (!message.id) {
      message.id = uuidv4();
    }

    // Set creation timestamp if not provided
    if (!message.createdAt) {
      message.createdAt = new Date();
    }

    // Set initial status
    message.status = MessageStatus.PENDING;

    // Store the message if a message store is provided
    if (this.messageStore && message.deliveryOptions?.persist) {
      await this.messageStore.saveMessage(message);
    }

    // Get subscribers for the topic
    const topicSubscribers = this.subscriptions.get(topic);
    if (topicSubscribers && topicSubscribers.size > 0) {
      // Notify all subscribers
      for (const callback of topicSubscribers.values()) {
        try {
          callback(message);
        } catch (error) {
          console.error(
            `Error notifying subscriber for topic ${topic}:`,
            error
          );
        }
      }
      message.status = MessageStatus.DELIVERED;
    } else {
      // No subscribers for this topic
      message.status = MessageStatus.PENDING;
    }

    // Update the message in the store if it was persisted
    if (this.messageStore && message.deliveryOptions?.persist) {
      await this.messageStore.updateMessage(message.id, {
        status: message.status,
      });
    }

    // Emit message broadcast event
    this.events.emit('message:broadcast', { topic, message });

    return message;
  }

  /**
   * Subscribe to messages on a topic
   *
   * @param topic The topic to subscribe to
   * @param callback Function to call when a message is received
   * @returns Subscription ID that can be used to unsubscribe
   */
  subscribe(topic: string, callback: (message: Message) => void): string {
    // Create topic if it doesn't exist
    if (!this.subscriptions.has(topic)) {
      this.subscriptions.set(
        topic,
        new Map<string, (message: Message) => void>()
      );
    }

    // Generate subscription ID
    const subscriptionId = uuidv4();

    // Add subscription
    this.subscriptions.get(topic)!.set(subscriptionId, callback);

    // Emit subscription event
    this.events.emit('subscription:added', { topic, subscriptionId });

    return subscriptionId;
  }

  /**
   * Unsubscribe from a topic
   *
   * @param subscriptionId The subscription ID to unsubscribe
   */
  unsubscribe(subscriptionId: string): void {
    // Find the topic that contains this subscription
    for (const [topic, subscribers] of this.subscriptions.entries()) {
      if (subscribers.has(subscriptionId)) {
        subscribers.delete(subscriptionId);

        // Remove the topic if there are no more subscribers
        if (subscribers.size === 0) {
          this.subscriptions.delete(topic);
        }

        // Emit unsubscription event
        this.events.emit('subscription:removed', { topic, subscriptionId });

        return;
      }
    }
  }

  /**
   * Get the status of a message
   *
   * @param messageId The ID of the message to check
   * @returns Promise resolving to the message status
   */
  async getMessageStatus(messageId: string): Promise<MessageStatus> {
    // Check if the message is in the store
    if (this.messageStore) {
      const message = await this.messageStore.getMessage(messageId);
      if (message) {
        return message.status || MessageStatus.PENDING;
      }
    }

    // If not found, return FAILED
    return MessageStatus.FAILED;
  }

  /**
   * Acknowledge receipt of a message
   *
   * @param messageId The ID of the message to acknowledge
   * @param status The new status of the message
   */
  async acknowledgeMessage(
    messageId: string,
    status: MessageStatus
  ): Promise<void> {
    // Update the message status in the store if available
    if (this.messageStore) {
      await this.messageStore.updateMessage(messageId, { status });
    }

    // Emit acknowledgment event
    this.events.emit('message:acknowledged', { messageId, status });
  }

  /**
   * Get the event emitter for this broker
   */
  getEvents(): EventEmitter {
    return this.events;
  }
}

/**
 * In-memory implementation of the AgentMailbox interface
 */
export class InMemoryAgentMailbox implements AgentMailbox {
  private agentId: string;
  private messages: Map<string, Message>;
  private broker: InMemoryMessageBroker;
  private newMessageHandlers: ((message: Message) => void)[];
  private statusChangeHandlers: ((
    messageId: string,
    status: MessageStatus
  ) => void)[];

  /**
   * Create a new InMemoryAgentMailbox
   *
   * @param agentId The ID of the agent
   * @param broker The message broker to use
   */
  constructor(agentId: string, broker: InMemoryMessageBroker) {
    this.agentId = agentId;
    this.messages = new Map<string, Message>();
    this.broker = broker;
    this.newMessageHandlers = [];
    this.statusChangeHandlers = [];

    // Register this mailbox with the broker
    this.broker.registerMailbox(agentId, this);
  }

  /**
   * Get the agent ID associated with this mailbox
   */
  getAgentId(): string {
    return this.agentId;
  }

  /**
   * Add a message to the mailbox
   *
   * @param message The message to add
   */
  async addMessage(message: Message): Promise<void> {
    // Store the message
    this.messages.set(message.id, message);

    // Notify handlers of the new message
    for (const handler of this.newMessageHandlers) {
      try {
        handler(message);
      } catch (error) {
        console.error(
          `Error notifying message handler for agent ${this.agentId}:`,
          error
        );
      }
    }
  }

  /**
   * Get all messages in the mailbox
   *
   * @param options Optional filtering options
   */
  async getMessages(options?: {
    status?: MessageStatus;
    type?: string;
    senderId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Message[]> {
    let messages = Array.from(this.messages.values());

    // Apply filters
    if (options) {
      if (options.status) {
        messages = messages.filter((msg) => msg.status === options.status);
      }

      if (options.type) {
        messages = messages.filter((msg) => msg.type === options.type);
      }

      if (options.senderId) {
        messages = messages.filter((msg) => msg.senderId === options.senderId);
      }

      // Sort by creation date (newest first)
      messages.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

      // Apply pagination
      if (options.offset !== undefined) {
        messages = messages.slice(options.offset);
      }

      if (options.limit !== undefined) {
        messages = messages.slice(0, options.limit);
      }
    }

    return messages;
  }

  /**
   * Get a specific message by ID
   *
   * @param messageId The ID of the message to get
   */
  async getMessage(messageId: string): Promise<Message | null> {
    const message = this.messages.get(messageId);
    return message || null;
  }

  /**
   * Update the status of a message
   *
   * @param messageId The ID of the message to update
   * @param status The new status of the message
   */
  async updateMessageStatus(
    messageId: string,
    status: MessageStatus
  ): Promise<void> {
    const message = this.messages.get(messageId);
    if (message) {
      const oldStatus = message.status;
      message.status = status;

      // Notify the broker of the status change
      await this.broker.acknowledgeMessage(messageId, status);

      // Notify status change handlers
      for (const handler of this.statusChangeHandlers) {
        try {
          handler(messageId, status);
        } catch (error) {
          console.error(
            `Error notifying status change handler for agent ${this.agentId}:`,
            error
          );
        }
      }
    }
  }

  /**
   * Delete a message from the mailbox
   *
   * @param messageId The ID of the message to delete
   */
  async deleteMessage(messageId: string): Promise<void> {
    this.messages.delete(messageId);
  }

  /**
   * Clear all messages from the mailbox
   *
   * @param options Optional filtering options
   */
  async clearMessages(options?: {
    status?: MessageStatus;
    olderThan?: Date;
  }): Promise<void> {
    if (!options) {
      // Clear all messages
      this.messages.clear();
      return;
    }

    // Apply filters
    for (const [id, message] of this.messages.entries()) {
      let shouldDelete = true;

      if (options.status && message.status !== options.status) {
        shouldDelete = false;
      }

      if (options.olderThan && message.createdAt >= options.olderThan) {
        shouldDelete = false;
      }

      if (shouldDelete) {
        this.messages.delete(id);
      }
    }
  }

  /**
   * Register a handler for new messages
   *
   * @param handler Function to call when a new message is received
   */
  onNewMessage(handler: (message: Message) => void): void {
    this.newMessageHandlers.push(handler);
  }

  /**
   * Register a handler for message status changes
   *
   * @param handler Function to call when a message status changes
   */
  onMessageStatusChange(
    handler: (messageId: string, status: MessageStatus) => void
  ): void {
    this.statusChangeHandlers.push(handler);
  }

  /**
   * Send a message to one or more recipients
   *
   * @param message The message to send
   * @returns Promise resolving to the sent message with updated status
   */
  async sendMessage(message: Message): Promise<Message> {
    // Set the sender ID to this agent's ID
    message.senderId = this.agentId;

    // Send the message via the broker
    return this.broker.send(message);
  }

  /**
   * Broadcast a message to all subscribers of a topic
   *
   * @param topic The topic to broadcast to
   * @param message The message to broadcast
   * @returns Promise resolving to the sent message with updated status
   */
  async broadcastMessage(topic: string, message: Message): Promise<Message> {
    // Set the sender ID to this agent's ID
    message.senderId = this.agentId;

    // Broadcast the message via the broker
    return this.broker.broadcast(topic, message);
  }

  /**
   * Subscribe to messages on a topic
   *
   * @param topic The topic to subscribe to
   * @param callback Function to call when a message is received
   * @returns Subscription ID that can be used to unsubscribe
   */
  subscribeToTopic(
    topic: string,
    callback: (message: Message) => void
  ): string {
    return this.broker.subscribe(topic, callback);
  }

  /**
   * Unsubscribe from a topic
   *
   * @param subscriptionId The subscription ID to unsubscribe
   */
  unsubscribeFromTopic(subscriptionId: string): void {
    this.broker.unsubscribe(subscriptionId);
  }

  /**
   * Dispose of this mailbox
   */
  dispose(): void {
    // Unregister from the broker
    this.broker.unregisterMailbox(this.agentId);

    // Clear all messages and handlers
    this.messages.clear();
    this.newMessageHandlers = [];
    this.statusChangeHandlers = [];
  }
}

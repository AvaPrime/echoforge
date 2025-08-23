/**
 * In-Memory Messaging Implementation
 *
 * Provides in-memory implementations of the MessageBroker and AgentMailbox
 * interfaces for agent-to-agent communication.
 */
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
export declare class InMemoryMessageBroker implements MessageBroker {
  private mailboxes;
  private subscriptions;
  private events;
  private messageStore;
  /**
   * Create a new InMemoryMessageBroker
   *
   * @param messageStore Optional message store for persistence
   */
  constructor(messageStore?: MessageStore | null);
  /**
   * Register a mailbox with the broker
   *
   * @param agentId The ID of the agent
   * @param mailbox The mailbox to register
   */
  registerMailbox(agentId: string, mailbox: InMemoryAgentMailbox): void;
  /**
   * Unregister a mailbox from the broker
   *
   * @param agentId The ID of the agent
   */
  unregisterMailbox(agentId: string): void;
  /**
   * Send a message to one or more recipients
   *
   * @param message The message to send
   * @returns Promise resolving to the sent message with updated status
   */
  send(message: Message): Promise<Message>;
  /**
   * Broadcast a message to all subscribers of a topic
   *
   * @param topic The topic to broadcast to
   * @param message The message to broadcast
   * @returns Promise resolving to the sent message with updated status
   */
  broadcast(topic: string, message: Message): Promise<Message>;
  /**
   * Subscribe to messages on a topic
   *
   * @param topic The topic to subscribe to
   * @param callback Function to call when a message is received
   * @returns Subscription ID that can be used to unsubscribe
   */
  subscribe(topic: string, callback: (message: Message) => void): string;
  /**
   * Unsubscribe from a topic
   *
   * @param subscriptionId The subscription ID to unsubscribe
   */
  unsubscribe(subscriptionId: string): void;
  /**
   * Get the status of a message
   *
   * @param messageId The ID of the message to check
   * @returns Promise resolving to the message status
   */
  getMessageStatus(messageId: string): Promise<MessageStatus>;
  /**
   * Acknowledge receipt of a message
   *
   * @param messageId The ID of the message to acknowledge
   * @param status The new status of the message
   */
  acknowledgeMessage(messageId: string, status: MessageStatus): Promise<void>;
  /**
   * Get the event emitter for this broker
   */
  getEvents(): EventEmitter;
}
/**
 * In-memory implementation of the AgentMailbox interface
 */
export declare class InMemoryAgentMailbox implements AgentMailbox {
  private agentId;
  private messages;
  private broker;
  private newMessageHandlers;
  private statusChangeHandlers;
  /**
   * Create a new InMemoryAgentMailbox
   *
   * @param agentId The ID of the agent
   * @param broker The message broker to use
   */
  constructor(agentId: string, broker: InMemoryMessageBroker);
  /**
   * Get the agent ID associated with this mailbox
   */
  getAgentId(): string;
  /**
   * Add a message to the mailbox
   *
   * @param message The message to add
   */
  addMessage(message: Message): Promise<void>;
  /**
   * Get all messages in the mailbox
   *
   * @param options Optional filtering options
   */
  getMessages(options?: {
    status?: MessageStatus;
    type?: string;
    senderId?: string;
    limit?: number;
    offset?: number;
  }): Promise<Message[]>;
  /**
   * Get a specific message by ID
   *
   * @param messageId The ID of the message to get
   */
  getMessage(messageId: string): Promise<Message | null>;
  /**
   * Update the status of a message
   *
   * @param messageId The ID of the message to update
   * @param status The new status of the message
   */
  updateMessageStatus(messageId: string, status: MessageStatus): Promise<void>;
  /**
   * Delete a message from the mailbox
   *
   * @param messageId The ID of the message to delete
   */
  deleteMessage(messageId: string): Promise<void>;
  /**
   * Clear all messages from the mailbox
   *
   * @param options Optional filtering options
   */
  clearMessages(options?: {
    status?: MessageStatus;
    olderThan?: Date;
  }): Promise<void>;
  /**
   * Register a handler for new messages
   *
   * @param handler Function to call when a new message is received
   */
  onNewMessage(handler: (message: Message) => void): void;
  /**
   * Register a handler for message status changes
   *
   * @param handler Function to call when a message status changes
   */
  onMessageStatusChange(
    handler: (messageId: string, status: MessageStatus) => void
  ): void;
  /**
   * Send a message to one or more recipients
   *
   * @param message The message to send
   * @returns Promise resolving to the sent message with updated status
   */
  sendMessage(message: Message): Promise<Message>;
  /**
   * Broadcast a message to all subscribers of a topic
   *
   * @param topic The topic to broadcast to
   * @param message The message to broadcast
   * @returns Promise resolving to the sent message with updated status
   */
  broadcastMessage(topic: string, message: Message): Promise<Message>;
  /**
   * Subscribe to messages on a topic
   *
   * @param topic The topic to subscribe to
   * @param callback Function to call when a message is received
   * @returns Subscription ID that can be used to unsubscribe
   */
  subscribeToTopic(topic: string, callback: (message: Message) => void): string;
  /**
   * Unsubscribe from a topic
   *
   * @param subscriptionId The subscription ID to unsubscribe
   */
  unsubscribeFromTopic(subscriptionId: string): void;
  /**
   * Dispose of this mailbox
   */
  dispose(): void;
}
//# sourceMappingURL=InMemoryMessaging.d.ts.map

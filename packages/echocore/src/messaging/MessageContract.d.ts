/**
 * Agent Messaging System
 *
 * Defines the core interfaces for agent-to-agent communication within
 * the EchoForge ecosystem. This messaging system enables direct and
 * broadcast communication between agents with support for different
 * delivery semantics.
 */
/**
 * Message priority levels
 */
export declare enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}
/**
 * Message delivery status
 */
export declare enum MessageStatus {
  PENDING = 'pending',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  EXPIRED = 'expired',
}
/**
 * Message delivery options
 */
export interface MessageDeliveryOptions {
  /**
   * Time-to-live in milliseconds
   * After this time, the message will be marked as expired
   */
  ttl?: number;
  /**
   * Whether delivery confirmation is required
   */
  requireConfirmation?: boolean;
  /**
   * Whether read receipt is required
   */
  requireReadReceipt?: boolean;
  /**
   * Message priority
   */
  priority?: MessagePriority;
  /**
   * Whether the message should be persisted
   */
  persist?: boolean;
  /**
   * Custom delivery metadata
   */
  metadata?: Record<string, any>;
}
/**
 * Core message interface
 */
export interface Message {
  /**
   * Unique identifier for this message
   */
  id: string;
  /**
   * ID of the sender agent
   */
  senderId: string;
  /**
   * ID(s) of the recipient agent(s)
   * If undefined, the message is broadcast to all agents
   */
  recipientIds?: string[];
  /**
   * Message type for content-based routing
   */
  type: string;
  /**
   * Message content
   */
  content: any;
  /**
   * Message creation timestamp
   */
  createdAt: Date;
  /**
   * Message delivery options
   */
  deliveryOptions?: MessageDeliveryOptions;
  /**
   * Message status
   */
  status?: MessageStatus;
  /**
   * Reference to a parent message (for replies/threads)
   */
  parentId?: string;
  /**
   * Conversation or thread ID
   */
  conversationId?: string;
}
/**
 * Interface for a message broker that handles message routing
 */
export interface MessageBroker {
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
}
/**
 * Interface for an agent mailbox that stores and manages messages
 */
export interface AgentMailbox {
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
}
/**
 * Interface for a message store that persists messages
 */
export interface MessageStore {
  /**
   * Save a message to the store
   *
   * @param message The message to save
   */
  saveMessage(message: Message): Promise<void>;
  /**
   * Get a message from the store
   *
   * @param messageId The ID of the message to get
   */
  getMessage(messageId: string): Promise<Message | null>;
  /**
   * Update a message in the store
   *
   * @param messageId The ID of the message to update
   * @param updates The updates to apply to the message
   */
  updateMessage(messageId: string, updates: Partial<Message>): Promise<void>;
  /**
   * Delete a message from the store
   *
   * @param messageId The ID of the message to delete
   */
  deleteMessage(messageId: string): Promise<void>;
  /**
   * Query messages from the store
   *
   * @param query Query parameters
   */
  queryMessages(query: {
    senderId?: string;
    recipientId?: string;
    type?: string;
    status?: MessageStatus;
    conversationId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Message[]>;
}
//# sourceMappingURL=MessageContract.d.ts.map

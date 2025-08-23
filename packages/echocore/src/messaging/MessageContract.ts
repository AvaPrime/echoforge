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
export enum MessagePriority {
  LOW = 0,
  NORMAL = 1,
  HIGH = 2,
  URGENT = 3
}

/**
 * Message delivery status
 */
export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  PROCESSED = 'processed',
  FAILED = 'failed',
  EXPIRED = 'expired'
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
  priority?: number;
  
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
   */
  recipientIds: string[];
  
  /**
   * Message topic for pub/sub routing
   */
  topic?: string;
  
  /**
   * Message type for content-based routing
   */
  type?: string;
  
  /**
   * Message content
   */
  content: any;
  
  /**
   * Message creation timestamp
   */
  createdAt: Date | string;
  
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
  
  /**
   * Additional metadata
   */
  metadata?: Record<string, any>;
}

/**
 * Interface for a message broker that handles message routing
 */
export interface MessageBroker {
  /**
   * Send a message to specific recipients
   * 
   * @param message The message to send
   * @param options Delivery options
   * @returns Promise resolving to the message ID
   */
  sendMessage(message: Message, options?: MessageDeliveryOptions): Promise<string>;
  
  /**
   * Broadcast a message to all subscribers of a topic
   * 
   * @param message The message to broadcast
   * @param options Delivery options
   * @returns Promise resolving to the message ID
   */
  broadcastMessage(message: Message, options?: MessageDeliveryOptions): Promise<string>;
  
  /**
   * Subscribe an agent to a topic
   * 
   * @param agentId The ID of the agent subscribing
   * @param topic The topic to subscribe to
   */
  subscribeTopic(agentId: string, topic: string): void;
  
  /**
   * Unsubscribe an agent from a topic
   * 
   * @param agentId The ID of the agent unsubscribing
   * @param topic The topic to unsubscribe from
   */
  unsubscribeTopic(agentId: string, topic: string): void;
  
  /**
   * Get all topics an agent is subscribed to
   * 
   * @param agentId The ID of the agent
   */
  getAgentSubscriptions(agentId: string): string[];
  
  /**
   * Get all agents subscribed to a topic
   * 
   * @param topic The topic
   */
  getTopicSubscribers(topic: string): string[];
  
  /**
   * Register a message handler for an agent
   * 
   * @param agentId The ID of the agent
   * @param handler The message handler function
   * @returns A function to unregister the handler
   */
  registerMessageHandler(agentId: string, handler: (message: Message) => void): () => void;
  
  /**
   * Register a topic handler for an agent
   * 
   * @param agentId The ID of the agent
   * @param topic The topic to handle
   * @param handler The message handler function
   * @returns A function to unregister the handler
   */
  registerTopicHandler(agentId: string, topic: string, handler: (message: Message) => void): () => void;
  
  /**
   * Update the status of a message
   * 
   * @param messageId The ID of the message
   * @param status The new status
   */
  updateMessageStatus(messageId: string, status: MessageStatus): Promise<void>;
  
  /**
   * Get a message by ID
   * 
   * @param messageId The ID of the message
   */
  getMessage(messageId: string): Promise<Message | null>;
  
  /**
   * Query messages based on criteria
   * 
   * @param query Query parameters
   */
  queryMessages(query: {
    senderId?: string;
    recipientId?: string;
    topic?: string;
    type?: string;
    status?: MessageStatus;
    conversationId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Message[]>;
}

/**
 * Interface for an agent mailbox that stores and manages messages
 */
export interface AgentMailbox {
  /**
   * Send a message to specific recipients
   * 
   * @param recipients The recipient agent IDs
   * @param content The message content
   * @param options Additional message options
   */
  sendMessage(
    recipients: string[],
    content: any,
    options?: {
      type?: string;
      topic?: string;
      conversationId?: string;
      priority?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<string>;
  
  /**
   * Broadcast a message to all subscribers of a topic
   * 
   * @param topic The topic to broadcast to
   * @param content The message content
   * @param options Additional message options
   */
  broadcastMessage(
    topic: string,
    content: any,
    options?: {
      type?: string;
      conversationId?: string;
      priority?: number;
      metadata?: Record<string, any>;
    }
  ): Promise<string>;
  
  /**
   * Subscribe to a topic
   * 
   * @param topic The topic to subscribe to
   * @param handler The message handler function
   */
  subscribeTopic(topic: string, handler?: (message: Message) => void): void;
  
  /**
   * Unsubscribe from a topic
   * 
   * @param topic The topic to unsubscribe from
   */
  unsubscribeTopic(topic: string): void;
  
  /**
   * Get all topics this agent is subscribed to
   */
  getSubscribedTopics(): string[];
  
  /**
   * Register a handler for all incoming messages
   * 
   * @param handler The message handler function
   */
  onMessage(handler: (message: Message) => void): () => void;
  
  /**
   * Register a handler for messages of a specific type
   * 
   * @param type The message type
   * @param handler The message handler function
   */
  onMessageType(type: string, handler: (message: Message) => void): () => void;
  
  /**
   * Register a handler for messages in a specific conversation
   * 
   * @param conversationId The conversation ID
   * @param handler The message handler function
   */
  onConversation(conversationId: string, handler: (message: Message) => void): () => void;

  /**
   * Get messages with optional filtering
   * 
   * @param options The query options
   */
  getMessages(options?: {
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
  onMessageStatusChange(handler: (messageId: string, status: MessageStatus) => void): void;
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
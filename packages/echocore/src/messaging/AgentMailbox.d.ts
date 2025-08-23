/**
 * Agent Mailbox Implementation
 *
 * Provides a mailbox interface for agents to send and receive messages
 * with support for direct messaging, topic subscriptions, and message querying.
 */
import {
  AgentMailbox,
  Message,
  MessageBroker,
  MessageStatus,
} from './MessageContract';
/**
 * Default implementation of the AgentMailbox interface
 */
export declare class DefaultAgentMailbox implements AgentMailbox {
  private agentId;
  private broker;
  private eventEmitter;
  private messageHandlerUnsubscribe;
  private topicHandlers;
  /**
   * Create a new DefaultAgentMailbox
   *
   * @param agentId The ID of the agent this mailbox belongs to
   * @param broker The message broker to use
   */
  constructor(agentId: string, broker: MessageBroker);
  /**
   * Handle an incoming message
   *
   * @param message The incoming message
   */
  private handleIncomingMessage;
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
  onConversation(
    conversationId: string,
    handler: (message: Message) => void
  ): () => void;
  /**
   * Query messages based on criteria
   *
   * @param query Query parameters
   */
  queryMessages(query?: {
    senderId?: string;
    topic?: string;
    type?: string;
    status?: MessageStatus;
    conversationId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Message[]>;
  /**
   * Get a message by ID
   *
   * @param messageId The ID of the message
   */
  getMessage(messageId: string): Promise<Message | null>;
  /**
   * Mark a message as read
   *
   * @param messageId The ID of the message
   */
  markAsRead(messageId: string): Promise<void>;
  /**
   * Mark a message as processed
   *
   * @param messageId The ID of the message
   */
  markAsProcessed(messageId: string): Promise<void>;
  /**
   * Close the mailbox and unsubscribe from all topics
   */
  close(): void;
}
//# sourceMappingURL=AgentMailbox.d.ts.map

/**
 * Message Broker Implementation
 *
 * Provides a central message broker for agent-to-agent communication
 * with support for direct messaging, broadcasting, and subscription patterns.
 */
import {
  Message,
  MessageBroker,
  MessageDeliveryOptions,
  MessageStatus,
  MessageStore,
} from './MessageContract';
/**
 * Default implementation of the MessageBroker interface
 */
export declare class DefaultMessageBroker implements MessageBroker {
  private eventEmitter;
  private messageStore;
  private subscriptions;
  private agentSubscriptions;
  /**
   * Create a new DefaultMessageBroker
   *
   * @param messageStore Optional message store for persistence
   */
  constructor(messageStore?: MessageStore | null);
  /**
   * Send a message to specific recipients
   *
   * @param message The message to send
   * @param options Delivery options
   */
  sendMessage(
    message: Message,
    options?: MessageDeliveryOptions
  ): Promise<string>;
  /**
   * Broadcast a message to all subscribers of a topic
   *
   * @param message The message to broadcast
   * @param options Delivery options
   */
  broadcastMessage(
    message: Message,
    options?: MessageDeliveryOptions
  ): Promise<string>;
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
   */
  registerMessageHandler(
    agentId: string,
    handler: (message: Message) => void
  ): () => void;
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
  ): () => void;
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
    status?: MessageStatus;
    conversationId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Message[]>;
}
//# sourceMappingURL=MessageBroker.d.ts.map

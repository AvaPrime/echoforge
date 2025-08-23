/**
 * In-Memory Message Store
 *
 * Provides an in-memory implementation of the MessageStore interface
 * for testing and development purposes.
 */
import { Message, MessageStatus, MessageStore } from './MessageContract';
/**
 * In-memory implementation of the MessageStore interface
 */
export declare class InMemoryMessageStore implements MessageStore {
  private messages;
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
  /**
   * Clear all messages from the store
   */
  clear(): Promise<void>;
}
//# sourceMappingURL=InMemoryMessageStore.d.ts.map

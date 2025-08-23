/**
 * IndexedDB Message Store
 *
 * Provides a persistent message store implementation using IndexedDB
 * for durable storage of agent messages.
 */
import { Message, MessageStatus, MessageStore } from './MessageContract';
/**
 * IndexedDB implementation of the MessageStore interface
 */
export declare class IndexedDBMessageStore implements MessageStore {
  private dbName;
  private storeName;
  private db;
  private isInitialized;
  private initPromise;
  /**
   * Create a new IndexedDBMessageStore
   *
   * @param dbName The name of the IndexedDB database
   * @param storeName The name of the object store
   */
  constructor(dbName?: string, storeName?: string);
  /**
   * Initialize the database
   */
  initialize(): Promise<void>;
  /**
   * Ensure the database is initialized
   */
  private ensureInitialized;
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
   * Close the database connection
   */
  close(): void;
  /**
   * Serialize a message for storage
   *
   * @param message The message to serialize
   */
  private serializeMessage;
  /**
   * Deserialize a message from storage
   *
   * @param data The serialized message data
   */
  private deserializeMessage;
}
//# sourceMappingURL=IndexedDBMessageStore.d.ts.map

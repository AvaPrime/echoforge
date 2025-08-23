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
export class InMemoryMessageStore implements MessageStore {
  private messages: Map<string, Message> = new Map();

  /**
   * Save a message to the store
   *
   * @param message The message to save
   */
  async saveMessage(message: Message): Promise<void> {
    this.messages.set(message.id, { ...message });
  }

  /**
   * Get a message from the store
   *
   * @param messageId The ID of the message to get
   */
  async getMessage(messageId: string): Promise<Message | null> {
    const message = this.messages.get(messageId);
    return message ? { ...message } : null;
  }

  /**
   * Update a message in the store
   *
   * @param messageId The ID of the message to update
   * @param updates The updates to apply to the message
   */
  async updateMessage(
    messageId: string,
    updates: Partial<Message>
  ): Promise<void> {
    const message = this.messages.get(messageId);
    if (!message) {
      throw new Error(`Message with ID ${messageId} not found`);
    }

    this.messages.set(messageId, { ...message, ...updates });
  }

  /**
   * Delete a message from the store
   *
   * @param messageId The ID of the message to delete
   */
  async deleteMessage(messageId: string): Promise<void> {
    this.messages.delete(messageId);
  }

  /**
   * Query messages from the store
   *
   * @param query Query parameters
   */
  async queryMessages(query: {
    senderId?: string;
    recipientId?: string;
    type?: string;
    status?: MessageStatus;
    conversationId?: string;
    fromDate?: Date;
    toDate?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Message[]> {
    let results = Array.from(this.messages.values());

    // Filter by sender
    if (query.senderId) {
      results = results.filter(
        (message) => message.senderId === query.senderId
      );
    }

    // Filter by recipient
    if (query.recipientId) {
      results = results.filter((message) =>
        message.recipientIds.includes(query.recipientId!)
      );
    }

    // Filter by type
    if (query.type) {
      results = results.filter((message) => message.type === query.type);
    }

    // Filter by status
    if (query.status !== undefined) {
      results = results.filter((message) => message.status === query.status);
    }

    // Filter by conversation
    if (query.conversationId) {
      results = results.filter(
        (message) => message.conversationId === query.conversationId
      );
    }

    // Filter by date range
    if (query.fromDate) {
      results = results.filter((message) => {
        const createdAt =
          message.createdAt instanceof Date
            ? message.createdAt
            : new Date(message.createdAt);
        return createdAt >= query.fromDate!;
      });
    }

    if (query.toDate) {
      results = results.filter((message) => {
        const createdAt =
          message.createdAt instanceof Date
            ? message.createdAt
            : new Date(message.createdAt);
        return createdAt <= query.toDate!;
      });
    }

    // Sort by creation date (newest first)
    results.sort((a, b) => {
      const dateA =
        a.createdAt instanceof Date ? a.createdAt : new Date(a.createdAt);
      const dateB =
        b.createdAt instanceof Date ? b.createdAt : new Date(b.createdAt);
      return dateB.getTime() - dateA.getTime();
    });

    // Apply pagination
    const offset = query.offset || 0;
    const limit = query.limit || results.length;

    return results
      .slice(offset, offset + limit)
      .map((message) => ({ ...message }));
  }

  /**
   * Clear all messages from the store
   */
  async clear(): Promise<void> {
    this.messages.clear();
  }
}

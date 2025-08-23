/**
 * In-Memory Message Store
 *
 * Provides an in-memory implementation of the MessageStore interface
 * for testing and development purposes.
 */
/**
 * In-memory implementation of the MessageStore interface
 */
export class InMemoryMessageStore {
  messages = new Map();
  /**
   * Save a message to the store
   *
   * @param message The message to save
   */
  async saveMessage(message) {
    this.messages.set(message.id, { ...message });
  }
  /**
   * Get a message from the store
   *
   * @param messageId The ID of the message to get
   */
  async getMessage(messageId) {
    const message = this.messages.get(messageId);
    return message ? { ...message } : null;
  }
  /**
   * Update a message in the store
   *
   * @param messageId The ID of the message to update
   * @param updates The updates to apply to the message
   */
  async updateMessage(messageId, updates) {
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
  async deleteMessage(messageId) {
    this.messages.delete(messageId);
  }
  /**
   * Query messages from the store
   *
   * @param query Query parameters
   */
  async queryMessages(query) {
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
        message.recipientIds.includes(query.recipientId)
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
        return createdAt >= query.fromDate;
      });
    }
    if (query.toDate) {
      results = results.filter((message) => {
        const createdAt =
          message.createdAt instanceof Date
            ? message.createdAt
            : new Date(message.createdAt);
        return createdAt <= query.toDate;
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
  async clear() {
    this.messages.clear();
  }
}
//# sourceMappingURL=InMemoryMessageStore.js.map

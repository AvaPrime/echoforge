/**
 * IndexedDB Message Store
 *
 * Provides a persistent message store implementation using IndexedDB
 * for durable storage of agent messages.
 */
/**
 * IndexedDB implementation of the MessageStore interface
 */
export class IndexedDBMessageStore {
  dbName;
  storeName;
  db = null;
  isInitialized = false;
  initPromise = null;
  /**
   * Create a new IndexedDBMessageStore
   *
   * @param dbName The name of the IndexedDB database
   * @param storeName The name of the object store
   */
  constructor(dbName = 'echoforge-messages', storeName = 'messages') {
    this.dbName = dbName;
    this.storeName = storeName;
  }
  /**
   * Initialize the database
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }
    if (this.initPromise) {
      return this.initPromise;
    }
    this.initPromise = new Promise((resolve, reject) => {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        reject(new Error('IndexedDB is not supported in this environment'));
        return;
      }
      // Open the database
      const request = window.indexedDB.open(this.dbName, 1);
      // Handle database upgrade (first time or version change)
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        // Create the messages store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'id' });
          // Create indexes for common query patterns
          store.createIndex('senderId', 'senderId', { unique: false });
          store.createIndex('recipientIds', 'recipientIds', {
            unique: false,
            multiEntry: true,
          });
          store.createIndex('type', 'type', { unique: false });
          store.createIndex('status', 'status', { unique: false });
          store.createIndex('createdAt', 'createdAt', { unique: false });
          store.createIndex('conversationId', 'conversationId', {
            unique: false,
          });
        }
      };
      // Handle success
      request.onsuccess = (event) => {
        this.db = event.target.result;
        this.isInitialized = true;
        resolve();
      };
      // Handle error
      request.onerror = (event) => {
        reject(new Error(`Failed to open IndexedDB: ${event.target.error}`));
      };
    });
    return this.initPromise;
  }
  /**
   * Ensure the database is initialized
   */
  async ensureInitialized() {
    if (!this.isInitialized) {
      await this.initialize();
    }
  }
  /**
   * Save a message to the store
   *
   * @param message The message to save
   */
  async saveMessage(message) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      // Serialize dates to ISO strings for storage
      const serializedMessage = this.serializeMessage(message);
      // Start a transaction
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      // Add the message
      const request = store.put(serializedMessage);
      // Handle success
      request.onsuccess = () => {
        resolve();
      };
      // Handle error
      request.onerror = (event) => {
        reject(new Error(`Failed to save message: ${event.target.error}`));
      };
    });
  }
  /**
   * Get a message from the store
   *
   * @param messageId The ID of the message to get
   */
  async getMessage(messageId) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      // Start a transaction
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      // Get the message
      const request = store.get(messageId);
      // Handle success
      request.onsuccess = (event) => {
        const result = event.target.result;
        if (result) {
          resolve(this.deserializeMessage(result));
        } else {
          resolve(null);
        }
      };
      // Handle error
      request.onerror = (event) => {
        reject(new Error(`Failed to get message: ${event.target.error}`));
      };
    });
  }
  /**
   * Update a message in the store
   *
   * @param messageId The ID of the message to update
   * @param updates The updates to apply to the message
   */
  async updateMessage(messageId, updates) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      // Start a transaction
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      // Get the current message
      const getRequest = store.get(messageId);
      getRequest.onsuccess = (event) => {
        const message = event.target.result;
        if (!message) {
          reject(new Error(`Message with ID ${messageId} not found`));
          return;
        }
        // Apply updates
        const updatedMessage = { ...message, ...updates };
        // Serialize dates to ISO strings for storage
        const serializedMessage = this.serializeMessage(updatedMessage);
        // Update the message
        const putRequest = store.put(serializedMessage);
        putRequest.onsuccess = () => {
          resolve();
        };
        putRequest.onerror = (event) => {
          reject(new Error(`Failed to update message: ${event.target.error}`));
        };
      };
      getRequest.onerror = (event) => {
        reject(
          new Error(`Failed to get message for update: ${event.target.error}`)
        );
      };
    });
  }
  /**
   * Delete a message from the store
   *
   * @param messageId The ID of the message to delete
   */
  async deleteMessage(messageId) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      // Start a transaction
      const transaction = this.db.transaction([this.storeName], 'readwrite');
      const store = transaction.objectStore(this.storeName);
      // Delete the message
      const request = store.delete(messageId);
      // Handle success
      request.onsuccess = () => {
        resolve();
      };
      // Handle error
      request.onerror = (event) => {
        reject(new Error(`Failed to delete message: ${event.target.error}`));
      };
    });
  }
  /**
   * Query messages from the store
   *
   * @param query Query parameters
   */
  async queryMessages(query) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }
      // Start a transaction
      const transaction = this.db.transaction([this.storeName], 'readonly');
      const store = transaction.objectStore(this.storeName);
      // Determine which index to use based on the query
      let request;
      let index = null;
      let range = null;
      if (query.senderId) {
        index = store.index('senderId');
        range = IDBKeyRange.only(query.senderId);
      } else if (query.recipientId) {
        index = store.index('recipientIds');
        range = IDBKeyRange.only(query.recipientId);
      } else if (query.type) {
        index = store.index('type');
        range = IDBKeyRange.only(query.type);
      } else if (query.status) {
        index = store.index('status');
        range = IDBKeyRange.only(query.status);
      } else if (query.conversationId) {
        index = store.index('conversationId');
        range = IDBKeyRange.only(query.conversationId);
      } else if (query.fromDate && query.toDate) {
        index = store.index('createdAt');
        range = IDBKeyRange.bound(
          query.fromDate.toISOString(),
          query.toDate.toISOString()
        );
      } else if (query.fromDate) {
        index = store.index('createdAt');
        range = IDBKeyRange.lowerBound(query.fromDate.toISOString());
      } else if (query.toDate) {
        index = store.index('createdAt');
        range = IDBKeyRange.upperBound(query.toDate.toISOString());
      }
      // Get all messages or use an index
      if (index && range) {
        request = index.openCursor(range);
      } else {
        request = store.openCursor();
      }
      const messages = [];
      let skipped = 0;
      const offset = query.offset || 0;
      const limit = query.limit || Number.MAX_SAFE_INTEGER;
      // Handle cursor
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // Apply client-side filtering for complex queries
          let include = true;
          const message = cursor.value;
          // Filter by recipient if not using the recipientIds index
          if (query.recipientId && !index) {
            include =
              include && message.recipientIds?.includes(query.recipientId);
          }
          // Filter by date range if not using the createdAt index
          if (query.fromDate && !index) {
            const createdAt = new Date(message.createdAt);
            include = include && createdAt >= query.fromDate;
          }
          if (query.toDate && !index) {
            const createdAt = new Date(message.createdAt);
            include = include && createdAt <= query.toDate;
          }
          // Apply offset and limit
          if (include) {
            if (skipped < offset) {
              skipped++;
            } else if (messages.length < limit) {
              messages.push(this.deserializeMessage(message));
            }
          }
          // Continue to the next item
          cursor.continue();
        } else {
          // No more items, return the results
          resolve(messages);
        }
      };
      // Handle error
      request.onerror = (event) => {
        reject(new Error(`Failed to query messages: ${event.target.error}`));
      };
    });
  }
  /**
   * Close the database connection
   */
  close() {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
      this.initPromise = null;
    }
  }
  /**
   * Serialize a message for storage
   *
   * @param message The message to serialize
   */
  serializeMessage(message) {
    return {
      ...message,
      createdAt:
        message.createdAt instanceof Date
          ? message.createdAt.toISOString()
          : message.createdAt,
    };
  }
  /**
   * Deserialize a message from storage
   *
   * @param data The serialized message data
   */
  deserializeMessage(data) {
    return {
      ...data,
      createdAt:
        typeof data.createdAt === 'string'
          ? new Date(data.createdAt)
          : data.createdAt,
    };
  }
}
//# sourceMappingURL=IndexedDBMessageStore.js.map

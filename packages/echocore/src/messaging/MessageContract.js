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
export var MessagePriority;
(function (MessagePriority) {
  MessagePriority['LOW'] = 'low';
  MessagePriority['NORMAL'] = 'normal';
  MessagePriority['HIGH'] = 'high';
  MessagePriority['URGENT'] = 'urgent';
})(MessagePriority || (MessagePriority = {}));
/**
 * Message delivery status
 */
export var MessageStatus;
(function (MessageStatus) {
  MessageStatus['PENDING'] = 'pending';
  MessageStatus['DELIVERED'] = 'delivered';
  MessageStatus['READ'] = 'read';
  MessageStatus['FAILED'] = 'failed';
  MessageStatus['EXPIRED'] = 'expired';
})(MessageStatus || (MessageStatus = {}));
//# sourceMappingURL=MessageContract.js.map

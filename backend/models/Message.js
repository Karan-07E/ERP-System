const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// Message Model
const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  receiver: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000]
    }
  },
  messageType: {
    type: DataTypes.ENUM('normal', 'urgent', 'info', 'warning'),
    defaultValue: 'normal'
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  status: {
    type: DataTypes.ENUM('sent', 'delivered', 'read'),
    defaultValue: 'sent'
  },
  readAt: {
    type: DataTypes.DATE
  },
  deliveredAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  relatedTo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  isDeleted: {
    type: DataTypes.JSONB,
    defaultValue: {
      sender: false,
      receiver: false
    }
  },
  parentMessage: {
    type: DataTypes.UUID,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  isReply: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  threadId: {
    type: DataTypes.STRING
  }
}, {
  tableName: 'messages',
  timestamps: true,
  indexes: [
    {
      fields: ['sender', 'created_at']
    },
    {
      fields: ['receiver', 'created_at']
    },
    {
      fields: ['thread_id', 'created_at']
    }
  ]
});

// Conversation Model
const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  participants: {
    type: DataTypes.JSONB,
    allowNull: false,
    defaultValue: []
  },
  subject: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastMessage: {
    type: DataTypes.UUID,
    references: {
      model: 'messages',
      key: 'id'
    }
  },
  lastMessageAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  messageCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  archivedBy: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  relatedTo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  }
}, {
  tableName: 'conversations',
  timestamps: true,
  indexes: [
    {
      fields: ['last_message_at']
    }
  ]
});

// Notification Model
const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  recipient: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  message: {
    type: DataTypes.STRING(500),
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('info', 'warning', 'error', 'success', 'reminder'),
    defaultValue: 'info'
  },
  category: {
    type: DataTypes.ENUM('message', 'order', 'inventory', 'quality', 'audit', 'system', 'deadline'),
    allowNull: false
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE
  },
  actionRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  actionUrl: {
    type: DataTypes.STRING
  },
  relatedTo: {
    type: DataTypes.JSONB,
    defaultValue: {}
  },
  expiresAt: {
    type: DataTypes.DATE
  },
  isDeleted: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'notifications',
  timestamps: true,
  indexes: [
    {
      fields: ['recipient', 'is_read', 'created_at']
    }
  ]
});

// Broadcast Message Model
const BroadcastMessage = sequelize.define('BroadcastMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sender: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  title: {
    type: DataTypes.STRING(200),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: {
      len: [1, 5000]
    }
  },
  recipients: {
    type: DataTypes.JSONB,
    allowNull: false
  },
  messageType: {
    type: DataTypes.ENUM('announcement', 'policy', 'emergency', 'training', 'event'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  scheduledFor: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  expiresAt: {
    type: DataTypes.DATE
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  status: {
    type: DataTypes.ENUM('draft', 'scheduled', 'sent', 'expired'),
    defaultValue: 'draft'
  },
  deliveryStats: {
    type: DataTypes.JSONB,
    defaultValue: {
      totalRecipients: 0,
      delivered: 0,
      read: 0
    }
  },
  requireAcknowledgment: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  acknowledgments: {
    type: DataTypes.JSONB,
    defaultValue: []
  }
}, {
  tableName: 'broadcast_messages',
  timestamps: true
});

module.exports = {
  Message,
  Conversation,
  Notification,
  BroadcastMessage
};

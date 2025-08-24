const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const InternalMessage = sequelize.define('InternalMessage', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  messageId: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true
  },
  fromUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  toUserId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id'
    }
  },
  subject: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
    defaultValue: 'medium'
  },
  messageType: {
    type: DataTypes.ENUM('general', 'job_related', 'system_alert', 'announcement'),
    defaultValue: 'general'
  },
  relatedJobId: {
    type: DataTypes.UUID,
    references: {
      model: 'jobs',
      key: 'id'
    }
  },
  relatedOrderId: {
    type: DataTypes.UUID,
    references: {
      model: 'orders',
      key: 'id'
    }
  },
  attachments: {
    type: DataTypes.JSONB,
    defaultValue: []
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE
  },
  isArchived: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  replyToMessageId: {
    type: DataTypes.UUID,
    references: {
      model: 'internal_messages',
      key: 'id'
    }
  }
}, {
  tableName: 'internal_messages',
  timestamps: true,
  indexes: [
    {
      fields: ['message_id']
    },
    {
      fields: ['from_user_id']
    },
    {
      fields: ['to_user_id']
    },
    {
      fields: ['is_read']
    },
    {
      fields: ['priority']
    },
    {
      fields: ['message_type']
    },
    {
      fields: ['related_job_id']
    },
    {
      fields: ['is_archived']
    }
  ]
});

module.exports = InternalMessage;

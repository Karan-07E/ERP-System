const express = require('express');
const { InternalMessage } = require('../models');
const { User } = require('../models');
const { auth } = require('../middleware/auth');
const router = express.Router();

// Get all users for messaging (with user IDs)
router.get('/users', auth, async (req, res) => {
  try {
    const users = await User.findAll({
      where: { isActive: true },
      attributes: ['id', 'userId', 'firstName', 'lastName', 'username', 'email', 'department', 'designation'],
      order: [['firstName', 'ASC'], ['lastName', 'ASC']]
    });

    res.json({ users });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversations for current user
router.get('/conversations', auth, async (req, res) => {
  try {
    const { search } = req.query;
    
    // Get all conversations where user is either sender or receiver
    let whereClause = {
      [require('sequelize').Op.or]: [
        { fromUserId: req.user.id },
        { toUserId: req.user.id }
      ]
    };

    const messages = await InternalMessage.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'userId', 'firstName', 'lastName', 'username', 'department', 'designation']
        },
        {
          model: User,
          as: 'toUser', 
          attributes: ['id', 'userId', 'firstName', 'lastName', 'username', 'department', 'designation']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    // Group messages into conversations
    const conversationsMap = new Map();
    
    messages.forEach(message => {
      const otherUser = message.fromUserId === req.user.id ? message.toUser : message.fromUser;
      const conversationKey = otherUser.id;
      
      if (!conversationsMap.has(conversationKey)) {
        conversationsMap.set(conversationKey, {
          id: conversationKey,
          participant: otherUser,
          lastMessage: message.content,
          timestamp: message.createdAt,
          unread: 0,
          messages: []
        });
      }
      
      conversationsMap.get(conversationKey).messages.push({
        id: message.id,
        messageId: message.messageId,
        sender: message.fromUserId === req.user.id ? 'You' : `${message.fromUser.firstName} ${message.fromUser.lastName}`,
        senderUserId: message.fromUser.userId,
        receiverUserId: message.toUser.userId,
        text: message.content,
        timestamp: message.createdAt,
        isOwn: message.fromUserId === req.user.id,
        priority: message.priority,
        messageType: message.messageType,
        isRead: message.isRead
      });
    });

    const conversations = Array.from(conversationsMap.values());
    
    // Filter by search if provided
    const filteredConversations = search ? 
      conversations.filter(conv => 
        conv.participant.firstName.toLowerCase().includes(search.toLowerCase()) ||
        conv.participant.lastName.toLowerCase().includes(search.toLowerCase()) ||
        conv.participant.userId.toLowerCase().includes(search.toLowerCase())
      ) : conversations;

    res.json({ conversations: filteredConversations });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:userId/messages', auth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Find the other user
    const otherUser = await User.findOne({ where: { id: userId } });
    if (!otherUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const messages = await InternalMessage.findAll({
      where: {
        [require('sequelize').Op.or]: [
          { fromUserId: req.user.id, toUserId: userId },
          { fromUserId: userId, toUserId: req.user.id }
        ]
      },
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'userId', 'firstName', 'lastName', 'username']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'userId', 'firstName', 'lastName', 'username']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    // Mark received messages as read
    await InternalMessage.update(
      { isRead: true, readAt: new Date() },
      { 
        where: { 
          fromUserId: userId, 
          toUserId: req.user.id, 
          isRead: false 
        } 
      }
    );

    const formattedMessages = messages.map(message => ({
      id: message.id,
      messageId: message.messageId,
      sender: message.fromUserId === req.user.id ? 'You' : `${message.fromUser.firstName} ${message.fromUser.lastName}`,
      senderUserId: message.fromUser.userId,
      receiverUserId: message.toUser.userId,
      text: message.content,
      timestamp: message.createdAt,
      isOwn: message.fromUserId === req.user.id,
      priority: message.priority,
      messageType: message.messageType,
      isRead: message.isRead
    }));

    res.json({ messages: formattedMessages, otherUser });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send a new message
router.post('/send', auth, async (req, res) => {
  try {
    const { toUserId, subject, content, priority = 'medium', messageType = 'general' } = req.body;

    if (!toUserId || !content) {
      return res.status(400).json({ message: 'Recipient and message content are required' });
    }

    // Verify recipient exists
    const recipient = await User.findOne({ where: { id: toUserId, isActive: true } });
    if (!recipient) {
      return res.status(404).json({ message: 'Recipient not found' });
    }

    // Generate unique message ID
    const messageId = `MSG${Date.now()}${Math.random().toString(36).substr(2, 5).toUpperCase()}`;

    const message = await InternalMessage.create({
      messageId,
      fromUserId: req.user.id,
      toUserId,
      subject: subject || 'No Subject',
      content,
      priority,
      messageType
    });

    // Get the created message with user details
    const createdMessage = await InternalMessage.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'fromUser',
          attributes: ['id', 'userId', 'firstName', 'lastName', 'username']
        },
        {
          model: User,
          as: 'toUser',
          attributes: ['id', 'userId', 'firstName', 'lastName', 'username']
        }
      ]
    });

    res.status(201).json({ 
      message: 'Message sent successfully', 
      data: createdMessage 
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get unread message count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await InternalMessage.count({
      where: {
        toUserId: req.user.id,
        isRead: false,
        isArchived: false
      }
    });

    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark message as read
router.put('/:messageId/read', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await InternalMessage.findOne({
      where: { 
        id: messageId,
        toUserId: req.user.id 
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({
      isRead: true,
      readAt: new Date()
    });

    res.json({ message: 'Message marked as read' });
  } catch (error) {
    console.error('Mark message read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Archive message
router.put('/:messageId/archive', auth, async (req, res) => {
  try {
    const { messageId } = req.params;
    
    const message = await InternalMessage.findOne({
      where: { 
        id: messageId,
        [require('sequelize').Op.or]: [
          { fromUserId: req.user.id },
          { toUserId: req.user.id }
        ]
      }
    });

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    await message.update({ isArchived: true });

    res.json({ message: 'Message archived successfully' });
  } catch (error) {
    console.error('Archive message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

module.exports = router;

const express = require('express');
const { Message, Conversation, Notification, BroadcastMessage } = require('../models/Message');
const { auth, checkPermission } = require('../middleware/auth');
const { validate, messageSchemas } = require('../middleware/validation');
const router = express.Router();

// MESSAGES ROUTES
// Get all messages (inbox)
router.get('/', auth, checkPermission('messages', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10, type = 'received', search, status } = req.query;
    
    let query = {};
    if (type === 'received') {
      query.receiver = req.user._id;
      query['isDeleted.receiver'] = false;
    } else if (type === 'sent') {
      query.sender = req.user._id;
      query['isDeleted.sender'] = false;
    }

    if (search) {
      query.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }
    if (status) query.status = status;

    const messages = await Message.find(query)
      .populate('sender', 'firstName lastName username')
      .populate('receiver', 'firstName lastName username')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Message.countDocuments(query);
    const unreadCount = await Message.countDocuments({
      receiver: req.user._id,
      status: { $in: ['sent', 'delivered'] },
      'isDeleted.receiver': false
    });

    res.json({
      messages,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get message by ID
router.get('/:id', auth, checkPermission('messages', 'read'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('sender', 'firstName lastName username email')
      .populate('receiver', 'firstName lastName username email')
      .populate('parentMessage');

    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Check if user has access to this message
    if (message.sender._id.toString() !== req.user._id.toString() && 
        message.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    // Mark as read if receiver is viewing
    if (message.receiver._id.toString() === req.user._id.toString() && 
        message.status !== 'read') {
      message.status = 'read';
      message.readAt = new Date();
      await message.save();

      // Emit real-time update
      const io = req.app.get('io');
      io.to(message.sender._id.toString()).emit('message_read', {
        messageId: message._id,
        readAt: message.readAt
      });
    }

    res.json({ message });
  } catch (error) {
    console.error('Get message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Send message
router.post('/', auth, checkPermission('messages', 'create'), validate(messageSchemas.create), async (req, res) => {
  try {
    const { receiver, subject, content, messageType, priority, relatedTo, parentMessage } = req.body;

    // Generate thread ID for conversation tracking
    let threadId = req.body.threadId;
    if (parentMessage) {
      const parent = await Message.findById(parentMessage);
      threadId = parent?.threadId || parent?._id.toString();
    } else {
      threadId = `thread-${Date.now()}-${req.user._id}`;
    }

    const message = new Message({
      sender: req.user._id,
      receiver,
      subject,
      content,
      messageType: messageType || 'normal',
      priority: priority || 'medium',
      relatedTo,
      parentMessage,
      isReply: !!parentMessage,
      threadId
    });

    await message.save();
    await message.populate('sender', 'firstName lastName username');
    await message.populate('receiver', 'firstName lastName username');

    // Create or update conversation
    await updateConversation(req.user._id, receiver, subject, message._id);

    // Create notification for receiver
    await createMessageNotification(receiver, message);

    // Emit real-time message
    const io = req.app.get('io');
    io.to(receiver).emit('new_message', {
      messageId: message._id,
      sender: message.sender,
      subject: message.subject,
      priority: message.priority,
      createdAt: message.createdAt
    });

    res.status(201).json({ message: 'Message sent successfully', message });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Reply to message
router.post('/:id/reply', auth, checkPermission('messages', 'create'), async (req, res) => {
  try {
    const { content } = req.body;
    
    const originalMessage = await Message.findById(req.params.id);
    if (!originalMessage) {
      return res.status(404).json({ message: 'Original message not found' });
    }

    // Check if user can reply
    if (originalMessage.receiver._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Can only reply to received messages' });
    }

    const replyMessage = new Message({
      sender: req.user._id,
      receiver: originalMessage.sender,
      subject: `Re: ${originalMessage.subject}`,
      content,
      parentMessage: originalMessage._id,
      isReply: true,
      threadId: originalMessage.threadId || originalMessage._id.toString(),
      messageType: originalMessage.messageType,
      relatedTo: originalMessage.relatedTo
    });

    await replyMessage.save();
    await replyMessage.populate('sender', 'firstName lastName username');
    await replyMessage.populate('receiver', 'firstName lastName username');

    // Update conversation
    await updateConversation(req.user._id, originalMessage.sender, replyMessage.subject, replyMessage._id);

    // Create notification
    await createMessageNotification(originalMessage.sender, replyMessage);

    // Emit real-time message
    const io = req.app.get('io');
    io.to(originalMessage.sender.toString()).emit('new_message', {
      messageId: replyMessage._id,
      sender: replyMessage.sender,
      subject: replyMessage.subject,
      priority: replyMessage.priority,
      createdAt: replyMessage.createdAt
    });

    res.status(201).json({ message: 'Reply sent successfully', message: replyMessage });
  } catch (error) {
    console.error('Reply message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete message
router.delete('/:id', auth, checkPermission('messages', 'delete'), async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Soft delete based on user role
    if (message.sender._id.toString() === req.user._id.toString()) {
      message.isDeleted.sender = true;
    } else if (message.receiver._id.toString() === req.user._id.toString()) {
      message.isDeleted.receiver = true;
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }

    await message.save();
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// CONVERSATIONS ROUTES
// Get conversations
router.get('/conversations/list', auth, checkPermission('messages', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const conversations = await Conversation.find({
      participants: req.user._id,
      isArchived: false
    })
    .populate('participants', 'firstName lastName username')
    .populate('lastMessage')
    .sort({ lastMessageAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    const total = await Conversation.countDocuments({
      participants: req.user._id,
      isArchived: false
    });

    res.json({
      conversations,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get conversation messages
router.get('/conversations/:id/messages', auth, checkPermission('messages', 'read'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const conversation = await Conversation.findById(req.params.id);
    if (!conversation) {
      return res.status(404).json({ message: 'Conversation not found' });
    }

    // Check if user is participant
    if (!conversation.participants.includes(req.user._id)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const messages = await Message.find({
      $or: [
        { sender: req.user._id, receiver: { $in: conversation.participants } },
        { sender: { $in: conversation.participants }, receiver: req.user._id }
      ]
    })
    .populate('sender', 'firstName lastName username')
    .populate('receiver', 'firstName lastName username')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

    res.json({ messages: messages.reverse() });
  } catch (error) {
    console.error('Get conversation messages error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// NOTIFICATIONS ROUTES
// Get notifications
router.get('/notifications', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, category, isRead } = req.query;
    
    let query = { recipient: req.user._id, isDeleted: false };
    if (category) query.category = category;
    if (isRead !== undefined) query.isRead = isRead === 'true';

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({
      recipient: req.user._id,
      isRead: false,
      isDeleted: false
    });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/notifications/:id/read', auth, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    res.json({ message: 'Notification marked as read', notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark all notifications as read
router.put('/notifications/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper functions
async function updateConversation(senderId, receiverId, subject, messageId) {
  const participants = [senderId, receiverId];
  
  let conversation = await Conversation.findOne({
    participants: { $all: participants, $size: 2 }
  });

  if (!conversation) {
    conversation = new Conversation({
      participants,
      subject,
      lastMessage: messageId,
      lastMessageAt: new Date(),
      messageCount: 1
    });
  } else {
    conversation.lastMessage = messageId;
    conversation.lastMessageAt = new Date();
    conversation.messageCount += 1;
  }

  await conversation.save();
  return conversation;
}

async function createMessageNotification(recipientId, message) {
  const notification = new Notification({
    recipient: recipientId,
    title: 'New Message',
    message: `New message from ${message.sender.firstName} ${message.sender.lastName}: ${message.subject}`,
    type: 'info',
    category: 'message',
    actionUrl: `/messages/${message._id}`,
    relatedTo: {
      type: 'message',
      id: message._id
    }
  });

  await notification.save();
  return notification;
}

module.exports = router;

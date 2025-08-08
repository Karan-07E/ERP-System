import React, { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  Send, 
  Search, 
  Plus, 
  Bell, 
  Users, 
  User, 
  Clock, 
  Check, 
  CheckCheck,
  MoreHorizontal,
  MoreVertical,
  X,
  Paperclip,
  Filter,
  Phone,
  Video,
  Info,
  Archive,
  Trash2
} from 'lucide-react';

const Messages = () => {
  const [activeTab, setActiveTab] = useState('conversations');
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [showBroadcast, setShowBroadcast] = useState(false);
  const [showContacts, setShowContacts] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const fileInputRef = useRef(null);

  // New conversation form
  const [newConversationForm, setNewConversationForm] = useState({
    participantId: '',
    initialMessage: ''
  });

  // Available contacts/users to start conversations with
  const [allUsers, setAllUsers] = useState([
    { id: 1, name: 'John Smith', role: 'Production Manager', department: 'Production', email: 'john.smith@company.com' },
    { id: 2, name: 'Sarah Johnson', role: 'Quality Assurance', department: 'Quality', email: 'sarah.johnson@company.com' },
    { id: 3, name: 'Mike Davis', role: 'Inventory Manager', department: 'Logistics', email: 'mike.davis@company.com' },
    { id: 4, name: 'Emily Chen', role: 'Process Engineer', department: 'Engineering', email: 'emily.chen@company.com' },
    { id: 5, name: 'David Wilson', role: 'Maintenance Lead', department: 'Maintenance', email: 'david.wilson@company.com' },
    { id: 6, name: 'Lisa Brown', role: 'HR Manager', department: 'Human Resources', email: 'lisa.brown@company.com' },
    { id: 7, name: 'Tom Anderson', role: 'IT Specialist', department: 'Information Technology', email: 'tom.anderson@company.com' }
  ]);

  // Sample data - replace with actual API calls
  const [conversations, setConversations] = useState([
    {
      id: 1,
      participant: { name: 'John Smith', role: 'Production Manager', avatar: null },
      lastMessage: 'Thanks for the update on the inventory status',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      unread: 2,
      messages: [
        { id: 1, sender: 'John Smith', text: 'Hi, can you check the current inventory levels?', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isOwn: false },
        { id: 2, sender: 'You', text: 'Sure, let me pull the latest report', timestamp: new Date(Date.now() - 90 * 60 * 1000), isOwn: true },
        { id: 3, sender: 'You', text: 'Current inventory levels attached', timestamp: new Date(Date.now() - 75 * 60 * 1000), isOwn: true, 
          attachments: [{ name: 'inventory_report.pdf', size: '2.1 MB', type: 'application/pdf', url: '#' }] },
        { id: 4, sender: 'John Smith', text: 'Thanks for the update on the inventory status', timestamp: new Date(Date.now() - 15 * 60 * 1000), isOwn: false }
      ]
    },
    {
      id: 2,
      participant: { name: 'Sarah Johnson', role: 'Quality Assurance', avatar: null },
      lastMessage: 'The audit report is ready for review',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      unread: 0,
      messages: [
        { id: 1, sender: 'Sarah Johnson', text: 'Working on the audit report', timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), isOwn: false },
        { id: 2, sender: 'You', text: 'Great, let me know when it\'s ready', timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), isOwn: true },
        { id: 3, sender: 'Sarah Johnson', text: 'The audit report is ready for review', timestamp: new Date(Date.now() - 45 * 60 * 1000), isOwn: false,
          attachments: [{ name: 'audit_report_july.xlsx', size: '1.8 MB', type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', url: '#' }] }
      ]
    }
  ]);

  const [broadcasts, setBroadcasts] = useState([
    {
      id: 1,
      title: 'System Maintenance Scheduled',
      message: 'Planned maintenance on Sunday 3-6 AM. Systems will be temporarily unavailable.',
      sender: 'IT Department',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      recipients: ['All Employees'],
      status: 'sent'
    },
    {
      id: 2,
      title: 'Safety Training Reminder',
      message: 'All production staff must complete safety training by end of month.',
      sender: 'HR Department',
      timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      recipients: ['Production Team'],
      status: 'sent'
    }
  ]);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'system',
      title: 'Low Inventory Alert',
      message: 'Raw material stock below minimum threshold',
      timestamp: new Date(Date.now() - 30 * 60 * 1000),
      read: false,
      priority: 'high'
    },
    {
      id: 2,
      type: 'audit',
      title: 'Audit Deadline Approaching',
      message: 'ISO audit documentation due in 3 days',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      read: false,
      priority: 'medium'
    },
    {
      id: 3,
      type: 'user',
      title: 'New Message from John Smith',
      message: 'Thanks for the update on the inventory status',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      read: true,
      priority: 'low'
    }
  ]);

  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    recipients: []
  });

  // Filter functions
  const filteredConversations = conversations.filter(conv =>
    conv.participant.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredNotifications = notifications.filter(notif =>
    notif.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notif.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get available users (those not in current conversations)
  const availableUsers = allUsers.filter(user => 
    !conversations.some(conv => conv.participant.name === user.name)
  );

  // Start new conversation
  const startNewConversation = () => {
    if (!newConversationForm.participantId || !newConversationForm.initialMessage.trim()) return;

    const selectedUser = allUsers.find(user => user.id.toString() === newConversationForm.participantId);
    if (!selectedUser) return;

    const newConversation = {
      id: Date.now(),
      participant: { 
        name: selectedUser.name, 
        role: selectedUser.role, 
        department: selectedUser.department,
        email: selectedUser.email,
        avatar: null 
      },
      lastMessage: newConversationForm.initialMessage,
      timestamp: new Date(),
      unread: 0,
      messages: [
        {
          id: 1,
          sender: 'You',
          text: newConversationForm.initialMessage,
          timestamp: new Date(),
          isOwn: true
        }
      ]
    };

    setConversations(prev => [newConversation, ...prev]);
    setSelectedConversation(newConversation);
    setNewConversationForm({ participantId: '', initialMessage: '' });
    setShowNewMessage(false);
  };

  // Delete conversation
  const deleteConversation = (conversationId) => {
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      if (selectedConversation?.id === conversationId) {
        setSelectedConversation(null);
      }
    }
  };

  // Clear conversation messages
  const clearConversation = (conversationId) => {
    if (window.confirm('Are you sure you want to clear all messages in this conversation?')) {
      setConversations(prev => prev.map(conv => 
        conv.id === conversationId 
          ? { ...conv, messages: [], lastMessage: '', timestamp: new Date() }
          : conv
      ));
    }
  };

  // Mark conversation as read
  const markConversationAsRead = (conversationId) => {
    setConversations(prev => prev.map(conv =>
      conv.id === conversationId ? { ...conv, unread: 0 } : conv
    ));
  };

  // Send message function
  const sendMessage = () => {
    if (!messageText.trim() && attachments.length === 0) return;
    if (!selectedConversation) return;
    
    const newMessage = {
      id: Date.now(),
      sender: 'You',
      text: messageText,
      timestamp: new Date(),
      isOwn: true,
      attachments: attachments.length > 0 ? [...attachments] : undefined
    };

    setConversations(prev => prev.map(conv => 
      conv.id === selectedConversation.id 
        ? { 
            ...conv, 
            messages: [...conv.messages, newMessage],
            lastMessage: messageText || `Sent ${attachments.length} file(s)`,
            timestamp: new Date()
          }
        : conv
    ));

    setMessageText('');
    setAttachments([]);
  };

  // Handle file attachment
  const handleFileAttachment = (event) => {
    const files = Array.from(event.target.files);
    const newAttachments = files.map(file => ({
      name: file.name,
      size: formatFileSize(file.size),
      type: file.type,
      url: URL.createObjectURL(file),
      file: file
    }));
    
    setAttachments(prev => [...prev, ...newAttachments]);
    event.target.value = ''; // Reset file input
  };

  // Remove attachment
  const removeAttachment = (index) => {
    setAttachments(prev => {
      const updated = prev.filter((_, i) => i !== index);
      // Revoke object URL to free memory
      if (prev[index]?.url?.startsWith('blob:')) {
        URL.revokeObjectURL(prev[index].url);
      }
      return updated;
    });
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file icon based on file type
  const getFileIcon = (type) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.includes('pdf')) return '📄';
    if (type.includes('word') || type.includes('document')) return '📝';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    if (type.includes('powerpoint') || type.includes('presentation')) return '📽️';
    if (type.startsWith('video/')) return '🎥';
    if (type.startsWith('audio/')) return '🎵';
    if (type.includes('zip') || type.includes('rar')) return '🗜️';
    return '📎';
  };

  // Send broadcast function
  const sendBroadcast = () => {
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;

    const newBroadcast = {
      id: Date.now(),
      title: broadcastForm.title,
      message: broadcastForm.message,
      sender: 'You',
      timestamp: new Date(),
      recipients: broadcastForm.recipients,
      status: 'sent'
    };

    setBroadcasts(prev => [newBroadcast, ...prev]);
    setBroadcastForm({ title: '', message: '', recipients: [] });
    setShowBroadcast(false);
  };

  // Mark notification as read
  const markAsRead = (notificationId) => {
    setNotifications(prev => prev.map(notif =>
      notif.id === notificationId ? { ...notif, read: true } : notif
    ));
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  // Make functions globally accessible for context menus
  React.useEffect(() => {
    window.markConversationAsRead = markConversationAsRead;
    window.clearConversation = clearConversation;
    window.deleteConversation = deleteConversation;
    
    return () => {
      delete window.markConversationAsRead;
      delete window.clearConversation;
      delete window.deleteConversation;
    };
  }, []);
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <MessageSquare size={24} />
          <h1>Internal Messaging</h1>
        </div>
        <p>Real-time communication and notifications within the organization</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'conversations' ? 'active' : ''}`}
          onClick={() => setActiveTab('conversations')}
        >
          <MessageSquare size={16} />
          Conversations
        </button>
        <button
          className={`tab ${activeTab === 'broadcasts' ? 'active' : ''}`}
          onClick={() => setActiveTab('broadcasts')}
        >
          <Users size={16} />
          Broadcast Messages
        </button>
        <button
          className={`tab ${activeTab === 'notifications' ? 'active' : ''}`}
          onClick={() => setActiveTab('notifications')}
        >
          <Bell size={16} />
          Notifications
        </button>
      </div>

      {/* Conversations Tab */}
      {activeTab === 'conversations' && (
        <div className="conversations-container">
          <div className="conversations-sidebar">
            <div className="sidebar-header">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder="Search conversations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <button
                className="btn btn-primary"
                onClick={() => setShowNewMessage(true)}
                title="Start New Conversation"
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>

            <div className="conversations-list">
              {filteredConversations.map(conversation => (
                <div
                  key={conversation.id}
                  className={`conversation-item ${selectedConversation?.id === conversation.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedConversation(conversation);
                    markConversationAsRead(conversation.id);
                  }}
                >
                  <div className="conversation-avatar">
                    <User size={24} />
                  </div>
                  <div className="conversation-content">
                    <div className="conversation-header">
                      <span className="participant-name">{conversation.participant.name}</span>
                      <span className="timestamp">{formatTime(conversation.timestamp)}</span>
                    </div>
                    <div className="conversation-preview">
                      <span className="last-message">{conversation.lastMessage}</span>
                      {conversation.unread > 0 && (
                        <span className="unread-badge">{conversation.unread}</span>
                      )}
                    </div>
                  </div>
                  <div className="conversation-actions">
                    <button 
                      className="btn-icon conversation-menu"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.target.getBoundingClientRect();
                        const menu = document.createElement('div');
                        menu.className = 'context-menu';
                        menu.innerHTML = `
                          <div class="menu-item" onclick="markConversationAsRead(${conversation.id})">Mark as Read</div>
                          <div class="menu-item" onclick="clearConversation(${conversation.id})">Clear Messages</div>
                          <div class="menu-item danger" onclick="deleteConversation(${conversation.id})">Delete Conversation</div>
                        `;
                        menu.style.position = 'fixed';
                        menu.style.top = `${rect.bottom}px`;
                        menu.style.left = `${rect.left}px`;
                        document.body.appendChild(menu);
                        
                        const closeMenu = () => {
                          document.body.removeChild(menu);
                          document.removeEventListener('click', closeMenu);
                        };
                        setTimeout(() => document.addEventListener('click', closeMenu), 100);
                      }}
                      title="Conversation Options"
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="chat-area">
            {selectedConversation ? (
              <>
                <div className="chat-header">
                  <div className="chat-participant">
                    <User size={24} />
                    <div>
                      <h3>{selectedConversation.participant.name}</h3>
                      <span className="role">{selectedConversation.participant.role} • {selectedConversation.participant.department}</span>
                    </div>
                  </div>
                  <div className="chat-actions">
                    <button className="btn-icon" title="Voice Call">
                      <Phone size={20} />
                    </button>
                    <button className="btn-icon" title="Video Call">
                      <Video size={20} />
                    </button>
                    <button className="btn-icon" title="Contact Info">
                      <Info size={20} />
                    </button>
                    <button 
                      className="btn-icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        const rect = e.target.getBoundingClientRect();
                        const menu = document.createElement('div');
                        menu.className = 'context-menu';
                        menu.innerHTML = `
                          <div class="menu-item" onclick="clearConversation(${selectedConversation.id})">
                            <Archive size="16" /> Clear Messages
                          </div>
                          <div class="menu-item" onclick="window.open('mailto:${selectedConversation.participant.email}')">
                            <Send size="16" /> Send Email
                          </div>
                          <div class="menu-item danger" onclick="deleteConversation(${selectedConversation.id})">
                            <Trash2 size="16" /> Delete Conversation
                          </div>
                        `;
                        menu.style.position = 'fixed';
                        menu.style.top = `${rect.bottom}px`;
                        menu.style.right = `${window.innerWidth - rect.right}px`;
                        document.body.appendChild(menu);
                        
                        const closeMenu = () => {
                          document.body.removeChild(menu);
                          document.removeEventListener('click', closeMenu);
                        };
                        setTimeout(() => document.addEventListener('click', closeMenu), 100);
                      }}
                      title="More Options"
                    >
                      <MoreHorizontal size={20} />
                    </button>
                  </div>
                </div>

                <div className="messages-container">
                  {selectedConversation.messages.map(message => (
                    <div
                      key={message.id}
                      className={`message ${message.isOwn ? 'own' : 'other'}`}
                    >
                      <div className="message-content">
                        {message.text && (
                          <span className="message-text">{message.text}</span>
                        )}
                        
                        {message.attachments && message.attachments.length > 0 && (
                          <div className="message-attachments">
                            {message.attachments.map((attachment, index) => (
                              <div key={index} className="attachment-item">
                                <div className="attachment-icon">
                                  {getFileIcon(attachment.type)}
                                </div>
                                <div className="attachment-info">
                                  <div className="attachment-name">{attachment.name}</div>
                                  <div className="attachment-size">{attachment.size}</div>
                                </div>
                                <button 
                                  className="attachment-download"
                                  onClick={() => window.open(attachment.url, '_blank')}
                                  title="Download file"
                                >
                                  <Archive size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        
                        <span className="message-time">{formatTime(message.timestamp)}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="message-input-container">
                  {attachments.length > 0 && (
                    <div className="attachments-preview">
                      {attachments.map((attachment, index) => (
                        <div key={index} className="attachment-preview">
                          <div className="attachment-icon">
                            {getFileIcon(attachment.type)}
                          </div>
                          <div className="attachment-info">
                            <div className="attachment-name">{attachment.name}</div>
                            <div className="attachment-size">{formatFileSize(attachment.size)}</div>
                          </div>
                          <button 
                            className="remove-attachment"
                            onClick={() => removeAttachment(index)}
                            title="Remove attachment"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className="message-input-box">
                    <input type="file" 
                           ref={fileInputRef} 
                           onChange={handleFileAttachment} 
                           multiple 
                           style={{display: 'none'}} />
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                      className="message-input"
                    />
                    <button 
                      className="btn-icon attach"
                      onClick={() => fileInputRef.current?.click()}
                      title="Attach file"
                    >
                      <Paperclip size={20} />
                    </button>
                    <button
                      className="btn-icon send"
                      onClick={sendMessage}
                      disabled={!messageText.trim() && attachments.length === 0}
                    >
                      <Send size={20} />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-conversation">
                <MessageSquare size={48} />
                <h3>Select a conversation</h3>
                <p>Choose a conversation from the sidebar to start messaging</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* New Conversation Modal */}
      {showNewMessage && (
        <div className="modal-overlay" onClick={() => setShowNewMessage(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Start New Conversation</h3>
              <button 
                className="btn-icon" 
                onClick={() => setShowNewMessage(false)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-content">
              <div className="form-group">
                <label>Select Contact</label>
                <select
                  value={newConversationForm.participantId}
                  onChange={(e) => setNewConversationForm(prev => ({
                    ...prev,
                    participantId: e.target.value
                  }))}
                  className="form-control"
                >
                  <option value="">Choose a contact...</option>
                  {availableUsers.map(user => (
                    <option key={user.id} value={user.id}>
                      {user.name} - {user.role} ({user.department})
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Initial Message</label>
                <textarea
                  value={newConversationForm.initialMessage}
                  onChange={(e) => setNewConversationForm(prev => ({
                    ...prev,
                    initialMessage: e.target.value
                  }))}
                  placeholder="Type your first message..."
                  className="form-control"
                  rows="3"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button 
                className="btn btn-secondary" 
                onClick={() => setShowNewMessage(false)}
              >
                Cancel
              </button>
              <button 
                className="btn btn-primary"
                onClick={startNewConversation}
                disabled={!newConversationForm.participantId || !newConversationForm.initialMessage.trim()}
              >
                Start Conversation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Broadcast Messages Tab */}
      {activeTab === 'broadcasts' && (
        <div className="broadcasts-container">
          <div className="broadcasts-header">
            <h2>Broadcast Messages</h2>
            <button
              className="btn btn-primary"
              onClick={() => setShowBroadcast(true)}
            >
              <Plus size={16} />
              Send Broadcast
            </button>
          </div>

          <div className="broadcasts-list">
            {broadcasts.map(broadcast => (
              <div key={broadcast.id} className="broadcast-item">
                <div className="broadcast-header">
                  <h3>{broadcast.title}</h3>
                  <div className="broadcast-meta">
                    <span className="sender">by {broadcast.sender}</span>
                    <span className="timestamp">{formatTime(broadcast.timestamp)}</span>
                  </div>
                </div>
                <p className="broadcast-message">{broadcast.message}</p>
                <div className="broadcast-footer">
                  <span className="recipients">
                    To: {broadcast.recipients.join(', ')}
                  </span>
                  <span className={`status ${broadcast.status}`}>
                    {broadcast.status === 'sent' && <CheckCheck size={16} />}
                    {broadcast.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="notifications-container">
          <div className="notifications-header">
            <h2>Notifications</h2>
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="notifications-list">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`notification-item ${notification.read ? 'read' : 'unread'} ${notification.priority}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="notification-icon">
                  <Bell size={20} />
                </div>
                <div className="notification-content">
                  <div className="notification-header">
                    <h4>{notification.title}</h4>
                    <span className="timestamp">{formatTime(notification.timestamp)}</span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  <div className="notification-footer">
                    <span className={`type ${notification.type}`}>
                      {notification.type}
                    </span>
                    <span className={`priority ${notification.priority}`}>
                      {notification.priority} priority
                    </span>
                  </div>
                </div>
                {!notification.read && <div className="unread-indicator"></div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broadcast Modal */}
      {showBroadcast && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Send Broadcast Message</h2>
              <button className="modal-close" onClick={() => setShowBroadcast(false)}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); sendBroadcast(); }} className="broadcast-form">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  value={broadcastForm.title}
                  onChange={(e) => setBroadcastForm({...broadcastForm, title: e.target.value})}
                  required
                  className="form-input"
                  placeholder="Enter broadcast title..."
                />
              </div>

              <div className="form-group">
                <label>Recipients *</label>
                <select
                  multiple
                  value={broadcastForm.recipients}
                  onChange={(e) => setBroadcastForm({
                    ...broadcastForm, 
                    recipients: Array.from(e.target.selectedOptions, option => option.value)
                  })}
                  className="form-select"
                >
                  <option value="All Employees">All Employees</option>
                  <option value="Production Team">Production Team</option>
                  <option value="Quality Team">Quality Team</option>
                  <option value="Management">Management</option>
                  <option value="IT Department">IT Department</option>
                </select>
              </div>

              <div className="form-group">
                <label>Message *</label>
                <textarea
                  value={broadcastForm.message}
                  onChange={(e) => setBroadcastForm({...broadcastForm, message: e.target.value})}
                  required
                  rows="4"
                  className="form-textarea"
                  placeholder="Enter your broadcast message..."
                />
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowBroadcast(false)}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!broadcastForm.title.trim() || !broadcastForm.message.trim()}
                  className="btn btn-primary"
                >
                  Send Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style jsx>{`
        .page {
          padding: 20px 0;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        .page-title {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
        }
        
        .page-title h1 {
          font-size: 28px;
          font-weight: 600;
          color: #333;
          margin: 0;
        }
        
        .page-header p {
          color: #666;
          font-size: 16px;
          margin: 0;
        }

        .tabs {
          display: flex;
          gap: 4px;
          margin-bottom: 20px;
          border-bottom: 2px solid #f0f0f0;
        }

        .tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 16px;
          background: none;
          border: none;
          border-bottom: 2px solid transparent;
          cursor: pointer;
          font-weight: 500;
          color: #666;
          transition: all 0.2s;
        }

        .tab:hover {
          color: #007bff;
          background-color: #f8f9fa;
        }

        .tab.active {
          color: #007bff;
          border-bottom-color: #007bff;
        }

        /* Conversations */
        .conversations-container {
          display: flex;
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          height: 600px;
          overflow: hidden;
        }

        .conversations-sidebar {
          width: 350px;
          border-right: 1px solid #e5e7eb;
          display: flex;
          flex-direction: column;
        }

        .sidebar-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .search-box {
          position: relative;
          flex: 1;
        }

        .search-box svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-input {
          width: 100%;
          padding: 10px 10px 10px 36px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 14px;
        }

        .conversations-list {
          flex: 1;
          overflow-y: auto;
        }

        .conversation-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px 20px;
          cursor: pointer;
          border-bottom: 1px solid #f3f4f6;
          transition: background-color 0.2s;
          position: relative;
        }

        .conversation-item:hover {
          background-color: #f8fafc;
        }

        .conversation-item:hover .conversation-actions {
          opacity: 1;
        }

        .conversation-item.active {
          background-color: #eff6ff;
          border-right: 3px solid #3b82f6;
        }

        .conversation-actions {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .conversation-menu {
          padding: 4px;
          border-radius: 4px;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
        }

        .conversation-menu:hover {
          background: #e5e7eb;
          color: #374151;
        }

        .conversation-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .conversation-content {
          flex: 1;
          min-width: 0;
        }

        .conversation-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4px;
        }

        .participant-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
        }

        .timestamp {
          font-size: 12px;
          color: #9ca3af;
        }

        .conversation-preview {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .last-message {
          color: #6b7280;
          font-size: 13px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
        }

        .unread-badge {
          background: #ef4444;
          color: white;
          border-radius: 50%;
          padding: 2px 6px;
          font-size: 11px;
          font-weight: 600;
          min-width: 18px;
          text-align: center;
        }

        .chat-area {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .chat-header {
          padding: 20px;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chat-participant {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .chat-participant h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .role {
          font-size: 13px;
          color: #6b7280;
        }

        .chat-actions {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .chat-actions .btn-icon {
          padding: 8px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .chat-actions .btn-icon:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .messages-container {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .message {
          display: flex;
        }

        .message.own {
          justify-content: flex-end;
        }

        .message-content {
          max-width: 70%;
          background: #f3f4f6;
          padding: 12px 16px;
          border-radius: 18px;
          position: relative;
        }

        .message.own .message-content {
          background: #3b82f6;
          color: white;
        }

        .message-text {
          display: block;
          margin-bottom: 4px;
        }

        .message-time {
          font-size: 11px;
          opacity: 0.7;
        }

        .message-input-container {
          padding: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .message-input-box {
          display: flex;
          align-items: center;
          gap: 8px;
          background: #f9fafb;
          border-radius: 24px;
          padding: 8px 12px;
        }

        .message-input {
          flex: 1;
          border: none;
          background: none;
          outline: none;
          padding: 8px 12px;
          font-size: 14px;
        }

        .no-conversation {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #9ca3af;
          text-align: center;
        }

        .no-conversation h3 {
          margin: 16px 0 8px;
          color: #6b7280;
        }

        /* Broadcasts */
        .broadcasts-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .broadcasts-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .broadcasts-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .broadcasts-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .broadcast-item {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          background: #fafafa;
        }

        .broadcast-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 12px;
        }

        .broadcast-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
          color: #1f2937;
        }

        .broadcast-meta {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 4px;
        }

        .sender {
          font-size: 12px;
          color: #6b7280;
        }

        .broadcast-message {
          color: #374151;
          line-height: 1.5;
          margin-bottom: 16px;
        }

        .broadcast-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 12px;
        }

        .recipients {
          color: #6b7280;
        }

        .status {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #10b981;
          font-weight: 500;
        }

        /* Notifications */
        .notifications-container {
          background: white;
          border-radius: 12px;
          padding: 24px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .notifications-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }

        .notifications-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 600;
          color: #1f2937;
        }

        .notifications-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .notification-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: background-color 0.2s;
          position: relative;
        }

        .notification-item.unread {
          background: #eff6ff;
          border-left: 4px solid #3b82f6;
        }

        .notification-item.read {
          background: #f9fafb;
        }

        .notification-item:hover {
          background: #f3f4f6;
        }

        .notification-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .notification-content {
          flex: 1;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .notification-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 600;
          color: #1f2937;
        }

        .notification-message {
          color: #6b7280;
          font-size: 13px;
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .notification-footer {
          display: flex;
          gap: 12px;
          font-size: 11px;
        }

        .type {
          padding: 2px 6px;
          border-radius: 4px;
          background: #e5e7eb;
          color: #374151;
          text-transform: capitalize;
        }

        .priority.high {
          color: #dc2626;
          font-weight: 600;
        }

        .priority.medium {
          color: #f59e0b;
          font-weight: 500;
        }

        .priority.low {
          color: #6b7280;
        }

        .unread-indicator {
          position: absolute;
          right: 12px;
          top: 12px;
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }

        /* Buttons */
        .btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          border-radius: 8px;
          font-weight: 500;
          text-decoration: none;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 14px;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .btn-secondary {
          background: #e5e7eb;
          color: #374151;
        }

        .btn-secondary:hover {
          background: #d1d5db;
        }

        .btn-icon {
          padding: 8px;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          background: transparent;
          color: #6b7280;
        }

        .btn-icon:hover {
          background: #f3f4f6;
        }

        .btn-icon.send {
          color: #3b82f6;
        }

        .btn-icon.send:disabled {
          color: #9ca3af;
          cursor: not-allowed;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .modal-content {
          background: white;
          border-radius: 12px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .modal-header h2,
        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .modal-header .btn-icon {
          padding: 8px;
          border-radius: 6px;
          background: transparent;
          border: none;
          color: #6b7280;
          cursor: pointer;
          transition: all 0.2s;
        }

        .modal-header .btn-icon:hover {
          background: #f3f4f6;
          color: #374151;
        }

        .modal-content {
          padding: 0 24px;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin: 0 24px 24px 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .modal-footer .btn {
          min-width: 120px;
          justify-content: center;
          font-size: 14px;
          font-weight: 500;
          padding: 12px 24px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
        }

        .modal-footer .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .modal-footer .btn-primary:hover:not(:disabled) {
          background: #2563eb;
        }

        .modal-footer .btn-primary:disabled {
          background: #9ca3af;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .modal-footer .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .modal-footer .btn-secondary:hover {
          background: #e5e7eb;
        }

        .modal-close {
          background: none;
          border: none;
          color: #94a3b8;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
        }

        .modal-close:hover {
          background: #f1f5f9;
        }

        .broadcast-form {
          padding: 0 24px 24px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          font-weight: 500;
          color: #374151;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .form-input,
        .form-select,
        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          box-sizing: border-box;
        }

        .form-input:focus,
        .form-select:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-select {
          height: 120px;
        }

        .modal-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .context-menu {
          position: fixed;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          padding: 4px 0;
          min-width: 180px;
          z-index: 1000;
        }

        .menu-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          font-size: 14px;
          color: #374151;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .menu-item:hover {
          background-color: #f3f4f6;
        }

        .menu-item.danger {
          color: #dc2626;
        }

        .menu-item.danger:hover {
          background-color: #fef2f2;
        }

        .form-group {
          margin-bottom: 16px;
        }

        .form-group label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #374151;
          font-size: 14px;
        }

        .form-control {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 14px;
          transition: border-color 0.2s;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* File Attachment Styles */
        .attachments-preview {
          padding: 12px;
          border-bottom: 1px solid #e5e7eb;
          background-color: #f9fafb;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .attachment-preview {
          display: flex;
          align-items: center;
          gap: 8px;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px;
          max-width: 200px;
        }

        .attachment-icon {
          color: #6b7280;
          flex-shrink: 0;
        }

        .attachment-info {
          flex: 1;
          min-width: 0;
        }

        .attachment-name {
          font-size: 12px;
          font-weight: 500;
          color: #374151;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .attachment-size {
          font-size: 11px;
          color: #6b7280;
        }

        .remove-attachment {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 2px;
          border-radius: 4px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .remove-attachment:hover {
          background-color: #fee2e2;
          color: #dc2626;
        }

        .message-attachments {
          margin-top: 8px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .attachment-item {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(0, 0, 0, 0.05);
          border-radius: 6px;
          padding: 8px;
          max-width: 250px;
        }

        .attachment-download {
          background: none;
          border: none;
          color: #6b7280;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s;
          flex-shrink: 0;
        }

        .attachment-download:hover {
          background-color: rgba(0, 0, 0, 0.1);
          color: #374151;
        }

        .btn-icon.attach:hover {
          background-color: #f3f4f6;
          color: #374151;
        }

        @media (max-width: 768px) {
          .page {
            padding: 16px;
          }

          .conversations-container {
            flex-direction: column;
            height: auto;
          }

          .conversations-sidebar {
            width: 100%;
            border-right: none;
            border-bottom: 1px solid #e5e7eb;
          }
        }
      `}</style>
    </div>
  );
};

export default Messages;

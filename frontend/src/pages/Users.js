import React, { useState, useEffect } from 'react';
import { 
  Users as UsersIcon, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  Shield, 
  Activity, 
  User, 
  Mail, 
  Phone, 
  Building, 
  Calendar, 
  Check, 
  X, 
  AlertTriangle,
  Lock,
  Settings,
  Clock,
  Filter
} from 'lucide-react';

const Users = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'add-user', 'edit-user', 'add-role', 'edit-role'
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);

  // User form state
  const [userForm, setUserForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    role: '',
    status: 'active'
  });

  // Role form state
  const [roleForm, setRoleForm] = useState({
    name: '',
    description: '',
    permissions: []
  });

  // Sample data - replace with actual API calls
  const [users, setUsers] = useState([
    {
      id: 1,
      firstName: 'John',
      lastName: 'Smith',
      email: 'john.smith@company.com',
      phone: '+1 (555) 123-4567',
      department: 'Production',
      position: 'Production Manager',
      role: 'Manager',
      status: 'active',
      lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      firstName: 'Sarah',
      lastName: 'Johnson',
      email: 'sarah.johnson@company.com',
      phone: '+1 (555) 234-5678',
      department: 'Quality',
      position: 'Quality Assurance Specialist',
      role: 'Employee',
      status: 'active',
      lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      firstName: 'Mike',
      lastName: 'Davis',
      email: 'mike.davis@company.com',
      phone: '+1 (555) 345-6789',
      department: 'Logistics',
      position: 'Inventory Manager',
      role: 'Manager',
      status: 'active',
      lastLogin: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      firstName: 'Emily',
      lastName: 'Chen',
      email: 'emily.chen@company.com',
      phone: '+1 (555) 456-7890',
      department: 'Engineering',
      position: 'Process Engineer',
      role: 'Employee',
      status: 'inactive',
      lastLogin: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [roles, setRoles] = useState([
    {
      id: 1,
      name: 'Administrator',
      description: 'Full system access with all permissions',
      permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'roles.manage', 'audit.view', 'system.config'],
      userCount: 2,
      createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000)
    },
    {
      id: 2,
      name: 'Manager',
      description: 'Management level access with department oversight',
      permissions: ['users.read', 'users.update', 'audit.view', 'reports.generate', 'inventory.manage'],
      userCount: 5,
      createdAt: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
    },
    {
      id: 3,
      name: 'Employee',
      description: 'Standard employee access with basic permissions',
      permissions: ['profile.update', 'messages.send', 'inventory.view', 'reports.view'],
      userCount: 15,
      createdAt: new Date(Date.now() - 80 * 24 * 60 * 60 * 1000)
    },
    {
      id: 4,
      name: 'Auditor',
      description: 'Audit and compliance focused permissions',
      permissions: ['audit.view', 'audit.create', 'reports.view', 'compliance.manage'],
      userCount: 3,
      createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000)
    }
  ]);

  const [activityLogs, setActivityLogs] = useState([
    {
      id: 1,
      userId: 1,
      userName: 'John Smith',
      action: 'Login',
      description: 'User logged into the system',
      timestamp: new Date(Date.now() - 15 * 60 * 1000),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0',
      status: 'success'
    },
    {
      id: 2,
      userId: 2,
      userName: 'Sarah Johnson',
      action: 'Create Audit Report',
      description: 'Created new audit report for Q3 compliance',
      timestamp: new Date(Date.now() - 45 * 60 * 1000),
      ipAddress: '192.168.1.101',
      userAgent: 'Firefox 119.0.0',
      status: 'success'
    },
    {
      id: 3,
      userId: 3,
      userName: 'Mike Davis',
      action: 'Update Inventory',
      description: 'Updated inventory levels for raw materials',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
      ipAddress: '192.168.1.102',
      userAgent: 'Safari 17.0.0',
      status: 'success'
    },
    {
      id: 4,
      userId: null,
      userName: 'Unknown User',
      action: 'Failed Login',
      description: 'Failed login attempt with invalid credentials',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
      ipAddress: '203.0.113.195',
      userAgent: 'Chrome 120.0.0',
      status: 'failed'
    },
    {
      id: 5,
      userId: 1,
      userName: 'John Smith',
      action: 'User Permission Update',
      description: 'Updated user permissions for Sarah Johnson',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
      ipAddress: '192.168.1.100',
      userAgent: 'Chrome 120.0.0',
      status: 'success'
    }
  ]);

  const departments = ['Production', 'Quality', 'Logistics', 'Engineering', 'HR', 'IT', 'Finance', 'Maintenance'];
  const availablePermissions = [
    'users.create', 'users.read', 'users.update', 'users.delete',
    'roles.manage', 'audit.view', 'audit.create', 'audit.update', 'audit.delete',
    'inventory.view', 'inventory.manage', 'materials.manage',
    'reports.view', 'reports.generate', 'system.config', 'profile.update',
    'messages.send', 'compliance.manage'
  ];

  // Filter functions
  const filteredUsers = users.filter(user =>
    `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredLogs = activityLogs.filter(log =>
    log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Utility functions
  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Modal handlers
  const openAddUserModal = () => {
    setModalType('add-user');
    setUserForm({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      department: '',
      position: '',
      role: '',
      status: 'active'
    });
    setShowModal(true);
  };

  const openEditUserModal = (user) => {
    setModalType('edit-user');
    setSelectedUser(user);
    setUserForm({ ...user });
    setShowModal(true);
  };

  const openAddRoleModal = () => {
    setModalType('add-role');
    setRoleForm({
      name: '',
      description: '',
      permissions: []
    });
    setShowModal(true);
  };

  const openEditRoleModal = (role) => {
    setModalType('edit-role');
    setSelectedRole(role);
    setRoleForm({ ...role });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setSelectedUser(null);
    setSelectedRole(null);
  };

  // CRUD operations
  const saveUser = () => {
    if (!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.email.trim()) return;

    if (modalType === 'add-user') {
      const newUser = {
        id: Date.now(),
        ...userForm,
        lastLogin: null,
        createdAt: new Date()
      };
      setUsers(prev => [newUser, ...prev]);
    } else if (modalType === 'edit-user') {
      setUsers(prev => prev.map(user =>
        user.id === selectedUser.id ? { ...user, ...userForm } : user
      ));
    }

    closeModal();
  };

  const deleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const toggleUserStatus = (userId) => {
    setUsers(prev => prev.map(user =>
      user.id === userId 
        ? { ...user, status: user.status === 'active' ? 'inactive' : 'active' }
        : user
    ));
  };

  const saveRole = () => {
    if (!roleForm.name.trim() || !roleForm.description.trim()) return;

    if (modalType === 'add-role') {
      const newRole = {
        id: Date.now(),
        ...roleForm,
        userCount: 0,
        createdAt: new Date()
      };
      setRoles(prev => [newRole, ...prev]);
    } else if (modalType === 'edit-role') {
      setRoles(prev => prev.map(role =>
        role.id === selectedRole.id ? { ...role, ...roleForm } : role
      ));
    }

    closeModal();
  };

  const deleteRole = (roleId) => {
    const role = roles.find(r => r.id === roleId);
    if (role && role.userCount > 0) {
      alert('Cannot delete role that is assigned to users. Please reassign users first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this role? This action cannot be undone.')) {
      setRoles(prev => prev.filter(role => role.id !== roleId));
    }
  };

  const togglePermission = (permission) => {
    setRoleForm(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };
  return (
    <div className="page">
      <div className="page-header">
        <div className="page-title">
          <UsersIcon size={24} />
          <h1>User Management</h1>
        </div>
        <p>Manage user accounts, roles, and permissions across the organization</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={`tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          <User size={16} />
          User Accounts
        </button>
        <button
          className={`tab ${activeTab === 'roles' ? 'active' : ''}`}
          onClick={() => setActiveTab('roles')}
        >
          <Shield size={16} />
          Roles & Permissions
        </button>
        <button
          className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
          onClick={() => setActiveTab('logs')}
        >
          <Activity size={16} />
          Activity Logs
        </button>
      </div>

      {/* User Accounts Tab */}
      {activeTab === 'users' && (
        <div className="content-section">
          <div className="section-header">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="btn btn-primary" onClick={openAddUserModal}>
              <Plus size={16} />
              Add User
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div className="user-info">
                        <div className="user-avatar">
                          <User size={20} />
                        </div>
                        <div className="user-details">
                          <div className="user-name">{user.firstName} {user.lastName}</div>
                          <div className="user-email">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="department-info">
                        <div className="department-name">{user.department}</div>
                        <div className="position">{user.position}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`role-badge ${user.role.toLowerCase()}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${user.status}`}>
                        {user.status === 'active' ? (
                          <>
                            <Check size={12} />
                            Active
                          </>
                        ) : (
                          <>
                            <X size={12} />
                            Inactive
                          </>
                        )}
                      </span>
                    </td>
                    <td className="last-login">
                      {user.lastLogin ? formatTime(user.lastLogin) : 'Never'}
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button 
                          className="btn-icon" 
                          onClick={() => openEditUserModal(user)}
                          title="Edit User"
                        >
                          <Edit size={16} />
                        </button>
                        <button 
                          className="btn-icon" 
                          onClick={() => toggleUserStatus(user.id)}
                          title={user.status === 'active' ? 'Deactivate User' : 'Activate User'}
                        >
                          <Lock size={16} />
                        </button>
                        <button 
                          className="btn-icon danger" 
                          onClick={() => deleteUser(user.id)}
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Roles & Permissions Tab */}
      {activeTab === 'roles' && (
        <div className="content-section">
          <div className="section-header">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search roles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="btn btn-primary" onClick={openAddRoleModal}>
              <Plus size={16} />
              Add Role
            </button>
          </div>

          <div className="roles-grid">
            {filteredRoles.map(role => (
              <div key={role.id} className="role-card">
                <div className="role-header">
                  <div className="role-info">
                    <h3 className="role-name">{role.name}</h3>
                    <p className="role-description">{role.description}</p>
                  </div>
                  <div className="role-actions">
                    <button 
                      className="btn-icon" 
                      onClick={() => openEditRoleModal(role)}
                      title="Edit Role"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      className="btn-icon danger" 
                      onClick={() => deleteRole(role.id)}
                      title="Delete Role"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="role-stats">
                  <div className="stat-item">
                    <UsersIcon size={16} />
                    <span>{role.userCount} users</span>
                  </div>
                  <div className="stat-item">
                    <Shield size={16} />
                    <span>{role.permissions.length} permissions</span>
                  </div>
                </div>

                <div className="permissions-preview">
                  <h4>Permissions:</h4>
                  <div className="permissions-list">
                    {role.permissions.slice(0, 3).map(permission => (
                      <span key={permission} className="permission-tag">
                        {permission.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="permission-tag more">
                        +{role.permissions.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Activity Logs Tab */}
      {activeTab === 'logs' && (
        <div className="content-section">
          <div className="section-header">
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Search activity logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <button className="btn btn-secondary">
              <Filter size={16} />
              Filter
            </button>
          </div>

          <div className="logs-container">
            {filteredLogs.map(log => (
              <div key={log.id} className={`log-item ${log.status}`}>
                <div className="log-icon">
                  {log.status === 'success' ? (
                    <Check size={20} />
                  ) : log.status === 'failed' ? (
                    <AlertTriangle size={20} />
                  ) : (
                    <Activity size={20} />
                  )}
                </div>
                
                <div className="log-content">
                  <div className="log-header">
                    <div className="log-user">
                      <User size={16} />
                      <span className="user-name">{log.userName}</span>
                    </div>
                    <div className="log-action">{log.action}</div>
                    <div className="log-time">
                      <Clock size={14} />
                      {formatTime(log.timestamp)}
                    </div>
                  </div>
                  
                  <div className="log-description">
                    {log.description}
                  </div>
                  
                  <div className="log-meta">
                    <span className="meta-item">IP: {log.ipAddress}</span>
                    <span className="meta-item">Agent: {log.userAgent}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* User Modal */}
      {showModal && (modalType === 'add-user' || modalType === 'edit-user') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType === 'add-user' ? 'Add New User' : 'Edit User'}</h3>
              <button className="btn-icon" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm(prev => ({ ...prev, firstName: e.target.value }))}
                    className="form-control"
                    placeholder="Enter first name"
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm(prev => ({ ...prev, lastName: e.target.value }))}
                    className="form-control"
                    placeholder="Enter last name"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm(prev => ({ ...prev, email: e.target.value }))}
                  className="form-control"
                  placeholder="Enter email address"
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="tel"
                  value={userForm.phone}
                  onChange={(e) => setUserForm(prev => ({ ...prev, phone: e.target.value }))}
                  className="form-control"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Department *</label>
                  <select
                    value={userForm.department}
                    onChange={(e) => setUserForm(prev => ({ ...prev, department: e.target.value }))}
                    className="form-control"
                  >
                    <option value="">Select Department</option>
                    {departments.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Position *</label>
                  <input
                    type="text"
                    value={userForm.position}
                    onChange={(e) => setUserForm(prev => ({ ...prev, position: e.target.value }))}
                    className="form-control"
                    placeholder="Enter position"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Role *</label>
                  <select
                    value={userForm.role}
                    onChange={(e) => setUserForm(prev => ({ ...prev, role: e.target.value }))}
                    className="form-control"
                  >
                    <option value="">Select Role</option>
                    {roles.map(role => (
                      <option key={role.id} value={role.name}>{role.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Status</label>
                  <select
                    value={userForm.status}
                    onChange={(e) => setUserForm(prev => ({ ...prev, status: e.target.value }))}
                    className="form-control"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveUser}
                disabled={!userForm.firstName.trim() || !userForm.lastName.trim() || !userForm.email.trim()}
              >
                {modalType === 'add-user' ? 'Add User' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Role Modal */}
      {showModal && (modalType === 'add-role' || modalType === 'edit-role') && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{modalType === 'add-role' ? 'Add New Role' : 'Edit Role'}</h3>
              <button className="btn-icon" onClick={closeModal}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-content">
              <div className="form-group">
                <label>Role Name *</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, name: e.target.value }))}
                  className="form-control"
                  placeholder="Enter role name"
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  value={roleForm.description}
                  onChange={(e) => setRoleForm(prev => ({ ...prev, description: e.target.value }))}
                  className="form-control"
                  rows="3"
                  placeholder="Enter role description"
                />
              </div>

              <div className="form-group">
                <label>Permissions</label>
                <div className="permissions-grid">
                  {availablePermissions.map(permission => (
                    <label key={permission} className="permission-checkbox">
                      <input
                        type="checkbox"
                        checked={roleForm.permissions.includes(permission)}
                        onChange={() => togglePermission(permission)}
                      />
                      <span className="checkmark"></span>
                      <span className="permission-label">
                        {permission.replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                Cancel
              </button>
              <button 
                className="btn btn-primary" 
                onClick={saveRole}
                disabled={!roleForm.name.trim() || !roleForm.description.trim()}
              >
                {modalType === 'add-role' ? 'Add Role' : 'Save Changes'}
              </button>
            </div>
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

        /* Tabs */
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

        /* Content Section */
        .content-section {
          background: white;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          border-bottom: 1px solid #e5e7eb;
        }

        .search-box {
          position: relative;
          flex: 1;
          max-width: 400px;
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

        .search-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        /* Table Styles */
        .table-container {
          overflow-x: auto;
        }

        .data-table {
          width: 100%;
          border-collapse: collapse;
        }

        .data-table th {
          background: #f8fafc;
          padding: 12px 16px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 14px;
          border-bottom: 1px solid #e5e7eb;
        }

        .data-table td {
          padding: 16px;
          border-bottom: 1px solid #f3f4f6;
          vertical-align: top;
        }

        .data-table tr:hover {
          background-color: #f8fafc;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
        }

        .user-details {
          flex: 1;
        }

        .user-name {
          font-weight: 600;
          color: #1f2937;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .user-email {
          color: #6b7280;
          font-size: 13px;
        }

        .department-info {
          display: flex;
          flex-direction: column;
        }

        .department-name {
          font-weight: 500;
          color: #374151;
          font-size: 14px;
          margin-bottom: 2px;
        }

        .position {
          color: #6b7280;
          font-size: 13px;
        }

        .role-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
        }

        .role-badge.administrator {
          background: #fef2f2;
          color: #dc2626;
        }

        .role-badge.manager {
          background: #fff7ed;
          color: #ea580c;
        }

        .role-badge.employee {
          background: #f0f9ff;
          color: #0369a1;
        }

        .role-badge.auditor {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .status-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
        }

        .status-badge.active {
          background: #f0fdf4;
          color: #16a34a;
        }

        .status-badge.inactive {
          background: #fef2f2;
          color: #dc2626;
        }

        .last-login {
          color: #6b7280;
          font-size: 13px;
        }

        .action-buttons {
          display: flex;
          gap: 4px;
        }

        /* Roles Grid */
        .roles-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 20px;
          padding: 24px;
        }

        .role-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          background: #ffffff;
          transition: box-shadow 0.2s;
        }

        .role-card:hover {
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .role-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .role-info {
          flex: 1;
        }

        .role-name {
          font-size: 18px;
          font-weight: 600;
          color: #1f2937;
          margin: 0 0 8px 0;
        }

        .role-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.5;
          margin: 0;
        }

        .role-actions {
          display: flex;
          gap: 4px;
        }

        .role-stats {
          display: flex;
          gap: 16px;
          margin-bottom: 16px;
          padding-bottom: 16px;
          border-bottom: 1px solid #f3f4f6;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          font-size: 13px;
        }

        .permissions-preview h4 {
          font-size: 14px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 8px 0;
        }

        .permissions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .permission-tag {
          background: #f3f4f6;
          color: #374151;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 500;
        }

        .permission-tag.more {
          background: #e5e7eb;
          color: #6b7280;
        }

        /* Activity Logs */
        .logs-container {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .log-item {
          display: flex;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          border-left: 4px solid #e5e7eb;
          background: #f8fafc;
          transition: all 0.2s;
        }

        .log-item.success {
          border-left-color: #10b981;
          background: #f0fdf4;
        }

        .log-item.failed {
          border-left-color: #ef4444;
          background: #fef2f2;
        }

        .log-icon {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #6b7280;
          flex-shrink: 0;
        }

        .log-item.success .log-icon {
          background: #d1fae5;
          color: #10b981;
        }

        .log-item.failed .log-icon {
          background: #fee2e2;
          color: #ef4444;
        }

        .log-content {
          flex: 1;
        }

        .log-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 8px;
          flex-wrap: wrap;
        }

        .log-user {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #374151;
          font-weight: 500;
          font-size: 14px;
        }

        .log-action {
          background: #e5e7eb;
          color: #374151;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
        }

        .log-time {
          display: flex;
          align-items: center;
          gap: 4px;
          color: #6b7280;
          font-size: 12px;
          margin-left: auto;
        }

        .log-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
          margin-bottom: 8px;
        }

        .log-meta {
          display: flex;
          gap: 16px;
          font-size: 11px;
          color: #9ca3af;
        }

        .meta-item {
          display: flex;
          align-items: center;
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
          color: #374151;
        }

        .btn-icon.danger {
          color: #dc2626;
        }

        .btn-icon.danger:hover {
          background: #fef2f2;
          color: #dc2626;
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
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .modal.large {
          max-width: 700px;
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 24px 0;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 24px;
        }

        .modal-header h3 {
          font-size: 18px;
          font-weight: 600;
          color: #1e293b;
          margin: 0;
        }

        .modal-content {
          padding: 0 24px;
        }

        .modal-footer {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin: 24px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        /* Forms */
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
          box-sizing: border-box;
        }

        .form-control:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .form-row .form-group {
          flex: 1;
        }

        /* Permissions */
        .permissions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 12px;
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 16px;
          background: #f8fafc;
        }

        .permission-checkbox {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: background-color 0.2s;
        }

        .permission-checkbox:hover {
          background: #f3f4f6;
        }

        .permission-checkbox input {
          margin: 0;
        }

        .permission-label {
          font-size: 13px;
          color: #374151;
          user-select: none;
        }

        @media (max-width: 768px) {
          .page {
            padding: 16px;
          }

          .section-header {
            flex-direction: column;
            gap: 16px;
            align-items: stretch;
          }

          .search-box {
            max-width: none;
          }

          .form-row {
            flex-direction: column;
          }

          .data-table {
            font-size: 12px;
          }

          .data-table th,
          .data-table td {
            padding: 8px;
          }

          .roles-grid {
            grid-template-columns: 1fr;
          }

          .log-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .log-time {
            margin-left: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Users;

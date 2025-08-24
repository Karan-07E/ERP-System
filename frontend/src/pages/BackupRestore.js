import React, { useState, useEffect } from 'react';
import { 
  Database, 
  Download, 
  Upload, 
  RefreshCw, 
  Trash2, 
  AlertTriangle, 
  Check, 
  Clock,
  HardDrive,
  Shield,
  Play
} from 'lucide-react';
import axios from 'axios';
import { API_BASE_URL } from '../api/config';

const BackupRestore = () => {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [autoBackupStatus, setAutoBackupStatus] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [selectedBackup, setSelectedBackup] = useState(null);
  const [backupDescription, setBackupDescription] = useState('');
  const [confirmRestore, setConfirmRestore] = useState(false);

  useEffect(() => {
    fetchBackups();
    fetchAutoBackupStatus();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/backup/backups`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBackups(response.data.backups);
    } catch (error) {
      console.error('Error fetching backups:', error);
      if (error.response?.status === 403) {
        alert('You do not have permission to access backup management.');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchAutoBackupStatus = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/backup/auto-backup/status`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAutoBackupStatus(response.data);
    } catch (error) {
      console.error('Error fetching auto-backup status:', error);
    }
  };

  const handleCreateBackup = async () => {
    try {
      setCreating(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/backup/backup`, {
        description: backupDescription || 'Manual backup'
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Backup created successfully!');
      setShowCreateModal(false);
      setBackupDescription('');
      fetchBackups();
    } catch (error) {
      console.error('Error creating backup:', error);
      alert(`Backup creation failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setCreating(false);
    }
  };

  const handleDownloadBackup = async (filename) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE_URL}/api/backup/backups/${filename}/download`, {
        headers: { Authorization: `Bearer ${token}` },
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading backup:', error);
      alert(`Download failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleRestoreBackup = async () => {
    if (!selectedBackup || !confirmRestore) {
      alert('Please confirm the restore operation.');
      return;
    }

    try {
      setRestoring(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_BASE_URL}/api/backup/restore/${selectedBackup.filename}`, {
        confirmRestore: true
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Database restored successfully! The application will need to be refreshed.');
      setShowRestoreModal(false);
      setSelectedBackup(null);
      setConfirmRestore(false);
      
      // Optionally reload the page after restore
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      console.error('Error restoring backup:', error);
      alert(`Restore failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setRestoring(false);
    }
  };

  const handleDeleteBackup = async (filename) => {
    if (!window.confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_BASE_URL}/api/backup/backups/${filename}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert('Backup deleted successfully!');
      fetchBackups();
    } catch (error) {
      console.error('Error deleting backup:', error);
      alert(`Delete failed: ${error.response?.data?.message || error.message}`);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (size) => {
    if (typeof size === 'string') return size;
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(2)} KB`;
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Backup & Restore</h1>
          <p className="text-gray-600">Manage database backups and restore operations</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={fetchBackups}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <RefreshCw size={20} />
            Refresh
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <Database size={20} />
            Create Backup
          </button>
        </div>
      </div>

      {/* Auto Backup Status */}
      {autoBackupStatus && (
        <div className="bg-white p-4 rounded-lg shadow-sm mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3 flex items-center gap-2">
            <Shield size={20} />
            Automated Backup Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="flex items-center gap-2 mt-1">
                {autoBackupStatus.enabled ? (
                  <Check size={16} className="text-green-600" />
                ) : (
                  <AlertTriangle size={16} className="text-yellow-600" />
                )}
                <span className={`text-sm ${autoBackupStatus.enabled ? 'text-green-600' : 'text-yellow-600'}`}>
                  {autoBackupStatus.enabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Schedule</label>
              <p className="text-sm text-gray-900 mt-1">{autoBackupStatus.schedule}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Retention</label>
              <p className="text-sm text-gray-900 mt-1">{autoBackupStatus.retention} days</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Last Backup</label>
              <p className="text-sm text-gray-900 mt-1">
                {autoBackupStatus.lastBackup ? formatDate(autoBackupStatus.lastBackup) : 'Never'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Backup List */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
            <HardDrive size={20} />
            Available Backups
          </h3>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading backups...</p>
            </div>
          ) : backups.length === 0 ? (
            <div className="text-center py-8">
              <Database size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No backups found</h3>
              <p className="text-gray-600">Create your first backup to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Backup Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Size
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {backups.map((backup, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {backup.filename}
                          </div>
                          {backup.type === 'pre-restore' && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 mt-1">
                              Pre-restore backup
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {backup.actualSize || backup.size}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(backup.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {backup.description || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleDownloadBackup(backup.filename)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Download Backup"
                          >
                            <Download size={16} />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedBackup(backup);
                              setShowRestoreModal(true);
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="Restore from Backup"
                          >
                            <Upload size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteBackup(backup.filename)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete Backup"
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
          )}
        </div>
      </div>

      {/* Create Backup Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Create Database Backup</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={creating}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={backupDescription}
                  onChange={(e) => setBackupDescription(e.target.value)}
                  placeholder="Enter backup description..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  disabled={creating}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">
                      Important Note
                    </h3>
                    <div className="mt-2 text-sm text-yellow-700">
                      <p>This will create a complete backup of the database. The process may take a few minutes depending on database size.</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={creating}
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateBackup}
                  disabled={creating}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Database size={16} />
                      Create Backup
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Restore Backup Modal */}
      {showRestoreModal && selectedBackup && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Restore Database</h3>
              <button
                onClick={() => setShowRestoreModal(false)}
                className="text-gray-400 hover:text-gray-600"
                disabled={restoring}
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-gray-900 mb-2">Backup Details</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <p><strong>File:</strong> {selectedBackup.filename}</p>
                  <p><strong>Size:</strong> {selectedBackup.actualSize || selectedBackup.size}</p>
                  <p><strong>Created:</strong> {formatDate(selectedBackup.createdAt)}</p>
                  <p><strong>Description:</strong> {selectedBackup.description || 'No description'}</p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-md p-3">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-red-400" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Warning: Destructive Operation
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <ul className="list-disc list-inside space-y-1">
                        <li>This will completely replace the current database</li>
                        <li>All current data will be lost</li>
                        <li>A pre-restore backup will be created automatically</li>
                        <li>This operation cannot be easily undone</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  id="confirm-restore"
                  type="checkbox"
                  checked={confirmRestore}
                  onChange={(e) => setConfirmRestore(e.target.checked)}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                  disabled={restoring}
                />
                <label htmlFor="confirm-restore" className="ml-2 block text-sm text-gray-900">
                  I understand the risks and want to restore this backup
                </label>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  disabled={restoring}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRestoreBackup}
                  disabled={!confirmRestore || restoring}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {restoring ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Restoring...
                    </>
                  ) : (
                    <>
                      <Upload size={16} />
                      Restore Database
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BackupRestore;

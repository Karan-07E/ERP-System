const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middleware/auth');
const { exec } = require('child_process');
const { promisify } = require('util');
const fs = require('fs').promises;
const path = require('path');
const execAsync = promisify(exec);

// Database backup endpoint
router.post('/backup', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { description = 'Manual backup' } = req.body;
    
    // Create backup directory if it doesn't exist
    const backupDir = path.join(__dirname, '../backups');
    try {
      await fs.access(backupDir);
    } catch {
      await fs.mkdir(backupDir, { recursive: true });
    }
    
    // Generate backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `backup-${timestamp}.sql`;
    const filepath = path.join(backupDir, filename);
    
    // Database connection details from environment
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'erp_db',
      user: process.env.DB_USER || 'postgres'
    };
    
    // Create pg_dump command
    const dumpCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.name} -f "${filepath}" --verbose --clean --no-owner --no-privileges`;
    
    console.log('Starting database backup...');
    
    // Set PGPASSWORD environment variable for authentication
    const env = { ...process.env, PGPASSWORD: process.env.DB_PASSWORD };
    
    // Execute backup command
    const { stdout, stderr } = await execAsync(dumpCommand, { env });
    
    // Get file size
    const stats = await fs.stat(filepath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    
    // Create backup metadata
    const metadata = {
      filename,
      filepath,
      size: `${sizeInMB} MB`,
      description,
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
      dbConfig: {
        host: dbConfig.host,
        port: dbConfig.port,
        name: dbConfig.name
      }
    };
    
    // Save metadata file
    const metadataPath = path.join(backupDir, `${filename}.meta.json`);
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    
    console.log('Database backup completed successfully');
    
    res.json({
      message: 'Backup created successfully',
      backup: metadata
    });
    
  } catch (error) {
    console.error('Backup error:', error);
    res.status(500).json({ 
      message: 'Backup failed', 
      error: error.message 
    });
  }
});

// List available backups
router.get('/backups', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const backupDir = path.join(__dirname, '../backups');
    
    try {
      await fs.access(backupDir);
    } catch {
      return res.json({ backups: [] });
    }
    
    const files = await fs.readdir(backupDir);
    const backups = [];
    
    // Filter for .sql files and get their metadata
    for (const file of files) {
      if (file.endsWith('.sql')) {
        const metadataPath = path.join(backupDir, `${file}.meta.json`);
        
        try {
          const metadataContent = await fs.readFile(metadataPath, 'utf8');
          const metadata = JSON.parse(metadataContent);
          
          // Get file stats for additional info
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            ...metadata,
            actualSize: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
            lastModified: stats.mtime
          });
        } catch (metaError) {
          // If metadata doesn't exist, create basic info
          const filePath = path.join(backupDir, file);
          const stats = await fs.stat(filePath);
          
          backups.push({
            filename: file,
            filepath: filePath,
            size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`,
            description: 'Legacy backup (no metadata)',
            createdAt: stats.birthtime,
            lastModified: stats.mtime
          });
        }
      }
    }
    
    // Sort by creation date (newest first)
    backups.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({ backups });
    
  } catch (error) {
    console.error('Error listing backups:', error);
    res.status(500).json({ 
      message: 'Error listing backups', 
      error: error.message 
    });
  }
});

// Download backup file
router.get('/backups/:filename/download', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    const { filename } = req.params;
    const backupDir = path.join(__dirname, '../backups');
    const filepath = path.join(backupDir, filename);
    
    // Security check - ensure filename doesn't contain path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    
    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    
    // Set appropriate headers for download
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    
    // Get file stats for content-length
    const stats = await fs.stat(filepath);
    res.setHeader('Content-Length', stats.size);
    
    // Stream the file
    const fs_stream = require('fs');
    const fileStream = fs_stream.createReadStream(filepath);
    fileStream.pipe(res);
    
  } catch (error) {
    console.error('Error downloading backup:', error);
    res.status(500).json({ 
      message: 'Error downloading backup', 
      error: error.message 
    });
  }
});

// Restore from backup
router.post('/restore/:filename', auth, authorize(['admin']), async (req, res) => {
  try {
    const { filename } = req.params;
    const { confirmRestore = false } = req.body;
    
    if (!confirmRestore) {
      return res.status(400).json({ 
        message: 'Restore confirmation required. Set confirmRestore to true.' 
      });
    }
    
    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    
    const backupDir = path.join(__dirname, '../backups');
    const filepath = path.join(backupDir, filename);
    
    // Check if backup file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    
    // Database connection details
    const dbConfig = {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      name: process.env.DB_NAME || 'erp_db',
      user: process.env.DB_USER || 'postgres'
    };
    
    console.log('Starting database restore...');
    console.log('WARNING: This will overwrite the current database!');
    
    // Create pre-restore backup
    const preRestoreTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const preRestoreFilename = `pre-restore-backup-${preRestoreTimestamp}.sql`;
    const preRestoreFilepath = path.join(backupDir, preRestoreFilename);
    
    const preBackupCommand = `pg_dump -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.name} -f "${preRestoreFilepath}" --verbose --clean --no-owner --no-privileges`;
    
    // Set PGPASSWORD environment variable
    const env = { ...process.env, PGPASSWORD: process.env.DB_PASSWORD };
    
    try {
      console.log('Creating pre-restore backup...');
      await execAsync(preBackupCommand, { env });
      
      // Create metadata for pre-restore backup
      const preRestoreMetadata = {
        filename: preRestoreFilename,
        filepath: preRestoreFilepath,
        description: `Pre-restore backup before restoring ${filename}`,
        createdBy: req.user.id,
        createdAt: new Date().toISOString(),
        type: 'pre-restore'
      };
      
      const preRestoreMetadataPath = path.join(backupDir, `${preRestoreFilename}.meta.json`);
      await fs.writeFile(preRestoreMetadataPath, JSON.stringify(preRestoreMetadata, null, 2));
      
    } catch (preBackupError) {
      console.error('Pre-restore backup failed:', preBackupError);
      return res.status(500).json({ 
        message: 'Pre-restore backup failed. Aborting restore operation.', 
        error: preBackupError.message 
      });
    }
    
    // Execute restore command
    const restoreCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.name} -f "${filepath}" --echo-errors`;
    
    try {
      console.log('Executing database restore...');
      const { stdout, stderr } = await execAsync(restoreCommand, { env });
      
      console.log('Database restore completed successfully');
      
      res.json({
        message: 'Database restored successfully',
        restoredFrom: filename,
        preRestoreBackup: preRestoreFilename,
        timestamp: new Date().toISOString()
      });
      
    } catch (restoreError) {
      console.error('Restore operation failed:', restoreError);
      
      // Attempt to restore from pre-restore backup
      try {
        console.log('Attempting to restore from pre-restore backup...');
        const rollbackCommand = `psql -h ${dbConfig.host} -p ${dbConfig.port} -U ${dbConfig.user} -d ${dbConfig.name} -f "${preRestoreFilepath}" --echo-errors`;
        await execAsync(rollbackCommand, { env });
        
        res.status(500).json({
          message: 'Restore failed, but database was rolled back to previous state',
          error: restoreError.message,
          rollbackSuccessful: true
        });
        
      } catch (rollbackError) {
        console.error('Rollback also failed:', rollbackError);
        
        res.status(500).json({
          message: 'Restore failed and rollback also failed. Database may be in inconsistent state.',
          restoreError: restoreError.message,
          rollbackError: rollbackError.message,
          preRestoreBackup: preRestoreFilename
        });
      }
    }
    
  } catch (error) {
    console.error('Restore error:', error);
    res.status(500).json({ 
      message: 'Restore operation failed', 
      error: error.message 
    });
  }
});

// Delete backup file
router.delete('/backups/:filename', auth, authorize(['admin']), async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Security check
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ message: 'Invalid filename' });
    }
    
    const backupDir = path.join(__dirname, '../backups');
    const filepath = path.join(backupDir, filename);
    const metadataPath = path.join(backupDir, `${filename}.meta.json`);
    
    // Check if file exists
    try {
      await fs.access(filepath);
    } catch {
      return res.status(404).json({ message: 'Backup file not found' });
    }
    
    // Delete the backup file
    await fs.unlink(filepath);
    
    // Delete metadata file if it exists
    try {
      await fs.unlink(metadataPath);
    } catch {
      // Metadata file might not exist for legacy backups
    }
    
    res.json({ message: 'Backup deleted successfully' });
    
  } catch (error) {
    console.error('Error deleting backup:', error);
    res.status(500).json({ 
      message: 'Error deleting backup', 
      error: error.message 
    });
  }
});

// Automated backup status
router.get('/auto-backup/status', auth, authorize(['admin', 'manager']), async (req, res) => {
  try {
    // This would be implemented with a cron job or similar scheduler
    // For now, return configuration status
    res.json({
      enabled: process.env.AUTO_BACKUP_ENABLED === 'true',
      schedule: process.env.AUTO_BACKUP_SCHEDULE || '0 2 * * *', // Daily at 2 AM
      retention: process.env.AUTO_BACKUP_RETENTION || '30', // Keep 30 days
      lastBackup: null // Would be tracked in database or file
    });
  } catch (error) {
    console.error('Error getting auto-backup status:', error);
    res.status(500).json({ 
      message: 'Error getting auto-backup status', 
      error: error.message 
    });
  }
});

module.exports = router;

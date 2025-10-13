#!/usr/bin/env node

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

class FirestoreBackup {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.collections = [
      'contact_submissions',
      'task_items', 
      'projects',
      'users',
      'payments',
      '_migrations'
    ];
  }

  ensureBackupDirectory() {
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
      console.log(`📁 Created backup directory: ${this.backupDir}`);
    }
  }

  generateFilename(prefix = 'backup') {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    return `${prefix}_${timestamp}.json`;
  }

  async backupCollection(collectionName) {
    console.log(`📦 Backing up collection: ${collectionName}`);
    
    try {
      const snapshot = await db.collection(collectionName).get();
      
      if (snapshot.empty) {
        console.log(`⚠️  Collection ${collectionName} is empty`);
        return [];
      }

      const documents = snapshot.docs.map(doc => {
        const data = doc.data();
        
        // Convert Firestore timestamps to ISO strings
        const convertedData = this.convertTimestamps(data);
        
        return {
          id: doc.id,
          data: convertedData
        };
      });

      console.log(`✅ Backed up ${documents.length} documents from ${collectionName}`);
      return documents;
    } catch (error) {
      console.error(`❌ Error backing up ${collectionName}:`, error);
      throw error;
    }
  }

  convertTimestamps(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (obj instanceof admin.firestore.Timestamp) {
      return {
        _type: 'timestamp',
        _value: obj.toDate().toISOString()
      };
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.convertTimestamps(item));
    }
    
    if (typeof obj === 'object') {
      const converted = {};
      for (const [key, value] of Object.entries(obj)) {
        converted[key] = this.convertTimestamps(value);
      }
      return converted;
    }
    
    return obj;
  }

  restoreTimestamps(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'object' && obj._type === 'timestamp') {
      return admin.firestore.Timestamp.fromDate(new Date(obj._value));
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.restoreTimestamps(item));
    }
    
    if (typeof obj === 'object') {
      const restored = {};
      for (const [key, value] of Object.entries(obj)) {
        restored[key] = this.restoreTimestamps(value);
      }
      return restored;
    }
    
    return obj;
  }

  async backupDatabase(collections = null) {
    console.log('🚀 Starting database backup...');
    this.ensureBackupDirectory();

    const collectionsToBackup = collections || this.collections;
    const backup = {
      metadata: {
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        collections: collectionsToBackup,
        totalCollections: collectionsToBackup.length
      },
      data: {}
    };

    let totalDocuments = 0;

    for (const collectionName of collectionsToBackup) {
      try {
        const documents = await this.backupCollection(collectionName);
        backup.data[collectionName] = documents;
        totalDocuments += documents.length;
      } catch (error) {
        console.error(`Failed to backup collection ${collectionName}:`, error);
        backup.data[collectionName] = [];
      }
    }

    backup.metadata.totalDocuments = totalDocuments;

    const filename = this.generateFilename('firestore_backup');
    const filepath = path.join(this.backupDir, filename);

    fs.writeFileSync(filepath, JSON.stringify(backup, null, 2));

    console.log(`\n🎉 Backup completed successfully!`);
    console.log(`📄 Backup file: ${filepath}`);
    console.log(`📊 Total collections: ${backup.metadata.totalCollections}`);
    console.log(`📊 Total documents: ${backup.metadata.totalDocuments}`);
    console.log(`💾 File size: ${(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)} MB`);

    return filepath;
  }

  async restoreDatabase(backupPath, options = {}) {
    console.log(`🔄 Starting database restore from: ${backupPath}`);

    if (!fs.existsSync(backupPath)) {
      throw new Error(`Backup file not found: ${backupPath}`);
    }

    const backupData = JSON.parse(fs.readFileSync(backupPath, 'utf8'));
    
    if (!backupData.metadata || !backupData.data) {
      throw new Error('Invalid backup file format');
    }

    console.log(`📋 Backup metadata:`);
    console.log(`   Created: ${backupData.metadata.timestamp}`);
    console.log(`   Version: ${backupData.metadata.version}`);
    console.log(`   Collections: ${backupData.metadata.totalCollections}`);
    console.log(`   Documents: ${backupData.metadata.totalDocuments}`);

    if (!options.force) {
      console.log('\n⚠️  This will overwrite existing data. Use --force to proceed.');
      return;
    }

    let restoredDocuments = 0;

    for (const [collectionName, documents] of Object.entries(backupData.data)) {
      if (options.collections && !options.collections.includes(collectionName)) {
        console.log(`⏭️  Skipping collection: ${collectionName}`);
        continue;
      }

      console.log(`📦 Restoring collection: ${collectionName} (${documents.length} documents)`);

      if (options.clearCollection) {
        await this.clearCollection(collectionName);
      }

      const batch = db.batch();
      let batchCount = 0;

      for (const doc of documents) {
        const docRef = db.collection(collectionName).doc(doc.id);
        const restoredData = this.restoreTimestamps(doc.data);
        batch.set(docRef, restoredData);
        batchCount++;
        restoredDocuments++;

        // Firestore batch limit is 500 operations
        if (batchCount >= 500) {
          await batch.commit();
          console.log(`   📝 Committed batch of ${batchCount} documents`);
          batchCount = 0;
        }
      }

      if (batchCount > 0) {
        await batch.commit();
        console.log(`   📝 Committed final batch of ${batchCount} documents`);
      }

      console.log(`✅ Restored ${documents.length} documents to ${collectionName}`);
    }

    console.log(`\n🎉 Restore completed successfully!`);
    console.log(`📊 Total documents restored: ${restoredDocuments}`);
  }

  async clearCollection(collectionName) {
    console.log(`🗑️  Clearing collection: ${collectionName}`);
    
    const snapshot = await db.collection(collectionName).get();
    
    if (snapshot.empty) {
      console.log(`   Collection ${collectionName} is already empty`);
      return;
    }

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`   🗑️  Cleared ${snapshot.docs.length} documents from ${collectionName}`);
  }

  async listBackups() {
    this.ensureBackupDirectory();
    
    const files = fs.readdirSync(this.backupDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const filepath = path.join(this.backupDir, file);
        const stats = fs.statSync(filepath);
        
        try {
          const backup = JSON.parse(fs.readFileSync(filepath, 'utf8'));
          return {
            filename: file,
            path: filepath,
            size: stats.size,
            created: stats.mtime,
            collections: backup.metadata?.totalCollections || 'Unknown',
            documents: backup.metadata?.totalDocuments || 'Unknown',
            valid: true
          };
        } catch (error) {
          return {
            filename: file,
            path: filepath,
            size: stats.size,
            created: stats.mtime,
            valid: false,
            error: error.message
          };
        }
      })
      .sort((a, b) => b.created - a.created);

    if (files.length === 0) {
      console.log('📭 No backup files found');
      return;
    }

    console.log(`📋 Found ${files.length} backup files:\n`);
    
    files.forEach((file, index) => {
      const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
      const status = file.valid ? '✅' : '❌';
      
      console.log(`${index + 1}. ${status} ${file.filename}`);
      console.log(`   📅 Created: ${file.created.toLocaleString()}`);
      console.log(`   💾 Size: ${sizeInMB} MB`);
      
      if (file.valid) {
        console.log(`   📊 Collections: ${file.collections}, Documents: ${file.documents}`);
      } else {
        console.log(`   ❌ Error: ${file.error}`);
      }
      console.log('');
    });
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const backup = new FirestoreBackup();

  try {
    switch (command) {
      case 'backup':
        const collections = process.argv[3] ? process.argv[3].split(',') : null;
        await backup.backupDatabase(collections);
        break;

      case 'restore':
        const backupPath = process.argv[3];
        if (!backupPath) {
          console.error('❌ Please provide backup file path: npm run db:backup restore <path>');
          process.exit(1);
        }
        
        const options = {
          force: process.argv.includes('--force'),
          clearCollection: process.argv.includes('--clear'),
          collections: process.argv.includes('--collections') 
            ? process.argv[process.argv.indexOf('--collections') + 1]?.split(',')
            : null
        };
        
        await backup.restoreDatabase(backupPath, options);
        break;

      case 'list':
        await backup.listBackups();
        break;

      case 'clear':
        const collectionToClear = process.argv[3];
        if (!collectionToClear) {
          console.error('❌ Please provide collection name: npm run db:backup clear <collection>');
          process.exit(1);
        }
        
        if (!process.argv.includes('--force')) {
          console.error('❌ Use --force to confirm collection clearing');
          process.exit(1);
        }
        
        await backup.clearCollection(collectionToClear);
        break;

      default:
        console.log(`
💾 Firestore Backup & Restore Tool

Usage:
  node scripts/backup.js <command> [options]

Commands:
  backup [collections]              Create backup of all or specific collections
  restore <path> [options]          Restore from backup file  
  list                             List available backup files
  clear <collection> --force       Clear all documents from collection

Backup Options:
  collections                      Comma-separated list of collections to backup

Restore Options:
  --force                         Confirm restore operation
  --clear                         Clear collections before restore
  --collections <list>            Comma-separated list of collections to restore

Examples:
  node scripts/backup.js backup
  node scripts/backup.js backup users,projects
  node scripts/backup.js restore backups/firestore_backup_20240115120000.json --force
  node scripts/backup.js restore backup.json --force --clear --collections users,projects
  node scripts/backup.js list
  node scripts/backup.js clear test_collection --force
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Operation failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = FirestoreBackup;
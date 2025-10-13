# Database Management Implementation Guide

## 🎯 Quick Start

This guide shows how to implement the complete database management system for TETRIX. All scripts and tools have been created and are ready to use.

## 📋 What Has Been Implemented

### ✅ Complete Database Management Suite
1. **Migration System** - Version-controlled schema changes
2. **Backup & Restore** - Full database backup and recovery
3. **Data Seeding** - Development and test data population  
4. **Security Rules** - Production-ready Firestore rules
5. **Package Scripts** - Easy-to-use npm commands

## 🚀 Getting Started

### 1. Install Dependencies
```bash
# Already installed in the project
# firebase-admin is included in services/api/package.json
```

### 2. Set Up Firebase Credentials
```bash
# Set up Firebase Admin credentials
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/your/service-account-key.json"

# Or use Application Default Credentials
gcloud auth application-default login
```

### 3. Initialize Database Management
```bash
# Create your first migration
npm run db:migrate:create initial_setup

# Create development seed data
npm run db:seed:create development

# Check migration status
npm run db:migrate:status
```

## 📊 Database Operations

### Migration Management

#### Create a New Migration
```bash
# Create migration for adding user indexes
npm run db:migrate:create add_user_indexes

# Create migration for new collection
npm run db:migrate:create create_notifications_collection
```

#### Run Migrations
```bash
# Run all pending migrations
npm run db:migrate

# Check what will be migrated
npm run db:migrate:status

# Rollback to specific version
npm run db:migrate:rollback 20240115120000_initial_setup
```

#### Example Migration File
```javascript
// migrations/20240115120000_add_user_indexes.js
module.exports = {
  name: 'add_user_indexes',
  description: 'Add indexes for user queries',

  async up(db) {
    // Create composite index for user role and status queries
    await db.collection('users').doc('_index_config').set({
      indexes: [
        { fields: ['role', 'status'] },
        { fields: ['email'] },
        { fields: ['createdAt'] }
      ]
    });
    
    console.log('✅ User indexes created');
  },

  async down(db) {
    // Remove index configuration
    await db.collection('users').doc('_index_config').delete();
    console.log('✅ User indexes removed');
  }
};
```

### Backup & Restore

#### Create Backups
```bash
# Backup entire database
npm run db:backup

# Backup specific collections
npm run db:backup users,projects,task_items

# List all backups
npm run db:backup:list
```

#### Restore from Backup
```bash
# Restore entire database (requires --force)
npm run db:backup:restore backups/firestore_backup_20240115120000.json --force

# Restore specific collections
npm run db:backup:restore backup.json --force --collections users,projects

# Clear collections before restore
npm run db:backup:restore backup.json --force --clear
```

#### Automated Backup Schedule
```bash
# Add to crontab for daily backups
0 2 * * * cd /path/to/project && npm run db:backup

# Weekly backup with cleanup
0 3 * * 0 cd /path/to/project && npm run db:backup && find backups/ -name "*.json" -mtime +30 -delete
```

### Data Seeding

#### Create Seed Environments
```bash
# Create development seed data
npm run db:seed:create development

# Create test seed data  
npm run db:seed:create test

# Create staging seed data
npm run db:seed:create staging

# List available environments
npm run db:seed:list
```

#### Run Seeding
```bash
# Seed development environment (requires --force)
npm run db:seed development --force

# Seed with collection clearing
npm run db:seed test --force --clear

# Seed specific collections only
npm run db:seed development --force --collections users,projects
```

#### Example Seed File
```javascript
// seeds/development.js
const seedData = {
  users: [
    {
      id: 'admin-001',
      email: 'admin@tetrix.com',
      role: 'admin',
      name: 'Admin User',
      status: 'active',
      createdAt: 'now'
    }
  ],
  
  projects: [
    {
      name: 'Development Test Project',
      description: 'Sample project for development testing',
      annotationType: 'text_classification',
      status: 'active',
      createdBy: 'admin-001',
      createdAt: 'now'
    }
  ]
};

module.exports = { seedData };
```

## 🔐 Security Implementation

### Deploy Security Rules
```bash
# Install Firebase CLI (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project
firebase init firestore

# Deploy security rules
firebase deploy --only firestore:rules

# Deploy indexes
firebase deploy --only firestore:indexes
```

### Security Rules Features
- **Role-based Access Control**: Admin, reviewer, annotator roles
- **Ownership Validation**: Users can only access their own data
- **Field-level Security**: Prevents unauthorized field modifications
- **Status Transition Rules**: Validates workflow state changes
- **Public Contact Form**: Allows anonymous contact submissions

## 📁 Directory Structure

```
project/
├── scripts/
│   ├── migrate.js          # Migration runner
│   ├── backup.js           # Backup & restore
│   └── seed.js             # Data seeding
├── migrations/             # Migration files (auto-created)
├── seeds/                  # Seed data files (auto-created)
├── backups/               # Backup files (auto-created)
├── firestore.rules        # Security rules
└── package.json           # Updated with db scripts
```

## 🛠️ Available NPM Scripts

```json
{
  "scripts": {
    "db:migrate": "node scripts/migrate.js",
    "db:migrate:create": "node scripts/migrate.js create",
    "db:migrate:status": "node scripts/migrate.js status", 
    "db:migrate:rollback": "node scripts/migrate.js rollback",
    "db:backup": "node scripts/backup.js backup",
    "db:backup:restore": "node scripts/backup.js restore",
    "db:backup:list": "node scripts/backup.js list",
    "db:seed": "node scripts/seed.js run",
    "db:seed:create": "node scripts/seed.js create",
    "db:seed:list": "node scripts/seed.js list"
  }
}
```

## 🔄 Development Workflow

### 1. Setting Up Development Environment
```bash
# 1. Create development seed data
npm run db:seed:create development

# 2. Edit seeds/development.js with your test data

# 3. Seed the development database
npm run db:seed development --force --clear

# 4. Start development servers
npm run dev
cd services/api && npm run dev
```

### 2. Making Schema Changes
```bash
# 1. Create migration for your changes
npm run db:migrate:create add_notification_system

# 2. Edit the migration file with up/down logic

# 3. Test migration
npm run db:migrate:status
npm run db:migrate

# 4. Update seed data if needed
# Edit seeds/development.js

# 5. Re-seed development environment
npm run db:seed development --force --clear
```

### 3. Preparing for Production
```bash
# 1. Create production backup
npm run db:backup

# 2. Run all migrations
npm run db:migrate

# 3. Deploy security rules
firebase deploy --only firestore:rules

# 4. Create production seed data (minimal)
npm run db:seed:create production
npm run db:seed production --force --collections users
```

## 🚨 Critical Production Steps

### 1. Security Rules Deployment
⚠️ **CRITICAL**: The current development rules allow public access!

```bash
# Deploy production security rules immediately
firebase deploy --only firestore:rules
```

### 2. Environment Variables
Ensure these are set in production:
```bash
GOOGLE_APPLICATION_CREDENTIALS=/path/to/service-account.json
FIRESTORE_EMULATOR_HOST=  # Remove for production
FIREBASE_AUTH_EMULATOR_HOST=  # Remove for production
```

### 3. Backup Schedule
Set up automated backups:
```bash
# Daily backup at 2 AM
0 2 * * * cd /path/to/project && npm run db:backup

# Weekly cleanup (keep 30 days)
0 3 * * 0 find /path/to/project/backups -name "*.json" -mtime +30 -delete
```

## 🔧 Troubleshooting

### Migration Issues
```bash
# Check migration status
npm run db:migrate:status

# Rollback problematic migration
npm run db:migrate:rollback <previous_version>

# Fix migration file and re-run
npm run db:migrate
```

### Backup/Restore Issues
```bash
# List available backups
npm run db:backup:list

# Test restore on development
npm run db:backup:restore <backup_file> --force --clear

# Verify data integrity
# Check collections manually in Firebase Console
```

### Seeding Issues
```bash
# Check seed file syntax
node -c seeds/development.js

# List available environments
npm run db:seed:list

# Clear collection and re-seed
npm run db:seed development --force --clear --collections users
```

## 📈 Performance Considerations

### Indexes
Create indexes for common queries:
```javascript
// In migration
await db.collection('task_items').doc('_index_').set({
  indexes: [
    ['assignedTo', 'status'],
    ['status', 'createdAt'],
    ['projectId', 'status']
  ]
});
```

### Batch Operations
All scripts use proper batching:
- Backup: Processes collections in chunks
- Restore: Uses Firestore batch writes (500 limit)
- Seeding: Batches inserts for performance

### Query Optimization
- Use compound indexes for multi-field queries
- Limit query results with pagination
- Use array-contains for simple array queries

## 🎯 Next Steps

1. **Deploy Security Rules** (Critical)
2. **Create Initial Migration**
3. **Set Up Development Seeds**
4. **Configure Backup Schedule**
5. **Test Full Workflow**

## 📞 Support

For issues with the database management system:
1. Check the script output for specific error messages
2. Verify Firebase credentials and permissions
3. Ensure collections exist before querying
4. Check Firestore rules for access issues

The database management system is now complete and production-ready! 🎉
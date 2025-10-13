# Database Management & Migration Analysis

## Overview
The TETRIX codebase uses **Firebase Firestore** as its primary database system, with both frontend and backend integrations. This analysis covers the current database setup, data models, management capabilities, and recommendations for improved database administration.

## Database Architecture

### 🔥 Firebase Firestore Setup
- **Database Type**: NoSQL Document Database (Firestore)
- **Frontend SDK**: Firebase v11.9.1 (Web SDK)
- **Backend SDK**: Firebase Admin SDK v11.10.1
- **Authentication**: Firebase Auth
- **Project ID**: `fir-rtc-7b55d`

### 🏗️ Infrastructure Components

#### Frontend Configuration (`src/lib/firebase.js`)
```javascript
// Environment-based configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "fir-rtc-7b55d.firebaseapp.com", 
  projectId: "fir-rtc-7b55d",
  storageBucket: "fir-rtc-7b55d.appspot.com",
  messagingSenderId: "1073036366262",
  appId: "1:1073036366262:web:a76a0e270753f3e9497117"
};
```

#### Backend Configuration (`services/api/src/firebase.ts`)
```typescript
// Admin SDK with application default credentials
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
```

#### Development Environment (Docker)
- **Firestore Emulator**: Port 8080 (gRPC/REST)
- **Auth Emulator**: Port 9099  
- **Emulator UI**: Port 4000
- **Local Development**: Uses emulators for offline development

## Data Models & Collections

### 📊 Current Collection Schema

#### 1. `contact_submissions` (Frontend)
```javascript
{
  id: "auto-generated",
  name: "string",
  email: "string", 
  message: "string",
  timestamp: "serverTimestamp",
  status: "new" | "contacted"
}
```

#### 2. `task_items` (Backend API)
```javascript
{
  id: "string",
  assignedTo: "uid",
  status: "pending" | "in_progress" | "submitted" | "approved" | "rejected",
  annotation: "object",
  submittedAt: "date",
  reviewComment: "string",
  reviewedAt: "date"
}
```

#### 3. `projects` (Backend API)
```javascript
{
  id: "auto-generated",
  name: "string",
  description: "string", 
  annotationType: "string",
  guidelineUrl: "string",
  dueDate: "date",
  status: "draft" | "active" | "completed",
  createdBy: "uid",
  createdAt: "date"
}
```

#### 4. `users` (Backend API)
```javascript
{
  id: "uid",
  walletId: "string",
  role: "admin" | "project_manager" | "reviewer" | "annotator",
  // Additional user profile data
}
```

#### 5. `payments` (Backend API)
```javascript
{
  id: "auto-generated",
  uid: "string",
  amountUSD: "number",
  txHash: "string",
  createdAt: "date"
}
```

## Database Operations Analysis

### ✅ Current Capabilities

#### Frontend Operations
- **Create**: Contact form submissions
- **Read**: Admin panel for viewing submissions
- **Basic CRUD**: Limited to contact submissions

#### Backend Operations
- **Authentication**: Firebase Auth integration
- **Role-based Access**: Admin, reviewer, annotator roles
- **Transaction Support**: Atomic ticket claiming operations
- **Real-time Updates**: Firestore real-time listeners
- **Webhook Integration**: Label Studio webhook handling

### 🔍 Query Patterns

#### Frontend Queries
```javascript
// Simple collection queries
await addDoc(collection(db, 'contact_submissions'), data);
await getDocs(collection(db, 'contact_submissions'));
```

#### Backend Queries
```javascript
// Filtered queries with authentication
await db.collection('task_items')
  .where('assignedTo', '==', uid)
  .where('status', 'in', ['pending', 'in_progress'])
  .get();

// Document transactions
await db.runTransaction(async t => {
  const doc = await t.get(ref);
  t.update(ref, { assignedTo: uid, status: 'in_progress' });
});
```

## Migration & Data Management Assessment

### ❌ Missing Database Management Features

#### 1. **No Migration System**
- No schema version control
- No migration scripts or procedures
- No database structure evolution tracking
- Manual collection creation

#### 2. **No Data Seeding**
- No initial data setup scripts
- No test data generation
- No development environment bootstrap

#### 3. **No Backup/Restore**
- No automated backup procedures
- No data export/import utilities
- No disaster recovery planning

#### 4. **No Schema Validation**
- No data validation rules
- No field type enforcement
- No collection structure documentation

#### 5. **Limited Security Rules**
- Basic "test mode" rules only
- No production-ready security configuration
- No field-level access control

### 🔒 Current Security Configuration

#### Firestore Rules (Development Only)
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /contact_submissions/{document} {
      allow read, write: if true; // INSECURE - Development only
    }
  }
}
```

**⚠️ Security Risk**: Production deployment would expose all data publicly.

## Recommendations for Improvement

### 🚀 1. Implement Migration System

#### Create Migration Framework
```javascript
// migrations/001_initial_collections.js
export const up = async (db) => {
  // Create collections with initial documents
  await db.collection('_migrations').doc('001').set({
    version: '001',
    name: 'initial_collections',
    appliedAt: new Date(),
    description: 'Create initial collections and indexes'
  });
};

export const down = async (db) => {
  // Rollback procedures
  await db.collection('_migrations').doc('001').delete();
};
```

#### Migration Runner Script
```javascript
// scripts/migrate.js
const migrations = [
  require('./migrations/001_initial_collections'),
  require('./migrations/002_add_indexes'),
  require('./migrations/003_user_roles')
];

async function runMigrations(db) {
  const applied = await getAppliedMigrations(db);
  const pending = migrations.filter(m => !applied.includes(m.version));
  
  for (const migration of pending) {
    await migration.up(db);
    console.log(`Applied migration: ${migration.version}`);
  }
}
```

### 📊 2. Data Seeding System

#### Seed Data Structure
```javascript
// seeds/development.js
export const seedData = {
  users: [
    {
      id: 'admin-user',
      email: 'admin@tetrix.com',
      role: 'admin',
      name: 'Admin User'
    }
  ],
  projects: [
    {
      name: 'Sample Annotation Project',
      description: 'Example project for testing',
      annotationType: 'text_classification',
      status: 'active'
    }
  ]
};

// scripts/seed.js
async function seedDatabase(db, environment = 'development') {
  const seeds = require(`./seeds/${environment}`);
  
  for (const [collection, documents] of Object.entries(seeds.seedData)) {
    for (const doc of documents) {
      await db.collection(collection).doc(doc.id || null).set(doc);
    }
  }
}
```

### 💾 3. Backup & Restore System

#### Automated Backup Script
```javascript
// scripts/backup.js
async function backupFirestore(db, outputPath) {
  const collections = ['users', 'projects', 'task_items', 'payments'];
  const backup = {};
  
  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    backup[collectionName] = snapshot.docs.map(doc => ({
      id: doc.id,
      data: doc.data()
    }));
  }
  
  fs.writeFileSync(outputPath, JSON.stringify(backup, null, 2));
}
```

#### Restore Script
```javascript
// scripts/restore.js
async function restoreFirestore(db, backupPath) {
  const backup = JSON.parse(fs.readFileSync(backupPath));
  
  for (const [collection, documents] of Object.entries(backup)) {
    for (const doc of documents) {
      await db.collection(collection).doc(doc.id).set(doc.data);
    }
  }
}
```

### 🔐 4. Production Security Rules

#### Comprehensive Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Contact submissions - admin only
    match /contact_submissions/{document} {
      allow read, write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Task items - role-based access
    match /task_items/{taskId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'reviewer']);
    }
    
    // Projects - admin and project managers
    match /projects/{projectId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'project_manager']);
    }
  }
}
```

### 📋 5. Schema Validation

#### Joi/Zod Validation Schemas
```javascript
// schemas/collections.js
import { z } from 'zod';

export const ContactSubmissionSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  message: z.string().min(10).max(1000),
  status: z.enum(['new', 'contacted']),
  timestamp: z.date()
});

export const TaskItemSchema = z.object({
  assignedTo: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'submitted', 'approved', 'rejected']),
  annotation: z.object({}).optional(),
  submittedAt: z.date().optional(),
  reviewComment: z.string().optional(),
  reviewedAt: z.date().optional()
});
```

### 📚 6. Database Documentation

#### Collection Documentation
```markdown
## Collections Reference

### contact_submissions
**Purpose**: Store contact form submissions from website
**Access**: Admin only
**Fields**:
- `name` (string, required): Contact's full name
- `email` (string, required): Contact's email address  
- `message` (string, required): Contact message
- `timestamp` (timestamp): Submission time
- `status` (enum): 'new' | 'contacted'

### task_items  
**Purpose**: Annotation tasks for data labeling
**Access**: Role-based (annotators, reviewers, admins)
**Fields**:
- `assignedTo` (string): User ID of assigned annotator
- `status` (enum): Task status
- `annotation` (object): Annotation data
- `submittedAt` (timestamp): Submission time
- `reviewComment` (string): Reviewer feedback
- `reviewedAt` (timestamp): Review time
```

## Implementation Priority

### Phase 1: Security & Foundation
1. **Implement production security rules** 🔴 Critical
2. **Add schema validation** 🔴 Critical  
3. **Create environment configuration** 🟡 High

### Phase 2: Management Tools
1. **Migration system** 🟡 High
2. **Backup/restore utilities** 🟡 High
3. **Data seeding for development** 🟢 Medium

### Phase 3: Monitoring & Optimization
1. **Query performance monitoring** 🟢 Medium
2. **Data archiving strategies** 🟢 Medium
3. **Cost optimization** 🟢 Low

## Scripts to Implement

### Package.json Scripts
```json
{
  "scripts": {
    "db:migrate": "node scripts/migrate.js",
    "db:seed": "node scripts/seed.js",
    "db:backup": "node scripts/backup.js",
    "db:restore": "node scripts/restore.js",
    "db:rules:deploy": "firebase deploy --only firestore:rules",
    "db:indexes:deploy": "firebase deploy --only firestore:indexes"
  }
}
```

## Current Status Summary

### ✅ Strengths
- Firebase Firestore properly configured
- Both frontend and backend integration
- Docker emulator setup for development
- Role-based authentication framework
- Transaction support for critical operations

### ❌ Critical Gaps  
- **No migration system** - Schema changes are manual
- **No production security rules** - Data exposed publicly
- **No backup procedures** - Risk of data loss
- **No schema validation** - Data integrity issues
- **No seeding system** - Manual test data setup

### 🎯 Immediate Actions Required
1. **Deploy production security rules** - Critical security vulnerability
2. **Implement backup procedures** - Data protection
3. **Add schema validation** - Data integrity
4. **Create migration framework** - Change management
5. **Setup monitoring** - Operational visibility

The database foundation is solid with Firebase Firestore, but lacks essential production-ready database management capabilities. Implementing the recommended migration, backup, and security systems should be the top priority.
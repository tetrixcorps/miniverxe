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

class DatabaseSeeder {
  constructor() {
    this.seedsDir = path.join(__dirname, '../seeds');
    this.defaultEnvironment = 'development';
  }

  ensureSeedsDirectory() {
    if (!fs.existsSync(this.seedsDir)) {
      fs.mkdirSync(this.seedsDir, { recursive: true });
      console.log(`📁 Created seeds directory: ${this.seedsDir}`);
    }
  }

  getAvailableEnvironments() {
    this.ensureSeedsDirectory();
    return fs.readdirSync(this.seedsDir)
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace('.js', ''));
  }

  async loadSeedData(environment) {
    const seedPath = path.join(this.seedsDir, `${environment}.js`);
    
    if (!fs.existsSync(seedPath)) {
      throw new Error(`Seed file not found: ${seedPath}`);
    }

    try {
      // Clear require cache to allow reloading
      delete require.cache[require.resolve(seedPath)];
      const seedModule = require(seedPath);
      return seedModule.seedData || seedModule;
    } catch (error) {
      throw new Error(`Error loading seed data from ${seedPath}: ${error.message}`);
    }
  }

  async seedCollection(collectionName, documents, options = {}) {
    console.log(`🌱 Seeding collection: ${collectionName} (${documents.length} documents)`);

    if (options.clearFirst) {
      await this.clearCollection(collectionName);
    }

    const batch = db.batch();
    let batchCount = 0;
    let seededCount = 0;

    for (const doc of documents) {
      const docId = doc.id || db.collection(collectionName).doc().id;
      const docRef = db.collection(collectionName).doc(docId);
      
      // Remove id from data if it exists
      const { id, ...docData } = doc;
      
      // Convert string dates to Firestore Timestamps
      const processedData = this.processDataForFirestore(docData);
      
      batch.set(docRef, processedData, { merge: options.merge || false });
      batchCount++;
      seededCount++;

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

    console.log(`✅ Seeded ${seededCount} documents to ${collectionName}`);
    return seededCount;
  }

  processDataForFirestore(obj) {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      // Try to convert ISO date strings to Firestore Timestamps
      if (obj.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
        try {
          return admin.firestore.Timestamp.fromDate(new Date(obj));
        } catch (error) {
          return obj;
        }
      }
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.processDataForFirestore(item));
    }
    
    if (typeof obj === 'object') {
      const processed = {};
      for (const [key, value] of Object.entries(obj)) {
        if (key === 'timestamp' || key.endsWith('At') || key.endsWith('Date')) {
          // Special handling for timestamp fields
          if (value === 'serverTimestamp') {
            processed[key] = admin.firestore.FieldValue.serverTimestamp();
          } else if (value === 'now') {
            processed[key] = admin.firestore.Timestamp.now();
          } else {
            processed[key] = this.processDataForFirestore(value);
          }
        } else {
          processed[key] = this.processDataForFirestore(value);
        }
      }
      return processed;
    }
    
    return obj;
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

  async seedDatabase(environment, options = {}) {
    console.log(`🌱 Starting database seeding for environment: ${environment}`);

    const seedData = await this.loadSeedData(environment);
    
    if (!seedData || typeof seedData !== 'object') {
      throw new Error('Invalid seed data format');
    }

    console.log(`📋 Seed data loaded:`);
    for (const [collection, documents] of Object.entries(seedData)) {
      console.log(`   ${collection}: ${Array.isArray(documents) ? documents.length : 'Invalid'} documents`);
    }

    let totalSeeded = 0;

    for (const [collectionName, documents] of Object.entries(seedData)) {
      if (options.collections && !options.collections.includes(collectionName)) {
        console.log(`⏭️  Skipping collection: ${collectionName}`);
        continue;
      }

      if (!Array.isArray(documents)) {
        console.warn(`⚠️  Skipping ${collectionName}: Invalid data format (expected array)`);
        continue;
      }

      try {
        const seededCount = await this.seedCollection(collectionName, documents, {
          clearFirst: options.clearFirst,
          merge: options.merge
        });
        totalSeeded += seededCount;
      } catch (error) {
        console.error(`❌ Failed to seed ${collectionName}:`, error);
        if (!options.continueOnError) {
          throw error;
        }
      }
    }

    console.log(`\n🎉 Seeding completed successfully!`);
    console.log(`📊 Total documents seeded: ${totalSeeded}`);
  }

  createSeedTemplate(environment) {
    this.ensureSeedsDirectory();
    
    const filename = `${environment}.js`;
    const filepath = path.join(this.seedsDir, filename);

    if (fs.existsSync(filepath)) {
      throw new Error(`Seed file already exists: ${filepath}`);
    }

    const template = `// Seed data for ${environment} environment
// Created: ${new Date().toISOString()}

const seedData = {
  // Users collection
  users: [
    {
      id: 'admin-user',
      email: 'admin@tetrix.com',
      role: 'admin',
      name: 'Admin User',
      createdAt: 'now'
    },
    {
      id: 'reviewer-user', 
      email: 'reviewer@tetrix.com',
      role: 'reviewer',
      name: 'Reviewer User',
      createdAt: 'now'
    },
    {
      id: 'annotator-user',
      email: 'annotator@tetrix.com', 
      role: 'annotator',
      name: 'Annotator User',
      createdAt: 'now'
    }
  ],

  // Projects collection
  projects: [
    {
      name: 'Sample Text Classification Project',
      description: 'Example project for text classification tasks',
      annotationType: 'text_classification',
      guidelineUrl: 'https://example.com/guidelines',
      status: 'active',
      createdBy: 'admin-user',
      createdAt: 'now',
      dueDate: '2024-12-31T23:59:59.000Z'
    },
    {
      name: 'Image Annotation Project',
      description: 'Example project for image annotation tasks',
      annotationType: 'image_annotation',
      guidelineUrl: 'https://example.com/image-guidelines',
      status: 'draft',
      createdBy: 'admin-user',
      createdAt: 'now'
    }
  ],

  // Task items collection
  task_items: [
    {
      id: 'task-001',
      assignedTo: 'annotator-user',
      status: 'pending',
      createdAt: 'now'
    },
    {
      id: 'task-002', 
      assignedTo: 'annotator-user',
      status: 'in_progress',
      createdAt: 'now'
    },
    {
      id: 'task-003',
      assignedTo: 'annotator-user',
      status: 'submitted',
      annotation: {
        result: 'positive',
        confidence: 0.95
      },
      submittedAt: 'now'
    }
  ],

  // Contact submissions (for testing frontend)
  contact_submissions: [
    {
      name: 'John Doe',
      email: 'john@example.com',
      message: 'I am interested in your AI annotation services.',
      status: 'new',
      timestamp: 'serverTimestamp'
    },
    {
      name: 'Jane Smith',
      email: 'jane@company.com',
      message: 'Looking for enterprise solutions for data labeling.',
      status: 'contacted',
      timestamp: 'serverTimestamp'
    }
  ]
};

module.exports = { seedData };
`;

    fs.writeFileSync(filepath, template);
    console.log(`✅ Created seed template: ${filename}`);
    console.log(`📁 Location: ${filepath}`);
    console.log(`📝 Edit this file to customize your seed data`);
  }

  async listEnvironments() {
    const environments = this.getAvailableEnvironments();
    
    if (environments.length === 0) {
      console.log('📭 No seed environments found');
      console.log('💡 Create one with: npm run db:seed create <environment>');
      return;
    }

    console.log(`📋 Available seed environments:\n`);
    
    for (const env of environments) {
      try {
        const seedData = await this.loadSeedData(env);
        const collections = Object.keys(seedData);
        const totalDocs = Object.values(seedData)
          .filter(docs => Array.isArray(docs))
          .reduce((sum, docs) => sum + docs.length, 0);
        
        console.log(`✅ ${env}`);
        console.log(`   📊 Collections: ${collections.length}`);
        console.log(`   📊 Total documents: ${totalDocs}`);
        console.log(`   📁 Collections: ${collections.join(', ')}`);
      } catch (error) {
        console.log(`❌ ${env}`);
        console.log(`   ❌ Error: ${error.message}`);
      }
      console.log('');
    }
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const seeder = new DatabaseSeeder();

  try {
    switch (command) {
      case 'run':
        const environment = process.argv[3] || seeder.defaultEnvironment;
        
        const options = {
          clearFirst: process.argv.includes('--clear'),
          merge: process.argv.includes('--merge'),
          continueOnError: process.argv.includes('--continue-on-error'),
          collections: process.argv.includes('--collections')
            ? process.argv[process.argv.indexOf('--collections') + 1]?.split(',')
            : null
        };

        if (!process.argv.includes('--force')) {
          console.log('⚠️  This will modify your database. Use --force to proceed.');
          process.exit(1);
        }
        
        await seeder.seedDatabase(environment, options);
        break;

      case 'create':
        const newEnvironment = process.argv[3];
        if (!newEnvironment) {
          console.error('❌ Please provide environment name: npm run db:seed create <environment>');
          process.exit(1);
        }
        seeder.createSeedTemplate(newEnvironment);
        break;

      case 'list':
        await seeder.listEnvironments();
        break;

      case 'clear':
        const collectionToClear = process.argv[3];
        if (!collectionToClear) {
          console.error('❌ Please provide collection name: npm run db:seed clear <collection>');
          process.exit(1);
        }
        
        if (!process.argv.includes('--force')) {
          console.error('❌ Use --force to confirm collection clearing');
          process.exit(1);
        }
        
        await seeder.clearCollection(collectionToClear);
        break;

      default:
        console.log(`
🌱 Database Seeding Tool

Usage:
  node scripts/seed.js <command> [options]

Commands:
  run [environment]              Seed database with data from environment
  create <environment>           Create new seed environment template
  list                          List available seed environments  
  clear <collection> --force    Clear all documents from collection

Seeding Options:
  --force                       Confirm seeding operation
  --clear                       Clear collections before seeding
  --merge                       Merge with existing documents
  --continue-on-error           Continue if individual collections fail
  --collections <list>          Comma-separated list of collections to seed

Examples:
  node scripts/seed.js run development --force
  node scripts/seed.js run production --force --clear
  node scripts/seed.js run test --force --collections users,projects
  node scripts/seed.js create staging
  node scripts/seed.js list
  node scripts/seed.js clear test_collection --force

Environments:
  development                   Default development data
  test                         Test data for automated testing
  staging                      Staging environment data
  production                   Production initial data (use carefully!)
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = DatabaseSeeder;
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

class MigrationRunner {
  constructor() {
    this.migrationsPath = path.join(__dirname, '../migrations');
    this.migrationsCollection = '_migrations';
  }

  async getAppliedMigrations() {
    try {
      const snapshot = await db.collection(this.migrationsCollection)
        .orderBy('version')
        .get();
      
      return snapshot.docs.map(doc => doc.data().version);
    } catch (error) {
      console.log('No migrations collection found, creating...');
      return [];
    }
  }

  async getMigrationFiles() {
    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
      console.log(`Created migrations directory: ${this.migrationsPath}`);
      return [];
    }

    return fs.readdirSync(this.migrationsPath)
      .filter(file => file.endsWith('.js'))
      .sort();
  }

  async runMigration(migrationFile) {
    const migrationPath = path.join(this.migrationsPath, migrationFile);
    const migration = require(migrationPath);
    const version = migrationFile.replace('.js', '');

    console.log(`Running migration: ${version}`);
    
    try {
      await migration.up(db);
      
      // Record migration as applied
      await db.collection(this.migrationsCollection).doc(version).set({
        version,
        name: migration.name || version,
        description: migration.description || '',
        appliedAt: admin.firestore.FieldValue.serverTimestamp(),
        appliedBy: process.env.USER || 'system'
      });

      console.log(`✅ Migration ${version} applied successfully`);
    } catch (error) {
      console.error(`❌ Migration ${version} failed:`, error);
      throw error;
    }
  }

  async rollbackMigration(migrationFile) {
    const migrationPath = path.join(this.migrationsPath, migrationFile);
    const migration = require(migrationPath);
    const version = migrationFile.replace('.js', '');

    console.log(`Rolling back migration: ${version}`);
    
    try {
      if (migration.down) {
        await migration.down(db);
      } else {
        console.warn(`⚠️  No rollback function found for ${version}`);
        return;
      }
      
      // Remove migration record
      await db.collection(this.migrationsCollection).doc(version).delete();

      console.log(`✅ Migration ${version} rolled back successfully`);
    } catch (error) {
      console.error(`❌ Rollback ${version} failed:`, error);
      throw error;
    }
  }

  async migrate() {
    console.log('🚀 Starting database migration...');

    const appliedMigrations = await this.getAppliedMigrations();
    const migrationFiles = await this.getMigrationFiles();

    const pendingMigrations = migrationFiles.filter(file => {
      const version = file.replace('.js', '');
      return !appliedMigrations.includes(version);
    });

    if (pendingMigrations.length === 0) {
      console.log('✅ No pending migrations');
      return;
    }

    console.log(`Found ${pendingMigrations.length} pending migrations:`);
    pendingMigrations.forEach(file => console.log(`  - ${file}`));

    for (const migrationFile of pendingMigrations) {
      await this.runMigration(migrationFile);
    }

    console.log('🎉 All migrations completed successfully!');
  }

  async rollback(targetVersion) {
    console.log(`🔙 Rolling back to version: ${targetVersion}`);

    const appliedMigrations = await this.getAppliedMigrations();
    const migrationFiles = await this.getMigrationFiles();

    // Find migrations to rollback (newer than target)
    const migrationsToRollback = migrationFiles
      .filter(file => {
        const version = file.replace('.js', '');
        return appliedMigrations.includes(version) && version > targetVersion;
      })
      .reverse(); // Rollback in reverse order

    if (migrationsToRollback.length === 0) {
      console.log('✅ No migrations to rollback');
      return;
    }

    console.log(`Rolling back ${migrationsToRollback.length} migrations:`);
    migrationsToRollback.forEach(file => console.log(`  - ${file}`));

    for (const migrationFile of migrationsToRollback) {
      await this.rollbackMigration(migrationFile);
    }

    console.log('🎉 Rollback completed successfully!');
  }

  async status() {
    console.log('📊 Migration Status:');
    
    const appliedMigrations = await this.getAppliedMigrations();
    const migrationFiles = await this.getMigrationFiles();

    if (migrationFiles.length === 0) {
      console.log('No migration files found');
      return;
    }

    console.log('\nMigrations:');
    migrationFiles.forEach(file => {
      const version = file.replace('.js', '');
      const isApplied = appliedMigrations.includes(version);
      const status = isApplied ? '✅ Applied' : '⏳ Pending';
      console.log(`  ${version}: ${status}`);
    });

    const pendingCount = migrationFiles.length - appliedMigrations.length;
    console.log(`\nSummary: ${appliedMigrations.length} applied, ${pendingCount} pending`);
  }

  async createMigration(name) {
    const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
    const version = `${timestamp}_${name}`;
    const filename = `${version}.js`;
    const filepath = path.join(this.migrationsPath, filename);

    if (!fs.existsSync(this.migrationsPath)) {
      fs.mkdirSync(this.migrationsPath, { recursive: true });
    }

    const template = `// Migration: ${name}
// Created: ${new Date().toISOString()}

module.exports = {
  name: '${name}',
  description: 'Description of what this migration does',

  async up(db) {
    // Migration logic goes here
    console.log('Running migration: ${name}');
    
    // Example: Create a collection with initial data
    // await db.collection('new_collection').doc('initial').set({
    //   createdAt: new Date(),
    //   version: '1.0.0'
    // });
    
    // Example: Create indexes
    // await db.collection('users').doc('_index_').set({
    //   indexes: ['email', 'role', 'createdAt']
    // });
  },

  async down(db) {
    // Rollback logic goes here
    console.log('Rolling back migration: ${name}');
    
    // Example: Remove collection
    // const batch = db.batch();
    // const snapshot = await db.collection('new_collection').get();
    // snapshot.docs.forEach(doc => batch.delete(doc.ref));
    // await batch.commit();
  }
};
`;

    fs.writeFileSync(filepath, template);
    console.log(`✅ Created migration: ${filename}`);
    console.log(`📁 Location: ${filepath}`);
  }
}

// CLI Interface
async function main() {
  const command = process.argv[2];
  const runner = new MigrationRunner();

  try {
    switch (command) {
      case 'migrate':
      case 'up':
        await runner.migrate();
        break;

      case 'rollback':
      case 'down':
        const targetVersion = process.argv[3];
        if (!targetVersion) {
          console.error('❌ Please provide target version: npm run db:migrate rollback <version>');
          process.exit(1);
        }
        await runner.rollback(targetVersion);
        break;

      case 'status':
        await runner.status();
        break;

      case 'create':
        const migrationName = process.argv[3];
        if (!migrationName) {
          console.error('❌ Please provide migration name: npm run db:migrate create <name>');
          process.exit(1);
        }
        await runner.createMigration(migrationName);
        break;

      default:
        console.log(`
🗃️  Database Migration Tool

Usage:
  node scripts/migrate.js <command> [options]

Commands:
  migrate, up                    Run pending migrations
  rollback, down <version>       Rollback to specific version
  status                         Show migration status
  create <name>                  Create new migration file

Examples:
  node scripts/migrate.js migrate
  node scripts/migrate.js rollback 20240115120000_initial
  node scripts/migrate.js status
  node scripts/migrate.js create add_user_indexes
        `);
        break;
    }
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = MigrationRunner;
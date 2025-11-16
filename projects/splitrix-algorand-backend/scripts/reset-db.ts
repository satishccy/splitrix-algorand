#!/usr/bin/env tsx

/**
 * Database Reset Script
 * 
 * This script resets the database by:
 * 1. Dropping all existing data and tables
 * 2. Recreating the database schema using migrations
 * 3. Initializing default SyncStatus record
 * 4. Optionally seeding initial data
 * 
 * Usage:
 *   pnpm run reset:db
 *   pnpm run reset:db:seed
 */

import { execSync } from 'child_process';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resetDatabase(seed: boolean = false) {
  try {
    console.log('🔄 Starting database reset...\n');

    // Step 1: Reset database using Prisma migrate reset
    // This will drop the database, recreate it, and apply all migrations
    console.log('📦 Resetting database (dropping all data and tables)...');
    try {
      const resetCommand = seed 
        ? 'npx prisma migrate reset --force'
        : 'npx prisma migrate reset --force --skip-seed';
      
      execSync(resetCommand, {
        stdio: 'inherit',
        cwd: process.cwd(),
        env: { ...process.env, PRISMA_MIGRATE_SKIP_SEED: seed ? 'false' : 'true' },
      });
      console.log('✅ Database reset complete\n');
    } catch (error: any) {
      console.error('❌ Error resetting database:', error.message);
      throw error;
    }

    // Step 2: Initialize SyncStatus record
    console.log('📊 Initializing SyncStatus...');
    try {
      await prisma.syncStatus.upsert({
        where: { id: 1 },
        update: {
          lastSyncedBlock: BigInt(0),
        },
        create: {
          id: 1,
          lastSyncedBlock: BigInt(0),
        },
      });
      console.log('✅ SyncStatus initialized with lastSyncedBlock = 0\n');
    } catch (error: any) {
      console.error('❌ Error initializing SyncStatus:', error.message);
      throw error;
    }

    // Step 3: Seed data if requested
    if (seed) {
      console.log('🌱 Seeding initial data...');
      // Add seed logic here if needed
      // Example:
      // await prisma.group.create({ ... });
      console.log('✅ Seed data applied (no seed data configured)\n');
    }

    console.log('✨ Database reset complete!');
    console.log('\n📝 Next steps:');
    console.log('   - Start the indexer to sync blockchain data');
    console.log('   - Start the API server');
  } catch (error: any) {
    console.error('\n❌ Database reset failed:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);
const seed = args.includes('--seed') || args.includes('seed');

resetDatabase(seed);


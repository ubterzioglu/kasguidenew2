#!/usr/bin/env node
/**
 * Database Migration Runner
 * Executes schema creation and seed data insertion
 *
 * Usage:
 *   node db/migrate.js        - Run all migrations
 *   node db/migrate.js schema - Run schema only
 *   node db/migrate.js seeds  - Run seeds only
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Execute SQL file
 * @param {string} filePath - Path to SQL file
 */
async function executeSQLFile(filePath) {
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');

    // Split by semicolons but be careful with function definitions
    const statements = sqlContent
      .split(/;\s*$/gm)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Executing: ${path.basename(filePath)}`);

    for (const statement of statements) {
      if (statement.trim()) {
        await sql.query(statement);
      }
    }

    console.log(`✅ Completed: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Error in ${path.basename(filePath)}:`, error.message);
    throw error;
  }
}

/**
 * Run schema migration
 */
async function runSchema() {
  console.log('\n🔨 Creating database schema...\n');
  const schemaPath = path.join(__dirname, 'schema.sql');
  await executeSQLFile(schemaPath);
}

/**
 * Run seed data
 */
async function runSeeds() {
  console.log('\n🌱 Inserting seed data...\n');
  const seedsDir = path.join(__dirname, 'seeds');

  // Get all .sql files in seeds directory, sorted
  const seedFiles = fs.readdirSync(seedsDir)
    .filter(file => file.endsWith('.sql'))
    .sort(); // Ensures 01_, 02_, etc. run in order

  for (const file of seedFiles) {
    const filePath = path.join(seedsDir, file);
    await executeSQLFile(filePath);
  }
}

/**
 * Test database connection
 */
async function testConnection() {
  try {
    const result = await sql`SELECT NOW() as current_time, version() as pg_version`;
    console.log('✅ Database connected');
    console.log(`   Time: ${result.rows[0].current_time}`);
    console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]}`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    console.error('\n⚠️  Make sure you have:');
    console.error('   1. Created a Vercel Postgres database');
    console.error('   2. Set environment variables in .env.local:');
    console.error('      POSTGRES_URL');
    console.error('      POSTGRES_PRISMA_URL');
    console.error('      POSTGRES_URL_NON_POOLING');
    console.error('      POSTGRES_USER');
    console.error('      POSTGRES_HOST');
    console.error('      POSTGRES_PASSWORD');
    console.error('      POSTGRES_DATABASE');
    return false;
  }
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  console.log('╔════════════════════════════════════════╗');
  console.log('║   Kaş Guide Database Migration         ║');
  console.log('╚════════════════════════════════════════╝\n');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    if (command === 'schema' || command === 'all') {
      await runSchema();
    }

    if (command === 'seeds' || command === 'all') {
      await runSeeds();
    }

    console.log('\n✨ Migration completed successfully!\n');
  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { runSchema, runSeeds, testConnection };

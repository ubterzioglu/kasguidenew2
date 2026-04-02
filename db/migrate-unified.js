#!/usr/bin/env node
/**
 * Unified Items Migration Runner
 * Migrates from multi-table system to unified items table
 *
 * Usage:
 *   node db/migrate-unified.js                - Run full migration
 *   node db/migrate-unified.js verify         - Verify migration results
 *   node db/migrate-unified.js rollback       - Rollback to multi-table (drops items table)
 *   node db/migrate-unified.js schema-only    - Create schema without migrating data
 *   node db/migrate-unified.js data-only      - Migrate data (assumes schema exists)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from './connection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Execute SQL file
 */
async function executeSQLFile(filePath) {
  try {
    const sqlContent = fs.readFileSync(filePath, 'utf8');

    // Split by semicolons
    const statements = sqlContent
      .split(/;\s*$/gm)
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📄 Executing: ${path.basename(filePath)}`);
    console.log(`   Found ${statements.length} statements\n`);

    for (let i = 0; i < statements.length; i++) {
      if (statements[i].trim()) {
        try {
          await sql.query(statements[i]);
          console.log(`   ✅ Statement ${i + 1}/${statements.length} executed`);
        } catch (error) {
          console.error(`   ❌ Statement ${i + 1} failed:`, error.message);
          throw error;
        }
      }
    }

    console.log(`\n✅ Completed: ${path.basename(filePath)}\n`);
  } catch (error) {
    console.error(`❌ Error in ${path.basename(filePath)}:`, error.message);
    throw error;
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
    console.log(`   PostgreSQL: ${result.rows[0].pg_version.split(' ')[0]}\n`);
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

/**
 * Create backup of current data
 */
async function createBackup() {
  console.log('💾 Creating backup of current data...\n');

  try {
    // Count records in each table
    const counts = {
      places: await sql`SELECT COUNT(*) FROM places`,
      pets: await sql`SELECT COUNT(*) FROM pets`,
      hotels: await sql`SELECT COUNT(*) FROM hotels`,
      artists: await sql`SELECT COUNT(*) FROM artists`
    };

    console.log('Current record counts:');
    console.log(`   Places:  ${counts.places.rows[0].count}`);
    console.log(`   Pets:    ${counts.pets.rows[0].count}`);
    console.log(`   Hotels:  ${counts.hotels.rows[0].count}`);
    console.log(`   Artists: ${counts.artists.rows[0].count}`);
    console.log(`   ────────────────────────`);
    console.log(`   Total:   ${
      parseInt(counts.places.rows[0].count) +
      parseInt(counts.pets.rows[0].count) +
      parseInt(counts.hotels.rows[0].count) +
      parseInt(counts.artists.rows[0].count)
    }\n`);

    return counts;
  } catch (error) {
    console.error('❌ Backup failed:', error.message);
    throw error;
  }
}

/**
 * Create unified schema
 */
async function createSchema() {
  console.log('🔨 Creating unified schema...\n');
  const schemaPath = path.join(__dirname, 'schema-unified.sql');
  await executeSQLFile(schemaPath);
}

/**
 * Migrate data to unified table
 */
async function migrateData() {
  console.log('📦 Migrating data to unified items table...\n');
  const migratePath = path.join(__dirname, 'migrate-to-unified.sql');
  await executeSQLFile(migratePath);
}

/**
 * Verify migration
 */
async function verifyMigration() {
  console.log('🔍 Verifying migration...\n');

  try {
    // Count items by type
    const itemCounts = await sql`
      SELECT item_type, COUNT(*) as count
      FROM items
      GROUP BY item_type
      ORDER BY item_type
    `;

    console.log('Items in unified table:');
    let total = 0;
    for (const row of itemCounts.rows) {
      console.log(`   ${row.item_type.padEnd(10)}: ${row.count}`);
      total += parseInt(row.count);
    }
    console.log(`   ────────────────────────`);
    console.log(`   Total:       ${total}\n`);

    // Check for unique item numbers
    const uniqueCheck = await sql`
      SELECT item_type,
             COUNT(DISTINCT item_number) as unique_numbers,
             COUNT(*) as total
      FROM items
      GROUP BY item_type
    `;

    console.log('Item number uniqueness check:');
    let allUnique = true;
    for (const row of uniqueCheck.rows) {
      const isUnique = row.unique_numbers === row.total;
      console.log(`   ${row.item_type.padEnd(10)}: ${row.unique_numbers}/${row.total} ${isUnique ? '✅' : '❌'}`);
      if (!isUnique) allUnique = false;
    }
    console.log();

    // Check for NULL required fields
    const nullCheck = await sql`
      SELECT
        COUNT(*) FILTER (WHERE title IS NULL) as null_titles,
        COUNT(*) FILTER (WHERE item_number IS NULL) as null_numbers,
        COUNT(*) FILTER (WHERE item_type IS NULL) as null_types
      FROM items
    `;

    const nulls = nullCheck.rows[0];
    console.log('Required fields check:');
    console.log(`   NULL titles:  ${nulls.null_titles} ${nulls.null_titles === '0' ? '✅' : '❌'}`);
    console.log(`   NULL numbers: ${nulls.null_numbers} ${nulls.null_numbers === '0' ? '✅' : '❌'}`);
    console.log(`   NULL types:   ${nulls.null_types} ${nulls.null_types === '0' ? '✅' : '❌'}`);
    console.log();

    // Sample items from each type
    console.log('Sample items (first item of each type):');
    const samples = await sql`
      SELECT DISTINCT ON (item_type)
        item_type,
        item_number,
        title,
        CASE
          WHEN photos IS NOT NULL THEN JSONB_ARRAY_LENGTH(photos)
          ELSE 0
        END as photo_count
      FROM items
      ORDER BY item_type, id
    `;

    for (const row of samples.rows) {
      console.log(`   ${row.item_type.padEnd(10)}: ${row.item_number} - ${row.title.substring(0, 40)}... (${row.photo_count} photos)`);
    }
    console.log();

    if (allUnique && nulls.null_titles === '0' && nulls.null_numbers === '0' && nulls.null_types === '0') {
      console.log('✅ Migration verification PASSED\n');
      return true;
    } else {
      console.log('⚠️  Migration verification found issues\n');
      return false;
    }

  } catch (error) {
    console.error('❌ Verification failed:', error.message);
    throw error;
  }
}

/**
 * Rollback migration (drop items table)
 */
async function rollback() {
  console.log('⚠️  ROLLBACK: Dropping items table...\n');

  try {
    await sql`DROP TABLE IF EXISTS items CASCADE`;
    console.log('✅ Items table dropped');
    console.log('✅ Old tables (places, pets, hotels, artists) are still intact\n');
  } catch (error) {
    console.error('❌ Rollback failed:', error.message);
    throw error;
  }
}

/**
 * Main migration function
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║   Kaş Guide - Unified Items Migration             ║');
  console.log('║   Multi-table → Single Items Table                 ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  // Test connection first
  const connected = await testConnection();
  if (!connected) {
    process.exit(1);
  }

  try {
    switch (command) {
      case 'verify':
        await verifyMigration();
        break;

      case 'rollback':
        console.log('⚠️  WARNING: This will drop the items table!');
        console.log('   Old tables will remain intact.\n');
        await rollback();
        break;

      case 'schema-only':
        await createSchema();
        console.log('✅ Schema created. Run with "data-only" to migrate data.\n');
        break;

      case 'data-only':
        await createBackup();
        await migrateData();
        await verifyMigration();
        break;

      case 'all':
      default:
        console.log('Starting full migration process...\n');
        console.log('Steps:');
        console.log('  1. Backup current data');
        console.log('  2. Create unified schema');
        console.log('  3. Migrate data');
        console.log('  4. Verify migration\n');

        await createBackup();
        await createSchema();
        await migrateData();
        const verified = await verifyMigration();

        if (verified) {
          console.log('╔════════════════════════════════════════════════════╗');
          console.log('║   ✅ MIGRATION COMPLETED SUCCESSFULLY              ║');
          console.log('╚════════════════════════════════════════════════════╝\n');
          console.log('Next steps:');
          console.log('  1. Test the unified API endpoints');
          console.log('  2. Update frontend to use new endpoints');
          console.log('  3. Once verified, old tables can be dropped\n');
          console.log('To rollback: node db/migrate-unified.js rollback\n');
        } else {
          console.log('⚠️  Migration completed with warnings. Please review.\n');
        }
        break;
    }

    console.log('✨ Process completed!\n');

  } catch (error) {
    console.error('\n💥 Migration failed:', error.message);
    console.error('\nTo rollback: node db/migrate-unified.js rollback\n');
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { createSchema, migrateData, verifyMigration, rollback };

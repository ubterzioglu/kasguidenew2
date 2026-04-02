#!/usr/bin/env node

/**
 * Database Reset & Rebuild Script (Node.js)
 * ============================================================================
 * WARNING: This will DELETE ALL DATA in the database!
 * Use only for development/testing purposes.
 *
 * Usage:
 *   node db/reset-database.js
 */

import sql from '../db/connection.js';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Helper to ask yes/no questions
function askQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

// Smart SQL parser that handles function definitions
function parseSqlStatements(sqlContent) {
  const statements = [];
  let current = '';
  let inDollarQuote = false;
  let dollarQuoteTag = null;

  const lines = sqlContent.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('--')) {
      continue;
    }

    // Check for dollar quote markers ($$, $BODY$, etc.)
    const dollarMatches = line.match(/\$([A-Za-z_]*)\$/g);
    if (dollarMatches) {
      for (const match of dollarMatches) {
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarQuoteTag = match;
        } else if (match === dollarQuoteTag) {
          inDollarQuote = false;
          dollarQuoteTag = null;
        }
      }
    }

    current += line + '\n';

    // If we hit a semicolon and we're not inside a dollar quote, it's a statement
    if (line.includes(';') && !inDollarQuote) {
      const stmt = current.trim();
      if (stmt && !stmt.startsWith('--')) {
        statements.push(stmt);
      }
      current = '';
    }
  }

  // Add any remaining statement
  if (current.trim()) {
    statements.push(current.trim());
  }

  return statements;
}

// Execute SQL file
async function executeSqlFile(filePath, description) {
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
  console.log(`${description}...`);
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);

  const sqlContent = await fs.readFile(filePath, 'utf-8');
  const statements = parseSqlStatements(sqlContent);

  for (const statement of statements) {
    try {
      await sql.query(statement);
    } catch (error) {
      // Ignore "does not exist" and "already exists" errors
      if (!error.message.includes('does not exist') &&
          !error.message.includes('already exists')) {
        console.error(`❌ Error executing statement:`, error.message);
        console.error(`Statement: ${statement.substring(0, 150)}...`);
        throw error;
      }
    }
  }

  console.log(`✅ ${description} - Complete`);
}

// Main reset function
async function resetDatabase() {
  try {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🗑️  DATABASE RESET & REBUILD (Node.js)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n⚠️  WARNING: This will DELETE ALL DATA in the database!\n');

    const answer = await askQuestion('Are you sure you want to continue? (yes/no): ');

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ Aborted.');
      process.exit(0);
    }

    console.log('\n🔍 Checking database connection...');
    await sql`SELECT 1`;
    console.log('✅ Database connection successful\n');

    // Step 1: Drop all tables
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 1: Dropping all tables and functions...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Drop tables
    await sql`DROP TABLE IF EXISTS items CASCADE`;
    await sql`DROP TABLE IF EXISTS categories CASCADE`;
    await sql`DROP TABLE IF EXISTS badges CASCADE`;

    // Drop old tables
    await sql`DROP TABLE IF EXISTS places CASCADE`;
    await sql`DROP TABLE IF EXISTS place_images CASCADE`;
    await sql`DROP TABLE IF EXISTS place_categories CASCADE`;
    await sql`DROP TABLE IF EXISTS place_facilities CASCADE`;
    await sql`DROP TABLE IF EXISTS place_features CASCADE`;
    await sql`DROP TABLE IF EXISTS place_tags CASCADE`;
    await sql`DROP TABLE IF EXISTS pets CASCADE`;
    await sql`DROP TABLE IF EXISTS hotels CASCADE`;
    await sql`DROP TABLE IF EXISTS hotel_images CASCADE`;
    await sql`DROP TABLE IF EXISTS artists CASCADE`;
    await sql`DROP TABLE IF EXISTS articles CASCADE`;
    await sql`DROP TABLE IF EXISTS faq_series CASCADE`;
    await sql`DROP TABLE IF EXISTS submissions CASCADE`;

    // Drop functions
    await sql`DROP FUNCTION IF EXISTS get_next_item_number(VARCHAR) CASCADE`;
    await sql`DROP FUNCTION IF EXISTS get_next_place_number() CASCADE`;
    await sql`DROP FUNCTION IF EXISTS get_next_pet_number() CASCADE`;
    await sql`DROP FUNCTION IF EXISTS get_next_hotel_number() CASCADE`;
    await sql`DROP FUNCTION IF EXISTS get_next_artist_number() CASCADE`;

    console.log('✅ All tables and functions dropped');

    // Step 2: Create schema
    await executeSqlFile(
      join(__dirname, 'schema-unified.sql'),
      'Step 2: Creating unified schema'
    );

    // Step 3: Load categories
    await executeSqlFile(
      join(__dirname, 'seeds/01_categories.sql'),
      'Step 3: Loading categories'
    );

    // Step 4: Load badges
    await executeSqlFile(
      join(__dirname, 'seeds/02_badges.sql'),
      'Step 4: Loading badges'
    );

    // Step 5: Verify
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('Step 5: Verifying database...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    const tables = await sql`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;
    console.log(`📊 Tables created: ${tables.rows[0].count}`);

    const categories = await sql`SELECT COUNT(*) as count FROM categories`;
    console.log(`📊 Categories loaded: ${categories.rows[0].count}`);

    const badges = await sql`SELECT COUNT(*) as count FROM badges`;
    console.log(`📊 Badges loaded: ${badges.rows[0].count}`);

    const items = await sql`SELECT COUNT(*) as count FROM items`;
    console.log(`📊 Items in database: ${items.rows[0].count}`);

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 DATABASE RESET COMPLETE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n✅ Database is now clean and ready for use.');
    console.log('📝 You can now add items using the web form or API.\n');

  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }

  // Connection will be closed automatically when process exits
  process.exit(0);
}

// Run the reset
resetDatabase();

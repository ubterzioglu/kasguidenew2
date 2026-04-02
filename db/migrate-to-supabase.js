#!/usr/bin/env node
/**
 * Supabase Migration Script
 * Creates tables and imports data to Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const match = trimmed.match(/^([^=]+)=(.*)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = value;
          }
        }
      }
    });
  }
}

loadEnv();

const SUPABASE_URL = process.env.SUPABASE_DATABASE_URL || process.env.SUPABASE_URL;

if (!SUPABASE_URL) {
  console.error('❌ SUPABASE_DATABASE_URL not found in .env.local');
  console.error('Add this line to .env.local:');
  console.error('SUPABASE_DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"');
  process.exit(1);
}

const pool = new Pool({
  connectionString: SUPABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting Supabase migration...\n');
    
    // Test connection
    const testResult = await client.query('SELECT NOW() as time, version() as ver');
    console.log('✅ Connected to Supabase');
    console.log(`   Server Time: ${testResult.rows[0].time}`);
    console.log(`   PostgreSQL: ${testResult.rows[0].ver.split(' ')[0]}\n`);
    
    // Read and execute schema
    const schemaPath = path.join(__dirname, 'supabase-schema.sql');
    const schemaSQL = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('📦 Creating tables...');
    await client.query(schemaSQL);
    console.log('✅ Tables created successfully\n');
    
    // Import seed data
    console.log('🌱 Importing seed data...');
    
    const categoriesSQL = fs.readFileSync(path.join(__dirname, 'seeds', '01_categories.sql'), 'utf8');
    await client.query(categoriesSQL);
    console.log('   ✅ Categories imported');
    
    const badgesSQL = fs.readFileSync(path.join(__dirname, 'seeds', '02_badges.sql'), 'utf8');
    await client.query(badgesSQL);
    console.log('   ✅ Badges imported\n');
    
    // Verify
    const tables = ['items', 'categories', 'badges', 'articles', 'faqs', 'faq_series', 'admin_users'];
    console.log('📊 Table verification:');
    for (const table of tables) {
      try {
        const result = await client.query(`SELECT COUNT(*) as count FROM ${table}`);
        console.log(`   ${table}: ${result.rows[0].count} rows`);
      } catch (e) {
        console.log(`   ${table}: ❌ ${e.message}`);
      }
    }
    
    console.log('\n✨ Migration completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Update .env.local with SUPABASE_DATABASE_URL');
    console.log('2. Update POSTGRES_URL to point to Supabase');
    console.log('3. Test the connection: npm run db:supabase:test');
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration();

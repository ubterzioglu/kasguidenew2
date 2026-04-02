#!/usr/bin/env node
/**
 * Pull all remote database data to local JSON files.
 *
 * Strategy:
 * 1) Try current POSTGRES_URL / DATABASE_URL / SUPABASE_DATABASE_URL.
 * 2) If that fails and host is db.<ref>.supabase.co, retry via IPv4 pooler.
 * 3) Export all non-system tables into db/local-dump/<timestamp>/.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.join(__dirname, '..');

function parseEnvFile(envFilePath) {
  if (!fs.existsSync(envFilePath)) return {};
  const raw = fs.readFileSync(envFilePath, 'utf8');
  const entries = raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#') && line.includes('='))
    .map((line) => {
      const idx = line.indexOf('=');
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      return [key, value];
    });
  return Object.fromEntries(entries);
}

function loadLocalEnv() {
  const envLocal = parseEnvFile(path.join(projectRoot, '.env.local'));
  const env = parseEnvFile(path.join(projectRoot, '.env'));

  // Priority: process.env > .env.local > .env
  const merged = { ...env, ...envLocal, ...process.env };
  return merged;
}

function getConnectionCandidates(env) {
  const candidates = [];
  const directUrl =
    env.POSTGRES_URL || env.DATABASE_URL || env.SUPABASE_DATABASE_URL || null;

  if (directUrl) {
    candidates.push({
      name: 'direct-url',
      connectionString: directUrl,
    });
  }

  const host = env.PGHOST || '';
  const hostMatch = host.match(/^db\.([^.]+)\.supabase\.co$/);
  if (hostMatch) {
    const ref = hostMatch[1];
    const user = `postgres.${ref}`;
    const password = env.PGPASSWORD || env.POSTGRES_PASSWORD || '';
    if (password) {
      const poolerUrl =
        `postgresql://${encodeURIComponent(user)}:` +
        `${encodeURIComponent(password)}` +
        '@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?sslmode=require';

      candidates.push({
        name: 'supabase-ipv4-pooler',
        connectionString: poolerUrl,
      });
    }
  }

  return candidates;
}

async function connectFirstAvailable(candidates) {
  let lastError = null;

  for (const candidate of candidates) {
    const pool = new Pool({
      connectionString: candidate.connectionString,
      ssl: { rejectUnauthorized: false },
    });

    try {
      await pool.query('SELECT NOW()');
      return { pool, sourceName: candidate.name };
    } catch (error) {
      lastError = error;
      await pool.end().catch(() => {});
    }
  }

  throw lastError || new Error('No connection candidates available.');
}

async function listPublicTables(pool) {
  const result = await pool.query(`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name ASC
  `);
  return result.rows.map((row) => row.table_name);
}

async function exportAllTables(pool, outputDir) {
  const tables = await listPublicTables(pool);
  const summary = [];

  for (const tableName of tables) {
    // Safe identifier quoting
    const quoted = `"${tableName.replace(/"/g, '""')}"`;
    const queryText = `SELECT * FROM ${quoted}`;
    const result = await pool.query(queryText);
    const filePath = path.join(outputDir, `${tableName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(result.rows, null, 2), 'utf8');
    summary.push({ table: tableName, rows: result.rowCount });
    console.log(`- ${tableName}: ${result.rowCount} rows`);
  }

  const summaryPath = path.join(outputDir, 'summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  return summary;
}

async function main() {
  const env = loadLocalEnv();
  const candidates = getConnectionCandidates(env);

  if (candidates.length === 0) {
    console.error(
      'No database connection settings found. Expected POSTGRES_URL / DATABASE_URL / SUPABASE_DATABASE_URL.'
    );
    process.exit(1);
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const outputDir = path.join(projectRoot, 'db', 'local-dump', timestamp);
  fs.mkdirSync(outputDir, { recursive: true });

  let pool;
  try {
    const connected = await connectFirstAvailable(candidates);
    pool = connected.pool;

    console.log(`Connected using: ${connected.sourceName}`);
    console.log(`Export path: ${outputDir}`);
    await exportAllTables(pool, outputDir);
    console.log('Done.');
  } catch (error) {
    console.error(`Export failed: ${error.message}`);
    process.exit(1);
  } finally {
    if (pool) await pool.end().catch(() => {});
  }
}

main();


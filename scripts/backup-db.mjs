#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { spawnSync } from 'child_process';

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

function loadEnv() {
  return {
    ...parseEnvFile(path.join(projectRoot, '.env')),
    ...parseEnvFile(path.join(projectRoot, '.env.local')),
    ...process.env,
  };
}

function extractPassword(databaseUrl) {
  if (!databaseUrl) return '';

  try {
    return decodeURIComponent(new URL(databaseUrl).password);
  } catch {
    return '';
  }
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: projectRoot,
    stdio: 'pipe',
    encoding: 'utf8',
    ...options,
  });
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function timestamp() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}-${hour}${minute}${second}`;
}

function trySupabaseDump(env, backupDir, stamp) {
  const password = extractPassword(env.DATABASE_URL || env.POSTGRES_URL || '');
  if (!password) {
    return { ok: false, reason: 'DATABASE_URL veya POSTGRES_URL icinden parola okunamadi.' };
  }

  const schemaFile = path.join(backupDir, `${stamp}-schema.sql`);
  const dataFile = path.join(backupDir, `${stamp}-data.sql`);

  const schemaResult = run('supabase', [
    'db',
    'dump',
    '--linked',
    '--schema',
    'public',
    '--file',
    schemaFile,
    '--password',
    password,
  ]);

  if (schemaResult.status !== 0) {
    return {
      ok: false,
      reason: schemaResult.stderr || schemaResult.stdout || 'Supabase schema dump basarisiz oldu.',
    };
  }

  const dataResult = run('supabase', [
    'db',
    'dump',
    '--linked',
    '--data-only',
    '--use-copy',
    '--schema',
    'public',
    '--file',
    dataFile,
    '--password',
    password,
  ]);

  if (dataResult.status !== 0) {
    return {
      ok: false,
      reason: dataResult.stderr || dataResult.stdout || 'Supabase data dump basarisiz oldu.',
    };
  }

  return {
    ok: true,
    files: [schemaFile, dataFile],
  };
}

function runJsonFallback() {
  return run('node', ['db/pull-remote-to-local-json.js']);
}

function main() {
  const env = loadEnv();
  const backupDir = path.join(projectRoot, 'db', 'backups');
  const stamp = timestamp();

  ensureDir(backupDir);

  console.log('SQL dump deneniyor...');
  const sqlDump = trySupabaseDump(env, backupDir, stamp);

  if (sqlDump.ok) {
    console.log('SQL yedegi tamamlandi:');
    for (const filePath of sqlDump.files) {
      console.log(`- ${path.relative(projectRoot, filePath)}`);
    }
    return;
  }

  console.log('SQL dump basarisiz oldu, JSON tablo yedegine dusuluyor.');
  console.log(sqlDump.reason.trim());

  const jsonFallback = runJsonFallback();
  process.stdout.write(jsonFallback.stdout || '');
  process.stderr.write(jsonFallback.stderr || '');

  if (jsonFallback.status !== 0) {
    process.exit(jsonFallback.status ?? 1);
  }
}

main();

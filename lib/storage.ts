import { Pool } from 'pg';
import fs from 'node:fs';
import path from 'node:path';
import { logger } from './logger';
import { captureException } from './error-tracker';

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;
let tablesEnsured = false;
let initPromise: Promise<void> | null = null;

function getPool(): Pool | null {
  if (!pool && connectionString) {
    const isLocal =
      connectionString.includes('localhost') ||
      connectionString.includes('127.0.0.1');

    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });

    pool.on('error', (err) => {
      logger.error('Unexpected database pool error', { error: err.message });
      captureException(err, { route: 'storage/pool' });
    });
  }
  return pool;
}

export function getStorageMode(): 'postgres' | 'local_disk' {
  return connectionString ? 'postgres' : 'local_disk';
}

export interface WaitlistEntry {
  id?: number;
  email: string;
  ip: string;
  created_at?: Date | string;
  timestamp?: number;
}

export interface StoredOrder {
  id: string;
  tier: string;
  email: string;
  repo_url?: string;
  repoOrListingUrl?: string;
  notes?: string;
  lang: string;
  created_at?: Date | string;
  createdAt?: number;
}

const DATA_DIR = path.resolve(process.cwd(), 'data');

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    logger.error('Failed to create local data directory', { error: String(err) });
  }
}

function getLocalFilePath(collection: string): string {
  ensureDataDir();
  return path.join(DATA_DIR, `${collection}.json`);
}

function readLocalRecords<T>(collection: string): T[] {
  try {
    const filePath = getLocalFilePath(collection);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

function writeLocalRecord<T extends object>(
  collection: string,
  record: T
): void {
  try {
    const existing = readLocalRecords<Record<string, unknown>>(collection);
    const rec = record as Record<string, unknown>;
    const identifierKey = collection === 'waitlist' ? 'email' : 'id';
    const targetValue = rec[identifierKey];

    const index = existing.findIndex(
      (item) => item && typeof targetValue !== 'undefined' && item[identifierKey] === targetValue
    );

    if (index >= 0) {
      existing[index] = { ...existing[index], ...rec };
    } else {
      existing.unshift(rec);
    }

    const filePath = getLocalFilePath(collection);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), 'utf-8');
  } catch (err) {
    logger.error(`Failed to write local fallback for ${collection}`, { error: String(err) });
  }
}

export async function ensureTables(): Promise<void> {
  const db = getPool();
  if (!db) return;
  if (tablesEnsured) return;

  if (!initPromise) {
    initPromise = (async () => {
      try {
        await db.query(`
          CREATE TABLE IF NOT EXISTS waitlist (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            ip TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);

        await db.query(`
          CREATE TABLE IF NOT EXISTS orders (
            id TEXT PRIMARY KEY,
            tier TEXT NOT NULL,
            email TEXT NOT NULL,
            repo_url TEXT,
            notes TEXT,
            lang TEXT DEFAULT 'ru',
            created_at TIMESTAMPTZ DEFAULT NOW()
          )
        `);

        await db.query(`
          CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist(email)
        `);

        await db.query(`
          CREATE INDEX IF NOT EXISTS idx_orders_email ON orders(email)
        `);
        tablesEnsured = true;
        logger.info('Database schema and indexes verified successfully');
      } catch (err) {
        logger.error('Failed to ensure database tables', { error: String(err) });
        captureException(err, { route: 'storage/ensureTables' });
        initPromise = null;
      }
    })();
  }

  await initPromise;
}

export async function appendRecord<T extends object>(
  collection: string,
  record: T
): Promise<void> {
  const db = getPool();
  if (!db) {
    writeLocalRecord(collection, record);
    return;
  }

  try {
    await ensureTables();

    if (collection === 'waitlist') {
      const entry = record as unknown as WaitlistEntry;
      await db.query(
        `INSERT INTO waitlist (email, ip, created_at)
         VALUES ($1, $2, NOW())
         ON CONFLICT (email) DO NOTHING`,
        [entry.email, entry.ip]
      );
    } else if (collection === 'orders') {
      const order = record as unknown as StoredOrder;
      await db.query(
        `INSERT INTO orders (id, tier, email, repo_url, notes, lang, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, NOW())
         ON CONFLICT (id) DO UPDATE SET
           tier = EXCLUDED.tier,
           email = EXCLUDED.email,
           repo_url = EXCLUDED.repo_url,
           notes = EXCLUDED.notes,
           lang = EXCLUDED.lang`,
        [
          order.id,
          order.tier,
          order.email,
          order.repoOrListingUrl || order.repo_url || '',
          order.notes || '',
          order.lang || 'ru',
        ]
      );
    }
  } catch (err) {
    logger.warn(`PostgreSQL write failed, falling back to disk for ${collection}`, { error: String(err) });
    captureException(err, { route: `storage/appendRecord/${collection}` });
    writeLocalRecord(collection, record);
  }
}

export async function readRecords<T>(collection: string): Promise<T[]> {
  const db = getPool();
  if (!db) {
    return readLocalRecords<T>(collection);
  }

  try {
    await ensureTables();

    if (collection === 'waitlist') {
      const result = await db.query<WaitlistEntry>(
        'SELECT id, email, ip, created_at FROM waitlist ORDER BY created_at DESC'
      );
      return result.rows as T[];
    } else if (collection === 'orders') {
      const result = await db.query<StoredOrder>(
        'SELECT id, tier, email, repo_url, notes, lang, created_at FROM orders ORDER BY created_at DESC'
      );
      return result.rows as T[];
    }
  } catch (err) {
    logger.warn(`PostgreSQL read failed, falling back to disk for ${collection}`, { error: String(err) });
    captureException(err, { route: `storage/readRecords/${collection}` });
    return readLocalRecords<T>(collection);
  }

  return [];
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    tablesEnsured = false;
    initPromise = null;
  }
}

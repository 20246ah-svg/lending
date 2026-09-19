import { Pool, PoolClient } from 'pg';

const connectionString = process.env.DATABASE_URL;

let pool: Pool | null = null;

function getPool(): Pool | null {
  if (!pool && connectionString) {
    pool = new Pool({
      connectionString,
      max: 5,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 5000,
    });

    pool.on('error', (err) => {
      console.error('[storage] Unexpected pool error:', err);
    });
  }
  return pool;
}

export interface WaitlistEntry {
  id?: number;
  email: string;
  ip: string;
  created_at?: Date;
}

export interface StoredOrder {
  id: string;
  tier: string;
  email: string;
  repo_url: string;
  notes?: string;
  lang: string;
  created_at?: Date;
}

export async function ensureTables(): Promise<void> {
  const db = getPool();
  if (!db) return;

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
  } catch (err) {
    console.error('[storage] Failed to ensure tables:', err);
  }
}

export async function appendRecord<T extends object>(
  collection: string,
  record: T
): Promise<void> {
  const db = getPool();
  if (!db) {
    console.warn('[storage] DATABASE_URL not set, skipping write');
    return;
  }

  try {
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
          (order as any).repoOrListingUrl || '',
          order.notes || '',
          order.lang || 'ru',
        ]
      );
    }
  } catch (err) {
    console.error(`[storage] Failed to append to ${collection}:`, err);
  }
}

export async function readRecords<T>(collection: string): Promise<T[]> {
  const db = getPool();
  if (!db) {
    console.warn('[storage] DATABASE_URL not set, returning empty array');
    return [];
  }

  try {
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
    console.error(`[storage] Failed to read ${collection}:`, err);
  }

  return [];
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
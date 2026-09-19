import { sql } from 'postgres';

const connectionString = process.env.DATABASE_URL;

let db: ReturnType<typeof sql> | null = null;

function getDb() {
  if (!db && connectionString) {
    db = sql(connectionString);
  }
  return db;
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
  const database = getDb();
  if (!database) return;

  await database`
    CREATE TABLE IF NOT EXISTS waitlist (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      ip TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;

  await database`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      tier TEXT NOT NULL,
      email TEXT NOT NULL,
      repo_url TEXT,
      notes TEXT,
      lang TEXT DEFAULT 'ru',
      created_at TIMESTAMPTZ DEFAULT NOW()
    )
  `;
}

export async function appendRecord<T extends object>(
  collection: string,
  record: T
): Promise<void> {
  const database = getDb();
  if (!database) {
    console.warn('[storage] DATABASE_URL not set, skipping write');
    return;
  }

  await ensureTables();

  if (collection === 'waitlist') {
    const entry = record as unknown as WaitlistEntry;
    try {
      await database`
        INSERT INTO waitlist (email, ip, created_at)
        VALUES (${entry.email}, ${entry.ip}, NOW())
        ON CONFLICT (email) DO NOTHING
      `;
    } catch (err) {
      console.error('[storage] Failed to insert waitlist:', err);
    }
  } else if (collection === 'orders') {
    const order = record as unknown as StoredOrder;
    try {
      await database`
        INSERT INTO orders (id, tier, email, repo_url, notes, lang, created_at)
        VALUES (
          ${order.id},
          ${order.tier},
          ${order.email},
          ${order.repoOrListingUrl || ''},
          ${order.notes || ''},
          ${order.lang || 'ru'},
          NOW()
        )
        ON CONFLICT (id) DO UPDATE SET
          tier = EXCLUDED.tier,
          email = EXCLUDED.email,
          repo_url = EXCLUDED.repo_url,
          notes = EXCLUDED.notes,
          lang = EXCLUDED.lang
      `;
    } catch (err) {
      console.error('[storage] Failed to insert order:', err);
    }
  }
}

export async function readRecords<T>(collection: string): Promise<T[]> {
  const database = getDb();
  if (!database) {
    console.warn('[storage] DATABASE_URL not set, returning empty array');
    return [];
  }

  await ensureTables();

  try {
    if (collection === 'waitlist') {
      const rows = await database<WaitlistEntry[]>`
        SELECT id, email, ip, created_at FROM waitlist ORDER BY created_at DESC
      `;
      return rows as unknown as T[];
    } else if (collection === 'orders') {
      const rows = await database<StoredOrder[]>`
        SELECT id, tier, email, repo_url as "repoOrListingUrl", notes, lang, created_at
        FROM orders ORDER BY created_at DESC
      `;
      return rows as unknown as T[];
    }
  } catch (err) {
    console.error(`[storage] Failed to read ${collection}:`, err);
  }

  return [];
}
import fs from "node:fs";
import path from "node:path";

const DATA_DIR = path.join(process.cwd(), "data");

function ensureDataDir(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch {
    // Read-only filesystem fallback
  }
}

/**
 * Appends a record to a JSONL collection file on disk.
 */
export function appendRecord<T extends object>(collection: string, record: T): void {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${collection}.jsonl`);
    const line = JSON.stringify(record) + "\n";
    fs.appendFileSync(filePath, line, "utf8");
  } catch (err) {
    console.error(`[storage] Failed to append to ${collection}:`, err);
  }
}

/**
 * Reads all records from a JSONL collection file on disk.
 */
export function readRecords<T>(collection: string): T[] {
  try {
    ensureDataDir();
    const filePath = path.join(DATA_DIR, `${collection}.jsonl`);
    if (!fs.existsSync(filePath)) return [];

    const content = fs.readFileSync(filePath, "utf8");
    return content
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        try {
          return JSON.parse(line) as T;
        } catch {
          return null;
        }
      })
      .filter((item): item is T => item !== null);
  } catch {
    return [];
  }
}

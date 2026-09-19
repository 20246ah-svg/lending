import { NextRequest, NextResponse } from "next/server";
import { appendRecord, readRecords, getStorageMode } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { captureException } from "@/lib/error-tracker";

interface WaitlistEntry {
  email: string;
  timestamp: number;
  ip: string;
}

let waitlistCache: WaitlistEntry[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 30000;

async function getWaitlist(forceFresh = false): Promise<WaitlistEntry[]> {
  const now = Date.now();
  if (!waitlistCache || now > cacheExpiresAt || forceFresh) {
    waitlistCache = await readRecords<WaitlistEntry>("waitlist");
    cacheExpiresAt = now + CACHE_TTL_MS;
  }
  return waitlistCache;
}

function invalidateWaitlistCache(): void {
  waitlistCache = null;
  cacheExpiresAt = 0;
}

// Memory-leak protected rate limiter
interface RateBucket {
  count: number;
  resetAt: number;
}
const rateLimitMap = new Map<string, RateBucket>();

function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  if (rateLimitMap.size > 2000) {
    for (const [key, b] of rateLimitMap.entries()) {
      if (now > b.resetAt) {
        rateLimitMap.delete(key);
      }
    }
  }

  const bucket = rateLimitMap.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  if (bucket.count >= limit) return false;
  bucket.count++;
  rateLimitMap.set(ip, bucket);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    if (!checkRateLimit(clientIp, 15, 3600000)) {
      logger.warn("Waitlist submission rate limit exceeded", { ip: clientIp });
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    const cleanEmail = email.trim().toLowerCase();
    const entry: WaitlistEntry = {
      email: cleanEmail,
      timestamp: Date.now(),
      ip: clientIp,
    };

    await appendRecord("waitlist", entry);
    invalidateWaitlistCache();

    logger.info("New waitlist subscription", { emailDomain: cleanEmail.split("@")[1] });

    const list = await getWaitlist();

    return NextResponse.json({
      success: true,
      message: "Subscribed to early access waitlist",
      totalSubscribers: list.length,
    });
  } catch (err) {
    logger.error("Failed to join waitlist", { error: String(err) });
    captureException(err, { route: "POST /api/waitlist" });
    return NextResponse.json({ error: "Failed to join waitlist" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  if (!checkRateLimit(clientIp, 60, 3600000)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const list = await getWaitlist();
  return NextResponse.json({
    storageMode: getStorageMode(),
    totalSubscribers: list.length,
    status: "active",
  });
}

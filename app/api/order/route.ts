import { NextRequest, NextResponse } from "next/server";
import { appendRecord, readRecords, getStorageMode } from "@/lib/storage";
import { logger } from "@/lib/logger";
import { captureException } from "@/lib/error-tracker";

interface StoredOrder {
  id: string;
  tier: "concierge" | "due_diligence";
  email: string;
  repoOrListingUrl: string;
  notes?: string;
  lang: string;
  createdAt: number;
}

// In-memory cache synced with persistent storage (short TTL to keep multi-instance consistency)
let ordersCache: StoredOrder[] | null = null;
let cacheExpiresAt = 0;
const CACHE_TTL_MS = 30000;

async function getOrders(forceFresh = false): Promise<StoredOrder[]> {
  const now = Date.now();
  if (!ordersCache || now > cacheExpiresAt || forceFresh) {
    ordersCache = await readRecords<StoredOrder>("orders");
    cacheExpiresAt = now + CACHE_TTL_MS;
  }
  return ordersCache;
}

function invalidateOrdersCache(): void {
  ordersCache = null;
  cacheExpiresAt = 0;
}

// Memory-leak protected rate limiter
interface RateBucket {
  count: number;
  resetAt: number;
}
const postRateMap = new Map<string, RateBucket>();
const getRateMap = new Map<string, RateBucket>();

function checkRateLimit(map: Map<string, RateBucket>, ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();

  // Periodic pruning to prevent unbounded memory growth
  if (map.size > 2000) {
    for (const [key, b] of map.entries()) {
      if (now > b.resetAt) {
        map.delete(key);
      }
    }
  }

  const bucket = map.get(ip) || { count: 0, resetAt: now + windowMs };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + windowMs;
  }

  if (bucket.count >= limit) return false;
  bucket.count++;
  map.set(ip, bucket);
  return true;
}

function maskEmail(email: string): string {
  const [name, domain] = email.split("@");
  if (!domain) return "***";
  const maskedName = name.length > 2 ? `${name[0]}***${name[name.length - 1]}` : `${name[0]}***`;
  return `${maskedName}@${domain}`;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (!checkRateLimit(postRateMap, ip, 10, 3600000)) {
      logger.warn("Order submission rate limit exceeded", { ip });
      return NextResponse.json(
        { success: false, error: "Too many order requests. Please retry later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { tier, email, repoOrListingUrl, notes, lang } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, error: "Valid email address is required" },
        { status: 400 }
      );
    }

    if (!repoOrListingUrl || typeof repoOrListingUrl !== "string") {
      return NextResponse.json(
        { success: false, error: "Repository or listing URL is required" },
        { status: 400 }
      );
    }

    const selectedTier = tier === "concierge" ? "concierge" : "due_diligence";
    const orderId = `ord_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const orderRecord: StoredOrder = {
      id: orderId,
      tier: selectedTier,
      email: email.trim().toLowerCase(),
      repoOrListingUrl: repoOrListingUrl.trim().slice(0, 300),
      notes: typeof notes === "string" ? notes.trim().slice(0, 500) : undefined,
      lang: lang === "en" ? "en" : "ru",
      createdAt: Date.now(),
    };

    // Await persistence and invalidate cache
    await appendRecord("orders", orderRecord);
    invalidateOrdersCache();

    logger.info("New order submitted successfully", {
      orderId,
      tier: selectedTier,
      lang: orderRecord.lang,
    });

    const deliverySla = selectedTier === "concierge" ? "24 часа" : "48 часов";

    return NextResponse.json({
      success: true,
      orderId,
      deliverySla,
      message:
        selectedTier === "concierge"
          ? "Заказ на консьерж-аудит принят. Мы свяжемся с вами в течение 24 часов."
          : "Заявка на M&A Tech Due Diligence принята. Мы подготовим отчет в течение 48 часов.",
    });
  } catch (err) {
    logger.error("Failed to process order request", { error: String(err) });
    captureException(err, { route: "POST /api/order" });
    return NextResponse.json(
      { success: false, error: "Failed to process order request" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
  if (!checkRateLimit(getRateMap, ip, 60, 3600000)) {
    return NextResponse.json(
      { success: false, error: "Too many GET requests. Please retry later." },
      { status: 429 }
    );
  }

  const adminSecret = process.env.ADMIN_SECRET?.trim();
  const authHeader = req.headers.get("authorization") || req.headers.get("x-admin-key");
  const providedToken = authHeader?.startsWith("Bearer ")
    ? authHeader.substring(7).trim()
    : authHeader?.trim();

  // If authorization was attempted but invalid
  if (adminSecret && providedToken && providedToken !== adminSecret) {
    logger.warn("Unauthorized order access attempt with invalid key", { ip });
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  const isAdmin = Boolean(adminSecret && providedToken && providedToken === adminSecret);
  const currentOrders = await getOrders();

  // Public callers receive aggregated metrics without sensitive emails or URLs
  if (!isAdmin) {
    return NextResponse.json({
      storageMode: getStorageMode(),
      totalOrders: currentOrders.length,
      orders: currentOrders.map((o) => ({
        id: o.id,
        tier: o.tier,
        email: maskEmail(o.email),
        createdAt: o.createdAt,
        lang: o.lang,
      })),
    });
  }

  // Authenticated admin receives complete records
  return NextResponse.json({
    storageMode: getStorageMode(),
    totalOrders: currentOrders.length,
    orders: currentOrders,
  });
}

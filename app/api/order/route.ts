import { NextRequest, NextResponse } from "next/server";
import { appendRecord, readRecords } from "@/lib/storage";

interface StoredOrder {
  id: string;
  tier: "concierge" | "due_diligence";
  email: string;
  repoOrListingUrl: string;
  notes?: string;
  lang: string;
  createdAt: number;
}

// In-memory cache synced with disk persistence
let ordersCache: StoredOrder[] | null = null;

async function getOrders(): Promise<StoredOrder[]> {
  if (!ordersCache) {
    ordersCache = await readRecords<StoredOrder>("orders");
  }
  return ordersCache;
}

// Rate limiter: 10 order submissions per hour per IP
const rateMap = new Map<string, { count: number; resetAt: number }>();

function checkOrderRate(ip: string): boolean {
  const now = Date.now();
  const bucket = rateMap.get(ip) || { count: 0, resetAt: now + 3600000 };

  if (now > bucket.resetAt) {
    bucket.count = 0;
    bucket.resetAt = now + 3600000;
  }

  if (bucket.count >= 10) return false;
  bucket.count++;
  rateMap.set(ip, bucket);
  return true;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    if (!checkOrderRate(ip)) {
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

    await appendRecord("orders", orderRecord);
    const orders = await getOrders();
    orders.push(orderRecord);

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
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to process order request" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const currentOrders = await getOrders();
  return NextResponse.json({
    totalOrders: currentOrders.length,
    orders: currentOrders.map((o) => ({
      id: o.id,
      tier: o.tier,
      createdAt: o.createdAt,
      lang: o.lang,
    })),
  });
}

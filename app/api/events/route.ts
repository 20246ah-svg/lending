import { NextRequest, NextResponse } from "next/server";
import { ALLOWED_EVENT_NAMES, sanitizeProps, SanitizedProps } from "@/lib/analytics";

interface StoredEvent {
  id: string;
  name: string;
  timestamp: number;
  props: SanitizedProps;
}

// In-memory ring buffer with max 1000 capacity
const BUFFER_CAPACITY = 1000;
const eventBuffer: StoredEvent[] = [];
let totalEventCount = 0;
const eventCounts: Record<string, number> = {};

// Rate limiter: 90 requests per minute per IP
interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}
const rateLimitMap = new Map<string, RateLimitBucket>();
const MAX_TOKENS = 90;
const REFILL_WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = rateLimitMap.get(ip) || { tokens: MAX_TOKENS, lastRefill: now };

  const elapsed = now - bucket.lastRefill;
  if (elapsed > REFILL_WINDOW_MS) {
    bucket.tokens = MAX_TOKENS;
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    rateLimitMap.set(ip, bucket);
    return true;
  }

  return false;
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { success: false, error: "Rate limit exceeded (max 90 events/min)" },
        { status: 429 }
      );
    }

    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength, 10) > 4096) {
      return NextResponse.json(
        { success: false, error: "Payload too large (max 4KB)" },
        { status: 413 }
      );
    }

    const body = await req.json();
    const { name, props } = body || {};

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid event name" },
        { status: 400 }
      );
    }

    // Check allowlist
    const isAllowed = (ALLOWED_EVENT_NAMES as readonly string[]).includes(name);
    if (!isAllowed) {
      return NextResponse.json(
        { success: false, error: `Event '${name}' is not in allowed event list` },
        { status: 400 }
      );
    }

    const cleanProps = sanitizeProps(props);
    const eventId = `ev_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;

    const eventRecord: StoredEvent = {
      id: eventId,
      name,
      timestamp: Date.now(),
      props: cleanProps,
    };

    // Push into ring buffer
    if (eventBuffer.length >= BUFFER_CAPACITY) {
      eventBuffer.shift();
    }
    eventBuffer.push(eventRecord);

    totalEventCount++;
    eventCounts[name] = (eventCounts[name] || 0) + 1;

    return NextResponse.json({ success: true, id: eventId });
  } catch {
    return NextResponse.json(
      { success: false, error: "Malformed event payload" },
      { status: 400 }
    );
  }
}

export async function GET() {
  // Aggregate stats without leaking raw IPs or session identifiers
  const recent = eventBuffer.slice(-20).reverse();

  return NextResponse.json({
    totalEvents: totalEventCount,
    bufferSize: eventBuffer.length,
    bufferCapacity: BUFFER_CAPACITY,
    eventCounts,
    recentEvents: recent,
    uptimeSeconds: Math.floor(process.uptime()),
  });
}

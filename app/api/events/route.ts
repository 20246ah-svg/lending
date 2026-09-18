import { NextResponse } from "next/server";
import { isValidEventName, sanitizeProps, type AnalyticsEventName } from "@/lib/analytics";
import { SimpleRateLimiter } from "@/lib/audit-core";

/**
 * First-party event collection endpoint.
 * Ring buffer keeps the most recent N envelopes in memory (per instance).
 * For durable storage, patch `storeEvent` to write to KV/DB — the contract
 * of this route stays the same.
 */

interface StoredEvent {
  event: AnalyticsEventName;
  props: Record<string, string | number | boolean>;
  ts: number;
  lang?: string;
}

const MAX_BUFFER = 1000;
const buffer: StoredEvent[] = [];
const counts = new Map<string, number>();
const since = Date.now();
const startedAt = new Date().toISOString();

const limiter = new SimpleRateLimiter();

function storeEvent(e: StoredEvent): void {
  buffer.push(e);
  if (buffer.length > MAX_BUFFER) buffer.shift();
  counts.set(e.event, (counts.get(e.event) || 0) + 1);
}

export async function POST(req: Request) {
  try {
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (!limiter.isAllowed(clientIp, 90, 60000)) {
      return NextResponse.json({ error: "Event rate limit exceeded" }, { status: 429 });
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > 4096) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid event envelope" }, { status: 400 });
    }

    const { event, props, ts, lang } = body as Record<string, unknown>;

    if (typeof event !== "string" || !isValidEventName(event)) {
      return NextResponse.json({ error: "Unknown event name" }, { status: 400 });
    }

    const sessionId =
      typeof (body as Record<string, unknown>).sessionId === "string"
        ? String((body as Record<string, unknown>).sessionId).slice(0, 64)
        : "unknown";

    storeEvent({
      event,
      props: sanitizeProps(props),
      ts: typeof ts === "number" && Number.isFinite(ts) ? ts : Date.now(),
      lang: typeof lang === "string" ? lang.slice(0, 8) : undefined,
    });

    return NextResponse.json({ ok: true, sid: sessionId });
  } catch {
    return NextResponse.json({ error: "Event ingest failed" }, { status: 500 });
  }
}

/**
 * Read-only aggregate dashboard. Returns per-event totals since process boot
 * and the last 25 envelopes (without session identifiers).
 * In-memory per instance — on serverless treat as "current instance view".
 */
export async function GET() {
  const totals: Record<string, number> = {};
  for (const [k, v] of counts.entries()) totals[k] = v;

  return NextResponse.json({
    sinceBoot: startedAt,
    uptimeSec: Math.round((Date.now() - since) / 1000),
    bufferSize: buffer.length,
    totals,
    lastEvents: buffer.slice(-25).map(({ event, props, ts, lang }) => ({
      event,
      props,
      ts,
      lang,
    })),
  });
}

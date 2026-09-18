/**
 * First-party lightweight telemetry bus.
 * - No cookies, no fingerprinting, no third-party SDKs.
 * - Session ID lives in sessionStorage (one per tab, dies with the tab).
 * - Events are beaconed to our own /api/events endpoint and stored
 *   in a bounded in-memory ring buffer on the server.
 *
 * Privacy stance: we never store raw IPs or PII in event props.
 */

export const ANALYTICS_EVENTS = [
  "landed",
  "tab_switched",
  "scan_started",
  "scan_completed",
  "scan_failed",
  "prompt_copied",
  "badge_copied",
  "cli_copy_clicked",
  "pricing_tier_clicked",
  "waitlist_opened",
  "waitlist_submitted",
  "sample_report_loaded",
] as const;

export type AnalyticsEventName = (typeof ANALYTICS_EVENTS)[number];

export function isValidEventName(name: string): name is AnalyticsEventName {
  return (ANALYTICS_EVENTS as readonly string[]).includes(name);
}

/**
 * Sanitizes arbitrary event props into a safe, bounded payload.
 * Only primitive values are kept; strings are truncated.
 */
export function sanitizeProps(
  input: unknown,
  maxKeys = 12,
  maxStringLen = 200
): Record<string, string | number | boolean> {
  const out: Record<string, string | number | boolean> = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) return out;
  const entries = Object.entries(input as Record<string, unknown>).slice(0, maxKeys);
  for (const [key, value] of entries) {
    if (typeof key !== "string" || key.length === 0 || key.length > 40) continue;
    if (typeof value === "string") {
      out[key] = value.length > maxStringLen ? `${value.slice(0, maxStringLen)}…` : value;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      out[key] = value;
    } else if (typeof value === "boolean") {
      out[key] = value;
    }
    // objects, arrays, undefined, functions are dropped by design
  }
  return out;
}

const SESSION_KEY = "vibedebt_sid";

/**
 * Per-tab session identifier. Not a cookie, not localStorage:
 * sessionStorage is cleared when the tab closes — no cross-visit identity.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `s_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      window.sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    // sessionStorage can be blocked (private modes) — degrade gracefully
    return `anon_${Math.random().toString(36).slice(2, 10)}`;
  }
}

/** Extracts UTM/medium/source-style parameters for attribution. */
export function extractAttribution(search: string): Record<string, string> {
  const out: Record<string, string> = {};
  try {
    const params = new URLSearchParams(search);
    for (const key of ["utm_source", "utm_medium", "utm_campaign", "ref"]) {
      const value = params.get(key);
      if (value) out[key] = value.slice(0, 80);
    }
  } catch {
    // ignore malformed URLs
  }
  return out;
}

export interface AnalyticsEnvelope {
  event: AnalyticsEventName;
  props: Record<string, string | number | boolean>;
  sessionId: string;
  ts: number;
  lang?: string;
}

/**
 * Fire-and-forget event dispatch. Uses navigator.sendBeacon with a
 * fetch(keepalive) fallback. Never throws; failures are silent by design —
 * analytics must never break product UX.
 */
export function track(
  event: AnalyticsEventName,
  props: Record<string, unknown> = {}
): void {
  if (typeof window === "undefined") return;
  try {
    const envelope: AnalyticsEnvelope = {
      event,
      props: sanitizeProps(props),
      sessionId: getSessionId(),
      ts: Date.now(),
      lang: typeof document !== "undefined" ? document.documentElement.lang : undefined,
    };
    const body = JSON.stringify(envelope);
    if (body.length > 2048) return; // hard payload ceiling

    const url = "/api/events";
    if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
      const blob = new Blob([body], { type: "application/json" });
      if (navigator.sendBeacon(url, blob)) return;
    }
    void fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
      keepalive: true,
    }).catch(() => undefined);
  } catch {
    // analytics failures must be invisible to the user
  }
}

/**
 * Lightweight client-side analytics bus for VibeDebt.
 * Zero external tracking dependencies, zero third-party cookies, no invasive fingerprinting.
 * Uses sessionStorage-scoped random session identifier.
 */

export const ALLOWED_EVENT_NAMES = [
  "landed",
  "tab_switched",
  "scan_started",
  "scan_completed",
  "scan_failed",
  "prompt_copied",
  "badge_copied",
  "share_clicked",
  "cli_copy_clicked",
  "pricing_tier_clicked",
  "order_opened",
  "order_submitted",
  "waitlist_opened",
  "waitlist_submitted",
  "sample_report_loaded",
] as const;

export type AllowedEventName = (typeof ALLOWED_EVENT_NAMES)[number];

export type EventPrimitive = string | number | boolean;
export type SanitizedProps = Record<string, EventPrimitive>;

/**
 * Sanitizes an event properties object:
 * - Drops nested objects, arrays, functions, null, undefined
 * - Limits to max 12 properties
 * - Truncates strings to 120 characters
 * - Restricts keys to safe alphanumeric/underscore format (max 32 chars)
 */
export function sanitizeProps(props?: Record<string, unknown>): SanitizedProps {
  if (!props || typeof props !== "object" || Array.isArray(props)) {
    return {};
  }

  const sanitized: SanitizedProps = {};
  const entries = Object.entries(props);
  let count = 0;

  for (const [key, value] of entries) {
    if (count >= 12) break;

    // Sanitize key
    const cleanKey = key.replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 32);
    if (!cleanKey) continue;

    if (typeof value === "string") {
      sanitized[cleanKey] = value.trim().slice(0, 120);
      count++;
    } else if (typeof value === "number" && Number.isFinite(value)) {
      sanitized[cleanKey] = value;
      count++;
    } else if (typeof value === "boolean") {
      sanitized[cleanKey] = value;
      count++;
    }
  }

  return sanitized;
}

/**
 * Retrieves or initializes an ephemeral session ID stored strictly in sessionStorage.
 */
export function getSessionId(): string {
  if (typeof window === "undefined") return "server";

  try {
    const existing = window.sessionStorage.getItem("vd_sid");
    if (existing && existing.length >= 8) return existing;

    const newSid = "sid_" + Math.random().toString(36).substring(2, 10) + Date.now().toString(36);
    window.sessionStorage.setItem("vd_sid", newSid);
    return newSid;
  } catch {
    return "ephemeral_" + Math.random().toString(36).substring(2, 8);
  }
}

/**
 * Tracks an analytics event. Sends payload via navigator.sendBeacon or fetch keepalive.
 * Fails completely silently to never impact user flow.
 */
export function trackEvent(
  name: string,
  rawProps?: Record<string, unknown>
): void {
  if (typeof window === "undefined") return;

  try {
    const props = sanitizeProps(rawProps);
    const sid = getSessionId();

    const payload = JSON.stringify({
      name,
      props,
      sid,
      timestamp: Date.now(),
    });

    const endpoint = "/api/events";

    if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
      const blob = new Blob([payload], { type: "application/json" });
      const ok = navigator.sendBeacon(endpoint, blob);
      if (ok) return;
    }

    // Fallback to fetch with keepalive
    fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
    }).catch(() => {
      // Intentionally silent
    });
  } catch {
    // Intentionally silent
  }
}

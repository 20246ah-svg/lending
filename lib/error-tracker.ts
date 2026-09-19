import { logger } from "./logger";

interface ErrorContext {
  route?: string;
  method?: string;
  ip?: string;
  userId?: string;
  extra?: Record<string, unknown>;
}

export async function captureException(
  error: unknown,
  context?: ErrorContext
): Promise<void> {
  const err = error instanceof Error ? error : new Error(String(error));
  const sentryDsn = process.env.SENTRY_DSN;

  logger.error(err.message, {
    stack: err.stack,
    name: err.name,
    ...context,
  });

  if (!sentryDsn) {
    return;
  }

  try {
    // Lightweight Sentry HTTP ingest (zero heavy SDK bundle overhead)
    const dsnUrl = new URL(sentryDsn);
    const projectId = dsnUrl.pathname.replace(/^\//, "");
    const publicKey = dsnUrl.username;
    const sentryEndpoint = `${dsnUrl.protocol}//${dsnUrl.host}/api/${projectId}/store/`;

    const payload = {
      event_id: Math.random().toString(36).substring(2, 18),
      timestamp: new Date().toISOString(),
      platform: "node",
      level: "error",
      exception: {
        values: [
          {
            type: err.name,
            value: err.message,
            stacktrace: err.stack ? { frames: [] } : undefined,
          },
        ],
      },
      tags: {
        route: context?.route,
        method: context?.method,
      },
      extra: context?.extra,
    };

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Sentry-Auth": `Sentry sentry_version=7, sentry_client=vibedebt/0.2.0, sentry_key=${publicKey}`,
    };

    // Non-blocking fire-and-forget reporting with 3s timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    fetch(sentryEndpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    })
      .catch(() => {
        // Swallow network errors to avoid cascading failure
      })
      .finally(() => clearTimeout(timeout));
  } catch {
    // Ignore reporting failure
  }
}

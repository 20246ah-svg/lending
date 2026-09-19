export type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
}

const isProduction = process.env.NODE_ENV === "production";
const logLevelThreshold: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || (isProduction ? "info" : "debug");

function shouldLog(level: LogLevel): boolean {
  return logLevelThreshold[level] >= logLevelThreshold[currentLevel];
}

function formatLog(level: LogLevel, message: string, context?: LogContext): void {
  if (!shouldLog(level)) return;

  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    ...(context && Object.keys(context).length > 0 ? { context } : {}),
  };

  if (isProduction) {
    // Pure structured JSON for CloudWatch, Datadog, Grafana Loki, etc.
    const output = JSON.stringify(entry);
    if (level === "error") {
      process.stderr.write(output + "\n");
    } else {
      process.stdout.write(output + "\n");
    }
  } else {
    // Human-readable dev output
    const colors: Record<LogLevel, string> = {
      debug: "\x1b[90m",
      info: "\x1b[36m",
      warn: "\x1b[33m",
      error: "\x1b[31m",
    };
    const reset = "\x1b[0m";
    const prefix = `${colors[level]}[${level.toUpperCase()}]${reset} [${entry.timestamp}]`;
    const ctxStr = context ? ` ${JSON.stringify(context)}` : "";
    
    if (level === "error") {
      console.error(`${prefix} ${message}${ctxStr}`);
    } else if (level === "warn") {
      console.warn(`${prefix} ${message}${ctxStr}`);
    } else {
      console.log(`${prefix} ${message}${ctxStr}`);
    }
  }
}

export const logger = {
  debug(message: string, context?: LogContext) {
    formatLog("debug", message, context);
  },
  info(message: string, context?: LogContext) {
    formatLog("info", message, context);
  },
  warn(message: string, context?: LogContext) {
    formatLog("warn", message, context);
  },
  error(message: string, context?: LogContext) {
    formatLog("error", message, context);
  },
};

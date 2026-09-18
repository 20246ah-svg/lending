import type { AuditReport, GodComponent, Antipattern, RefactorStep } from "./types.ts";

/**
 * Parses standard GitHub URLs or owner/repo shorthand.
 */
export function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const clean = url.trim().replace(/\/$/, "");
  const match = clean.match(/github\.com\/([a-zA-Z0-9_.-]+)\/([a-zA-Z0-9_.-]+)/);
  if (match) {
    return { owner: match[1], repo: match[2].replace(/\.git$/, "") };
  }
  const parts = clean.split("/").filter(Boolean);
  if (parts.length === 2 && !clean.includes(" ")) {
    return { owner: parts[0], repo: parts[1].replace(/\.git$/, "") };
  }
  return null;
}

/**
 * Checks if a file path is a test, mock, vendor, or build artifact that
 * should NOT be categorized as an application God-component.
 * Correctly matches root tests/ as well as nested /tests/.
 */
export function isIgnoredFile(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    lower.startsWith("tests/") ||
    lower.startsWith("test/") ||
    lower.includes("/tests/") ||
    lower.includes("/test/") ||
    lower.startsWith("__tests__/") ||
    lower.includes("/__tests__/") ||
    lower.includes(".test.") ||
    lower.includes(".spec.") ||
    lower.endsWith(".d.ts") ||
    lower.endsWith(".min.js") ||
    lower.endsWith(".min.css") ||
    lower.startsWith("node_modules/") ||
    lower.includes("/node_modules/") ||
    lower.startsWith("dist/") ||
    lower.includes("/dist/") ||
    lower.startsWith("build/") ||
    lower.includes("/build/") ||
    lower.startsWith(".next/") ||
    lower.includes("/.next/") ||
    lower.startsWith("vendor/") ||
    lower.includes("/vendor/") ||
    lower.includes("/fixtures/") ||
    lower.includes("/mocks/")
  );
}

/**
 * Strips comments and string literals from source code to prevent
 * false positives when code contains mock examples or documentation strings.
 */
export function stripCodeLiteralsAndComments(code: string): string {
  // Strip block comments
  let cleaned = code.replace(/\/\*[\s\S]*?\*\//g, " ");
  // Strip line comments
  cleaned = cleaned.replace(/\/\/.*$/gm, " ");
  // Strip double-quoted strings
  cleaned = cleaned.replace(/"(?:[^"\\]|\\.)*"/g, '""');
  // Strip single-quoted strings
  cleaned = cleaned.replace(/'(?:[^'\\]|\\.)*'/g, "''");
  // Strip template literals
  cleaned = cleaned.replace(/`[\s\S]*?`/g, "``");
  return cleaned;
}

/**
 * Calculate dynamic Time to Collapse / Failure Horizon
 */
export function formatTimeToCollapse(score: number, isRu = true): string {
  if (score < 40) {
    return isRu
      ? "Более 100 коммитов (стабильная архитектура)"
      : "Over 100 commits (healthy architecture)";
  }
  if (score > 75) {
    const commits = Math.max(4, Math.round((100 - score) * 1.1));
    return isRu
      ? `${commits} коммитов до блокирующего сбоя`
      : `${commits} commits until regression lock`;
  }
  const commits = Math.round((100 - score) * 1.5);
  return isRu
    ? `${commits} коммитов до регрессии`
    : `${commits} commits to degradation`;
}

/**
 * Finds package.json in tree, prioritizing root first, then shallowest paths.
 */
export function sortPackageJsonCandidates(treePaths: string[]): string | undefined {
  const candidates = treePaths.filter(
    (p) => p === "package.json" || p.endsWith("/package.json")
  );
  if (candidates.length === 0) return undefined;
  // Sort by path depth
  return candidates.sort((a, b) => a.split("/").length - b.split("/").length)[0];
}

/**
 * Generates Cursor Composer-specific surgical prompt.
 */
export function getCursorPrompt(mainFile: string, mainFileLines: number, isRu = true): string {
  const cleanBaseName = mainFile.split("/").pop()?.replace(/\.[^/.]+$/, "") || "Component";
  return isRu
    ? `Ты — Senior Refactoring Agent в Cursor Composer.
Цель: безопасно разбить God-файл '${mainFile}' (~${mainFileLines} строк) на модульные компоненты в '/components/${cleanBaseName}/'.

Инструкции для Cursor:
1. Сохрани '${mainFile}' как чистый оркестратор не более 100 строк.
2. Вынеси UI, стейт и сетевые запросы в изолированные файлы:
   - '/components/${cleanBaseName}/View.tsx'
   - '/components/${cleanBaseName}/use${cleanBaseName}State.ts'
3. Сохрани все пропсы, хуки и типы без использования 'any'. Выведи полный код каждого файла без комментариев '// rest of code'.`
    : `You are a Senior Refactoring Agent in Cursor Composer.
Goal: Safely decouple monolith '${mainFile}' (~${mainFileLines} LOC) into modular components under '/components/${cleanBaseName}/'.

Instructions for Cursor:
1. Keep '${mainFile}' as clean orchestrator under 100 lines.
2. Extract presentation and state hooks into isolated files.
3. Preserve all props and hooks without 'any' casts. Output complete working code without '// rest of code' placeholders.`;
}

/**
 * Generates Claude 3.7 Thinking-specific surgical prompt.
 */
export function getClaudePrompt(mainFile: string, mainFileLines: number, isRu = true): string {
  return isRu
    ? `Ты — Principal Architect в Claude 3.7 с расширенным мышлением (Thinking Mode).
Проведи архитектурный аудит и безопасный рефакторинг модуля '${mainFile}' (~${mainFileLines} строк).

План мышления:
1. Выяви все скрытые связи и побочные эффекты (useEffect, мутации стейта).
2. Спроектируй строгие TypeScript-интерфейсы по модели Single Responsibility Principle.
3. Напиши 4 регрессионных теста Vitest (happy path, edge cases, error recovery).
4. Выведи готовый к деплою код с пошаговыми инструкциями интеграции.`
    : `You are a Principal Software Architect in Claude 3.7 Thinking Mode.
Perform architectural analysis and safe refactoring on module '${mainFile}' (~${mainFileLines} LOC).

Reasoning Steps:
1. Map all hidden coupling and side-effects (unstable useEffects, state mutations).
2. Design strict TypeScript interfaces following the Single Responsibility Principle.
3. Generate 4 regression Vitest test suites (happy path, empty/null, network error timeout).
4. Provide production-ready refactored code with atomic integration steps.`;
}

/**
 * Analyzes pasted code snippet using sanitized code matching.
 */
export function analyzeSnippet(rawCode: string, isRu = true): AuditReport {
  const lineCount = rawCode.split("\n").length;
  // Strip comments and strings before inspecting code smells!
  const sanitized = stripCodeLiteralsAndComments(rawCode);

  const anyMatches = (sanitized.match(/\bas any\b/g) || []).length;
  const hasClient = rawCode.includes('"use client"') || rawCode.includes("'use client'");
  const secretMatches = hasClient
    ? (sanitized.match(/(SERVICE_ROLE|STRIPE_SECRET|SECRET_KEY|PRIVATE_KEY)/gi) || []).length
    : 0;
  const hasObjectDepLoop =
    sanitized.includes("useEffect") &&
    (sanitized.includes("[filters]") || sanitized.includes("[options]") || sanitized.includes("[params]"));
  const emptyCatchMatches = (rawCode.match(/catch\s*\([^)]*\)\s*\{\s*\}/g) || []).length;

  let score = 20;
  if (hasClient && secretMatches > 0) score += 35;
  if (hasObjectDepLoop) score += 20;
  if (emptyCatchMatches > 0) score += 15;
  if (anyMatches > 0) score += Math.min(20, anyMatches * 5);
  if (lineCount > 300) score += 20;

  const doomsdayScore = Math.min(95, Math.max(12, score));
  const antipatterns: Antipattern[] = [];

  if (hasClient && secretMatches > 0) {
    antipatterns.push({
      title: isRu ? "Секретные ключи в клиентском бандле ('use client')" : "Master Secrets in Client Bundle ('use client')",
      cwe: "CWE-798",
      description: isRu
        ? "Приватные переменные импортированы в клиентский компонент. Любой пользователь видит этот токен в DevTools браузера."
        : "Private credentials imported in client component. Exposed in public browser DevTools.",
      severity: "CRITICAL",
      detectedIn: "snippet:client-bundle",
      sampleBadCode: `const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);`,
      sampleFix: `"use server";\nexport async function adminTask() { ... }`,
    });
  }

  if (hasObjectDepLoop) {
    antipatterns.push({
      title: isRu ? "Бесконечный цикл ререндера в useEffect" : "Infinite Rerender Loop in useEffect",
      cwe: "CWE-400",
      description: isRu
        ? "Объект в зависимостях пересоздается при каждом рендере, вызывая лавину запросов к БД."
        : "Object recreated every render in dependency array, firing 20+ queries per second.",
      severity: "HIGH",
      detectedIn: "snippet:useEffect",
      sampleBadCode: `useEffect(() => { fetchData(filters); }, [filters]);`,
      sampleFix: `const filterKey = useMemo(() => JSON.stringify(filters), [filters]);\nuseEffect(() => { fetchData(filters); }, [filterKey]);`,
    });
  }

  if (anyMatches > 0) {
    antipatterns.push({
      title: isRu ? `Подавление типов через 'as any' (${anyMatches} шт.)` : `Type Suppression via 'as any' (${anyMatches} found)`,
      cwe: "CWE-704",
      description: isRu
        ? "Отключение статической проверки типов ведет к тихим падениям приложения у реальных пользователей."
        : "Bypassing TypeScript checks causes unexpected runtime errors.",
      severity: "HIGH",
      detectedIn: "snippet:types",
      sampleBadCode: `const payload = (await res.json()) as any;`,
      sampleFix: `const schema = z.object({ id: z.string() });\nconst payload = schema.parse(await res.json());`,
    });
  }

  const godComponents: GodComponent[] =
    lineCount > 300
      ? [
          {
            name: "Snippet.tsx",
            lines: lineCount,
            issues: [isRu ? `Файл превышает 300 строк (${lineCount} LOC)` : `File exceeds 300 lines (${lineCount} LOC)`],
            risk: "high",
          },
        ]
      : [];

  const timeToCollapse = formatTimeToCollapse(doomsdayScore, isRu);

  const refactorSteps: RefactorStep[] = [
    {
      step: 1,
      title: isRu ? "Хирургический распил сниппета" : "Surgical Snippet Decoupling",
      estimatedTime: "10 минут",
      targetTool: "Cursor Composer",
      prompt: getCursorPrompt("Snippet.tsx", lineCount, isRu),
    },
    {
      step: 2,
      title: isRu ? "Глубокий анализ архитектуры Claude 3.7" : "Claude 3.7 Deep Architecture Audit",
      estimatedTime: "10 минут",
      targetTool: "Claude 3.7 Thinking",
      prompt: getClaudePrompt("Snippet.tsx", lineCount, isRu),
    },
  ];

  return {
    title: "Analyzed Code Snippet",
    repoName: "custom/snippet.tsx",
    isRealRepo: false,
    doomsdayScore,
    timeToCollapse,
    estimatedFixCost: Math.round((doomsdayScore * 45) / 100) * 100,
    criticalBugsCount: antipatterns.filter((a) => a.severity === "CRITICAL").length,
    spaghettiIndex: +(doomsdayScore / 10).toFixed(1),
    ghostTypesCount: anyMatches * 4 + 4,
    filesScanned: 1,
    hasTests: false,
    godComponents,
    antipatterns,
    refactorSteps,
    diagnosticsSummary: isRu
      ? `Анализ фрагмента завершен: ${lineCount} строк, обнаружено ${antipatterns.length} антипаттернов.`
      : `Snippet analysis complete: ${lineCount} lines, ${antipatterns.length} antipatterns detected.`,
  };
}

/**
 * LRU In-Memory Cache with maximum entry limit.
 */
export class LRUCache<T> {
  private cache = new Map<string, { value: T; timestamp: number }>();
  private maxEntries: number;
  private ttlMs: number;

  constructor(maxEntries = 250, ttlMs = 3600000) {
    this.maxEntries = maxEntries;
    this.ttlMs = ttlMs;
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() - entry.timestamp > this.ttlMs) {
      this.cache.delete(key);
      return null;
    }
    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, entry);
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxEntries) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) this.cache.delete(oldestKey);
    }
    this.cache.set(key, { value, timestamp: Date.now() });
  }

  size(): number {
    return this.cache.size;
  }
}

/**
 * In-Memory Sliding Window Rate Limiter
 */
export class SimpleRateLimiter {
  private requests = new Map<string, number[]>();

  isAllowed(key: string, limit = 30, windowMs = 60000): boolean {
    const now = Date.now();
    const timestamps = this.requests.get(key) || [];
    const valid = timestamps.filter((t) => now - t < windowMs);
    if (valid.length >= limit) {
      this.requests.set(key, valid);
      return false;
    }
    valid.push(now);
    this.requests.set(key, valid);
    return true;
  }
}

/**
 * Validates that a target URL is a safe public HTTP/HTTPS endpoint.
 * Prevents SSRF attacks against loopback, link-local, and private RFC-1918 subnets.
 */
export function isSafePublicUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl.trim());
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();
    if (!hostname || hostname === "localhost" || hostname === "0.0.0.0" || hostname === "::1") return false;
    // Reject private and link-local IP addresses
    if (/^127\./.test(hostname)) return false;
    if (/^10\./.test(hostname)) return false;
    if (/^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(hostname)) return false;
    if (/^192\.168\./.test(hostname)) return false;
    if (/^169\.254\./.test(hostname)) return false;
    if (hostname.endsWith(".internal") || hostname.endsWith(".local")) return false;
    return true;
  } catch {
    return false;
  }
}

/**
 * Extracts script bundle URLs from HTML markup and resolves them to absolute URLs.
 */
export function extractScriptUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = [];
  const scriptRegex = /<script\b[^>]*\bsrc=["']([^"']+)["'][^>]*>/gi;
  let match;
  while ((match = scriptRegex.exec(html)) !== null) {
    const src = match[1];
    if (!src || src.startsWith("data:")) continue;
    try {
      const resolved = new URL(src, baseUrl).toString();
      if (!urls.includes(resolved)) {
        urls.push(resolved);
      }
    } catch {
      // ignore malformed URLs
    }
  }
  return urls.slice(0, 6);
}

/**
 * Performs a live bundle and security header inspection of a deployed web application.
 */
export async function analyzeLiveApp(liveUrl: string, isRu = true): Promise<AuditReport> {
  const parsed = new URL(liveUrl);
  const hostname = parsed.hostname;

  // 1. Fetch main document
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  let html = "";
  const headersMap = new Map<string, string>();

  try {
    const res = await fetch(liveUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (VibeDebt-Auditor/1.0; +https://vibedebt.dev)",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
    });

    res.headers.forEach((val, key) => headersMap.set(key.toLowerCase(), val));
    html = await res.text();
  } finally {
    clearTimeout(timeout);
  }

  const antipatterns: Antipattern[] = [];
  const godComponents: GodComponent[] = [];
  let score = 25;
  let criticalBugsCount = 0;

  // 2. Check Security Headers
  const hsts = headersMap.get("strict-transport-security");
  const csp = headersMap.get("content-security-policy");
  const xframe = headersMap.get("x-frame-options");
  const wildcardCors = headersMap.get("access-control-allow-origin");

  if (!hsts && parsed.protocol === "https:") {
    score += 8;
    antipatterns.push({
      title: isRu ? "Отсутствует заголовок HSTS (Strict-Transport-Security)" : "Missing HSTS Header",
      cwe: "CWE-319",
      severity: "WARNING",
      description: isRu
        ? "Сайт доступен по HTTPS, но не запрещает откат соединения на небезопасный HTTP через HSTS."
        : "Application allows cleartext HTTP downgrade due to missing HSTS response header.",
      detectedIn: "HTTP Response Headers",
      sampleBadCode: "// Headers: Strict-Transport-Security is missing",
      sampleFix: "Strict-Transport-Security: max-age=63072000; includeSubDomains; preload",
    });
  }

  if (!csp) {
    score += 10;
    antipatterns.push({
      title: isRu ? "Отсутствует Content Security Policy (CSP)" : "Missing Content Security Policy (CSP)",
      cwe: "CWE-1021",
      severity: "HIGH",
      description: isRu
        ? "Браузер не ограничивает источники скриптов и фреймов, что повышает риск XSS и кликджекинга."
        : "Missing CSP header exposes modern web application to cross-site scripting and unauthorized iframe injection.",
      detectedIn: "HTTP Response Headers",
      sampleBadCode: "// Headers: Content-Security-Policy is missing",
      sampleFix: "Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline';",
    });
  }

  if (wildcardCors === "*") {
    score += 10;
    antipatterns.push({
      title: isRu ? "Небезопасный Wildcard CORS (Access-Control-Allow-Origin: *)" : "Wildcard CORS (*)",
      cwe: "CWE-942",
      severity: "HIGH",
      description: isRu
        ? "Сервер разрешает произвольным внешним сайтам читать ответы ваших API через браузер пользователя."
        : "Wildcard Access-Control-Allow-Origin permits arbitrary domains to read client responses.",
      detectedIn: "HTTP Response Headers",
      sampleBadCode: "Access-Control-Allow-Origin: *",
      sampleFix: `Access-Control-Allow-Origin: https://${hostname}`,
    });
  }

  if (!xframe) {
    score += 5;
    antipatterns.push({
      title: isRu ? "Отсутствует защита от кликджекинга (X-Frame-Options)" : "Missing X-Frame-Options",
      cwe: "CWE-1021",
      severity: "WARNING",
      description: isRu
        ? "Сайт может быть встроен в скрытый iframe стороннего сайта для манипуляции действиями пользователя."
        : "Application can be embedded in arbitrary third-party iframes, exposing visitors to clickjacking.",
      detectedIn: "HTTP Response Headers",
      sampleBadCode: "// Headers: X-Frame-Options is missing",
      sampleFix: "X-Frame-Options: DENY",
    });
  }

  // 3. Extract and scan JS bundles
  const scriptUrls = extractScriptUrls(html, liveUrl);
  let hasSourceMapLeak = false;

  const bundleResults = await Promise.allSettled(
    scriptUrls.slice(0, 4).map(async (scriptUrl) => {
      const scriptCtrl = new AbortController();
      const scriptTimeout = setTimeout(() => scriptCtrl.abort(), 5000);
      try {
        const sRes = await fetch(scriptUrl, { signal: scriptCtrl.signal });
        if (!sRes.ok) return null;
        const code = await sRes.text();
        const scriptName = scriptUrl.split("/").pop() || "bundle.js";

        // Check if bundle is oversized (>350KB)
        if (code.length > 350000) {
          godComponents.push({
            name: scriptName,
            lines: Math.round(code.length / 40),
            sizeBytes: code.length,
            issues: [isRu ? "Монолитный бандл (>350 КБ)" : "Heavy client bundle (>350 KB)"],
            risk: "medium",
          });
        }

        // Check sourcemap
        try {
          const mapUrl = scriptUrl + ".map";
          const mapRes = await fetch(mapUrl, { method: "HEAD", signal: scriptCtrl.signal });
          if (mapRes.ok && mapRes.status === 200) {
            hasSourceMapLeak = true;
          }
        } catch {
          // safe
        }

        return { name: scriptName, code };
      } finally {
        clearTimeout(scriptTimeout);
      }
    })
  );

  for (const item of bundleResults) {
    if (item.status !== "fulfilled" || !item.value) continue;
    const { name, code } = item.value;

    // Check Stripe live secret key in browser bundle
    if (/sk_live_[a-zA-Z0-9]{24,}/.test(code)) {
      criticalBugsCount++;
      score += 35;
      antipatterns.push({
        title: isRu ? "Секретный ключ Stripe в клиентском бандле" : "Live Stripe Secret Key in Client Bundle",
        cwe: "CWE-798",
        severity: "CRITICAL",
        description: isRu
          ? `В клиентском JS-файле '${name}' обнаружен боевой ключ sk_live_... Любой посетитель может управлять платежами и балансом.`
          : `Live Stripe secret key found in client bundle '${name}'. Anyone can issue refunds and manage balance.`,
        detectedIn: name,
        sampleBadCode: `const stripe = new Stripe("sk_live_51M...[EXPOSED IN CLIENT BUNDLE]");`,
        sampleFix: `// Server-only:\nimport Stripe from "stripe";\nexport const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);`,
      });
    }

    // Check Supabase Service Role Key
    if (/SUPABASE_SERVICE_ROLE_KEY|service_role/i.test(code) && /eyJhbGciOi/i.test(code)) {
      criticalBugsCount++;
      score += 40;
      antipatterns.push({
        title: isRu ? "Master Service Role Key Supabase в бандле" : "Supabase Master Service Role Key in Bundle",
        cwe: "CWE-798",
        severity: "CRITICAL",
        description: isRu
          ? `Обнаружен мастер-токен Supabase с полным обходом Row Level Security прямо в скомпилированном браузере '${name}'.`
          : `Master service_role JWT discovered in client JavaScript '${name}'. Bypasses all database RLS.`,
        detectedIn: name,
        sampleBadCode: `const supabase = createClient(url, "eyJhbGciOi...service_role");`,
        sampleFix: `// Move all admin calls to Next.js Server Actions or Node API routes.`,
      });
    }
  }

  if (hasSourceMapLeak) {
    score += 15;
    antipatterns.push({
      title: isRu ? "Публичные Source Maps в продакшне (*.js.map)" : "Public Source Maps Leaked (*.js.map)",
      cwe: "CWE-540",
      severity: "HIGH",
      description: isRu
        ? "Сайт отдает файлы sourcemaps, позволяя любому злоумышленнику выгрузить полный оригинальный TypeScript код со всеми комментариями."
        : "Production server exposes .js.map source maps, allowing anyone to recreate the entire TypeScript source code.",
      detectedIn: "Static Web Assets",
      sampleBadCode: "// curl https://" + hostname + "/assets/index.js.map -> 200 OK (Full Source Code)",
      sampleFix: "productionSourceMap: false // in next.config.js or vite.config.ts",
    });
  }

  score = Math.min(Math.round(score), 98);
  const timeToCollapse = formatTimeToCollapse(score, isRu);
  const estimatedFixCost = Math.round(900 + (score / 100) * 3800 + criticalBugsCount * 800);

  const refactorSteps: RefactorStep[] = [
    {
      step: 1,
      title: isRu ? "Изоляция секретов в Server-Side Route Handlers" : "Isolate Secrets to Server-Side Routes",
      estimatedTime: "15 минут",
      targetTool: "Cursor Composer",
      prompt: `Ты — Senior Security Engineer в Cursor Composer.\nПроведи аудит бандла приложения '${hostname}'.\n\nИнструкции:\n1. Убедись, что все приватные ключи (Stripe sk_live, Supabase service_role) находятся исключительно в серверных эндпоинтах (/api/... или 'use server').\n2. Проверь 'next.config.js' / 'vite.config.ts' и отключи генерацию sourcemaps для продакшн сборки (productionSourceMap: false).\n3. Добавь заголовки HSTS и Content-Security-Policy в middleware.`,
    },
    {
      step: 2,
      title: isRu ? "Глубокая ревизия RLS Supabase через Claude 3.7" : "Supabase RLS Deep Audit with Claude 3.7",
      estimatedTime: "20 минут",
      targetTool: "Claude 3.7 Thinking",
      prompt: `Ты — Principal Cloud Architect в Claude 3.7 Thinking.\nПроанализируй базу данных проекта '${hostname}'.\n\nПлан проверки:\n1. Проверь все таблицы Supabase на наличие уязвимости USING (true).\n2. Напиши строгие SQL-политики RLS для разделения доступа между пользователями (auth.uid() = user_id).\n3. Настрой безопасную ротацию скомпрометированных ключей API.`,
    },
  ];

  return {
    title: isRu ? `Аудит веб-приложения: ${hostname}` : `Live App Audit: ${hostname}`,
    repoName: `live://${hostname}`,
    isRealRepo: false,
    doomsdayScore: score,
    timeToCollapse,
    estimatedFixCost,
    criticalBugsCount,
    spaghettiIndex: Math.min(9.5, Math.round((score / 10) * 10) / 10),
    ghostTypesCount: 0,
    filesScanned: scriptUrls.length + 1,
    hasTests: false,
    primaryLanguage: "Production Web Bundle",
    godComponents,
    antipatterns,
    refactorSteps,
    diagnosticsSummary: isRu
      ? `Проверено приложение ${hostname}: ${scriptUrls.length} скриптов, обнаружено ${criticalBugsCount} критических уязвимостей.`
      : `Scanned ${hostname}: ${scriptUrls.length} bundles inspected, ${criticalBugsCount} critical vulnerabilities found.`,
  };
}

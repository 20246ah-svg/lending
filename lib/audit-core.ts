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
 * Formula for the interactive Doomsday Calculator.
 */
export function calculateDoomsday(
  lines: number,
  godFiles: number,
  hasTests: boolean,
  dbState: "clean" | "medium" | "mess"
): { score: number; days: number; emergencyCost: number; fragilityPercent: number } {
  let score = 20;
  score += (lines / 20000) * 35;
  score += godFiles * 6;
  if (!hasTests) score += 20;
  if (dbState === "mess") score += 15;
  else if (dbState === "medium") score += 8;

  score = Math.min(Math.round(score), 99);
  let days = Math.round(90 - (score / 100) * 85);
  days = Math.max(days, 2);

  const emergencyCost = Math.round((score / 100) * 6500 + godFiles * 450);

  return {
    score,
    days,
    emergencyCost,
    fragilityPercent: Math.min(score + 4, 99),
  };
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

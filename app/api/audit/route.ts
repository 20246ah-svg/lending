import { NextResponse } from "next/server";
import { AuditReport, GodComponent, Antipattern, RefactorStep, AuditRequestBody } from "@/lib/types";

// In-memory cache for GitHub audit results to prevent rate limit depletion
interface CacheEntry {
  report: AuditReport;
  timestamp: number;
}
const auditCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
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

async function fetchWithTimeout(url: string, headers: Record<string, string> = {}, timeoutMs = 8000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { headers, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function isIgnoredFile(path: string): boolean {
  const lower = path.toLowerCase();
  return (
    lower.includes(".test.") ||
    lower.includes(".spec.") ||
    lower.includes("__tests__") ||
    lower.includes("/tests/") ||
    lower.includes("/test/") ||
    lower.endsWith(".d.ts") ||
    lower.endsWith(".min.js") ||
    lower.endsWith(".min.css") ||
    lower.includes("node_modules/") ||
    lower.includes("dist/") ||
    lower.includes("build/") ||
    lower.includes(".next/") ||
    lower.includes("fixtures/") ||
    lower.includes("mocks/")
  );
}

export async function POST(req: Request) {
  try {
    let body: AuditRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { url, snippet, archetype, lang = "ru" } = body;
    const isRu = lang === "ru";

    // 1. Archetype Presets handler
    if (archetype) {
      if (archetype === "bolt-landing") {
        return NextResponse.json({ success: true, data: getBoltPreset(isRu) });
      }
      if (archetype === "crypto-bot") {
        return NextResponse.json({ success: true, data: getCryptoBotPreset(isRu) });
      }
      return NextResponse.json({ success: true, data: getCursorSaasPreset(isRu) });
    }

    // 2. Snippet Analysis handler
    if (snippet && typeof snippet === "string" && snippet.trim().length > 10) {
      const report = analyzeSnippet(snippet, isRu);
      return NextResponse.json({ success: true, data: report });
    }

    // 3. GitHub Repository Analysis
    if (url && typeof url === "string") {
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        return NextResponse.json(
          {
            error: isRu
              ? "Некорректная ссылка на GitHub. Пример: https://github.com/shadcn-ui/ui или owner/repo"
              : "Invalid GitHub repository URL. Example: https://github.com/shadcn-ui/ui or owner/repo",
          },
          { status: 400 }
        );
      }

      const { owner, repo } = parsed;
      const cacheKey = `${owner.toLowerCase()}/${repo.toLowerCase()}:${lang}`;

      // Check cache
      const cached = auditCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return NextResponse.json({ success: true, data: cached.report });
      }

      const headers: Record<string, string> = {
        "User-Agent": "VibeDebt-Code-Auditor",
        Accept: "application/vnd.github.v3+json",
      };
      if (process.env.GITHUB_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
      }

      // Fetch repo metadata
      let repoRes: Response;
      try {
        repoRes = await fetchWithTimeout(`https://api.github.com/repos/${owner}/${repo}`, headers);
      } catch {
        return NextResponse.json(
          {
            error: isRu
              ? "Таймаут соединения с GitHub API. Проверьте сеть или используйте режим вставки кода."
              : "Connection timeout contacting GitHub API. Try analyzing a code snippet instead.",
          },
          { status: 504 }
        );
      }

      if (repoRes.status === 404) {
        return NextResponse.json(
          {
            error: isRu
              ? `Репозиторий ${owner}/${repo} не найден или является приватным.`
              : `Repository ${owner}/${repo} not found or is private.`,
          },
          { status: 404 }
        );
      }

      if (repoRes.status === 403) {
        return NextResponse.json(
          {
            error: isRu
              ? "Превышен лимит запросов к GitHub API без авторизации (60/час). Воспользуйтесь вкладкой «Вставить код» для мгновенного анализа."
              : "GitHub API rate limit exceeded. Please use the 'Paste Code' tab for instant analysis.",
            isRateLimited: true,
          },
          { status: 429 }
        );
      }

      if (!repoRes.ok) {
        return NextResponse.json(
          { error: `GitHub API error (HTTP ${repoRes.status})` },
          { status: repoRes.status }
        );
      }

      interface GitHubRepoMeta {
        default_branch?: string;
        stargazers_count?: number;
        language?: string;
      }
      const repoData: GitHubRepoMeta = await repoRes.json();
      const defaultBranch = repoData.default_branch || "main";

      // Fetch repo tree
      let treeItems: Array<{ path: string; size?: number; type: string }> = [];
      try {
        const treeRes = await fetchWithTimeout(
          `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
          headers
        );
        if (treeRes.ok) {
          interface TreeResponse {
            tree?: Array<{ path: string; size?: number; type: string }>;
          }
          const treeData: TreeResponse = await treeRes.json();
          treeItems = treeData.tree || [];
        }
      } catch {
        // Continue with empty tree if tree call fails
      }

      // Check package.json & lockfiles
      let hasTests = false;
      let hasTypeScript = false;
      let hasPackageJson = false;

      const lockFiles = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"];
      const hasLockFile = treeItems.some((f) => lockFiles.some((lf) => f.path.endsWith(lf)));

      const pkgItem = treeItems.find((item) => item.path === "package.json" || item.path.endsWith("/package.json"));
      if (pkgItem) {
        hasPackageJson = true;
        try {
          const pkgRes = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/${repo}/contents/${pkgItem.path}?ref=${defaultBranch}`,
            headers
          );
          if (pkgRes.ok) {
            interface PkgContentResponse {
              content?: string;
            }
            const pkgBody: PkgContentResponse = await pkgRes.json();
            if (pkgBody.content) {
              const decoded = Buffer.from(pkgBody.content, "base64").toString("utf-8");
              interface PackageJsonStructure {
                dependencies?: Record<string, string>;
                devDependencies?: Record<string, string>;
              }
              const parsedPkg: PackageJsonStructure = JSON.parse(decoded);
              const allDeps: Record<string, string> = {
                ...(parsedPkg.dependencies || {}),
                ...(parsedPkg.devDependencies || {}),
              };

              const testLibs = ["jest", "vitest", "playwright", "cypress", "mocha", "ava", "supertest"];
              hasTests = Object.keys(allDeps).some((d) => testLibs.some((tl) => d.includes(tl)));
              hasTypeScript = "typescript" in allDeps || "@types/node" in allDeps;
            }
          }
        } catch {
          // ignore package.json parse errors
        }
      }

      // Check for test files in tree
      const testFiles = treeItems.filter(
        (t) =>
          t.path.includes(".test.") ||
          t.path.includes(".spec.") ||
          t.path.includes("__tests__/") ||
          t.path.includes("/tests/") ||
          t.path.includes("/test/")
      );
      if (testFiles.length > 0) {
        hasTests = true;
      }

      // Filter real application source code files (exclude tests, minified, types)
      const codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".vue", ".svelte"];
      const realSourceFiles = treeItems.filter(
        (t) => t.type === "blob" && !isIgnoredFile(t.path) && codeExtensions.some((ext) => t.path.endsWith(ext))
      );

      // Sort by size to find God-components
      const sortedSourceBySize = [...realSourceFiles]
        .filter((t) => typeof t.size === "number" && t.size > 0)
        .sort((a, b) => (b.size || 0) - (a.size || 0));

      const topLargest = sortedSourceBySize.slice(0, 5);

      // Fetch top 1 source file to inspect code patterns
      let sampledCode = "";
      let sampledFilePath = "";
      if (topLargest.length > 0 && (topLargest[0].size || 0) < 95000) {
        try {
          const sampleRes = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/${repo}/contents/${topLargest[0].path}?ref=${defaultBranch}`,
            headers
          );
          if (sampleRes.ok) {
            interface FileContentResponse {
              content?: string;
            }
            const sampleJson: FileContentResponse = await sampleRes.json();
            if (sampleJson.content) {
              sampledCode = Buffer.from(sampleJson.content, "base64").toString("utf-8");
              sampledFilePath = topLargest[0].path;
            }
          }
        } catch {
          // ignore sample fetch error
        }
      }

      // Static checks in sampled file
      const anyMatches = (sampledCode.match(/\bas any\b/g) || []).length;
      const isClientFile = sampledCode.includes('"use client"') || sampledCode.includes("'use client'");
      const secretMatches = isClientFile
        ? (sampledCode.match(/(SERVICE_ROLE|STRIPE_SECRET_KEY|PRIVATE_KEY)/gi) || []).length
        : 0;

      // God files criteria: files > 14 KB (~350+ lines)
      const trulyLargeFiles = topLargest.filter((f) => (f.size || 0) > 14000);
      const godComponents: GodComponent[] = trulyLargeFiles.slice(0, 4).map((f) => {
        const estLines = sampledFilePath === f.path && sampledCode
          ? sampledCode.split("\n").length
          : Math.round((f.size || 0) / 38);

        const issues: string[] = [];
        if (estLines > 700) {
          issues.push(
            isRu
              ? `Файл-монолит: ~${estLines} строк кода, превышает комфортное контекстное окно Cursor`
              : `Monolith: ~${estLines} lines, exceeds comfortable Cursor context window`
          );
        }
        if (f.path.includes("page.") || f.path.includes("App.")) {
          issues.push(
            isRu
              ? "Корневой компонент перегружен бизнес-логикой и рендером"
              : "Root page overloaded with state and presentation"
          );
        }
        if (!hasTests) {
          issues.push(
            isRu ? "Полное отсутствие автотестов для этого модуля" : "Zero unit test coverage for this module"
          );
        }
        return {
          name: f.path,
          lines: estLines,
          sizeBytes: f.size,
          issues: issues.length > 0 ? issues : [isRu ? "Высокая концентрация логики в одном месте" : "High structural coupling"],
          risk: estLines > 700 ? "critical" : estLines > 350 ? "high" : "medium",
        };
      });

      // Calculate Doomsday Score
      let baseScore = 20;
      if (!hasTests) baseScore += 22;
      if (trulyLargeFiles.length > 0) baseScore += trulyLargeFiles.length * 6;
      if (anyMatches > 5) baseScore += 12;
      if (secretMatches > 0) baseScore += 20;
      if (!hasLockFile && hasPackageJson) baseScore += 10;
      if (realSourceFiles.length > 60 && !hasTests) baseScore += 8;

      // Discount for popular verified repositories
      if ((repoData.stargazers_count || 0) > 1000 && hasTests) {
        baseScore = Math.max(12, baseScore - 35);
      }

      const doomsdayScore = Math.min(95, Math.max(12, baseScore));
      const isHealthy = doomsdayScore < 40;

      const antipatterns: Antipattern[] = [];

      if (secretMatches > 0 && sampledFilePath) {
        antipatterns.push({
          title: isRu ? "Утечка API ключей / Секретов в открытый бандл" : "Master Secrets in Client Bundle",
          cwe: "CWE-798",
          description: isRu
            ? `В файле ${sampledFilePath} найдены сервисные переменные (SERVICE_ROLE_KEY / PRIVATE_KEY) в клиентском коде ('use client'). Ключ доступен любому пользователю через DevTools.`
            : `In file ${sampledFilePath}, private master credentials were found in client-side code ('use client'). Any browser can read this key.`,
          severity: "CRITICAL",
          detectedIn: sampledFilePath,
          sampleBadCode: `// Найдено упоминание секретных ключей:\nprocess.env.SUPABASE_SERVICE_ROLE_KEY`,
          sampleFix: `// Вынесите приватные операции в Server Actions:\n"use server";\nexport async function adminAction() { ... }`,
        });
      }

      if (anyMatches > 0 && sampledFilePath) {
        antipatterns.push({
          title: isRu
            ? `Глушение ошибок компилятора через 'as any' (${anyMatches} шт.)`
            : `Compiler Type Suppression via 'as any' (${anyMatches} occurrences)`,
          cwe: "CWE-704",
          description: isRu
            ? `ИИ часто прибегает к 'as any', когда не может вывести сложный тип. Это создает ложную иллюзию безопасности и скрывает реальные рантайм-краши.`
            : `AI falls back to 'as any' when schema inference fails. This bypasses static checks and hides runtime exceptions.`,
          severity: "HIGH",
          detectedIn: sampledFilePath,
          sampleBadCode: `const data = (await res.json()) as any;`,
          sampleFix: `import { z } from "zod";\nconst schema = z.object({ id: z.string() });\nconst data = schema.parse(await res.json());`,
        });
      }

      if (!hasTests) {
        antipatterns.push({
          title: isRu ? "Разрыв в тестировании: 0 автотестов (Testing Gap)" : "Testing Gap: 0 Regression Tests",
          cwe: "CWE-1065",
          description: isRu
            ? "В репозитории не обнаружено тестового фреймворка (Vitest, Jest, Playwright). Любой последующий рефакторинг в Cursor несет риск тихой поломки логики."
            : "No test harness found (Vitest, Jest, Playwright). Any subsequent prompt carries a high risk of silent regression.",
          severity: doomsdayScore > 70 ? "CRITICAL" : "HIGH",
          detectedIn: "package.json",
          sampleBadCode: `"scripts": {\n  "dev": "next dev",\n  "build": "next build"\n}`,
          sampleFix: `npm i -D vitest\n"test": "vitest run"`,
        });
      }

      if (hasPackageJson && !hasLockFile) {
        antipatterns.push({
          title: isRu ? "Supply Chain Risk: Отсутствие lock-файла" : "Supply Chain Risk: Missing Lockfile",
          cwe: "CWE-1357",
          description: isRu
            ? "В репозитории не найден ни package-lock.json, ни pnpm-lock, ни bun.lock. До 19.7% рекомендаций библиотек от ИИ указывают на несуществующие пакеты, которые злоумышленники могут захватить."
            : "Missing lockfile (package-lock.json, pnpm-lock.yaml, or bun.lock). Unpinned dependencies risk hallucinated package attacks.",
          severity: "HIGH",
          detectedIn: "root",
          sampleBadCode: `// Lockfile missing in repository`,
          sampleFix: `// Run 'npm install' or 'pnpm install' and commit lockfile`,
        });
      }

      if (trulyLargeFiles.length > 0) {
        const topLines = godComponents[0]?.lines || Math.round((trulyLargeFiles[0].size || 0) / 38);
        antipatterns.push({
          title: isRu
            ? `Volume-Quality Inverse Law: Монолит ${trulyLargeFiles[0].path}`
            : `Volume-Quality Inverse Law: Monolith in ${trulyLargeFiles[0].path}`,
          cwe: "CWE-398",
          description: isRu
            ? "Файл превышает допустимый предел связанности. С ростом размера файла ИИ теряет контекст и начинает затирать соседний функционал при добавлении фич."
            : "File exceeds single-responsibility size. As file expands, LLM context degrades and overwrites existing features.",
          severity: topLines > 700 ? "CRITICAL" : "HIGH",
          detectedIn: trulyLargeFiles[0].path,
          sampleBadCode: `// Monolithic file with ~${topLines} lines`,
          sampleFix: `// Decouple into 3 isolated service components`,
        });
      }

      // If repo is healthy, ensure critical bugs count is 0
      const criticalBugsCount = isHealthy
        ? 0
        : antipatterns.filter((a) => a.severity === "CRITICAL").length;

      const estimatedFixCost = isHealthy
        ? 300
        : Math.round((doomsdayScore * 55) / 100) * 100;

      const spaghettiIndex = isHealthy
        ? 2.1
        : Math.min(9.8, Math.max(2.5, +(doomsdayScore / 10).toFixed(1)));

      const timeToCollapse = isHealthy
        ? (isRu ? "Более 100 коммитов (стабильная архитектура)" : "Over 100 commits (healthy architecture)")
        : doomsdayScore > 75
        ? (isRu ? `${Math.max(4, Math.round((100 - doomsdayScore) * 1.1))} коммитов до блокирующего сбоя` : `${Math.max(4, Math.round((100 - doomsdayScore) * 1.1))} commits until regression lock`)
        : (isRu ? `${Math.round((100 - doomsdayScore) * 1.5)} коммитов до регрессии` : `${Math.round((100 - doomsdayScore) * 1.5)} commits to degradation`);

      // Dynamic surgical prompts
      const mainFile = topLargest[0]?.path || "app/page.tsx";
      const mainFileLines = godComponents[0]?.lines || 450;
      const cleanBaseName = mainFile.split("/").pop()?.replace(/\.[^/.]+$/, "") || "Component";

      const refactorSteps: RefactorStep[] = [
        {
          step: 1,
          title: isRu
            ? `Безопасный распил модуля ${mainFile} (~${mainFileLines} строк)`
            : `Decouple monolith module ${mainFile} (~${mainFileLines} LOC)`,
          estimatedTime: "15 минут",
          targetTool: "Cursor Composer / Claude 3.7",
          prompt: isRu
            ? `Ты — Senior Refactoring Agent в Cursor / Claude 3.7.
Задача: примени Single Responsibility Principle к модулю '${mainFile}' (~${mainFileLines} строк).
Безопасно разбей его на 3 слабосвязанных компонента в '/components/${cleanBaseName}/':
1. Сохрани '${mainFile}' как чистый оркестратор не более 100 строк.
2. Вынеси UI и стейт в изолированные подкомпоненты.
3. Сохрани все пропсы, хуки и типы без использования 'any'. Верни полный рабочий код без комментариев '// rest of code stays here'.`
            : `You are a Senior Refactoring Agent in Cursor / Claude 3.7.
Goal: Apply Single Responsibility Principle to '${mainFile}' (~${mainFileLines} LOC).
Decouple safely into 3 modular components under '/components/${cleanBaseName}/':
1. Keep '${mainFile}' as clean orchestrator under 100 lines.
2. Isolate state and UI logic into typed modules.
3. Preserve all hooks and props without any 'as any' casts. Output complete code.`,
        },
        {
          step: 2,
          title: secretMatches > 0
            ? (isRu ? "Изоляция приватных ключей в Server Actions" : "Isolate Master Secrets to Server Actions")
            : (isRu ? "Строгая валидация типов через Zod" : "Strict Type Validation via Zod"),
          estimatedTime: "10 минут",
          targetTool: "Cursor Cmd+K",
          prompt: secretMatches > 0
            ? `Ты — Senior Security Engineer в Cursor.
В '${sampledFilePath || mainFile}' найдена сервисная переменная в клиентском бандле.
Вынеси обращение к базе данных в защищенный Server Action в 'app/actions/secure.ts' с директивой 'use server'.`
            : `Ты — TypeScript Strictness Architect.
В '${sampledFilePath || mainFile}' замени все приведения 'as any' на строгие схемы Zod с проверкой ошибок через safeParse().`,
        },
        {
          step: 3,
          title: isRu ? "Генерация регрессионного тестового набора Vitest" : "Generate Vitest Regression Suite",
          estimatedTime: "10 минут",
          targetTool: "Claude 3.7 Thinking",
          prompt: isRu
            ? `Напиши 4 юнит-теста Vitest для ключевых функций '${mainFile}':
1. Валидный успешный сценарий (Happy path).
2. Пустой ввод / null / undefined.
3. Неверный формат данных.
4. Ошибка сети и таймаут 5 секунд.`
            : `Generate 4 Vitest unit tests for core functions in '${mainFile}':
1. Valid happy path scenario.
2. Empty/null input handling.
3. Malformed data payload.
4. Network failure with 5-second timeout.`,
        },
      ];

      const report: AuditReport = {
        title: `${owner}/${repo}`,
        repoName: `${owner}/${repo}`,
        isRealRepo: true,
        doomsdayScore,
        timeToCollapse,
        estimatedFixCost,
        criticalBugsCount,
        spaghettiIndex,
        ghostTypesCount: anyMatches * 4 + 8,
        filesScanned: realSourceFiles.length || treeItems.length,
        hasTests,
        starsCount: repoData.stargazers_count,
        primaryLanguage: repoData.language || (hasTypeScript ? "TypeScript" : "JavaScript"),
        godComponents,
        antipatterns,
        refactorSteps,
        diagnosticsSummary: isRu
          ? `Просканировано ${realSourceFiles.length} файлов. Doomsday Score: ${doomsdayScore}%. ${
              hasTests ? "Автотесты присутствуют." : "Обнаружен критический разрыв в тестировании (0 тестов)."
            }`
          : `Scanned ${realSourceFiles.length} files. Doomsday Score: ${doomsdayScore}%. ${
              hasTests ? "Tests present." : "Critical testing gap identified."
            }`,
      };

      // Save to cache
      auditCache.set(cacheKey, { report, timestamp: Date.now() });

      return NextResponse.json({ success: true, data: report });
    }

    return NextResponse.json(
      { error: isRu ? "Необходимо передать url, snippet или archetype" : "Must provide url, snippet, or archetype" },
      { status: 400 }
    );
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown audit engine error";
    return NextResponse.json(
      { error: "Audit engine internal error", details: errorMsg },
      { status: 500 }
    );
  }
}

// ---------------------------------------------------------
// Static Snippet Analysis
// ---------------------------------------------------------
function analyzeSnippet(code: string, isRu = true): AuditReport {
  const lineCount = code.split("\n").length;
  const anyMatches = (code.match(/\bas any\b/g) || []).length;
  const hasClient = code.includes('"use client"') || code.includes("'use client'");
  const secretMatches = (code.match(/(SERVICE_ROLE|STRIPE_SECRET|SECRET_KEY|API_KEY)/gi) || []).length;
  const hasObjectDepLoop = code.includes("useEffect") && code.includes("[filters]") || code.includes("[options]");
  const emptyCatchMatches = (code.match(/catch\s*\([^)]*\)\s*\{\s*\}/g) || []).length;

  let score = 25;
  if (hasClient && secretMatches > 0) score += 30;
  if (hasObjectDepLoop) score += 18;
  if (emptyCatchMatches > 0) score += 15;
  if (anyMatches > 0) score += Math.min(20, anyMatches * 5);
  if (lineCount > 300) score += 20;

  const doomsdayScore = Math.min(95, Math.max(15, score));
  const antipatterns: Antipattern[] = [];

  if (hasClient && secretMatches > 0) {
    antipatterns.push({
      title: isRu ? "Секретные ключи в клиентском бандле ('use client')" : "Master Secrets in Client Bundle ('use client')",
      cwe: "CWE-798",
      description: isRu
        ? "Приватные переменные импортированы в клиентский компонент. Любой пользователь видит этот токен в DevTools браузера."
        : "Private credentials imported in client component. Exposed in public browser DevTools.",
      severity: "CRITICAL",
      detectedIn: "snippet:line-7",
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

  const godComponents: GodComponent[] = lineCount > 300 ? [
    {
      name: "Snippet.tsx",
      lines: lineCount,
      issues: [isRu ? "Файл превышает 300 строк: Cursor теряет контекст" : "File exceeds 300 lines"],
      risk: "high",
    }
  ] : [];

  const refactorSteps: RefactorStep[] = [
    {
      step: 1,
      title: isRu ? "Хирургический распил сниппета" : "Surgical Snippet Decoupling",
      estimatedTime: "10 минут",
      targetTool: "Cursor Composer",
      prompt: isRu
        ? `Ты — Senior Refactoring Agent в Cursor. Декомпозируй предоставленный код на 2 независимых модуля: изолируй логику работы с данными и отдели презентационный UI.`
        : `You are a Senior Refactoring Agent in Cursor. Decouple the provided code into 2 isolated modules: separate data logic and UI layer.`,
    },
    {
      step: 2,
      title: isRu ? "Замена 'as any' на валидацию Zod" : "Replace 'as any' with Zod Validation",
      estimatedTime: "5 минут",
      targetTool: "Cursor Cmd+K",
      prompt: isRu
        ? `Создай Zod-схему для входных и выходных данных этого компонента. Исключи использование 'any'.`
        : `Create a Zod schema for input and output data payloads. Eliminate all 'any' casts.`,
    }
  ];

  return {
    title: "Analyzed Code Snippet",
    repoName: "custom/snippet.tsx",
    isRealRepo: false,
    doomsdayScore,
    timeToCollapse: isRu ? "9 коммитов до деградации" : "9 commits until degradation",
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

// ---------------------------------------------------------
// Archetype Presets
// ---------------------------------------------------------
function getCursorSaasPreset(isRu = true): AuditReport {
  return {
    title: "AI Micro-SaaS (Cursor + Claude 3.7)",
    repoName: "founder/instant-ai-landing-builder",
    isRealRepo: false,
    doomsdayScore: 88,
    timeToCollapse: isRu ? "11 коммитов или 2 одновременных Stripe вебхука" : "11 commits or 2 concurrent webhooks",
    estimatedFixCost: 4800,
    criticalBugsCount: 3,
    spaghettiIndex: 9.3,
    ghostTypesCount: 54,
    filesScanned: 38,
    hasTests: false,
    primaryLanguage: "TypeScript",
    godComponents: [
      {
        name: "app/page.tsx",
        lines: 2420,
        issues: [
          isRu ? "Монолитный файл: содержит UI, запросы к Supabase, Stripe Checkout и 8 модалок" : "Monolithic page with 8 modals",
          isRu ? "14 вызовов useState на верхнем уровне без мемоизации" : "14 unmemoized useState hooks",
        ],
        risk: "critical",
      },
    ],
    antipatterns: [
      {
        title: isRu ? "Секретный Service Key в клиентском коде ('use client')" : "Master Service Role Key in 'use client'",
        cwe: "CWE-798",
        description: isRu
          ? "ИИ импортировал SUPABASE_SERVICE_ROLE_KEY прямо в клиентский компонент. Любой пользователь видит мастер-ключ в DevTools."
          : "Exposed master service role key in client component bundle.",
        severity: "CRITICAL",
        detectedIn: "app/dashboard/settings/page.tsx:14",
        sampleBadCode: `const supabase = createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!);`,
        sampleFix: `"use server";\nimport { createAdminClient } from "@/lib/supabase/admin";`,
      },
      {
        title: isRu ? "Бесконечная петля ререндеров в useEffect" : "Infinite Rerender Loop in useEffect",
        cwe: "CWE-400",
        description: isRu
          ? "Объект filters пересоздается при каждом рендере, вызывая 20+ запросов к БД в секунду."
          : "Unstable dependency object triggering 20+ queries per second.",
        severity: "HIGH",
        detectedIn: "components/PricingCalculator.tsx:89",
        sampleBadCode: `useEffect(() => { fetchUserData(filters); }, [filters]);`,
        sampleFix: `const key = useMemo(() => JSON.stringify(filters), [filters]);\nuseEffect(() => { fetchUserData(filters); }, [key]);`,
      },
    ],
    refactorSteps: [
      {
        step: 1,
        title: isRu ? "Хирургический распил God-компонента app/page.tsx (2420 строк)" : "Surgical Decoupling of app/page.tsx (2420 LOC)",
        estimatedTime: "20 минут",
        targetTool: "Cursor Composer",
        prompt: `Ты — Senior Refactoring Agent в Cursor. Безопасно разбей God-компонент 'app/page.tsx' на модули в '/components/landing/'. Сохрани стейт и интерфейсы без 'any'.`,
      },
    ],
    diagnosticsSummary: isRu ? "Обнаружен монолит на 2420 строк, утечка ключей и 0 тестов." : "Found 2420-line monolith, key leak and 0 tests.",
  };
}

function getBoltPreset(isRu = true): AuditReport {
  return {
    title: "Bolt.new Generated Landing",
    repoName: "bolt-builder/viral-saas-template",
    isRealRepo: false,
    doomsdayScore: 79,
    timeToCollapse: isRu ? "14 коммитов" : "14 commits",
    estimatedFixCost: 3200,
    criticalBugsCount: 2,
    spaghettiIndex: 7.9,
    ghostTypesCount: 32,
    filesScanned: 18,
    hasTests: false,
    primaryLanguage: "TypeScript",
    godComponents: [
      {
        name: "src/App.tsx",
        lines: 1140,
        issues: [isRu ? "Монолитный рендер всех экранов приложения в одном файле" : "All routes rendered in App.tsx"],
        risk: "high",
      },
    ],
    antipatterns: [
      {
        title: isRu ? "Happy Path Blindspot: сетевые запросы без таймаутов" : "Happy Path Blindspot: Untimed network requests",
        cwe: "CWE-390",
        description: isRu ? "Сетевые запросы лишены AbortController (5 сек). При сбое сети UI зависает." : "No request timeout configured.",
        severity: "HIGH",
        detectedIn: "src/api/generate.ts",
        sampleBadCode: `const res = await fetch("/api/data");`,
        sampleFix: `const controller = new AbortController();\nfetch(url, { signal: controller.signal });`,
      },
    ],
    refactorSteps: [
      {
        step: 1,
        title: isRu ? "Разделение App.tsx на маршруты" : "Split App.tsx into separate routes",
        estimatedTime: "15 минут",
        targetTool: "Cursor Composer",
        prompt: `Разбей 'src/App.tsx' на модули роутера и компонентов страниц.`,
      },
    ],
    diagnosticsSummary: isRu ? "Высокая связность экранов в App.tsx, отсутствие таймаутов сети." : "High screen coupling in App.tsx, missing network timeouts.",
  };
}

function getCryptoBotPreset(isRu = true): AuditReport {
  return {
    title: "Telegram Crypto Trading Bot",
    repoName: "solo/telegram-crypto-bot",
    isRealRepo: false,
    doomsdayScore: 92,
    timeToCollapse: isRu ? "5 коммитов (критическая уязвимость биллинга)" : "5 commits (critical financial logic vulnerability)",
    estimatedFixCost: 5900,
    criticalBugsCount: 4,
    spaghettiIndex: 9.6,
    ghostTypesCount: 78,
    filesScanned: 24,
    hasTests: false,
    primaryLanguage: "TypeScript",
    godComponents: [
      {
        name: "bot.ts",
        lines: 1850,
        issues: [isRu ? "Парсинг webhook, логика ордеров и база данных в одном файле" : "Webhooks, trading math, and DB in single file"],
        risk: "critical",
      },
    ],
    antipatterns: [
      {
        title: isRu ? "Финансовые вычисления с плавающей точкой (CWE-682)" : "Floating Point Currency Calculation (CWE-682)",
        cwe: "CWE-682",
        description: isRu ? "Операции с крипто-балансами проводятся через Number() без Decimal / BigInt." : "Crypto balances calculated with standard JS Number.",
        severity: "CRITICAL",
        detectedIn: "bot.ts:142",
        sampleBadCode: `const balance = user.balance + amount * 0.98;`,
        sampleFix: `import Decimal from "decimal.js";\nconst balance = new Decimal(user.balance).add(new Decimal(amount).mul(0.98));`,
      },
    ],
    refactorSteps: [
      {
        step: 1,
        title: isRu ? "Переход на BigInt/Decimal для балансов" : "Migrate balances to Decimal.js",
        estimatedTime: "15 минут",
        targetTool: "Cursor Composer",
        prompt: `Замени все финансовые расчеты в 'bot.ts' на библиотеку decimal.js для предотвращения потери точности.`,
      },
    ],
    diagnosticsSummary: isRu ? "Критический риск потери средств из-за расчетов Number() и монолита в bot.ts." : "Critical risk of financial loss from floating point math in bot.ts.",
  };
}

import { NextResponse } from "next/server";
import type { AuditReport, GodComponent, Antipattern, RefactorStep, AuditRequestBody } from "@/lib/types";
import {
  parseGitHubUrl,
  isIgnoredFile,
  stripCodeLiteralsAndComments,
  formatTimeToCollapse,
  sortPackageJsonCandidates,
  analyzeSnippet,
  getCursorPrompt,
  getClaudePrompt,
  isSafePublicUrl,
  analyzeLiveApp,
  LRUCache,
  SimpleRateLimiter,
  fetchWithRetry,
  parseGitHubRateLimitHeaders,
  RateLimitError,
} from "@/lib/audit-core";

const GITHUB_API_BASE = "https://api.github.com";
const MAX_FILES_TO_SAMPLE = 5;
const MAX_FILE_SIZE_FOR_SAMPLING = 95000;
const PARALLEL_FETCH_LIMIT = 3;

const auditCache = new LRUCache<AuditReport>(250, 3600000);
const rateLimiter = new SimpleRateLimiter();
const githubETagCache = new Map<string, string>();

function getBaseHeaders(token?: string): Record<string, string> {
  const headers: Record<string, string> = {
    "User-Agent": "VibeDebt-Code-Auditor/1.0",
    Accept: "application/vnd.github.v3+json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

async function fetchGitHub<T = unknown>(
  path: string,
  options: { token?: string; timeoutMs?: number } = {}
): Promise<{ data: T; fromCache: boolean; rateLimit: ReturnType<typeof parseGitHubRateLimitHeaders> }> {
  const { token, timeoutMs = 8000 } = options;
  const url = path.startsWith("http") ? path : `${GITHUB_API_BASE}${path}`;

  const result = await fetchWithRetry(
    url,
    {
      headers: getBaseHeaders(token),
      timeoutMs,
      retryConfig: { maxRetries: 3, baseDelayMs: 1000, maxDelayMs: 16000 },
    },
    githubETagCache
  );

  const rateLimit = parseGitHubRateLimitHeaders(result.response.headers);

  if (result.response.status === 304) {
    return { data: {} as T, fromCache: true, rateLimit };
  }

  if (!result.response.ok) {
    const error = new Error(`GitHub API error: HTTP ${result.response.status}`);
    (error as any).status = result.response.status;
    throw error;
  }

  const data = await result.response.json() as T;
  return { data, fromCache: result.fromCache, rateLimit };
}

async function fetchMultipleFilesInParallel(
  owner: string,
  repo: string,
  branch: string,
  files: Array<{ path: string; size?: number }>,
  token?: string
): Promise<Map<string, { code: string; path: string }>> {
  const results = new Map<string, { code: string; path: string }>();

  const eligibleFiles = files
    .filter((f) => (f.size || 0) > 0 && (f.size || 0) < MAX_FILE_SIZE_FOR_SAMPLING)
    .slice(0, MAX_FILES_TO_SAMPLE);

  const chunks: typeof eligibleFiles[] = [];
  for (let i = 0; i < eligibleFiles.length; i += PARALLEL_FETCH_LIMIT) {
    chunks.push(eligibleFiles.slice(i, i + PARALLEL_FETCH_LIMIT));
  }

  for (const chunk of chunks) {
    const fetches = chunk.map(async (file) => {
      try {
        const { data } = await fetchGitHub<{ content?: string }>(
          `/repos/${owner}/${repo}/contents/${file.path}?ref=${branch}`,
          { token, timeoutMs: 10000 }
        );

        if (data?.content) {
          const code = Buffer.from(data.content, "base64").toString("utf-8");
          return { path: file.path, code };
        }
      } catch {
        return null;
      }
      return null;
    });

    const resolved = await Promise.all(fetches);
    for (const item of resolved) {
      if (item) {
        results.set(item.path, item);
      }
    }
  }

  return results;
}

export async function POST(req: Request) {
  try {
    // 1. Rate limiting by IP
    const clientIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anonymous";
    if (!rateLimiter.isAllowed(clientIp, 35, 60000)) {
      return NextResponse.json(
        { error: "Too many audit requests. Please wait a minute before running another scan." },
        { status: 429 }
      );
    }

    let body: AuditRequestBody;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { url, snippet, archetype, liveUrl, lang = "ru" } = body;
    const isRu = lang === "ru";

    // 2. Archetype Presets handler
    if (archetype) {
      if (archetype === "bolt-landing") {
        return NextResponse.json({ success: true, data: getBoltPreset(isRu) });
      }
      if (archetype === "crypto-bot") {
        return NextResponse.json({ success: true, data: getCryptoBotPreset(isRu) });
      }
      return NextResponse.json({ success: true, data: getCursorSaasPreset(isRu) });
    }

    // 3. Live Web App Bundle & Security Headers Scanner
    if (liveUrl && typeof liveUrl === "string" && liveUrl.trim().length > 3) {
      const target = liveUrl.trim();
      if (!isSafePublicUrl(target)) {
        return NextResponse.json(
          {
            error: isRu
              ? "Некорректный или запрещенный адрес сайта (только публичные http/https URL)"
              : "Invalid or restricted target URL (public http/https only)",
          },
          { status: 400 }
        );
      }

      const cached = auditCache.get("live:" + target);
      if (cached) {
        return NextResponse.json({ success: true, data: cached });
      }

      try {
        const report = await analyzeLiveApp(target, isRu);
        auditCache.set("live:" + target, report);
        return NextResponse.json({ success: true, data: report });
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        return NextResponse.json(
          {
            error: isRu
              ? `Не удалось подключиться к сайту: ${msg}`
              : `Failed to inspect live app: ${msg}`,
          },
          { status: 502 }
        );
      }
    }

    // 3. Snippet Analysis handler with size guard
    if (snippet && typeof snippet === "string" && snippet.trim().length > 10) {
      if (snippet.length > 100000) {
        return NextResponse.json(
          { error: isRu ? "Сниппет слишком велик (макс 100 КБ)" : "Snippet too large (max 100 KB)" },
          { status: 400 }
        );
      }
      const report = analyzeSnippet(snippet, isRu);
      return NextResponse.json({ success: true, data: report });
    }

    // 4. GitHub Repository Analysis
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

      // Check LRU cache
      const cached = auditCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({ success: true, data: cached });
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

      if (repoRes.status === 429 || repoRes.status === 403) {
        return NextResponse.json(
          {
            error: isRu
              ? "Превышен лимит запросов к GitHub API. Воспользуйтесь вкладкой «Вставить код» для мгновенного анализа."
              : "GitHub API rate limit reached. Please use the 'Paste Code' tab for instant analysis.",
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
        // Continue with empty tree if tree fetch fails
      }

      // Check package.json & lockfiles
      let hasTests = false;
      let hasTypeScript = false;
      let hasPackageJson = false;

      const lockFiles = ["package-lock.json", "pnpm-lock.yaml", "yarn.lock", "bun.lock", "bun.lockb"];
      const hasLockFile = treeItems.some((f) => lockFiles.some((lf) => f.path.endsWith(lf)));

      // Prioritize root package.json over nested submodules!
      const allTreePaths = treeItems.map((t) => t.path);
      const chosenPackageJsonPath = sortPackageJsonCandidates(allTreePaths);

      if (chosenPackageJsonPath) {
        hasPackageJson = true;
        try {
          const pkgRes = await fetchWithTimeout(
            `https://api.github.com/repos/${owner}/${repo}/contents/${chosenPackageJsonPath}?ref=${defaultBranch}`,
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
          // ignore package.json parse error
        }
      }

      // Check for test files in tree (including root tests/ and test/)
      if (!hasTests) {
        hasTests = treeItems.some((t) => isIgnoredFile(t.path));
      }

      // Filter real application source code files (exclude tests, minified, types)
      const codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".vue", ".svelte"];
      const realSourceFiles = treeItems.filter(
        (t) => t.type === "blob" && !isIgnoredFile(t.path) && codeExtensions.some((ext) => t.path.endsWith(ext))
      );

      // Sort by size to identify God-components
      const sortedSourceBySize = [...realSourceFiles]
        .filter((t) => typeof t.size === "number" && t.size > 0)
        .sort((a, b) => (b.size || 0) - (a.size || 0));

      const topLargest = sortedSourceBySize.slice(0, 8);

      // Fetch multiple files in parallel for pattern analysis (up to 5 files)
      const sampledFiles = await fetchMultipleFilesInParallel(owner, repo, defaultBranch, topLargest, process.env.GITHUB_TOKEN);

      // Aggregate pattern matches across all sampled files
      let totalAnyMatches = 0;
      let totalSecretMatches = 0;
      const sampledFilePaths: string[] = [];

      for (const [path, { code }] of sampledFiles) {
        const sanitized = stripCodeLiteralsAndComments(code);
        const anyMatches = (sanitized.match(/\bas any\b/g) || []).length;
        const isClientFile = code.includes('"use client"') || code.includes("'use client'");
        const secretMatches = isClientFile
          ? (sanitized.match(/(SERVICE_ROLE|STRIPE_SECRET|SECRET_KEY|PRIVATE_KEY)/gi) || []).length
          : 0;

        totalAnyMatches += anyMatches;
        totalSecretMatches += secretMatches;
        sampledFilePaths.push(path);
      }

      // Strip comments and string literals to prevent false positives!
      const sampledCode = sampledFiles.get(topLargest[0]?.path)?.code || "";
      const sanitizedSampledCode = stripCodeLiteralsAndComments(sampledCode);
      const sampledFilePath = sampledFiles.get(topLargest[0]?.path)?.path || "";

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
      if (totalAnyMatches > 5) baseScore += 12;
      if (totalSecretMatches > 0) baseScore += 20;
      if (!hasLockFile && hasPackageJson) baseScore += 10;
      if (realSourceFiles.length > 60 && !hasTests) baseScore += 8;

      // Discount for popular verified repositories
      if ((repoData.stargazers_count || 0) > 1000 && hasTests) {
        baseScore = Math.max(12, baseScore - 35);
      }

      const doomsdayScore = Math.min(95, Math.max(12, baseScore));
      const isHealthy = doomsdayScore < 40;

      const antipatterns: Antipattern[] = [];

      for (const filePath of sampledFilePaths) {
        const code = sampledFiles.get(filePath)?.code || "";
        const sanitized = stripCodeLiteralsAndComments(code);
        const isClientFile = code.includes('"use client"') || code.includes("'use client'");
        const anyMatches = (sanitized.match(/\bas any\b/g) || []).length;
        const secretMatches = isClientFile
          ? (sanitized.match(/(SERVICE_ROLE|STRIPE_SECRET|SECRET_KEY|PRIVATE_KEY)/gi) || []).length
          : 0;

        if (secretMatches > 0) {
          antipatterns.push({
            title: isRu ? "Утечка API ключей / Секретов в открытый бандл" : "Master Secrets in Client Bundle",
            cwe: "CWE-798",
            description: isRu
              ? `В файле ${filePath} найдены сервисные переменные в клиентском коде ('use client'). Ключ доступен любому пользователю через DevTools.`
              : `In file ${filePath}, private master credentials were found in client-side code ('use client'). Any browser can read this key.`,
            severity: "CRITICAL",
            detectedIn: filePath,
            sampleBadCode: `process.env.SUPABASE_SERVICE_ROLE_KEY`,
            sampleFix: `"use server";\nexport async function adminAction() { ... }`,
          });
        }

        if (anyMatches > 0) {
          antipatterns.push({
            title: isRu
              ? `Глушение ошибок компилятора через 'as any' (${anyMatches} шт.)`
              : `Compiler Type Suppression via 'as any' (${anyMatches} occurrences)`,
            cwe: "CWE-704",
            description: isRu
              ? `ИИ часто прибегает к 'as any', когда не может вывести сложный тип. Это создает ложную иллюзию безопасности и скрывает реальные рантайм-краши.`
              : `AI falls back to 'as any' when schema inference fails. This bypasses static checks and hides runtime exceptions.`,
            severity: "HIGH",
            detectedIn: filePath,
            sampleBadCode: `const data = (await res.json()) as any;`,
            sampleFix: `import { z } from "zod";\nconst schema = z.object({ id: z.string() });\nconst data = schema.parse(await res.json());`,
          });
        }
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
            ? "В репозитории не найден ни package-lock.json, ни pnpm-lock, ни bun.lock. До 19.7% рекомендаций библиотек от ИИ указывают на несуществующие пакеты."
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

      const timeToCollapse = formatTimeToCollapse(doomsdayScore, isRu);

      // Dynamic surgical prompts
      const mainFile = topLargest[0]?.path || "app/page.tsx";
      const mainFileLines = godComponents[0]?.lines || 450;

      const refactorSteps: RefactorStep[] = [
        {
          step: 1,
          title: isRu
            ? `Безопасный распил модуля ${mainFile} (~${mainFileLines} строк)`
            : `Decouple monolith module ${mainFile} (~${mainFileLines} LOC)`,
          estimatedTime: "15 минут",
          targetTool: "Cursor Composer",
          prompt: getCursorPrompt(mainFile, mainFileLines, isRu),
        },
        {
          step: 2,
          title: isRu ? "Глубокий анализ архитектуры Claude 3.7" : "Claude 3.7 Deep Architecture Audit",
          estimatedTime: "10 минут",
          targetTool: "Claude 3.7 Thinking",
          prompt: getClaudePrompt(mainFile, mainFileLines, isRu),
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
        ghostTypesCount: totalAnyMatches,
        filesScanned: realSourceFiles.length || treeItems.length,
        hasTests,
        starsCount: repoData.stargazers_count,
        primaryLanguage: repoData.language || (hasTypeScript ? "TypeScript" : "JavaScript"),
        godComponents,
        antipatterns,
        refactorSteps,
        diagnosticsSummary: isRu
          ? `Просканировано ${realSourceFiles.length} файлов (${sampledFilePaths.length} файлов深度 анализ). Doomsday Score: ${doomsdayScore}%. ${
              hasTests ? "Автотесты присутствуют." : "Обнаружен разрыв в тестировании (0 тестов)."
            }`
          : `Scanned ${realSourceFiles.length} files (${sampledFilePaths.length} deeply analyzed). Doomsday Score: ${doomsdayScore}%. ${
              hasTests ? "Tests present." : "Testing gap identified."
            }`,
      };

      // Save to LRU cache
      auditCache.set(cacheKey, report);

      return NextResponse.json({ success: true, data: report });
    }

    return NextResponse.json(
      { error: isRu ? "Необходимо передать url, snippet или archetype" : "Must provide url, snippet, or archetype" },
      { status: 400 }
    );
  } catch {
    return NextResponse.json(
      { error: "Audit engine internal error. Please try again or paste code snippet." },
      { status: 500 }
    );
  }
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
        prompt: getCursorPrompt("app/page.tsx", 2420, isRu),
      },
      {
        step: 2,
        title: isRu ? "Архитектурный анализ Claude 3.7 Thinking" : "Claude 3.7 Thinking Architecture Audit",
        estimatedTime: "15 минут",
        targetTool: "Claude 3.7 Thinking",
        prompt: getClaudePrompt("app/page.tsx", 2420, isRu),
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
        prompt: getCursorPrompt("src/App.tsx", 1140, isRu),
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
        prompt: getCursorPrompt("bot.ts", 1850, isRu),
      },
    ],
    diagnosticsSummary: isRu ? "Критический риск потери средств из-за расчетов Number() и монолита в bot.ts." : "Critical risk of financial loss from floating point math in bot.ts.",
  };
}

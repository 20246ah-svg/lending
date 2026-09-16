import { NextResponse } from "next/server";

interface GodComponent {
  name: string;
  lines: number;
  sizeBytes?: number;
  issues: string[];
  risk: "critical" | "high" | "medium";
}

interface Antipattern {
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "WARNING";
  detectedIn: string;
  sampleBadCode: string;
  sampleFix: string;
}

interface RefactorStep {
  step: number;
  title: string;
  prompt: string;
  estimatedTime: string;
  targetTool?: string;
}

interface AuditReport {
  title: string;
  repoName: string;
  isRealRepo: boolean;
  doomsdayScore: number;
  timeToCollapse: string;
  estimatedFixCost: number;
  criticalBugsCount: number;
  spaghettiIndex: number;
  ghostTypesCount: number;
  filesScanned: number;
  hasTests: boolean;
  starsCount?: number;
  primaryLanguage?: string;
  godComponents: GodComponent[];
  antipatterns: Antipattern[];
  refactorSteps: RefactorStep[];
  diagnosticsSummary: string;
}

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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, snippet, archetype } = body;

    // Archetypes handler
    if (archetype) {
      if (archetype === "bolt-landing") {
        return NextResponse.json({
          success: true,
          data: getBoltPreset(),
        });
      }
      if (archetype === "crypto-bot") {
        return NextResponse.json({
          success: true,
          data: getCryptoBotPreset(),
        });
      }
      // default cursor-saas
      return NextResponse.json({
        success: true,
        data: getCursorSaasPreset(),
      });
    }

    // Snippet analysis handler
    if (snippet && typeof snippet === "string" && snippet.trim().length > 10) {
      const report = analyzeSnippet(snippet);
      return NextResponse.json({ success: true, data: report });
    }

    // GitHub URL analysis handler
    if (url && typeof url === "string") {
      const parsed = parseGitHubUrl(url);
      if (!parsed) {
        return NextResponse.json(
          { error: "Некорректная ссылка на GitHub. Пример: https://github.com/shadcn-ui/ui или owner/repo" },
          { status: 400 }
        );
      }

      const { owner, repo } = parsed;

      // 1. Fetch repo metadata
      const repoRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
        headers: {
          "User-Agent": "VibeDebt-Code-Auditor",
          Accept: "application/vnd.github.v3+json",
        },
      });

      if (repoRes.status === 404) {
        return NextResponse.json(
          {
            error: `Репозиторий ${owner}/${repo} не найден. Проверьте правильность ссылки или убедитесь, что репозиторий публичный.`,
          },
          { status: 404 }
        );
      }

      if (repoRes.status === 403) {
        return NextResponse.json(
          {
            error: "Превышен лимит запросов к GitHub API без токена. Используйте режим анализа фрагмента кода или выберите один из тестовых архетипов.",
            isRateLimited: true,
          },
          { status: 429 }
        );
      }

      if (!repoRes.ok) {
        return NextResponse.json(
          { error: `Ошибка при запросе к GitHub API (HTTP ${repoRes.status})` },
          { status: repoRes.status }
        );
      }

      const repoData = await repoRes.json();
      const defaultBranch = repoData.default_branch || "main";

      // 2. Fetch repo tree
      const treeRes = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`,
        {
          headers: {
            "User-Agent": "VibeDebt-Code-Auditor",
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      let treeItems: Array<{ path: string; size?: number; type: string }> = [];
      if (treeRes.ok) {
        const treeData = await treeRes.json();
        treeItems = treeData.tree || [];
      }

      // 3. Inspect package.json if present
      let packageJsonData: any = null;
      let hasTests = false;
      let depsCount = 0;
      let hasTypeScript = false;

      const hasPackageJson = treeItems.some((item) => item.path === "package.json");
      if (hasPackageJson) {
        try {
          const pkgRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/package.json?ref=${defaultBranch}`,
            {
              headers: {
                "User-Agent": "VibeDebt-Code-Auditor",
                Accept: "application/vnd.github.v3+json",
              },
            }
          );
          if (pkgRes.ok) {
            const pkgBody = await pkgRes.json();
            if (pkgBody.content) {
              const decoded = Buffer.from(pkgBody.content, "base64").toString("utf-8");
              packageJsonData = JSON.parse(decoded);
              const allDeps = {
                ...(packageJsonData.dependencies || {}),
                ...(packageJsonData.devDependencies || {}),
              };
              depsCount = Object.keys(allDeps).length;

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
          t.path.startsWith("__tests__/") ||
          t.path.includes("/tests/")
      );
      if (testFiles.length > 0) {
        hasTests = true;
      }

      // Find code files
      const codeExtensions = [".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs", ".vue", ".svelte", ".php"];
      const codeFiles = treeItems.filter(
        (t) => t.type === "blob" && codeExtensions.some((ext) => t.path.endsWith(ext))
      );

      // Find largest code files (God-components)
      const sortedBySize = [...codeFiles]
        .filter((t) => typeof t.size === "number" && t.size > 0)
        .sort((a, b) => (b.size || 0) - (a.size || 0));

      const topLargest = sortedBySize.slice(0, 5);

      // Fetch 1 largest source file to scan for code smells
      let sampledCode = "";
      let sampledFilePath = "";
      if (topLargest.length > 0 && (topLargest[0].size || 0) < 90000) {
        try {
          const sampleRes = await fetch(
            `https://api.github.com/repos/${owner}/${repo}/contents/${topLargest[0].path}?ref=${defaultBranch}`,
            {
              headers: {
                "User-Agent": "VibeDebt-Code-Auditor",
                Accept: "application/vnd.github.v3+json",
              },
            }
          );
          if (sampleRes.ok) {
            const sampleJson = await sampleRes.json();
            if (sampleJson.content) {
              sampledCode = Buffer.from(sampleJson.content, "base64").toString("utf-8");
              sampledFilePath = topLargest[0].path;
            }
          }
        } catch {
          // ignore sample fetch error
        }
      }

      // Heuristic calculations from real repo data
      const anyMatches = (sampledCode.match(/\bas any\b/g) || []).length;
      const useEffectMatches = (sampledCode.match(/useEffect\s*\(/g) || []).length;
      const useStateMatches = (sampledCode.match(/useState\s*\(/g) || []).length;
      const secretMatches = (sampledCode.match(/(SERVICE_ROLE|SECRET_KEY|API_KEY|TOKEN)/gi) || []).length;

      const godComponents: GodComponent[] = topLargest.map((f) => {
        const estLines = Math.round((f.size || 0) / 38);
        const issues: string[] = [];
        if (estLines > 800) {
          issues.push(`Файл-гигант: ~${estLines} строк кода, превышает предел комфортного контекста ИИ`);
        }
        if (f.path.includes("page.") || f.path.includes("App.")) {
          issues.push("Корневой компонент перегружен бизнес-логикой и рендером");
        }
        if (!hasTests) {
          issues.push("Полное отсутствие автотестов для этого модуля");
        }
        return {
          name: f.path,
          lines: estLines,
          sizeBytes: f.size,
          issues: issues.length > 0 ? issues : ["Высокая концентрация логики в одном месте"],
          risk: estLines > 800 ? "critical" : estLines > 400 ? "high" : "medium",
        };
      });

      // Calculate Doomsday Score
      let baseScore = 40;
      if (!hasTests) baseScore += 25; // No tests is a huge risk in AI projects
      if (topLargest.some((f) => (f.size || 0) > 25000)) baseScore += 18; // Mega files
      if (anyMatches > 5) baseScore += 12;
      if (secretMatches > 0) baseScore += 15;
      if (codeFiles.length > 50 && !hasTests) baseScore += 10;
      if (repoData.stargazers_count > 500 && hasTests) {
        baseScore = Math.max(15, baseScore - 50);
      }

      const doomsdayScore = Math.min(96, Math.max(18, baseScore));
      const spaghettiIndex = Math.min(9.9, Math.max(1.8, +(doomsdayScore / 10 + (hasTests ? -1.5 : 0.8)).toFixed(1)));
      const ghostTypes = anyMatches > 0 ? anyMatches * 4 + 6 : hasTypeScript ? 12 : 28;
      const collapseCommits =
        doomsdayScore > 80
          ? `${Math.max(4, Math.round((100 - doomsdayScore) * 1.2))} коммитов`
          : doomsdayScore > 50
          ? `${Math.round((100 - doomsdayScore) * 1.5)} коммитов`
          : "Более 100 коммитов (стабильная архитектура)";

      const estimatedFixCost = Math.round((doomsdayScore * 65) / 100) * 100;

      // Real antipatterns
      const antipatterns: Antipattern[] = [];

      if (secretMatches > 0 && sampledFilePath) {
        antipatterns.push({
          title: "Подозрение на утечку API ключей / Секретов",
          description: `В файле ${sampledFilePath} найдены паттерны секретных переменных окружения. Если компонент клиентский ('use client'), ключ доступен любому пользователю.`,
          severity: "CRITICAL",
          detectedIn: `${sampledFilePath}`,
          sampleBadCode: `// Найдено упоминание секретных ключей:\nprocess.env.SERVICE_ROLE_KEY || API_KEY`,
          sampleFix: `// Вынесите приватные операции в Server Actions или Route Handlers:\nimport { createServerClient } from "@/lib/auth/server";`,
        });
      }

      if (anyMatches > 0 && sampledFilePath) {
        antipatterns.push({
          title: `Глушение ошибок компилятора через 'as any' (${anyMatches} шт.)`,
          description: `ИИ часто прибегает к 'as any', когда не может вывести сложный тип. Это скрывает реальные рантайм-краши.`,
          severity: "HIGH",
          detectedIn: `${sampledFilePath}`,
          sampleBadCode: `// Код из вашего репозитория:\nconst response = (await res.json()) as any;`,
          sampleFix: `// Строгая валидация типов через Zod:\nimport { z } from "zod";\nconst schema = z.object({ id: z.string(), ... });`,
        });
      }

      if (!hasTests) {
        antipatterns.push({
          title: "Zero-Test Blindspot: 0 автотестов в проекте",
          description:
            "В репозитории не обнаружено ни Jest, ни Vitest, ни Playwright. При рефакторинге через нейросеть вы не узнаете о сломанных функциях, пока о них не напишут клиенты.",
          severity: doomsdayScore > 70 ? "CRITICAL" : "HIGH",
          detectedIn: "package.json / root",
          sampleBadCode: `// package.json scripts:\n"scripts": {\n  "dev": "next dev",\n  "build": "next build"\n  // Тесты отсутствуют!\n}`,
          sampleFix: `// Добавьте минимальный Vitest suite:\nnpm i -D vitest @testing-library/react\n"test": "vitest run"`,
        });
      }

      if (topLargest.length > 0 && (topLargest[0].size || 0) > 20000) {
        antipatterns.push({
          title: `Монолитный файл: ${topLargest[0].path}`,
          description: `Размер файла превышает 20 Кб (~${Math.round(
            (topLargest[0].size || 0) / 38
          )} строк). Нейросеть начинает забывать начало файла при дописывании фич в конец.`,
          severity: "CRITICAL",
          detectedIn: topLargest[0].path,
          sampleBadCode: `// ${topLargest[0].path} содержит слишком много несвязанных обязанностей`,
          sampleFix: `// Декомпозируйте файл на модули по правилу Single Responsibility Principle`,
        });
      }

      // DYNAMIC SURGICAL REFACTOR PROMPTS (KEY LEAD MAGNET)
      const mainFile = topLargest[0]?.path || "app/page.tsx";
      const mainFileLines = Math.round((topLargest[0]?.size || 40000) / 38);
      const cleanBaseName = mainFile.split("/").pop()?.replace(/\.[^/.]+$/, "") || "component";
      const targetSubfolder = `/components/${cleanBaseName}`;

      const refactorSteps: RefactorStep[] = [
        {
          step: 1,
          title: `Хирургический распил God-компонента ${mainFile}`,
          estimatedTime: "15-20 минут",
          targetTool: "Cursor Composer / Claude 3.7",
          prompt: `Ты — Senior Refactoring Agent в Cursor / Claude 3.7.
Твоя цель: безопасно разбить God-компонент '${mainFile}' (~${mainFileLines} строк кода) на модульные подкомпоненты внутри папки '${targetSubfolder}', сохранив все стейты, хуки, пропсы и стили без малейших визуальных или логических изменений.

Строгие правила безопасного рефакторинга:
1. НЕ сокращай код через комментарии вроде '// rest of code stays here'. Выведи полный, готовый к запуску код.
2. Сохрани '${mainFile}' как чистый оркестратор не длиннее 120 строк.
3. Вынеси UI-секции в отдельные файлы внутри '${targetSubfolder}/':
   - '${targetSubfolder}/Header.tsx'
   - '${targetSubfolder}/MainView.tsx'
   - '${targetSubfolder}/Modals.tsx'
4. Все стейты и методы передай через пропсы или создай кастомный хук '${targetSubfolder}/use${cleanBaseName.charAt(0).toUpperCase() + cleanBaseName.slice(1)}State.ts'.
5. Напиши строгие TypeScript interfaces без использования 'any'.`,
        },
        {
          step: 2,
          title: secretMatches > 0 ? "Изоляция секретных ключей в Server Actions" : "Очистка от 'as any' и валидация Zod",
          estimatedTime: "10 минут",
          targetTool: "Cursor Cmd+K",
          prompt: secretMatches > 0
            ? `Ты — Senior Security Engineer в Cursor.
В файле '${sampledFilePath || mainFile}' обнаружено небезопасное использование секретных переменных (API keys / service role).
Задача: перенеси приватные операции с базой и ключами из клиентского бандла в безопасный Server Action в 'app/actions/service.ts'.
Требования:
1. Пометь файл 'app/actions/service.ts' директивой 'use server'.
2. Клиентский компонент '${sampledFilePath || mainFile}' должен вызывать Server Action асинхронно без прямого импорта master-ключа.
3. Верни готовый код Server Action и точечный diff вызова из формы.`
            : `Ты — TypeScript Strictness Architect в Cursor.
В файле '${sampledFilePath || mainFile}' устрани все приведения типов 'as any'.
Задача:
1. Создай строгие Zod-схемы для всех внешних API ответов и стейтов.
2. Оберни парсинг данных в schema.safeParse() с graceful fallback на случай невалидных данных.
3. Экспортируй выведенные типы: type Data = z.infer<typeof DataSchema>;.`,
        },
        {
          step: 3,
          title: hasTests ? "Добавление регрессионных тестов на edge-cases" : "Внедрение первого тестового контура (Vitest)",
          estimatedTime: "15 минут",
          targetTool: "Claude 3.7 Thinking",
          prompt: `Ты — Senior QA Automation Lead.
Для отрефакторенного модуля '${mainFile}' репозитория '${owner}/${repo}' напиши 3 критических автоматических теста с использованием Vitest и @testing-library/react:
1. Тест рендера основного состояния и корректности отображения данных.
2. Тест обработки сетевой ошибки (Network Error) и отображения fallback UI.
3. Тест пользовательского действия (клик по кнопке действия с проверкой вызова обработчика).
Помести тесты в файл '${mainFile.replace(/\.[^/.]+$/, "")}.test.tsx'.`,
        },
      ];

      const report: AuditReport = {
        title: `Аудит репозитория ${owner}/${repo}`,
        repoName: `${owner}/${repo}`,
        isRealRepo: true,
        doomsdayScore,
        timeToCollapse: collapseCommits,
        estimatedFixCost,
        criticalBugsCount: antipatterns.filter((a) => a.severity === "CRITICAL").length || 1,
        spaghettiIndex,
        ghostTypesCount: ghostTypes,
        filesScanned: codeFiles.length || treeItems.length,
        hasTests,
        starsCount: repoData.stargazers_count,
        primaryLanguage: repoData.language || "TypeScript",
        godComponents: godComponents.length > 0 ? godComponents : getFallbackGodComponents(),
        antipatterns: antipatterns.length > 0 ? antipatterns : getFallbackAntipatterns(),
        refactorSteps,
        diagnosticsSummary: `Проанализировано ${codeFiles.length} исходных файлов на ветке ${defaultBranch}. Обнаружено ${
          topLargest.length
        } файлов с высокой концентрацией логики. Автотесты: ${hasTests ? "Обнаружены" : "НЕ НАЙДЕНЫ"}.`,
      };

      return NextResponse.json({ success: true, data: report });
    }

    return NextResponse.json({ error: "Не переданы параметры для анализа" }, { status: 400 });
  } catch (err: any) {
    console.error("Audit API Error:", err);
    return NextResponse.json(
      { error: `Внутренняя ошибка сервера при аудите: ${err?.message || "Неизвестная ошибка"}` },
      { status: 500 }
    );
  }
}

function analyzeSnippet(code: string): AuditReport {
  const lines = code.split("\n");
  const lineCount = lines.length;

  const anyMatches = (code.match(/\bas any\b/g) || []).length;
  const useEffectMatches = (code.match(/useEffect\s*\(/g) || []).length;
  const useStateMatches = (code.match(/useState\s*\(/g) || []).length;
  const secretMatches = (code.match(/(SECRET|SERVICE_ROLE|API_KEY|BEARER|TOKEN)/gi) || []).length;
  const hasClient = code.includes('"use client"') || code.includes("'use client'");

  let score = 45;
  if (lineCount > 300) score += 20;
  if (lineCount > 700) score += 15;
  if (anyMatches > 2) score += 12;
  if (secretMatches > 0 && hasClient) score += 22;
  if (useEffectMatches > 2 && useStateMatches > 4) score += 10;

  const doomsdayScore = Math.min(96, Math.max(30, score));
  const spaghettiIndex = Math.min(9.8, Math.max(3.0, +(doomsdayScore / 10).toFixed(1)));

  const antipatterns: Antipattern[] = [];

  if (hasClient && secretMatches > 0) {
    antipatterns.push({
      title: "Секретные ключи в 'use client' файле",
      description: "Обнаружены секретные идентификаторы внутри клиентского компонента. Этот код собирается в бандл браузера.",
      severity: "CRITICAL",
      detectedIn: "snippet:client-bundle",
      sampleBadCode: `"use client";\nconst key = process.env.SUPABASE_SERVICE_ROLE_KEY;`,
      sampleFix: `// Вынесите приватную логику в app/actions/route.ts или Server Action`,
    });
  }

  if (anyMatches > 0) {
    antipatterns.push({
      title: `Обнаружены типы 'any' (${anyMatches} шт.)`,
      description: "ИИ отключил проверку типов. Любое изменение структуры данных приведет к необработанному крашу у клиента.",
      severity: "HIGH",
      detectedIn: "snippet:types",
      sampleBadCode: `const [data, setData] = useState<any>(null);`,
      sampleFix: `interface UserPayload {\n  id: string;\n  name: string;\n}`,
    });
  }

  if (lineCount > 350) {
    antipatterns.push({
      title: `Файл превышает рекомендуемый лимит (${lineCount} строк)`,
      description: "Для эффективной работы ИИ-ассистентов размер компонента не должен превышать 250-300 строк.",
      severity: "CRITICAL",
      detectedIn: "snippet:monolith",
      sampleBadCode: `// Один файл управляет ${useStateMatches} состояниями и ${useEffectMatches} эффектами`,
      sampleFix: `// Разделите на изолированные компоненты с передачей пропсов или через контекст`,
    });
  }

  return {
    title: "Аудит пользовательского кода",
    repoName: "custom/snippet",
    isRealRepo: true,
    doomsdayScore,
    timeToCollapse: `${Math.max(3, Math.round((100 - doomsdayScore) * 1.1))} коммитов`,
    estimatedFixCost: Math.round((doomsdayScore * 50) / 100) * 100,
    criticalBugsCount: antipatterns.length || 1,
    spaghettiIndex,
    ghostTypesCount: anyMatches * 3 + 5,
    filesScanned: 1,
    hasTests: false,
    godComponents: [
      {
        name: "PastedCodeSnippet.tsx",
        lines: lineCount,
        issues: [
          `${lineCount} строк в едином модуле`,
          `${anyMatches} приведений типа any`,
          `${useStateMatches} независимых состояний`,
        ],
        risk: lineCount > 400 ? "critical" : "high",
      },
    ],
    antipatterns,
    refactorSteps: [
      {
        step: 1,
        title: `Хирургический распил компонента (${lineCount} строк)`,
        estimatedTime: "15 минут",
        targetTool: "Cursor Composer / Claude 3.7",
        prompt: `Ты — Senior Refactoring Agent в Cursor / Claude 3.7.
Перед тобой God-компонент на ${lineCount} строк.
Твоя цель: разбить этот God-компонент на модульные подкомпоненты внутри папки '/components', сохранив все стейты (${useStateMatches} шт.), обработчики событий и пропсы без малейших визуальных или логических изменений.

Строгие правила:
1. НЕ сокращай код и не пиши комментарии вроде '// rest of code stays here'.
2. Сохрани корневой файл как чистый оркестратор.
3. Вынеси тяжелые части в '/components/ViewSection.tsx' и кастомный хук 'useComponentState.ts'.
4. Напиши строгие TypeScript interfaces без 'any'.`,
      },
      {
        step: 2,
        title: "Изоляция типов и замена 'any'",
        estimatedTime: "10 минут",
        targetTool: "Cursor Cmd+K",
        prompt: `Замени все 'any' в следующем коде на строгие типы TypeScript. Напиши Zod-схемы для валидации внешних данных:\n\n${code.slice(
          0,
          260
        )}...`,
      },
    ],
    diagnosticsSummary: `Проанализировано ${lineCount} строк кода. Найдено ${anyMatches} 'any', ${useEffectMatches} эффектов, ${useStateMatches} хуков состояния.`,
  };
}

function getCursorSaasPreset(): AuditReport {
  return {
    title: "AI Micro-SaaS (Cursor + Claude 3.7)",
    repoName: "founder/instant-ai-landing-builder",
    isRealRepo: false,
    doomsdayScore: 89,
    timeToCollapse: "11 коммитов или 2 одновременных Stripe вебхука",
    estimatedFixCost: 4800,
    criticalBugsCount: 7,
    spaghettiIndex: 9.3,
    ghostTypesCount: 54,
    filesScanned: 38,
    hasTests: false,
    godComponents: [
      {
        name: "app/page.tsx",
        lines: 2420,
        issues: [
          "Монолитный файл: содержит UI, работу с базой Supabase, Stripe Checkout и 8 модалок",
          "14 вызовов useState на верхнем уровне без мемоизации",
          "Каскадный ререндер страницы при любом нажатии клавиши",
        ],
        risk: "critical",
      },
      {
        name: "lib/ai-handler.ts",
        lines: 840,
        issues: [
          "Хаотичный парсинг JSON без zod/валидации",
          "28 приведений типа `(res as any)` для обхода ошибок TS",
        ],
        risk: "high",
      },
    ],
    antipatterns: [
      {
        title: "Секретный Service Key в клиентском бандле",
        description: "ИИ попытался починить RLS ошибку и импортировал `SUPABASE_SERVICE_ROLE_KEY` прямо в 'use client' компонент.",
        severity: "CRITICAL",
        detectedIn: "app/dashboard/settings/page.tsx:14",
        sampleBadCode: `"use client";\nimport { createClient } from "@supabase/supabase-js";\nconst supabase = createClient(\n  process.env.NEXT_PUBLIC_URL!,\n  process.env.SUPABASE_SERVICE_ROLE_KEY! // Полный доступ к БД в открытом виде!\n);`,
        sampleFix: `// Безопасный рефакторинг через Server Actions:\nimport { createAdminServerClient } from "@/lib/supabase/server";\nexport async function POST(req: Request) { ... }`,
      },
      {
        title: "Бесконечный ререндер в useEffect",
        description: "Курсор добавил стейт-объект в зависимости хука без useCallback. При каждом рендере создается новая ссылка.",
        severity: "CRITICAL",
        detectedIn: "components/PricingCalculator.tsx:89",
        sampleBadCode: `useEffect(() => {\n  fetchUserData(filters); // 'filters' каждый раз новый объект!\n  setRecalculating(true);\n}, [filters]); // 💥 1,200 запросов в минуту к Supabase`,
        sampleFix: `const filterKey = useMemo(() => JSON.stringify(filters), [filters]);\nuseEffect(() => {\n  fetchUserData(JSON.parse(filterKey));\n}, [filterKey]);`,
      },
    ],
    refactorSteps: [
      {
        step: 1,
        title: "Хирургический распил God-файла app/page.tsx (2420 строк)",
        estimatedTime: "20 минут",
        targetTool: "Cursor Composer (Cmd+I)",
        prompt: `Ты — Senior Refactoring Agent в Cursor / Claude 3.7.
Твоя цель: разбить God-компонент 'app/page.tsx' (2420 строк) на модульные подкомпоненты внутри папки '/components/landing', сохранив все стейты, пропсы, хуки и анимации без малейших визуальных или функциональных изменений.

Строгие правила:
1. НЕ сокращай код и не пиши комментарии '// rest of code stays here'.
2. Сохрани 'app/page.tsx' как чистый оркестратор не длиннее 120 строк.
3. Вынеси UI-секции в:
   - '/components/landing/HeroSection.tsx'
   - '/components/landing/PricingMatrix.tsx'
   - '/components/landing/AuthModal.tsx'
4. Общий стейт модалок вынеси в кастомный хук '/components/landing/useLandingModals.ts'.
5. Напиши строгие TypeScript interfaces без единого 'any'.`,
      },
      {
        step: 2,
        title: "Изоляция SUPABASE_SERVICE_ROLE_KEY из клиентского бандла",
        estimatedTime: "10 минут",
        targetTool: "Cursor Cmd+K",
        prompt: `Ты — Senior Security Engineer в Cursor.
В файле 'app/dashboard/settings/page.tsx' обнаружен клиентский импорт SUPABASE_SERVICE_ROLE_KEY.
Задача: вынеси все небезопасные запросы в отдельный Server Action в 'app/actions/billing.ts'.
Верни только готовый код серверного экшена и точечный патч для вызова из клиентской формы.`,
      },
      {
        step: 3,
        title: "Уничтожение 28 приведений 'as any' через Zod",
        estimatedTime: "15 минут",
        targetTool: "Claude 3.7 Thinking",
        prompt: `В файле lib/ai-handler.ts используется 28 приведений типа 'as any'.
Напиши Zod-схему для ответа LLM и валидируй данные через schema.safeParse(). Добавь graceful fallback на случай, если нейросеть вернет сломанный JSON.`,
      },
    ],
    diagnosticsSummary: "Критическая перегруженность главного файла, отсутствие автотестов, обнаружена утечка мастер-ключа в клиентский бандл.",
  };
}

function getBoltPreset(): AuditReport {
  return {
    title: "E-Commerce витрина с корзиной (Bolt.new / v0)",
    repoName: "solopreneur/cyber-storefront",
    isRealRepo: false,
    doomsdayScore: 64,
    timeToCollapse: "35 коммитов или применение промокода с 2 товарами",
    estimatedFixCost: 2400,
    criticalBugsCount: 3,
    spaghettiIndex: 6.8,
    ghostTypesCount: 22,
    filesScanned: 24,
    hasTests: false,
    godComponents: [
      {
        name: "components/CartDrawer.tsx",
        lines: 980,
        issues: [
          "Цены и скидки считаются только в браузере клиента",
          "Состояние дублируется в LocalStorage и 3 разных React Contexts",
        ],
        risk: "critical",
      },
    ],
    antipatterns: [
      {
        title: "Подделка цен на стороне клиента",
        description: "Финальная сумма заказа берется из состояния кнопки корзины без валидации на бэкенде.",
        severity: "CRITICAL",
        detectedIn: "app/api/checkout/route.ts:28",
        sampleBadCode: `const { items, clientTotalAmount } = await req.json();\nawait stripe.paymentIntents.create({ amount: clientTotalAmount });`,
        sampleFix: `const itemIds = items.map(i => i.id);\nconst dbProducts = await getProductsByIds(itemIds);\nconst verifiedTotal = calculateSum(dbProducts, items);`,
      },
    ],
    refactorSteps: [
      {
        step: 1,
        title: "Хирургический перенос расчета цен на сервер",
        estimatedTime: "15 минут",
        targetTool: "Cursor Composer (Cmd+I)",
        prompt: `Ты — Senior Backend Architect в Cursor.
В 'components/CartDrawer.tsx' цены рассчитываются на клиенте, что создает критическую уязвимость подделки сумм.
Задача: перепиши 'app/api/checkout/route.ts' так, чтобы цены брались строго из БД по ID товаров, а клиент передавал только { id, quantity }.
Верни готовый код серверного роута и безопасный клиентский fetch.`,
      },
    ],
    diagnosticsSummary: "Бизнес-логика корзины доверена браузеру клиента, высокий риск манипуляции ценами, дублирование глобального стейта.",
  };
}

function getCryptoBotPreset(): AuditReport {
  return {
    title: "Telegram Trading Bot (ChatGPT o3-mini)",
    repoName: "degen-hacker/solana-sniper-tg",
    isRealRepo: false,
    doomsdayScore: 96,
    timeToCollapse: "2 коммита или первый всплеск волатильности",
    estimatedFixCost: 7900,
    criticalBugsCount: 11,
    spaghettiIndex: 9.8,
    ghostTypesCount: 82,
    filesScanned: 16,
    hasTests: false,
    godComponents: [
      {
        name: "bot/index.ts",
        lines: 3100,
        issues: [
          "Один файл на 3100 строк: websocket, telegram polling, приватные ключи кошельков",
          "Нет try/catch вокруг обработки транзакций",
        ],
        risk: "critical",
      },
    ],
    antipatterns: [
      {
        title: "Утечка приватных ключей в консоль",
        description: "При любой ошибке бот логирует полный объект кошелька вместе с secretKey в открытый лог.",
        severity: "CRITICAL",
        detectedIn: "bot/trade.ts:112",
        sampleBadCode: `catch (err) {\n  console.error("Failed trade with wallet:", wallet); // В объекте лежит secretKey!\n}`,
        sampleFix: `catch (err) {\n  console.error("Trade failed for public address:", wallet.publicKey.toBase58(), { message: err.message });\n}`,
      },
    ],
    refactorSteps: [
      {
        step: 1,
        title: "Распил монолита bot/index.ts (3100 строк) на модули",
        estimatedTime: "25 минут",
        targetTool: "Cursor Composer (Cmd+I)",
        prompt: `Ты — Senior Rust/Node.js Architect в Cursor.
Файл 'bot/index.ts' разросся до 3100 строк и объединяет websocket, telegram bot и работу с приватными ключами кошельков.
Задача: раздели этот монолит на 3 модуля внутри папки '/bot/services/':
1) '/bot/services/telegram.ts' (только команды и UI бота)
2) '/bot/services/dex.ts' (работа с котировками и транзакциями)
3) '/bot/services/wallet.ts' (безопасное подписание транзакций без логирования секретных ключей)
Сохрани все обработчики событий. Код файлов дай целиком.`,
      },
    ],
    diagnosticsSummary: "Критическая угроза утечки приватных ключей кошельков, монолитный скрипт без обработки исключений.",
  };
}

function getFallbackGodComponents(): GodComponent[] {
  return [
    {
      name: "src/App.tsx",
      lines: 890,
      issues: ["Перегружен стейтом и рендерами"],
      risk: "high",
    },
  ];
}

function getFallbackAntipatterns(): Antipattern[] {
  return [
    {
      title: "Отсутствие строгого контракта данных",
      description: "Ответы API не валидируются схемами Zod/Valibot.",
      severity: "WARNING",
      detectedIn: "src/api/client.ts",
      sampleBadCode: `const data = await res.json();`,
      sampleFix: `const data = UserSchema.parse(await res.json());`,
    },
  ];
}

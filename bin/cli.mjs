#!/usr/bin/env node

/**
 * VibeDebt CLI — Offline Static Code Fragility & Secret Scanner
 * Zero cloud dependency. 100% local in-memory analysis.
 */

import fs from "node:fs";
import path from "node:path";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "coverage",
  ".turbo",
  ".cache",
  ".vercel",
]);

const CODE_EXTENSIONS = new Set([
  ".js",
  ".jsx",
  ".ts",
  ".tsx",
  ".mjs",
  ".cjs",
  ".py",
  ".go",
  ".rs",
]);

const SECRET_PATTERNS = [
  { name: "Stripe Live Secret Key", regex: /sk_live_[a-zA-Z0-9]{24,}/, severity: "CRITICAL" },
  // Match the actual JWT shape, not the variable NAME — `process.env.SUPABASE_SERVICE_ROLE_KEY`
  // in server code is the CORRECT usage and must not be flagged.
  { name: "Hardcoded JWT (possible Supabase service_role key)", regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{5,}\b/, severity: "CRITICAL" },
  { name: "AWS Access Key ID", regex: /AKIA[0-9A-Z]{16}/, severity: "HIGH" },
  { name: "SendGrid API Key", regex: /SG\.[a-zA-Z0-9_-]{22}\.[a-zA-Z0-9_-]{43}/, severity: "HIGH" },
];

function isTestFile(filePath) {
  const lower = filePath.toLowerCase();
  return (
    lower.includes(".test.") ||
    lower.includes(".spec.") ||
    lower.includes("/tests/") ||
    lower.includes("/__tests__/") ||
    lower.includes("/test/")
  );
}

function scanDirectory(dirPath, fileList = []) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name)) {
        scanDirectory(path.join(dirPath, entry.name), fileList);
      }
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (CODE_EXTENSIONS.has(ext)) {
        fileList.push(path.join(dirPath, entry.name));
      }
    }
  }
  return fileList;
}

export function runCli(targetDir = ".") {
  const resolvedTarget = path.resolve(process.cwd(), targetDir);

  if (!fs.existsSync(resolvedTarget)) {
    console.error(`\x1b[31m✖ Error: Target directory '${resolvedTarget}' does not exist.\x1b[0m`);
    process.exit(1);
  }

  console.log(`\n\x1b[36m⚡ VibeDebt Local Codebase Auditor v0.4.0\x1b[0m`);
  console.log(`\x1b[90mTarget: ${resolvedTarget} (100% offline heuristic analysis)\x1b[0m\n`);

  const startTime = Date.now();
  const files = scanDirectory(resolvedTarget);

  let totalLines = 0;
  let hasTests = false;
  const godFiles = [];
  const secretLeaks = [];

  for (const file of files) {
    const relPath = path.relative(resolvedTarget, file);

    if (isTestFile(relPath)) {
      hasTests = true;
      continue; // Don't flag test files as application monoliths
    }

    try {
      const content = fs.readFileSync(file, "utf8");
      const lines = content.split("\n").length;
      totalLines += lines;

      if (lines > 300) {
        godFiles.push({ path: relPath, lines });
      }

      // Check secrets
      for (const secret of SECRET_PATTERNS) {
        if (secret.regex.test(content)) {
          secretLeaks.push({ file: relPath, name: secret.name, severity: secret.severity });
        }
      }
    } catch {
      // Ignore unreadable files
    }
  }

  // Calculate score
  let score = 20;
  if (!hasTests) score += 20;
  score += Math.min(35, Math.round((totalLines / 20000) * 35));
  score += Math.min(25, godFiles.length * 6);
  score += secretLeaks.length * 15;
  score = Math.min(99, Math.max(15, score));

  const durationMs = Date.now() - startTime;

  // Print Report
  console.log(`\x1b[32m✔ Scanned ${files.length} source files (${totalLines.toLocaleString()} LOC) in ${durationMs}ms\x1b[0m`);

  if (score >= 75) {
    console.log(`\x1b[41m\x1b[37m DOOMSDAY SCORE: ${score}/100 (CRITICAL ARCHITECTURAL RISK) \x1b[0m`);
  } else if (score >= 50) {
    console.log(`\x1b[43m\x1b[30m DOOMSDAY SCORE: ${score}/100 (ELEVATED TECH DEBT) \x1b[0m`);
  } else {
    console.log(`\x1b[42m\x1b[30m DOOMSDAY SCORE: ${score}/100 (STABLE ARCHITECTURE) \x1b[0m`);
  }

  console.log(`\x1b[90m------------------------------------------------------------\x1b[0m`);
  console.log(`Automated Tests: ${hasTests ? "\x1b[32m✔ Detected\x1b[0m" : "\x1b[31m✖ Zero tests found\x1b[0m"}`);

  if (godFiles.length > 0) {
    console.log(`\n\x1b[33m⚠ Monolithic God-Components (>300 LOC):\x1b[0m`);
    godFiles.sort((a, b) => b.lines - a.lines);
    for (const gf of godFiles.slice(0, 5)) {
      console.log(`  • \x1b[1m${gf.path}\x1b[0m — ${gf.lines} lines`);
    }
    if (godFiles.length > 5) {
      console.log(`  \x1b[90m... and ${godFiles.length - 5} more\x1b[0m`);
    }
  } else {
    console.log(`\x1b[32m✔ Zero God-components found (>300 LOC)\x1b[0m`);
  }

  if (secretLeaks.length > 0) {
    console.log(`\n\x1b[31m✖ Hardcoded Secret Leaks:\x1b[0m`);
    for (const sl of secretLeaks) {
      console.log(`  • [${sl.severity}] ${sl.name} in \x1b[1m${sl.file}\x1b[0m`);
    }
  } else {
    console.log(`\x1b[32m✔ Zero hardcoded credentials detected in source\x1b[0m`);
  }

  // Generate surgical prompt artifact in .vibedebt/prompts.md
  if (godFiles.length > 0) {
    try {
      const topGod = godFiles[0];
      const promptDir = path.join(resolvedTarget, ".vibedebt");
      if (!fs.existsSync(promptDir)) fs.mkdirSync(promptDir, { recursive: true });

      const promptContent = `# VibeDebt Surgical Refactoring Prompts

## Target: \`${topGod.path}\` (${topGod.lines} lines)

\`\`\`markdown
Ты — Senior Refactoring Agent в Cursor Composer.
Цель: безопасно разбить God-файл '${topGod.path}' (~${topGod.lines} строк) на модульные компоненты.

Инструкции для Cursor:
1. Сохрани '${topGod.path}' как чистый оркестратор не более 100 строк.
2. Вынеси UI, стейт и сетевые запросы в изолированные файлы:
   - View.tsx
   - useModuleState.ts
3. Сохрани все пропсы, хуки и типы без использования 'any'.
\`\`\`
`;
      fs.writeFileSync(path.join(promptDir, "prompts.md"), promptContent, "utf8");
      console.log(`\n\x1b[36m✨ Surgical prompts written to \x1b[4m.vibedebt/prompts.md\x1b[0m\x1b[0m`);
    } catch {
      // safe
    }
  }

  console.log(`\x1b[90m------------------------------------------------------------\x1b[0m\n`);
  return { score, godFilesCount: godFiles.length, secretLeaksCount: secretLeaks.length };
}

// If executed directly from command line.
// Compare realpaths so the guard also works when invoked through a symlink
// (npm bin shims, `npx`, `npm link`) — argv[1] may be a symlink while
// import.meta.url is the resolved real path.
if (process.argv[1]) {
  let isDirectRun = false;
  try {
    const { realpathSync } = await import("node:fs");
    const { pathToFileURL } = await import("node:url");
    isDirectRun = pathToFileURL(realpathSync(process.argv[1])).href === import.meta.url;
  } catch {
    isDirectRun = false;
  }
  if (isDirectRun) {
    const target = process.argv[2] || ".";
    runCli(target);
  }
}

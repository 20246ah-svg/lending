import { test, describe } from "node:test";
import assert from "node:assert/strict";

// Test GitHub URL Parser
function parseGitHubUrl(url) {
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

// Test Doomsday Calculator formula
function calculateDoomsday(lines, godFiles, hasTests, dbState) {
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

  return { score, days, emergencyCost };
}

describe("parseGitHubUrl", () => {
  test("parses standard HTTPS GitHub repository URL", () => {
    const res = parseGitHubUrl("https://github.com/shadcn-ui/ui");
    assert.deepEqual(res, { owner: "shadcn-ui", repo: "ui" });
  });

  test("handles trailing slashes and .git extensions", () => {
    const res = parseGitHubUrl("https://github.com/calcom/cal.com.git/");
    assert.deepEqual(res, { owner: "calcom", repo: "cal.com" });
  });

  test("parses owner/repo shorthand notation", () => {
    const res = parseGitHubUrl("t3-oss/t3-env");
    assert.deepEqual(res, { owner: "t3-oss", repo: "t3-env" });
  });

  test("returns null for invalid or malicious inputs", () => {
    assert.equal(parseGitHubUrl("not a url"), null);
    assert.equal(parseGitHubUrl(""), null);
    assert.equal(parseGitHubUrl("https://gitlab.com/owner/repo"), null);
  });
});

describe("Doomsday Calculator Logic", () => {
  test("healthy repository with tests and clean DB has low doomsday score", () => {
    const res = calculateDoomsday(1000, 0, true, "clean");
    assert.ok(res.score < 30, `Expected low score, got ${res.score}`);
    assert.ok(res.days > 60, `Expected long survival time, got ${res.days}`);
  });

  test("brittle monolith with no tests hits critical fragility", () => {
    const res = calculateDoomsday(15000, 5, false, "mess");
    assert.ok(res.score >= 80, `Expected critical score, got ${res.score}`);
    assert.ok(res.days <= 15, `Expected short collapse horizon, got ${res.days}`);
    assert.ok(res.emergencyCost > 5000, `Expected high senior fix cost, got ${res.emergencyCost}`);
  });
});

describe("Static Filter Hygiene", () => {
  function isIgnoredFile(path) {
    const lower = path.toLowerCase();
    return (
      lower.includes(".test.") ||
      lower.includes(".spec.") ||
      lower.includes("__tests__") ||
      lower.includes("/tests/") ||
      lower.endsWith(".d.ts") ||
      lower.endsWith(".min.js") ||
      lower.includes("node_modules/")
    );
  }

  test("ignores test files from being categorized as application God-components", () => {
    assert.equal(isIgnoredFile("tests/smoke-valibot.test.ts"), true);
    assert.equal(isIgnoredFile("src/components/__tests__/Button.spec.tsx"), true);
    assert.equal(isIgnoredFile("node_modules/react/index.js"), true);
    assert.equal(isIgnoredFile("src/types/index.d.ts"), true);
  });

  test("preserves genuine application source code files", () => {
    assert.equal(isIgnoredFile("app/page.tsx"), false);
    assert.equal(isIgnoredFile("src/lib/supabase.ts"), false);
    assert.equal(isIgnoredFile("components/Dashboard.tsx"), false);
  });
});

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  parseGitHubUrl,
  isIgnoredFile,
  stripCodeLiteralsAndComments,
  calculateDoomsday,
  formatTimeToCollapse,
  sortPackageJsonCandidates,
  analyzeSnippet,
  LRUCache,
} from "../lib/audit-core.ts";
import { isValidEventName, sanitizeProps } from "../lib/analytics.ts";

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

  test("returns null for invalid or foreign inputs", () => {
    assert.equal(parseGitHubUrl("not a url"), null);
    assert.equal(parseGitHubUrl(""), null);
    assert.equal(parseGitHubUrl("https://gitlab.com/owner/repo"), null);
  });
});

describe("isIgnoredFile Hygiene (Tests & Artifacts)", () => {
  test("filters root tests/ paths (fixes pallets/flask bug)", () => {
    assert.equal(isIgnoredFile("tests/test_basic.py"), true);
    assert.equal(isIgnoredFile("test/test_app.py"), true);
    assert.equal(isIgnoredFile("tests/functional/test_routes.py"), true);
  });

  test("filters nested test paths and spec files", () => {
    assert.equal(isIgnoredFile("packages/core/tests/smoke.test.ts"), true);
    assert.equal(isIgnoredFile("src/components/Button.spec.tsx"), true);
    assert.equal(isIgnoredFile("__tests__/auth.test.ts"), true);
  });

  test("filters build outputs, type definitions, and dependencies", () => {
    assert.equal(isIgnoredFile("dist/bundle.js"), true);
    assert.equal(isIgnoredFile("src/types/index.d.ts"), true);
    assert.equal(isIgnoredFile("node_modules/react/index.js"), true);
  });

  test("preserves genuine application source code files", () => {
    assert.equal(isIgnoredFile("src/flask/app.py"), false);
    assert.equal(isIgnoredFile("app/page.tsx"), false);
    assert.equal(isIgnoredFile("lib/supabase.ts"), false);
    assert.equal(isIgnoredFile("components/Dashboard.tsx"), false);
  });
});

describe("stripCodeLiteralsAndComments (String & Comment Sanitizer)", () => {
  test("strips comments so mock detector strings are not counted as code", () => {
    const code = `
      // "use client";
      /* const key = SUPABASE_SERVICE_ROLE_KEY; */
      const x = 1;
    `;
    const stripped = stripCodeLiteralsAndComments(code);
    assert.equal(stripped.includes('"use client"'), false);
    assert.equal(stripped.includes("SUPABASE_SERVICE_ROLE_KEY"), false);
    assert.equal(stripped.includes("const x = 1;"), true);
  });

  test("strips string literals so example strings do not trigger false positive secret leaks", () => {
    const code = `
      const doc = "Here is an example: SUPABASE_SERVICE_ROLE_KEY is dangerous";
      const regexStr = 'process.env.SERVICE_ROLE_KEY';
    `;
    const stripped = stripCodeLiteralsAndComments(code);
    assert.equal(stripped.includes("SUPABASE_SERVICE_ROLE_KEY"), false);
    assert.equal(stripped.includes("process.env.SERVICE_ROLE_KEY"), false);
  });
});

describe("Doomsday Calculator & Dynamic Horizon", () => {
  test("healthy repository has low score and over 100 commits horizon", () => {
    const res = calculateDoomsday(1000, 0, true, "clean");
    assert.ok(res.score < 30);
    const horizon = formatTimeToCollapse(res.score, true);
    assert.equal(horizon.includes("Более 100 коммитов"), true);
  });

  test("brittle repository has high score and urgent commits horizon", () => {
    const res = calculateDoomsday(15000, 4, false, "mess");
    assert.ok(res.score >= 75);
    const horizon = formatTimeToCollapse(res.score, true);
    assert.equal(horizon.includes("коммитов до блокирующего сбоя"), true);
  });
});

describe("sortPackageJsonCandidates", () => {
  test("prioritizes root package.json over nested docs/package.json", () => {
    const paths = ["docs/package.json", "package.json", "packages/core/package.json"];
    const chosen = sortPackageJsonCandidates(paths);
    assert.equal(chosen, "package.json");
  });

  test("selects shallowest package.json when root is missing", () => {
    const paths = ["apps/web/sub/package.json", "apps/web/package.json"];
    const chosen = sortPackageJsonCandidates(paths);
    assert.equal(chosen, "apps/web/package.json");
  });
});

describe("analyzeSnippet (No Hardcoded Horizon)", () => {
  test("clean snippet gets healthy score and dynamic horizon", () => {
    const snippet = `
      export function add(a: number, b: number): number {
        return a + b;
      }
    `;
    const report = analyzeSnippet(snippet, true);
    assert.ok(report.doomsdayScore < 30);
    assert.equal(report.timeToCollapse.includes("Более 100 коммитов"), true);
    assert.equal(report.criticalBugsCount, 0);
  });

  test("vulnerable snippet detects secret leak in client code", () => {
    const snippet = `
      "use client";
      import { createClient } from "@supabase/supabase-js";
      const supabase = createClient("url", process.env.SUPABASE_SERVICE_ROLE_KEY!);
    `;
    const report = analyzeSnippet(snippet, true);
    assert.ok(report.criticalBugsCount >= 1);
    assert.equal(report.antipatterns.some((a) => a.cwe === "CWE-798"), true);
  });
});

describe("LRUCache Limit & Eviction", () => {
  test("respects maxEntries ceiling and evicts oldest items", () => {
    const cache = new LRUCache<string>(3, 10000);
    cache.set("a", "1");
    cache.set("b", "2");
    cache.set("c", "3");
    assert.equal(cache.size(), 3);

    // Adding 4th item evicts oldest ('a')
    cache.set("d", "4");
    assert.equal(cache.size(), 3);
    assert.equal(cache.get("a"), null);
    assert.equal(cache.get("b"), "2");
    assert.equal(cache.get("d"), "4");
  });
});

describe("Analytics Envelope Hygiene", () => {
  test("event allowlist accepts known funnel events and rejects foreign names", () => {
    assert.equal(isValidEventName("landed"), true);
    assert.equal(isValidEventName("scan_completed"), true);
    assert.equal(isValidEventName("prompt_copied"), true);
    assert.equal(isValidEventName("user_email"), false);
    assert.equal(isValidEventName("eval(1)"), false);
    assert.equal(isValidEventName(""), false);
  });

  test("sanitizeProps keeps primitives, truncates long strings, drops objects", () => {
    const props = sanitizeProps({
      repo: "owner/repo",
      score: 88,
      cached: true,
      nested: { x: 1 },
      fn: () => 42,
      long: "x".repeat(500),
    });
    assert.equal(props.repo, "owner/repo");
    assert.equal(props.score, 88);
    assert.equal(props.cached, true);
    assert.equal("nested" in props, false);
    assert.equal("fn" in props, false);
    assert.equal(String(props.long).length <= 201, true);
  });

  test("sanitizeProps enforces key ceiling and rejects non-objects", () => {
    const many: Record<string, string> = {};
    for (let i = 0; i < 30; i++) many[`k${i}`] = "v";
    assert.ok(Object.keys(sanitizeProps(many)).length <= 12);
    assert.deepEqual(sanitizeProps(null), {});
    assert.deepEqual(sanitizeProps("string"), {});
    assert.deepEqual(sanitizeProps([1, 2, 3]), {});
  });
});

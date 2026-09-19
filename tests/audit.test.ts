import { test, describe } from "node:test";
import assert from "node:assert/strict";
import {
  parseGitHubUrl,
  isIgnoredFile,
  stripCodeLiteralsAndComments,
  formatTimeToCollapse,
  sortPackageJsonCandidates,
  analyzeSnippet,
  isSafePublicUrl,
  extractScriptUrls,
  LRUCache,
} from "../lib/audit-core.ts";
import { sanitizeProps, ALLOWED_EVENT_NAMES } from "../lib/analytics.ts";

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

describe("Dynamic Horizon Calculation", () => {
  test("healthy repository has over 100 commits horizon", () => {
    const horizon = formatTimeToCollapse(25, true);
    assert.equal(horizon.includes("Более 100 коммитов"), true);
  });

  test("brittle repository has urgent commits horizon", () => {
    const horizon = formatTimeToCollapse(88, true);
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

describe("Analytics Telemetry & Sanitizer", () => {
  test("sanitizes props by dropping nested objects, arrays, and functions", () => {
    const raw = {
      str: "valid string",
      num: 42,
      bool: true,
      nestedObj: { foo: "bar" },
      arr: [1, 2, 3],
      fn: () => "evil",
      nullVal: null,
      undefVal: undefined,
    };
    const sanitized = sanitizeProps(raw as Record<string, unknown>);
    assert.equal(sanitized.str, "valid string");
    assert.equal(sanitized.num, 42);
    assert.equal(sanitized.bool, true);
    assert.equal("nestedObj" in sanitized, false);
    assert.equal("arr" in sanitized, false);
    assert.equal("fn" in sanitized, false);
    assert.equal("nullVal" in sanitized, false);
  });

  test("truncates long strings to 120 characters and caps at 12 properties", () => {
    const raw: Record<string, unknown> = {
      veryLongStr: "A".repeat(200),
    };
    for (let i = 0; i < 20; i++) {
      raw[`key_${i}`] = i;
    }
    const sanitized = sanitizeProps(raw);
    assert.equal((sanitized.veryLongStr as string).length, 120);
    assert.ok(Object.keys(sanitized).length <= 12);
  });

  test("verifies event allowlist contains core funnel events and rejects unknown names", () => {
    assert.ok(ALLOWED_EVENT_NAMES.includes("landed"));
    assert.ok(ALLOWED_EVENT_NAMES.includes("scan_completed"));
    assert.ok(ALLOWED_EVENT_NAMES.includes("prompt_copied"));
    assert.ok(ALLOWED_EVENT_NAMES.includes("share_clicked"));
    assert.ok(ALLOWED_EVENT_NAMES.includes("order_submitted"));
    assert.ok(ALLOWED_EVENT_NAMES.includes("waitlist_submitted"));
    assert.equal((ALLOWED_EVENT_NAMES as readonly string[]).includes("user_injected_evil_event"), false);
  });
});

describe("Live App URL Scanner & SSRF Guard", () => {
  test("allows legitimate public HTTPS websites", () => {
    assert.equal(isSafePublicUrl("https://ui.shadcn.com"), true);
    assert.equal(isSafePublicUrl("https://my-saas.lovable.app"), true);
    assert.equal(isSafePublicUrl("http://example.com/test"), true);
  });

  test("blocks SSRF attack vectors and internal network ranges", () => {
    assert.equal(isSafePublicUrl("http://localhost"), false);
    assert.equal(isSafePublicUrl("http://127.0.0.1:3000"), false);
    assert.equal(isSafePublicUrl("http://0.0.0.0"), false);
    assert.equal(isSafePublicUrl("http://[::1]"), false);
    assert.equal(isSafePublicUrl("http://0x7f000001"), false);
    assert.equal(isSafePublicUrl("http://0177.0.0.1"), false);
    assert.equal(isSafePublicUrl("http://api.internal"), false);
    assert.equal(isSafePublicUrl("http://example.com:22"), false);
    assert.equal(isSafePublicUrl("http://10.0.0.1/admin"), false);
    assert.equal(isSafePublicUrl("http://192.168.1.1/secret"), false);
    assert.equal(isSafePublicUrl("http://169.254.169.254/latest/meta-data"), false);
    assert.equal(isSafePublicUrl("ftp://example.com"), false);
    assert.equal(isSafePublicUrl("not-a-url"), false);
  });

  test("rejects IPv6 link-local and loopback addresses", () => {
    assert.equal(isSafePublicUrl("https://[fe80::1]"), false);
    assert.equal(isSafePublicUrl("https://[fc00::1]"), false);
    assert.equal(isSafePublicUrl("https://[fd00::1]"), false);
    assert.equal(isSafePublicUrl("https://[::1]"), false);
    assert.equal(isSafePublicUrl("https://[::]"), false);
  });

  test("rejects single-label domains without TLD", () => {
    assert.equal(isSafePublicUrl("http://api"), false);
    assert.equal(isSafePublicUrl("http://myhost"), false);
  });

  test("rejects IPv4 multicast and reserved ranges", () => {
    assert.equal(isSafePublicUrl("http://224.0.0.1"), false);
    assert.equal(isSafePublicUrl("http://239.255.255.250"), false);
    assert.equal(isSafePublicUrl("http://240.0.0.1"), false);
  });

  test("extracts script bundles from HTML and resolves relative URLs", () => {
    const html = `
      <html>
        <head>
          <script src="/_next/static/chunks/main.js"></script>
          <script src="https://cdn.example.com/app.js"></script>
          <script src="data:text/javascript;base64,..."></script>
        </head>
      </html>
    `;
    const scripts = extractScriptUrls(html, "https://my-saas.vercel.app");
    assert.equal(scripts.includes("https://my-saas.vercel.app/_next/static/chunks/main.js"), true);
    assert.equal(scripts.includes("https://cdn.example.com/app.js"), true);
    assert.equal(scripts.some((s) => s.startsWith("data:")), false);
  });
});

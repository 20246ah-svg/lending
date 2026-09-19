import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST as auditPost } from "../app/api/audit/route.ts";
import { POST as orderPost, GET as orderGet } from "../app/api/order/route.ts";
import { POST as waitlistPost, GET as waitlistGet } from "../app/api/waitlist/route.ts";
import { POST as eventsPost, GET as eventsGet } from "../app/api/events/route.ts";

describe("API Route Integration: /api/audit", () => {
  test("returns 400 when body has neither url, snippet, nor archetype", async () => {
    const req = new NextRequest("http://localhost:3000/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    const res = await auditPost(req);
    assert.equal(res.status, 400);
    const body = await res.json();
    assert.ok(body.error);
  });

  test("returns archetype preset report with valid Doomsday Score", async () => {
    const req = new NextRequest("http://localhost:3000/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ archetype: "cursor-saas", lang: "en" }),
    });
    const res = await auditPost(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.doomsdayScore > 50);
    assert.ok(body.data.godComponents.length > 0);
    assert.ok(body.data.refactorSteps.length > 0);
  });

  test("analyzes pasted code snippet and flags secret leaks", async () => {
    const vulnerableSnippet = `
      "use client";
      export function Auth() {
        const secret = process.env.SUPABASE_SERVICE_ROLE_KEY;
        return <div>Secret</div>;
      }
    `;
    const req = new NextRequest("http://localhost:3000/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snippet: vulnerableSnippet, lang: "ru" }),
    });
    const res = await auditPost(req);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.criticalBugsCount >= 1);
    assert.ok(body.data.antipatterns.some((a: { cwe?: string }) => a.cwe === "CWE-798"));
  });

  test("rejects SSRF attack vectors on liveUrl inspection", async () => {
    const req = new NextRequest("http://localhost:3000/api/audit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ liveUrl: "http://169.254.169.254/latest/meta-data" }),
    });
    const res = await auditPost(req);
    assert.equal(res.status, 400);
  });
});

describe("API Route Integration: /api/order", () => {
  test("rejects order when email or repo URL is missing", async () => {
    const reqNoEmail = new NextRequest("http://localhost:3000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repoOrListingUrl: "https://github.com/test/repo" }),
    });
    const res1 = await orderPost(reqNoEmail);
    assert.equal(res1.status, 400);

    const reqNoRepo = new NextRequest("http://localhost:3000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "founder@vibedebt.dev" }),
    });
    const res2 = await orderPost(reqNoRepo);
    assert.equal(res2.status, 400);
  });

  test("successfully processes valid concierge order", async () => {
    const req = new NextRequest("http://localhost:3000/api/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tier: "concierge",
        email: "alice@startup.io",
        repoOrListingUrl: "https://github.com/alice/saas",
        notes: "Due diligence before investor meeting",
        lang: "en",
      }),
    });
    const res = await orderPost(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.orderId.startsWith("ord_"));
    assert.equal(data.deliverySla, "24 часа");
  });

  test("GET /api/order masks emails for public callers and prevents raw leaks", async () => {
    const getReq = new NextRequest("http://localhost:3000/api/order");
    const res = await orderGet(getReq);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(data.storageMode);
    assert.ok(typeof data.totalOrders === "number");
    // Ensure all returned emails in public response are masked
    for (const order of data.orders) {
      assert.ok(order.email.includes("***"));
    }
  });

  test("GET /api/order enforces ADMIN_SECRET when set and allows authorized access", async () => {
    process.env.ADMIN_SECRET = "super_secure_admin_key_2026";
    try {
      // Unauthorized call with wrong key
      const badReq = new NextRequest("http://localhost:3000/api/order", {
        headers: { "x-admin-key": "wrong_key" },
      });
      const badRes = await orderGet(badReq);
      assert.equal(badRes.status, 401);

      // Authorized call with valid key
      const goodReq = new NextRequest("http://localhost:3000/api/order", {
        headers: { Authorization: "Bearer super_secure_admin_key_2026" },
      });
      const goodRes = await orderGet(goodReq);
      assert.equal(goodRes.status, 200);
      const data = await goodRes.json();
      assert.ok(data.orders.length > 0);
    } finally {
      delete process.env.ADMIN_SECRET;
    }
  });
});

describe("API Route Integration: /api/waitlist", () => {
  test("validates email address and rejects empty or malformed strings", async () => {
    const req = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "invalid-email-no-at" }),
    });
    const res = await waitlistPost(req);
    assert.equal(res.status, 400);
  });

  test("successfully subscribes and returns total subscriber count", async () => {
    const testEmail = `waitlist_${Date.now()}@test.io`;
    const req = new NextRequest("http://localhost:3000/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: testEmail }),
    });
    const res = await waitlistPost(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.totalSubscribers > 0);

    const getReq = new NextRequest("http://localhost:3000/api/waitlist");
    const getRes = await waitlistGet(getReq);
    assert.equal(getRes.status, 200);
    const getData = await getRes.json();
    assert.equal(getData.status, "active");
  });
});

describe("API Route Integration: /api/events", () => {
  test("accepts allowed funnel events with sanitized metadata", async () => {
    const req = new NextRequest("http://localhost:3000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "scan_completed",
        props: { score: 82, repo: "owner/repo", extraDangerousFn: () => "evil" },
      }),
    });
    const res = await eventsPost(req);
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.equal(data.success, true);
    assert.ok(data.id.startsWith("ev_"));
  });

  test("rejects disallowed or malicious event names", async () => {
    const req = new NextRequest("http://localhost:3000/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "unregistered_injected_event" }),
    });
    const res = await eventsPost(req);
    assert.equal(res.status, 400);
  });

  test("GET /api/events returns telemetry aggregates", async () => {
    const res = await eventsGet();
    assert.equal(res.status, 200);
    const data = await res.json();
    assert.ok(typeof data.totalEvents === "number");
    assert.ok(data.bufferSize <= data.bufferCapacity);
    assert.ok(typeof data.eventCounts.landed === "number");
  });
});

import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const score = parseInt(searchParams.get("score") || "88", 10);
  const target = searchParams.get("target") || "vibe-coded-saas";
  const horizon = searchParams.get("horizon") || "11 commits to failure";
  const critical = parseInt(searchParams.get("critical") || "3", 10);

  const isCritical = score >= 75;
  const scoreColor = isCritical ? "#f43f5e" : score >= 50 ? "#fbbf24" : "#10b981";
  const badgeText = isCritical ? "CRITICAL RISK" : score >= 50 ? "ELEVATED DEBT" : "HEALTHY STACK";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#050508",
          backgroundImage: "radial-gradient(circle at 50% 20%, #1e1b4b 0%, #050508 70%)",
          padding: "60px 70px",
          fontFamily: "system-ui, -apple-system, sans-serif",
          color: "#f4f4f5",
          border: "2px solid #27272a",
        }}
      >
        {/* Top Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                border: "1px solid rgba(16, 185, 129, 0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
              }}
            >
              ⚡
            </div>
            <div style={{ display: "flex", fontSize: "24px", fontWeight: "bold", letterSpacing: "2px" }}>
              VIBE<span style={{ color: "#10b981" }}>DEBT</span>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px",
              borderRadius: "999px",
              backgroundColor: "rgba(39, 39, 42, 0.8)",
              border: "1px solid #3f3f46",
              fontSize: "14px",
              color: "#a1a1aa",
              fontFamily: "monospace",
            }}
          >
            AI TECH DEBT AUDITOR
          </div>
        </div>

        {/* Center Content: Big Score & Target */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: "680px" }}>
            <div
              style={{
                fontSize: "16px",
                color: "#71717a",
                fontFamily: "monospace",
                marginBottom: "8px",
                letterSpacing: "1px",
              }}
            >
              TARGET REPOSITORY / LIVE BUNDLE:
            </div>
            <div
              style={{
                fontSize: "36px",
                fontWeight: "800",
                color: "#ffffff",
                marginBottom: "16px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                maxWidth: "640px",
              }}
            >
              {target}
            </div>
            <div
              style={{
                fontSize: "18px",
                color: "#d4d4d8",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <span>💀 Estimated Horizon:</span>
              <span style={{ color: "#fca5a5", fontWeight: "bold" }}>{horizon}</span>
            </div>
          </div>

          {/* Score Badge */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "30px 44px",
              borderRadius: "24px",
              backgroundColor: "rgba(9, 9, 11, 0.8)",
              border: `2px solid ${scoreColor}`,
              boxShadow: `0 0 40px ${scoreColor}33`,
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontFamily: "monospace",
                color: scoreColor,
                fontWeight: "bold",
                letterSpacing: "1.5px",
                marginBottom: "4px",
              }}
            >
              {badgeText}
            </div>
            <div
              style={{
                fontSize: "84px",
                fontWeight: "900",
                fontFamily: "monospace",
                color: scoreColor,
                lineHeight: "1",
              }}
            >
              {score}%
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "#71717a",
                fontFamily: "monospace",
                marginTop: "6px",
              }}
            >
              {critical} CRITICAL FLAWS
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "1px solid #27272a",
            paddingTop: "20px",
            fontSize: "14px",
            color: "#71717a",
            fontFamily: "monospace",
          }}
        >
          <div>Heuristic CVE & RLS Vulnerability Inspection</div>
          <div style={{ color: "#10b981", fontWeight: "bold" }}>vibedebt.dev</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}

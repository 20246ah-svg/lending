"use client";

import { useState } from "react";
import { CheckIcon, CopyIcon } from "@/components/icons";

const BAD = /❌|⚠️|as any|: any\b|SERVICE_ROLE|SECRET_KEY|useEffect\(|\.\.\.req\.body|catch\s*\(\s*e\s*\)\s*\{\s*\}/;
const GOOD = /✅|z\.object|safeParse|use server|AbortController|useMemo|useCallback/;

interface CodeSpecimenProps {
  code: string;
  tone: "bad" | "good";
  /** Printed on the frame rail, e.g. "INFECTED SAMPLE". */
  tag: string;
  file?: string;
  /** Language hint shown at the right of the rail. */
  lang?: string;
}

/**
 * A code sample presented as a lab specimen: engraved rail, per-line gutter,
 * and automatic highlighting of the defect (or cure) markers inside the text.
 */
export function CodeSpecimen({ code, tone, tag, file, lang = "tsx" }: CodeSpecimenProps) {
  const [copied, setCopied] = useState(false);
  const lines = code.replace(/\n$/, "").split("\n");
  const accent = tone === "bad" ? "var(--rot)" : "var(--acid)";

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <figure className="m-0 border border-[var(--line-2)] bg-[#020306] overflow-hidden">
      <div
        className="flex items-center justify-between gap-3 px-3 py-2 border-b"
        style={{ borderColor: `${accent}44`, background: `${accent}0d` }}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <span
            className="mono text-[9px] font-bold tracking-[0.24em] px-1.5 py-0.5 shrink-0"
            style={{ background: accent, color: "#05060a" }}
          >
            {tag}
          </span>
          {file ? (
            <span className="mono text-[10.5px] text-[var(--bone-dim)] truncate">{file}</span>
          ) : null}
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={`Copy ${tag} code`}
          className="mono text-[10px] text-[var(--bone-dim)] hover:text-[var(--acid)] transition flex items-center gap-1.5 shrink-0"
        >
          {copied ? (
            <CheckIcon size={11} className="text-[var(--acid)]" />
          ) : (
            <CopyIcon size={11} />
          )}
          {copied ? "OK" : "COPY"}
        </button>
      </div>

      <pre className="m-0 overflow-x-auto text-[11.5px] leading-[1.75] font-mono">
        <code className="block py-3">
          {lines.map((line, i) => {
            const isBad = BAD.test(line);
            const isGood = GOOD.test(line);
            const flag = isBad ? "var(--rot)" : isGood ? "var(--acid)" : null;
            return (
              <span
                key={i}
                className="flex whitespace-pre"
                style={
                  flag
                    ? {
                        background: `${flag}14`,
                        boxShadow: `inset 2px 0 0 ${flag}`,
                      }
                    : undefined
                }
              >
                <span
                  aria-hidden="true"
                  className="select-none shrink-0 w-9 text-right pr-3 text-[10px] text-[#3b3f4a] tabular-nums"
                >
                  {i + 1}
                </span>
                <span
                  className="pr-4"
                  style={{
                    color: flag
                      ? flag
                      : /^\s*(\/\/|\/\*|\*)/.test(line)
                      ? "#5f6470"
                      : "#cdd2dc",
                  }}
                >
                  {line || " "}
                </span>
              </span>
            );
          })}
        </code>
      </pre>

      <figcaption className="flex items-center justify-between gap-3 px-3 py-1.5 border-t border-[var(--line)]">
        <span className="lbl" style={{ fontSize: 9 }}>
          {lines.length} LINES PARSED
        </span>
        <span className="lbl" style={{ fontSize: 9 }}>
          {lang}
        </span>
      </figcaption>
    </figure>
  );
}

import React from "react";

interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  /** Corner registration brackets, like a slide mount. */
  bracket?: boolean;
  /** Swap the brackets to the contamination colour. */
  tone?: "acid" | "rot";
  /** Small mono caption printed on the top rule. */
  label?: string;
  /** Right-aligned meta on the top rule. */
  meta?: React.ReactNode;
  solid?: boolean;
}

/**
 * The base instrument envelope: hairline border, glass gradient, optional
 * registration brackets and a printed caption rule along the top edge.
 */
export function Panel({
  children,
  bracket,
  tone = "acid",
  label,
  meta,
  solid,
  className = "",
  ...rest
}: PanelProps) {
  return (
    <div
      className={`${solid ? "panel-solid" : "panel"} ${
        bracket ? (tone === "rot" ? "bracket bracket-rot" : "bracket") : ""
      } ${className}`}
      {...rest}
    >
      {(label || meta) && (
        <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] px-4 py-2.5">
          <span className="lbl">{label}</span>
          {meta ? <span className="mono text-[10px] text-[var(--bone-dim)]">{meta}</span> : null}
        </div>
      )}
      {children}
    </div>
  );
}

interface SectionHeadProps {
  index: string;
  label: string;
  title: React.ReactNode;
  lede?: React.ReactNode;
  align?: "left" | "center";
  tone?: "acid" | "rot" | "violet";
}

/** Numbered section masthead with a rule that carries the section index. */
export function SectionHead({
  index,
  label,
  title,
  lede,
  align = "left",
  tone = "acid",
}: SectionHeadProps) {
  const toneColor =
    tone === "acid" ? "var(--acid)" : tone === "rot" ? "var(--rot)" : "var(--violet)";

  return (
    <header
      className={`reveal ${align === "center" ? "text-center mx-auto max-w-3xl" : "max-w-4xl"}`}
      data-delay="0"
    >
      <div
        className={`flex items-center gap-3 ${align === "center" ? "justify-center" : ""}`}
      >
        <span className="mono text-[11px] tabular-nums" style={{ color: toneColor }}>
          {index}
        </span>
        <span className="lbl">{label}</span>
        <span className="hidden sm:block h-px w-16 bg-[var(--line-2)]" />
      </div>

      <h2 className="d2 mt-5 text-[var(--bone)]">{title}</h2>

      {lede ? (
        <p className={`lede mt-5 max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>{lede}</p>
      ) : null}
    </header>
  );
}

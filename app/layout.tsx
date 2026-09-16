import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeDebt — Аудитор техдолга и Счётчик Судного Дня для ИИ-проектов",
  description:
    "Проверь технический долг проектов, созданных в Cursor, Bolt или Lovable. Реальный аудит GitHub репозиториев, Счётчик Судного Дня и хирургические промпты для безопасного рефакторинга.",
  keywords: [
    "технический долг",
    "vibe coding",
    "Cursor",
    "Bolt.new",
    "Lovable",
    "аудит кода",
    "AI code audit",
    "technical debt",
  ],
  openGraph: {
    title: "VibeDebt — Счётчик Судного Дня для вайбкод-проектов",
    description:
      "Узнай, через сколько коммитов рухнет твой ИИ-стартап. Детерминированный AST-аудит и хирургические промпты рефакторинга.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05060a",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Loaded as a plain stylesheet on purpose: next/font/google needs build-time
            network access to Google, which self-hosted and offline builds don't have. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@200..700&family=JetBrains+Mono:ital,wght@0,300..700;1,400&family=Manrope:wght@400..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        suppressHydrationWarning
        className="substrate min-h-full flex flex-col bg-ink text-bone"
      >
        <noscript>
          {/* Without JS the boot curtain has no way to lift itself. */}
          <style>{`.boot-veil{display:none!important}`}</style>
        </noscript>
        <a href="#audit-tool" className="skip-link">
          Перейти к аудитору
        </a>
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}

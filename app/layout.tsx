import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeDebt — Technical Debt Auditor & Doomsday Clock for AI-Built Startups",
  description:
    "Проверь технический долг проектов, созданных в Cursor, Bolt или Lovable. Реальный аудит GitHub репозиториев, счетчик Судного Дня и хирургические промпты для рефакторинга.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 selection:bg-zinc-700 selection:text-white">
        {children}
      </body>
    </html>
  );
}

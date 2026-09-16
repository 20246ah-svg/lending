import type { Metadata, Viewport } from "next";
import "./globals.css";

const title = "VibeDebt — Счётчик Судного Дня для вайбкод-проектов";
const description =
  "Аудит технического долга проектов, собранных в Cursor, Bolt.new и Lovable: реальный скан GitHub-репозитория, прогноз времени до критического сбоя и хирургические промпты для безопасного рефакторинга.";

export const metadata: Metadata = {
  metadataBase: new URL("https://vibedebt.dev"),
  title,
  description,
  applicationName: "VibeDebt",
  keywords: [
    "технический долг",
    "аудит кода",
    "Cursor",
    "vibe coding",
    "рефакторинг",
    "Doomsday Score",
    "AI startup",
  ],
  openGraph: {
    title,
    description,
    type: "website",
    url: "https://vibedebt.dev",
    siteName: "VibeDebt",
    locale: "ru_RU",
    images: [{ url: "/og.jpg", width: 1200, height: 630, alt: "VibeDebt Doomsday Clock" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.jpg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#04040b",
  colorScheme: "dark",
};

const fontHref =
  "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;600&family=Manrope:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@1,400;1,500&display=swap";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={fontHref} />
      </head>
      <body suppressHydrationWarning className="flex min-h-full flex-col bg-void text-white/90">
        {children}
      </body>
    </html>
  );
}

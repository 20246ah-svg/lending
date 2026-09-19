import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "VibeDebt — Technical Debt Auditor & Doomsday Score for AI-Built Startups",
  description:
    "Instant technical debt audit and Doomsday fragility calculation for codebases built with Cursor, Bolt, or Lovable. Detect God-components, secret leaks, and get surgical refactor prompts.",
  keywords: [
    "VibeDebt",
    "Technical Debt",
    "Cursor AI",
    "Doomsday Score",
    "Code Auditor",
    "Refactoring Prompts",
    "AI Code Smells",
    "Next.js",
  ],
  authors: [{ name: "VibeDebt Engineering" }],
  openGraph: {
    title: "VibeDebt — Technical Debt Auditor & Doomsday Score",
    description: "Scan your AI codebase in 1 second. Detect critical failure points and get surgical prompts for Cursor.",
    url: "https://vibedebt.dev",
    siteName: "VibeDebt",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VibeDebt — Technical Debt Auditor & Doomsday Score",
    description: "Audit your Cursor & Lovable codebase in 1 second. Get surgical refactor prompts.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#050508] text-zinc-100 font-sans selection:bg-emerald-500 selection:text-black">
        {children}
      </body>
    </html>
  );
}

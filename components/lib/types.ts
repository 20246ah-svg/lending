/* Shared domain types for the VibeDebt audit engine UI.
   These mirror the response shape of /api/audit — keep them in sync. */

export interface GodComponent {
  name: string;
  lines: number;
  sizeBytes?: number;
  issues: string[];
  risk: "critical" | "high" | "medium";
}

export interface Antipattern {
  title: string;
  description: string;
  severity: "CRITICAL" | "HIGH" | "WARNING";
  detectedIn: string;
  sampleBadCode: string;
  sampleFix: string;
}

export interface RefactorStep {
  step: number;
  title: string;
  prompt: string;
  estimatedTime: string;
  targetTool?: string;
}

export interface AuditReport {
  title: string;
  repoName: string;
  isRealRepo: boolean;
  doomsdayScore: number;
  timeToCollapse: string;
  estimatedFixCost: number;
  criticalBugsCount: number;
  spaghettiIndex: number;
  ghostTypesCount: number;
  filesScanned: number;
  hasTests: boolean;
  starsCount?: number;
  primaryLanguage?: string;
  godComponents: GodComponent[];
  antipatterns: Antipattern[];
  refactorSteps: RefactorStep[];
  diagnosticsSummary: string;
}

export type Lang = "ru" | "en";
export type InputMode = "github" | "snippet" | "preset";
export type ReportTab = "antipatterns" | "god-files" | "prompts" | "radar";
export type AiTool = "cursor" | "claude";
export type DbState = "clean" | "medium" | "mess";

export function formatNumber(num: number): string {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

export function riskOf(score: number): "critical" | "elevated" | "healthy" {
  if (score > 75) return "critical";
  if (score > 40) return "elevated";
  return "healthy";
}

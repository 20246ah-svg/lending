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
  cwe?: string;
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

export interface AuditRequestBody {
  url?: string;
  snippet?: string;
  archetype?: string;
  liveUrl?: string;
  lang?: "ru" | "en";
}

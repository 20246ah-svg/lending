"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";
import { Calculator } from "@/components/calculator";
import { Reticle } from "@/components/fx/reticle";
import { RevealEngine } from "@/components/fx/reveal-engine";
import { useDebtCalculator } from "@/lib/use-debt-calculator";
import type { Lang } from "@/lib/types";

/**
 * /calculator — the debt interest engine.
 *
 * A dedicated tool rather than a section: it needs ten inputs, a projection
 * chart, a full repayment schedule and room to breathe. State lives in
 * useDebtCalculator so the whole run is encoded in the URL.
 */
export default function CalculatorPage() {
  const [lang, setLang] = useState<Lang>("ru");
  const store = useDebtCalculator();
  const router = useRouter();

  // The shared header routes its "Audit" action back to the landing page.
  const goAudit = useCallback(() => {
    router.push("/#audit-tool");
  }, [router]);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Reticle />
      <RevealEngine />

      <Header
        lang={lang}
        setLang={setLang}
        onAudit={goAudit}
        anchorBase="/"
      />

      <main className="relative flex-1">
        <Calculator store={store} lang={lang} />
      </main>

      <Footer lang={lang} anchorBase="/" />
    </div>
  );
}

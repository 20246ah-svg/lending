"use client";

import { useCallback } from "react";
import { Header } from "@/components/shell/header";
import { Footer } from "@/components/shell/footer";
import { Hero } from "@/components/sections/hero";
import { Workbench } from "@/components/sections/workbench";
import { Simulator } from "@/components/sections/simulator";
import { Defects } from "@/components/sections/defects";
import { Cli } from "@/components/sections/cli";
import { Registry } from "@/components/sections/registry";
import { Pricing } from "@/components/sections/pricing";
import { Reticle } from "@/components/fx/reticle";
import { RevealEngine } from "@/components/fx/reveal-engine";
import { BootVeil } from "@/components/fx/boot-veil";
import { useAudit } from "@/lib/use-audit";

/**
 * ROT SPECIMEN — the VibeDebt landing page.
 *
 * One shared audit store drives the whole document: the hero dial, the workbench
 * verdict and the simulator are all wired to the same state, so a single scan
 * updates every readout on the page at once. The component itself stays a pure
 * orchestrator.
 */
export default function Home() {
  const store = useAudit();

  const scrollToAudit = useCallback(() => {
    document.getElementById("audit-tool")?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <div className="relative flex min-h-screen flex-col">
      <Reticle />
      <RevealEngine />
      <BootVeil />

      <Header lang={store.lang} setLang={store.setLang} onAudit={scrollToAudit} />

      <main className="relative flex-1">
        <Hero
          lang={store.lang}
          report={store.auditReport}
          copiedCli={store.copiedCli}
          onRunAudit={scrollToAudit}
          onShowDemo={store.showDemoReport}
          onCopyCli={store.handleCopyCli}
        />

        <Workbench store={store} />
        <Simulator store={store} />
        <Defects lang={store.lang} />
        <Cli
          lang={store.lang}
          copiedCli={store.copiedCli}
          onCopyCli={store.handleCopyCli}
        />
        <Registry store={store} />
        <Pricing lang={store.lang} />
      </main>

      <Footer lang={store.lang} />
    </div>
  );
}

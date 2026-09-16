"use client";

import { useEffect, useState } from "react";
import { copy } from "@/components/lib/copy";
import type { Lang } from "@/components/lib/types";
import { SiteHeader } from "@/components/sections/SiteHeader";
import { Hero } from "@/components/sections/Hero";
import { Workbench } from "@/components/sections/Workbench";
import { CliSection } from "@/components/sections/CliSection";
import { Pipeline } from "@/components/sections/Pipeline";
import { Calculator } from "@/components/sections/Calculator";
import { Anatomy } from "@/components/sections/Anatomy";
import { Waitlist } from "@/components/sections/Waitlist";
import { Pricing } from "@/components/sections/Pricing";
import { Faq } from "@/components/sections/Faq";
import { FinalCta, SiteFooter } from "@/components/sections/SiteFooter";

export default function Home() {
  const [lang, setLang] = useState<Lang>("ru");
  const c = copy[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div className="relative flex min-h-screen flex-col">
      {/* фон страницы: базовый градиент и подсветки */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 bg-void">
        <div className="absolute inset-0 bg-[radial-gradient(120%_75%_at_50%_-12%,rgba(124,108,255,0.13),transparent_58%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[40vh] bg-[radial-gradient(80%_100%_at_50%_120%,rgba(244,63,94,0.07),transparent_70%)]" />
      </div>

      <SiteHeader lang={lang} setLang={setLang} c={c} />

      <main className="relative">
        <Hero c={c.hero} marquee={c.marquee} />
        <Workbench lang={lang} c={c.workbench} />
        <CliSection c={c.cli} />
        <Pipeline c={c.pipeline} />
        <Calculator c={c.calc} />
        <Anatomy c={c.anatomy} lang={lang} />
        <Waitlist c={c.waitlist} lang={lang} />
        <Pricing c={c.pricing} />
        <Faq c={c.faq} />
        <FinalCta c={c.finalCta} />
      </main>

      <SiteFooter c={c.footer} />
    </div>
  );
}

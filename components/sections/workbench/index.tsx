"use client";

import { Intake } from "./intake";
import { ReportPanel } from "./report";
import { SectionHead } from "@/components/ui/panel";
import type { AuditStore } from "@/lib/use-audit";

/**
 * The audit workbench: specimen intake on top, verdict dossier below.
 * Everything is driven by the shared audit store so the two halves never drift.
 */
export function Workbench({ store }: { store: AuditStore }) {
  const ru = store.lang === "ru";

  return (
    <section id="audit-tool" className="band relative z-10 scroll-mt-24">
      <div className="shell py-16 sm:py-24">
        <SectionHead
          index="01"
          label={ru ? "РАБОЧЕЕ МЕСТО АУДИТОРА" : "AUDITOR WORKBENCH"}
          title={
            ru ? (
              <>
                Вставь образец.
                <br />
                Получи вскрытие.
              </>
            ) : (
              <>
                Mount a specimen.
                <br />
                Read the autopsy.
              </>
            )
          }
          lede={
            ru
              ? "Три способа подать код на анализ: публичный репозиторий GitHub, вставка исходника или файл, и смоделированные архетипы типовых ИИ-проектов. Результат — досье с дефектами, планом ремонта и матрицей здоровья."
              : "Three ways to submit code for analysis: a public GitHub repository, a pasted source file, or one of the simulated archetypes of typical AI projects. The result is a dossier with defects, a repair plan and a health matrix."
          }
        />

        <div className="mt-12 space-y-10">
          <Intake store={store} />
          <ReportPanel store={store} />
        </div>
      </div>
    </section>
  );
}

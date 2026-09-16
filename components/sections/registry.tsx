"use client";

import { ShieldAlertIcon, CheckIcon, GithubIcon } from "@/components/icons";
import type { AuditStore } from "@/lib/use-audit";

/**
 * Early-access registry for the PR Guard bot, presented as a lab access desk
 * with a live GitHub Action snippet so the offer is concrete rather than vague.
 */
export function Registry({ store }: { store: AuditStore }) {
  const { lang, botEmail, setBotEmail, botSubscribed, handleBotSubmit } = store;
  const ru = lang === "ru";

  return (
    <section className="band relative z-10 overflow-hidden">
      <div className="hazard" aria-hidden="true" />

      <div className="shell py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* ---- pitch ---- */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 bg-[var(--acid)]" aria-hidden="true" />
              <span className="lbl">{ru ? "РЕЕСТР РАННЕГО ДОСТУПА" : "EARLY ACCESS REGISTRY"}</span>
            </div>

            <h2 className="d2 mt-5 text-[var(--bone)]">
              {ru ? (
                <>
                  Поставь бота
                  <br />
                  на вход
                  <br />
                  в репозиторий
                </>
              ) : (
                <>
                  Put a bot
                  <br />
                  on your
                  <br />
                  repository door
                </>
              )}
            </h2>

            <p className="lede mt-6 max-w-lg">
              {ru
                ? "GitHub Action проверяет каждый pull request, сгенерированный Cursor или Copilot, и блокирует слияние, если файл перевалил за 400 строк, появился новый каскад `as any` или в клиентский компонент просочился сервисный ключ."
                : "A GitHub Action inspects every pull request produced by Cursor or Copilot and blocks the merge if a file crosses 400 lines, a new `as any` cascade appears, or a service key leaks into a client component."}
            </p>

            <ul className="mt-7 space-y-3">
              {[
                ru ? "Правила настраиваются в .vibedebt.yml" : "Rules configured in .vibedebt.yml",
                ru ? "Комментарий в PR с точной строкой дефекта" : "Inline PR comment pointing at the exact line",
                ru ? "Блокировка слияния до устранения нарушения" : "Merge blocked until the violation is resolved",
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5">
                  <CheckIcon size={13} className="text-[var(--acid)] shrink-0 mt-0.5" />
                  <span className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)]">
                    {item}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ---- registry card ---- */}
          <div className="lg:col-span-7">
            <div className="panel bracket">
              <div className="flex items-center justify-between border-b border-[var(--line-2)] px-4 py-2.5">
                <span className="lbl flex items-center gap-2">
                  <ShieldAlertIcon size={12} className="text-[var(--acid)]" />
                  {ru ? "КАРТОЧКА ДОСТУПА" : "ACCESS CARD"}
                </span>
                <span className="mono text-[9.5px] tabular-nums text-[var(--bone-dim)]">
                  № {String(1284).padStart(5, "0")}
                </span>
              </div>

              {/* workflow snippet */}
              <div className="border-b border-[var(--line)] bg-[#020306]">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--line)]">
                  <span className="mono text-[9.5px] text-[var(--bone-dim)]">
                    .github/workflows/guard.yml
                  </span>
                  <span className="mono text-[9px] tracking-[0.2em] text-[var(--line-3)]">
                    YAML
                  </span>
                </div>
                <pre className="m-0 px-4 py-3.5 font-mono text-[10.5px] leading-[1.85] overflow-x-auto">
                  <code>
                    {[
                      [{ t: "#5f6470", s: "- name: " }, { t: "var(--acid)", s: "VibeDebt PR Guard" }],
                      [{ t: "#5f6470", s: "  uses: " }, { t: "var(--bone)", s: "vibedebt/pr-guard@v1" }],
                      [{ t: "#5f6470", s: "  with:" }],
                      [
                        { t: "#5f6470", s: "    max_lines: " },
                        { t: "var(--rot)", s: "400" },
                        { t: "#5f6470", s: "        # блокировать God-файлы" },
                      ],
                      [
                        { t: "#5f6470", s: "    block_secrets: " },
                        { t: "var(--rot)", s: "true" },
                        { t: "#5f6470", s: "    # CWE-798" },
                      ],
                      [
                        { t: "#5f6470", s: "    fail_on: " },
                        { t: "var(--bone)", s: "critical" },
                      ],
                    ].map((line, i) => (
                      <span key={i} className="block">
                        {line.map((seg, k) => (
                          <span key={k} style={{ color: seg.t }}>
                            {seg.s}
                          </span>
                        ))}
                      </span>
                    ))}
                  </code>
                </pre>
              </div>

              {/* form / confirmation */}
              <div className="p-5 sm:p-6">
                {botSubscribed ? (
                  <div className="border border-[var(--acid)]/40 bg-[var(--acid)]/[0.07] p-6 text-center relative overflow-hidden">
                    <div
                      className="mono text-[11px] font-bold tracking-[0.3em] text-[var(--acid)] inline-block px-4 py-2 border-2 border-[var(--acid)]"
                      style={{ transform: "rotate(-2.5deg)" }}
                    >
                      {ru ? "ДОСТУП ЗАРЕЗЕРВИРОВАН" : "ACCESS RESERVED"}
                    </div>
                    <p className="mono text-[10.5px] leading-relaxed text-[var(--bone-dim)] mt-4 max-w-md mx-auto">
                      {ru
                        ? "Ты в раннем списке. Приглашение в GitHub-организацию придёт на указанный адрес, когда бот выйдет из закрытой беты. Позиция в очереди — 1 284."
                        : "You are on the early list. The GitHub organisation invitation lands at the address you gave once the bot leaves closed beta. Queue position: 1,284."}
                    </p>
                  </div>
                ) : (
                  <>
                    <span className="lbl block mb-3">
                      {ru ? "РАБОЧИЙ EMAIL ДЛЯ ПРИГЛАШЕНИЯ" : "WORK EMAIL FOR THE INVITE"}
                    </span>
                    <form onSubmit={handleBotSubmit} className="flex flex-col sm:flex-row gap-2.5">
                      <input
                        type="email"
                        value={botEmail}
                        onChange={(e) => setBotEmail(e.target.value)}
                        placeholder="founder@startup.com"
                        required
                        className="field flex-1"
                        aria-label={ru ? "Email" : "Email"}
                      />
                      <button type="submit" className="btn btn-acid shrink-0">
                        <GithubIcon size={13} />
                        {ru ? "Получить доступ" : "Request access"}
                      </button>
                    </form>

                    <p className="mono text-[10px] text-[var(--bone-dim)] mt-3 leading-relaxed">
                      {ru
                        ? "Приватная бета. Письма только по делу — никаких рассылок о «росте выручки»."
                        : "Private beta. We only mail you about the bot — never about “growth strategies”."}
                    </p>
                  </>
                )}
              </div>

              {/* barcode foot */}
              <div className="flex items-center justify-between gap-4 border-t border-[var(--line-2)] px-4 py-3">
                <span className="barcode flex-1 text-[var(--bone)] max-w-[180px]" aria-hidden="true" />
                <span className="mono text-[9px] tracking-[0.2em] text-[var(--bone-dim)]">
                  VD-GUARD-{new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

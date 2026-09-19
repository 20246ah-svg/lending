"use client";

import React, { useState } from "react";
import { XCircleIcon, ShieldAlertIcon, CheckIcon, CopyIcon, ZapIcon } from "@/components/icons";

interface DueDiligenceSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "ru" | "en";
  onOrderNow: () => void;
}

export default function DueDiligenceSampleModal({
  isOpen,
  onClose,
  lang,
  onOrderNow,
}: DueDiligenceSampleModalProps) {
  const isRu = lang === "ru";
  const [activePage, setActivePage] = useState<1 | 2 | 3 | 4>(1);
  const [copiedCurl, setCopiedCurl] = useState(false);

  if (!isOpen) return null;

  const curlExploit = `curl -X GET "https://ai-landing-builder.supabase.co/rest/v1/orders?select=*" \\
  -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \\
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."`;

  const copyCurl = () => {
    navigator.clipboard.writeText(curlExploit);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-4xl p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl text-left max-h-[92vh] flex flex-col">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800 shrink-0">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <ShieldAlertIcon size={20} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-white uppercase tracking-wider">
                  {isRu ? "ОБРАЗЕЦ ОТЧЕТА M&A DUE DILIGENCE" : "SAMPLE M&A TECH DD REPORT"}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-bold">
                  RED FLAG VERDICT
                </span>
              </div>
              <div className="text-[11px] text-zinc-400 font-mono">
                Target: instant-ai-landing-builder (Acquire.com Listing #4912 • Asking: $38,000)
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-500 hover:text-zinc-200 transition cursor-pointer p-1"
          >
            <XCircleIcon size={22} />
          </button>
        </div>

        {/* 4-Page Navigation Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 my-4 shrink-0 font-mono text-xs">
          {[
            { id: 1 as const, title: isRu ? "1. Вердикт & CAPEX" : "1. Verdict & CAPEX" },
            { id: 2 as const, title: isRu ? "2. Эксплойт Supabase RLS" : "2. Supabase RLS Exploit" },
            { id: 3 as const, title: isRu ? "3. Монолиты & CI" : "3. Monoliths & CI" },
            { id: 4 as const, title: isRu ? "4. 12 Вопросов для торга" : "4. Negotiation Ammunition" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActivePage(tab.id)}
              className={`py-2 px-3 rounded-lg border transition text-left cursor-pointer flex items-center justify-between ${
                activePage === tab.id
                  ? "bg-zinc-800 border-emerald-500/60 text-emerald-300 font-bold"
                  : "bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <span>{tab.title}</span>
              {activePage === tab.id && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
            </button>
          ))}
        </div>

        {/* Page Content Body (Scrollable) */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-4 text-xs font-mono">
          {/* PAGE 1: VERDICT & CAPEX */}
          {activePage === 1 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-rose-400 font-bold mb-1">
                    EXECUTIVE AUDIT SUMMARY
                  </div>
                  <div className="text-xl font-extrabold text-white">
                    {isRu ? "🔴 ВЫСОКИЙ РИСК: ТРЕБУЕТСЯ СКИДКА К ЦЕНЕ" : "🔴 HIGH RISK: VALUATION DISCOUNT REQUIRED"}
                  </div>
                  <div className="text-xs text-zinc-300 font-sans mt-1">
                    {isRu
                      ? "Кодовая база создана на Lovable и содержит утечку БД, мастер-ключ в браузере и 0 автотестов."
                      : "Lovable-generated stack with leaking customer table, leaked master JWT, and zero automated tests."}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <div className="text-[10px] text-zinc-400">Doomsday Score</div>
                    <div className="text-3xl font-extrabold text-rose-400">88%</div>
                  </div>
                  <div className="text-right pl-4 border-l border-zinc-800">
                    <div className="text-[10px] text-zinc-400">CAPEX на стабилизацию</div>
                    <div className="text-3xl font-extrabold text-emerald-400">$4,800</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                  <div className="text-zinc-500 text-[11px] mb-1">Заявленная цена продавца</div>
                  <div className="text-2xl font-bold text-white">$38,000</div>
                </div>
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/50">
                  <div className="text-zinc-500 text-[11px]">Стоимость рефакторинга</div>
                  <div className="text-2xl font-bold text-rose-400">-$4,800</div>
                </div>
                <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                  <div className="text-emerald-400 text-[11px]">Рекомендуемая цена сделки</div>
                  <div className="text-2xl font-bold text-emerald-300">$30,800 (-19%)</div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 font-sans space-y-2 leading-relaxed">
                <div className="font-bold text-white font-mono text-xs">
                  {isRu ? "ТОП-3 КРИТИЧЕСКИХ МИНЫ ДЛЯ ПОКУПАТЕЛЯ:" : "TOP-3 TECHNICAL LANDMINES:"}
                </div>
                <ol className="list-decimal list-inside space-y-1.5 text-xs">
                  <li>
                    <strong>Supabase RLS bypass (CVE-2025-48757):</strong> Таблица `orders` содержит политику `USING (true)`, позволяя любому посетителю выгрузить историю всех платежей и email покупателей через простой GET запрос.
                  </li>
                  <li>
                    <strong>Утечка master-ключа в клиентском коде:</strong> В файле `Dashboard.tsx` используется `process.env.SUPABASE_SERVICE_ROLE_KEY` в связке с директивой <code>&apos;use client&apos;</code>.
                  </li>
                  <li>
                    <strong>Отсутствие идемпотентности Stripe:</strong> Повторные вебхуки Stripe начисляют баланс повторно, порождая риск финансового фрода.
                  </li>
                </ol>
              </div>
            </div>
          )}

          {/* PAGE 2: SUPABASE RLS EXPLOIT */}
          {activePage === 2 && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/10">
                <div className="font-bold text-amber-300 mb-1">
                  {isRu ? "Воспроизведение уязвимости Supabase RLS" : "Supabase RLS Exploit Proof of Concept"}
                </div>
                <div className="text-zinc-300 font-sans text-xs">
                  {isRu
                    ? "Продавец предоставил скриншот «Lovable Security: Enabled». Однако проверка тела политики выявила `USING (true)`. Запрос ниже с публичным анонимным ключом возвращает приватные данные клиентов без авторизации:"
                    : "Seller provided a clean Lovable scan. Inspection of policy bodies revealed `USING (true)`. The curl command below dumps customer data using only the public anon key:"}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-black border border-zinc-800 text-xs text-zinc-300 font-mono relative">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-zinc-850">
                  <span className="text-zinc-500">Terminal — Public Exploitation Test</span>
                  <button
                    onClick={copyCurl}
                    className="px-2.5 py-1 rounded bg-zinc-850 hover:bg-zinc-800 text-zinc-200 transition flex items-center gap-1.5 cursor-pointer text-[11px]"
                  >
                    {copiedCurl ? <CheckIcon size={12} className="text-emerald-400" /> : <CopyIcon size={12} />}
                    <span>{copiedCurl ? "Скопировано!" : "Копировать curl"}</span>
                  </button>
                </div>
                <pre className="text-emerald-400 overflow-x-auto whitespace-pre-wrap">{curlExploit}</pre>
                <div className="mt-3 pt-3 border-t border-zinc-800 text-zinc-400 text-[11px]">
                  HTTP/1.1 200 OK — Возвращено 1,420 записей с PII (emails, суммы транзакций Stripe, адреса).
                </div>
              </div>

              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 text-xs">
                <div className="font-bold text-white mb-2">Хирургический SQL-фикс для покупателя:</div>
                <pre className="p-3 rounded-lg bg-black text-cyan-300 overflow-x-auto">{`-- Удаление уязвимой политики Lovable:
DROP POLICY IF EXISTS "Public read orders" ON public.orders;

-- Включение строгой изоляции по auth.uid():
CREATE POLICY "Users can only read own orders"
  ON public.orders FOR SELECT
  USING (auth.uid() = user_id);`}</pre>
              </div>
            </div>
          )}

          {/* PAGE 3: CODEBASE MONOLITHS & CI */}
          {activePage === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <div className="text-zinc-500 text-[11px] mb-1">Главный God-компонент</div>
                  <div className="text-base font-bold text-white">src/app/page.tsx</div>
                  <div className="text-xs text-rose-400 font-bold mt-1">2,420 строк в 1 файле</div>
                  <div className="text-[11px] text-zinc-400 font-sans mt-2">
                    Содержит стейт корзины, сетевые запросы, парсинг Stripe и 22 `useEffect` хука.
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/60">
                  <div className="text-zinc-500 text-[11px] mb-1">Статус CI / CD Автотестов</div>
                  <div className="text-base font-bold text-white">GitHub Actions</div>
                  <div className="text-xs text-rose-400 font-bold mt-1">0 тестов запускается</div>
                  <div className="text-[11px] text-zinc-400 font-sans mt-2">
                    Файлы `test.ts` в репозитории — галлюцинированные моки без пайплайна выполнения.
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-amber-500/20 bg-amber-950/10">
                <div className="font-bold text-amber-300 mb-1">Лимит OpenAI API продавца (Quota Debt)</div>
                <div className="text-xs text-zinc-300 font-sans leading-relaxed">
                  Продукт обращается к модели `gpt-4o` через личный API-ключ продавца. На аккаунте включен Tier 1 с лимитом $100/мес. При росте трафика покупатель столкнется с ошибками `429 Too Many Requests` уже на 15 активных пользователях.
                </div>
              </div>
            </div>
          )}

          {/* PAGE 4: 12 NEGOTIATION QUESTIONS */}
          {activePage === 4 && (
            <div className="space-y-3">
              <div className="text-zinc-300 font-sans text-xs mb-2">
                {isRu
                  ? "Используйте эти вопросы на звонке с продавцом до перевода денег из эскроу. Вопросы составлены так, чтобы продавец не мог уклониться от ответа об архитектурном долге:"
                  : "Ask these questions during the technical handover call before releasing funds from escrow:"}
              </div>

              {[
                {
                  q: "1. «Покажите на экране тело RLS-политики для таблицы orders в дашборде Supabase»",
                  lie: "«Там все стандартно, Lovable сам включил защиту при деплое»",
                  truth: "Тело политики USING (true) — база полностью открыта. Требуйте скидку $1,500 на исправление RLS.",
                },
                {
                  q: "2. «Где в коде проверяется подпись вебхука Stripe (constructEvent)?»",
                  lie: "«У нас серверлесс, Stripe сам все проверяет по SSL»",
                  truth: "Подпись не проверяется. Любой злоумышленник может эмулировать оплату через curl.",
                },
                {
                  q: "3. «Запустите `npm test` прямо сейчас на демонстрации экрана»",
                  lie: "«Тесты были написаны в Cursor, но мы их не коммитили в CI»",
                  truth: "Регрессионных тестов нет. Любое обновление сломает прод.",
                },
                {
                  q: "4. «На чьем аккаунте оформлены лимиты OpenAI/Anthropic и какой текущий Tier?»",
                  lie: "«У меня корпоративный безлимит, перепишем на вас»",
                  truth: "Tier 1 с лимитом $100/мес. Потребуется $1,000 депозита для повышения лимитов.",
                },
              ].map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-1.5">
                  <div className="font-bold text-white text-xs">{item.q}</div>
                  <div className="text-[11px] text-rose-400">
                    <span className="font-bold">Красный флаг: </span>
                    <span className="font-sans italic">{item.lie}</span>
                  </div>
                  <div className="text-[11px] text-emerald-400">
                    <span className="font-bold">Фактическая истина: </span>
                    <span className="font-sans text-zinc-300">{item.truth}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Bottom Modal CTA Bar */}
        <div className="mt-4 pt-4 border-t border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-[11px] text-zinc-400 font-mono text-center sm:text-left">
            {isRu
              ? "Хотите такой же 4-страничный отчет для своей текущей сделки?"
              : "Need the same 4-page independent audit for your pending acquisition?"}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-300 transition cursor-pointer"
            >
              {isRu ? "Закрыть" : "Close"}
            </button>

            <button
              onClick={() => {
                onClose();
                onOrderNow();
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-extrabold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-1.5"
            >
              <ZapIcon size={14} className="fill-zinc-950 text-zinc-950" />
              <span>{isRu ? "Заказать отчет ($149) →" : "Order Report ($149) →"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { CheckIcon, XCircleIcon, SparklesIcon, ShieldAlertIcon } from "@/components/icons";
import { trackEvent } from "@/lib/analytics";

interface AuditOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "ru" | "en";
  initialTier?: "concierge" | "due_diligence";
}

export default function AuditOrderModal({
  isOpen,
  onClose,
  lang,
  initialTier = "due_diligence",
}: AuditOrderModalProps) {
  const isRu = lang === "ru";
  const [tier, setTier] = useState<"concierge" | "due_diligence">(initialTier);
  const [email, setEmail] = useState("");
  const [targetUrl, setTargetUrl] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderResult, setOrderResult] = useState<{ id: string; sla: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      trackEvent("order_opened", { tier: initialTier, lang });
    }
  }, [isOpen, initialTier, lang]);

  if (!isOpen) return null;

  const handleClose = () => {
    setOrderResult(null);
    setErrorMsg(null);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !targetUrl.trim() || loading) return;

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          email: email.trim(),
          repoOrListingUrl: targetUrl.trim(),
          notes: notes.trim(),
          lang,
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setErrorMsg(json.error || (isRu ? "Ошибка отправки заказа." : "Submission failed."));
      } else {
        setOrderResult({ id: json.orderId, sla: json.deliverySla });
        trackEvent("order_submitted", {
          tier,
          domain: email.split("@")[1]?.slice(0, 40) || "unknown",
        });
      }
    } catch {
      setErrorMsg(isRu ? "Ошибка сети при оформлении заказа." : "Network connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-lg p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl text-left max-h-[92vh] overflow-y-auto">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 transition cursor-pointer"
        >
          <XCircleIcon size={20} />
        </button>

        {!orderResult ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                {tier === "due_diligence" ? <ShieldAlertIcon size={18} /> : <SparklesIcon size={18} />}
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                {tier === "due_diligence"
                  ? isRu
                    ? "M&A Технический Due Diligence"
                    : "M&A Tech Due Diligence"
                  : isRu
                    ? "Консьерж-аудит архитектуры"
                    : "Founder Concierge Audit"}
              </span>
            </div>

            <h3 className="text-xl font-extrabold text-white mb-2">
              {tier === "due_diligence"
                ? isRu
                  ? "Независимый аудит перед покупкой ($149)"
                  : "Pre-Acquisition Independent Audit ($149)"
                : isRu
                  ? "Ручной аудит приватного кода ($49)"
                  : "Private Codebase Concierge Audit ($49)"}
            </h3>

            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-6">
              {tier === "due_diligence"
                ? isRu
                  ? "4-страничный отчет для покупателей на Acquire.com / Microns. Проверка Supabase RLS, поиск уязвимости USING (true), скрытые утечки ключей и расчет скидки к цене сделки."
                  : "4-page audit report for buyers on Acquire.com / Microns. Supabase RLS deep check, secret leakage audit, and stabilization CAPEX calculation."
                : isRu
                  ? "Ручной разбор кодовой базы сеньор-архитектором. ТОП-3 скрытых точки отказа, готовые промпты для Cursor и Claude, проверка фиксов."
                  : "Senior architect manual review. TOP-3 failure vectors, ready-to-run Cursor/Claude prompts, and post-fix recheck."}
            </p>

            {/* Tier Switcher inside modal */}
            <div className="flex gap-2 p-1 rounded-xl bg-zinc-900 border border-zinc-800 mb-6 font-mono text-xs">
              <button
                type="button"
                onClick={() => setTier("due_diligence")}
                className={`flex-1 py-2 px-3 rounded-lg text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                  tier === "due_diligence"
                    ? "bg-emerald-500 text-zinc-950 font-bold shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{isRu ? "M&A Due Diligence" : "M&A Due Diligence"}</span>
                <span className="text-[10px] opacity-80">$149 • 48h SLA</span>
              </button>
              <button
                type="button"
                onClick={() => setTier("concierge")}
                className={`flex-1 py-2 px-3 rounded-lg text-center transition cursor-pointer flex flex-col items-center gap-0.5 ${
                  tier === "concierge"
                    ? "bg-emerald-500 text-zinc-950 font-bold shadow-md"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <span>{isRu ? "Консьерж-аудит" : "Concierge Audit"}</span>
                <span className="text-[10px] opacity-80">$49 • 24h SLA</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  {isRu ? "Ваш рабочий Email:" : "Your Work Email:"}
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="buyer@syndicate.com"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  {tier === "due_diligence"
                    ? isRu
                      ? "Ссылка на листинг Acquire.com / Microns или репозиторий:"
                      : "Acquire.com / Microns listing URL or repository:"
                    : isRu
                      ? "Ссылка на GitHub репозиторий (приватный или публичный):"
                      : "GitHub repository URL (private or public):"}
                </label>
                <input
                  type="text"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder={
                    tier === "due_diligence"
                      ? "https://acquire.com/listing/... or github.com/..."
                      : "https://github.com/owner/private-repo"
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-zinc-300 mb-1.5">
                  {isRu
                    ? "Контекст сделки / стек (опционально):"
                    : "Deal context / Tech stack (optional):"}
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder={
                    isRu
                      ? "Например: оценка сделки $35k, продавец собрал на Lovable + Supabase, планируем закрыть через 5 дней."
                      : "E.g. $35k deal size, built with Lovable + Supabase, planning close in 5 days."
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-950/40 text-xs font-mono text-rose-400">
                  {errorMsg}
                </div>
              )}

              <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800 text-[11px] font-mono text-zinc-400 space-y-1">
                <div className="flex items-center gap-1.5 text-zinc-300">
                  <span className="text-emerald-400">🔒</span>
                  <span>{isRu ? "Строгий взаимный NDA" : "Strict Mutual NDA Protection"}</span>
                </div>
                <div>
                  {tier === "due_diligence"
                    ? isRu
                      ? "• Готовый 4-страничный PDF-отчет и Loom-разбор за 48 часов."
                      : "• 4-page PDF report & Loom breakdown delivered in 48 hours."
                    : isRu
                      ? "• Детальный аудит и пакет промптов в Markdown за 24 часа."
                      : "• Detailed audit and prompt pack in Markdown within 24 hours."}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20 disabled:opacity-50"
              >
                {loading
                  ? isRu
                    ? "Оформляем заказ..."
                    : "Processing..."
                  : isRu
                    ? `Заказать аудит за $${tier === "due_diligence" ? 149 : 49} →`
                    : `Order Audit for $${tier === "due_diligence" ? 149 : 49} →`}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-4">
              <CheckIcon size={28} />
            </div>
            <h4 className="text-lg font-bold text-white mb-2">
              {isRu ? "Заказ успешно принят!" : "Order Confirmed!"}
            </h4>
            <div className="inline-block px-3 py-1 rounded bg-zinc-900 border border-zinc-800 text-xs font-mono text-emerald-400 mb-4">
              ID: {orderResult.id} • SLA: {orderResult.sla}
            </div>
            <p className="text-xs text-zinc-300 font-sans leading-relaxed mb-6 max-w-sm mx-auto">
              {isRu
                ? `Мы отправили подтверждение и форму NDA на ${email}. Архитектор свяжется с вами для запроса безопасного доступа к коду.`
                : `We sent confirmation and NDA agreement to ${email}. Our lead architect will follow up for read-only repository access.`}
            </p>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition cursor-pointer"
            >
              {isRu ? "Закрыть окно" : "Close"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

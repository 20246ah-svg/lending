"use client";

import React, { useState } from "react";
import { CheckIcon, XCircleIcon, SparklesIcon } from "@/components/icons";
import { track } from "@/lib/analytics";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: "ru" | "en";
}

export default function WaitlistModal({ isOpen, onClose, lang }: WaitlistModalProps) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || loading) return;

    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      if (res.ok) track("waitlist_submitted");
    } catch {
      // fallback
    } finally {
      setLoading(false);
      setSubmitted(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-zinc-950 shadow-2xl text-left">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-200 transition cursor-pointer"
        >
          <XCircleIcon size={20} />
        </button>

        {!submitted ? (
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <SparklesIcon size={20} />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">
              {lang === "ru" ? "Ранний доступ к Founder Pro" : "Founder Pro Early Access"}
            </h3>
            <p className="text-xs text-zinc-400 font-sans leading-relaxed mb-6">
              {lang === "ru"
                ? "Мы открываем доступ к GitHub PR Bot и расширенному CLI партиями по 25 проектов. Оставьте email, чтобы получить инвайт в первой волне."
                : "We are onboarding teams to GitHub PR Bot and offline CLI in batches of 25. Enter your email for priority invite."}
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="founder@startup.com"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs font-mono text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-mono font-bold text-xs uppercase tracking-wider transition cursor-pointer shadow-lg shadow-emerald-500/20"
              >
                {lang === "ru" ? "Получить приоритетный инвайт →" : "Get Priority Invite →"}
              </button>
            </form>
          </div>
        ) : (
          <div className="text-center py-4">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto mb-3">
              <CheckIcon size={24} />
            </div>
            <h4 className="text-base font-bold text-white mb-1">
              {lang === "ru" ? "Вы в списке ожидания!" : "You're on the waitlist!"}
            </h4>
            <p className="text-xs text-zinc-400 font-sans mb-6">
              {lang === "ru"
                ? `Мы отправим ключ доступа на ${email}, как только откроется следующая волна.`
                : `We will email your access key to ${email} as soon as the next batch opens.`}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-mono text-zinc-200 transition cursor-pointer"
            >
              {lang === "ru" ? "Закрыть" : "Close"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

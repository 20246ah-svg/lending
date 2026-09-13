"use client";

import React, { useState } from "react";
import { Sparkles, Copy, Check, Zap, Flame } from "lucide-react";

export default function Home() {
  const [itemTitle, setItemTitle] = useState("");
  const [details, setDetails] = useState("");
  const [condition, setCondition] = useState("Идеальное (как новый)");
  const [generatedText, setGeneratedText] = useState("");
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generationsLeft, setGenerationsLeft] = useState(3);

  const handleGenerate = async () => {
    if (!itemTitle) return;
    if (generationsLeft <= 0) {
      alert("Бесплатные генерации закончились! Перейдите на тариф за 199 ₽.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setGeneratedText(
        `🔥 ${itemTitle} — В отличном состоянии!\n\n` +
        `📦 Состояние: ${condition}\n` +
        `📝 Описание:\n${details || "Полностью исправен, готов к любым проверкам."}\n\n` +
        `✅ Преимущества:\n` +
        `— Использовался бережно и аккуратно\n` +
        `— Полный комплект / Чистый и ухоженный\n` +
        `— Отличная цена по рынку\n\n` +
        `📍 Самовывоз / Возможна отправка Авито Доставкой (СДЭК, Почта, Boxberry).\n` +
        `💬 Пишите в сообщения или звоните — отвечаю быстро!`
      );
      setGenerationsLeft((prev) => prev - 1);
      setLoading(false);
    }, 1200);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[140px] rounded-full pointer-events-none" />
      <header className="w-full max-w-4xl flex justify-between items-center py-4 border-b border-slate-800/80 mb-12 relative z-10">
        <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
          <Zap className="text-indigo-400 fill-indigo-400" />
          <span>Turbo<span className="text-indigo-400">Sell</span> AI</span>
        </div>
        <div className="text-sm bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-slate-400">
          Осталось попыток: <span className="text-indigo-400 font-bold">{generationsLeft}</span>
        </div>
      </header>
      <main className="w-full max-w-4xl flex flex-col items-center text-center z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-sm mb-6">
          <Flame size={16} className="text-indigo-400" /> Генератор продающих текстов для Авито
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight">
          Продай на Авито за 24 часа с <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">нейро-описанием</span>
        </h1>
        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mb-10">
          Введи пару слов о товаре — получи идеальное SEO-объявление с высокой кликабельностью. Без копирайтеров и мучений.
        </p>
        <div className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl text-left mb-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Что продаете? *</label>
                <input type="text" placeholder="Например: iPhone 13 Pro 128gb" value={itemTitle} onChange={(e) => setItemTitle(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Состояние</label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 focus:outline-none focus:border-indigo-500 transition">
                  <option>Новое в упаковке</option>
                  <option>Идеальное (как новый)</option>
                  <option>Хорошее (есть следы носки/использования)</option>
                  <option>На запчасти / под восстановление</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Детали и дефекты</label>
                <textarea placeholder="АКБ 87%, коробка в комплекте..." value={details} onChange={(e) => setDetails(e.target.value)} rows={3} className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition" />
              </div>
              <button onClick={handleGenerate} disabled={loading || !itemTitle} className="w-full mt-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-medium py-3.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/25 transition disabled:opacity-50 cursor-pointer">
                {loading ? <span className="flex items-center gap-2"><Sparkles className="animate-spin" size={18} /> Создаем шедевр...</span> : <><Sparkles size={18} /> Сгенерировать объявление</>}
              </button>
            </div>
            <div className="flex flex-col h-full">
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium text-slate-300">Готовое объявление</label>
                {generatedText && (
                  <button onClick={copyToClipboard} className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition">
                    {copied ? <Check size={14} /> : <Copy size={14} />} {copied ? "Скопировано!" : "Скопировать"}
                  </button>
                )}
              </div>
              <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-300 font-mono text-sm overflow-y-auto min-h-[220px] whitespace-pre-line">
                {generatedText || <span className="text-slate-600 font-sans italic">Здесь появится продающий текст со структурой, буллетами и эмодзи...</span>}
              </div>
            </div>
          </div>
        </div>
        <div className="w-full max-w-3xl mb-16">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Тарифы для тех, кто продает часто</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-lg text-slate-200">Пакет «Продавец»</h3>
                <div className="text-3xl font-extrabold my-3">199 ₽</div>
                <p className="text-slate-400 text-sm mb-4">20 генераций для быстрой распродажи вещей.</p>
              </div>
              <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-medium transition">Купить 20 генераций</button>
            </div>
            <div className="p-6 rounded-2xl bg-gradient-to-b from-indigo-950/40 to-slate-900 border border-indigo-500/30 flex flex-col justify-between relative">
              <div>
                <h3 className="font-bold text-lg text-indigo-300">Безлимит PRO</h3>
                <div className="text-3xl font-extrabold my-3">490 ₽ <span className="text-sm font-normal text-slate-400">/ навсегда</span></div>
                <p className="text-slate-400 text-sm mb-4">Для перекупов, товарщиков и магазинов.</p>
              </div>
              <button className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium transition shadow-lg shadow-indigo-600/30">Получить Безлимит</button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

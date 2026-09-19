"use client";

import React from "react";
import { GithubIcon } from "@/components/icons";

interface FooterProps {
  lang: "ru" | "en";
}

export default function Footer({ lang }: FooterProps) {
  return (
    <footer className="border-t border-zinc-800/80 bg-[#050508] py-12 px-4 sm:px-8 z-10 relative">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-xs text-zinc-500">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold">VIBEDEBT</span>
          <span>{"//"}</span>
          <span>{lang === "ru" ? "Архитектура без спагетти" : "Zero Slop Architecture"}</span>
        </div>

        <div className="flex items-center gap-6">
          <a
            href="https://github.com/20246ah-svg/lending"
            target="_blank"
            rel="noreferrer"
            className="hover:text-zinc-300 transition flex items-center gap-1.5"
          >
            <GithubIcon size={14} />
            <span>GitHub</span>
          </a>
          <span className="text-zinc-700">•</span>
          <span>MIT License</span>
          <span className="text-zinc-700">•</span>
          <span>2026</span>
        </div>
      </div>
    </footer>
  );
}

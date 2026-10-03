"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  DEFAULT_PARAMS,
  computeDebtModel,
  paramsToQuery,
  queryToParams,
  type DebtModel,
  type DebtParams,
  type Preset,
} from "./debt-model";

export interface DebtCalculatorStore {
  params: DebtParams;
  model: DebtModel;
  setParam: <K extends keyof DebtParams>(key: K, value: DebtParams[K]) => void;
  nudge: <K extends keyof DebtParams>(key: K, delta: number) => void;
  applyPreset: (preset: Preset) => void;
  reset: () => void;
  shareUrl: string;
  copyShareLink: () => void;
  copied: boolean;
  activePreset: string | null;
}

/**
 * Owns the calculator's inputs, derives the model, and keeps the URL in sync so
 * any configuration can be shared or bookmarked.
 *
 * The URL is treated as an external system in both directions: it is read once
 * after mount (deferred past hydration so the server and first client render
 * always agree), and written back through `history.replaceState` — never a
 * navigation, never a re-render.
 */
export function useDebtCalculator(): DebtCalculatorStore {
  const [params, setParams] = useState<DebtParams>(DEFAULT_PARAMS);
  const [copied, setCopied] = useState(false);
  /** Presets stop being "active" the moment a single channel is touched. */
  const [activePreset, setActivePreset] = useState<string | null>("vibe");
  const hydrated = useRef(false);

  /* ---- read the URL once, after hydration ----------------------------- */

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    if (!sp.toString()) return;

    const patch = queryToParams(sp);
    if (!Object.keys(patch).length) return;

    // Deferred to the next frame: applying it synchronously would desync the
    // server-rendered defaults from the first client paint.
    const frame = requestAnimationFrame(() => {
      hydrated.current = true;
      setParams((prev) => ({ ...prev, ...patch }));
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  /* ---- write the URL back, debounced ---------------------------------- */

  const query = useMemo(() => paramsToQuery(params), [params]);

  useEffect(() => {
    // Skip the very first write: it would strip the query we are about to read.
    if (!hydrated.current) {
      hydrated.current = true;
      return;
    }
    const id = window.setTimeout(() => {
      window.history.replaceState(null, "", `?${query}`);
    }, 350);
    return () => window.clearTimeout(id);
  }, [query]);

  /* ---- setters -------------------------------------------------------- */

  const setParam = useCallback(
    <K extends keyof DebtParams>(key: K, value: DebtParams[K]) => {
      setParams((prev) => ({ ...prev, [key]: value }));
      setActivePreset(null);
    },
    []
  );

  const nudge = useCallback(
    <K extends keyof DebtParams>(key: K, delta: number) => {
      setParams((prev) => ({ ...prev, [key]: prev[key] + delta }));
      setActivePreset(null);
    },
    []
  );

  const applyPreset = useCallback((preset: Preset) => {
    setParams(preset.params);
    setActivePreset(preset.id);
  }, []);

  const reset = useCallback(() => {
    setParams(DEFAULT_PARAMS);
    setActivePreset("vibe");
  }, []);

  const model = useMemo(() => computeDebtModel(params), [params]);

  const shareUrl = useMemo(() => {
    const path = typeof window === "undefined" ? "/calculator" : window.location.pathname;
    return `${path}?${query}`;
  }, [query]);

  const copyShareLink = useCallback(() => {
    const absolute =
      typeof window === "undefined"
        ? shareUrl
        : `${window.location.origin}${shareUrl}`;
    navigator.clipboard.writeText(absolute);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2200);
  }, [shareUrl]);

  return {
    params,
    model,
    setParam,
    nudge,
    applyPreset,
    reset,
    shareUrl,
    copyShareLink,
    copied,
    activePreset,
  };
}

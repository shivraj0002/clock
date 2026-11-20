"use client";
import { useEffect, useState } from "react";
import { useHour } from "./use-hour";

/** Moves content by a few px every `everyMs` to avoid OLED burn-in. */
export function usePixelShift(enabled: boolean, everyMs = 30_000, max = 18) {
  const [o, setO] = useState({ x: 0, y: 0 });
  useEffect(() => {
    if (!enabled) return;
    const r = () => Math.round((Math.random() * 2 - 1) * max);
    const t = setInterval(() => setO({ x: r(), y: r() }), everyMs);
    return () => clearInterval(t);
  }, [enabled, everyMs, max]);
  return enabled ? o : { x: 0, y: 0 };
}

/** Effective brightness 0.2..1: manual dim x night factor (22:00-06:00) when autoDim. */
export function useBrightness(dim: number, autoDim: boolean): number {
  const hour = useHour();
  const night = autoDim && (hour >= 22 || hour < 6);
  return Math.max(0.2, Math.min(1, dim / 100)) * (night ? 0.6 : 1);
}

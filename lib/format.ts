import type { Parts } from "./time";

export const pad = (n: number) => String(n).padStart(2, "0");

export function formatHMS(p: Parts, hour12: boolean, seconds: boolean) {
  let h = p.h;
  const pm = h >= 12;
  if (hour12) h = h % 12 || 12;
  const text = `${hour12 ? h : pad(h)}:${pad(p.m)}${seconds ? `:${pad(p.s)}` : ""}`;
  return { text, suffix: hour12 ? (pm ? "PM" : "AM") : "" };
}

/** ceil: round up to whole seconds (countdown shows 00:00 only when done). */
export function formatDuration(ms: number, ceil = false) {
  const t = Math.max(0, ceil ? Math.ceil(ms / 1000) * 1000 : ms);
  const total = Math.floor(t / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return {
    main: h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`,
    cs: pad(Math.floor((t % 1000) / 10)),
  };
}

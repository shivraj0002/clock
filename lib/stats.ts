import type { Entry } from "@/store/sessions";
import { pad } from "./format";

export function dayKey(ms: number): string {
  const d = new Date(ms);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** Total tracked ms per local day for the last `n` days (oldest first). */
export function lastDays(entries: Entry[], now: number, n = 7) {
  const totals = new Map<string, number>();
  for (const e of entries) totals.set(dayKey(e.start), (totals.get(dayKey(e.start)) ?? 0) + e.durationMs);
  return Array.from({ length: n }, (_, i) => {
    const d = new Date(now);
    d.setDate(d.getDate() - (n - 1 - i));
    const key = dayKey(d.getTime());
    return { key, label: d.toLocaleDateString(undefined, { weekday: "short" }), ms: totals.get(key) ?? 0 };
  });
}

export function formatHm(ms: number): string {
  const m = Math.round(ms / 60_000);
  const h = Math.floor(m / 60);
  return h > 0 ? `${h}h ${pad(m % 60)}m` : `${m}m`;
}

const csvCell = (v: string | number) => {
  let s = String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // neutralize spreadsheet formula injection
  return `"${s.replace(/"/g, '""')}"`;
};

export function toCsv(entries: Entry[]): string {
  const rows = entries.map((e) =>
    [e.task, e.kind, new Date(e.start).toISOString(), Math.round(e.durationMs / 1000)].map(csvCell).join(","),
  );
  return ["task,kind,start,duration_seconds", ...rows].join("\n");
}

export function download(name: string, text: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name;
  a.click();
  URL.revokeObjectURL(a.href);
}

"use client";
import { useState } from "react";
import { useSessions } from "@/store/sessions";
import { useUI } from "@/store/ui";
import { download, formatHm, lastDays, toCsv } from "@/lib/stats";
import { formatDuration } from "@/lib/format";
import { Btn } from "@/components/ui/Btn";

const border = "color-mix(in srgb, var(--muted) 50%, transparent)";

export function StatsPanel() {
  const entries = useSessions((s) => s.entries);
  const close = () => useUI.getState().setKey("statsOpen", false);
  const [now] = useState(() => Date.now());
  const days = lastDays(entries, now);
  const max = Math.max(1, ...days.map((d) => d.ms));
  const week = days.reduce((a, d) => a + d.ms, 0);
  const recent = [...entries].reverse().slice(0, 10);

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center p-4"
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      <button
        aria-label="Close stats"
        className="absolute inset-0 cursor-default"
        style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)" }}
        onClick={close}
      />
      <section
        role="dialog"
        aria-label="Stats"
        className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border p-5 shadow-2xl"
        style={{ background: "var(--bg)", borderColor: border }}
      >
        <div className="mb-4 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Tracked time</h2>
          <span className="text-sm" style={{ color: "var(--muted)" }}>
            Today {formatHm(days[days.length - 1].ms)} · 7 days {formatHm(week)}
          </span>
        </div>
        <div className="flex h-36 items-end gap-2" role="img" aria-label="Tracked time, last 7 days">
          {days.map((d) => (
            <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-[10px]" style={{ color: "var(--muted)" }}>
                {d.ms ? formatHm(d.ms) : ""}
              </span>
              <div
                className="w-full rounded-t"
                style={{
                  height: `${(d.ms / max) * 100}%`,
                  minHeight: d.ms ? 3 : 1,
                  background: d.ms ? "var(--accent)" : "var(--muted)",
                  opacity: d.ms ? 1 : 0.3,
                }}
              />
              <span className="text-xs" style={{ color: "var(--muted)" }}>
                {d.label}
              </span>
            </div>
          ))}
        </div>
        <h3 className="mb-1 mt-5 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--muted)" }}>
          Recent
        </h3>
        {recent.length === 0 && (
          <p className="text-sm" style={{ color: "var(--muted)" }}>
            Nothing logged yet. Finish a timer, focus session, or reset a running stopwatch.
          </p>
        )}
        <ul className="text-sm">
          {recent.map((e) => (
            <li key={e.id} className="flex justify-between gap-3 border-b py-1.5" style={{ borderColor: border }}>
              <span className="min-w-0 flex-1 truncate">
                {e.task || <em style={{ color: "var(--muted)" }}>no task</em>}
              </span>
              <span style={{ color: "var(--muted)" }}>{e.kind}</span>
              <span className="tabular-nums">{formatDuration(e.durationMs).main}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Btn
            disabled={!entries.length}
            onClick={() => download("sessions.json", JSON.stringify(entries, null, 2), "application/json")}
          >
            Export JSON
          </Btn>
          <Btn disabled={!entries.length} onClick={() => download("sessions.csv", toCsv(entries), "text/csv")}>
            Export CSV
          </Btn>
          <Btn
            disabled={!entries.length}
            onClick={() => window.confirm("Delete all logged sessions?") && useSessions.getState().clear()}
          >
            Clear
          </Btn>
          <Btn className="ml-auto" onClick={close}>
            Close
          </Btn>
        </div>
      </section>
    </div>
  );
}

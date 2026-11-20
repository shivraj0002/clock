"use client";
import { useTick } from "@/lib/use-tick";
import { useTitle } from "@/lib/use-title";
import { formatDuration } from "@/lib/format";
import { elapsedOf, useTimers } from "@/store/timers";
import { Btn } from "@/components/ui/Btn";
import { Digits } from "@/components/Digits";
import { useSettings } from "@/store/settings";

const fmtMs = (ms: number) => {
  const d = formatDuration(ms);
  return `${d.main}.${d.cs}`;
};
const fmtS = (ms: number) => formatDuration(ms).main;

function exportCsv(laps: number[]) {
  const rows = laps.map((t, i) => `${i + 1},${fmtMs(t)},${fmtMs(t - (laps[i - 1] ?? 0))}`);
  const blob = new Blob([["lap,total,split", ...rows].join("\n")], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "laps.csv";
  a.click();
  URL.revokeObjectURL(a.href);
}

export function Stopwatch() {
  const sw = useTimers((s) => s.sw);
  const laps = useTimers((s) => s.laps);
  const { swToggle, swReset, swLap } = useTimers.getState();
  const showMs = useSettings((s) => s.showMs);
  const fmt = showMs ? fmtMs : fmtS;
  // Without milliseconds the display only changes once a second, so tick less often.
  const now = useTick(sw.running, showMs ? 50 : 200);
  const { main, cs } = formatDuration(elapsedOf(sw, now));
  useTitle(`${main} · Stopwatch`);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div
        className="display font-semibold leading-none"
        style={{ fontSize: "clamp(3rem, 16vw, 14rem)", textShadow: "0 0 40px var(--glow)" }}
      >
        <Digits text={main} />
        {showMs && (
          <span className="text-[0.4em]" style={{ color: "var(--muted)" }}>
            .{cs}
          </span>
        )}
      </div>
      <div className="chrome flex gap-3">
        <Btn big active onClick={swToggle}>
          {sw.running ? "Pause" : sw.acc > 0 ? "Resume" : "Start"}
        </Btn>
        <Btn big onClick={swLap} disabled={!sw.running}>
          Lap
        </Btn>
        <Btn big onClick={swReset} disabled={!sw.running && sw.acc === 0}>
          Reset
        </Btn>
      </div>
      {laps.length > 0 && (
        <div className="chrome w-full max-w-md">
          <div className="max-h-48 overflow-y-auto font-mono text-sm tabular-nums">
            {[...laps].reverse().map((t, ri) => {
              const i = laps.length - 1 - ri;
              return (
                <div
                  key={i}
                  className="flex justify-between border-b py-1.5"
                  style={{ borderColor: "color-mix(in srgb, var(--muted) 30%, transparent)" }}
                >
                  <span style={{ color: "var(--muted)" }}>#{i + 1}</span>
                  <span>+{fmt(t - (laps[i - 1] ?? 0))}</span>
                  <span style={{ color: "var(--muted)" }}>{fmt(t)}</span>
                </div>
              );
            })}
          </div>
          <Btn className="mt-3" onClick={() => exportCsv(laps)}>
            Export CSV
          </Btn>
        </div>
      )}
    </div>
  );
}

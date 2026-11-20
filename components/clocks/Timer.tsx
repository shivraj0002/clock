"use client";
import { useState } from "react";
import { useTick } from "@/lib/use-tick";
import { useTitle } from "@/lib/use-title";
import { formatDuration } from "@/lib/format";
import { elapsedOf, useTimers } from "@/store/timers";
import { Btn } from "@/components/ui/Btn";
import { Digits } from "@/components/Digits";

const PRESETS = [5, 10, 25, 50];

export function Timer() {
  const cd = useTimers((s) => s.cd);
  const { cdToggle, cdReset, cdSet } = useTimers.getState();
  const now = useTick(cd.running);
  const [custom, setCustom] = useState("");

  // Completion (sound, notification, log) is handled app-wide by <Watchers />.
  const remaining = cd.duration - elapsedOf(cd, now);
  const untouched = !cd.running && cd.acc === 0 && !cd.finished;
  const { main } = formatDuration(remaining, true);
  useTitle(cd.finished ? "Time's up!" : `${main} · Timer`);
  const progress = cd.duration > 0 ? Math.min(1, Math.max(0, 1 - remaining / cd.duration)) : 0;

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-8">
      <div
        className={`display text-center font-semibold leading-none ${cd.finished ? "animate-pulse" : ""}`}
        style={{
          fontSize: "clamp(3rem, 18vw, 16rem)",
          color: cd.finished ? "var(--accent)" : "var(--fg)",
          textShadow: "0 0 40px var(--glow)",
        }}
      >
        <Digits text={main} />
      </div>
      <div
        className="h-1.5 w-full max-w-xl overflow-hidden rounded-full"
        style={{ background: "color-mix(in srgb, var(--muted) 30%, transparent)" }}
      >
        <div
          className="h-full rounded-full"
          style={{ width: `${progress * 100}%`, background: "var(--accent)", boxShadow: "0 0 12px var(--glow)" }}
        />
      </div>
      <div className="chrome flex flex-col items-center gap-6">
        {untouched && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {PRESETS.map((m) => (
              <Btn key={m} active={cd.duration === m * 60_000} onClick={() => cdSet(m * 60_000)}>
                {m} min
              </Btn>
            ))}
            <input
              type="number"
              min={1}
              placeholder="custom min"
              aria-label="Custom minutes"
              value={custom}
              onChange={(e) => {
                setCustom(e.target.value);
                const v = parseFloat(e.target.value);
                if (v > 0) cdSet(Math.round(v * 60_000));
              }}
              className="w-28 rounded-lg border bg-transparent px-3 py-1.5 text-sm outline-none focus:border-[var(--accent)]"
              style={{ borderColor: "color-mix(in srgb, var(--muted) 50%, transparent)" }}
            />
          </div>
        )}
        <div className="flex gap-3">
          <Btn big active onClick={cdToggle}>
            {cd.running ? "Pause" : cd.finished ? "Restart" : cd.acc > 0 ? "Resume" : "Start"}
          </Btn>
          <Btn big onClick={cdReset} disabled={untouched}>
            Reset
          </Btn>
        </div>
      </div>
    </div>
  );
}

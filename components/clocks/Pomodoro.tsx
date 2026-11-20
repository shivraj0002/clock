"use client";
import { useTick } from "@/lib/use-tick";
import { useTitle } from "@/lib/use-title";
import { formatDuration } from "@/lib/format";
import { elapsedOf } from "@/store/timers";
import { usePomodoro, type Phase } from "@/store/pomodoro";
import { useSettings } from "@/store/settings";
import { Btn } from "@/components/ui/Btn";
import { Digits } from "@/components/Digits";

const LABEL: Record<Phase, string> = { work: "Focus", short: "Short break", long: "Long break" };

export function Pomodoro() {
  const { phase, core, completed, toggle, reset, skip, resetCycle } = usePomodoro();
  const total =
    useSettings((s) => (phase === "work" ? s.pomoWork : phase === "short" ? s.pomoShort : s.pomoLong)) * 60_000;
  const every = useSettings((s) => s.pomoEvery);
  const now = useTick(core.running);

  const remaining = total - elapsedOf(core, now);
  const { main } = formatDuration(remaining, true);
  useTitle(`${main} · ${LABEL[phase]}`);
  const progress = total > 0 ? Math.min(1, Math.max(0, 1 - remaining / total)) : 0;
  const filled = completed % every;

  return (
    <div className="flex w-full max-w-4xl flex-col items-center gap-8">
      <div className="flex gap-2" aria-label="Phase">
        {(Object.keys(LABEL) as Phase[]).map((p) => (
          <span
            key={p}
            className="rounded-full border px-3 py-1 text-sm"
            style={{
              borderColor: p === phase ? "var(--accent)" : "transparent",
              color: p === phase ? "var(--accent)" : "var(--muted)",
            }}
          >
            {LABEL[p]}
          </span>
        ))}
      </div>
      <div
        className="display text-center font-semibold leading-none"
        style={{
          fontSize: "clamp(3rem, 18vw, 16rem)",
          textShadow: "0 0 40px var(--glow)",
          color: phase === "work" ? "var(--fg)" : "var(--accent)",
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
      <div className="flex items-center gap-2" aria-label={`${filled} of ${every} focus sessions before long break`}>
        {Array.from({ length: every }, (_, i) => (
          <span
            key={i}
            className="h-3 w-3 rounded-full"
            style={{ background: i < filled ? "var(--accent)" : "color-mix(in srgb, var(--muted) 35%, transparent)" }}
          />
        ))}
        <span className="ml-2 text-sm" style={{ color: "var(--muted)" }}>
          {completed} done
        </span>
      </div>
      <div className="chrome flex flex-wrap justify-center gap-3">
        <Btn big active onClick={toggle}>
          {core.running ? "Pause" : core.acc > 0 ? "Resume" : "Start"}
        </Btn>
        <Btn big onClick={skip}>
          Skip
        </Btn>
        <Btn big onClick={reset} disabled={!core.running && core.acc === 0}>
          Reset
        </Btn>
        <Btn big onClick={resetCycle} disabled={completed === 0 && phase === "work" && !core.running && core.acc === 0}>
          New cycle
        </Btn>
      </div>
    </div>
  );
}

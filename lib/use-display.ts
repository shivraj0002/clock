"use client";
import { useNow } from "@/lib/use-now";
import { useTick } from "@/lib/use-tick";
import { formatDuration, formatHMS } from "@/lib/format";
import { getParts } from "@/lib/time";
import { useSettings } from "@/store/settings";
import { elapsedOf, useTimers } from "@/store/timers";
import { phaseMs, usePomodoro } from "@/store/pomodoro";

export type Display = { label: string; text: string; controls: boolean; running: boolean };

/** Current mode reduced to {label, text} for compact views (mini window). */
export function useDisplay(): Display {
  const { mode, hour12, showSeconds, showMs, timezone } = useSettings();
  const now = useNow();
  const t = useTick(true);
  const sw = useTimers((s) => s.sw);
  const cd = useTimers((s) => s.cd);
  const pomo = usePomodoro();

  if (mode === "stopwatch") {
    const d = formatDuration(elapsedOf(sw, t));
    return { label: "Stopwatch", text: showMs ? `${d.main}.${d.cs}` : d.main, controls: true, running: sw.running };
  }
  if (mode === "timer") {
    return {
      label: cd.finished ? "Time's up" : "Timer",
      text: formatDuration(cd.duration - elapsedOf(cd, t), true).main,
      controls: true,
      running: cd.running,
    };
  }
  if (mode === "pomodoro") {
    const names = { work: "Focus", short: "Short break", long: "Long break" } as const;
    return {
      label: names[pomo.phase],
      text: formatDuration(phaseMs(pomo.phase) - elapsedOf(pomo.core, t), true).main,
      controls: true,
      running: pomo.core.running,
    };
  }
  const c = now ? formatHMS(getParts(now, timezone), hour12, showSeconds) : null;
  return {
    label: mode === "alarm" ? "Alarm" : "Clock",
    text: c ? `${c.text} ${c.suffix}`.trim() : "--:--",
    controls: false,
    running: false,
  };
}

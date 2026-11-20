"use client";
import { useRef } from "react";
import { useWorkerInterval } from "@/lib/use-worker-interval";
import { beep, notifyEnd } from "@/lib/alarm";
import { pad } from "@/lib/format";
import { elapsedOf, useTimers } from "@/store/timers";
import { phaseMs, usePomodoro } from "@/store/pomodoro";
import { useSessions } from "@/store/sessions";
import { useAlarms } from "@/store/alarms";
import { Btn } from "@/components/ui/Btn";

/**
 * Always mounted (independent of the visible mode): detects timer / pomodoro / alarm
 * completion, driven by a worker so it still fires in background tabs.
 */
export function Watchers() {
  const cdRunning = useTimers((s) => s.cd.running);
  const pomoRunning = usePomodoro((s) => s.core.running);
  const alarms = useAlarms((s) => s.alarms);
  const snoozed = useAlarms((s) => s.snoozed);
  const ringing = useAlarms((s) => s.ringing);
  const fired = useRef(new Map<string, string>());

  useWorkerInterval(
    () => {
      const now = performance.now();
      const { cd, cdFinish } = useTimers.getState();
      if (cd.running && elapsedOf(cd, now) >= cd.duration) {
        cdFinish();
        const { task, add } = useSessions.getState();
        add({ kind: "timer", start: Date.now() - cd.duration, durationMs: cd.duration });
        notifyEnd({
          type: "timer",
          label: task,
          durationMs: cd.duration,
          message: task ? `Timer finished: ${task}` : "Timer finished",
        });
      }
      const p = usePomodoro.getState();
      if (p.core.running && elapsedOf(p.core, now) >= phaseMs(p.phase)) p.finish();
    },
    250,
    cdRunning || pomoRunning,
  );

  useWorkerInterval(
    () => {
      const a = useAlarms.getState();
      if (a.ringing) return;
      const d = new Date();
      if (a.snoozed && a.snoozeUntil && Date.now() >= a.snoozeUntil) {
        a.ring(a.snoozed);
        notifyEnd({ type: "alarm", label: a.snoozed.label, message: a.snoozed.label || "Alarm" });
        return;
      }
      const hhmm = `${pad(d.getHours())}:${pad(d.getMinutes())}`;
      const stamp = `${d.toDateString()} ${hhmm}`;
      for (const al of a.alarms) {
        if (!al.enabled || al.time !== hhmm) continue;
        if (al.days.length > 0 && !al.days.includes(d.getDay())) continue;
        if (fired.current.get(al.id) === stamp) continue;
        fired.current.set(al.id, stamp);
        if (al.days.length === 0) a.update(al.id, { enabled: false });
        a.ring(al);
        notifyEnd({ type: "alarm", label: al.label, message: al.label || `Alarm ${al.time}` });
        break;
      }
    },
    1000,
    alarms.some((x) => x.enabled) || !!snoozed,
  );

  // Repeat the beep while an alarm is ringing.
  useWorkerInterval(() => beep(), 3000, !!ringing);

  if (!ringing) return null;
  return (
    <div
      role="alertdialog"
      aria-label="Alarm ringing"
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 p-6 text-center"
      style={{ background: "color-mix(in srgb, var(--bg) 92%, transparent)" }}
    >
      <div
        className="animate-pulse text-6xl font-semibold"
        style={{ color: "var(--accent)", textShadow: "0 0 40px var(--glow)" }}
      >
        {ringing.time}
      </div>
      <div className="text-2xl">{ringing.label || "Alarm"}</div>
      <div className="flex gap-3">
        <Btn big active onClick={() => useAlarms.getState().dismiss()}>
          Dismiss
        </Btn>
        <Btn big onClick={() => useAlarms.getState().snooze(5)}>
          Snooze 5 min
        </Btn>
      </div>
    </div>
  );
}

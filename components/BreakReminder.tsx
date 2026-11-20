"use client";
import { useEffect, useRef, useState } from "react";
import { useSettings } from "@/store/settings";
import { useWorkerInterval } from "@/lib/use-worker-interval";
import { beep, notifyEnd } from "@/lib/alarm";

const MESSAGES = [
  "20-20-20: look at something 20 feet away for 20 seconds.",
  "Stand up and stretch for a minute.",
  "Drink some water.",
  "Relax your shoulders and rest your wrists.",
];

export function BreakReminder() {
  const enabled = useSettings((s) => s.breakReminders);
  const every = useSettings((s) => s.breakEvery);
  const [msg, setMsg] = useState<string | null>(null);
  const i = useRef(0);

  useWorkerInterval(
    () => {
      const m = MESSAGES[i.current++ % MESSAGES.length];
      setMsg(m);
      beep(1);
      notifyEnd({ type: "break", label: "", message: m }, { sound: false });
    },
    Math.max(1, every) * 60_000,
    enabled,
  );

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(null), 20_000);
    return () => clearTimeout(t);
  }, [msg]);

  if (!enabled || !msg) return null;
  return (
    <div
      role="status"
      className="fixed bottom-6 left-1/2 z-40 flex max-w-md -translate-x-1/2 items-center gap-4 rounded-2xl border px-5 py-3 shadow-2xl"
      style={{ background: "var(--bg)", borderColor: "var(--accent)" }}
    >
      <span className="text-sm">{msg}</span>
      <button onClick={() => setMsg(null)} className="text-sm" style={{ color: "var(--accent)" }}>
        Dismiss
      </button>
    </div>
  );
}

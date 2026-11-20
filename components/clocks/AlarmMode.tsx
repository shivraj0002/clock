"use client";
import { useState } from "react";
import { useAlarms } from "@/store/alarms";
import { unlockAudio } from "@/lib/alarm";
import { Btn } from "@/components/ui/Btn";

const DAYS = ["S", "M", "T", "W", "T", "F", "S"];
const border = "color-mix(in srgb, var(--muted) 50%, transparent)";

function DayChips({ days, onChange }: { days: number[]; onChange: (d: number[]) => void }) {
  return (
    <div className="flex gap-1" role="group" aria-label="Repeat days">
      {DAYS.map((d, i) => {
        const on = days.includes(i);
        return (
          <button
            key={i}
            aria-pressed={on}
            onClick={() => onChange(on ? days.filter((x) => x !== i) : [...days, i].sort())}
            className="h-7 w-7 rounded-full border text-xs"
            style={{ borderColor: on ? "var(--accent)" : border, color: on ? "var(--accent)" : "var(--muted)" }}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}

export function AlarmMode() {
  const { alarms, add, update, remove } = useAlarms();
  const [time, setTime] = useState("07:00");
  const [label, setLabel] = useState("");
  const [days, setDays] = useState<number[]>([]);

  return (
    <div className="flex w-full max-w-xl flex-col gap-6">
      <form
        className="flex flex-wrap items-center gap-3 rounded-2xl border p-4"
        style={{ borderColor: border }}
        onSubmit={(e) => {
          e.preventDefault();
          unlockAudio();
          add({ time, label: label.trim(), days });
          setLabel("");
        }}
      >
        <input
          type="time"
          required
          value={time}
          onChange={(e) => setTime(e.target.value)}
          aria-label="Alarm time"
          className="display rounded-lg border bg-transparent px-3 py-1.5 text-2xl"
          style={{ borderColor: border, colorScheme: "dark light" }}
        />
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Label"
          aria-label="Alarm label"
          maxLength={60}
          className="min-w-0 flex-1 rounded-lg border bg-transparent px-3 py-2 text-sm outline-none focus:border-[var(--accent)]"
          style={{ borderColor: border }}
        />
        <DayChips days={days} onChange={setDays} />
        <Btn active type="submit">
          Add alarm
        </Btn>
        <p className="w-full text-xs" style={{ color: "var(--muted)" }}>
          No days selected = rings once. Keep this tab open; it rings even in the background.
        </p>
      </form>

      {alarms.length === 0 && (
        <p className="text-center" style={{ color: "var(--muted)" }}>
          No alarms yet.
        </p>
      )}
      <ul className="flex flex-col gap-3">
        {alarms.map((a) => (
          <li
            key={a.id}
            className="flex flex-wrap items-center gap-3 rounded-2xl border p-3"
            style={{ borderColor: border, opacity: a.enabled ? 1 : 0.5 }}
          >
            <input
              type="time"
              value={a.time}
              onChange={(e) => e.target.value && update(a.id, { time: e.target.value, enabled: true })}
              aria-label="Alarm time"
              className="display rounded-lg border bg-transparent px-2 py-1 text-xl"
              style={{ borderColor: "transparent", colorScheme: "dark light" }}
            />
            <span className="min-w-[8rem] flex-1 truncate text-sm" style={{ color: "var(--muted)" }}>
              {a.label || (a.days.length ? "Repeats" : "Once")}
            </span>
            <DayChips days={a.days} onChange={(d) => update(a.id, { days: d })} />
            <Btn
              active={a.enabled}
              role="switch"
              aria-checked={a.enabled}
              onClick={() => update(a.id, { enabled: !a.enabled })}
            >
              {a.enabled ? "On" : "Off"}
            </Btn>
            <Btn onClick={() => remove(a.id)} aria-label="Delete alarm">
              Delete
            </Btn>
          </li>
        ))}
      </ul>
    </div>
  );
}

"use client";
import { useMemo, useState } from "react";
import { useSettings, CLOCK_STYLES, DIGIT_ANIMS, BACKGROUNDS, FONTS, AUTO_THEMES } from "@/store/settings";
import { useUI } from "@/store/ui";
import { allThemes, hexToRgba, parseThemes, type Theme } from "@/lib/themes";
import { allTimezones, cityName } from "@/lib/time";
import { buildShareUrl } from "@/lib/url-config";
import { download } from "@/lib/stats";
import { Btn } from "@/components/ui/Btn";

const border = "color-mix(in srgb, var(--muted) 50%, transparent)";
const TABS = ["Look", "Clock", "Focus", "More"] as const;

const SHORTCUTS: [string, string][] = [
  ["Space", "Start / pause"],
  ["R", "Reset"],
  ["L", "Lap"],
  ["F", "Fullscreen"],
  ["Z", "Zen mode"],
  ["T", "Next theme"],
  ["M", "Next mode"],
  ["S", "Stats"],
  ["Ctrl/Cmd+K", "Command palette"],
  ["?", "Settings"],
];

function H({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-1 mt-4 text-xs font-semibold uppercase tracking-wider first:mt-0"
      style={{ color: "var(--muted)" }}
    >
      {children}
    </h2>
  );
}

function Toggle({ label, on, onChange }: { label: string; on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className="flex w-full items-center justify-between py-1.5 text-sm"
    >
      <span>{label}</span>
      <span
        className="h-5 w-9 shrink-0 rounded-full p-0.5 transition-colors"
        style={{ background: on ? "var(--accent)" : border }}
      >
        <span
          className="block h-4 w-4 rounded-full transition-transform"
          style={{ background: "var(--bg)", transform: on ? "translateX(16px)" : "none" }}
        />
      </span>
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex items-center justify-between gap-3 py-1.5 text-sm">
      <span>{label}</span>
      {children}
    </label>
  );
}

const inputCls = "rounded-lg border bg-transparent px-2 py-1 text-sm outline-none focus:border-[var(--accent)]";

function Select<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: readonly (T | { v: T; l: string })[];
  onChange: (v: T) => void;
  label?: string;
}) {
  return (
    <select
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className={`${inputCls} max-w-[11rem]`}
      style={{ borderColor: border, background: "var(--bg)", color: "var(--fg)" }}
    >
      {options.map((o) => {
        const v = typeof o === "string" ? o : o.v;
        return (
          <option key={v} value={v}>
            {typeof o === "string" ? o : o.l}
          </option>
        );
      })}
    </select>
  );
}

function Num({
  value,
  min,
  max,
  onChange,
  label,
}: {
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
  label: string;
}) {
  return (
    <input
      type="number"
      aria-label={label}
      min={min}
      max={max}
      value={value}
      className={`${inputCls} w-20`}
      style={{ borderColor: border }}
      onChange={(e) => {
        const v = parseInt(e.target.value, 10);
        if (v >= min && v <= max) onChange(v);
      }}
    />
  );
}

function ThemeEditor() {
  const s = useSettings();
  const [name, setName] = useState("My theme");
  const [c, setC] = useState({ bg: "#101820", fg: "#f2f2f2", muted: "#6b7280", accent: "#f6c453" });
  const [msg, setMsg] = useState("");

  const save = () => {
    const t: Theme = {
      id: `custom-${Date.now().toString(36)}`,
      name: name.trim().slice(0, 24) || "Custom",
      vars: { ...c, glow: hexToRgba(c.accent, 0.4) },
    };
    s.set({ customThemes: [...s.customThemes, t].slice(-20) });
    s.setTheme(t.id);
  };
  const onImport = async (f?: File) => {
    if (!f) return;
    try {
      const themes = parseThemes(JSON.parse(await f.text()));
      if (!themes.length) return setMsg("No valid themes found.");
      s.set({ customThemes: [...s.customThemes, ...themes].slice(-20) });
      setMsg(`Imported ${themes.length}.`);
    } catch {
      setMsg("Invalid JSON file.");
    }
  };

  return (
    <div className="rounded-xl border p-3" style={{ borderColor: border }}>
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        aria-label="Theme name"
        maxLength={24}
        className={`${inputCls} mb-2 w-full`}
        style={{ borderColor: border }}
      />
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        {(["bg", "fg", "muted", "accent"] as const).map((k) => (
          <label key={k} className="flex flex-col items-center gap-1">
            <input
              type="color"
              value={c[k]}
              onChange={(e) => setC({ ...c, [k]: e.target.value })}
              className="h-8 w-full cursor-pointer rounded border-0 bg-transparent p-0"
            />
            {k}
          </label>
        ))}
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <Btn active onClick={save}>
          Save theme
        </Btn>
        <Btn
          disabled={!s.customThemes.length}
          onClick={() =>
            download(
              "clock-themes.json",
              JSON.stringify(
                s.customThemes.map(({ name, vars }) => ({ name, vars })),
                null,
                2,
              ),
              "application/json",
            )
          }
        >
          Export
        </Btn>
        <label className="cursor-pointer rounded-lg border px-3 py-1.5 text-sm" style={{ borderColor: border }}>
          Import
          <input
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              void onImport(e.target.files?.[0]);
              e.target.value = "";
            }}
          />
        </label>
      </div>
      {msg && (
        <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
          {msg}
        </p>
      )}
    </div>
  );
}

function Look() {
  const s = useSettings();
  const themes = allThemes(s.customThemes);
  const ids = themes.map((t) => ({ v: t.id, l: t.name }));
  return (
    <>
      <H>Theme</H>
      <div className="mb-2 grid grid-cols-2 gap-2">
        {themes.map((t) => {
          const sel = s.theme === t.id && s.autoTheme === "off";
          return (
            <div key={t.id} className="relative">
              <button
                onClick={() => s.setTheme(t.id)}
                className="flex w-full items-center gap-2 rounded-lg border px-2 py-1.5 text-left text-sm"
                style={{
                  background: t.vars.bg,
                  color: t.vars.fg,
                  borderColor: sel ? t.vars.accent : "transparent",
                  outline: sel ? `1px solid ${t.vars.accent}` : "none",
                }}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: t.vars.accent }} />
                <span className="truncate">{t.name}</span>
              </button>
              {t.id.startsWith("custom-") && (
                <button
                  aria-label={`Delete ${t.name}`}
                  onClick={() => s.set({ customThemes: s.customThemes.filter((x) => x.id !== t.id) })}
                  className="absolute right-1.5 top-1.5 text-xs"
                  style={{ color: t.vars.muted }}
                >
                  ✕
                </button>
              )}
            </div>
          );
        })}
      </div>
      <Field label="Auto theme">
        <Select
          value={s.autoTheme}
          options={AUTO_THEMES}
          onChange={(v) => s.set({ autoTheme: v })}
          label="Auto theme"
        />
      </Field>
      {s.autoTheme !== "off" && (
        <>
          <Field label="Light theme">
            <Select value={s.lightTheme} options={ids} onChange={(v) => s.set({ lightTheme: v })} label="Light theme" />
          </Field>
          <Field label="Dark theme">
            <Select value={s.darkTheme} options={ids} onChange={(v) => s.set({ darkTheme: v })} label="Dark theme" />
          </Field>
          <p className="text-xs" style={{ color: "var(--muted)" }}>
            {s.autoTheme === "time" ? "Light 07:00–19:00." : "Follows your OS setting."}
          </p>
        </>
      )}
      <H>Custom theme</H>
      <ThemeEditor />
      <H>Appearance</H>
      <Field label="Font">
        <Select value={s.font} options={FONTS} onChange={(v) => s.set({ font: v })} label="Font" />
      </Field>
      <Field label="Background">
        <Select value={s.bg} options={BACKGROUNDS} onChange={(v) => s.set({ bg: v })} label="Background" />
      </Field>
      <Field label="Digit animation">
        <Select
          value={s.digitAnim}
          options={DIGIT_ANIMS}
          onChange={(v) => s.set({ digitAnim: v })}
          label="Digit animation"
        />
      </Field>
      <Toggle label="Animations" on={s.animations} onChange={(v) => s.set({ animations: v })} />
      <H>Screen</H>
      <Field label={`Brightness ${s.dim}%`}>
        <input
          type="range"
          min={20}
          max={100}
          value={s.dim}
          onChange={(e) => s.set({ dim: Number(e.target.value) })}
          aria-label="Brightness"
          className="w-32 accent-[var(--accent)]"
        />
      </Field>
      <Toggle label="Auto-dim at night (22:00–06:00)" on={s.autoDim} onChange={(v) => s.set({ autoDim: v })} />
      <Toggle label="Burn-in protection (pixel shift)" on={s.burnIn} onChange={(v) => s.set({ burnIn: v })} />
    </>
  );
}

function ClockTab() {
  const s = useSettings();
  const zones = useMemo(() => allTimezones(), []);
  const [add, setAdd] = useState("");
  const tzOpts = [{ v: "", l: "Local time" }, ...zones.map((z) => ({ v: z, l: z }))];
  return (
    <>
      <H>Face</H>
      <Field label="Style">
        <Select
          value={s.clockStyle}
          options={CLOCK_STYLES}
          onChange={(v) => s.set({ clockStyle: v })}
          label="Clock style"
        />
      </Field>
      <Toggle label="12-hour format" on={s.hour12} onChange={(v) => s.set({ hour12: v })} />
      <Toggle label="Show seconds" on={s.showSeconds} onChange={(v) => s.set({ showSeconds: v })} />
      <Toggle label="Stopwatch milliseconds" on={s.showMs} onChange={(v) => s.set({ showMs: v })} />
      <Toggle label="Show date" on={s.showDate} onChange={(v) => s.set({ showDate: v })} />
      <H>Time zone</H>
      <Field label="Main clock">
        <Select value={s.timezone} options={tzOpts} onChange={(v) => s.set({ timezone: v })} label="Time zone" />
      </Field>
      <H>Extra zones</H>
      <div className="flex flex-wrap gap-2 pb-2">
        {s.zones.map((z) => (
          <button
            key={z}
            onClick={() => s.set({ zones: s.zones.filter((x) => x !== z) })}
            className="rounded-full border px-2 py-0.5 text-xs"
            style={{ borderColor: border }}
            aria-label={`Remove ${cityName(z)}`}
          >
            {cityName(z)} ✕
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Select
          value={add}
          options={[{ v: "", l: "Add a zone…" }, ...zones.map((z) => ({ v: z, l: z }))]}
          onChange={setAdd}
          label="Add time zone"
        />
        <Btn
          disabled={!add || s.zones.includes(add) || s.zones.length >= 6}
          onClick={() => {
            s.set({ zones: [...s.zones, add] });
            setAdd("");
          }}
        >
          Add
        </Btn>
      </div>
    </>
  );
}

function Focus() {
  const s = useSettings();
  return (
    <>
      <H>Session</H>
      <Toggle label="Keep screen awake" on={s.wakeLock} onChange={(v) => s.set({ wakeLock: v })} />
      <Toggle label="Auto-hide controls (fullscreen)" on={s.autoHide} onChange={(v) => s.set({ autoHide: v })} />
      <Toggle label="Break reminders" on={s.breakReminders} onChange={(v) => s.set({ breakReminders: v })} />
      {s.breakReminders && (
        <Field label="Every (minutes)">
          <Num
            value={s.breakEvery}
            min={1}
            max={180}
            onChange={(v) => s.set({ breakEvery: v })}
            label="Break interval minutes"
          />
        </Field>
      )}
      <H>Pomodoro</H>
      <Field label="Focus (min)">
        <Num value={s.pomoWork} min={1} max={180} onChange={(v) => s.set({ pomoWork: v })} label="Focus minutes" />
      </Field>
      <Field label="Short break (min)">
        <Num
          value={s.pomoShort}
          min={1}
          max={60}
          onChange={(v) => s.set({ pomoShort: v })}
          label="Short break minutes"
        />
      </Field>
      <Field label="Long break (min)">
        <Num value={s.pomoLong} min={1} max={120} onChange={(v) => s.set({ pomoLong: v })} label="Long break minutes" />
      </Field>
      <Field label="Long break every">
        <Num
          value={s.pomoEvery}
          min={2}
          max={12}
          onChange={(v) => s.set({ pomoEvery: v })}
          label="Sessions before long break"
        />
      </Field>
      <Toggle label="Auto-start next phase" on={s.pomoAuto} onChange={(v) => s.set({ pomoAuto: v })} />
      <H>Integrations</H>
      <Field label="Webhook URL">
        <input
          type="url"
          placeholder="https://…"
          value={s.webhookUrl}
          onChange={(e) => s.set({ webhookUrl: e.target.value })}
          className={`${inputCls} w-44`}
          style={{ borderColor: border }}
        />
      </Field>
      <p className="text-xs" style={{ color: "var(--muted)" }}>
        On timer / pomodoro / alarm end, a JSON body is POSTed (as text/plain, no CORS preflight) and also sent via{" "}
        <code>window.postMessage</code>.
      </p>
    </>
  );
}

function More() {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <H>Share</H>
      <Btn
        onClick={() =>
          void navigator.clipboard?.writeText(buildShareUrl()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          })
        }
      >
        {copied ? "Copied!" : "Copy share link"}
      </Btn>
      <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
        URL params: m, theme, style, anim, bg, font, tz, h12, sec, date, min, task, zen, start.
      </p>
      <H>Shortcuts</H>
      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-sm">
        {SHORTCUTS.map(([k, d]) => (
          <div key={k} className="contents">
            <dt>
              <kbd className="rounded border px-1.5 font-mono text-xs" style={{ borderColor: "var(--muted)" }}>
                {k}
              </kbd>
            </dt>
            <dd style={{ color: "var(--muted)" }}>{d}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}

export function SettingsPanel() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Look");
  const close = () => useUI.getState().setKey("settingsOpen", false);
  return (
    <>
      <button aria-label="Close settings" className="fixed inset-0 z-20 cursor-default" onClick={close} />
      <aside
        role="dialog"
        aria-label="Settings"
        className="fixed right-4 top-16 z-30 flex max-h-[80vh] w-[22rem] max-w-[calc(100vw-2rem)] flex-col rounded-2xl border shadow-2xl"
        style={{ background: "var(--bg)", borderColor: border }}
      >
        <div role="tablist" className="flex gap-1 border-b p-2" style={{ borderColor: border }}>
          {TABS.map((t) => (
            <Btn
              key={t}
              role="tab"
              aria-selected={tab === t}
              active={tab === t}
              onClick={() => setTab(t)}
              className="flex-1"
            >
              {t}
            </Btn>
          ))}
        </div>
        <div className="overflow-y-auto p-4">
          {tab === "Look" && <Look />}
          {tab === "Clock" && <ClockTab />}
          {tab === "Focus" && <Focus />}
          {tab === "More" && <More />}
        </div>
      </aside>
    </>
  );
}

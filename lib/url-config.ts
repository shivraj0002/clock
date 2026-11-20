import {
  useSettings,
  MODES,
  CLOCK_STYLES,
  DIGIT_ANIMS,
  BACKGROUNDS,
  FONTS,
  type Values,
  type Mode,
} from "@/store/settings";
import { THEMES } from "@/lib/themes";
import { validTz } from "@/lib/time";
import { useTimers } from "@/store/timers";
import { useSessions } from "@/store/sessions";
import { useUI } from "@/store/ui";
import { toggleCurrent } from "@/lib/actions";

export type Parsed = { patch: Partial<Values>; task?: string; minutes?: number; zen?: boolean; start?: boolean };

const bool = (v: string | null) => (v === "1" || v === "true" ? true : v === "0" || v === "false" ? false : undefined);

/** Pure: query string -> validated config. Unknown/invalid values are ignored. */
export function parseQuery(search: string, customIds: string[] = []): Parsed {
  const q = new URLSearchParams(search);
  const patch: Partial<Values> = {};
  const pick = <T extends string>(k: string, list: readonly T[]): T | undefined => {
    const v = q.get(k);
    return v && (list as readonly string[]).includes(v) ? (v as T) : undefined;
  };

  const mode = pick(
    "m",
    MODES.map((m) => m.id),
  );
  if (mode) patch.mode = mode;
  const theme = q.get("theme");
  if (theme && (THEMES.some((t) => t.id === theme) || customIds.includes(theme))) {
    patch.theme = theme;
    patch.autoTheme = "off";
  }
  const style = pick("style", CLOCK_STYLES);
  if (style) patch.clockStyle = style;
  const anim = pick("anim", DIGIT_ANIMS);
  if (anim) patch.digitAnim = anim;
  const bg = pick("bg", BACKGROUNDS);
  if (bg) patch.bg = bg;
  const font = pick("font", FONTS);
  if (font) patch.font = font;
  const tz = q.get("tz");
  if (tz && validTz(tz)) patch.timezone = tz;
  const h12 = bool(q.get("h12"));
  if (h12 !== undefined) patch.hour12 = h12;
  const sec = bool(q.get("sec"));
  if (sec !== undefined) patch.showSeconds = sec;
  const date = bool(q.get("date"));
  if (date !== undefined) patch.showDate = date;

  const min = parseFloat(q.get("min") ?? "");
  const task = q.get("task")?.slice(0, 80);
  return {
    patch,
    task: task || undefined,
    minutes: min > 0 && min <= 1440 ? min : undefined,
    zen: bool(q.get("zen")) || undefined,
    start: bool(q.get("start")) || undefined,
  };
}

export function applyUrlConfig(search = window.location.search) {
  if (!search) return;
  const customIds = useSettings.getState().customThemes.map((t) => t.id);
  const { patch, task, minutes, zen, start } = parseQuery(search, customIds);
  useSettings.getState().set(patch);
  if (task) useSessions.getState().setTask(task);
  if (minutes) useTimers.getState().cdSet(Math.round(minutes * 60_000));
  if (zen) useUI.getState().setKey("zen", true);
  if (start) toggleCurrent();
}

/** Current config as a shareable URL. */
export function buildShareUrl(): string {
  const s = useSettings.getState();
  const q = new URLSearchParams({
    m: s.mode,
    theme: s.theme,
    style: s.clockStyle,
    anim: s.digitAnim,
    bg: s.bg,
    font: s.font,
    h12: s.hour12 ? "1" : "0",
    sec: s.showSeconds ? "1" : "0",
    date: s.showDate ? "1" : "0",
  });
  if (s.timezone) q.set("tz", s.timezone);
  if ((s.mode as Mode) === "timer") q.set("min", String(useTimers.getState().cd.duration / 60_000));
  const task = useSessions.getState().task;
  if (task) q.set("task", task);
  return `${window.location.origin}${window.location.pathname}?${q}`;
}

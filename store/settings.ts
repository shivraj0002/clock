import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Theme } from "@/lib/themes";

export type Mode = "clock" | "stopwatch" | "timer" | "pomodoro" | "alarm";
export const MODES: { id: Mode; label: string }[] = [
  { id: "clock", label: "Clock" },
  { id: "stopwatch", label: "Stopwatch" },
  { id: "timer", label: "Timer" },
  { id: "pomodoro", label: "Pomodoro" },
  { id: "alarm", label: "Alarm" },
];

export const CLOCK_STYLES = ["digital", "analog", "binary", "word"] as const;
export const DIGIT_ANIMS = ["none", "fade", "slide", "roll", "flip"] as const;
export const BACKGROUNDS = ["none", "gradient", "aurora", "grid", "stars", "particles", "rain"] as const;
export const FONTS = ["geist", "jetbrains", "orbitron", "led"] as const;
export const AUTO_THEMES = ["off", "system", "time"] as const;

export type ClockStyle = (typeof CLOCK_STYLES)[number];
export type DigitAnim = (typeof DIGIT_ANIMS)[number];
export type Background = (typeof BACKGROUNDS)[number];
export type FontId = (typeof FONTS)[number];
export type AutoTheme = (typeof AUTO_THEMES)[number];

export type Values = {
  mode: Mode;
  theme: string;
  autoTheme: AutoTheme;
  lightTheme: string;
  darkTheme: string;
  customThemes: Theme[];
  hour12: boolean;
  showSeconds: boolean;
  showMs: boolean; // stopwatch milliseconds
  showDate: boolean;
  animations: boolean;
  wakeLock: boolean;
  autoHide: boolean;
  clockStyle: ClockStyle;
  digitAnim: DigitAnim;
  bg: Background;
  font: FontId;
  timezone: string; // "" = local
  zones: string[];
  burnIn: boolean;
  dim: number; // 20..100 (% brightness)
  autoDim: boolean;
  breakReminders: boolean;
  breakEvery: number; // minutes
  pomoWork: number;
  pomoShort: number;
  pomoLong: number;
  pomoEvery: number;
  pomoAuto: boolean;
  webhookUrl: string;
};

export type Settings = Values & {
  set: (patch: Partial<Values>) => void;
  /** Manual theme pick also turns auto-theme off. */
  setTheme: (id: string) => void;
};

export const DEFAULTS: Values = {
  mode: "clock",
  theme: "dark",
  autoTheme: "off",
  lightTheme: "light",
  darkTheme: "dark",
  customThemes: [],
  hour12: false,
  showSeconds: true,
  showMs: false,
  showDate: true,
  animations: true,
  wakeLock: true,
  autoHide: true,
  clockStyle: "digital",
  digitAnim: "slide",
  bg: "none",
  font: "geist",
  timezone: "",
  zones: [],
  burnIn: false,
  dim: 100,
  autoDim: false,
  breakReminders: false,
  breakEvery: 20,
  pomoWork: 25,
  pomoShort: 5,
  pomoLong: 15,
  pomoEvery: 4,
  pomoAuto: false,
  webhookUrl: "",
};

export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      set: (patch) => set(patch),
      setTheme: (id) => set({ theme: id, autoTheme: "off" }),
    }),
    { name: "clock-settings", skipHydration: true },
  ),
);

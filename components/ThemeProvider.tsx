"use client";
import { useEffect, useSyncExternalStore } from "react";
import { useSettings } from "@/store/settings";
import { useSessions } from "@/store/sessions";
import { useAlarms } from "@/store/alarms";
import { getTheme } from "@/lib/themes";
import { useHour } from "@/lib/use-hour";
import { applyUrlConfig } from "@/lib/url-config";

const MQ = "(prefers-color-scheme: light)";
const subLight = (cb: () => void) => {
  const mq = window.matchMedia(MQ);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, autoTheme, lightTheme, darkTheme, customThemes, animations, font } = useSettings();
  const systemLight = useSyncExternalStore(
    subLight,
    () => window.matchMedia(MQ).matches,
    () => false,
  );
  const hour = useHour();

  useEffect(() => {
    void (async () => {
      await Promise.all([
        useSettings.persist.rehydrate(),
        useSessions.persist.rehydrate(),
        useAlarms.persist.rehydrate(),
      ]);
      applyUrlConfig();
    })();
  }, []);

  const light = autoTheme === "system" ? systemLight : hour >= 7 && hour < 19;
  const effective = autoTheme === "off" ? theme : light ? lightTheme : darkTheme;

  useEffect(() => {
    const { vars } = getTheme(effective, customThemes);
    const el = document.documentElement;
    el.style.setProperty("--bg", vars.bg);
    el.style.setProperty("--fg", vars.fg);
    el.style.setProperty("--muted", vars.muted);
    el.style.setProperty("--accent", vars.accent);
    el.style.setProperty("--glow", vars.glow);
    el.dataset.theme = effective;
    el.dataset.anim = animations ? "on" : "off";
    el.dataset.font = font;
  }, [effective, customThemes, animations, font]);

  return <>{children}</>;
}

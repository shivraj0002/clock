"use client";
import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MODES, useSettings } from "@/store/settings";
import { useSessions } from "@/store/sessions";
import { useUI } from "@/store/ui";
import { allThemes } from "@/lib/themes";
import { useFullscreen } from "@/lib/use-fullscreen";
import { useIdle } from "@/lib/use-idle";
import { useWakeLock } from "@/lib/use-wake-lock";
import { useBrightness, usePixelShift } from "@/lib/use-burnin";
import { lapCurrent, resetCurrent, toggleCurrent } from "@/lib/actions";
import { Btn } from "@/components/ui/Btn";
import { Background } from "@/components/Background";
import { SettingsPanel } from "@/components/SettingsPanel";
import { StatsPanel } from "@/components/StatsPanel";
import { CommandPalette } from "@/components/CommandPalette";
import { MiniWindow, usePipSupported } from "@/components/MiniWindow";
import { BreakReminder } from "@/components/BreakReminder";
import { Watchers } from "@/components/Watchers";
import { Clock } from "@/components/clocks/Clock";
import { Stopwatch } from "@/components/clocks/Stopwatch";
import { Timer } from "@/components/clocks/Timer";
import { Pomodoro } from "@/components/clocks/Pomodoro";
import { AlarmMode } from "@/components/clocks/AlarmMode";

export function Shell() {
  const mode = useSettings((s) => s.mode);
  const autoHide = useSettings((s) => s.autoHide);
  const wakeLock = useSettings((s) => s.wakeLock);
  const animations = useSettings((s) => s.animations);
  const burnIn = useSettings((s) => s.burnIn);
  const dim = useSettings((s) => s.dim);
  const autoDim = useSettings((s) => s.autoDim);
  const { settingsOpen, statsOpen, paletteOpen, zen, pip } = useUI();
  const task = useSessions((s) => s.task);
  const { isFullscreen, toggle: toggleFs } = useFullscreen();
  const pipOk = usePipSupported();
  const idle = useIdle(3000);
  const shift = usePixelShift(burnIn);
  const brightness = useBrightness(dim, autoDim);
  useWakeLock(wakeLock);

  const panelOpen = settingsOpen || statsOpen || paletteOpen;
  const hidden = idle && !panelOpen && (zen || (isFullscreen && autoHide));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const ui = useUI.getState();
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        ui.toggle("paletteOpen");
        return;
      }
      if (e.key === "Escape") {
        ui.setKey("settingsOpen", false);
        ui.setKey("statsOpen", false);
        ui.setKey("paletteOpen", false);
        return;
      }
      const t = e.target as HTMLElement;
      if (t.closest("input, textarea, select, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
      const s = useSettings.getState();
      switch (e.key.toLowerCase()) {
        case " ":
          e.preventDefault();
          (document.activeElement as HTMLElement | null)?.blur();
          toggleCurrent();
          break;
        case "r":
          resetCurrent();
          break;
        case "l":
          lapCurrent();
          break;
        case "f":
          toggleFs();
          break;
        case "z":
          ui.toggle("zen");
          break;
        case "s":
          ui.toggle("statsOpen");
          break;
        case "t": {
          const list = allThemes(s.customThemes);
          const i = list.findIndex((x) => x.id === s.theme);
          s.setTheme(list[(i + 1) % list.length].id);
          break;
        }
        case "m": {
          const i = MODES.findIndex((x) => x.id === s.mode);
          s.set({ mode: MODES[(i + 1) % MODES.length].id });
          break;
        }
        case "?":
          ui.toggle("settingsOpen");
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFs]);

  return (
    <div
      data-hidden={hidden}
      className="relative flex min-h-screen flex-col"
      style={{ cursor: hidden ? "none" : undefined }}
    >
      <Background />
      <Watchers />
      <BreakReminder />
      <MiniWindow />

      <header className="chrome relative z-10 flex flex-wrap items-center justify-between gap-2 p-4">
        <nav className="flex flex-wrap gap-1" aria-label="Mode">
          {MODES.map((m) => (
            <Btn
              key={m.id}
              active={mode === m.id}
              aria-current={mode === m.id}
              onClick={() => useSettings.getState().set({ mode: m.id })}
            >
              {m.label}
            </Btn>
          ))}
        </nav>
        <div className="flex flex-wrap gap-1">
          <Btn onClick={() => useUI.getState().toggle("paletteOpen")} title="Command palette (Ctrl/Cmd+K)">
            ⌘K
          </Btn>
          {pipOk && (
            <Btn active={pip} onClick={() => useUI.getState().toggle("pip")} title="Always-on-top mini window">
              Mini
            </Btn>
          )}
          <Btn active={zen} onClick={() => useUI.getState().toggle("zen")} title="Zen mode (Z)">
            Zen
          </Btn>
          <Btn active={statsOpen} onClick={() => useUI.getState().toggle("statsOpen")} title="Stats (S)">
            Stats
          </Btn>
          <Btn active={isFullscreen} onClick={toggleFs} title="Fullscreen (F)">
            {isFullscreen ? "Exit full" : "Fullscreen"}
          </Btn>
          <Btn active={settingsOpen} onClick={() => useUI.getState().toggle("settingsOpen")} title="Settings (?)">
            Settings
          </Btn>
        </div>
      </header>

      <main
        className="relative z-10 flex flex-1 items-center justify-center p-6"
        style={{ transform: `translate(${shift.x}px, ${shift.y}px)`, transition: "transform 3s ease" }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            className="flex w-full justify-center"
            initial={{ opacity: 0, y: animations ? 12 : 0 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: animations ? -12 : 0 }}
            transition={{ duration: animations ? 0.2 : 0 }}
          >
            {mode === "clock" && <Clock />}
            {mode === "stopwatch" && <Stopwatch />}
            {mode === "timer" && <Timer />}
            {mode === "pomodoro" && <Pomodoro />}
            {mode === "alarm" && <AlarmMode />}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="chrome relative z-10 flex flex-col items-center gap-2 p-4">
        <input
          value={task}
          onChange={(e) => useSessions.getState().setTask(e.target.value)}
          placeholder="What are you working on?"
          aria-label="Current task"
          maxLength={80}
          className="w-full max-w-sm rounded-lg border bg-transparent px-3 py-1.5 text-center text-sm outline-none focus:border-[var(--accent)]"
          style={{ borderColor: "color-mix(in srgb, var(--muted) 40%, transparent)" }}
        />
        <span className="text-xs" style={{ color: "var(--muted)" }}>
          Press <kbd>?</kbd> for settings · <kbd>Ctrl/Cmd+K</kbd> for commands
        </span>
      </footer>

      {settingsOpen && <SettingsPanel />}
      {statsOpen && <StatsPanel />}
      <CommandPalette />
      {brightness < 1 && (
        <div
          aria-hidden
          className="pointer-events-none fixed inset-0 z-[60]"
          style={{ background: "#000", opacity: 1 - brightness }}
        />
      )}
    </div>
  );
}

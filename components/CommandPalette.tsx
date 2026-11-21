"use client";
import { Command } from "cmdk";
import { useSettings, MODES, CLOCK_STYLES, DIGIT_ANIMS, BACKGROUNDS, FONTS } from "@/store/settings";
import { useTimers } from "@/store/timers";
import { useUI } from "@/store/ui";
import { allThemes } from "@/lib/themes";
import { toggleFullscreen } from "@/lib/use-fullscreen";
import { resetCurrent, toggleCurrent } from "@/lib/actions";
import { buildShareUrl } from "@/lib/url-config";
import { usePipSupported } from "@/components/MiniWindow";

function Item({ label, fn, hint }: { label: string; fn: () => void; hint?: string }) {
  return (
    <Command.Item
      value={label}
      onSelect={() => {
        useUI.getState().setKey("paletteOpen", false);
        fn();
      }}
    >
      <span>{label}</span>
      {hint && <span style={{ color: "var(--muted)" }}>{hint}</span>}
    </Command.Item>
  );
}

export function CommandPalette() {
  const open = useUI((s) => s.paletteOpen);
  const pipOk = usePipSupported();
  const s = useSettings();
  if (!open) return null;

  const close = () => useUI.getState().setKey("paletteOpen", false);
  const ui = useUI.getState();

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[15vh]"
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      <button
        aria-label="Close palette"
        className="absolute inset-0 cursor-default"
        style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)" }}
        onClick={close}
      />
      <div
        className="relative w-full max-w-lg overflow-hidden rounded-2xl border shadow-2xl"
        style={{ background: "var(--bg)", borderColor: "color-mix(in srgb, var(--muted) 50%, transparent)" }}
      >
        <Command label="Command palette" loop>
          <Command.Input autoFocus placeholder="Type a command…" />
          <Command.List>
            <Command.Empty>No results.</Command.Empty>
            <Command.Group heading="Actions">
              <Item label="Start / pause" hint="Space" fn={toggleCurrent} />
              <Item label="Reset" hint="R" fn={resetCurrent} />
              <Item
                label="Toggle fullscreen"
                hint="F"
                fn={() => !toggleFullscreen() && useUI.getState().setKey("hint", true)}
              />
              <Item label="Toggle zen mode" hint="Z" fn={() => ui.toggle("zen")} />
              {pipOk && <Item label="Open mini window" fn={() => ui.toggle("pip")} />}
              <Item label="Open settings" hint="?" fn={() => ui.setKey("settingsOpen", true)} />
              <Item label="Open stats" hint="S" fn={() => ui.setKey("statsOpen", true)} />
              <Item label="Copy share link" fn={() => void navigator.clipboard?.writeText(buildShareUrl())} />
              <Item
                label={`Keep screen awake: ${s.wakeLock ? "turn off" : "turn on"}`}
                fn={() => s.set({ wakeLock: !s.wakeLock })}
              />
              <Item
                label={`12-hour format: ${s.hour12 ? "turn off" : "turn on"}`}
                fn={() => s.set({ hour12: !s.hour12 })}
              />
              <Item
                label={`Stopwatch milliseconds: ${s.showMs ? "hide" : "show"}`}
                fn={() => s.set({ showMs: !s.showMs })}
              />
              <Item
                label={`Seconds: ${s.showSeconds ? "hide" : "show"}`}
                fn={() => s.set({ showSeconds: !s.showSeconds })}
              />
            </Command.Group>
            <Command.Group heading="Mode">
              {MODES.map((m) => (
                <Item key={m.id} label={`Mode: ${m.label}`} fn={() => s.set({ mode: m.id })} />
              ))}
            </Command.Group>
            <Command.Group heading="Timer">
              {[5, 10, 25, 50, 90].map((m) => (
                <Item
                  key={m}
                  label={`Timer: ${m} minutes`}
                  fn={() => {
                    useTimers.getState().cdSet(m * 60_000);
                    s.set({ mode: "timer" });
                  }}
                />
              ))}
            </Command.Group>
            <Command.Group heading="Theme">
              {allThemes(s.customThemes).map((t) => (
                <Item key={t.id} label={`Theme: ${t.name}`} fn={() => s.setTheme(t.id)} />
              ))}
            </Command.Group>
            <Command.Group heading="Clock style">
              {CLOCK_STYLES.map((c) => (
                <Item key={c} label={`Clock style: ${c}`} fn={() => s.set({ clockStyle: c, mode: "clock" })} />
              ))}
              {DIGIT_ANIMS.map((c) => (
                <Item key={c} label={`Digit animation: ${c}`} fn={() => s.set({ digitAnim: c })} />
              ))}
              {FONTS.map((c) => (
                <Item key={c} label={`Font: ${c}`} fn={() => s.set({ font: c })} />
              ))}
            </Command.Group>
            <Command.Group heading="Background">
              {BACKGROUNDS.map((c) => (
                <Item key={c} label={`Background: ${c}`} fn={() => s.set({ bg: c })} />
              ))}
            </Command.Group>
          </Command.List>
        </Command>
      </div>
    </div>
  );
}

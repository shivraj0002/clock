import { create } from "zustand";
import { unlockAudio, notifyEnd } from "@/lib/alarm";
import { useSettings } from "@/store/settings";
import { useSessions } from "@/store/sessions";
import { type Core, idleCore, startCore, pauseCore } from "@/store/timers";

export type Phase = "work" | "short" | "long";

export const phaseMs = (p: Phase): number => {
  const s = useSettings.getState();
  return (p === "work" ? s.pomoWork : p === "short" ? s.pomoShort : s.pomoLong) * 60_000;
};

type P = {
  phase: Phase;
  core: Core;
  completed: number; // focus sessions finished this cycle
  toggle: () => void;
  reset: () => void;
  resetCycle: () => void;
  skip: () => void;
  finish: () => void;
};

const nextPhase = (phase: Phase, completed: number, every: number): Phase =>
  phase === "work" ? (completed % every === 0 ? "long" : "short") : "work";

export const usePomodoro = create<P>()((set, get) => ({
  phase: "work",
  core: idleCore,
  completed: 0,
  toggle: () => {
    unlockAudio();
    set((s) => ({ core: s.core.running ? pauseCore(s.core) : startCore(s.core) }));
  },
  reset: () => set({ core: idleCore }),
  resetCycle: () => set({ phase: "work", completed: 0, core: idleCore }),
  skip: () => {
    const { phase, completed } = get();
    const c = phase === "work" ? completed + 1 : completed;
    set({ phase: nextPhase(phase, c, useSettings.getState().pomoEvery), completed: c, core: idleCore });
  },
  finish: () => {
    const { phase, completed } = get();
    const st = useSettings.getState();
    const dur = phaseMs(phase);
    const { task } = useSessions.getState();
    const c = phase === "work" ? completed + 1 : completed;
    const next = nextPhase(phase, c, st.pomoEvery);
    if (phase === "work") useSessions.getState().add({ kind: "focus", start: Date.now() - dur, durationMs: dur });
    set({ phase: next, completed: c, core: st.pomoAuto ? startCore(idleCore) : idleCore });
    notifyEnd({
      type: "pomodoro",
      label: task,
      durationMs: dur,
      message:
        phase === "work"
          ? `Focus done. Time for a ${next === "long" ? "long" : "short"} break.`
          : "Break over. Back to focus.",
    });
  },
}));

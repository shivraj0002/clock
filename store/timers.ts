import { create } from "zustand";
import { unlockAudio } from "@/lib/alarm";
import { useSessions } from "@/store/sessions";

/** Timestamp-based core: elapsed = acc + (now - startedAt). No drift from tick jitter. */
export type Core = { running: boolean; startedAt: number; acc: number };
export const elapsedOf = (c: Core, now: number) => c.acc + (c.running ? Math.max(0, now - c.startedAt) : 0);

export const idleCore: Core = { running: false, startedAt: 0, acc: 0 };
export const startCore = (c: Core): Core => (c.running ? c : { ...c, running: true, startedAt: performance.now() });
export const pauseCore = (c: Core): Core =>
  c.running ? { running: false, startedAt: 0, acc: elapsedOf(c, performance.now()) } : c;

type Timers = {
  sw: Core;
  laps: number[];
  swToggle: () => void;
  swReset: () => void;
  swLap: () => void;

  cd: Core & { duration: number; finished: boolean };
  cdSet: (ms: number) => void;
  cdToggle: () => void;
  cdReset: () => void;
  cdFinish: () => void;
};

export const useTimers = create<Timers>()((set, get) => ({
  sw: idleCore,
  laps: [],
  swToggle: () => set((s) => ({ sw: s.sw.running ? pauseCore(s.sw) : startCore(s.sw) })),
  swReset: () => {
    const ms = elapsedOf(get().sw, performance.now());
    if (ms >= 1000) useSessions.getState().add({ kind: "stopwatch", start: Date.now() - ms, durationMs: ms });
    set({ sw: idleCore, laps: [] });
  },
  swLap: () => {
    const { sw, laps } = get();
    if (sw.running) set({ laps: [...laps, elapsedOf(sw, performance.now())] });
  },

  cd: { ...idleCore, duration: 25 * 60_000, finished: false },
  cdSet: (ms) => set({ cd: { ...idleCore, duration: ms, finished: false } }),
  cdToggle: () => {
    unlockAudio();
    set((s) => {
      const { cd } = s;
      if (cd.running) return { cd: { ...cd, ...pauseCore(cd) } };
      if (cd.duration <= 0) return s;
      const fresh = cd.finished ? { ...cd, ...idleCore, finished: false } : cd;
      return { cd: { ...fresh, ...startCore(fresh) } };
    });
  },
  cdReset: () => set((s) => ({ cd: { ...idleCore, duration: s.cd.duration, finished: false } })),
  cdFinish: () => set((s) => ({ cd: { ...s.cd, running: false, startedAt: 0, acc: s.cd.duration, finished: true } })),
}));

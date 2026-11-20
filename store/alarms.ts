import { create } from "zustand";
import { persist } from "zustand/middleware";

export type AlarmItem = {
  id: string;
  time: string; // "HH:MM" 24h
  label: string;
  days: number[]; // 0=Sun..6=Sat; empty = one-shot
  enabled: boolean;
};

type A = {
  alarms: AlarmItem[];
  ringing: AlarmItem | null;
  snoozed: AlarmItem | null;
  snoozeUntil: number;
  add: (a: Omit<AlarmItem, "id" | "enabled">) => void;
  update: (id: string, patch: Partial<AlarmItem>) => void;
  remove: (id: string) => void;
  ring: (a: AlarmItem) => void;
  dismiss: () => void;
  snooze: (minutes: number) => void;
};

export const useAlarms = create<A>()(
  persist(
    (set, get) => ({
      alarms: [],
      ringing: null,
      snoozed: null,
      snoozeUntil: 0,
      add: (a) =>
        set((s) => ({
          alarms: [
            ...s.alarms,
            { ...a, id: `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`, enabled: true },
          ],
        })),
      update: (id, patch) => set((s) => ({ alarms: s.alarms.map((x) => (x.id === id ? { ...x, ...patch } : x)) })),
      remove: (id) => set((s) => ({ alarms: s.alarms.filter((x) => x.id !== id) })),
      ring: (a) => set({ ringing: a, snoozed: null, snoozeUntil: 0 }),
      dismiss: () => set({ ringing: null }),
      snooze: (minutes) => {
        const { ringing } = get();
        set({ ringing: null, snoozed: ringing, snoozeUntil: ringing ? Date.now() + minutes * 60_000 : 0 });
      },
    }),
    { name: "clock-alarms", skipHydration: true, partialize: (s) => ({ alarms: s.alarms }) as A },
  ),
);

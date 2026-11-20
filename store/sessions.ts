import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Entry = {
  id: string;
  task: string;
  kind: "focus" | "timer" | "stopwatch";
  start: number; // epoch ms
  durationMs: number;
};

type S = {
  task: string;
  entries: Entry[];
  setTask: (t: string) => void;
  add: (e: Omit<Entry, "id" | "task"> & { task?: string }) => void;
  clear: () => void;
};

const MAX = 5000;
const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

export const useSessions = create<S>()(
  persist(
    (set, get) => ({
      task: "",
      entries: [],
      setTask: (task) => set({ task }),
      add: (e) =>
        set((s) => ({
          entries: [...s.entries, { ...e, id: uid(), task: e.task ?? get().task }].slice(-MAX),
        })),
      clear: () => set({ entries: [] }),
    }),
    { name: "clock-sessions", skipHydration: true },
  ),
);

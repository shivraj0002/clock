import { create } from "zustand";

type Key = "settingsOpen" | "statsOpen" | "paletteOpen" | "zen" | "pip";

type UI = Record<Key, boolean> & {
  toggle: (k: Key) => void;
  setKey: (k: Key, v: boolean) => void;
};

/** Transient UI state (never persisted). */
export const useUI = create<UI>()((set) => ({
  settingsOpen: false,
  statsOpen: false,
  paletteOpen: false,
  zen: false,
  pip: false,
  toggle: (k) => set((s) => ({ [k]: !s[k] }) as Pick<UI, Key>),
  setKey: (k, v) => set({ [k]: v } as Pick<UI, Key>),
}));

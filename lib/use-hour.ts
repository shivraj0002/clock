"use client";
import { useSyncExternalStore } from "react";

const subscribe = (cb: () => void) => {
  const t = setInterval(cb, 60_000);
  return () => clearInterval(t);
};

/** Local hour (0-23), refreshed each minute. Server snapshot is noon. */
export const useHour = () =>
  useSyncExternalStore(
    subscribe,
    () => new Date().getHours(),
    () => 12,
  );

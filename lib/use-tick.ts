"use client";
import { useState } from "react";
import { useWorkerInterval } from "./use-worker-interval";

/** performance.now(), refreshed every `ms` (default 50) from a worker while `active`. */
export function useTick(active: boolean, ms = 50): number {
  const [now, setNow] = useState(() => performance.now());
  useWorkerInterval(() => setNow(performance.now()), ms, active);
  return now;
}

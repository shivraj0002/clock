"use client";
import { useEffect, useRef } from "react";

/** Calls `cb` every `ms` from a Web Worker (not throttled in background tabs). */
export function useWorkerInterval(cb: () => void, ms: number, active = true) {
  const ref = useRef(cb);
  useEffect(() => {
    ref.current = cb;
  });
  useEffect(() => {
    if (!active) return;
    const w = new Worker(new URL("./ticker.worker.ts", import.meta.url));
    w.onmessage = () => ref.current();
    w.postMessage(ms);
    return () => {
      w.postMessage("stop");
      w.terminate();
    };
  }, [ms, active]);
}

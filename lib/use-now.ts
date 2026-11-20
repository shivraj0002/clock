"use client";
import { useEffect, useState } from "react";

/** Current Date, null until mounted (avoids hydration mismatch). Aligned to second boundary. */
export function useNow(): Date | null {
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const d = new Date();
      setNow(d);
      t = setTimeout(tick, 1000 - d.getMilliseconds());
    };
    tick();
    return () => clearTimeout(t);
  }, []);
  return now;
}

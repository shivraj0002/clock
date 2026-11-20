import { pad } from "@/lib/format";
import type { Parts } from "@/lib/time";

const BITS = [8, 4, 2, 1];

export function BinaryClock({ p, hour12, seconds }: { p: Parts; hour12: boolean; seconds: boolean }) {
  const h = hour12 ? p.h % 12 || 12 : p.h;
  const digits = `${pad(h)}${pad(p.m)}${seconds ? pad(p.s) : ""}`.split("").map(Number);
  return (
    <div
      className="flex gap-[clamp(0.5rem,2.5vw,2rem)]"
      role="img"
      aria-label={`${pad(h)}:${pad(p.m)}${seconds ? ":" + pad(p.s) : ""}`}
    >
      {digits.map((d, col) => (
        <div
          key={col}
          className={`flex flex-col items-center gap-[clamp(0.4rem,1.5vw,1rem)] ${col % 2 === 1 && col < digits.length - 1 ? "mr-[clamp(0.5rem,2vw,2rem)]" : ""}`}
        >
          {BITS.map((b) => {
            const on = (d & b) !== 0;
            return (
              <span
                key={b}
                className="rounded-full transition-colors"
                style={{
                  width: "clamp(1.2rem,5vw,4rem)",
                  height: "clamp(1.2rem,5vw,4rem)",
                  background: on ? "var(--accent)" : "color-mix(in srgb, var(--muted) 25%, transparent)",
                  boxShadow: on ? "0 0 24px var(--glow)" : undefined,
                }}
              />
            );
          })}
          <span className="display text-sm" style={{ color: "var(--muted)" }}>
            {d}
          </span>
        </div>
      ))}
    </div>
  );
}

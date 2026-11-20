import { wordTime, type Parts } from "@/lib/time";

export function WordClock({ p }: { p: Parts }) {
  return (
    <div
      className="display text-center leading-tight"
      style={{ fontSize: "clamp(2rem, 8vw, 7rem)", textShadow: "0 0 40px var(--glow)" }}
    >
      <span style={{ color: "var(--muted)" }}>It&apos;s </span>
      <span className="font-semibold">{wordTime(p.h, p.m)}</span>
    </div>
  );
}

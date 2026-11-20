import type { Parts } from "@/lib/time";

export function AnalogClock({ p }: { p: Parts }) {
  const hour = ((p.h % 12) + p.m / 60) * 30;
  const min = (p.m + p.s / 60) * 6;
  const sec = p.s * 6;
  return (
    <svg
      viewBox="-100 -100 200 200"
      role="img"
      aria-label={`${p.h}:${String(p.m).padStart(2, "0")}`}
      style={{ width: "min(70vh, 85vw)", filter: "drop-shadow(0 0 18px var(--glow))" }}
    >
      <circle r="96" fill="none" stroke="var(--muted)" strokeWidth="1.5" />
      {Array.from({ length: 60 }, (_, i) => (
        <line
          key={i}
          y1={-90}
          y2={i % 5 === 0 ? -80 : -86}
          stroke={i % 5 === 0 ? "var(--fg)" : "var(--muted)"}
          strokeWidth={i % 5 === 0 ? 2 : 1}
          transform={`rotate(${i * 6})`}
        />
      ))}
      {[12, 3, 6, 9].map((n, i) => (
        <text
          key={n}
          x={Math.sin((i * Math.PI) / 2) * 68}
          y={-Math.cos((i * Math.PI) / 2) * 68 + 5}
          textAnchor="middle"
          fontSize="14"
          fill="var(--fg)"
          className="display"
        >
          {n}
        </text>
      ))}
      <line y2={-48} stroke="var(--fg)" strokeWidth="5" strokeLinecap="round" transform={`rotate(${hour})`} />
      <line y2={-72} stroke="var(--fg)" strokeWidth="3" strokeLinecap="round" transform={`rotate(${min})`} />
      <line
        y1={14}
        y2={-80}
        stroke="var(--accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        transform={`rotate(${sec})`}
      />
      <circle r="4" fill="var(--accent)" />
    </svg>
  );
}

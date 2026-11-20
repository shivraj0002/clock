"use client";
import { useNow } from "@/lib/use-now";
import { useTitle } from "@/lib/use-title";
import { formatHMS } from "@/lib/format";
import { cityName, formatDate, getParts } from "@/lib/time";
import { useSettings } from "@/store/settings";
import { Digits } from "@/components/Digits";
import { AnalogClock } from "./AnalogClock";
import { BinaryClock } from "./BinaryClock";
import { WordClock } from "./WordClock";

export function Clock() {
  const now = useNow();
  const { hour12, showSeconds, showDate, timezone, zones, clockStyle } = useSettings();
  const p = now ? getParts(now, timezone) : null;
  const c = p ? formatHMS(p, hour12, showSeconds) : null;
  useTitle(c ? `${c.text} ${c.suffix}`.trim() : "Clock");

  if (!now || !p || !c) return <div className="h-[1em]" aria-hidden />;

  return (
    <div className="flex flex-col items-center gap-6">
      {clockStyle === "digital" && (
        <time
          dateTime={now.toISOString()}
          className="display font-semibold leading-none"
          style={{ fontSize: "clamp(3rem, 18vw, 16rem)", textShadow: "0 0 40px var(--glow)" }}
        >
          <Digits text={c.text} />
          {c.suffix && (
            <span className="ml-3 align-top text-[0.2em]" style={{ color: "var(--muted)" }}>
              {c.suffix}
            </span>
          )}
        </time>
      )}
      {clockStyle === "analog" && <AnalogClock p={p} />}
      {clockStyle === "binary" && <BinaryClock p={p} hour12={hour12} seconds={showSeconds} />}
      {clockStyle === "word" && <WordClock p={p} />}

      {(showDate || timezone) && (
        <div className="text-center text-xl sm:text-2xl" style={{ color: "var(--muted)" }}>
          {showDate && formatDate(now, timezone)}
          {showDate && timezone && " · "}
          {timezone && cityName(timezone)}
        </div>
      )}

      {zones.length > 0 && (
        <div className="mt-4 flex flex-wrap justify-center gap-x-10 gap-y-3">
          {zones.map((z) => {
            const zc = formatHMS(getParts(now, z), hour12, false);
            return (
              <div key={z} className="text-center">
                <div className="display text-2xl font-semibold">
                  {zc.text}{" "}
                  <span className="text-sm" style={{ color: "var(--muted)" }}>
                    {zc.suffix}
                  </span>
                </div>
                <div className="text-sm" style={{ color: "var(--muted)" }}>
                  {cityName(z)}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

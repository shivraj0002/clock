export type Parts = { h: number; m: number; s: number };

const cache = new Map<string, Intl.DateTimeFormat>();

export function validTz(tz: string): boolean {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/** Wall-clock h/m/s in `tz` (IANA id); empty/invalid tz = local. */
export function getParts(d: Date, tz?: string): Parts {
  if (tz) {
    try {
      let f = cache.get(tz);
      if (!f) {
        f = new Intl.DateTimeFormat("en-US", {
          timeZone: tz,
          hourCycle: "h23",
          hour: "numeric",
          minute: "numeric",
          second: "numeric",
        });
        cache.set(tz, f);
      }
      const p = f.formatToParts(d);
      const get = (t: string) => Number(p.find((x) => x.type === t)?.value ?? 0);
      return { h: get("hour") % 24, m: get("minute"), s: get("second") };
    } catch {
      /* fall through to local */
    }
  }
  return { h: d.getHours(), m: d.getMinutes(), s: d.getSeconds() };
}

export const cityName = (tz: string) => (tz.split("/").pop() ?? tz).replace(/_/g, " ");

export function allTimezones(): string[] {
  try {
    return Intl.supportedValuesOf("timeZone");
  } catch {
    return [];
  }
}

export function formatDate(d: Date, tz?: string): string {
  try {
    return d.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: tz || undefined,
    });
  } catch {
    return d.toLocaleDateString();
  }
}

const HOURS = ["twelve", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven"];
const MINUTE_WORDS: Record<number, string> = {
  5: "five past",
  10: "ten past",
  15: "quarter past",
  20: "twenty past",
  25: "twenty-five past",
  30: "half past",
  35: "twenty-five to",
  40: "twenty to",
  45: "quarter to",
  50: "ten to",
  55: "five to",
};

/** "quarter past three", "seven o'clock" (rounded to nearest 5 min). */
export function wordTime(h: number, m: number): string {
  let m5 = Math.round(m / 5) * 5;
  let hr = h;
  if (m5 === 60) {
    m5 = 0;
    hr = h + 1;
  }
  if (m5 > 30) hr = hr + 1;
  const name = HOURS[((hr % 12) + 12) % 12];
  return m5 === 0 ? `${name} o'clock` : `${MINUTE_WORDS[m5]} ${name}`;
}

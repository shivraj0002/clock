import { describe, expect, it } from "vitest";
import { getParts, validTz, wordTime, cityName } from "@/lib/time";

describe("wordTime", () => {
  it.each([
    [3, 0, "three o'clock"],
    [3, 15, "quarter past three"],
    [3, 30, "half past three"],
    [3, 45, "quarter to four"],
    [3, 58, "four o'clock"],
    [11, 40, "twenty to twelve"],
    [23, 55, "five to twelve"],
    [0, 2, "twelve o'clock"],
  ])("%i:%i -> %s", (h, m, out) => expect(wordTime(h, m)).toBe(out));
});

describe("getParts", () => {
  const d = new Date("2024-01-01T00:00:00Z");
  it("converts to a zone", () => {
    expect(getParts(d, "Asia/Kolkata")).toEqual({ h: 5, m: 30, s: 0 });
    expect(getParts(d, "America/New_York")).toEqual({ h: 19, m: 0, s: 0 });
  });
  it("falls back to local for invalid zone", () => {
    const p = getParts(d, "Not/AZone");
    expect(p.h).toBe(d.getHours());
  });
});

describe("tz helpers", () => {
  it("validates", () => {
    expect(validTz("Europe/Paris")).toBe(true);
    expect(validTz("nope")).toBe(false);
  });
  it("city name", () => expect(cityName("America/New_York")).toBe("New York"));
});

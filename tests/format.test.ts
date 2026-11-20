import { describe, expect, it } from "vitest";
import { formatDuration, formatHMS } from "@/lib/format";

describe("formatDuration", () => {
  it("formats mm:ss and centiseconds", () => {
    expect(formatDuration(65_430)).toEqual({ main: "01:05", cs: "43" });
  });
  it("adds hours when >= 1h", () => {
    expect(formatDuration(3_725_000).main).toBe("1:02:05");
  });
  it("ceil mode shows remaining whole seconds", () => {
    expect(formatDuration(1_001, true).main).toBe("00:02");
    expect(formatDuration(0, true).main).toBe("00:00");
  });
  it("clamps negatives to zero", () => {
    expect(formatDuration(-500).main).toBe("00:00");
  });
});

describe("formatHMS", () => {
  it("24h with seconds", () => {
    expect(formatHMS({ h: 9, m: 5, s: 3 }, false, true)).toEqual({ text: "09:05:03", suffix: "" });
  });
  it("12h handles midnight and noon", () => {
    expect(formatHMS({ h: 0, m: 7, s: 0 }, true, false)).toEqual({ text: "12:07", suffix: "AM" });
    expect(formatHMS({ h: 12, m: 0, s: 0 }, true, false)).toEqual({ text: "12:00", suffix: "PM" });
    expect(formatHMS({ h: 15, m: 30, s: 0 }, true, false)).toEqual({ text: "3:30", suffix: "PM" });
  });
});

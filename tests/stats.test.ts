import { describe, expect, it } from "vitest";
import { lastDays, toCsv, formatHm } from "@/lib/stats";
import type { Entry } from "@/store/sessions";

const e = (task: string, start: number, durationMs: number): Entry => ({
  id: task,
  task,
  kind: "focus",
  start,
  durationMs,
});

describe("stats", () => {
  it("sums per local day, oldest first", () => {
    const now = new Date(2024, 5, 10, 12).getTime();
    const days = lastDays(
      [e("a", now, 60_000), e("b", now - 3_600_000, 120_000), e("c", now - 86_400_000, 30_000)],
      now,
      3,
    );
    expect(days.map((d) => d.ms)).toEqual([0, 30_000, 180_000]);
  });
  it("formats hours/minutes", () => {
    expect(formatHm(25 * 60_000)).toBe("25m");
    expect(formatHm(65 * 60_000)).toBe("1h 05m");
  });
  it("csv escapes quotes and neutralizes formulas", () => {
    const csv = toCsv([e('say "hi"', 0, 1000), e("=SUM(A1)", 0, 2000)]);
    expect(csv).toContain('"say ""hi"""');
    expect(csv).toContain(`"'=SUM(A1)"`);
  });
});

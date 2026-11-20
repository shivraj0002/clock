import { afterEach, describe, expect, it, vi } from "vitest";
import { elapsedOf, idleCore, pauseCore, startCore } from "@/store/timers";

afterEach(() => vi.restoreAllMocks());

describe("timer core", () => {
  it("idle has zero elapsed", () => expect(elapsedOf(idleCore, 1000)).toBe(0));

  it("start/pause accumulates from timestamps", () => {
    const now = vi.spyOn(performance, "now");
    now.mockReturnValue(1000);
    const running = startCore(idleCore);
    expect(elapsedOf(running, 1500)).toBe(500);
    now.mockReturnValue(2000);
    const paused = pauseCore(running);
    expect(paused).toEqual({ running: false, startedAt: 0, acc: 1000 });
    now.mockReturnValue(5000);
    const resumed = startCore(paused);
    expect(elapsedOf(resumed, 5250)).toBe(1250);
  });

  it("never goes negative when tick lags behind start", () => {
    expect(elapsedOf({ running: true, startedAt: 100, acc: 0 }, 50)).toBe(0);
  });
});

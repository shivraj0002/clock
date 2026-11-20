import { describe, expect, it } from "vitest";
import { parseQuery } from "@/lib/url-config";

describe("parseQuery", () => {
  it("parses valid params", () => {
    const r = parseQuery(
      "?m=timer&theme=dracula&style=analog&bg=stars&h12=1&sec=0&min=25&tz=Asia/Kolkata&task=write&start=1&zen=1",
    );
    expect(r.patch).toMatchObject({
      mode: "timer",
      theme: "dracula",
      autoTheme: "off",
      clockStyle: "analog",
      bg: "stars",
      hour12: true,
      showSeconds: false,
      timezone: "Asia/Kolkata",
    });
    expect(r).toMatchObject({ minutes: 25, task: "write", start: true, zen: true });
  });
  it("ignores invalid values", () => {
    const r = parseQuery("?m=evil&theme=nope&style=x&bg=y&tz=Bad/Zone&min=-5&h12=maybe");
    expect(r.patch).toEqual({});
    expect(r.minutes).toBeUndefined();
  });
  it("accepts known custom theme ids", () => {
    expect(parseQuery("?theme=custom-1", ["custom-1"]).patch.theme).toBe("custom-1");
  });
  it("caps task length and minutes", () => {
    expect(parseQuery("?task=" + "a".repeat(200)).task).toHaveLength(80);
    expect(parseQuery("?min=99999").minutes).toBeUndefined();
  });
});

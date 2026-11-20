import { describe, expect, it } from "vitest";
import { parseThemes, hexToRgba } from "@/lib/themes";

const ok = { name: "X", vars: { bg: "#000000", fg: "#ffffff", muted: "#888888", accent: "#ff0000" } };

describe("parseThemes", () => {
  it("accepts a valid theme and derives glow", () => {
    const [t] = parseThemes(ok);
    expect(t.name).toBe("X");
    expect(t.vars.glow).toBe("rgba(255,0,0,0.4)");
    expect(t.id.startsWith("custom-")).toBe(true);
  });
  it("accepts arrays and drops malformed entries", () => {
    expect(parseThemes([ok, { name: "bad", vars: { bg: "red" } }, null, 5])).toHaveLength(1);
  });
  it("rejects css injection in colors", () => {
    expect(parseThemes({ name: "x", vars: { ...ok.vars, bg: "#000; background:url(x)" } })).toHaveLength(0);
  });
  it("hexToRgba", () => expect(hexToRgba("#0a141e", 0.5)).toBe("rgba(10,20,30,0.5)"));
});

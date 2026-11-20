export type Theme = {
  id: string;
  name: string;
  vars: { bg: string; fg: string; muted: string; accent: string; glow: string };
};

export const THEMES: Theme[] = [
  {
    id: "dark",
    name: "Dark",
    vars: { bg: "#0a0a0a", fg: "#ededed", muted: "#6b7280", accent: "#60a5fa", glow: "rgba(96,165,250,0.35)" },
  },
  {
    id: "amoled",
    name: "AMOLED",
    vars: { bg: "#000000", fg: "#f5f5f5", muted: "#525252", accent: "#ffffff", glow: "rgba(255,255,255,0.2)" },
  },
  {
    id: "light",
    name: "Light",
    vars: { bg: "#fafafa", fg: "#171717", muted: "#737373", accent: "#2563eb", glow: "rgba(37,99,235,0.2)" },
  },
  {
    id: "dracula",
    name: "Dracula",
    vars: { bg: "#282a36", fg: "#f8f8f2", muted: "#6272a4", accent: "#bd93f9", glow: "rgba(189,147,249,0.4)" },
  },
  {
    id: "nord",
    name: "Nord",
    vars: { bg: "#2e3440", fg: "#eceff4", muted: "#4c566a", accent: "#88c0d0", glow: "rgba(136,192,208,0.35)" },
  },
  {
    id: "solarized",
    name: "Solarized",
    vars: { bg: "#002b36", fg: "#eee8d5", muted: "#586e75", accent: "#b58900", glow: "rgba(181,137,0,0.4)" },
  },
  {
    id: "matrix",
    name: "Matrix",
    vars: { bg: "#000a00", fg: "#00ff41", muted: "#006b1b", accent: "#00ff41", glow: "rgba(0,255,65,0.5)" },
  },
  {
    id: "cyberpunk",
    name: "Cyberpunk",
    vars: { bg: "#0d0221", fg: "#ff2a6d", muted: "#541388", accent: "#05d9e8", glow: "rgba(5,217,232,0.5)" },
  },
  {
    id: "retro",
    name: "Retro LED",
    vars: { bg: "#120800", fg: "#ff6a00", muted: "#5c2a00", accent: "#ff3d00", glow: "rgba(255,106,0,0.55)" },
  },
  {
    id: "paper",
    name: "Paper",
    vars: { bg: "#f4ecd8", fg: "#3b2f1e", muted: "#8a7a5c", accent: "#a0522d", glow: "rgba(160,82,45,0.2)" },
  },
];

export const allThemes = (custom: Theme[]): Theme[] => [...THEMES, ...custom];

export const getTheme = (id: string, custom: Theme[] = []): Theme =>
  allThemes(custom).find((t) => t.id === id) ?? THEMES[0];

const HEX = /^#[0-9a-fA-F]{6}$/;

export function hexToRgba(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Validate untrusted JSON into Theme[] (used by import). Drops anything malformed. */
export function parseThemes(raw: unknown): Theme[] {
  const list = Array.isArray(raw) ? raw : [raw];
  const out: Theme[] = [];
  for (const t of list) {
    if (!t || typeof t !== "object") continue;
    const { name, vars } = t as { name?: unknown; vars?: Record<string, unknown> };
    if (typeof name !== "string" || !vars) continue;
    const { bg, fg, muted, accent } = vars;
    if (![bg, fg, muted, accent].every((c) => typeof c === "string" && HEX.test(c))) continue;
    out.push({
      id: `custom-${Date.now().toString(36)}-${out.length}`,
      name: name.slice(0, 24) || "Custom",
      vars: { bg, fg, muted, accent, glow: hexToRgba(accent as string, 0.4) } as Theme["vars"],
    });
  }
  return out;
}

export const isHex = (s: string) => HEX.test(s);

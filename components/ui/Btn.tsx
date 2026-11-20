import type { ButtonHTMLAttributes } from "react";

export function Btn({
  active,
  big,
  className = "",
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean; big?: boolean }) {
  return (
    <button
      {...p}
      className={`rounded-lg border px-3 py-1.5 text-sm transition-colors hover:brightness-125 disabled:opacity-40 ${
        big ? "px-8 py-3 text-lg font-medium" : ""
      } ${className}`}
      style={{
        borderColor: active ? "var(--accent)" : "color-mix(in srgb, var(--muted) 50%, transparent)",
        color: active ? "var(--accent)" : "var(--fg)",
        background: "color-mix(in srgb, var(--fg) 5%, transparent)",
      }}
    />
  );
}

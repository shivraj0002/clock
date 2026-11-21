"use client";
import { useUI } from "@/store/ui";
import { usePlatform } from "@/lib/platform";
import { Btn } from "@/components/ui/Btn";

/** Shown when the browser has no page-fullscreen API (iPhone Safari). */
export function InstallHint() {
  const open = useUI((s) => s.hint);
  const { ios } = usePlatform();
  if (!open) return null;
  const close = () => useUI.getState().setKey("hint", false);
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onKeyDown={(e) => e.key === "Escape" && close()}
    >
      <button
        aria-label="Close"
        className="absolute inset-0 cursor-default"
        style={{ background: "color-mix(in srgb, var(--bg) 70%, transparent)" }}
        onClick={close}
      />
      <section
        role="dialog"
        aria-label="Fullscreen"
        className="relative w-full max-w-sm rounded-2xl border p-5 shadow-2xl"
        style={{ background: "var(--bg)", borderColor: "color-mix(in srgb, var(--muted) 50%, transparent)" }}
      >
        <h2 className="mb-2 text-lg font-semibold">Fullscreen isn&apos;t available here</h2>
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {ios
            ? "Safari on iPhone doesn't allow fullscreen for web pages. Tap Share → Add to Home Screen, then open Clock from the new icon: it runs fullscreen with no browser bar."
            : "This browser doesn't support page fullscreen. Install the app from the browser menu to get a fullscreen window."}
        </p>
        <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
          Meanwhile, Zen mode hides all controls.
        </p>
        <div className="mt-4 flex gap-2">
          <Btn
            active
            onClick={() => {
              close();
              useUI.getState().setKey("zen", true);
            }}
          >
            Enter Zen mode
          </Btn>
          <Btn onClick={close}>Close</Btn>
        </div>
      </section>
    </div>
  );
}

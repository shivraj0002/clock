"use client";
import { useEffect, useState, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useUI } from "@/store/ui";
import { useDisplay } from "@/lib/use-display";
import { resetCurrent, toggleCurrent } from "@/lib/actions";
import { Btn } from "@/components/ui/Btn";

type DocPip = { requestWindow: (o?: { width?: number; height?: number }) => Promise<Window> };
const getPip = () => (window as unknown as { documentPictureInPicture?: DocPip }).documentPictureInPicture;

export const usePipSupported = () =>
  useSyncExternalStore(
    () => () => {},
    () => !!getPip(),
    () => false,
  );

function View() {
  const d = useDisplay();
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-3 p-3">
      <div className="text-xs uppercase tracking-widest" style={{ color: "var(--muted)" }}>
        {d.label}
      </div>
      <div className="display text-5xl font-semibold" style={{ textShadow: "0 0 24px var(--glow)" }}>
        {d.text}
      </div>
      {d.controls && (
        <div className="flex gap-2">
          <Btn active onClick={toggleCurrent}>
            {d.running ? "Pause" : "Start"}
          </Btn>
          <Btn onClick={resetCurrent}>Reset</Btn>
        </div>
      )}
    </div>
  );
}

function syncRoot(w: Window) {
  const src = document.documentElement;
  const dst = w.document.documentElement;
  dst.style.cssText = src.style.cssText;
  for (const [k, v] of Object.entries(src.dataset)) if (v !== undefined) dst.dataset[k] = v;
  dst.className = src.className;
}

/** Always-on-top mini window via Document Picture-in-Picture (Chromium). */
export function MiniWindow() {
  const pip = useUI((s) => s.pip);
  const [win, setWin] = useState<Window | null>(null);

  useEffect(() => {
    const api = getPip();
    if (!pip || !api) return;
    let w: Window | null = null;
    let cancelled = false;
    api
      .requestWindow({ width: 380, height: 220 })
      .then((nw) => {
        if (cancelled) return nw.close();
        w = nw;
        document.head
          .querySelectorAll('link[rel="stylesheet"], style')
          .forEach((n) => nw.document.head.appendChild(n.cloneNode(true)));
        syncRoot(nw);
        nw.addEventListener("pagehide", () => {
          setWin(null);
          useUI.getState().setKey("pip", false);
        });
        setWin(nw);
      })
      .catch(() => useUI.getState().setKey("pip", false));
    return () => {
      cancelled = true;
      w?.close();
      setWin(null);
    };
  }, [pip]);

  // Keep theme/font in the mini window in sync with the main one.
  useEffect(() => {
    if (!win) return;
    const mo = new MutationObserver(() => syncRoot(win));
    mo.observe(document.documentElement, { attributes: true });
    return () => mo.disconnect();
  }, [win]);

  return win ? createPortal(<View />, win.document.body) : null;
}

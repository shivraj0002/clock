"use client";
import { useEffect, useRef } from "react";
import { useSettings } from "@/store/settings";

type CanvasType = "stars" | "particles" | "rain";

function CanvasBg({ type }: { type: CanvasType }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    const g = c?.getContext("2d");
    if (!c || !g) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let W = 0,
      H = 0,
      raf = 0,
      frame = 0,
      accent = "#fff";

    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      c.width = W * dpr;
      c.height = H * dpr;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);
    const readColor = () => {
      accent = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim() || "#fff";
    };

    const rnd = (a: number, b: number) => a + Math.random() * (b - a);
    const stars = Array.from({ length: 220 }, () => ({ x: rnd(-1, 1), y: rnd(-1, 1), z: rnd(0.05, 1) }));
    const parts = Array.from({ length: 70 }, () => ({
      x: rnd(0, W),
      y: rnd(0, H),
      vx: rnd(-0.25, 0.25),
      vy: rnd(-0.25, 0.25),
    }));
    const FS = 16;
    let heads: number[] = [];
    const TRAIL = 14;

    const draw = () => {
      if (frame % 30 === 0) readColor();
      g.clearRect(0, 0, W, H);
      g.fillStyle = accent;
      g.strokeStyle = accent;

      if (type === "stars") {
        for (const s of stars) {
          s.z -= 0.0015;
          const sx = W / 2 + (s.x / s.z) * (W / 4);
          const sy = H / 2 + (s.y / s.z) * (H / 4);
          if (s.z <= 0.03 || sx < 0 || sx > W || sy < 0 || sy > H) {
            s.x = rnd(-1, 1);
            s.y = rnd(-1, 1);
            s.z = 1;
            continue;
          }
          g.globalAlpha = Math.min(1, (1 - s.z) * 1.2);
          g.beginPath();
          g.arc(sx, sy, (1 - s.z) * 2.2 + 0.3, 0, 6.283);
          g.fill();
        }
      } else if (type === "particles") {
        for (const p of parts) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > W) p.vx *= -1;
          if (p.y < 0 || p.y > H) p.vy *= -1;
        }
        for (let i = 0; i < parts.length; i++) {
          const a = parts[i];
          g.globalAlpha = 0.6;
          g.beginPath();
          g.arc(a.x, a.y, 1.6, 0, 6.283);
          g.fill();
          for (let j = i + 1; j < parts.length; j++) {
            const b = parts[j];
            const d = Math.hypot(a.x - b.x, a.y - b.y);
            if (d < 130) {
              g.globalAlpha = (1 - d / 130) * 0.28;
              g.beginPath();
              g.moveTo(a.x, a.y);
              g.lineTo(b.x, b.y);
              g.stroke();
            }
          }
        }
      } else {
        const cols = Math.ceil(W / FS);
        if (heads.length !== cols) heads = Array.from({ length: cols }, () => Math.floor(rnd(-40, 0)));
        g.font = `${FS}px monospace`;
        for (let i = 0; i < cols; i++) {
          for (let t = 0; t < TRAIL; t++) {
            const row = heads[i] - t;
            if (row < 0) continue;
            g.globalAlpha = (1 - t / TRAIL) * 0.5;
            g.fillText(Math.random() < 0.5 ? "0" : "1", i * FS, row * FS);
          }
          if (frame % 3 === 0) {
            heads[i]++;
            if (heads[i] * FS - TRAIL * FS > H && Math.random() > 0.97) heads[i] = Math.floor(rnd(-20, 0));
          }
        }
      }
      g.globalAlpha = 1;
      frame++;
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [type]);

  return <canvas ref={ref} aria-hidden className="bgfx" style={{ width: "100%", height: "100%", opacity: 0.8 }} />;
}

export function Background() {
  const bg = useSettings((s) => s.bg);
  const anim = useSettings((s) => s.animations);
  if (bg === "none") return null;
  if (bg === "gradient" || bg === "aurora" || bg === "grid") {
    return <div aria-hidden className={`bgfx bg-${bg}`} />;
  }
  return anim ? <CanvasBg key={bg} type={bg} /> : null;
}

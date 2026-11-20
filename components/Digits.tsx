"use client";
import { AnimatePresence, motion, type TargetAndTransition } from "framer-motion";
import { useSettings, type DigitAnim } from "@/store/settings";

const V: Record<
  Exclude<DigitAnim, "none">,
  { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }
> = {
  fade: { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } },
  slide: { initial: { y: "-45%", opacity: 0 }, animate: { y: 0, opacity: 1 }, exit: { y: "45%", opacity: 0 } },
  roll: { initial: { y: "100%" }, animate: { y: 0 }, exit: { y: "-100%" } },
  flip: {
    initial: { rotateX: -90, opacity: 0 },
    animate: { rotateX: 0, opacity: 1 },
    exit: { rotateX: 90, opacity: 0 },
  },
};

function Digit({ ch, mode }: { ch: string; mode: DigitAnim }) {
  if (mode === "none") return <span className="inline-block w-[1ch] text-center">{ch}</span>;
  const v = V[mode];
  return (
    <span
      className="relative inline-block w-[1ch] text-center"
      style={{
        overflow: mode === "roll" || mode === "slide" ? "clip" : undefined,
        overflowClipMargin: "0.35em",
        perspective: 600,
      }}
    >
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={ch}
          className="inline-block"
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ duration: 0.25 }}
        >
          {ch}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/** Renders text with per-digit transitions (setting: digitAnim). Digits get fixed 1ch cells. */
export function Digits({ text }: { text: string }) {
  const anim = useSettings((s) => s.digitAnim);
  const on = useSettings((s) => s.animations);
  const mode: DigitAnim = on ? anim : "none";
  return (
    <span className="inline-flex" role="text" aria-label={text}>
      {[...text].map((ch, i) =>
        /\d/.test(ch) ? (
          <Digit key={i} ch={ch} mode={mode} />
        ) : (
          <span key={i} aria-hidden>
            {ch}
          </span>
        ),
      )}
    </span>
  );
}

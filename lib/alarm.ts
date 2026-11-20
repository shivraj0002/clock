import { useSettings } from "@/store/settings";

let ctx: AudioContext | null = null;

/** Call from a user gesture: unlocks audio and asks for notification permission. */
export function unlockAudio() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    /* no audio */
  }
  if ("Notification" in window && Notification.permission === "default") {
    void Notification.requestPermission();
  }
}

export function beep(times = 3) {
  if (!ctx) return;
  try {
    for (let i = 0; i < times; i++) {
      const t = ctx.currentTime + i * 0.35;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.frequency.value = 880;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.3, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.3);
    }
  } catch {
    /* ignore */
  }
}

export type EndEvent = {
  type: "timer" | "pomodoro" | "alarm" | "break";
  label: string;
  message: string;
  durationMs?: number;
};

/**
 * Single exit point when something finishes: sound, notification,
 * window.postMessage (also to parent if embedded), optional webhook POST.
 * Webhook body is JSON sent as text/plain (no CORS preflight; receiver parses the text).
 */
export function notifyEnd(e: EndEvent, { sound = true } = {}) {
  if (sound) beep();
  if ("Notification" in window && Notification.permission === "granted") {
    new Notification("Clock", { body: e.message });
  }
  const payload = { source: "clock-app", ...e, at: new Date().toISOString() };
  window.postMessage(payload, window.location.origin);
  if (window.parent !== window) window.parent.postMessage(payload, "*");

  const url = useSettings.getState().webhookUrl.trim();
  if (/^https?:\/\//i.test(url)) {
    fetch(url, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  }
}

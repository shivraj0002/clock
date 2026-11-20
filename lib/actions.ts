import { useSettings } from "@/store/settings";
import { useTimers } from "@/store/timers";
import { usePomodoro } from "@/store/pomodoro";

/** Mode-aware primary actions shared by shortcuts, palette and the mini window. */
export function toggleCurrent() {
  const { mode } = useSettings.getState();
  if (mode === "stopwatch") useTimers.getState().swToggle();
  else if (mode === "timer") useTimers.getState().cdToggle();
  else if (mode === "pomodoro") usePomodoro.getState().toggle();
}

export function resetCurrent() {
  const { mode } = useSettings.getState();
  if (mode === "stopwatch") useTimers.getState().swReset();
  else if (mode === "timer") useTimers.getState().cdReset();
  else if (mode === "pomodoro") usePomodoro.getState().reset();
}

export function lapCurrent() {
  if (useSettings.getState().mode === "stopwatch") useTimers.getState().swLap();
}

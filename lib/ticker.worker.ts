// Worker timers are not throttled like main-thread timers in background tabs.
// Message: interval in ms to (re)start, or "stop".
const ctx = self as unknown as Worker;
let id: ReturnType<typeof setInterval> | undefined;

ctx.onmessage = (e: MessageEvent<number | "stop">) => {
  clearInterval(id);
  if (typeof e.data === "number") id = setInterval(() => ctx.postMessage(0), e.data);
};

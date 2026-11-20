# Build checklist

Legend: [x] done · [ ] todo · [~] in progress · [-] skipped (reason)

## Done earlier

- [x] Scaffold Next.js 16 + TS + Tailwind 4, git init
- [x] 10 built-in themes, theme variables, persisted settings
- [x] Digital clock, stopwatch (laps, CSV), countdown timer (presets, alarm)
- [x] Worker ticker, timestamp-based timers
- [x] Fullscreen, Wake Lock, zen mode, auto-hide controls
- [x] Keyboard shortcuts, settings panel

## A. Foundations

- [x] A1 Extend settings store (styles, fonts, bg, pomodoro, etc.)
- [x] A2 UI store (panel/palette/zen state)
- [x] A3 Time helpers (timezone parts, word time)
- [x] A4 Generalized worker interval
- [x] A5 Central end-of-event notifier (sound, notification, postMessage, webhook)

## B. Modes

- [x] B1 Pomodoro (phases, cycles, auto-advance, skip)
- [x] B2 Alarm mode (list, days, ringing overlay, snooze, worker-driven)

## C. Clock faces & visuals

- [x] C1 Digit transitions (fade/slide/roll/flip)
- [x] C2 Analog clock
- [x] C3 Binary clock
- [x] C4 Word clock
- [x] C5 Timezone picker + multi-timezone strip
- [x] C6 Font choices
- [x] C7 Animated backgrounds (gradient, aurora, grid, stars, particles, rain)

## D. Themes

- [x] D1 Custom theme editor
- [x] D2 Theme JSON import/export
- [x] D3 Auto theme (system / time of day)

## E. Long-session

- [x] E1 Burn-in protection (pixel shift)
- [x] E2 Brightness/dim slider + night auto-dim
- [x] E3 Break reminders (20-20-20, water, stretch)
- [x] E4 Document Picture-in-Picture mini window

## F. Developer features

- [x] F1 Command palette (Cmd/Ctrl+K)
- [x] F2 URL param config + share link
- [x] F3 Task label + session log
- [x] F4 Stats panel (daily/weekly chart) + JSON/CSV export
- [x] F5 Webhook / postMessage on end

## G. Polish

- [x] G1 PWA (manifest, icons, service worker)
- [x] G2 Vitest unit tests
- [x] G3 Prettier + scripts
- [x] G4 Final: typecheck, lint, build, tests, smoke test, README
- [-] Playwright e2e, Husky hooks, Vercel deploy (not done: needs browsers/user account; left for user)
- [-] Multiple simultaneous countdown timers (deferred: single-timer store design)

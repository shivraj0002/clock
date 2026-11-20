# Clock

Themeable clock, stopwatch, timer, pomodoro and alarm for long work sessions. Next.js 16 + TypeScript + Tailwind 4, fully client-side (settings and logs live in `localStorage`).

```bash
npm run dev        # http://localhost:3000
npm run build && npm start
npm test           # vitest
npm run typecheck
npm run lint
npm run format     # prettier
```

## Features

- **Modes:** clock (digital / analog / binary / word, time zones, extra zones), stopwatch (laps, CSV), countdown, pomodoro, alarms.
- **Look:** 10 themes + custom theme editor with JSON import/export, auto theme (system or time of day), 4 fonts, 6 animated backgrounds, digit transitions (fade / slide / roll / flip).
- **Long sessions:** fullscreen, zen mode, Wake Lock, auto-hiding controls, brightness + night auto-dim, burn-in pixel shift, break reminders, always-on-top mini window (Document Picture-in-Picture, Chromium only), worker-driven timing that stays accurate in background tabs.
- **Developer:** command palette (`Ctrl/Cmd+K`), URL config, task label + session log, stats + JSON/CSV export, webhook / `postMessage` on finish, PWA (installable, offline).

## Shortcuts

`Space` start/pause · `R` reset · `L` lap · `F` fullscreen · `Z` zen · `T` next theme · `M` next mode · `S` stats · `Ctrl/Cmd+K` palette · `?` settings

## URL parameters

`m` (clock|stopwatch|timer|pomodoro|alarm), `theme`, `style`, `anim`, `bg`, `font`, `tz`, `h12`, `sec`, `date`, `min` (timer minutes), `task`, `zen`, `start`.
Example: `/?m=timer&min=25&theme=dracula&task=write&start=1`

## Events

When a timer, pomodoro phase, alarm or break fires, this is sent via `window.postMessage` (and to `window.parent` when embedded), and POSTed to the optional webhook URL (as `text/plain` JSON to avoid CORS preflight):

```json
{
  "source": "clock-app",
  "type": "timer|pomodoro|alarm|break",
  "label": "task",
  "message": "…",
  "durationMs": 1500000,
  "at": "ISO-8601"
}
```

## Notes

- Alarms and timers only fire while a tab is open. Sound and notifications need one user click first (browser policy).
- Next.js 16 differs from older versions; see `AGENTS.md` and `node_modules/next/dist/docs/`.

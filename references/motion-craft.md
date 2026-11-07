# Motion craft

Read before planning beats, timing, typography, and easing.

## Timing

- Default 30 fps. Use 60 only for fast motion or UI scrolling.
- Social: 6-15 s. Explainer: 20-60 s. Board chart: 8-20 s. Over 90 s, confirm the user wants it.
- Hold readable text at least 0.3 s per word plus 1 s, never under 1.5 s.
- Entrances 0.4-0.8 s, exits 0.3-0.5 s, scene transitions 0.4-0.7 s. Leave 0.5-1 s of stillness after a key number lands.
- Stagger list items by 60-120 ms. More than 6 staggered items reads as noise; group them.
- Keep holds alive with a slow push (1-3% scale over the scene) or subtle drift; `check_video.py` flags frozen spans over 2 s so you can confirm each one is intended.
- One focal motion at a time. Background motion stays slower and lower contrast.

## Easing

- Enter with ease-out (`easeOutCubic`, `easeOutExpo`), exit with ease-in, move on screen with ease-in-out.
- Use a spring or `easeOutBack` only for playful brands, and at most once per scene.
- Never linear for position or scale; linear is fine for opacity crossfades and constant rotation.
- Count numbers up with ease-out and round to the final displayed precision; land exactly on the real value. Derive summary stats from the same data the chart uses so they cannot disagree.

## Layout and type

- Title-safe margin: 5% each side (10% on 9:16 for platform UI).
- Body text at least 1/30 of frame height (36 px at 1080p); headline 1/10 to 1/7.
- Two typefaces maximum. Tabular numerals for counters and charts.
- Contrast 4.5:1 minimum for text, including over images; add a scrim when needed.
- Charts: label values directly, start bars at zero, animate in data order, and cite the data source on screen when it is real data.

## Story shapes

- Explainer: hook, problem, idea, how it works (2-3 beats), payoff, end card.
- Data story: context, the number, why it moved, what's next.
- Product walkthrough: outcome first, 3 steps, call to action.
- Logo sting: build-up, reveal, hold 1 s.

## Determinism

Every frame must be computable from time alone: seeded random (`mulberry32`), no wall clock, no CSS transitions or keyframes left running, no `requestAnimationFrame` state, fonts loaded before the first capture. Loops end on the same frame they start.

## Audio

Match cuts to beats when music exists: compute beat times (bpm or onset detection) and snap beat boundaries. Duck music 10-14 dB under voice. Mux a finished track; leave mixing to an audio tool. Captions burned in for social; keep a sidecar `.srt` when narration exists.

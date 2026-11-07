---
name: motion-video
description: "Make videos from code: animated explainers, motion graphics, kinetic type, animated charts, product walkthroughs, and math animations rendered to MP4, in the style of Claude Motion. Use for code-built animation with HTML, Remotion, or Manim; not for photorealistic AI-generated footage or people."
metadata:
  version: "1.0.0"
---

# Motion video

Build the video as code, render it to MP4, and inspect real frames before delivery. Code video animates text, charts, shapes, and images; it never creates realistic footage or people. Route generative footage to the built-in media skill.

## Pick the engine

| Situation | Engine |
|---|---|
| Rich production: storyboard, voiceover, captions, transitions, product launch | Built-in `hyperframes` skill (HTML + GSAP, Apache-2.0). Load it and follow its runtime |
| Short explainer, animated chart, kinetic type, logo sting, quick draft, or HyperFrames runtime blocked | Bundled Frame Studio: `templates/frame-studio/index.html` + `scripts/render.mjs` |
| User asks for Remotion or has a React video project | Remotion. Read `references/engines.md` (license gate) and `references/remotion-manim.md` |
| Equations, geometry, algorithms, 3Blue1Brown style | Manim. Read `references/remotion-manim.md` |

Read `references/engines.md` only when the choice is unclear or the user asks to compare tools. Do not silently switch engines after a failure; report the blocker and offer the next row.

## Workflow

1. **Brief.** Pin down audience, where it plays, length, aspect ratio (16:9, 9:16, 1:1), one-line message, and the user's data, copy, images, and brand. Ask only for what changes the build; otherwise pick defaults and state them.
2. **Plan beats.** Write a short beat table (beat, seconds, on screen, purpose) in chat. Read `references/motion-craft.md` before planning timing, type, and easing. For brand or aesthetic choices, apply `user:anti-slop-design` rules if loaded rather than inventing a second style system.
3. **Build editable.** Put every word, number, color, and duration in one content block at the top (Frame Studio: `CONTENT`) so one detail can change without touching the rest. Animation must be a pure function of time: no `Date.now`, unseeded random, CSS transitions, or `requestAnimationFrame` loops.
4. **Check stills first.** Frame Studio: `node scripts/render.mjs sheet <index.html> --out sheet.png` and `stills --times ...`. Inspect for clipping, overlap, contrast, unreadable text, and empty frames. Fix before full render.
5. **Render.** `node scripts/render.mjs video <index.html> --out out.mp4 [--audio mix.wav] [--scale 0.5]`. Draft at half scale, final at full.
6. **Verify.** `python3 scripts/check_video.py out.mp4 --sheet check.png`, then view the sheet. Confirm duration, resolution, fps, audio presence, no decode errors, and no unintended black or frozen spans.
7. **Deliver** the MP4, the editable source folder, and a one-line note of how to change text, numbers, or timing. List any unverified checks.

Completion: a playable MP4 whose sheet you have looked at, plus editable source.

## Frame Studio setup

Run `bash scripts/setup.sh <runtime-dir>` once per task, then call the renderer with `STUDIO_RUNTIME=<runtime-dir>`. It installs `playwright-core` only and reuses an existing Chromium. Copy the template folder into the project; keep assets and fonts local. Change aspect ratio in `CONTENT.format`, then rework the layout CSS and recheck the sheet. The template file also previews in a browser (`?t=4` freezes a moment).

## Limits

- No network fonts or remote media at render time; use installed or bundled licensed fonts.
- Audio is muxed, not mixed: pass a finished track. Voiceover, music, or TTS require a provider the user approves; never imply paid credits are free.
- Remotion is free for individuals and organizations of up to 3 people; larger companies need a Company License. Say so before choosing it for a company.
- A successful command is not proof of quality. Report what you inspected.

# Remotion and Manim

Read when the selected engine is Remotion or Manim.

## Remotion

Confirm license eligibility first (free up to 3 people total headcount; see `engines.md`).

1. Scaffold: `npx create-video@latest --yes --blank <dir>`, then `cd <dir> && npm i`. Official agent rules: `npx remotion skills add` (or read https://github.com/remotion-dev/skills); prefer current docs over memory for APIs.
2. Rules that prevent most broken renders:
   - Drive everything from `useCurrentFrame()` and `useVideoConfig()`. No CSS transitions, CSS animations, or `setTimeout`.
   - `interpolate(frame, [a, b], [x, y], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })`. Unclamped interpolation overshoots.
   - `spring({ frame, fps, config: { damping: 200 } })` for natural motion without bounce.
   - Sequence scenes with `<Sequence from={} durationInFrames={}>` or `<Series>`; layer with `<AbsoluteFill>`.
   - Media through `staticFile()` and Remotion's `<Img>`, `<Video>`/`<OffthreadVideo>`, `<Audio>` so frames wait for loading.
   - Fonts with `@remotion/google-fonts` or `@remotion/fonts`; random with `random(seed)`.
   - Register each video as a `<Composition id width height fps durationInFrames>`; expose editable copy as `defaultProps` with a zod schema.
3. Stills first: `npx remotion still <id> out/still.png --frame=<n>` at 0.0s, 0.5s, 1.2s, and 3.0s. Spoken and social Remotion still follows `references/engagement.md`: word-by-word motion, an event by frame 0, no static card.
4. Render: `npx remotion render <id> out/video.mp4` (add `--scale=0.5` for drafts). Then run `scripts/check_video.py`.

If Chromium download is blocked, pass `--browser-executable=<path>` to an existing Chrome.

## Manim Community

1. Install into a task venv: `python3 -m venv <venv> && <venv>/bin/pip install manim` (Python 3.11+). It needs FFmpeg and Cairo/Pango system libraries; `MathTex` also needs LaTeX. If system packages are missing, report it rather than installing OS packages silently; `Text` and shapes work without LaTeX.
2. Write one `Scene` subclass per beat or one scene with `self.play(...)` calls; `self.wait(t)` holds.
3. Draft: `manim -ql scene.py SceneName` (480p15). Final: `manim -qh` (1080p60) or `-qk` (4K). Output lands in `media/videos/...`.
4. Use `config.background_color`, consistent `Text` font, and `run_time` on every `play`. Then run `scripts/check_video.py`.

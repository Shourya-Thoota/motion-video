# Motion Video

An agent skill that makes videos from code: animated explainers, motion graphics, kinetic type, animated charts, product walkthroughs, and math animations, rendered to MP4 — in the style of Claude Motion. Every word, number, color, and duration lives in one editable content block, and real frames are inspected before delivery.

**By [Vibhav Thoota](https://github.com/Shourya-Thoota) / [Pansophy LLC](https://github.com/Shourya-Thoota).**

## What it does

- **Engine routing.** Picks the right renderer for the job: a rich production pipeline (storyboard, voiceover, captions, transitions) via HyperFrames; the bundled Frame Studio for short explainers, animated charts, kinetic type, and logo stings; Remotion for React video projects; Manim for equations, geometry, and 3Blue1Brown-style math animation.
- **Build editable.** All content is declared in one block at the top of the template, so a single detail can change without touching the rest. Animation is a pure function of time — no wall-clock reads, unseeded randomness, or uncontrolled loops.
- **Check stills first.** Frame sheets and stills are rendered and inspected for clipping, overlap, contrast, unreadable text, and empty frames before any full render. Draft at half scale, final at full.
- **Verify the file.** A bundled checker confirms duration, resolution, fps, audio presence, no decode errors, and no unintended black or frozen spans.

## When to use it

Use for code-built animation in HTML, Remotion, or Manim. Not for photorealistic AI-generated footage or people — that belongs to a generative media skill. No network fonts or remote media at render time; audio is muxed, not mixed.

## What's inside

```
SKILL.md                    # Workflow, engine routing, limits
templates/frame-studio/     # Self-contained HTML video template
scripts/render.mjs          # Frame Studio renderer (stills, sheets, video)
scripts/setup.sh            # One-time renderer setup (playwright-core)
scripts/check_video.py      # MP4 verification
references/engines.md       # Engine comparison and license notes
references/remotion-manim.md  # Remotion and Manim specifics
references/motion-craft.md  # Timing, type, and easing
```

## Install

This is an [Agent Skill](https://agentskills.io) (a `SKILL.md` package). Clone it into your agent's skills directory:

```bash
git clone https://github.com/Shourya-Thoota/motion-video ~/.claude/skills/motion-video
```

Works with any agent that supports the Agent Skills format (Claude Code, Perplexity Computer, and others). Frame Studio needs Node and an existing Chromium; `scripts/setup.sh` installs the renderer dependency locally.

## License

[MIT](LICENSE) — Copyright (c) 2026 Pansophy LLC. (Remotion and Manim carry their own licenses — see `references/engines.md`.)

# Code-video engines (checked October 2026)

Read when choosing between engines or answering "which tool should I use".

The deciding question is who owns the timeline: React (Remotion), seekable HTML animation (HyperFrames, Frame Studio), generator code (Motion Canvas, Revideo), or a math scene graph (Manim).

| Engine | Author in | License | Best for | Watch out |
|---|---|---|---|---|
| Claude Motion | Prompt in Claude artifacts | Proprietary; Team and Enterprise beta | Same output class this skill targets: editable code animations exported to MP4 | Not available here; reproduce the workflow, not the product |
| HyperFrames (HeyGen) | HTML, CSS, GSAP | Apache-2.0, no render fees | Agent-native production with storyboard, captions, TTS, transitions | Needs its runtime (built-in skill provisions it) |
| Frame Studio (bundled) | One HTML file, `renderFrame(t)` | Your code | Fast explainers, charts, kinetic type, drafts | No built-in captions/TTS; DOM screenshot speed (~20-40 fps render) |
| Remotion | React + TypeScript | Source-available: free for individuals, nonprofits, and orgs of up to 3 people; Company License otherwise | React teams, data-driven batch videos, UI recreated as video | License; headcount counts all staff, not only users |
| Manim Community | Python `Scene` classes | MIT | Equations (LaTeX), geometry, algorithms | Slow renders; painful for non-math content; needs LaTeX for `MathTex` |
| Motion Canvas | TS generators + editor | MIT | Hand-tuned vector explainers synced to voiceover | Core development largely dormant; forks carry it on |
| Revideo | TS generators, headless API | MIT | Render pipelines and APIs | Sends anonymous telemetry by default; team focus moved to Midrender |

## Sources

- Claude Motion: https://support.claude.com/en/articles/17454997-get-started-with-claude-motion
- Remotion license FAQ: https://www.remotion.dev/docs/license/faq
- Remotion agent skills: https://github.com/remotion-dev/skills
- HyperFrames: https://github.com/heygen-com/hyperframes
- Alternatives overview: https://snapcn.dev/remotion-alternatives
- Motion Canvas status: https://metavert.io/motion-canvas
- Deterministic canvas + Playwright + FFmpeg pattern: https://github.com/KARAN-CODE50/starter-kit-claude-motion-video

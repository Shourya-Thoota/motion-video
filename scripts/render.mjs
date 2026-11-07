#!/usr/bin/env node
// Frame Studio renderer: deterministic HTML -> stills, contact sheet, or MP4.
// The page must define window.STUDIO = {width, height, fps, duration} and
// window.renderFrame(t) (sync or async) that draws the exact state at time t seconds.
//
// Modes:
//   stills <html> --times 1,2.5 [--outdir stills] [--scale 1]
//   sheet  <html> [--out sheet.png] [--step s] [--cols 4] [--from 0] [--to dur]
//   video  <html> --out out.mp4 [--audio mix.wav] [--scale 1] [--from 0] [--to dur] [--png] [--crf 18]
// Env: STUDIO_RUNTIME (dir with node_modules/playwright-core), CHROME_PATH (optional).
import { createRequire } from "node:module";
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const [mode, htmlArg, ...rest] = process.argv.slice(2);
if (!mode || !htmlArg || !["stills", "sheet", "video"].includes(mode)) {
  console.error("usage: render.mjs <stills|sheet|video> <index.html> [options]");
  process.exit(2);
}
const opt = {};
for (let i = 0; i < rest.length; i++) {
  const k = rest[i];
  if (!k.startsWith("--")) continue;
  const nxt = rest[i + 1];
  if (nxt === undefined || nxt.startsWith("--")) opt[k.slice(2)] = true;
  else { opt[k.slice(2)] = nxt; i++; }
}

function loadPlaywright() {
  const roots = [process.env.STUDIO_RUNTIME, process.cwd()].filter(Boolean);
  for (const r of roots) {
    try { return createRequire(path.join(path.resolve(r), "noop.js"))("playwright-core"); } catch {}
  }
  console.error("playwright-core not found. Run: bash scripts/setup.sh <runtime> and set STUDIO_RUNTIME.");
  process.exit(1);
}

function findChrome() {
  if (process.env.CHROME_PATH && fs.existsSync(process.env.CHROME_PATH)) return process.env.CHROME_PATH;
  const cache = path.join(os.homedir(), ".cache", "ms-playwright");
  if (fs.existsSync(cache)) {
    const dirs = fs.readdirSync(cache).sort().reverse();
    for (const d of dirs.filter((d) => d.startsWith("chromium-"))) {
      for (const sub of ["chrome-linux64/chrome", "chrome-linux/chrome", "chrome-mac/Chromium.app/Contents/MacOS/Chromium", "chrome-win/chrome.exe"]) {
        const p = path.join(cache, d, sub);
        if (fs.existsSync(p)) return p;
      }
    }
  }
  for (const bin of ["chromium", "chromium-browser", "google-chrome", "google-chrome-stable"]) {
    const r = spawnSync("which", [bin], { encoding: "utf8" });
    if (r.status === 0 && r.stdout.trim()) return r.stdout.trim();
  }
  const mac = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
  if (fs.existsSync(mac)) return mac;
  console.error("No Chromium/Chrome found. Set CHROME_PATH.");
  process.exit(1);
}

const { chromium } = loadPlaywright();
const htmlPath = path.resolve(htmlArg);
const scale = Number(opt.scale || 1);
const browser = await chromium.launch({ executablePath: findChrome(), args: ["--font-render-hinting=none", "--disable-gpu-vsync"] });
const probe = await browser.newPage();
await probe.goto(pathToFileURL(htmlPath).href);
const cfg = await probe.evaluate(() => window.STUDIO);
await probe.close();
if (!cfg || !cfg.width || !cfg.height || !cfg.fps || !cfg.duration) {
  console.error("window.STUDIO must define width, height, fps, duration");
  await browser.close();
  process.exit(1);
}
const ctx = await browser.newContext({ viewport: { width: cfg.width, height: cfg.height }, deviceScaleFactor: scale });
await ctx.addInitScript(() => { window.__STUDIO_RENDER = true; });
const page = await ctx.newPage();
const pageErrors = [];
page.on("pageerror", (e) => pageErrors.push(String(e)));
await page.goto(pathToFileURL(htmlPath).href);
await page.evaluate(async () => { await document.fonts.ready; if (window.studioReady) await window.studioReady(); });

const fmt = opt.png ? "png" : "jpeg";
async function grab(t) {
  await page.evaluate(async (tt) => { await window.renderFrame(tt); }, t);
  return page.screenshot(fmt === "png" ? { type: "png" } : { type: "jpeg", quality: 95 });
}
const from = Number(opt.from || 0);
const to = Math.min(Number(opt.to || cfg.duration), cfg.duration);

try {
  if (mode === "stills") {
    const times = String(opt.times || `0,${cfg.duration / 2},${Math.max(0, cfg.duration - 1 / cfg.fps)}`).split(",").map(Number);
    const outdir = path.resolve(opt.outdir || "stills");
    fs.mkdirSync(outdir, { recursive: true });
    for (const t of times) {
      const f = path.join(outdir, `t${t.toFixed(2)}.${fmt === "png" ? "png" : "jpg"}`);
      fs.writeFileSync(f, await grab(t));
      console.log(f);
    }
  } else if (mode === "sheet") {
    const step = Number(opt.step || (to - from) / 12);
    const cols = Number(opt.cols || 4);
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "sheet-"));
    const times = [];
    for (let t = from; t < to - 1e-9; t += step) times.push(Number(t.toFixed(3)));
    for (let i = 0; i < times.length; i++) fs.writeFileSync(path.join(tmp, `${String(i).padStart(4, "0")}.jpg`), await grab(times[i]));
    const rows = Math.ceil(times.length / cols);
    const out = path.resolve(opt.out || "sheet.png");
    const r = spawnSync("ffmpeg", ["-y", "-v", "error", "-framerate", "1", "-i", path.join(tmp, "%04d.jpg"),
      "-vf", `scale=480:-2,pad=iw+8:ih+8:4:4:color=0x808080,tile=${cols}x${rows}`, "-frames:v", "1", out], { stdio: "inherit" });
    if (r.status !== 0) throw new Error("ffmpeg tile failed");
    console.log(out);
    console.log("times (row-major): " + times.join(", "));
  } else {
    if (!opt.out) throw new Error("--out is required for video");
    const out = path.resolve(opt.out);
    const args = ["-y", "-v", "error", "-f", "image2pipe", "-framerate", String(cfg.fps), "-i", "-"];
    if (opt.audio) args.push("-ss", String(from), "-i", path.resolve(opt.audio));
    args.push("-vf", "scale=trunc(iw/2)*2:trunc(ih/2)*2:out_range=tv,format=yuv420p", "-color_range", "tv", "-c:v", "libx264", "-preset", "medium", "-crf", String(opt.crf || 18),
      "-pix_fmt", "yuv420p", "-r", String(cfg.fps), "-movflags", "+faststart");
    if (opt.audio) args.push("-c:a", "aac", "-b:a", "192k", "-shortest");
    args.push(out);
    const ff = spawn("ffmpeg", args, { stdio: ["pipe", "inherit", "inherit"] });
    const done = new Promise((res, rej) => ff.on("close", (c) => (c === 0 ? res() : rej(new Error("ffmpeg exit " + c)))));
    const n = Math.round((to - from) * cfg.fps);
    const t0 = Date.now();
    for (let i = 0; i < n; i++) {
      const buf = await grab(from + i / cfg.fps);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once("drain", r));
      if (i % (cfg.fps * 5) === 0) process.stderr.write(`frame ${i}/${n}\r`);
    }
    ff.stdin.end();
    await done;
    console.log(`${out}  ${n} frames  ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  }
} finally {
  if (pageErrors.length) console.error("page errors:\n" + pageErrors.join("\n"));
  await browser.close();
}

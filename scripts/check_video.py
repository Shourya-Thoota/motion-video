#!/usr/bin/env python3
"""Measure a rendered video: metadata, decode errors, black and frozen spans, contact sheet.

Usage: python3 check_video.py out.mp4 [--sheet check.png] [--cols 4] [--frames 12]
Prints JSON. Reports measurements; judging them is the caller's job.
"""
import argparse
import json
import re
import subprocess
import sys


def run(cmd):
    return subprocess.run(cmd, capture_output=True, text=True)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("video")
    ap.add_argument("--sheet")
    ap.add_argument("--cols", type=int, default=4)
    ap.add_argument("--frames", type=int, default=12)
    a = ap.parse_args()

    p = run(["ffprobe", "-v", "error", "-print_format", "json", "-show_format", "-show_streams", a.video])
    if p.returncode != 0:
        print(json.dumps({"ok": False, "error": p.stderr.strip()}))
        sys.exit(1)
    info = json.loads(p.stdout)
    v = next((s for s in info["streams"] if s["codec_type"] == "video"), None)
    au = next((s for s in info["streams"] if s["codec_type"] == "audio"), None)
    dur = float(info["format"].get("duration", 0))
    num, den = (v["avg_frame_rate"].split("/") + ["1"])[:2] if v else ("0", "1")
    fps = float(num) / float(den or 1) if v and float(den or 1) else 0

    dec = run(["ffmpeg", "-v", "error", "-xerror", "-i", a.video, "-f", "null", "-"])
    flt = run(["ffmpeg", "-hide_banner", "-i", a.video, "-vf",
               "blackdetect=d=0.5:pix_th=0.10,freezedetect=n=0.003:d=2", "-an", "-f", "null", "-"])
    black = [dict(zip(("start", "end"), map(float, m)))
             for m in re.findall(r"black_start:([\d.]+) black_end:([\d.]+)", flt.stderr)]
    fstart = [float(x) for x in re.findall(r"freeze_start: ([\d.]+)", flt.stderr)]
    fend = [float(x) for x in re.findall(r"freeze_end: ([\d.]+)", flt.stderr)]
    frozen = [{"start": s, "end": fend[i] if i < len(fend) else dur} for i, s in enumerate(fstart)]

    out = {
        "ok": dec.returncode == 0 and v is not None,
        "duration_s": round(dur, 3),
        "width": v and v.get("width"), "height": v and v.get("height"),
        "fps": round(fps, 3), "video_codec": v and v.get("codec_name"), "pix_fmt": v and v.get("pix_fmt"),
        "audio": bool(au), "audio_codec": au and au.get("codec_name"),
        "size_mb": round(int(info["format"].get("size", 0)) / 1e6, 2),
        "decode_errors": dec.stderr.strip()[:500] or None,
        "black_spans": black, "frozen_spans": frozen,
    }
    if a.sheet and dur > 0:
        rows = -(-a.frames // a.cols)
        rate = a.frames / dur
        s = run(["ffmpeg", "-y", "-v", "error", "-i", a.video, "-vf",
                 f"fps={rate:.6f},scale=480:-2,pad=iw+8:ih+8:4:4:color=0x808080,tile={a.cols}x{rows}",
                 "-frames:v", "1", a.sheet])
        out["sheet"] = a.sheet if s.returncode == 0 else None
        out["sheet_times_s"] = [round((i + 0.5) / rate, 2) for i in range(a.frames)]
    print(json.dumps(out, indent=2))
    sys.exit(0 if out["ok"] else 1)


if __name__ == "__main__":
    main()

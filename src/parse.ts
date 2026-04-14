// Pure parsing and formatting utilities — no DOM, no side effects.

import type { StartMode } from "./config";

export function parseBool(raw: string | null, def = true): boolean {
  if (raw == null) return def;
  const s = String(raw).trim().toLowerCase();
  if (!s) return def;
  if (["0", "false", "off", "no", "n", "none"].includes(s)) return false;
  if (["1", "true", "on", "yes", "y"].includes(s)) return true;
  return def;
}

export function parseStartMode(el: Element): StartMode {
  const v = (el.getAttribute("data-solution-timer-start") || "").trim().toLowerCase();
  if (/^(onclick|click|manual|startbutton|start-button|start_button)$/.test(v)) return "onclick";
  if (/^(oncheck|check|aftercheck|after-check|after_check)$/.test(v)) return "oncheck";
  return "immediate";
}

export function parseTimeToMs(raw: string | null): number {
  if (raw == null) return 0;
  const s0 = String(raw).trim().toLowerCase();
  if (!s0) return 0;
  if (/^\d+(\.\d+)?$/.test(s0)) return Math.max(0, parseFloat(s0) * 1000);
  if (/^\d+:\d{1,2}$/.test(s0)) {
    const [m, sec] = s0.split(":").map(Number);
    return Math.max(0, (m * 60 + sec) * 1000);
  }
  let total = 0, found = false;
  const re = /(\d+(?:\.\d+)?)\s*(ms|s|sec|secs|second|seconds|m|min|mins|minute|minutes|h|hr|hrs|hour|hours)\b/g;
  let match: RegExpExecArray | null;
  while ((match = re.exec(s0))) {
    found = true;
    const n = parseFloat(match[1]);
    const u = match[2];
    if (u === "ms") total += n;
    else if (["s", "sec", "secs", "second", "seconds"].includes(u)) total += n * 1000;
    else if (["m", "min", "mins", "minute", "minutes"].includes(u)) total += n * 60000;
    else if (["h", "hr", "hrs", "hour", "hours"].includes(u)) total += n * 3600000;
  }
  return found ? Math.max(0, total) : 0;
}

export function formatRemaining(ms: number): string {
  ms = Math.max(0, ms);
  const sec = Math.ceil(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m <= 0 ? `${s}s` : `${m}:${String(s).padStart(2, "0")}`;
}

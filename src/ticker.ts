// Interval-based countdown ticker and deferred reveal scheduling.

import { getState, DataKey, ds } from "./config";
import type { TimerLabel } from "./config";
import { formatRemaining } from "./parse";

export function ensureTicker(): void {
  const STATE = getState();
  if (STATE.ticker) return;
  STATE.ticker = window.setInterval(() => {
    const now = Date.now();
    for (const [key, it] of STATE.items.entries()) {
      if (!it.btn || !it.btn.isConnected) { STATE.items.delete(key); continue; }
      const rem = it.endAt - now;
      if (rem <= 0) {
        it.btn.style.display = ds(it.btn)[DataKey.PrevDisplay] || "";
        delete ds(it.btn)[DataKey.PrevDisplay];
        if (it.badge && it.badge.isConnected) it.badge.remove();
        STATE.items.delete(key);
      } else {
        if (it.badge) it.badge.textContent = `${it.label} in ${formatRemaining(rem)}`;
      }
    }
    if (STATE.items.size === 0) {
      window.clearInterval(STATE.ticker!);
      STATE.ticker = null;
    }
  }, 250);
}

export function scheduleReveal(btn: HTMLElement, badge: HTMLElement | null, ms: number, label: TimerLabel): void {
  const STATE = getState();
  const key = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
  STATE.items.set(key, { btn, badge, endAt: Date.now() + ms, label });
  ensureTicker();
}

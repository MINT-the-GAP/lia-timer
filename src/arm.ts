// Arming logic: reads attributes on a [data-solution-timer] element and wires up the chosen start mode.

import { DataKey, ds } from "./config";
import type { StartMode } from "./config";
import { parseTimeToMs, parseStartMode, parseBool, formatRemaining } from "./parse";
import {
  findSolutionButtonSmart,
  findCheckButtonsSmart,
  getControlHost,
  cleanupUiInHost,
  hideCheckButtons,
  forceShowCheckButtons,
  isCheckBtn,
} from "./dom";
import { scheduleReveal } from "./ticker";

interface ArmContext {
  el: Element;
  solBtn: HTMLElement;
  host: Element;
  doc: Document;
  ms: number;
  showBadge: boolean;
  makeBadge: (text: string) => HTMLElement;
}

type ArmStrategy = (ctx: ArmContext) => void;

function armImmediate({ solBtn, host, ms, showBadge, makeBadge }: ArmContext): void {
  let badge: HTMLElement | null = null;
  if (showBadge) {
    badge = makeBadge(`Solution in ${formatRemaining(ms)}`);
    host.appendChild(badge);
  }
  scheduleReveal(solBtn, badge, ms);
}

function armOnCheck({ el, solBtn, host, ms, showBadge, makeBadge }: ArmContext): void {
  let started = false;
  let badge: HTMLElement | null = null;

  if (showBadge) {
    badge = makeBadge(`Timer starts after checking`);
    host.appendChild(badge);
  }

  const startNow = () => {
    if (started) return;
    started = true;
    if (badge) badge.textContent = `Solution in ${formatRemaining(ms)}`;
    scheduleReveal(solBtn, badge, ms);
  };

  const checks = findCheckButtonsSmart(el, solBtn);
  if (checks[0] && ds(checks[0])[DataKey.Hooked] !== "1") {
    ds(checks[0])[DataKey.Hooked] = "1";
    checks[0].addEventListener("click", startNow, { once: true, passive: true });
  } else {
    host.addEventListener("click", (ev: Event) => {
      const t = (ev as MouseEvent).target as Element;
      if (!t || !t.closest) return;
      const b = t.closest("button, input[type='button'], a");
      if (b && isCheckBtn(b)) startNow();
    }, { capture: true, passive: true });
  }
}

function armOnClick({ el, solBtn, host, doc, ms, showBadge, makeBadge }: ArmContext): void {
  hideCheckButtons(findCheckButtonsSmart(el, solBtn));

  const startBtn = doc.createElement("button");
  startBtn.type = "button";
  startBtn.textContent = el.getAttribute("data-solution-timer-start-label") || "Start timer";
  startBtn.className = "lia-btn lia-sol-timer-startbtn";
  startBtn.setAttribute("data-sol-timer-ui", "1");

  host.insertBefore(startBtn, host.firstChild);

  let started = false;

  startBtn.addEventListener("click", () => {
    if (started) return;
    started = true;

    const force = () => forceShowCheckButtons(findCheckButtonsSmart(el, solBtn));
    force(); setTimeout(force, 60); setTimeout(force, 250); setTimeout(force, 600);

    try { startBtn.remove(); } catch (e) { startBtn.disabled = true; }

    let badge: HTMLElement | null = null;
    if (showBadge) {
      badge = makeBadge(`Solution in ${formatRemaining(ms)}`);
      host.appendChild(badge);
    }

    scheduleReveal(solBtn, badge, ms);
  }, { passive: true });
}

const STRATEGIES: Record<StartMode, ArmStrategy> = {
  immediate : armImmediate,
  oncheck   : armOnCheck,
  onclick   : armOnClick,
};

export function tryArm(el: Element): boolean {
  if (ds(el as HTMLElement)[DataKey.Armed] === "1") return true;

  const ms = parseTimeToMs(el.getAttribute("data-solution-timer"));
  if (ms <= 0) return false;

  const startMode = parseStartMode(el);
  const showBadge = parseBool(el.getAttribute("data-solution-timer-badge"), true);

  const solBtn = findSolutionButtonSmart(el);
  if (!solBtn) return false;

  if (ds(solBtn)[DataKey.Bound] === "1") {
    ds(el as HTMLElement)[DataKey.Armed] = "1";
    return true;
  }
  ds(solBtn)[DataKey.Bound] = "1";

  const doc = solBtn.ownerDocument || document;
  const host = getControlHost(el, solBtn);

  cleanupUiInHost(host);

  ds(solBtn)[DataKey.PrevDisplay] = solBtn.style.display || "";
  solBtn.style.display = "none";

  ds(el as HTMLElement)[DataKey.Armed] = "1";

  const makeBadge = (text: string): HTMLElement => {
    const badge = doc.createElement("span");
    badge.className = "lia-sol-timer-badge";
    badge.setAttribute("data-sol-timer-ui", "1");
    badge.textContent = text;
    return badge;
  };

  STRATEGIES[startMode]({ el, solBtn, host, doc, ms, showBadge, makeBadge });
  return true;
}

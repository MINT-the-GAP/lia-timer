// Arming logic: reads timer attributes and wires up the chosen start mode.

import { DataKey, ds } from "./config";
import type { StartMode, TimerLabel } from "./config";
import { parseTimeToMs, parseStartModeFromAttr, parseBool, formatRemaining } from "./parse";
import {
  findSolutionButtonSmart,
  findHintButtonSmart,
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
  timerBtn: HTMLElement;
  host: Element;
  doc: Document;
  ms: number;
  showBadge: boolean;
  label: TimerLabel;
  startLabel: string;
  hideChecksUntilStart: boolean;
  uiScope: string;
  makeBadge: (text: string) => HTMLElement;
}

interface TimerAttrConfig {
  timerAttr: string;
  startAttr: string;
  badgeAttr: string;
  startLabelAttr: string;
  armedKey: string;
  label: TimerLabel;
  uiScope: "solution" | "hint";
  hideChecksUntilStart: boolean;
  findButton: (el: Element) => HTMLElement | null;
}

type ArmStrategy = (ctx: ArmContext) => void;

function armImmediate({ timerBtn, host, ms, showBadge, makeBadge, label }: ArmContext): void {
  let badge: HTMLElement | null = null;
  if (showBadge) {
    badge = makeBadge(`${label} in ${formatRemaining(ms)}`);
    host.appendChild(badge);
  }
  scheduleReveal(timerBtn, badge, ms, label);
}

function armOnCheck({ el, timerBtn, host, ms, showBadge, makeBadge, label }: ArmContext): void {
  let started = false;
  let badge: HTMLElement | null = null;

  if (showBadge) {
    badge = makeBadge(`${label} timer starts after checking`);
    host.appendChild(badge);
  }

  const startNow = () => {
    if (started) return;
    started = true;
    if (badge) badge.textContent = `${label} in ${formatRemaining(ms)}`;
    scheduleReveal(timerBtn, badge, ms, label);
  };

  const checks = findCheckButtonsSmart(el, timerBtn);
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

function armOnClick({ el, timerBtn, host, doc, ms, showBadge, makeBadge, startLabel, label, hideChecksUntilStart, uiScope }: ArmContext): void {
  if (hideChecksUntilStart) hideCheckButtons(findCheckButtonsSmart(el, timerBtn));

  const startBtn = doc.createElement("button");
  startBtn.type = "button";
  startBtn.textContent = startLabel;
  startBtn.className = "lia-btn lia-sol-timer-startbtn";
  startBtn.setAttribute("data-sol-timer-ui", uiScope);

  host.insertBefore(startBtn, host.firstChild);

  let started = false;

  startBtn.addEventListener("click", () => {
    if (started) return;
    started = true;

    if (hideChecksUntilStart) {
      const force = () => forceShowCheckButtons(findCheckButtonsSmart(el, timerBtn));
      force(); setTimeout(force, 60); setTimeout(force, 250); setTimeout(force, 600);
    }

    try { startBtn.remove(); } catch (e) { startBtn.disabled = true; }

    let badge: HTMLElement | null = null;
    if (showBadge) {
      badge = makeBadge(`${label} in ${formatRemaining(ms)}`);
      host.appendChild(badge);
    }

    scheduleReveal(timerBtn, badge, ms, label);
  }, { passive: true });
}

const STRATEGIES: Record<StartMode, ArmStrategy> = {
  immediate : armImmediate,
  oncheck   : armOnCheck,
  onclick   : armOnClick,
};

const SOLUTION_CFG: TimerAttrConfig = {
  timerAttr: "data-solution-timer",
  startAttr: "data-solution-timer-start",
  badgeAttr: "data-solution-timer-badge",
  startLabelAttr: "data-solution-timer-start-label",
  armedKey: DataKey.ArmedSolution,
  label: "Solution",
  uiScope: "solution",
  hideChecksUntilStart: true,
  findButton: findSolutionButtonSmart,
};

const HINT_CFG: TimerAttrConfig = {
  timerAttr: "data-hint-timer",
  startAttr: "data-hint-timer-start",
  badgeAttr: "data-hint-badge",
  startLabelAttr: "data-hint-timer-start-label",
  armedKey: DataKey.ArmedHint,
  label: "Hint",
  uiScope: "hint",
  hideChecksUntilStart: false,
  findButton: findHintButtonSmart,
};

function tryArmTarget(el: Element, cfg: TimerAttrConfig): boolean {
  if (ds(el as HTMLElement)[cfg.armedKey] === "1") return true;

  const ms = parseTimeToMs(el.getAttribute(cfg.timerAttr));
  if (ms <= 0) return false;

  const startMode = parseStartModeFromAttr(el, cfg.startAttr);
  const showBadge = parseBool(el.getAttribute(cfg.badgeAttr), true);
  const startLabel = el.getAttribute(cfg.startLabelAttr) || "Start timer";

  const timerBtn = cfg.findButton(el);
  if (!timerBtn) return false;

  if (ds(timerBtn)[DataKey.Bound] === "1") {
    ds(el as HTMLElement)[cfg.armedKey] = "1";
    ds(el as HTMLElement)[DataKey.Armed] = "1";
    return true;
  }
  ds(timerBtn)[DataKey.Bound] = "1";

  const doc = timerBtn.ownerDocument || document;
  const host = getControlHost(el, timerBtn);

  cleanupUiInHost(host, cfg.uiScope);

  ds(timerBtn)[DataKey.PrevDisplay] = timerBtn.style.display || "";
  timerBtn.style.display = "none";

  ds(el as HTMLElement)[cfg.armedKey] = "1";
  ds(el as HTMLElement)[DataKey.Armed] = "1";

  const makeBadge = (text: string): HTMLElement => {
    const badge = doc.createElement("span");
    badge.className = "lia-sol-timer-badge";
    badge.setAttribute("data-sol-timer-ui", cfg.uiScope);
    badge.textContent = text;
    return badge;
  };

  STRATEGIES[startMode]({
    el,
    timerBtn,
    host,
    doc,
    ms,
    showBadge,
    label: cfg.label,
    startLabel,
    hideChecksUntilStart: cfg.hideChecksUntilStart,
    uiScope: cfg.uiScope,
    makeBadge,
  });
  return true;
}

export function tryArm(el: Element): boolean {
  const armedSolution = tryArmTarget(el, SOLUTION_CFG);
  const armedHint = tryArmTarget(el, HINT_CFG);
  return armedSolution || armedHint;
}

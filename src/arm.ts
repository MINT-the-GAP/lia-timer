// Arming logic: reads attributes on a [data-solution-timer] element and wires up the chosen start mode.

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

export function tryArm(el: Element): boolean {
  if ((el as HTMLElement).dataset.__solTimerArmed === "1") return true;

  const ms = parseTimeToMs(el.getAttribute("data-solution-timer"));
  if (ms <= 0) return false;

  const startMode = parseStartMode(el);
  const showBadge = parseBool(el.getAttribute("data-solution-timer-badge"), true);

  const solBtn = findSolutionButtonSmart(el);
  if (!solBtn) return false;

  if ((solBtn.dataset as any).__solTimerBound === "1") {
    (el as HTMLElement).dataset.__solTimerArmed = "1";
    return true;
  }
  (solBtn.dataset as any).__solTimerBound = "1";

  const doc = solBtn.ownerDocument || document;
  const host = getControlHost(el, solBtn);

  cleanupUiInHost(host);

  (solBtn.dataset as any).__solTimerPrevDisplay = solBtn.style.display || "";
  solBtn.style.display = "none";

  (el as HTMLElement).dataset.__solTimerArmed = "1";

  const makeBadge = (text: string): HTMLElement => {
    const badge = doc.createElement("span");
    badge.className = "lia-sol-timer-badge";
    badge.setAttribute("data-sol-timer-ui", "1");
    badge.textContent = text;
    return badge;
  };

  if (startMode === "immediate") {
    let badge: HTMLElement | null = null;
    if (showBadge) {
      badge = makeBadge(`Solution in ${formatRemaining(ms)}`);
      host.appendChild(badge);
    }
    scheduleReveal(solBtn, badge, ms);
    return true;
  }

  if (startMode === "oncheck") {
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
    if (checks[0] && (checks[0].dataset as any).__solTimerHooked !== "1") {
      (checks[0].dataset as any).__solTimerHooked = "1";
      checks[0].addEventListener("click", startNow, { once: true, passive: true });
    } else {
      host.addEventListener("click", (ev: Event) => {
        const t = (ev as MouseEvent).target as Element;
        if (!t || !t.closest) return;
        const b = t.closest("button, input[type='button'], a");
        if (b && isCheckBtn(b)) startNow();
      }, { capture: true, passive: true });
    }
    return true;
  }

  if (startMode === "onclick") {
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

    return true;
  }

  return true;
}

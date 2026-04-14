// DOM inspection, button discovery, host resolution, and check-button visibility.

import { DataKey, ds } from "./config";

export function normText(el: Element): string {
  return (
    (el as HTMLElement).textContent ||
    (el as HTMLInputElement).value ||
    el.getAttribute("aria-label") ||
    el.getAttribute("title") ||
    ""
  )
    .trim()
    .toLowerCase();
}

export function isCheckBtn(b: Element): boolean {
  const t = normText(b);
  if (!t) return false;
  if (/(reset|zurück|zurueck|neustart)/.test(t)) return false;
  if (/(auf(lö|lo)sen|l(ö|oe)sung|solution|answer|antwort|reveal)/.test(t)) return false;
  return /(prüfen|pruefen|check)\b/.test(t);
}

export function isSolutionBtn(b: Element): boolean {
  const t = normText(b);
  if (!t) return false;
  if (/(reset|zurück|zurueck|neustart)/.test(t)) return false;
  if (/(prüfen|pruefen|check)/.test(t)) return false;
  return /(auf(lö|lo)sen|l(ö|oe)sung|solution|answer|antwort|reveal)/.test(t);
}

export function findSolutionButtonSmart(el: Element): HTMLElement | null {
  const root = el.getRootNode ? el.getRootNode() : document;
  const scopes: Element[] = [];

  const quizScope =
    (el.matches && (el.matches("lia-quiz, .lia-quiz") ? el : null)) ||
    (el.closest ? el.closest("lia-quiz, .lia-quiz") : null) ||
    null;
  if (quizScope) scopes.push(quizScope);

  let p = el.parentElement, steps = 0;
  while (p && steps++ < 8) { scopes.push(p); p = p.parentElement; }

  for (const s of scopes) {
    try {
      const btns = Array.from(s.querySelectorAll("button, input[type='button'], a")).filter(isSolutionBtn);
      if (btns.length) return btns[btns.length - 1] as HTMLElement;
    } catch (e) {}
  }

  try {
    const rootEl = root as Document | ShadowRoot;
    const btns = rootEl.querySelectorAll
      ? Array.from(rootEl.querySelectorAll("button, input[type='button'], a")).filter(isSolutionBtn)
      : [];
    for (let i = btns.length - 1; i >= 0; i--) {
      const b = btns[i] as HTMLElement;
      if (b && b.getClientRects && b.getClientRects().length) return b;
    }
    return (btns[btns.length - 1] as HTMLElement) || null;
  } catch (e) {}
  return null;
}

export function findCheckButtonsSmart(el: Element, solBtn: HTMLElement | null): HTMLElement[] {
  const root = el.getRootNode ? el.getRootNode() : document;
  const scopes: Element[] = [];
  if (solBtn && solBtn.parentElement) scopes.push(solBtn.parentElement);

  const quizScope =
    (el.matches && (el.matches("lia-quiz, .lia-quiz") ? el : null)) ||
    (el.closest ? el.closest("lia-quiz, .lia-quiz") : null) ||
    null;
  if (quizScope) scopes.push(quizScope);

  let p = solBtn ? solBtn.parentElement : el.parentElement, steps = 0;
  while (p && steps++ < 8) { scopes.push(p); p = p.parentElement; }

  for (const s of scopes) {
    try {
      const btns = Array.from(s.querySelectorAll("button, input[type='button'], a")).filter(isCheckBtn);
      if (btns.length) return btns as HTMLElement[];
    } catch (e) {}
  }

  try {
    const rootEl = root as Document | ShadowRoot;
    const all = rootEl.querySelectorAll
      ? Array.from(rootEl.querySelectorAll("button, input[type='button'], a")).filter(isCheckBtn)
      : [];
    return all.slice(0, 8) as HTMLElement[];
  } catch (e) {}
  return [];
}

export function getControlHost(el: Element, solBtn: HTMLElement | null): Element {
  if (solBtn && solBtn.parentElement) return solBtn.parentElement;
  const quizScope = (el.closest ? el.closest("lia-quiz, .lia-quiz") : null) || null;
  return quizScope || el.parentElement || document.body;
}

export function cleanupUiInHost(host: Element): void {
  if (!host || !host.querySelectorAll) return;
  host.querySelectorAll("[data-sol-timer-ui='1']").forEach(n => { try { n.remove(); } catch (e) {} });
}

export function hideCheckButtons(btns: HTMLElement[]): void {
  for (const b of btns) {
    if (!b || !b.style) continue;
    if (ds(b)[DataKey.ChkHidden] === "1") continue;
    ds(b)[DataKey.ChkHidden] = "1";
    ds(b)[DataKey.PrevDisplayChk] = b.style.display || "";
    b.style.display = "none";
    b.setAttribute("hidden", "");
  }
}

export function forceShowCheckButtons(btns: HTMLElement[]): void {
  for (const b of btns) {
    if (!b || !b.style) continue;
    b.style.display = ds(b)[DataKey.PrevDisplayChk] || "";
    b.removeAttribute("hidden");
    b.removeAttribute("aria-hidden");
    b.style.visibility = "";
    b.style.pointerEvents = "";
    b.style.opacity = "";
    delete ds(b)[DataKey.ChkHidden];
    delete ds(b)[DataKey.PrevDisplayChk];
  }
}

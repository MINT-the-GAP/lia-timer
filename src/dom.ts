// DOM inspection, button discovery, host resolution, and check-button visibility.

import { DataKey, ds } from "./config";

const BTN_SELECTOR = "button, input[type='button'], a";

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

export function isHintBtn(b: Element): boolean {
  const t = normText(b);
  if (!t) return false;
  if (/(reset|zurück|zurueck|neustart)/.test(t)) return false;
  if (/(prüfen|pruefen|check)/.test(t)) return false;
  if (/(auf(lö|lo)sen|l(ö|oe)sung|solution|answer|antwort|reveal)/.test(t)) return false;
  return /(hint|hints|hinweis|hinweise|tipp|tipps|help)/.test(t);
}

// Builds a deduplicated list of ancestor scopes to search: optional prepended anchor,
// nearest lia-quiz scope, then up to 8 parent elements starting from walkFrom.
function buildScopeList(walkFrom: Element | null, anchor: Element | null): Element[] {
  const scopes: Element[] = [];
  if (anchor) scopes.push(anchor);

  const quizScope =
    (walkFrom && walkFrom.matches && (walkFrom.matches("lia-quiz, .lia-quiz") ? walkFrom : null)) ||
    (walkFrom && walkFrom.closest ? walkFrom.closest("lia-quiz, .lia-quiz") : null) ||
    null;
  if (quizScope) scopes.push(quizScope);

  let p = walkFrom ? walkFrom.parentElement : null, steps = 0;
  while (p && steps++ < 8) { scopes.push(p); p = p.parentElement; }

  return scopes;
}

// Nearest matching button by scope, else the last visible one anywhere in the root.
function findButtonSmart(el: Element, match: (b: Element) => boolean): HTMLElement | null {
  const root = el.getRootNode ? el.getRootNode() : document;
  const scopes = buildScopeList(el, null);

  for (const s of scopes) {
    try {
      const btns = Array.from(s.querySelectorAll(BTN_SELECTOR)).filter(match);
      if (btns.length) return btns[btns.length - 1] as HTMLElement;
    } catch (e) {} // scope may be detached; try the next one
  }

  try {
    const rootEl = root as Document | ShadowRoot;
    const btns = rootEl.querySelectorAll
      ? Array.from(rootEl.querySelectorAll(BTN_SELECTOR)).filter(match)
      : [];
    for (let i = btns.length - 1; i >= 0; i--) {
      const b = btns[i] as HTMLElement;
      if (b && b.getClientRects && b.getClientRects().length) return b;
    }
    return (btns[btns.length - 1] as HTMLElement) || null;
  } catch (e) {} // root may be inaccessible; caller treats null as "not found yet"
  return null;
}

export function findSolutionButtonSmart(el: Element): HTMLElement | null {
  return findButtonSmart(el, isSolutionBtn);
}

export function findCheckButtonsSmart(el: Element, solBtn: HTMLElement | null): HTMLElement[] {
  const root = el.getRootNode ? el.getRootNode() : document;
  const walkFrom = solBtn ?? el;
  const scopes = buildScopeList(walkFrom, solBtn?.parentElement ?? null);

  for (const s of scopes) {
    try {
      const btns = Array.from(s.querySelectorAll(BTN_SELECTOR)).filter(isCheckBtn);
      if (btns.length) return btns as HTMLElement[];
    } catch (e) {} // scope may be detached; try the next one
  }

  try {
    const rootEl = root as Document | ShadowRoot;
    const all = rootEl.querySelectorAll
      ? Array.from(rootEl.querySelectorAll(BTN_SELECTOR)).filter(isCheckBtn)
      : [];
    return all.slice(0, 8) as HTMLElement[];
  } catch (e) {} // root may be inaccessible; no check buttons to hook
  return [];
}

export function findHintButtonSmart(el: Element): HTMLElement | null {
  return findButtonSmart(el, isHintBtn);
}

export function getControlHost(el: Element, solBtn: HTMLElement | null): Element {
  if (solBtn && solBtn.parentElement) return solBtn.parentElement;
  const quizScope = (el.closest ? el.closest("lia-quiz, .lia-quiz") : null) || null;
  return quizScope || el.parentElement || document.body;
}

export function cleanupUiInHost(host: Element, uiScope?: string): void {
  if (!host || !host.querySelectorAll) return;
  const sel = uiScope
    ? `[data-sol-timer-ui='${uiScope}']`
    : "[data-sol-timer-ui]";
  host.querySelectorAll(sel).forEach(n => { try { n.remove(); } catch (e) {} }); // already detached is fine
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

// Top-level scan loop: CSS injection, shadow root discovery, mutation observers, and element arming.

import { STYLE_ID, CSS, getState } from "./config";
import { tryArm } from "./arm";

function injectStyleIntoRoot(root: Node): void {
  try {
    if (!root) return;
    if (root.nodeType === 9) {
      const doc = root as Document;
      if (!doc.head) return;
      if (doc.getElementById(STYLE_ID)) return;
      const st = doc.createElement("style");
      st.id = STYLE_ID;
      st.textContent = CSS;
      doc.head.appendChild(st);
      return;
    }
    if (root.nodeType === 11 && (root as ShadowRoot).host) {
      const sr = root as ShadowRoot;
      if (sr.querySelector && sr.querySelector(`style[data-id="${STYLE_ID}"]`)) return;
      const st = document.createElement("style");
      st.setAttribute("data-id", STYLE_ID);
      st.textContent = CSS;
      sr.appendChild(st);
    }
  } catch (e) {}
}

function getShadowRoots(root: Node): ShadowRoot[] {
  const roots: ShadowRoot[] = [];
  try {
    const start = root.nodeType === 9 ? (root as Document).documentElement : root as Element;
    if (!start) return roots;
    const walker = document.createTreeWalker(start, NodeFilter.SHOW_ELEMENT, null);
    let node: Node | null = walker.currentNode;
    while (node) {
      if ((node as Element).shadowRoot) roots.push((node as Element).shadowRoot!);
      node = walker.nextNode();
    }
  } catch (e) {}
  return roots;
}

function observeRoot(root: Node): void {
  const STATE = getState();
  if (!root || STATE.observedRoots.has(root)) return;
  STATE.observedRoots.add(root);
  injectStyleIntoRoot(root);
  try {
    const mo = new MutationObserver(() => { scanAll(); });
    mo.observe(root, { childList: true, subtree: true });
    STATE.observers.push(mo);
  } catch (e) {}
}

// Returns the number of newly-armed elements found in this pass.
export function scanAll(): number {
  const roots: Node[] = [document, ...getShadowRoots(document)];
  let armed = 0;
  for (const r of roots) {
    observeRoot(r);
    let els: Element[] = [];
    try {
      const rootEl = r as Document | ShadowRoot;
      els = rootEl.querySelectorAll
        ? Array.from(rootEl.querySelectorAll("[data-solution-timer]"))
        : [];
    } catch (e) {}
    for (const el of els) {
      if (tryArm(el)) armed++;
    }
  }
  return armed;
}

// Re-runs fn at each delay; stops early once the count stops growing.
function retryUntilStable(fn: () => number, delays = [0, 150, 400, 900]): void {
  let prev = -1;
  const attempt = (i: number) => {
    const count = fn();
    if (i >= delays.length - 1 || count === prev) return;
    prev = count;
    setTimeout(() => attempt(i + 1), delays[i + 1]);
  };
  attempt(0);
}

export function init(): void {
  injectStyleIntoRoot(document);
  retryUntilStable(scanAll);
}

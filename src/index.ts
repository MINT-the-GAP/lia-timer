(function () {
  const WIN = window;
  const DOC = document;

  // =========================
  // Per-Window/Slide Guard
  // =========================
  const GUARD = "__LIA_SOLUTION_TIMER_V0_0_1__";
  if ((WIN as any)[GUARD]) return;
  (WIN as any)[GUARD] = true;

  // =========================
  // State (per slide)
  // =========================
  interface TimerItem {
    btn: HTMLElement;
    badge: HTMLElement | null;
    endAt: number;
  }

  interface PluginState {
    items: Map<string, TimerItem>;
    ticker: ReturnType<typeof setInterval> | null;
    observedRoots: WeakSet<Node>;
    observers: MutationObserver[];
  }

  const STATE: PluginState =
    (WIN as any).__liaSolTimerV001 ||
    ((WIN as any).__liaSolTimerV001 = {
      items: new Map(),
      ticker: null,
      observedRoots: new WeakSet(),
      observers: [],
    });

  // =========================
  // CSS Injection (Document + ShadowRoots)
  // =========================
  const STYLE_ID = "__lia_solution_timer_css_v0_0_1__";
  const CSS = `
.lia-sol-timer-badge{
  display:inline-block;
  margin-left:.6rem;
  padding:.15rem .45rem;
  border:1px solid currentColor;
  border-radius:.5rem;
  font-size:.85em;
  opacity:.85;
  user-select:none;
}
.lia-sol-timer-startbtn{ margin-right:.6rem; }
`;

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
        const st = DOC.createElement("style");
        st.setAttribute("data-id", STYLE_ID);
        st.textContent = CSS;
        sr.appendChild(st);
      }
    } catch (e) {}
  }

  // =========================
  // Utils
  // =========================
  function parseBool(raw: string | null, def = true): boolean {
    if (raw == null) return def;
    const s = String(raw).trim().toLowerCase();
    if (!s) return def;
    if (["0", "false", "off", "no", "n", "none"].includes(s)) return false;
    if (["1", "true", "on", "yes", "y"].includes(s)) return true;
    return def;
  }

  function parseStartMode(el: Element): "immediate" | "onclick" | "oncheck" {
    const v = (el.getAttribute("data-solution-timer-start") || "").trim().toLowerCase();
    if (/^(onclick|click|manual|startbutton|start-button|start_button)$/.test(v)) return "onclick";
    if (/^(oncheck|check|aftercheck|after-check|after_check)$/.test(v)) return "oncheck";
    return "immediate";
  }

  function parseTimeToMs(raw: string | null): number {
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
      else if (["s","sec","secs","second","seconds"].includes(u)) total += n * 1000;
      else if (["m","min","mins","minute","minutes"].includes(u)) total += n * 60000;
      else if (["h","hr","hrs","hour","hours"].includes(u)) total += n * 3600000;
    }
    return found ? Math.max(0, total) : 0;
  }

  function formatRemaining(ms: number): string {
    ms = Math.max(0, ms);
    const sec = Math.ceil(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m <= 0 ? `${s}s` : `${m}:${String(s).padStart(2, "0")}`;
  }

  function normText(el: Element): string {
    return ((el as HTMLElement).textContent || (el as HTMLInputElement).value || el.getAttribute("aria-label") || el.getAttribute("title") || "")
      .trim().toLowerCase();
  }

  function isCheckBtn(b: Element): boolean {
    const t = normText(b);
    if (!t) return false;
    if (/(reset|zurück|zurueck|neustart)/.test(t)) return false;
    if (/(auf(lö|lo)sen|l(ö|oe)sung|solution|answer|antwort|reveal)/.test(t)) return false;
    return /(prüfen|pruefen|check)\b/.test(t);
  }

  function isSolutionBtn(b: Element): boolean {
    const t = normText(b);
    if (!t) return false;
    if (/(reset|zurück|zurueck|neustart)/.test(t)) return false;
    if (/(prüfen|pruefen|check)/.test(t)) return false;
    return /(auf(lö|lo)sen|l(ö|oe)sung|solution|answer|antwort|reveal)/.test(t);
  }

  // =========================
  // Smart finders (RootNode: Document or ShadowRoot)
  // =========================
  function findSolutionButtonSmart(el: Element): HTMLElement | null {
    const root = el.getRootNode ? el.getRootNode() : DOC;
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

  function findCheckButtonsSmart(el: Element, solBtn: HTMLElement | null): HTMLElement[] {
    const root = el.getRootNode ? el.getRootNode() : DOC;
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

  // =========================
  // Host + Cleanup (control host only)
  // =========================
  function getControlHost(el: Element, solBtn: HTMLElement | null): Element {
    if (solBtn && solBtn.parentElement) return solBtn.parentElement;
    const quizScope = (el.closest ? el.closest("lia-quiz, .lia-quiz") : null) || null;
    return quizScope || el.parentElement || DOC.body;
  }

  function cleanupUiInHost(host: Element): void {
    if (!host || !host.querySelectorAll) return;
    host.querySelectorAll("[data-sol-timer-ui='1']").forEach(n => { try { n.remove(); } catch (e) {} });
  }

  // =========================
  // Hide / FORCE-SHOW Check buttons
  // =========================
  function hideCheckButtons(btns: HTMLElement[]): void {
    for (const b of btns) {
      if (!b || !b.style) continue;
      if ((b.dataset as any).__solTimerChkHidden === "1") continue;
      (b.dataset as any).__solTimerChkHidden = "1";
      (b.dataset as any).__solTimerPrevDisplayChk = b.style.display || "";
      b.style.display = "none";
      b.setAttribute("hidden", "");
    }
  }

  function forceShowCheckButtons(btns: HTMLElement[]): void {
    for (const b of btns) {
      if (!b || !b.style) continue;
      b.style.display = (b.dataset as any).__solTimerPrevDisplayChk || "";
      b.removeAttribute("hidden");
      b.removeAttribute("aria-hidden");
      b.style.visibility = "";
      b.style.pointerEvents = "";
      b.style.opacity = "";
      delete (b.dataset as any).__solTimerChkHidden;
      delete (b.dataset as any).__solTimerPrevDisplayChk;
    }
  }

  // =========================
  // Reveal ticker
  // =========================
  function ensureTicker(): void {
    if (STATE.ticker) return;
    STATE.ticker = WIN.setInterval(() => {
      const now = Date.now();
      for (const [key, it] of STATE.items.entries()) {
        if (!it.btn || !it.btn.isConnected) { STATE.items.delete(key); continue; }
        const rem = it.endAt - now;
        if (rem <= 0) {
          it.btn.style.display = (it.btn.dataset as any).__solTimerPrevDisplay || "";
          delete (it.btn.dataset as any).__solTimerPrevDisplay;
          if (it.badge && it.badge.isConnected) it.badge.remove();
          STATE.items.delete(key);
        } else {
          if (it.badge) it.badge.textContent = `Solution in ${formatRemaining(rem)}`;
        }
      }
      if (STATE.items.size === 0) {
        WIN.clearInterval(STATE.ticker!);
        STATE.ticker = null;
      }
    }, 250);
  }

  function scheduleReveal(btn: HTMLElement, badge: HTMLElement | null, ms: number): void {
    const key = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    STATE.items.set(key, { btn, badge, endAt: Date.now() + ms });
    ensureTicker();
  }

  // =========================
  // ARM (pending; dedupe via Solution button)
  // =========================
  function tryArm(el: Element): boolean {
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

    const doc = solBtn.ownerDocument || DOC;
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

  // =========================
  // Shadow roots scanning
  // =========================
  function getShadowRoots(root: Node): ShadowRoot[] {
    const roots: ShadowRoot[] = [];
    try {
      const start = root.nodeType === 9 ? (root as Document).documentElement : root as Element;
      if (!start) return roots;
      const walker = DOC.createTreeWalker(start, NodeFilter.SHOW_ELEMENT, null);
      let node: Node | null = walker.currentNode;
      while (node) {
        if ((node as Element).shadowRoot) roots.push((node as Element).shadowRoot!);
        node = walker.nextNode();
      }
    } catch (e) {}
    return roots;
  }

  function observeRoot(root: Node): void {
    if (!root || STATE.observedRoots.has(root)) return;
    STATE.observedRoots.add(root);
    injectStyleIntoRoot(root);
    try {
      const mo = new MutationObserver(() => scanAll());
      mo.observe(root, { childList: true, subtree: true });
      STATE.observers.push(mo);
    } catch (e) {}
  }

  function scanAll(): void {
    const roots: Node[] = [DOC, ...getShadowRoots(DOC)];
    for (const r of roots) {
      observeRoot(r);
      let els: Element[] = [];
      try {
        const rootEl = r as Document | ShadowRoot;
        els = rootEl.querySelectorAll ? Array.from(rootEl.querySelectorAll("[data-solution-timer]")) : [];
      } catch (e) {}
      for (const el of els) {
        tryArm(el);
      }
    }
  }

  // init
  injectStyleIntoRoot(DOC);
  scanAll();
  setTimeout(scanAll, 0);
  setTimeout(scanAll, 120);
  setTimeout(scanAll, 500);
})();

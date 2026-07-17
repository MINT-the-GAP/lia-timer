// Entry point: guards against double-init, then kicks off the plugin.
// Global constants, shared interfaces, and singleton state accessor.
const $dba5cd6913742fdd$export$eeaa1397af760ecc = {
    Armed: "__solTimerArmed",
    ArmedSolution: "__solTimerArmedSolution",
    ArmedHint: "__solTimerArmedHint",
    Bound: "__solTimerBound",
    PrevDisplay: "__solTimerPrevDisplay",
    PrevDisplayChk: "__solTimerPrevDisplayChk",
    ChkHidden: "__solTimerChkHidden",
    Hooked: "__solTimerHooked"
};
function $dba5cd6913742fdd$export$6c6581d59e81d1b9(el) {
    return el.dataset;
}
const $dba5cd6913742fdd$export$f237bebc119028c = "__LIA_SOLUTION_TIMER_V0_0_1__";
const $dba5cd6913742fdd$export$13bec68de17cb8b1 = "__lia_solution_timer_css_v0_0_1__";
const $dba5cd6913742fdd$export$c4ffa16951855e28 = `
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
function $dba5cd6913742fdd$export$50fdfeece43146fd() {
    const WIN = window;
    return WIN.__liaSolTimerV001 || (WIN.__liaSolTimerV001 = {
        items: new Map(),
        ticker: null,
        observedRoots: new WeakSet(),
        observers: []
    });
}


// Top-level scan loop: CSS injection, shadow root discovery, mutation observers, and element arming.

// Arming logic: reads timer attributes and wires up the chosen start mode.

// Pure parsing and formatting utilities — no DOM, no side effects.
function $5e471daa26bff96a$export$8d1e137bafb4fdd5(raw, def = true) {
    if (raw == null) return def;
    const s = String(raw).trim().toLowerCase();
    if (!s) return def;
    if ([
        "0",
        "false",
        "off",
        "no",
        "n",
        "none"
    ].includes(s)) return false;
    if ([
        "1",
        "true",
        "on",
        "yes",
        "y"
    ].includes(s)) return true;
    return def;
}
function $5e471daa26bff96a$export$5d0c4199026f0e1d(el) {
    const v = (el.getAttribute("data-solution-timer-start") || "").trim().toLowerCase();
    if (/^(onclick|click|manual|startbutton|start-button|start_button)$/.test(v)) return "onclick";
    if (/^(oncheck|check|aftercheck|after-check|after_check)$/.test(v)) return "oncheck";
    return "immediate";
}
function $5e471daa26bff96a$export$9d770012815ccd9(el, attrName) {
    const v = (el.getAttribute(attrName) || "").trim().toLowerCase();
    if (/^(onclick|click|manual|startbutton|start-button|start_button)$/.test(v)) return "onclick";
    if (/^(oncheck|check|aftercheck|after-check|after_check)$/.test(v)) return "oncheck";
    return "immediate";
}
function $5e471daa26bff96a$export$87a58e325bf95624(raw) {
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
    let match;
    while(match = re.exec(s0)){
        found = true;
        const n = parseFloat(match[1]);
        const u = match[2];
        if (u === "ms") total += n;
        else if ([
            "s",
            "sec",
            "secs",
            "second",
            "seconds"
        ].includes(u)) total += n * 1000;
        else if ([
            "m",
            "min",
            "mins",
            "minute",
            "minutes"
        ].includes(u)) total += n * 60000;
        else if ([
            "h",
            "hr",
            "hrs",
            "hour",
            "hours"
        ].includes(u)) total += n * 3600000;
    }
    return found ? Math.max(0, total) : 0;
}
function $5e471daa26bff96a$export$7804ef7b40a0b2e(ms) {
    ms = Math.max(0, ms);
    const sec = Math.ceil(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return m <= 0 ? `${s}s` : `${m}:${String(s).padStart(2, "0")}`;
}


// DOM inspection, button discovery, host resolution, and check-button visibility.

function $2f96dbadf81a4e19$export$a83e063a54f70454(el) {
    return (el.textContent || el.value || el.getAttribute("aria-label") || el.getAttribute("title") || "").trim().toLowerCase();
}
function $2f96dbadf81a4e19$export$6ce148ac6aa28105(b) {
    const t = $2f96dbadf81a4e19$export$a83e063a54f70454(b);
    if (!t) return false;
    if (/(reset|zurück|zurueck|neustart)/.test(t)) return false;
    if (/(auf(lö|lo)sen|l(ö|oe)sung|solution|answer|antwort|reveal)/.test(t)) return false;
    return /(prüfen|pruefen|check)\b/.test(t);
}
function $2f96dbadf81a4e19$export$f7f65fff92c3f714(b) {
    const t = $2f96dbadf81a4e19$export$a83e063a54f70454(b);
    if (!t) return false;
    if (/(reset|zurück|zurueck|neustart)/.test(t)) return false;
    if (/(prüfen|pruefen|check)/.test(t)) return false;
    return /(auf(lö|lo)sen|l(ö|oe)sung|solution|answer|antwort|reveal)/.test(t);
}
function $2f96dbadf81a4e19$export$c7b32188fc98016c(b) {
    const t = $2f96dbadf81a4e19$export$a83e063a54f70454(b);
    if (!t) return false;
    if (/(reset|zurück|zurueck|neustart)/.test(t)) return false;
    if (/(prüfen|pruefen|check)/.test(t)) return false;
    if (/(auf(lö|lo)sen|l(ö|oe)sung|solution|answer|antwort|reveal)/.test(t)) return false;
    return /(hint|hints|hinweis|hinweise|tipp|tipps|help)/.test(t);
}
// Builds a deduplicated list of ancestor scopes to search: optional prepended anchor,
// nearest lia-quiz scope, then up to 8 parent elements starting from walkFrom.
function $2f96dbadf81a4e19$var$buildScopeList(walkFrom, anchor) {
    const scopes = [];
    if (anchor) scopes.push(anchor);
    const quizScope = walkFrom && walkFrom.matches && (walkFrom.matches("lia-quiz, .lia-quiz") ? walkFrom : null) || (walkFrom && walkFrom.closest ? walkFrom.closest("lia-quiz, .lia-quiz") : null) || null;
    if (quizScope) scopes.push(quizScope);
    let p = walkFrom ? walkFrom.parentElement : null, steps = 0;
    while(p && steps++ < 8){
        scopes.push(p);
        p = p.parentElement;
    }
    return scopes;
}
function $2f96dbadf81a4e19$export$ac26612a3a9a3d0a(el) {
    const root = el.getRootNode ? el.getRootNode() : document;
    const scopes = $2f96dbadf81a4e19$var$buildScopeList(el, null);
    for (const s of scopes)try {
        const btns = Array.from(s.querySelectorAll("button, input[type='button'], a")).filter($2f96dbadf81a4e19$export$f7f65fff92c3f714);
        if (btns.length) return btns[btns.length - 1];
    } catch (e) {}
    try {
        const rootEl = root;
        const btns = rootEl.querySelectorAll ? Array.from(rootEl.querySelectorAll("button, input[type='button'], a")).filter($2f96dbadf81a4e19$export$f7f65fff92c3f714) : [];
        for(let i = btns.length - 1; i >= 0; i--){
            const b = btns[i];
            if (b && b.getClientRects && b.getClientRects().length) return b;
        }
        return btns[btns.length - 1] || null;
    } catch (e) {}
    return null;
}
function $2f96dbadf81a4e19$export$1ff37ec694e634cb(el, solBtn) {
    const root = el.getRootNode ? el.getRootNode() : document;
    const walkFrom = solBtn ?? el;
    const scopes = $2f96dbadf81a4e19$var$buildScopeList(walkFrom, solBtn?.parentElement ?? null);
    for (const s of scopes)try {
        const btns = Array.from(s.querySelectorAll("button, input[type='button'], a")).filter($2f96dbadf81a4e19$export$6ce148ac6aa28105);
        if (btns.length) return btns;
    } catch (e) {}
    try {
        const rootEl = root;
        const all = rootEl.querySelectorAll ? Array.from(rootEl.querySelectorAll("button, input[type='button'], a")).filter($2f96dbadf81a4e19$export$6ce148ac6aa28105) : [];
        return all.slice(0, 8);
    } catch (e) {}
    return [];
}
function $2f96dbadf81a4e19$export$d39aea4870896ca8(el) {
    const root = el.getRootNode ? el.getRootNode() : document;
    const scopes = $2f96dbadf81a4e19$var$buildScopeList(el, null);
    for (const s of scopes)try {
        const btns = Array.from(s.querySelectorAll("button, input[type='button'], a")).filter($2f96dbadf81a4e19$export$c7b32188fc98016c);
        if (btns.length) return btns[btns.length - 1];
    } catch (e) {}
    try {
        const rootEl = root;
        const btns = rootEl.querySelectorAll ? Array.from(rootEl.querySelectorAll("button, input[type='button'], a")).filter($2f96dbadf81a4e19$export$c7b32188fc98016c) : [];
        for(let i = btns.length - 1; i >= 0; i--){
            const b = btns[i];
            if (b && b.getClientRects && b.getClientRects().length) return b;
        }
        return btns[btns.length - 1] || null;
    } catch (e) {}
    return null;
}
function $2f96dbadf81a4e19$export$d677d1715dffa34a(el, solBtn) {
    if (solBtn && solBtn.parentElement) return solBtn.parentElement;
    const quizScope = (el.closest ? el.closest("lia-quiz, .lia-quiz") : null) || null;
    return quizScope || el.parentElement || document.body;
}
function $2f96dbadf81a4e19$export$2184e5bae6ce039b(host, uiScope) {
    if (!host || !host.querySelectorAll) return;
    const sel = uiScope ? `[data-sol-timer-ui='${uiScope}']` : "[data-sol-timer-ui]";
    host.querySelectorAll(sel).forEach((n)=>{
        try {
            n.remove();
        } catch (e) {}
    });
}
function $2f96dbadf81a4e19$export$94ddb935abe0ba38(btns) {
    for (const b of btns){
        if (!b || !b.style) continue;
        if ((0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(b)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).ChkHidden] === "1") continue;
        (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(b)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).ChkHidden] = "1";
        (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(b)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).PrevDisplayChk] = b.style.display || "";
        b.style.display = "none";
        b.setAttribute("hidden", "");
    }
}
function $2f96dbadf81a4e19$export$bdc20daf8ea1bef2(btns) {
    for (const b of btns){
        if (!b || !b.style) continue;
        b.style.display = (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(b)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).PrevDisplayChk] || "";
        b.removeAttribute("hidden");
        b.removeAttribute("aria-hidden");
        b.style.visibility = "";
        b.style.pointerEvents = "";
        b.style.opacity = "";
        delete (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(b)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).ChkHidden];
        delete (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(b)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).PrevDisplayChk];
    }
}


// Interval-based countdown ticker and deferred reveal scheduling.


function $24903ece0cd2ba58$export$d5ce91302947a611() {
    const STATE = (0, $dba5cd6913742fdd$export$50fdfeece43146fd)();
    if (STATE.ticker) return;
    STATE.ticker = window.setInterval(()=>{
        const now = Date.now();
        for (const [key, it] of STATE.items.entries()){
            if (!it.btn || !it.btn.isConnected) {
                STATE.items.delete(key);
                continue;
            }
            const rem = it.endAt - now;
            if (rem <= 0) {
                it.btn.style.display = (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(it.btn)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).PrevDisplay] || "";
                delete (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(it.btn)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).PrevDisplay];
                if (it.badge && it.badge.isConnected) it.badge.remove();
                STATE.items.delete(key);
            } else if (it.badge) it.badge.textContent = `${it.label} in ${(0, $5e471daa26bff96a$export$7804ef7b40a0b2e)(rem)}`;
        }
        if (STATE.items.size === 0) {
            window.clearInterval(STATE.ticker);
            STATE.ticker = null;
        }
    }, 250);
}
function $24903ece0cd2ba58$export$cd7f9ccaf0cd3a43(btn, badge, ms, label) {
    const STATE = (0, $dba5cd6913742fdd$export$50fdfeece43146fd)();
    const key = `${Date.now()}_${Math.random().toString(16).slice(2)}`;
    STATE.items.set(key, {
        btn: btn,
        badge: badge,
        endAt: Date.now() + ms,
        label: label
    });
    $24903ece0cd2ba58$export$d5ce91302947a611();
}


function $5cd4c2fb7948d554$var$armImmediate({ timerBtn: timerBtn, host: host, ms: ms, showBadge: showBadge, makeBadge: makeBadge, label: label }) {
    let badge = null;
    if (showBadge) {
        badge = makeBadge(`${label} in ${(0, $5e471daa26bff96a$export$7804ef7b40a0b2e)(ms)}`);
        host.appendChild(badge);
    }
    (0, $24903ece0cd2ba58$export$cd7f9ccaf0cd3a43)(timerBtn, badge, ms, label);
}
function $5cd4c2fb7948d554$var$armOnCheck({ el: el, timerBtn: timerBtn, host: host, ms: ms, showBadge: showBadge, makeBadge: makeBadge, label: label }) {
    let started = false;
    let badge = null;
    if (showBadge) {
        badge = makeBadge(`${label} timer starts after checking`);
        host.appendChild(badge);
    }
    const startNow = ()=>{
        if (started) return;
        started = true;
        if (badge) badge.textContent = `${label} in ${(0, $5e471daa26bff96a$export$7804ef7b40a0b2e)(ms)}`;
        (0, $24903ece0cd2ba58$export$cd7f9ccaf0cd3a43)(timerBtn, badge, ms, label);
    };
    const checks = (0, $2f96dbadf81a4e19$export$1ff37ec694e634cb)(el, timerBtn);
    if (checks[0] && (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(checks[0])[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).Hooked] !== "1") {
        (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(checks[0])[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).Hooked] = "1";
        checks[0].addEventListener("click", startNow, {
            once: true,
            passive: true
        });
    } else host.addEventListener("click", (ev)=>{
        const t = ev.target;
        if (!t || !t.closest) return;
        const b = t.closest("button, input[type='button'], a");
        if (b && (0, $2f96dbadf81a4e19$export$6ce148ac6aa28105)(b)) startNow();
    }, {
        capture: true,
        passive: true
    });
}
function $5cd4c2fb7948d554$var$armOnClick({ el: el, timerBtn: timerBtn, host: host, doc: doc, ms: ms, showBadge: showBadge, makeBadge: makeBadge, startLabel: startLabel, label: label, hideChecksUntilStart: hideChecksUntilStart, uiScope: uiScope }) {
    if (hideChecksUntilStart) (0, $2f96dbadf81a4e19$export$94ddb935abe0ba38)((0, $2f96dbadf81a4e19$export$1ff37ec694e634cb)(el, timerBtn));
    const startBtn = doc.createElement("button");
    startBtn.type = "button";
    startBtn.textContent = startLabel;
    startBtn.className = "lia-btn lia-sol-timer-startbtn";
    startBtn.setAttribute("data-sol-timer-ui", uiScope);
    host.insertBefore(startBtn, host.firstChild);
    let started = false;
    startBtn.addEventListener("click", ()=>{
        if (started) return;
        started = true;
        if (hideChecksUntilStart) {
            const force = ()=>(0, $2f96dbadf81a4e19$export$bdc20daf8ea1bef2)((0, $2f96dbadf81a4e19$export$1ff37ec694e634cb)(el, timerBtn));
            force();
            setTimeout(force, 60);
            setTimeout(force, 250);
            setTimeout(force, 600);
        }
        try {
            startBtn.remove();
        } catch (e) {
            startBtn.disabled = true;
        }
        let badge = null;
        if (showBadge) {
            badge = makeBadge(`${label} in ${(0, $5e471daa26bff96a$export$7804ef7b40a0b2e)(ms)}`);
            host.appendChild(badge);
        }
        (0, $24903ece0cd2ba58$export$cd7f9ccaf0cd3a43)(timerBtn, badge, ms, label);
    }, {
        passive: true
    });
}
const $5cd4c2fb7948d554$var$STRATEGIES = {
    immediate: $5cd4c2fb7948d554$var$armImmediate,
    oncheck: $5cd4c2fb7948d554$var$armOnCheck,
    onclick: $5cd4c2fb7948d554$var$armOnClick
};
const $5cd4c2fb7948d554$var$SOLUTION_CFG = {
    timerAttr: "data-solution-timer",
    startAttr: "data-solution-timer-start",
    badgeAttr: "data-solution-timer-badge",
    startLabelAttr: "data-solution-timer-start-label",
    armedKey: (0, $dba5cd6913742fdd$export$eeaa1397af760ecc).ArmedSolution,
    label: "Solution",
    uiScope: "solution",
    hideChecksUntilStart: true,
    findButton: (0, $2f96dbadf81a4e19$export$ac26612a3a9a3d0a)
};
const $5cd4c2fb7948d554$var$HINT_CFG = {
    timerAttr: "data-hint-timer",
    startAttr: "data-hint-timer-start",
    badgeAttr: "data-hint-badge",
    startLabelAttr: "data-hint-timer-start-label",
    armedKey: (0, $dba5cd6913742fdd$export$eeaa1397af760ecc).ArmedHint,
    label: "Hint",
    uiScope: "hint",
    hideChecksUntilStart: false,
    findButton: (0, $2f96dbadf81a4e19$export$d39aea4870896ca8)
};
function $5cd4c2fb7948d554$var$tryArmTarget(el, cfg) {
    if ((0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(el)[cfg.armedKey] === "1") return true;
    const ms = (0, $5e471daa26bff96a$export$87a58e325bf95624)(el.getAttribute(cfg.timerAttr));
    if (ms <= 0) return false;
    const startMode = (0, $5e471daa26bff96a$export$9d770012815ccd9)(el, cfg.startAttr);
    const showBadge = (0, $5e471daa26bff96a$export$8d1e137bafb4fdd5)(el.getAttribute(cfg.badgeAttr), true);
    const startLabel = el.getAttribute(cfg.startLabelAttr) || "Start timer";
    const timerBtn = cfg.findButton(el);
    if (!timerBtn) return false;
    if ((0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(timerBtn)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).Bound] === "1") {
        (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(el)[cfg.armedKey] = "1";
        (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(el)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).Armed] = "1";
        return true;
    }
    (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(timerBtn)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).Bound] = "1";
    const doc = timerBtn.ownerDocument || document;
    const host = (0, $2f96dbadf81a4e19$export$d677d1715dffa34a)(el, timerBtn);
    (0, $2f96dbadf81a4e19$export$2184e5bae6ce039b)(host, cfg.uiScope);
    (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(timerBtn)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).PrevDisplay] = timerBtn.style.display || "";
    timerBtn.style.display = "none";
    (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(el)[cfg.armedKey] = "1";
    (0, $dba5cd6913742fdd$export$6c6581d59e81d1b9)(el)[(0, $dba5cd6913742fdd$export$eeaa1397af760ecc).Armed] = "1";
    const makeBadge = (text)=>{
        const badge = doc.createElement("span");
        badge.className = "lia-sol-timer-badge";
        badge.setAttribute("data-sol-timer-ui", cfg.uiScope);
        badge.textContent = text;
        return badge;
    };
    $5cd4c2fb7948d554$var$STRATEGIES[startMode]({
        el: el,
        timerBtn: timerBtn,
        host: host,
        doc: doc,
        ms: ms,
        showBadge: showBadge,
        label: cfg.label,
        startLabel: startLabel,
        hideChecksUntilStart: cfg.hideChecksUntilStart,
        uiScope: cfg.uiScope,
        makeBadge: makeBadge
    });
    return true;
}
function $5cd4c2fb7948d554$export$9ea6af4cf3708cf7(el) {
    const armedSolution = $5cd4c2fb7948d554$var$tryArmTarget(el, $5cd4c2fb7948d554$var$SOLUTION_CFG);
    const armedHint = $5cd4c2fb7948d554$var$tryArmTarget(el, $5cd4c2fb7948d554$var$HINT_CFG);
    return armedSolution || armedHint;
}


const $42ee8f97cb5987f8$var$TIMER_SELECTOR = "[data-solution-timer], [data-hint-timer]";
function $42ee8f97cb5987f8$var$injectStyleIntoRoot(root) {
    try {
        if (!root) return;
        if (root.nodeType === 9) {
            const doc = root;
            if (!doc.head) return;
            if (doc.getElementById((0, $dba5cd6913742fdd$export$13bec68de17cb8b1))) return;
            const st = doc.createElement("style");
            st.id = (0, $dba5cd6913742fdd$export$13bec68de17cb8b1);
            st.textContent = (0, $dba5cd6913742fdd$export$c4ffa16951855e28);
            doc.head.appendChild(st);
            return;
        }
        if (root.nodeType === 11 && root.host) {
            const sr = root;
            if (sr.querySelector && sr.querySelector(`style[data-id="${(0, $dba5cd6913742fdd$export$13bec68de17cb8b1)}"]`)) return;
            const st = document.createElement("style");
            st.setAttribute("data-id", (0, $dba5cd6913742fdd$export$13bec68de17cb8b1));
            st.textContent = (0, $dba5cd6913742fdd$export$c4ffa16951855e28);
            sr.appendChild(st);
        }
    } catch (e) {}
}
function $42ee8f97cb5987f8$var$getShadowRoots(root) {
    const roots = [];
    try {
        const start = root.nodeType === 9 ? root.documentElement : root;
        if (!start) return roots;
        const walker = document.createTreeWalker(start, NodeFilter.SHOW_ELEMENT, null);
        let node = walker.currentNode;
        while(node){
            if (node.shadowRoot) roots.push(node.shadowRoot);
            node = walker.nextNode();
        }
    } catch (e) {}
    return roots;
}
function $42ee8f97cb5987f8$var$observeRoot(root) {
    const STATE = (0, $dba5cd6913742fdd$export$50fdfeece43146fd)();
    if (!root || STATE.observedRoots.has(root)) return;
    STATE.observedRoots.add(root);
    $42ee8f97cb5987f8$var$injectStyleIntoRoot(root);
    try {
        const mo = new MutationObserver(()=>{
            $42ee8f97cb5987f8$export$5e337cddb229c47e();
        });
        mo.observe(root, {
            childList: true,
            subtree: true
        });
        STATE.observers.push(mo);
    } catch (e) {}
}
function $42ee8f97cb5987f8$export$5e337cddb229c47e() {
    const roots = [
        document,
        ...$42ee8f97cb5987f8$var$getShadowRoots(document)
    ];
    let armed = 0;
    for (const r of roots){
        $42ee8f97cb5987f8$var$observeRoot(r);
        let els = [];
        try {
            const rootEl = r;
            els = rootEl.querySelectorAll ? Array.from(rootEl.querySelectorAll($42ee8f97cb5987f8$var$TIMER_SELECTOR)) : [];
        } catch (e) {}
        for (const el of els)if ((0, $5cd4c2fb7948d554$export$9ea6af4cf3708cf7)(el)) armed++;
    }
    return armed;
}
// Re-runs fn at each delay; stops early once the count stops growing.
function $42ee8f97cb5987f8$var$retryUntilStable(fn, delays = [
    0,
    150,
    400,
    900
]) {
    let prev = -1;
    const attempt = (i)=>{
        const count = fn();
        if (i >= delays.length - 1 || count === prev) return;
        prev = count;
        setTimeout(()=>attempt(i + 1), delays[i + 1]);
    };
    attempt(0);
}
function $42ee8f97cb5987f8$export$2cd8252107eb640b() {
    $42ee8f97cb5987f8$var$injectStyleIntoRoot(document);
    $42ee8f97cb5987f8$var$retryUntilStable($42ee8f97cb5987f8$export$5e337cddb229c47e);
}


const $882b6d93070905b3$var$WIN = window;
if (!$882b6d93070905b3$var$WIN[0, $dba5cd6913742fdd$export$f237bebc119028c]) {
    $882b6d93070905b3$var$WIN[0, $dba5cd6913742fdd$export$f237bebc119028c] = true;
    (0, $dba5cd6913742fdd$export$50fdfeece43146fd)(); // ensure state singleton is initialised
    (0, $42ee8f97cb5987f8$export$2cd8252107eb640b)();
}


//# sourceMappingURL=index.js.map

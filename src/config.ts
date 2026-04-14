// Global constants, shared interfaces, and singleton state accessor.

export type StartMode = "immediate" | "onclick" | "oncheck";

export interface TimerItem {
  btn: HTMLElement;
  badge: HTMLElement | null;
  endAt: number;
}

export interface PluginState {
  items: Map<string, TimerItem>;
  ticker: ReturnType<typeof setInterval> | null;
  observedRoots: WeakSet<Node>;
  observers: MutationObserver[];
}

export const DataKey = {
  Armed          : "__solTimerArmed",
  Bound          : "__solTimerBound",
  PrevDisplay    : "__solTimerPrevDisplay",
  PrevDisplayChk : "__solTimerPrevDisplayChk",
  ChkHidden      : "__solTimerChkHidden",
  Hooked         : "__solTimerHooked",
} as const;

export function ds(el: HTMLElement): Record<string, string | undefined> {
  return el.dataset as unknown as Record<string, string | undefined>;
}

export const GUARD = "__LIA_SOLUTION_TIMER_V0_0_1__";
export const STYLE_ID = "__lia_solution_timer_css_v0_0_1__";
export const CSS = `
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

export function getState(): PluginState {
  const WIN = window as any;
  return (
    WIN.__liaSolTimerV001 ||
    (WIN.__liaSolTimerV001 = {
      items: new Map(),
      ticker: null,
      observedRoots: new WeakSet(),
      observers: [],
    })
  );
}

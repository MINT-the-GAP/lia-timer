// Entry point: guards against double-init, then kicks off the plugin.

import { pluginWindow, getState } from "./config";
import { init } from "./scanner";

const WIN = pluginWindow();
if (!WIN.__LIA_SOLUTION_TIMER_V0_0_1__) {
  WIN.__LIA_SOLUTION_TIMER_V0_0_1__ = true;
  getState(); // ensure state singleton is initialised
  init();
}

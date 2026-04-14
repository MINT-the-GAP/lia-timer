// Entry point: guards against double-init, then kicks off the plugin.

import { GUARD, getState } from "./config";
import { init } from "./scanner";

const WIN = window as any;
if (!WIN[GUARD]) {
  WIN[GUARD] = true;
  getState(); // ensure state singleton is initialised
  init();
}

import type { PuduGraphTabConfig } from "../types";

type Listener = () => void;

let selectedTab: PuduGraphTabConfig | null = null;
const listeners = new Set<Listener>();

export const tabStore = {
  get value() {
    return selectedTab;
  },
  set(tabConfig: PuduGraphTabConfig) {
    if (selectedTab !== tabConfig) {
      selectedTab = tabConfig;
      listeners.forEach((fn) => fn());
    }
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn); // return unsubscribe function
  },
};

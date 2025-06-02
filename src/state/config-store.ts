import type { PuduGraphConfig } from "../types";

type Listener = () => void;

let config: PuduGraphConfig | null = null;

const listeners = new Set<Listener>();

export const configStore = {
  get value() {
    return config;
  },
  set(newConfig: PuduGraphConfig) {
    if (config != newConfig) {
      config = newConfig;
      console.log("configStore set", config);
      listeners.forEach((fn) => fn());
    }
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn); // return unsubscribe function
  },
};

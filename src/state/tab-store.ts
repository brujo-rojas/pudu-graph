type Listener = () => void;

let selectedTabId = 0;
const listeners = new Set<Listener>();

export const tabStore = {
  get value() {
    return selectedTabId;
  },
  set(id: number) {
    if (selectedTabId !==id) {
      selectedTabId =id;
      listeners.forEach((fn) => fn());
    }
  },
  subscribe(fn: Listener) {
    listeners.add(fn);
    return () => listeners.delete(fn); // return unsubscribe function
  }
};

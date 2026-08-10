class Store {
  constructor() {
    this.state = {};
    this.listeners = new Map();
  }

  set(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    this.notify(key, value, oldValue);
  }

  get(key, defaultValue = null) {
    return this.state[key] ?? defaultValue;
  }

  update(key, updater) {
    const oldValue = this.state[key];
    const newValue = typeof updater === 'function' ? updater(oldValue) : updater;
    this.state[key] = newValue;
    this.notify(key, newValue, oldValue);
  }

  subscribe(key, listener) {
    if (!this.listeners.has(key)) {
      this.listeners.set(key, new Set());
    }
    this.listeners.get(key).add(listener);
    return () => this.listeners.get(key).delete(listener);
  }

  notify(key, value, oldValue) {
    const listeners = this.listeners.get(key);
    if (listeners) {
      listeners.forEach(l => l(value, oldValue));
    }
  }

  reset() {
    this.state = {};
    this.listeners.clear();
  }
}

const store = new Store();
export default store;
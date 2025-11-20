class EventDispatcher {
  constructor() {
    this._events = {};
  }

  addEventListener(type, listener) {
    if (!this._events[type]) {
      this._events[type] = [];
    }
    this._events[type].push(listener);
  }

  removeEventListener(type, listener) {
    if (!this._events[type]) return;
    const index = this._events[type].indexOf(listener);
    if (index !== -1) {
      this._events[type].splice(index, 1);
    }
  }

  emit(type, ...args) {
    if (!this._events[type]) return;
    this._events[type].forEach(listener => {
      listener.apply(this, args);
    });
  }

  on(type, listener) {
    this.addEventListener(type, listener);
  }

  off(type, listener) {
    this.removeEventListener(type, listener);
  }
}

export default EventDispatcher; 
import { EventHandler, RuntimeState } from './types';

export class RuntimeKernel {
  private state: RuntimeState;
  private listeners: Map<string, Set<EventHandler>> = new Map();

  constructor(initialState: RuntimeState) {
    this.state = initialState;
  }

  getState(): RuntimeState {
    return this.state;
  }

  update(fn: (state: RuntimeState) => RuntimeState): void {
    this.state = fn({ ...this.state });
    this.emit('STATE_UPDATED', this.state);
  }

  emit(event: string, payload?: any): void {
    const handlers = this.listeners.get(event);
    if (!handlers) return;

    for (const h of handlers) h(payload);
  }

  on(event: string, handler: EventHandler): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
  }

  off(event: string, handler: EventHandler): void {
    this.listeners.get(event)?.delete(handler);
  }
}

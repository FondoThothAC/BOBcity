// src/events/EventBus.ts
// EDD: Event-Driven Development - Pub/Sub Bus Implementation

import { SwarmEvent, SwarmEventHandler, SwarmEventType } from './eventTypes';

class EventBus {
  private static instance: EventBus;
  private listeners: Map<string, Set<SwarmEventHandler>> = new Map();

  private constructor() {}

  public static getInstance(): EventBus {
    if (!EventBus.instance) {
      EventBus.instance = new EventBus();
    }
    return EventBus.instance;
  }

  /**
   * Subscribe to a specific swarm event type.
   * Returns a cleanup unsubscribe function.
   */
  public subscribe(eventType: SwarmEventType, handler: SwarmEventHandler): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    this.listeners.get(eventType)!.add(handler);

    return () => {
      const set = this.listeners.get(eventType);
      if (set) {
        set.delete(handler);
        if (set.size === 0) {
          this.listeners.delete(eventType);
        }
      }
    };
  }

  /**
   * Publish an event to all subscribed listeners.
   */
  public publish(event: Omit<SwarmEvent, 'messageId' | 'timestamp'>): void {
    const fullEvent: SwarmEvent = {
      ...event,
      messageId: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString()
    };

    const handlers = this.listeners.get(event.eventType);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(fullEvent);
        } catch (err) {
          console.error(`Error in event listener for ${event.eventType}:`, err);
        }
      });
    }

    // Direct mirror to global event for wildcard / telemetry monitoring
    const wildcards = this.listeners.get('*' as SwarmEventType);
    if (wildcards) {
      wildcards.forEach(handler => {
        try {
          handler(fullEvent);
        } catch (err) {
          console.error(`Error in wildcard event listener:`, err);
        }
      });
    }
  }

  /**
   * Wildcard subscription to monitor all events
   */
  public subscribeAll(handler: SwarmEventHandler): () => void {
    return this.subscribe('*' as SwarmEventType, handler);
  }

  /**
   * Clear all subscribers (useful for testing and reset flows)
   */
  public clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = EventBus.getInstance();

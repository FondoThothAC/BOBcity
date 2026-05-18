// src/events/eventTypes.ts
// EDD: Event-Driven Development - Typings definition

export type SwarmEventType = 
  | 'AGENT_STARTED'
  | 'AGENT_PROGRESS'
  | 'AGENT_COMPLETED'
  | 'AGENT_FAILED'
  | 'SWARM_COMPLETED'
  | 'AUDIT_RECORDED'
  | 'OBP_EXPORT_STARTED'
  | 'OBP_EXPORT_SUCCESS'
  | 'OBP_EXPORT_FAILURE';

export interface SwarmEvent {
  messageId: string;
  timestamp: string;
  sender: string;
  eventType: SwarmEventType;
  payload: {
    agentId?: string;
    message?: string;
    progress?: number;
    error?: string;
    hash?: string;
    data?: any;
  };
}

export type SwarmEventHandler = (event: SwarmEvent) => void;

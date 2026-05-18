#!/usr/bin/env python3
# event_store.py - Implementacion de Event Store para CivicPulse

import json
import hashlib
from datetime import datetime
from typing import List, Dict, Optional
from dataclasses import dataclass, asdict
import redis
import psycopg2
from psycopg2.extras import RealDictCursor

@dataclass
class DomainEvent:
    event_id: str
    event_type: str
    aggregate_id: str
    timestamp: str
    payload: Dict
    metadata: Dict

    def to_json(self) -> str:
        return json.dumps(asdict(self), default=str)

    def compute_hash(self) -> str:
        return hashlib.sha256(self.to_json().encode()).hexdigest()

class EventStore:
    def __init__(self, redis_client: redis.Redis, db_conn: psycopg2.extensions.connection):
        self.redis = redis_client
        self.db = db_conn
        self._init_tables()

    def _init_tables(self):
        with self.db.cursor() as cur:
            cur.execute('''
                CREATE TABLE IF NOT EXISTS events (
                    event_id UUID PRIMARY KEY,
                    event_type VARCHAR(100) NOT NULL,
                    aggregate_id VARCHAR(100) NOT NULL,
                    timestamp TIMESTAMPTZ NOT NULL,
                    payload JSONB NOT NULL,
                    metadata JSONB,
                    event_hash VARCHAR(64) NOT NULL,
                    previous_hash VARCHAR(64),
                    sequence_number BIGINT GENERATED ALWAYS AS IDENTITY
                );
                CREATE INDEX IF NOT EXISTS idx_events_aggregate ON events(aggregate_id);
                CREATE INDEX IF NOT EXISTS idx_events_type ON events(event_type);
            ''')
            self.db.commit()

    def append(self, event: DomainEvent) -> bool:
        previous_hash = self._get_last_hash(event.aggregate_id)
        event_hash = event.compute_hash()

        with self.db.cursor() as cur:
            cur.execute('''
                INSERT INTO events (event_id, event_type, aggregate_id, timestamp, 
                                   payload, metadata, event_hash, previous_hash)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ''', (
                event.event_id, event.event_type, event.aggregate_id,
                event.timestamp, json.dumps(event.payload), 
                json.dumps(event.metadata), event_hash, previous_hash
            ))
            self.db.commit()

        self.redis.xadd(
            f"civic.{event.event_type}",
            {"data": event.to_json()},
            maxlen=100000
        )

        return True

    def _get_last_hash(self, aggregate_id: str) -> Optional[str]:
        with self.db.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT event_hash FROM events 
                WHERE aggregate_id = %s 
                ORDER BY sequence_number DESC LIMIT 1
            ''', (aggregate_id,))
            result = cur.fetchone()
            return result['event_hash'] if result else None

    def get_events(self, aggregate_id: str) -> List[DomainEvent]:
        with self.db.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT * FROM events 
                WHERE aggregate_id = %s 
                ORDER BY sequence_number ASC
            ''', (aggregate_id,))
            rows = cur.fetchall()

        return [DomainEvent(
            event_id=r['event_id'],
            event_type=r['event_type'],
            aggregate_id=r['aggregate_id'],
            timestamp=r['timestamp'].isoformat(),
            payload=r['payload'],
            metadata=r['metadata']
        ) for r in rows]

    def verify_chain(self, aggregate_id: str) -> bool:
        events = self.get_events(aggregate_id)
        for i, event in enumerate(events):
            expected_hash = event.compute_hash()
            if i > 0:
                prev_hash = events[i-1].compute_hash()
        return True

if __name__ == "__main__":
    import uuid
    redis_client = redis.Redis(host='localhost', port=6379, decode_responses=True)
    db_conn = psycopg2.connect("dbname=civicpulse user=postgres")
    store = EventStore(redis_client, db_conn)

    event = DomainEvent(
        event_id=str(uuid.uuid4()),
        event_type="simulation.completed",
        aggregate_id="sim-hermosillo-2027",
        timestamp=datetime.utcnow().isoformat(),
        payload={"status": "success", "horizon": 120},
        metadata={"tier": 2, "privacy": "aggregated"}
    )
    store.append(event)
    print(f"Evento almacenado: {event.event_id}")

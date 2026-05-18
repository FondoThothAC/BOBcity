# simulation/blackboard.py
# MDD / ADD: SQLite Blackboard Database & Session Context Store for Multi-Agent Swarm

import sqlite3
import json
import os
from datetime import datetime
from typing import Any, Dict, List, Optional

DB_PATH = os.path.join(os.path.dirname(__file__), "blackboard.db")

def get_connection():
    """Returns a connection to the local SQLite database."""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the database schema if it doesn't already exist."""
    conn = get_connection()
    cursor = conn.cursor()
    
    # 1. Sessions table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS sessions (
        session_hash TEXT PRIMARY KEY,
        status TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )
    """)
    
    # 2. Blackboard data table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS blackboard_data (
        session_hash TEXT NOT NULL,
        key TEXT NOT NULL,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (session_hash, key),
        FOREIGN KEY (session_hash) REFERENCES sessions(session_hash) ON DELETE CASCADE
    )
    """)
    
    # 3. Chat memory table (for CívicaDirector to keep track of user dialogs)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_memory (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        content TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        FOREIGN KEY (session_hash) REFERENCES sessions(session_hash) ON DELETE CASCADE
    )
    """)
    
    conn.commit()
    conn.close()
    print(f"📁 Local Blackboard DB initialized at: {DB_PATH}")

class BlackboardStore:
    def __init__(self, session_hash: str):
        self.session_hash = session_hash
        self._ensure_session_exists()

    def _ensure_session_exists(self):
        """Ensures that the session entry exists in the sessions table."""
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        
        cursor.execute(
            "INSERT OR IGNORE INTO sessions (session_hash, status, created_at, updated_at) VALUES (?, ?, ?, ?)",
            (self.session_hash, "initialized", now, now)
        )
        conn.commit()
        conn.close()

    def set_status(self, status: str):
        """Updates the status of the current session."""
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        
        cursor.execute(
            "UPDATE sessions SET status = ?, updated_at = ? WHERE session_hash = ?",
            (status, now, self.session_hash)
        )
        conn.commit()
        conn.close()

    def get_status(self) -> str:
        """Retrieves the status of the current session."""
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute("SELECT status FROM sessions WHERE session_hash = ?", (self.session_hash,))
        row = cursor.fetchone()
        conn.close()
        
        return row["status"] if row else "unknown"

    def write(self, key: str, data: Any):
        """Writes data (serialized to JSON) to the blackboard for the current session."""
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        serialized_value = json.dumps(data, ensure_ascii=False)
        
        cursor.execute("""
            INSERT INTO blackboard_data (session_hash, key, value, updated_at) 
            VALUES (?, ?, ?, ?)
            ON CONFLICT(session_hash, key) 
            DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        """, (self.session_hash, key, serialized_value, now))
        
        conn.commit()
        conn.close()

    def read(self, key: str) -> Optional[Any]:
        """Reads and deserializes data from the blackboard for the current session."""
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT value FROM blackboard_data WHERE session_hash = ? AND key = ?",
            (self.session_hash, key)
        )
        row = cursor.fetchone()
        conn.close()
        
        if row:
            return json.loads(row["value"])
        return None

    def delete(self, key: str):
        """Removes a key from the blackboard for the current session."""
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "DELETE FROM blackboard_data WHERE session_hash = ? AND key = ?",
            (self.session_hash, key)
        )
        conn.commit()
        conn.close()

    def add_chat_message(self, role: str, content: str):
        """Appends a new message to the chat history for conversational memory."""
        conn = get_connection()
        cursor = conn.cursor()
        now = datetime.utcnow().isoformat()
        
        cursor.execute(
            "INSERT INTO chat_memory (session_hash, role, content, timestamp) VALUES (?, ?, ?, ?)",
            (self.session_hash, role, content, now)
        )
        conn.commit()
        conn.close()

    def get_chat_history(self) -> List[Dict[str, str]]:
        """Retrieves the full chat history for the current session in chronological order."""
        conn = get_connection()
        cursor = conn.cursor()
        
        cursor.execute(
            "SELECT role, content, timestamp FROM chat_memory WHERE session_hash = ? ORDER BY id ASC",
            (self.session_hash,)
        )
        rows = cursor.fetchall()
        conn.close()
        
        return [{"role": r["role"], "content": r["content"], "timestamp": r["timestamp"]} for r in rows]

# Initialize database schema automatically upon module loading
init_db()

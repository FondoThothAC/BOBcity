# simulation/sync_data.py
# MDD / ADD: Secured Local-to-VPS Database Sync Gateway

import urllib.request
import json
import sqlite3
import os
import sys
from datetime import datetime

# ==============================================================================
# SECURE CONFIGURATION
# ==============================================================================
# Change this to your actual VPS IP address or Domain Name
VPS_HOST = "129.146.213.8" # Remote public Ubuntu VPS Server IP
SECURE_GATEWAY_KEY = "ThothSecretGatewayKey2026!"
# ==============================================================================

LOCAL_DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "blackboard.db"))
BACKUP_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "sync_backups"))

def main():
    print("======================================================================")
    echo_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"🔮 CÍVICAOS DB SYNCHRONIZER - Initiated at {echo_time}")
    print("======================================================================")
    
    url = f"http://{VPS_HOST}/api/secure-export"
    print(f"📡 Querying remote VPS at: {url}...")
    
    req = urllib.request.Request(url)
    req.add_header("X-Secure-Gateway-Key", SECURE_GATEWAY_KEY)
    
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            status_code = response.getcode()
            if status_code != 200:
                print(f"❌ Error: Server returned status code {status_code}")
                sys.exit(1)
                
            res_data = response.read().decode('utf-8')
            res_json = json.loads(res_data)
            
            if res_json.get("status") != "success":
                print(f"❌ Error: API sync failed. Message: {res_json.get('message')}")
                sys.exit(1)
                
            payload = res_json.get("payload", {})
            print(f"✅ Data fetched successfully! Received {len(payload)} captured key-value indices.")
            
            # 1. Create a physical timestamped JSON backup
            if not os.path.exists(BACKUP_DIR):
                os.makedirs(BACKUP_DIR)
                
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_file = os.path.join(BACKUP_DIR, f"vps_citizen_data_{timestamp}.json")
            with open(backup_file, "w", encoding="utf-8") as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)
            print(f"💾 Saved raw JSON backup to: {backup_file}")
            
            # 2. Merge data into local SQLite blackboard.db
            print(f"🔀 Merging remote keys into local database: {LOCAL_DB_PATH}...")
            
            # Ensure local database exists and has the blackboard table
            conn = sqlite3.connect(LOCAL_DB_PATH)
            cursor = conn.cursor()
            cursor.execute("""
                CREATE TABLE IF NOT EXISTS blackboard (
                    key TEXT PRIMARY KEY,
                    value TEXT,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            merged_count = 0
            for key, val in payload.items():
                # Convert back to JSON string for SQLite storage
                if isinstance(val, (dict, list)):
                    val_str = json.dumps(val, ensure_ascii=False)
                else:
                    val_str = str(val)
                
                # Insert or Replace to overwrite/update with latest VPS data
                cursor.execute(
                    "INSERT OR REPLACE INTO blackboard (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)",
                    (key, val_str)
                )
                merged_count += 1
                
            conn.commit()
            conn.close()
            
            print("======================================================================")
            print(f"🎉 SUCCESS: {merged_count} remote data streams merged into your local dashboard!")
            print("Your Local Executive Dashboard (http://localhost:5001) is now updated.")
            print("======================================================================")
            
    except urllib.error.HTTPError as e:
        if e.code == 403:
            print("❌ Access Denied: Unauthorized gateway key. Check SECURE_GATEWAY_KEY config.")
        else:
            print(f"❌ HTTP Error: {e.code} - {e.reason}")
    except Exception as e:
        print(f"❌ Error connecting to VPS: {str(e)}")
        print("💡 Suggestion: Ensure the VPS server is running and python is serving port 5001.")

if __name__ == "__main__":
    main()

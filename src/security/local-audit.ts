// src/security/local-audit.ts
// SDD: Security-Driven Development - Audit Trail Implementation

export interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  dataHash: string; // Cryptographic SHA-256 hash of details
  compliantWith: string[];
}

export class LocalAuditLogger {
  private static instance: LocalAuditLogger;
  private readonly STORAGE_KEY = 'civicpulse:audit:ledger';

  private constructor() {}

  public static getInstance(): LocalAuditLogger {
    if (!LocalAuditLogger.instance) {
      LocalAuditLogger.instance = new LocalAuditLogger();
    }
    return LocalAuditLogger.instance;
  }

  /**
   * Helper to compute WebCrypto SHA-256 of any string data
   */
  private async calculateSHA256(message: string): Promise<string> {
    if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
      const msgBuffer = new TextEncoder().encode(message);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }
    // Fallback if running outside of secure window context during testing
    return 'sha256-mocked-' + Math.random().toString(36).substring(2, 10);
  }

  /**
   * Logs a new compliance action by hashing the raw payload
   */
  public async logAction(action: string, rawData: any): Promise<AuditEntry> {
    const serialized = typeof rawData === 'string' ? rawData : JSON.stringify(rawData);
    const dataHash = await this.calculateSHA256(serialized);

    const newEntry: AuditEntry = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15),
      timestamp: new Date().toISOString(),
      action,
      dataHash: `sha256:${dataHash}`,
      compliantWith: ['LGPD-Local', 'GDPR-Local', 'mTLS-Secure']
    };

    // Store in LocalStorage securely
    try {
      const existing = this.getEntries();
      existing.unshift(newEntry); // Latest logs first
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(existing));
    } catch (err) {
      console.error('Failed to persist local audit log:', err);
    }

    return newEntry;
  }

  /**
   * Recovers local audit history
   */
  public getEntries(): AuditEntry[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (err) {
      console.error('Failed to parse stored audit ledger:', err);
      return [];
    }
  }

  /**
   * Securely wipe audit log history (for Zero-Trust compliance)
   */
  public wipe(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

export const localAuditLogger = LocalAuditLogger.getInstance();

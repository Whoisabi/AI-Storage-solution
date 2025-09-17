import type { S3Credentials } from "./s3Service";

export interface SessionUser {
  claims?: any;
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  s3Credentials?: S3Credentials;
}

interface CredentialEntry {
  credentials: S3Credentials;
  expiresAt: number;
}

/**
 * In-memory credential store with TTL support
 * Persists across requests and provides automatic cleanup
 */
class CredentialStore {
  private credentialMap = new Map<string, CredentialEntry>();
  private cleanupInterval: NodeJS.Timeout;
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

  constructor() {
    // Run cleanup every hour
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 60 * 1000);
  }

  /**
   * Store credentials for a user with TTL
   */
  set(userId: string, credentials: S3Credentials, ttlMs?: number): void {
    const ttl = ttlMs || this.DEFAULT_TTL;
    const expiresAt = Date.now() + ttl;
    
    const entry: CredentialEntry = {
      credentials: {
        accessKeyId: credentials.accessKeyId,
        secretAccessKey: credentials.secretAccessKey,
        region: credentials.region || 'us-east-1',
        ...(credentials.sessionToken && { sessionToken: credentials.sessionToken })
      },
      expiresAt
    };
    
    this.credentialMap.set(userId, entry);
  }

  /**
   * Retrieve credentials for a user
   * Returns undefined if not found or expired
   */
  get(userId: string): S3Credentials | undefined {
    const entry = this.credentialMap.get(userId);
    
    if (!entry) {
      return undefined;
    }
    
    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.credentialMap.delete(userId);
      return undefined;
    }
    
    return entry.credentials;
  }

  /**
   * Remove credentials for a user
   */
  delete(userId: string): boolean {
    return this.credentialMap.delete(userId);
  }

  /**
   * Check if user has valid credentials
   */
  has(userId: string): boolean {
    const credentials = this.get(userId);
    return !!(credentials?.accessKeyId && credentials?.secretAccessKey);
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];
    
    for (const [userId, entry] of Array.from(this.credentialMap.entries())) {
      if (now > entry.expiresAt) {
        expiredKeys.push(userId);
      }
    }
    
    expiredKeys.forEach(key => this.credentialMap.delete(key));
    
    if (expiredKeys.length > 0) {
      console.log(`Cleaned up ${expiredKeys.length} expired S3 credential entries`);
    }
  }

  /**
   * Get store statistics for monitoring
   */
  getStats() {
    return {
      totalEntries: this.credentialMap.size,
      defaultTtlHours: this.DEFAULT_TTL / (60 * 60 * 1000)
    };
  }

  /**
   * Cleanup resources
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.credentialMap.clear();
  }
}

// Global credential store instance
const credentialStore = new CredentialStore();

/**
 * Store AWS S3 credentials for a user
 * Credentials are stored in-memory with TTL and automatic cleanup
 */
export function storeS3CredentialsInSession(
  userId: string,
  credentials: S3Credentials,
  ttlMs?: number
): void {
  credentialStore.set(userId, credentials, ttlMs);
}

/**
 * Retrieve AWS S3 credentials for a user
 * Returns undefined if no credentials are stored or expired
 */
export function getS3CredentialsFromSession(
  userId: string
): S3Credentials | undefined {
  return credentialStore.get(userId);
}

/**
 * Remove AWS S3 credentials for a user
 */
export function clearS3CredentialsFromSession(
  userId: string
): void {
  credentialStore.delete(userId);
}

/**
 * Check if user has AWS S3 credentials stored
 */
export function hasS3CredentialsInSession(
  userId: string
): boolean {
  return credentialStore.has(userId);
}

/**
 * Get credential store statistics (for monitoring/debugging)
 */
export function getCredentialStoreStats() {
  return credentialStore.getStats();
}

// Handle process cleanup
process.on('SIGTERM', () => {
  credentialStore.destroy();
});

process.on('SIGINT', () => {
  credentialStore.destroy();
});
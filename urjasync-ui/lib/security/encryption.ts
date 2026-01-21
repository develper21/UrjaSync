import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
}

export interface EncryptedData {
  data: string;
  iv: string;
  tag: string;
  algorithm: string;
  keyId: string;
}

export interface KeyRotationPolicy {
  rotationInterval: number; // days
  maxKeyAge: number; // days
  encryptionKeySize: number; // bits
  signingKeySize: number; // bits
}

export class EncryptionService {
  private keys: Map<string, crypto.KeyObject> = new Map();
  private keyMetadata: Map<string, { createdAt: number; lastUsed: number; isActive: boolean }> = new Map();
  private currentKeyId: string | null = null;
  
  private readonly config: EncryptionConfig = {
    algorithm: 'aes-256-gcm',
    keyLength: 32,
    ivLength: 16,
    tagLength: 16
  };

  private readonly keyRotationPolicy: KeyRotationPolicy = {
    rotationInterval: 90, // 90 days
    maxKeyAge: 365, // 1 year
    encryptionKeySize: 256,
    signingKeySize: 256
  };

  constructor() {
    this.initializeEncryption();
  }

  private initializeEncryption(): void {
    // Generate initial encryption key
    this.generateNewKey();
    
    // Set up periodic key rotation
    setInterval(() => {
      this.checkAndRotateKeys();
    }, 24 * 60 * 60 * 1000); // Check daily
  }

  // Encryption methods
  encrypt(plaintext: string, keyId?: string): EncryptedData {
    const encryptionKey = keyId ? this.keys.get(keyId) : this.getCurrentKey();
    const actualKeyId = keyId || this.currentKeyId!;
    
    if (!encryptionKey) {
      throw new Error('No encryption key available');
    }

    try {
      const iv = crypto.randomBytes(this.config.ivLength);
      const cipher = crypto.createCipheriv(this.config.algorithm, encryptionKey.export(), iv) as any;
      cipher.setAAD(Buffer.from(actualKeyId)); // Additional authenticated data
      
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      // Update key usage
      this.updateKeyUsage(actualKeyId);
      
      return {
        data: encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
        algorithm: this.config.algorithm,
        keyId: actualKeyId
      };
    } catch (error) {
      throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  decrypt(encryptedData: EncryptedData): string {
    const key = this.keys.get(encryptedData.keyId);
    if (!key) {
      throw new Error('Decryption key not found');
    }

    try {
      // const iv = Buffer.from(encryptedData.iv, 'hex');
      const tag = Buffer.from(encryptedData.tag, 'hex');
      
      const decipher = crypto.createDecipheriv(encryptedData.algorithm, key.export(), Buffer.from(encryptedData.iv, 'hex')) as any;
      decipher.setAAD(Buffer.from(encryptedData.keyId));
      decipher.setAuthTag(tag);
      
      let decrypted = decipher.update(encryptedData.data, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      // Update key usage
      this.updateKeyUsage(encryptedData.keyId);
      
      return decrypted;
    } catch (error) {
      throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Hashing methods
  hash(data: string, salt?: string): { hash: string; salt: string } {
    const actualSalt = salt || crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(data, actualSalt, 100000, 64, 'sha512').toString('hex');
    
    return { hash, salt: actualSalt };
  }

  verifyHash(data: string, hash: string, salt: string): boolean {
    const computedHash = crypto.pbkdf2Sync(data, salt, 100000, 64, 'sha512').toString('hex');
    return computedHash === hash;
  }

  // Key management
  private generateNewKey(): string {
    const keyId = crypto.randomUUID();
    const key = crypto.randomBytes(this.config.keyLength);
    const keyObject = crypto.createSecretKey(key);
    
    this.keys.set(keyId, keyObject);
    this.keyMetadata.set(keyId, {
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: true
    });
    
    this.currentKeyId = keyId;
    
    console.log(`🔑 Generated new encryption key: ${keyId}`);
    return keyId;
  }

  private getCurrentKey(): crypto.KeyObject | null {
    if (this.currentKeyId) {
      return this.keys.get(this.currentKeyId) || null;
    }
    return null;
  }

  private updateKeyUsage(keyId: string): void {
    const metadata = this.keyMetadata.get(keyId);
    if (metadata) {
      metadata.lastUsed = Date.now();
    }
  }

  private checkAndRotateKeys(): void {
    const now = Date.now();
    const rotationInterval = this.keyRotationPolicy.rotationInterval * 24 * 60 * 60 * 1000;
    const maxAge = this.keyRotationPolicy.maxKeyAge * 24 * 60 * 60 * 1000;
    
    // Check if current key needs rotation
    if (this.currentKeyId) {
      const currentKeyMetadata = this.keyMetadata.get(this.currentKeyId);
      if (currentKeyMetadata) {
        const keyAge = now - currentKeyMetadata.createdAt;
        
        // Rotate if key is too old
        if (keyAge > maxAge) {
          this.rotateKey();
        }
        // Rotate if rotation interval has passed
        else if (keyAge > rotationInterval) {
          console.log('🔄 Key rotation interval reached, considering rotation...');
          // In production, you might want additional checks before rotating
        }
      }
    }
    
    // Clean up old inactive keys
    this.cleanupOldKeys(now, maxAge);
  }

  private rotateKey(): void {
    console.log('🔄 Rotating encryption key...');
    
    // Generate new key
    const newKeyId = this.generateNewKey();
    
    // Mark old key as inactive but keep it for decryption
    if (this.currentKeyId) {
      const oldMetadata = this.keyMetadata.get(this.currentKeyId);
      if (oldMetadata) {
        oldMetadata.isActive = false;
      }
    }
    
    console.log(`✅ Key rotation completed. New key: ${newKeyId}`);
  }

  private cleanupOldKeys(_now: number, maxAge: number): void {
    const keysToDelete: string[] = [];
    const now = Date.now();
    
    this.keyMetadata.forEach((metadata, keyId) => {
      const keyAge = now - metadata.createdAt;
      
      // Delete keys that are older than max age and inactive
      if (keyAge > maxAge && !metadata.isActive) {
        keysToDelete.push(keyId);
      }
    });
    
    keysToDelete.forEach(keyId => {
      this.keys.delete(keyId);
      this.keyMetadata.delete(keyId);
      console.log(`🗑️ Cleaned up old encryption key: ${keyId}`);
    });
  }

  // Data masking for sensitive fields
  maskSensitiveData(data: any, fieldsToMask: string[]): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };
    
    fieldsToMask.forEach(field => {
      if (field in masked) {
        const value = masked[field];
        if (typeof value === 'string') {
          // Show first 2 and last 2 characters, mask the rest
          if (value.length <= 4) {
            masked[field] = '*'.repeat(value.length);
          } else {
            masked[field] = value.substring(0, 2) + '*'.repeat(value.length - 4) + value.substring(value.length - 2);
          }
        } else {
          masked[field] = '[MASKED]';
        }
      }
    });
    
    return masked;
  }

  // Field-level encryption
  encryptFields(data: any, fieldsToEncrypt: string[]): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const encrypted = { ...data };
    
    fieldsToEncrypt.forEach(field => {
      if (field in encrypted) {
        const value = encrypted[field];
        if (typeof value === 'string') {
          encrypted[field] = this.encrypt(value);
        }
      }
    });
    
    return encrypted;
  }

  decryptFields(data: any, fieldsToDecrypt: string[]): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const decrypted = { ...data };
    
    fieldsToDecrypt.forEach(field => {
      if (field in decrypted) {
        const value = decrypted[field];
        if (typeof value === 'object' && value.data && value.iv && value.tag) {
          try {
            decrypted[field] = this.decrypt(value);
          } catch (error) {
            console.error(`Failed to decrypt field ${field}:`, error);
            // Keep original value if decryption fails
          }
        }
      }
    });
    
    return decrypted;
  }

  // Secure token generation
  generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  generateApiKey(): { key: string; keyId: string; prefix: string } {
    const keyId = crypto.randomUUID();
    const key = crypto.randomBytes(32).toString('hex');
    const prefix = 'urj_' + crypto.randomBytes(4).toString('hex');
    
    return {
      key: `${prefix}_${key}`,
      keyId,
      prefix
    };
  }

  // Digital signatures
  sign(data: string, keyId?: string): { signature: string; keyId: string } {
    const signingKey = keyId ? this.keys.get(keyId) : this.getCurrentKey();
    const actualKeyId = keyId || this.currentKeyId!;
    
    if (!signingKey) {
      throw new Error('No signing key available');
    }

    const signature = crypto.createHmac('sha256', signingKey).update(data).digest('hex');
    
    return {
      signature,
      keyId: actualKeyId
    };
  }

  verify(data: string, signature: string, keyId: string): boolean {
    const key = this.keys.get(keyId);
    if (!key) {
      return false;
    }

    const expectedSignature = crypto.createHmac('sha256', key).update(data).digest('hex');
    return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expectedSignature, 'hex'));
  }

  // Key management utilities
  getKeyInfo(): Array<{
    keyId: string;
    createdAt: number;
    lastUsed: number;
    isActive: boolean;
    age: number;
  }> {
    const now = Date.now();
    
    return Array.from(this.keyMetadata.entries()).map(([keyId, metadata]) => ({
      keyId,
      createdAt: metadata.createdAt,
      lastUsed: metadata.lastUsed,
      isActive: metadata.isActive,
      age: now - metadata.createdAt
    }));
  }

  getCurrentKeyId(): string | null {
    return this.currentKeyId;
  }

  isKeyActive(keyId: string): boolean {
    const metadata = this.keyMetadata.get(keyId);
    return metadata?.isActive || false;
  }

  // Compliance and audit
  getEncryptionStats(): {
    totalKeys: number;
    activeKeys: number;
    currentKeyId: string | null;
    oldestKeyAge: number;
    newestKeyAge: number;
    lastRotation: number;
  } {
    const keyInfos = this.getKeyInfo();
    
    const activeKeys = keyInfos.filter(k => k.isActive);
    const ages = keyInfos.map(k => k.age);
    
    return {
      totalKeys: keyInfos.length,
      activeKeys: activeKeys.length,
      currentKeyId: this.currentKeyId,
      oldestKeyAge: Math.max(...ages, 0),
      newestKeyAge: Math.min(...ages, 0),
      lastRotation: this.keyMetadata.get(this.currentKeyId || '')?.createdAt || 0
    };
  }
}

// Singleton instance
let encryptionService: EncryptionService | null = null;

export function getEncryptionService(): EncryptionService {
  if (!encryptionService) {
    encryptionService = new EncryptionService();
  }
  return encryptionService;
}

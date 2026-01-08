// Encryption Service
// Provides AES-256-GCM encryption for secure token storage

import crypto from 'crypto';

export interface EncryptionConfig {
  algorithm: string;
  keyLength: number;
  ivLength: number;
  tagLength: number;
  saltLength: number;
}

export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly saltLength = 32; // 256 bits

  private encryptionKey: Buffer;

  constructor() {
    // Get encryption key from environment or generate one
    const keyString = process.env.ENCRYPTION_KEY || this.generateKey();
    
    if (!process.env.ENCRYPTION_KEY) {
      console.warn('⚠️  ENCRYPTION_KEY not set. Using generated key. Set ENCRYPTION_KEY in production!');
    }

    // Derive a consistent key from the string
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(keyString)
      .digest();
  }

  /**
   * Generate a random encryption key (for initial setup)
   */
  private generateKey(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Encrypt sensitive data using AES-256-GCM
   */
  encrypt(plaintext: string): string {
    try {
      // Generate random IV for each encryption
      const iv = crypto.randomBytes(this.ivLength);
      
      // Create cipher
      const cipher = crypto.createCipheriv(this.algorithm, this.encryptionKey, iv);
      
      // Encrypt
      let encrypted = cipher.update(plaintext, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Get authentication tag
      const tag = cipher.getAuthTag();
      
      // Combine IV + tag + encrypted data
      // Format: iv:tag:encrypted (all hex)
      return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt encrypted data
   */
  decrypt(encryptedData: string): string {
    try {
      // Split IV, tag, and encrypted data
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const [ivHex, tagHex, encrypted] = parts;
      
      // Convert hex strings to buffers
      const iv = Buffer.from(ivHex, 'hex');
      const tag = Buffer.from(tagHex, 'hex');
      
      // Create decipher
      const decipher = crypto.createDecipheriv(this.algorithm, this.encryptionKey, iv);
      decipher.setAuthTag(tag);
      
      // Decrypt
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash data (one-way, for passwords, etc.)
   */
  hash(data: string, salt?: string): { hash: string; salt: string } {
    const usedSalt = salt || crypto.randomBytes(this.saltLength).toString('hex');
    const hash = crypto
      .pbkdf2Sync(data, usedSalt, 100000, this.keyLength, 'sha256')
      .toString('hex');
    
    return { hash, salt: usedSalt };
  }

  /**
   * Verify hashed data
   */
  verify(data: string, hash: string, salt: string): boolean {
    const computedHash = crypto
      .pbkdf2Sync(data, salt, 100000, this.keyLength, 'sha256')
      .toString('hex');
    
    return computedHash === hash;
  }
}

// Export singleton instance
export const encryptionService = new EncryptionService();

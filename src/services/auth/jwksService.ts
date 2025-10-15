// TETRIX JWKS (JSON Web Key Set) Service
// Manages RSA key pairs and generates JWKS for OAuth 2.0 and OpenID Connect

export interface JWK {
  kty: string;
  kid: string;
  use: string;
  alg: string;
  n: string;
  e: string;
}

export interface JWKS {
  keys: JWK[];
}

export interface KeyPair {
  publicKey: string;
  privateKey: string;
  keyId: string;
  algorithm: string;
  createdAt: string;
  expiresAt: string;
}

/**
 * JWKS Service for managing JSON Web Key Sets
 */
export class JWKSService {
  private keyPairs: Map<string, KeyPair> = new Map();
  private currentKeyId: string = '';

  constructor() {
    this.initializeKeys();
  }

  /**
   * Initialize RSA key pairs for the environment
   */
  private async initializeKeys(): Promise<void> {
    try {
      // Generate primary key pair
      const primaryKey = await this.generateRSAKeyPair('primary');
      this.keyPairs.set('primary', primaryKey);
      this.currentKeyId = primaryKey.keyId;

      // Generate backup key pair for key rotation
      const backupKey = await this.generateRSAKeyPair('backup');
      this.keyPairs.set('backup', backupKey);

      console.log('✅ JWKS keys initialized successfully');
    } catch (error) {
      console.error('❌ Failed to initialize JWKS keys:', error);
    }
  }

  /**
   * Generate RSA key pair
   */
  private async generateRSAKeyPair(purpose: string): Promise<KeyPair> {
    try {
      // Generate RSA key pair using Web Crypto API
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-PSS',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-256'
        },
        true,
        ['sign', 'verify']
      );

      // Export public key
      const publicKeyBuffer = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKeyPem = this.bufferToPem(publicKeyBuffer, 'PUBLIC KEY');

      // Export private key
      const privateKeyBuffer = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKeyPem = this.bufferToPem(privateKeyBuffer, 'PRIVATE KEY');

      const keyId = `tetrix-${purpose}-${Date.now()}`;
      const now = new Date();
      const expiresAt = new Date(now.getTime() + (365 * 24 * 60 * 60 * 1000)); // 1 year

      return {
        publicKey: publicKeyPem,
        privateKey: privateKeyPem,
        keyId,
        algorithm: 'RS256',
        createdAt: now.toISOString(),
        expiresAt: expiresAt.toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to generate RSA key pair:', error);
      throw error;
    }
  }

  /**
   * Convert buffer to PEM format
   */
  private bufferToPem(buffer: ArrayBuffer, type: string): string {
    const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)));
    const chunks = base64.match(/.{1,64}/g) || [];
    return `-----BEGIN ${type}-----\n${chunks.join('\n')}\n-----END ${type}-----`;
  }

  /**
   * Generate JWKS (JSON Web Key Set)
   */
  async generateJWKS(): Promise<JWKS> {
    const keys: JWK[] = [];

    for (const [purpose, keyPair] of this.keyPairs) {
      try {
        // Convert PEM to JWK format
        const jwk = await this.pemToJWK(keyPair.publicKey, keyPair.keyId);
        keys.push(jwk);
      } catch (error) {
        console.error(`❌ Failed to convert key ${purpose} to JWK:`, error);
      }
    }

    return { keys };
  }

  /**
   * Convert PEM public key to JWK format
   */
  private async pemToJWK(pem: string, keyId: string): Promise<JWK> {
    try {
      // Remove PEM headers and decode base64
      const pemContent = pem
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\s/g, '');

      const binaryString = atob(pemContent);
      const buffer = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        buffer[i] = binaryString.charCodeAt(i);
      }

      // Import the key
      const publicKey = await crypto.subtle.importKey(
        'spki',
        buffer,
        {
          name: 'RSA-PSS',
          hash: 'SHA-256'
        },
        true,
        ['verify']
      );

      // Export as JWK
      const jwk = await crypto.subtle.exportKey('jwk', publicKey);

      return {
        kty: jwk.kty || 'RSA',
        kid: keyId,
        use: 'sig',
        alg: 'RS256',
        n: jwk.n || '',
        e: jwk.e || 'AQAB'
      };
    } catch (error) {
      console.error('❌ Failed to convert PEM to JWK:', error);
      throw error;
    }
  }

  /**
   * Get current signing key
   */
  getCurrentSigningKey(): KeyPair | null {
    return this.keyPairs.get('primary') || null;
  }

  /**
   * Get key by ID
   */
  getKeyById(keyId: string): KeyPair | null {
    for (const keyPair of this.keyPairs.values()) {
      if (keyPair.keyId === keyId) {
        return keyPair;
      }
    }
    return null;
  }

  /**
   * Rotate keys (generate new primary key)
   */
  async rotateKeys(): Promise<void> {
    try {
      // Move current primary to backup
      const currentPrimary = this.keyPairs.get('primary');
      if (currentPrimary) {
        this.keyPairs.set('backup', currentPrimary);
      }

      // Generate new primary key
      const newPrimary = await this.generateRSAKeyPair('primary');
      this.keyPairs.set('primary', newPrimary);
      this.currentKeyId = newPrimary.keyId;

      console.log('✅ Keys rotated successfully');
    } catch (error) {
      console.error('❌ Failed to rotate keys:', error);
      throw error;
    }
  }

  /**
   * Get key expiration status
   */
  getKeyExpirationStatus(): {
    primary: { expiresAt: string; isExpired: boolean; daysUntilExpiry: number };
    backup: { expiresAt: string; isExpired: boolean; daysUntilExpiry: number };
  } {
    const primary = this.keyPairs.get('primary');
    const backup = this.keyPairs.get('backup');

    const getStatus = (keyPair: KeyPair | undefined) => {
      if (!keyPair) {
        return { expiresAt: '', isExpired: true, daysUntilExpiry: 0 };
      }

      const expiresAt = new Date(keyPair.expiresAt);
      const now = new Date();
      const isExpired = expiresAt < now;
      const daysUntilExpiry = Math.ceil((expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        expiresAt: keyPair.expiresAt,
        isExpired,
        daysUntilExpiry: Math.max(0, daysUntilExpiry)
      };
    };

    return {
      primary: getStatus(primary),
      backup: getStatus(backup)
    };
  }
}

// Create singleton instance
const jwksService = new JWKSService();

/**
 * Generate JWKS for the current environment
 */
export async function generateJWKS(): Promise<JWKS> {
  return await jwksService.generateJWKS();
}

/**
 * Get current signing key
 */
export function getCurrentSigningKey(): KeyPair | null {
  return jwksService.getCurrentSigningKey();
}

/**
 * Get key by ID
 */
export function getKeyById(keyId: string): KeyPair | null {
  return jwksService.getKeyById(keyId);
}

/**
 * Rotate keys
 */
export async function rotateKeys(): Promise<void> {
  return await jwksService.rotateKeys();
}

/**
 * Get key expiration status
 */
export function getKeyExpirationStatus() {
  return jwksService.getKeyExpirationStatus();
}

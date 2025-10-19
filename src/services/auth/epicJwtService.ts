/**
 * Epic FHIR JWT Service
 * Handles JWT creation and signing for Epic FHIR authentication
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import jwt from 'jsonwebtoken';

export interface EpicJwtPayload {
  iss: string;  // Client ID (issuer)
  sub: string;  // Client ID (subject)
  aud: string;  // Epic token endpoint (audience)
  jti: string;  // Unique token ID
  exp: number;  // Expiration time
  iat: number;  // Issued at
  nbf: number;  // Not before
}

export interface EpicJwtHeaders {
  alg: 'RS256';
  kid: string;  // Key ID from JWKS
  typ: 'JWT';
}

export class EpicJwtService {
  private privateKey!: string;
  private keyId: string;

  constructor() {
    this.loadPrivateKey();
    this.keyId = 'tetrix-epic-key-2025'; // Must match JWKS key ID
  }

  /**
   * Load private key from file
   */
  private loadPrivateKey(): void {
    try {
      const keyPath = join(process.cwd(), 'private_key.pem');
      this.privateKey = readFileSync(keyPath, 'utf8');
      console.log('✅ Epic JWT private key loaded successfully');
    } catch (error) {
      console.error('❌ Failed to load Epic JWT private key:', error);
      throw new Error('Private key not found. Please ensure private_key.pem exists in project root.');
    }
  }

  /**
   * Create JWT for Epic FHIR authentication
   */
  createEpicJwt(
    clientId: string,
    audience: string,
    expiresInMinutes: number = 5
  ): string {
    try {
      const now = Math.floor(Date.now() / 1000);
      
      const payload: EpicJwtPayload = {
        iss: clientId,  // Your Epic client ID
        sub: clientId,  // Same as issuer for client credentials
        aud: audience,  // Epic token endpoint
        jti: this.generateJti(),  // Unique token ID
        exp: now + (expiresInMinutes * 60),  // Expires in specified minutes
        iat: now,
        nbf: now
      };

      const headers: EpicJwtHeaders = {
        alg: 'RS256',
        kid: this.keyId,  // Key ID from your JWKS
        typ: 'JWT'
      };

      // Sign JWT
      const token = jwt.sign(payload, this.privateKey, {
        algorithm: 'RS256',
        header: headers
      });

      console.log('✅ Epic JWT created successfully:', {
        clientId,
        audience,
        keyId: this.keyId,
        expiresIn: `${expiresInMinutes} minutes`
      });

      return token;

    } catch (error) {
      console.error('❌ Failed to create Epic JWT:', error);
      throw error;
    }
  }

  /**
   * Generate unique JTI (JWT ID)
   */
  private generateJti(): string {
    return `tetrix-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Verify JWT (for testing purposes)
   */
  verifyJwt(token: string): any {
    try {
      const decoded = jwt.verify(token, this.privateKey, {
        algorithms: ['RS256']
      });
      return decoded;
    } catch (error) {
      console.error('❌ Failed to verify JWT:', error);
      throw error;
    }
  }

  /**
   * Get key ID
   */
  getKeyId(): string {
    return this.keyId;
  }

  /**
   * Get JWKS URL for current environment
   */
  getJwksUrl(environment: 'production' | 'development' | 'staging' = 'production'): string {
    const baseUrls = {
      production: 'https://tetrixcorp.com',
      development: 'https://dev.tetrixcorp.com',
      staging: 'https://staging.tetrixcorp.com'
    };

    return `${baseUrls[environment]}/.well-known/jwks.json`;
  }
}

// Create singleton instance
const epicJwtService = new EpicJwtService();

/**
 * Create JWT for Epic FHIR authentication
 */
export function createEpicJwt(
  clientId: string,
  audience: string,
  expiresInMinutes?: number
): string {
  return epicJwtService.createEpicJwt(clientId, audience, expiresInMinutes);
}

/**
 * Get key ID
 */
export function getEpicKeyId(): string {
  return epicJwtService.getKeyId();
}

/**
 * Get JWKS URL
 */
export function getEpicJwksUrl(environment?: 'production' | 'development' | 'staging'): string {
  return epicJwtService.getJwksUrl(environment);
}

export default epicJwtService;

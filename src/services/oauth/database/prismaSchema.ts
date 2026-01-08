// Prisma Schema for OAuth Token Management
// This file provides the Prisma schema definition for OAuth integrations
// To use this, add to your main schema.prisma or create a separate schema file

/*
// Add to your Prisma schema.prisma file:

// OAuth Integrations
model OAuthIntegration {
  id              String   @id @default(cuid())
  userId          String
  tenantId        String?
  provider        String   // salesforce, hubspot, epic, etc.
  integrationName String?
  status          String   @default("active") // active, inactive, revoked
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  tokens          OAuthToken[]
  
  @@index([userId])
  @@index([tenantId])
  @@index([provider])
  @@map("oauth_integrations")
}

// OAuth Tokens (encrypted storage)
model OAuthToken {
  id                    String   @id @default(cuid())
  integrationId         String
  userId                String
  // Encrypted tokens (AES-256-GCM)
  encryptedAccessToken  String   @db.Text
  encryptedRefreshToken String?  @db.Text
  // Token metadata
  expiresAt             DateTime
  tokenType             String   @default("Bearer")
  scope                 String?  @db.Text
  tokenUrl              String?  @db.Text
  // Timestamps
  issuedAt              DateTime @default(now())
  lastRefreshedAt       DateTime?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  integration           OAuthIntegration @relation(fields: [integrationId], references: [id], onDelete: Cascade)
  
  @@index([integrationId])
  @@index([userId])
  @@index([expiresAt])
  @@map("oauth_tokens")
}

// OAuth Configurations
model OAuthConfiguration {
  id                String   @id @default(cuid())
  provider          String   @unique // salesforce, hubspot, etc.
  clientId          String
  encryptedClientSecret String @db.Text // Encrypted
  authorizationUrl  String   @db.Text
  tokenUrl          String   @db.Text
  defaultScopes     String?  @db.Text // JSON array
  grantTypes        String?  @db.Text // JSON array
  pkceEnabled       Boolean  @default(false)
  isActive          Boolean  @default(true)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([provider])
  @@map("oauth_configurations")
}

// OAuth State (temporary storage for OAuth flows)
model OAuthState {
  id            String   @id @default(cuid())
  userId        String
  integrationId String
  stateValue    String
  codeVerifier  String?  @db.Text // For PKCE
  expiresAt     DateTime
  createdAt     DateTime @default(now())

  @@index([userId, integrationId])
  @@index([expiresAt])
  @@map("oauth_states")
}
*/

// TypeScript types for Prisma models (if using Prisma Client)
export interface OAuthIntegration {
  id: string;
  userId: string;
  tenantId?: string | null;
  provider: string;
  integrationName?: string | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthToken {
  id: string;
  integrationId: string;
  userId: string;
  encryptedAccessToken: string;
  encryptedRefreshToken?: string | null;
  expiresAt: Date;
  tokenType: string;
  scope?: string | null;
  tokenUrl?: string | null;
  issuedAt: Date;
  lastRefreshedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthConfiguration {
  id: string;
  provider: string;
  clientId: string;
  encryptedClientSecret: string;
  authorizationUrl: string;
  tokenUrl: string;
  defaultScopes?: string | null;
  grantTypes?: string | null;
  pkceEnabled: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OAuthState {
  id: string;
  userId: string;
  integrationId: string;
  stateValue: string;
  codeVerifier?: string | null;
  expiresAt: Date;
  createdAt: Date;
}

import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import type { Request, Response, NextFunction } from 'express';
import { randomBytes } from 'crypto';

interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  picture?: string;
  provider: string;
}

interface OAuthTokens {
  access_token: string;
  refresh_token?: string;
  id_token?: string;
  expires_in?: number;
}

interface FirebaseAuthResult {
  firebase_token: string;
  user_id: string;
  user_record: {
    uid: string;
    email: string;
    display_name?: string;
    photo_url?: string;
    provider: string;
  };
}

class FirebaseOAuthService {
  private webApiKey: string;
  private projectId: string;
  private authDomain: string;
  private db: FirebaseFirestore.Firestore | null = null;

  constructor() {
    this.webApiKey = process.env.FIREBASE_WEB_API_KEY || '';
    this.projectId = process.env.FIREBASE_PROJECT_ID || '';
    this.authDomain = process.env.FIREBASE_AUTH_DOMAIN || '';
  }

  private getDb(): FirebaseFirestore.Firestore {
    if (!this.db) {
      this.db = getFirestore();
    }
    return this.db;
  }

  async initiateOAuthFlow(provider: string, redirectUri: string): Promise<{
    authorization_url: string;
    state: string;
    provider: string;
  }> {
    const oauthUrls = {
      'google.com': this.getGoogleOAuthUrl.bind(this),
      'github.com': this.getGitHubOAuthUrl.bind(this),
      'microsoft.com': this.getMicrosoftOAuthUrl.bind(this),
    };

    if (!oauthUrls[provider as keyof typeof oauthUrls]) {
      throw new Error(`Unsupported OAuth provider: ${provider}`);
    }

    return oauthUrls[provider as keyof typeof oauthUrls](redirectUri);
  }

  private getGoogleOAuthUrl(redirectUri: string) {
    const baseUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
    const state = this.generateStateToken();
    
    const params = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
      state: state,
    });

    return {
      authorization_url: `${baseUrl}?${params.toString()}`,
      provider: 'google.com',
      state: state,
    };
  }

  private getGitHubOAuthUrl(redirectUri: string) {
    const baseUrl = 'https://github.com/login/oauth/authorize';
    const state = this.generateStateToken();
    
    const params = new URLSearchParams({
      client_id: process.env.GITHUB_CLIENT_ID || '',
      redirect_uri: redirectUri,
      scope: 'user:email',
      state: state,
    });

    return {
      authorization_url: `${baseUrl}?${params.toString()}`,
      provider: 'github.com',
      state: state,
    };
  }

  private getMicrosoftOAuthUrl(redirectUri: string) {
    const baseUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
    const state = this.generateStateToken();
    
    const params = new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID || '',
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: state,
    });

    return {
      authorization_url: `${baseUrl}?${params.toString()}`,
      provider: 'microsoft.com',
      state: state,
    };
  }

  async exchangeCodeForToken(
    provider: string,
    authorizationCode: string,
    redirectUri: string
  ): Promise<OAuthTokens & { user_info: OAuthUserInfo }> {
    const exchangeMethods = {
      'google.com': this.exchangeGoogleCode.bind(this),
      'github.com': this.exchangeGitHubCode.bind(this),
      'microsoft.com': this.exchangeMicrosoftCode.bind(this),
    };

    if (!exchangeMethods[provider as keyof typeof exchangeMethods]) {
      throw new Error(`Unsupported provider: ${provider}`);
    }

    return exchangeMethods[provider as keyof typeof exchangeMethods](authorizationCode, redirectUri);
  }

  private async exchangeGoogleCode(authorizationCode: string, redirectUri: string) {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        code: authorizationCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Google token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();

    // Get user info from Google
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch Google user info');
    }

    const userInfo = await userInfoResponse.json();

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      id_token: tokenData.id_token,
      expires_in: tokenData.expires_in,
      user_info: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        provider: 'google.com',
      },
    };
  }

  private async exchangeGitHubCode(authorizationCode: string, redirectUri: string) {
    const tokenUrl = 'https://github.com/login/oauth/access_token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: process.env.GITHUB_CLIENT_ID || '',
        client_secret: process.env.GITHUB_CLIENT_SECRET || '',
        code: authorizationCode,
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`GitHub token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();

    // Get user info from GitHub
    const userInfoResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch GitHub user info');
    }

    const userInfo = await userInfoResponse.json();

    // Get user email from GitHub
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
      },
    });

    let email = '';
    if (emailResponse.ok) {
      const emails = await emailResponse.json();
      const primaryEmail = emails.find((e: any) => e.primary);
      email = primaryEmail?.email || userInfo.email || '';
    }

    return {
      access_token: tokenData.access_token,
      user_info: {
        id: userInfo.id.toString(),
        email: email,
        name: userInfo.name || userInfo.login,
        picture: userInfo.avatar_url,
        provider: 'github.com',
      },
    };
  }

  private async exchangeMicrosoftCode(authorizationCode: string, redirectUri: string) {
    const tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID || '',
        client_secret: process.env.MICROSOFT_CLIENT_SECRET || '',
        code: authorizationCode,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error(`Microsoft token exchange failed: ${response.statusText}`);
    }

    const tokenData = await response.json();

    // Get user info from Microsoft
    const userInfoResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userInfoResponse.ok) {
      throw new Error('Failed to fetch Microsoft user info');
    }

    const userInfo = await userInfoResponse.json();

    return {
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_in: tokenData.expires_in,
      user_info: {
        id: userInfo.id,
        email: userInfo.mail || userInfo.userPrincipalName,
        name: userInfo.displayName,
        picture: undefined, // Microsoft Graph doesn't provide profile picture by default
        provider: 'microsoft.com',
      },
    };
  }

  async authenticateWithFirebase(
    providerToken: string,
    provider: string,
    userInfo: OAuthUserInfo
  ): Promise<FirebaseAuthResult> {
    try {
      // Create custom token for the user
      const uid = `${provider}_${userInfo.id}`;

      // Set custom claims
      const customClaims = {
        provider: provider,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture,
        userGroup: 'enterprise', // Default to enterprise for OAuth users
        roles: ['Customer'], // Default role
        permissions: [
          'analytics:read',
          'voice:use',
          'notifications:read',
        ],
      };

      // Create or update user in Firebase
      let userRecord;
      try {
        userRecord = await admin.auth().getUser(uid);
        // Update existing user
        await admin.auth().updateUser(uid, {
          email: userInfo.email,
          displayName: userInfo.name,
          photoURL: userInfo.picture,
        });
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          // Create new user
          userRecord = await admin.auth().createUser({
            uid: uid,
            email: userInfo.email,
            displayName: userInfo.name,
            photoURL: userInfo.picture,
          });
        } else {
          throw error;
        }
      }

      // Set custom claims
      await admin.auth().setCustomUserClaims(uid, customClaims);

      // Generate custom token
      const customToken = await admin.auth().createCustomToken(uid);

      // Store user in Firestore
      await this.storeOAuthUser(userInfo, provider, uid);

      return {
        firebase_token: customToken,
        user_id: uid,
        user_record: {
          uid: userRecord.uid,
          email: userRecord.email || '',
          display_name: userRecord.displayName || undefined,
          photo_url: userRecord.photoURL || undefined,
          provider: provider,
        },
      };
    } catch (error) {
      throw new Error(`Firebase authentication failed: ${error}`);
    }
  }

  private async storeOAuthUser(userInfo: OAuthUserInfo, provider: string, uid: string) {
    const userDoc = {
      uid: uid,
      email: userInfo.email,
      display_name: userInfo.name,
      photo_url: userInfo.picture,
      provider: provider,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      last_login: admin.firestore.FieldValue.serverTimestamp(),
      oauth_data: {
        provider: provider,
        provider_uid: userInfo.id,
        access_token_hash: this.hashToken('access_token'), // In production, store securely
        refresh_token_available: false,
      },
      preferences: {
        notifications_enabled: true,
        voice_enabled: true,
        theme: 'light',
      },
      roles: ['Customer'], // Default role
      permissions: [
        'analytics:read',
        'voice:use',
        'notifications:read',
      ],
      userGroup: 'enterprise', // Default user group
    };

    // Store in Firestore
    const docRef = this.getDb().collection('users').doc(uid);
    await docRef.set(userDoc, { merge: true });
  }

  private hashToken(token: string): string {
    // In production, use a proper hashing function
    return Buffer.from(token).toString('base64').substring(0, 16);
  }

  private generateStateToken(): string {
    return randomBytes(32).toString('hex');
  }

  async getOAuthUser(uid: string): Promise<any> {
    const docRef = this.getDb().collection('users').doc(uid);
    const doc = await docRef.get();

    if (doc.exists) {
      return doc.data();
    }
    return null;
  }

  async updateUserLogin(uid: string): Promise<void> {
    const docRef = this.getDb().collection('users').doc(uid);
    await docRef.update({
      last_login: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}

export default FirebaseOAuthService; 
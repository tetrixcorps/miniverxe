import * as admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({ projectId: 'demo-test' }); // Use your test project or emulator
}

/**
 * Generates a Firebase custom token for a test user with optional custom claims.
 * @param uid - The user ID
 * @param claims - Custom claims (e.g., roles)
 */
export async function getTestToken(uid: string, claims: object = {}) {
  await admin.auth().setCustomUserClaims(uid, claims);
  return admin.auth().createCustomToken(uid, claims);
} 
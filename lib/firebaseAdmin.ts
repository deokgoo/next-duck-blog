import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

if (!admin.apps.length) {
  if (projectId && clientEmail && privateKey) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
      });
    } catch (error) {
      console.error('Firebase admin initialization error:', error);
    }
  } else {
    console.warn('Firebase admin environment variables are missing. Sparse initialization might cause errors if database is accessed.');
  }
}

// Initialize services only if app exists
export const db = admin.apps.length > 0 
  ? getFirestore(admin.app(), process.env.FIREBASE_DATABASE_ID || '(default)')
  : null as unknown as ReturnType<typeof getFirestore>;

export const storage = admin.apps.length > 0 
  ? admin.storage() 
  : null as unknown as ReturnType<typeof admin.storage>;

export const adminAuth = admin.apps.length > 0 
  ? admin.auth() 
  : null as unknown as ReturnType<typeof admin.auth>;

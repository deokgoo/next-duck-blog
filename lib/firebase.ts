import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const isConfigValid = !!firebaseConfig.apiKey;
const app = isConfigValid 
  ? (!getApps().length ? initializeApp(firebaseConfig) : getApp())
  : (getApps().length > 0 ? getApp() : null);

const storage = app ? getStorage(app) : null as unknown as ReturnType<typeof getStorage>;
const db = app ? getFirestore(app) : null as unknown as ReturnType<typeof getFirestore>;
const auth = app ? getAuth(app) : null as unknown as ReturnType<typeof getAuth>;
const googleProvider = new GoogleAuthProvider();

export { app, storage, db, auth, googleProvider };

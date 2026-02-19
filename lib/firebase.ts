import { initializeApp, getApps, getApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCxBqzmatPrZt7yDbpNdv5dRKIVS_XAdGs",
  authDomain: "duck-blog.firebaseapp.com",
  projectId: "duck-blog",
  storageBucket: "duck-blog.appspot.com",
  messagingSenderId: "1054327112353",
  appId: "1:1054327112353:web:5c0c27e262f40a051fa6e0"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const storage = getStorage(app);
const db = getFirestore(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
// const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export { app, storage, db, auth, googleProvider };

import { getApps, initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  sendPasswordResetEmail,
  onAuthStateChanged 
} from "firebase/auth";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  onSnapshot, 
  serverTimestamp,
  deleteDoc
} from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyBLwtxk0A8dN-vlL97Lrkjzfg_lm0YBQMQ",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "vampire-s-dream.firebaseapp.com",
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || "https://vampire-s-dream-default-rtdb.firebaseio.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "vampire-s-dream",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "vampire-s-dream.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "756289952800",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:756289952800:web:3f53f28f9eab4cbd5f7045"
};

let auth = null;
let db = null;
let messaging = null;

try {
  const existingApps = getApps();
  const app = existingApps.length > 0 ? existingApps[0] : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  messaging = getMessaging(app);
} catch (error) {
  console.warn('Firebase initialization failed. The app will continue in a limited mode.', error);
}

export { auth, db, messaging };

export {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  getToken,
  onMessage
};

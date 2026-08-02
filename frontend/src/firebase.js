import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  OAuthProvider,
  sendPasswordResetEmail,
  signInWithPopup,
} from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUPCAR26T9G8gMFrGdR2DUXUhAZSkw_18",
  authDomain: "ai-expense-analyzer-46f1c.firebaseapp.com",
  projectId: "ai-expense-analyzer-46f1c",
  storageBucket: "ai-expense-analyzer-46f1c.firebasestorage.app",
  messagingSenderId: "766134974028",
  appId: "1:766134974028:web:b45bba0d06acd84919e6e9",
  measurementId: "G-GQXCMWEBD1",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// ── Google (your existing setup, unchanged) ──
export const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

// ── Apple ──
export const appleProvider = new OAuthProvider("apple.com");
appleProvider.addScope("email");
appleProvider.addScope("name");

// ── Helper functions ──
export const signInGoogle = () => signInWithPopup(auth, provider);
export const signInApple  = () => signInWithPopup(auth, appleProvider);
export const sendReset    = (email) => sendPasswordResetEmail(auth, email);
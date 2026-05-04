import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAUPCAR26T9G8gMFrGdR2DUXUhAZSkw_18",
  authDomain: "ai-expense-analyzer-46f1c.firebaseapp.com",
  projectId: "ai-expense-analyzer-46f1c",
  storageBucket: "ai-expense-analyzer-46f1c.firebasestorage.app",
  messagingSenderId: "766134974028",
  appId: "1:766134974028:web:b45bba0d06acd84919e6e9",
  measurementId: "G-GQXCMWEBD1"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const provider = new GoogleAuthProvider();

// 🔥 IMPORTANT FIX
provider.setCustomParameters({
  prompt: "select_account"
});
import React, { createContext, useContext, useState } from "react";
import api from "../api/axios";
import { signInGoogle, signInApple, sendReset } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );

  const register = async (name, email, password) => {
    const res = await api.post("/api/register", { name, email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const login = async (email, password) => {
    const res = await api.post("/api/login", { email, password });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  // ── NEW: Google sign-in now exchanges the Firebase ID token for our own
  //         backend JWT, so /api/history, /api/goals, etc. work correctly. ──
  const loginWithGoogle = async () => {
    const result = await signInGoogle();
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken();

    const res = await api.post("/api/auth/google", { idToken });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  // ── NEW: same pattern for Apple sign-in ──────────────────────────────────
  const loginWithApple = async () => {
    const result = await signInApple();
    const firebaseUser = result.user;
    const idToken = await firebaseUser.getIdToken();

    const res = await api.post("/api/auth/apple", { idToken });
    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));
    setUser(res.data.user);
  };

  const forgotPassword = (email) => sendReset(email);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, login, register, logout, loginWithGoogle, loginWithApple, forgotPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
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

  const loginWithGoogle = async () => {
    const result = await signInGoogle();
    const firebaseUser = result.user;
    const userData = {
      name:  firebaseUser.displayName,
      email: firebaseUser.email,
      photo: firebaseUser.photoURL,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
  };

  const loginWithApple = async () => {
    const result = await signInApple();
    const firebaseUser = result.user;
    const userData = {
      name:  firebaseUser.displayName,
      email: firebaseUser.email,
      photo: firebaseUser.photoURL,
    };
    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
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
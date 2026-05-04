import React from "react";
import { signInWithPopup } from "firebase/auth";
import { auth, provider } from "../firebase";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async () => {
    const result = await signInWithPopup(auth, provider);
    setUser(result.user);
    navigate("/dashboard");
  };

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h2>AI Expense Analyzer</h2>
      <button onClick={login}>Continue with Google</button>
    </div>
  );
}
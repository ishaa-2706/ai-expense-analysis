import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo.png";

export default function Login() {
  const { login, register, loginWithGoogle, loginWithApple, forgotPassword } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister]     = useState(false);
  const [forgotMode, setForgotMode]     = useState(false);
  const [name, setName]                 = useState("");
  const [email, setEmail]               = useState("");
  const [password, setPassword]         = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState("");
  const [info, setInfo]                 = useState("");
  const [loading, setLoading]           = useState(false);

  // ── handlers ─────────────────────────────────────────────

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    setError(""); setInfo("");
    setLoading(true);
    try {
      await forgotPassword(email);
      setInfo("Reset link sent! Check your inbox.");
    } catch (err) {
      setError(err.message || "Could not send reset email.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError(""); setInfo("");
    setLoading(true);
    try {
      await loginWithGoogle();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleApple = async () => {
    setError(""); setInfo("");
    setLoading(true);
    try {
      await loginWithApple();
      navigate("/dashboard");
    } catch (err) {
      setError(err.message || "Apple sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  const switchMode = () => {
    setIsRegister(!isRegister);
    setForgotMode(false);
    setError(""); setInfo("");
  };

  // ── render ────────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .login-root {
          display: flex;
          min-height: 100vh;
          font-family: 'Inter', sans-serif;
          background: #f7f8fc;
        }

        /* ── LEFT PANEL ── */
        .login-left {
          flex: 0 0 480px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 40px 52px 36px;
          background: #fff;
        }

        .login-logo {
          display: flex;
          align-items: center;
          gap: 5px;
        }

        .login-logo img {
          width: 48px;
          height: 48px;
          object-fit: contain;
          flex-shrink: 0;
        }

        .logo-name {
          font-family: 'Poppins', sans-serif;
          font-size: 18px;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.5px;
          line-height: 1;
          display: block;
        }

        .logo-sub {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          font-weight: 500;
          color: #4361ee;
          letter-spacing: 1.2px;
          text-transform: uppercase;
          margin-top: 3px;
          display: block;
        }

        .login-form-wrapper {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 24px 0;
        }

        .login-title {
          font-family: 'Poppins', sans-serif;
          font-size: 30px;
          color: #1a1a2e;
          margin-bottom: 6px;
        }

        .login-subtitle {
          font-size: 13.5px;
          color: #8a8fa8;
          margin-bottom: 32px;
          line-height: 1.5;
        }

        .form-group {
          margin-bottom: 18px;
        }

        .form-label {
          display: block;
          font-size: 12.5px;
          font-weight: 500;
          color: #4a4f6a;
          margin-bottom: 7px;
          letter-spacing: 0.1px;
        }

        .form-input-wrap {
          position: relative;
        }

        .form-input {
          width: 100%;
          padding: 11px 14px;
          border: 1.5px solid #e4e6f0;
          border-radius: 10px;
          font-size: 14px;
          font-family: 'Inter', sans-serif;
          color: #1a1a2e;
          background: #fafbff;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input::placeholder { color: #b0b5cc; }

        .form-input:focus {
          border-color: #4361ee;
          box-shadow: 0 0 0 3px rgba(67,97,238,0.1);
          background: #fff;
        }

        .toggle-pw {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          background: none;
          border: none;
          cursor: pointer;
          color: #9098b8;
          padding: 2px;
          line-height: 1;
        }

        .form-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 22px;
          margin-top: -6px;
        }

        .remember-label {
          display: flex;
          align-items: center;
          gap: 7px;
          font-size: 13px;
          color: #6b7280;
          cursor: pointer;
        }

        .remember-label input[type="checkbox"] {
          width: 15px; height: 15px;
          accent-color: #4361ee;
          cursor: pointer;
        }

        .forgot-link {
          font-size: 13px;
          color: #4361ee;
          font-weight: 500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }
        .forgot-link:hover { text-decoration: underline; }

        .btn-primary {
          width: 100%;
          padding: 13px;
          background: #4361ee;
          color: #fff;
          border: none;
          border-radius: 10px;
          font-size: 14.5px;
          font-weight: 600;
          font-family: 'Inter', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.1s, box-shadow 0.2s;
          letter-spacing: 0.1px;
          margin-bottom: 20px;
        }

        .btn-primary:hover:not(:disabled) {
          background: #3451d1;
          box-shadow: 0 4px 14px rgba(67,97,238,0.35);
        }

        .btn-primary:active:not(:disabled) { transform: scale(0.99); }
        .btn-primary:disabled { opacity: 0.65; cursor: not-allowed; }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 18px;
        }

        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e8eaf2;
        }

        .divider span {
          font-size: 12px;
          color: #a0a5be;
          white-space: nowrap;
        }

        .social-btns {
          display: flex;
          gap: 12px;
          margin-bottom: 24px;
        }

        .btn-social {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 14px;
          border: 1.5px solid #e4e6f0;
          border-radius: 10px;
          background: #fff;
          font-size: 13.5px;
          font-weight: 500;
          font-family: 'Inter', sans-serif;
          color: #3a3f5c;
          cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
        }

        .btn-social:hover:not(:disabled) {
          border-color: #c8ccdf;
          background: #f9faff;
        }

        .btn-social:disabled { opacity: 0.65; cursor: not-allowed; }

        .error-msg {
          background: #fff0f0;
          border: 1px solid #ffd0d0;
          color: #d93025;
          border-radius: 8px;
          padding: 10px 13px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .info-msg {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #15803d;
          border-radius: 8px;
          padding: 10px 13px;
          font-size: 13px;
          margin-bottom: 16px;
        }

        .switch-mode {
          text-align: center;
          font-size: 13.5px;
          color: #6b7280;
        }

        .switch-mode a {
          color: #4361ee;
          font-weight: 600;
          text-decoration: none;
          cursor: pointer;
        }
        .switch-mode a:hover { text-decoration: underline; }

        .back-link {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 13px;
          color: #4361ee;
          font-weight: 500;
          cursor: pointer;
          margin-bottom: 20px;
          background: none;
          border: none;
          padding: 0;
          font-family: 'Inter', sans-serif;
        }
        .back-link:hover { text-decoration: underline; }

        .login-footer {
          font-size: 12px;
          color: #b0b5cc;
        }

        /* ── RIGHT PANEL ── */
        .login-right {
          flex: 1;
          background: linear-gradient(135deg, #3451d1 0%, #4361ee 50%, #6074f7 100%);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 48px 40px 48px 48px;
          position: relative;
          overflow: hidden;
        }
        .login-right::before {
          content: '';
          position: absolute;
          width: 420px; height: 420px;
          border-radius: 50%;
          background: rgba(255,255,255,0.06);
          top: -160px; right: -160px;
          pointer-events: none;
        }
        .login-right::after {
          content: '';
          position: absolute;
          width: 300px; height: 300px;
          border-radius: 50%;
          background: rgba(255,255,255,0.04);
          bottom: -100px; left: -60px;
          pointer-events: none;
        }
        .right-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 460px;
        }
        .right-headline {
          font-family: 'Poppins', sans-serif;
          font-size: 30px;
          font-weight: 700;
          color: #fff;
          line-height: 1.2;
          margin-bottom: 10px;
          text-align: left;
        }
        .right-sub {
          font-size: 13px;
          color: rgba(255,255,255,0.75);
          line-height: 1.6;
          margin-bottom: 32px;
          text-align: left;
        }

        /* ── MOCKUP WRAP ── */
        .mockup-wrap {
          position: relative;
          width: 100%;
          padding-bottom: 20px;
        }

        /* ── MAIN CARD ── */
        .mockup-main {
          background: #fff;
          border-radius: 18px;
          padding: 18px 18px 14px;
          box-shadow: 0 24px 64px rgba(0,0,0,0.28);
          text-align: left;
          width: 100%;
        }
        .mockup-topbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding-bottom: 12px;
          border-bottom: 1.5px solid #f0f1f8;
        }
        .mockup-app-name {
          font-size: 12px;
          font-weight: 700;
          color: #1a1a2e;
          letter-spacing: -0.2px;
          display: flex;
          align-items: center;
          gap: 7px;
        }
        .mockup-dot-menu { display: flex; gap: 3px; }
        .mockup-dot-menu span {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #c8ccdf;
          display: block;
        }

        /* KPI cards */
        .mockup-kpi-row {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          margin-bottom: 14px;
        }
        .kpi-card {
          border-radius: 11px;
          padding: 11px 12px 9px;
        }
        .kpi-card.purple { background: #f0ebff; }
        .kpi-card.green  { background: #e6faf0; }
        .kpi-card.blue   { background: #e8f0fe; }

        .kpi-label {
          font-size: 9px;
          font-weight: 600;
          margin-bottom: 5px;
          letter-spacing: 0.1px;
        }
        .kpi-card.purple .kpi-label { color: #7c3aed; }
        .kpi-card.green  .kpi-label { color: #16a34a; }
        .kpi-card.blue   .kpi-label { color: #1d4ed8; }

        .kpi-val {
          font-size: 16px;
          font-weight: 800;
          line-height: 1;
          margin-bottom: 5px;
        }
        .kpi-card.purple .kpi-val { color: #4f23b8; }
        .kpi-card.green  .kpi-val { color: #15803d; }
        .kpi-card.blue   .kpi-val { color: #1e40af; }

        .kpi-trend {
          font-size: 8.5px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 3px;
        }
        .kpi-card.purple .kpi-trend { color: #7c3aed; }
        .kpi-card.green  .kpi-trend { color: #16a34a; }
        .kpi-card.blue   .kpi-trend { color: #1d4ed8; }

        /* Mini bar chart */
        .mini-chart {
          display: flex;
          align-items: flex-end;
          gap: 4px;
          height: 52px;
          margin-bottom: 14px;
          padding: 0 2px;
        }
        .mini-bar {
          flex: 1;
          border-radius: 4px 4px 0 0;
          background: #e5e8ff;
        }
        .mini-bar.active { background: #4361ee; }

        /* Transactions */
        .txn-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        .txn-title {
          font-size: 11px;
          font-weight: 700;
          color: #1a1a2e;
        }
        .txn-link {
          font-size: 9.5px;
          color: #4361ee;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 3px;
          cursor: pointer;
        }
        .txn-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 7px 0;
          border-bottom: 1px solid #f5f6fb;
        }
        .txn-row:last-child { border-bottom: none; }
        .txn-left {
          display: flex;
          align-items: center;
          gap: 9px;
        }
        .txn-icon {
          width: 30px; height: 30px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .txn-icon.food   { background: #fef9c3; }
        .txn-icon.shop   { background: #ede9fe; }
        .txn-icon.travel { background: #dbeafe; }
        .txn-icon.health { background: #dcfce7; }

        .txn-name {
          font-size: 10.5px;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1;
          margin-bottom: 2px;
        }
        .txn-date {
          font-size: 9px;
          color: #9098b8;
        }
        .txn-amt {
          font-size: 11px;
          font-weight: 700;
        }
        .txn-amt.neg { color: #ef4444; }
        .txn-amt.pos { color: #22c55e; }

        /* ── FLOATING CATEGORIES CARD ── */
        .mockup-float {
          position: absolute;
          right: -32px;
          bottom: 0px;
          background: #fff;
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 16px 48px rgba(0,0,0,0.24);
          width: 190px;
          text-align: left;
          z-index: 10;
        }
        .float-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }
        .float-card-title {
          font-size: 11px;
          font-weight: 700;
          color: #1a1a2e;
          line-height: 1.3;
        }
        .float-card-sub {
          font-size: 8.5px;
          color: #9098b8;
          background: #f4f5fb;
          padding: 3px 8px;
          border-radius: 10px;
          white-space: nowrap;
          font-weight: 500;
        }
        .donut-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 10px;
        }
        .float-legend-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 4px 0;
          border-bottom: 1px solid #f5f6fb;
        }
        .float-legend-row:last-child { border-bottom: none; }
        .float-legend-left {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .legend-dot {
          width: 9px; height: 9px;
          border-radius: 3px;
          flex-shrink: 0;
        }
        .float-legend-label {
          font-size: 9.5px;
          color: #4a4f6a;
          font-weight: 500;
        }
        .float-legend-val {
          font-size: 9.5px;
          font-weight: 700;
          color: #1a1a2e;
        }

        /* responsive */
        @media (max-width: 820px) {
          .login-right { display: none; }
          .login-left  { flex: 1; padding: 40px 28px; }
        }
      `}</style>

      <div className="login-root">

        {/* ── LEFT ── */}
        <div className="login-left">

          {/* Logo */}
          <div className="login-logo">
            <img src={logo} alt="Logo" />
            <div>
              <span className="logo-name">SpendWise</span>
              <span className="logo-sub">AI Expense Analyzer</span>
            </div>
          </div>

          {/* Form area */}
          <div className="login-form-wrapper">

            {/* ── FORGOT PASSWORD MODE ── */}
            {forgotMode ? (
              <>
                <button
                  className="back-link"
                  onClick={() => { setForgotMode(false); setError(""); setInfo(""); }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Back to Login
                </button>

                <h1 className="login-title">Reset Password</h1>
                <p className="login-subtitle">
                  Enter your account email and we'll send you a reset link.
                </p>

                <form onSubmit={handleForgot}>
                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  {error && <div className="error-msg">{error}</div>}
                  {info  && <div className="info-msg">{info}</div>}

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Sending…" : "Send Reset Link"}
                  </button>
                </form>
              </>

            ) : (
              /* ── LOGIN / REGISTER MODE ── */
              <>
                <h1 className="login-title">
                  {isRegister ? "Create Account" : "Welcome Back"}
                </h1>
                <p className="login-subtitle">
                  {isRegister
                    ? "Sign up to start tracking your expenses with AI."
                    : "Enter your email and password to access your dashboard."}
                </p>

                <form onSubmit={handleSubmit}>
                  {isRegister && (
                    <div className="form-group">
                      <label className="form-label">Full Name</label>
                      <input
                        className="form-input"
                        type="text"
                        placeholder="Your Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  )}

                  <div className="form-group">
                    <label className="form-label">Email</label>
                    <input
                      className="form-input"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Password</label>
                    <div className="form-input-wrap">
                      <input
                        className="form-input"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        style={{ paddingRight: "40px" }}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-pw"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/>
                            <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/>
                            <line x1="1" y1="1" x2="23" y2="23"/>
                          </svg>
                        ) : (
                          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                            <circle cx="12" cy="12" r="3"/>
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  {!isRegister && (
                    <div className="form-row">
                      <label className="remember-label">
                        <input type="checkbox" /> Remember Me
                      </label>
                      {/* ✅ WIRED: opens forgot password flow */}
                      <button
                        type="button"
                        className="forgot-link"
                        onClick={() => { setForgotMode(true); setError(""); setInfo(""); }}
                      >
                        Forgot Your Password?
                      </button>
                    </div>
                  )}

                  {error && <div className="error-msg">{error}</div>}

                  <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? "Please wait…" : isRegister ? "Create Account" : "Log In"}
                  </button>
                </form>

                <div className="divider"><span>Or Login With</span></div>

                <div className="social-btns">
                  {/* ✅ WIRED: Google */}
                  <button type="button" className="btn-social" onClick={handleGoogle} disabled={loading}>
                    <svg width="16" height="16" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Google
                  </button>

                  {/* ✅ WIRED: Apple */}
                  <button type="button" className="btn-social" onClick={handleApple} disabled={loading}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Apple
                  </button>
                </div>

                <p className="switch-mode">
                  {isRegister ? "Already have an account? " : "Don't Have An Account? "}
                  <a onClick={switchMode}>
                    {isRegister ? "Sign In" : "Register Now."}
                  </a>
                </p>
              </>
            )}
          </div>

          <div className="login-footer">
            Copyright © 2025 AI Expense Analyzer. All rights reserved.
          </div>
        </div>

        {/* ── RIGHT (unchanged) ── */}
        <div className="login-right">
          <div className="right-content">
            <h2 className="right-headline">
              Effortlessly track your<br/>expenses with AI.
            </h2>
            <p className="right-sub">
              Log in to access your AI-powered expense dashboard,<br/>
              analyze spending patterns, and hit your savings goals.
            </p>

            <div className="mockup-wrap">
              {/* ── MAIN CARD ── */}
              <div className="mockup-main">

                {/* Topbar */}
                <div className="mockup-topbar">
                  <span className="mockup-app-name">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <rect x="2"  y="14" width="4" height="8"  rx="1.5" fill="#4361ee"/>
                      <rect x="8"  y="9"  width="4" height="13" rx="1.5" fill="#22c55e"/>
                      <rect x="14" y="5"  width="4" height="17" rx="1.5" fill="#ef4444"/>
                      <rect x="20" y="10" width="4" height="12" rx="1.5" fill="#f59e0b"/>
                    </svg>
                    Expense Dashboard
                  </span>
                  <div className="mockup-dot-menu"><span/><span/><span/></div>
                </div>

                {/* KPI Row */}
                <div className="mockup-kpi-row">
                  <div className="kpi-card purple">
                    <div className="kpi-label">Total Spent</div>
                    <div className="kpi-val">$3,248</div>
                    <div className="kpi-trend">
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><polyline points="1,8 5,2 9,8" stroke="#7c3aed" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      8% this month
                    </div>
                  </div>
                  <div className="kpi-card green">
                    <div className="kpi-label">Saved</div>
                    <div className="kpi-val">$812</div>
                    <div className="kpi-trend">
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none"><polyline points="1,8 5,2 9,8" stroke="#16a34a" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
                      12% vs last
                    </div>
                  </div>
                  <div className="kpi-card blue">
                    <div className="kpi-label">Budget Left</div>
                    <div className="kpi-val">$452</div>
                    <div className="kpi-trend">
                      <svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3" fill="#1d4ed8"/></svg>
                      18 days left
                    </div>
                  </div>
                </div>

                {/* Bar chart */}
                <div className="mini-chart">
                  {[28,38,22,52,35,68,48,74,56,82,64,92].map((h,i) => (
                    <div key={i} className={`mini-bar${i===11?" active":""}`} style={{height:`${h}%`}}/>
                  ))}
                </div>

                {/* Transactions */}
                <div className="txn-header">
                  <span className="txn-title">Recent Transactions</span>
                  <span className="txn-link">
                    View all
                    <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6h8M7 3l3 3-3 3" stroke="#4361ee" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                </div>

                <div className="txn-row">
                  <div className="txn-left">
                    <div className="txn-icon food">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a16207" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 7h18M3 12h18M3 17h18"/><path d="M5 7a7 7 0 0114 0"/>
                      </svg>
                    </div>
                    <div><div className="txn-name">Burger King</div><div className="txn-date">Today, 2:30 PM</div></div>
                  </div>
                  <span className="txn-amt neg">-$12.50</span>
                </div>

                <div className="txn-row">
                  <div className="txn-left">
                    <div className="txn-icon shop">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
                      </svg>
                    </div>
                    <div><div className="txn-name">Amazon</div><div className="txn-date">Yesterday</div></div>
                  </div>
                  <span className="txn-amt neg">-$84.00</span>
                </div>

                <div className="txn-row">
                  <div className="txn-left">
                    <div className="txn-icon travel">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 16v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><polyline points="3,10 12,3 21,10"/><line x1="12" y1="3" x2="12" y2="15"/>
                      </svg>
                    </div>
                    <div><div className="txn-name">Flight Refund</div><div className="txn-date">May 22</div></div>
                  </div>
                  <span className="txn-amt pos">+$210.00</span>
                </div>

                <div className="txn-row">
                  <div className="txn-left">
                    <div className="txn-icon health">
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"/>
                      </svg>
                    </div>
                    <div><div className="txn-name">Pharmacy</div><div className="txn-date">May 21</div></div>
                  </div>
                  <span className="txn-amt neg">-$18.75</span>
                </div>

              </div>{/* end mockup-main */}

              {/* ── FLOATING CATEGORIES CARD ── */}
              <div className="mockup-float">
                <div className="float-card-header">
                  <span className="float-card-title">Expense<br/>Categories</span>
                  <span className="float-card-sub">Monthly</span>
                </div>

                <div className="donut-wrap">
                  <svg width="150" height="90" viewBox="0 0 150 90">
                    <path d="M 15 85 A 60 60 0 0 1 135 85" fill="none" stroke="#f0f1f8" strokeWidth="16" strokeLinecap="round"/>
                    <path d="M 15 85 A 60 60 0 0 1 135 85" fill="none" stroke="#4361ee" strokeWidth="16" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="0"/>
                    <path d="M 15 85 A 60 60 0 0 1 135 85" fill="none" stroke="#a78bfa" strokeWidth="16" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="-75.4"/>
                    <path d="M 15 85 A 60 60 0 0 1 135 85" fill="none" stroke="#22c55e" strokeWidth="16" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="-122.8"/>
                    <path d="M 15 85 A 60 60 0 0 1 135 85" fill="none" stroke="#f59e0b" strokeWidth="16" strokeLinecap="round" strokeDasharray="188.5" strokeDashoffset="-160.5"/>
                    <text x="75" y="70" textAnchor="middle" fontSize="13" fontWeight="800" fill="#1a1a2e">$3,248</text>
                    <text x="75" y="82" textAnchor="middle" fontSize="8" fill="#9098b8">Total</text>
                  </svg>
                </div>

                {[
                  {color:"#4361ee", label:"Food",      val:"$1,299"},
                  {color:"#a78bfa", label:"Shopping",  val:"$812"},
                  {color:"#22c55e", label:"Transport", val:"$650"},
                  {color:"#f59e0b", label:"Other",     val:"$487"},
                ].map((c,i) => (
                  <div className="float-legend-row" key={i}>
                    <div className="float-legend-left">
                      <span className="legend-dot" style={{background:c.color}}/>
                      <span className="float-legend-label">{c.label}</span>
                    </div>
                    <span className="float-legend-val">{c.val}</span>
                  </div>
                ))}
              </div>

            </div>{/* end mockup-wrap */}
          </div>
        </div>

      </div>
    </>
  );
}
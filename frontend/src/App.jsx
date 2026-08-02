import React from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Sidebar } from "./components/shared";

import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Upload from "./components/Upload";
import Results from "./components/Results";
import Transactions from "./components/Transactions";
import Categories from "./components/Categories";
import Reports from "./components/Reports";
import Predictions from "./components/Predictions";
import Alerts from "./components/Alerts";
import Settings from "./components/Settings";
import FinancialHealthScore from "./components/FinancialHealthScore";
import GoalSavings from "./components/GoalSavings";
import CashTracker from "./components/CashTracker";

// ── Shared Layout — Sidebar + main content ─────────────────────────────────────
function PageLayout({ children }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={pathname} navigate={navigate} />
      <div style={{
        marginLeft: 220,
        flex: 1,
        minHeight: "100vh",
        overflowX: "hidden",
        background: "linear-gradient(135deg, #F0F4FF 0%, #F8FAFC 50%, #FDF4FF 100%)"
      }}>
        {children}
      </div>
    </div>
  );
}

// ── Private Route — login check + layout wrap ──────────────────────────────────
function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user
    ? <PageLayout>{children}</PageLayout>
    : <Navigate to="/" replace />;
}

// ── App ────────────────────────────────────────────────────────────────────────
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected */}
        <Route path="/dashboard"    element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/upload"       element={<PrivateRoute><Upload /></PrivateRoute>} />
        <Route path="/results"      element={<PrivateRoute><Results /></PrivateRoute>} />
        <Route path="/transactions" element={<PrivateRoute><Transactions /></PrivateRoute>} />
        <Route path="/categories"   element={<PrivateRoute><Categories /></PrivateRoute>} />
        <Route path="/reports"      element={<PrivateRoute><Reports /></PrivateRoute>} />
        <Route path="/predictions"  element={<PrivateRoute><Predictions /></PrivateRoute>} />
        <Route path="/alerts"       element={<PrivateRoute><Alerts /></PrivateRoute>} />
        <Route path="/settings"     element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="/score"        element={<PrivateRoute><FinancialHealthScore /></PrivateRoute>} />
        <Route path="/goals"        element={<PrivateRoute><GoalSavings /></PrivateRoute>} />
      </Routes>

      {/* CashTracker float — har page pe */}
      <AuthenticatedCashTracker />
    </BrowserRouter>
  );
}

// ── CashTracker sirf logged-in user ko dikhao ─────────────────────────────────
function AuthenticatedCashTracker() {
  const { user } = useAuth();
  return user ? <CashTracker /> : null;
}

export default App;
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import GoalSavings from "./components/GoalSavings";       // ✅ ADD
import CashTracker from "./components/CashTracker";       // ✅ ADD


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"             element={<Login />} />
        <Route path="/dashboard"    element={<Dashboard />} />
        <Route path="/upload"       element={<Upload />} />
        <Route path="/results"      element={<Results />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/categories"   element={<Categories />} />
        <Route path="/reports"      element={<Reports />} />
        <Route path="/predictions"  element={<Predictions />} />
        <Route path="/alerts"       element={<Alerts />} />
        <Route path="/settings"     element={<Settings />} />
        <Route path="/score"        element={<FinancialHealthScore />} />
        <Route path="/goals"        element={<GoalSavings />} />   {/* ✅ ADD */}
      </Routes>

      <CashTracker />   {/* ✅ ADD — outside Routes so it floats on every page */}

    </BrowserRouter>
  );
}

export default App;
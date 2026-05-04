import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS } from "./shared";
import { clearAnalysis } from "../store";

export default function Settings() {
  const navigate = useNavigate();
  const [name, setName] = useState("Manisha");
  const [email, setEmail] = useState("manisha@example.com");
  const [currency, setCurrency] = useState("INR (₹)");
  const [notifications, setNotifications] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };
  const handleClearData = () => { clearAnalysis(); navigate("/upload"); };

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/settings" navigate={navigate} />
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Settings</div>
            <div style={s.sub}>Manage your profile and app preferences.</div>
          </div>
        </div>

        <div style={{ maxWidth: 600, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Profile */}
          <div className="sw-card">
            <div style={s.cardTitle}>👤 Profile</div>
            <div style={{ display: "flex", gap: 16, flexDirection: "column" }}>
              {[
                { label: "Full Name", val: name, set: setName },
                { label: "Email Address", val: email, set: setEmail },
              ].map((f, i) => (
                <div key={i}>
                  <label style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 6 }}>{f.label}</label>
                  <input style={s.input} value={f.val} onChange={e => f.set(e.target.value)} />
                </div>
              ))}
              <div>
                <label style={{ fontSize: 12, color: "#9CA3AF", fontWeight: 600, display: "block", marginBottom: 6 }}>Currency</label>
                <select style={s.input} value={currency} onChange={e => setCurrency(e.target.value)}>
                  <option>INR (₹)</option><option>USD ($)</option><option>EUR (€)</option><option>GBP (£)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="sw-card">
            <div style={s.cardTitle}>🔔 Notifications</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Unusual Spending Alerts</div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>Get notified when unusual transactions are detected.</div>
              </div>
              <div
                onClick={() => setNotifications(n => !n)}
                style={{ width: 46, height: 26, borderRadius: 13, background: notifications ? "#7C3AED" : "#E5E7EB", cursor: "pointer", transition: "background .2s", position: "relative" }}
              >
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: notifications ? 22 : 3, transition: "left .2s", boxShadow: "0 1px 4px rgba(0,0,0,.2)" }} />
              </div>
            </div>
          </div>

          {/* Data management */}
          <div className="sw-card">
            <div style={s.cardTitle}>🗄 Data Management</div>
            <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 14, lineHeight: 1.6 }}>
              Your uploaded transaction data is stored in your browser's local storage. Clearing it will remove all analysis results and you'll need to upload again.
            </div>
            <button
              onClick={handleClearData}
              style={{ background: "#FEF2F2", color: "#DC2626", border: "1.5px solid #FECACA", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              🗑 Clear All Data & Start Over
            </button>
          </div>

          {/* About */}
          <div className="sw-card">
            <div style={s.cardTitle}>ℹ️ About</div>
            <div style={{ display: "flex", gap: 12, flexDirection: "column" }}>
              {[["App", "Spendwise AI"], ["Version", "1.0.0"], ["Backend", "FastAPI @ localhost:8000"], ["Frontend", "React + Recharts"]].map(([k, v]) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                  <span style={{ color: "#9CA3AF" }}>{k}</span>
                  <span style={{ color: "#374151", fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Save button */}
          <button onClick={handleSave} style={{ background: saved ? "#10B981" : "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700, cursor: "pointer", transition: "background .3s" }}>
            {saved ? "✅ Saved!" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

const s = {
  page:      { display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "linear-gradient(135deg,#F0F4FF 0%,#F8FAFC 50%,#FDF4FF 100%)" },
  main:      { flex: 1, padding: "28px 32px", overflowY: "auto" },
  topBar:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title:     { fontSize: 22, fontWeight: 700, color: "#0F172A" },
  sub:       { fontSize: 13, color: "#64748B", marginTop: 4 },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 14 },
  input:     { width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", color: "#374151", background: "#FAFAFA" },
};
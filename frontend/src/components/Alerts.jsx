import React from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { getAnalysis, DEMO } from "../store";

export default function Alerts() {
  const navigate = useNavigate();
  const stored = getAnalysis();
  const d = stored || DEMO;
  const transactions = d.transactions || [];
  const insights = d.insights || {};

  const unusualTxns = transactions.filter(t => t.status === "Unusual");
  const alerts = d.alerts || [];

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/alerts" navigate={navigate} />
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Alerts & Warnings</div>
            <div style={s.sub}>{unusualTxns.length} unusual transaction{unusualTxns.length !== 1 ? "s" : ""} detected.</div>
          </div>
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>⬆ Upload New</button>
        </div>

        {/* AI insights alert boxes */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {insights.unusual_msg && (
            <div style={{ flex: 1, minWidth: 260, background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>⚠️</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#DC2626" }}>Unusual Spending Detected</span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>{insights.unusual_msg}</div>
            </div>
          )}
          {insights.prediction_msg && (
            <div style={{ flex: 1, minWidth: 260, background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>🔮</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#2563EB" }}>Spending Prediction</span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7 }}>
                {insights.prediction_msg}
                {insights.prediction_range && <><br /><strong style={{ color: "#2563EB" }}>{insights.prediction_range}</strong></>}
              </div>
            </div>
          )}
          {!insights.unusual_msg && !insights.prediction_msg && (
            <div style={{ flex: 1, background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <span style={{ fontSize: 20 }}>✅</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#16A34A" }}>No AI Alerts</span>
              </div>
              <div style={{ fontSize: 13, color: "#374151" }}>Upload a file to generate AI-powered spending alerts.</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Unusual Transactions */}
          <div style={{ flex: 1 }} className="sw-card">
            <div style={s.cardTitle}>⚠ Unusual Transactions ({unusualTxns.length})</div>
            {unusualTxns.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#9CA3AF", fontSize: 14 }}>
                ✅ No unusual transactions found!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {unusualTxns.map((txn, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FFF8F0", border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>⚠️</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#0F172A" }}>{txn.description}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>
                        {txn.date}
                        <span style={{ display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, ...getCatColor(txn.category).tag }}>{txn.category}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#EF4444" }}>{fmt(txn.amount)}</div>
                      <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2 }}>⚠ Unusual</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* General alerts list */}
          <div style={{ width: 280, flexShrink: 0 }} className="sw-card">
            <div style={s.cardTitle}>🔔 Recent Alerts</div>
            {alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF", fontSize: 13 }}>No alerts yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {alerts.map((alert, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #F3F4F6", alignItems: "flex-start" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: alert.color, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 13, color: "#1E293B", fontWeight: 500 }}>{alert.label}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{alert.date}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
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
  uploadBtn: { background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 14 },
};
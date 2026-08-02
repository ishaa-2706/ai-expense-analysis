import React from "react";
import { useNavigate } from "react-router-dom";
import { GLOBAL_CSS, fmt, getCatColor } from "./shared";
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
      <style>{GLOBAL_CSS}{`@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');`}</style>
      
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Alerts & Warnings</div>
            <div style={s.sub}>{unusualTxns.length} unusual transaction{unusualTxns.length !== 1 ? "s" : ""} detected.</div>
          </div>
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 6, verticalAlign: "middle" }}><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0018 9h-1.26A8 8 0 103 16.3"/></svg>
            Upload New
          </button>
        </div>

        {/* AI insights alert boxes */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
          {insights.unusual_msg && (
            <div className="sw-card" style={{ flex: 1, minWidth: 260, background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#DC2626", fontFamily: "'Poppins', sans-serif" }}>Unusual Spending Detected</span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>{insights.unusual_msg}</div>
            </div>
          )}
          {insights.prediction_msg && (
            <div className="sw-card" style={{ flex: 1, minWidth: 260, background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563EB" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#2563EB", fontFamily: "'Poppins', sans-serif" }}>Spending Prediction</span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, fontFamily: "'Inter', sans-serif" }}>
                {insights.prediction_msg}
                {insights.prediction_range && <><br /><strong style={{ color: "#2563EB", fontFamily: "'Poppins', sans-serif" }}>{insights.prediction_range}</strong></>}
              </div>
            </div>
          )}
          {!insights.unusual_msg && !insights.prediction_msg && (
            <div className="sw-card" style={{ flex: 1, background: "#F0FDF4", border: "1.5px solid #BBF7D0", borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#16A34A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                <span style={{ fontWeight: 700, fontSize: 15, color: "#16A34A", fontFamily: "'Poppins', sans-serif" }}>No AI Alerts</span>
              </div>
              <div style={{ fontSize: 13, color: "#374151", fontFamily: "'Inter', sans-serif" }}>Upload a file to generate AI-powered spending alerts.</div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Unusual Transactions */}
          <div style={{ flex: 1 }} className="sw-card">
            <div style={s.cardTitle}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Unusual Transactions ({unusualTxns.length})
              </span>
            </div>
            {unusualTxns.length === 0 ? (
              <div style={{ textAlign: "center", padding: "30px 0", color: "#9CA3AF", fontSize: 14, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                No unusual transactions found!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {unusualTxns.map((txn, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 14, background: "#FFF8F0", border: "1px solid #FDE68A", borderRadius: 12, padding: "14px 16px" }}>
                    <div style={{ width: 44, height: 44, borderRadius: 12, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: "#0F172A", fontFamily: "'Poppins', sans-serif" }}>{txn.description}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>
                        {txn.date}
                        <span style={{ display: "inline-block", marginLeft: 8, padding: "2px 8px", borderRadius: 5, fontSize: 11, fontWeight: 500, ...getCatColor(txn.category).tag }}>{txn.category}</span>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "#EF4444", fontFamily: "'Poppins', sans-serif" }}>{fmt(txn.amount)}</div>
                      <div style={{ fontSize: 11, color: "#EF4444", marginTop: 2, fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4 }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                        Unusual
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* General alerts list */}
          <div style={{ width: 280, flexShrink: 0 }} className="sw-card">
            <div style={s.cardTitle}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                Recent Alerts
              </span>
            </div>
            {alerts.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px 0", color: "#9CA3AF", fontSize: 13, fontFamily: "'Inter', sans-serif" }}>No alerts yet.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {alerts.map((alert, i) => (
                  <div key={i} style={{ display: "flex", gap: 12, padding: "10px 0", borderBottom: "1px solid #F3F4F6", alignItems: "flex-start" }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: alert.color, flexShrink: 0, marginTop: 4 }} />
                    <div>
                      <div style={{ fontSize: 13, color: "#1E293B", fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}>{alert.label}</div>
                      <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2, fontFamily: "'Inter', sans-serif" }}>{alert.date}</div>
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
  page:      { minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  main:      { padding: "28px 32px" },
  topBar:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title:     { fontSize: 22, fontWeight: 700, color: "#0F172A", fontFamily: "'Poppins', sans-serif" },
  sub:       { fontSize: 13, color: "#64748B", marginTop: 4, fontFamily: "'Inter', sans-serif" },
  uploadBtn: { background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "inline-flex", alignItems: "center", fontFamily: "'Poppins', sans-serif" },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 14, fontFamily: "'Poppins', sans-serif" },
};
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { getAnalysis, DEMO } from "../store";

export default function Predictions() {
  const navigate = useNavigate();
  const stored = getAnalysis();
  const d = stored || DEMO;
  const categories = d.categories || [];
  const transactions = d.transactions || [];
  const total = categories.reduce((s, c) => s + Number(c.amount || 0), 0);
  const insights = d.insights || {};

  // Derive predictions from data
  const avgTxn = transactions.length ? total / transactions.length : 0;
  const unusualTxns = transactions.filter(t => t.status === "Unusual");
  const topCat = categories[0] || {};
  const secondCat = categories[1] || {};

  // Predict next month (simple: 10% increase over current)
  const predictedNext = total * 1.1;
  const weekendPredictRange = insights.prediction_range || `${fmt(total * 0.12)} – ${fmt(total * 0.16)}`;
  const weekendMsg = insights.prediction_msg || `Based on your spending pattern, you're likely to spend between ${weekendPredictRange} this weekend.`;

  // Category predictions (each category grows slightly)
  const catPredictions = categories.map(cat => ({
    ...cat,
    predicted: Math.round(Number(cat.amount) * (1 + (Math.random() * 0.15 + 0.03))),
  }));

  const [tips] = useState([
    { icon: "🍽", title: "Cut Food Costs", desc: `You've spent ${fmt(topCat.amount || 0)} on ${topCat.category || "Food"}. Consider meal prepping to save ₹2,000–₹3,000/month.`, saving: "₹2,000–₹3,000" },
    { icon: "✈️", title: "Optimize Travel", desc: `Monthly travel at ${fmt(secondCat.amount || 0)} can be reduced by using metro passes and carpooling.`, saving: "₹1,500–₹2,500" },
    { icon: "📱", title: "Review Subscriptions", desc: "Cancel unused subscriptions and recharges. Audit your bills for recurring charges you don't use.", saving: "₹500–₹1,000" },
    { icon: "🛍", title: "Smart Shopping", desc: "Consolidate purchases to sale days (like Big Billion Day). Avoid impulse buys flagged as unusual.", saving: "₹1,000–₹2,000" },
  ]);

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/predictions" navigate={navigate} />
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Predictions & Insights</div>
            <div style={s.sub}>AI-powered forecast based on your spending patterns.</div>
          </div>
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>⬆ Upload New</button>
        </div>

        {/* Main prediction banner */}
        <div style={{ background: "linear-gradient(135deg,#7C3AED,#4338CA)", borderRadius: 20, padding: "28px 32px", marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 20 }}>
          <div>
            <div style={{ color: "#DDD6FE", fontSize: 13, marginBottom: 6 }}>🔮 Next Month Prediction</div>
            <div style={{ color: "#fff", fontSize: 36, fontWeight: 800 }}>{fmt(predictedNext)}</div>
            <div style={{ color: "#A5B4FC", fontSize: 13, marginTop: 6 }}>
              Based on this month's spend of {fmt(total)} + 10% growth trend
            </div>
          </div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {[
              { label: "Current Month", val: fmt(total), sub: "actual", col: "#10B981" },
              { label: "Weekend Spend", val: weekendPredictRange, sub: "predicted", col: "#FBBF24" },
              { label: "Avg per Transaction", val: fmt(avgTxn), sub: "this period", col: "#60A5FA" },
            ].map((p, i) => (
              <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 14, padding: "14px 18px", minWidth: 130 }}>
                <div style={{ color: "#A5B4FC", fontSize: 11, marginBottom: 4 }}>{p.label}</div>
                <div style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>{p.val}</div>
                <div style={{ color: p.col, fontSize: 11, marginTop: 2 }}>↑ {p.sub}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 24, alignItems: "flex-start" }}>
          {/* Per-category predictions */}
          <div className="sw-card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={s.cardTitle}>Category-wise Predictions (Next Month)</div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["Category", "Current", "Predicted", "Change", "Trend"].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {catPredictions.map((cat, i) => {
                  const diff = cat.predicted - cat.amount;
                  const diffPct = ((diff / cat.amount) * 100).toFixed(1);
                  const color = getCatColor(cat.category);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #F9FAFB" }}>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color.dot }} />
                          <span style={{ fontWeight: 500 }}>{cat.category}</span>
                        </div>
                      </td>
                      <td style={s.td}>{fmt(cat.amount)}</td>
                      <td style={{ ...s.td, fontWeight: 700, color: "#0F172A" }}>{fmt(cat.predicted)}</td>
                      <td style={{ ...s.td, color: "#EF4444", fontWeight: 600 }}>+{diffPct}%</td>
                      <td style={{ ...s.td, width: 120 }}>
                        <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                          <div style={{ flex: 1, height: 5, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ height: "100%", width: `${Math.min((cat.predicted / predictedNext) * 100, 100)}%`, background: color.bar, borderRadius: 3 }} />
                          </div>
                          <span style={{ fontSize: 10, color: "#9CA3AF" }}>↑</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Weekend + AI insights */}
          <div style={{ width: 300, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>
            <div style={{ background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 16, padding: "18px" }}>
              <div style={{ color: "#2563EB", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>🗓 Weekend Prediction</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{weekendMsg}</div>
              {insights.prediction_range && (
                <div style={{ marginTop: 12, background: "#fff", borderRadius: 10, padding: "12px", textAlign: "center" }}>
                  <div style={{ fontSize: 11, color: "#9CA3AF" }}>Expected Range</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: "#2563EB" }}>{insights.prediction_range}</div>
                </div>
              )}
            </div>

            {insights.unusual_msg && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 16, padding: "18px" }}>
                <div style={{ color: "#DC2626", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>⚠ Risk Alert</div>
                <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>{insights.unusual_msg}</div>
                <button style={{ marginTop: 12, width: "100%", background: "#DC2626", color: "#fff", border: "none", borderRadius: 8, padding: "8px", fontSize: 12, fontWeight: 700, cursor: "pointer" }} onClick={() => navigate("/alerts")}>
                  View All Alerts
                </button>
              </div>
            )}

            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 16, padding: "18px" }}>
              <div style={{ color: "#16A34A", fontWeight: 700, fontSize: 14, marginBottom: 8 }}>💡 Budget Goal</div>
              <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.6 }}>
                To stay within your budget next month, aim to spend less than <strong>{fmt(total * 0.95)}</strong> — a 5% reduction from this month.
              </div>
            </div>
          </div>
        </div>

        {/* Saving tips */}
        <div className="sw-card">
          <div style={s.cardTitle}>💰 Personalized Saving Tips</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 14, marginTop: 4 }}>
            {tips.map((tip, i) => (
              <div key={i} style={{ background: "#F8FAFC", borderRadius: 12, padding: "16px 18px", border: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: 22 }}>{tip.icon}</span>
                  <span style={{ fontWeight: 700, fontSize: 14, color: "#0F172A" }}>{tip.title}</span>
                  <span style={{ marginLeft: "auto", background: "#D1FAE5", color: "#065F46", fontSize: 11, fontWeight: 600, borderRadius: 6, padding: "2px 8px" }}>{tip.saving}</span>
                </div>
                <div style={{ fontSize: 12, color: "#6B7280", lineHeight: 1.6 }}>{tip.desc}</div>
              </div>
            ))}
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
  th:        { textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" },
  td:        { padding: "12px 16px", color: "#374151", verticalAlign: "middle" },
};
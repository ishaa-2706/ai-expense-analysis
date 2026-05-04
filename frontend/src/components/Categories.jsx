import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { getAnalysis, DEMO } from "../store";

export default function Categories() {
  const navigate = useNavigate();
  const stored = getAnalysis();
  const d = stored || DEMO;
  const categories = d.categories || [];
  const transactions = d.transactions || [];
  const total = categories.reduce((s, c) => s + Number(c.amount || 0), 0);
  const [selected, setSelected] = useState(null);

  const selectedCat = selected || categories[0]?.category;
  const catTxns = transactions.filter(t => t.category === selectedCat);
  const catTotal = catTxns.reduce((s, t) => s + Number(t.amount || 0), 0);
  const unusualInCat = catTxns.filter(t => t.status === "Unusual").length;

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/categories" navigate={navigate} />
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Categories</div>
            <div style={s.sub}>Spending breakdown by category from your uploaded data.</div>
          </div>
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>⬆ Upload New</button>
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Left: category list */}
          <div style={{ width: 320, flexShrink: 0 }}>
            <div className="sw-card" style={{ marginBottom: 16 }}>
              <div style={s.cardTitle}>All Categories</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {categories.map((cat, i) => {
                  const pctVal = total > 0 ? ((cat.amount / total) * 100).toFixed(1) : 0;
                  const color = getCatColor(cat.category);
                  const isActive = selectedCat === cat.category;
                  return (
                    <div key={i}
                      onClick={() => setSelected(cat.category)}
                      style={{
                        padding: "12px 14px", borderRadius: 12, cursor: "pointer",
                        background: isActive ? "#F5F3FF" : "transparent",
                        border: `1.5px solid ${isActive ? "#C4B5FD" : "transparent"}`,
                        transition: "all .15s",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color.dot }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{cat.category}</span>
                        </div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: isActive ? "#7C3AED" : "#374151" }}>{fmt(cat.amount)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pctVal}%`, background: color.bar, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontSize: 11, color: "#9CA3AF", width: 36, textAlign: "right" }}>{pctVal}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {categories.length === 0 && (
                <div style={{ textAlign: "center", padding: "30px 0", color: "#9CA3AF", fontSize: 13 }}>
                  No categories found. <span style={{ color: "#7C3AED", cursor: "pointer" }} onClick={() => navigate("/upload")}>Upload a file →</span>
                </div>
              )}
            </div>

            {/* Total summary */}
            <div className="sw-card" style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none" }}>
              <div style={{ color: "#DDD6FE", fontSize: 12, marginBottom: 4 }}>Total Expenses</div>
              <div style={{ color: "#fff", fontSize: 24, fontWeight: 800 }}>{fmt(total)}</div>
              <div style={{ color: "#A5B4FC", fontSize: 12, marginTop: 4 }}>{categories.length} categories · {transactions.length} transactions</div>
            </div>
          </div>

          {/* Right: selected category detail */}
          {selectedCat && (
            <div style={{ flex: 1 }}>
              {/* Category header */}
              <div className="sw-card fade-in" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: getCatColor(selectedCat).tag.background, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>
                      {catEmoji(selectedCat)}
                    </div>
                    <div>
                      <div style={{ fontSize: 20, fontWeight: 700, color: "#0F172A" }}>{selectedCat}</div>
                      <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{catTxns.length} transactions</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#7C3AED" }}>{fmt(catTotal)}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF" }}>{total > 0 ? ((catTotal / total) * 100).toFixed(1) : 0}% of total</div>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Transactions", val: catTxns.length, bg: "#EFF6FF", col: "#3B82F6" },
                    { label: "Total Spent", val: fmt(catTotal), bg: "#F5F3FF", col: "#7C3AED" },
                    { label: "Avg per txn", val: catTxns.length ? fmt(catTotal / catTxns.length) : "—", bg: "#F0FDF4", col: "#10B981" },
                    { label: "Unusual", val: unusualInCat, bg: unusualInCat > 0 ? "#FEF2F2" : "#F9FAFB", col: unusualInCat > 0 ? "#EF4444" : "#9CA3AF" },
                  ].map((p, i) => (
                    <div key={i} style={{ background: p.bg, borderRadius: 10, padding: "10px 16px" }}>
                      <div style={{ fontSize: 11, color: "#9CA3AF" }}>{p.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: p.col, marginTop: 2 }}>{p.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions in this category */}
              <div className="sw-card fade-in" style={{ padding: 0, overflow: "hidden" }}>
                <div style={{ padding: "16px 20px", borderBottom: "1px solid #F3F4F6" }}>
                  <div style={s.cardTitle}>{selectedCat} — Transactions</div>
                </div>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC" }}>
                      {["Date", "Description", "Amount", "Status"].map(h => <th key={h} style={s.th}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {catTxns.slice(0, 20).map((txn, i) => (
                      <tr key={i} style={{ borderBottom: "1px solid #F9FAFB" }}>
                        <td style={s.td}>{txn.date}</td>
                        <td style={{ ...s.td, maxWidth: 280 }}>{txn.description}</td>
                        <td style={{ ...s.td, fontWeight: 600 }}>{fmt(txn.amount)}</td>
                        <td style={s.td}>
                          <span style={{ color: txn.status === "Unusual" ? "#EF4444" : "#10B981", fontWeight: 500, fontSize: 12 }}>
                            {txn.status === "Unusual" ? "⚠" : "✓"} {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {catTxns.length === 0 && (
                      <tr><td colSpan={4} style={{ textAlign: "center", padding: 30, color: "#9CA3AF" }}>No transactions in this category.</td></tr>
                    )}
                  </tbody>
                </table>
                {catTxns.length > 20 && (
                  <div style={{ textAlign: "center", padding: "12px 0", fontSize: 12, color: "#9CA3AF" }}>
                    Showing 20 of {catTxns.length}. <span style={{ color: "#7C3AED", cursor: "pointer" }} onClick={() => navigate("/transactions")}>View all in Transactions →</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function catEmoji(cat) {
  const map = { "Food & Dining": "🍽", "Travel": "✈️", "Shopping": "🛍", "Bills & Utilities": "💡", "Transfers": "💸", "Transport": "🚗", "Bills & Recharge": "📱" };
  return map[cat] || "📦";
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
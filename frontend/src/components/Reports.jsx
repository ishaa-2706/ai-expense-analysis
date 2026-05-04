import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Sidebar, GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { getAnalysis, DEMO } from "../store";

export default function Reports() {
  const navigate = useNavigate();
  const stored = getAnalysis();
  const d = stored || DEMO;
  const categories = d.categories || [];
  const transactions = d.transactions || [];
  const total = categories.reduce((s, c) => s + Number(c.amount || 0), 0);

  // Top 5 biggest transactions
  const topTxns = [...transactions].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);

  // Unusual transactions
  const unusualTxns = transactions.filter(t => t.status === "Unusual");

  // Monthly grouping (if dates available)
  const monthlyMap = {};
  transactions.forEach(t => {
    const m = parseMonth(t.date);
    if (m) monthlyMap[m] = (monthlyMap[m] || 0) + Number(t.amount || 0);
  });
  const monthlyData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/reports" navigate={navigate} />
      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Reports</div>
            <div style={s.sub}>Detailed financial summary of your uploaded transactions.</div>
          </div>
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>⬆ Upload New</button>
        </div>

        {/* Summary row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Expenditure", val: fmt(total), icon: "💰", bg: "#F5F3FF", col: "#7C3AED" },
            { label: "Total Transactions", val: d.total_transactions || transactions.length, icon: "📋", bg: "#EFF6FF", col: "#3B82F6" },
            { label: "Unusual Transactions", val: unusualTxns.length, icon: "⚠️", bg: "#FEF2F2", col: "#EF4444" },
          ].map((p, i) => (
            <div key={i} className="sw-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, flexShrink: 0 }}>{p.icon}</div>
              <div>
                <div style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>{p.label}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: p.col }}>{p.val}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 20, marginBottom: 24, alignItems: "flex-start" }}>
          {/* Category breakdown table */}
          <div className="sw-card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={s.cardTitle}>Category Breakdown</div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  <th style={s.th}>Category</th>
                  <th style={s.th}>Amount</th>
                  <th style={s.th}>% of Total</th>
                  <th style={s.th}>Transactions</th>
                  <th style={s.th}>Share</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, i) => {
                  const pctVal = total > 0 ? ((cat.amount / total) * 100).toFixed(1) : 0;
                  const catTxnCount = transactions.filter(t => t.category === cat.category).length;
                  const color = getCatColor(cat.category);
                  return (
                    <tr key={i} style={{ borderBottom: "1px solid #F9FAFB" }}>
                      <td style={s.td}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color.dot }} />
                          <span style={{ fontWeight: 500 }}>{cat.category}</span>
                        </div>
                      </td>
                      <td style={{ ...s.td, fontWeight: 700, color: "#0F172A" }}>{fmt(cat.amount)}</td>
                      <td style={{ ...s.td, color: "#7C3AED", fontWeight: 600 }}>{pctVal}%</td>
                      <td style={s.td}>{catTxnCount}</td>
                      <td style={{ ...s.td, width: 120 }}>
                        <div style={{ height: 6, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pctVal}%`, background: color.bar, borderRadius: 3 }} />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#F8FAFC" }}>
                  <td style={{ ...s.td, fontWeight: 700, color: "#0F172A" }}>Total</td>
                  <td style={{ ...s.td, fontWeight: 700, color: "#0F172A" }}>{fmt(total)}</td>
                  <td style={{ ...s.td, fontWeight: 700, color: "#7C3AED" }}>100%</td>
                  <td style={{ ...s.td, fontWeight: 700 }}>{transactions.length}</td>
                  <td style={s.td} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bar chart */}
          {monthlyData.length > 0 && (
            <div className="sw-card" style={{ width: 340, flexShrink: 0 }}>
              <div style={s.cardTitle}>Spending by Month</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyData} barSize={28}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
                  <Tooltip formatter={v => fmt(v)} cursor={{ fill: "#F5F3FF" }} />
                  <Bar dataKey="amount" radius={[6,6,0,0]}>
                    {monthlyData.map((_, i) => <Cell key={i} fill={i % 2 === 0 ? "#7C3AED" : "#A78BFA"} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          {/* Top transactions */}
          <div className="sw-card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={s.cardTitle}>🏆 Top 5 Largest Transactions</div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["#", "Date", "Description", "Category", "Amount"].map(h => <th key={h} style={s.th}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {topTxns.map((txn, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F9FAFB" }}>
                    <td style={{ ...s.td, color: "#9CA3AF", fontWeight: 700 }}>#{i + 1}</td>
                    <td style={s.td}>{txn.date}</td>
                    <td style={s.td}>{txn.description}</td>
                    <td style={s.td}>
                      <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500, ...getCatColor(txn.category).tag }}>{txn.category}</span>
                    </td>
                    <td style={{ ...s.td, fontWeight: 700, color: "#0F172A" }}>{fmt(txn.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unusual transactions */}
          <div className="sw-card" style={{ width: 320, flexShrink: 0, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
              <div style={s.cardTitle}>⚠️ Unusual Transactions ({unusualTxns.length})</div>
            </div>
            {unusualTxns.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center", color: "#9CA3AF", fontSize: 13 }}>✅ No unusual transactions detected!</div>
            ) : (
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {unusualTxns.map((txn, i) => (
                  <div key={i} style={{ background: "#FFF8F0", border: "1px solid #FDE68A", borderRadius: 10, padding: "12px 14px" }}>
                    <div style={{ fontWeight: 600, fontSize: 13, color: "#92400E" }}>{txn.description}</div>
                    <div style={{ fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{txn.date} · {txn.category}</div>
                    <div style={{ fontSize: 15, fontWeight: 800, color: "#EF4444", marginTop: 4 }}>{fmt(txn.amount)}</div>
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

function parseMonth(dateStr) {
  if (!dateStr) return null;
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  for (const m of months) { if (dateStr.includes(m)) return m; }
  // Try numeric format like 09/06/2025
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length >= 2) {
    const monthNum = parseInt(parts[1] || parts[0]);
    if (monthNum >= 1 && monthNum <= 12) return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][monthNum - 1];
  }
  return null;
}

const s = {
  page:      { display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "linear-gradient(135deg,#F0F4FF 0%,#F8FAFC 50%,#FDF4FF 100%)" },
  main:      { flex: 1, padding: "28px 32px", overflowY: "auto" },
  topBar:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title:     { fontSize: 22, fontWeight: 700, color: "#0F172A" },
  sub:       { fontSize: 13, color: "#64748B", marginTop: 4 },
  uploadBtn: { background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  cardTitle: { fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 0 },
  th:        { textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" },
  td:        { padding: "12px 16px", color: "#374151", verticalAlign: "middle" },
};
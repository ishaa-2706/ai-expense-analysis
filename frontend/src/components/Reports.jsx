import React from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Sidebar, GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { getAnalysis, DEMO } from "../store";

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
    <polyline points="16 9 12 5 8 9"/>
    <line x1="12" y1="5" x2="12" y2="17"/>
  </svg>
);

const IconWallet = ({ color = "#7C3AED" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="7" width="20" height="14" rx="2"/>
    <path d="M16 2H8L6 7h12L16 2z" strokeLinejoin="round"/>
    <circle cx="17" cy="14" r="1.5" fill={color} stroke="none"/>
  </svg>
);

const IconReceipt = ({ color = "#3B82F6" }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z"/>
    <path d="M14 2v6h6"/>
    <line x1="9" y1="13" x2="15" y2="13"/>
    <line x1="9" y1="17" x2="13" y2="17"/>
  </svg>
);

const IconAlertTriangle = ({ color = "#EF4444", size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconTrophy = ({ color = "#D97706" }) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 6 2 18 2 18 9"/>
    <path d="M6 18H4a2 2 0 01-2-2v-1a2 2 0 012-2h16a2 2 0 012 2v1a2 2 0 01-2 2h-2"/>
    <rect x="6" y="18" width="12" height="4" rx="1"/>
    <path d="M6 9a6 6 0 0012 0"/>
  </svg>
);

const IconShieldCheck = ({ color = "#10B981" }) => (
  <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <polyline points="9 12 11 14 15 10"/>
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────────
export default function Reports() {
  const navigate = useNavigate();
  const stored = getAnalysis();
  const d = stored || DEMO;
  const categories = d.categories || [];
  const transactions = d.transactions || [];
  const total = categories.reduce((s, c) => s + Number(c.amount || 0), 0);

  const topTxns    = [...transactions].sort((a, b) => Number(b.amount) - Number(a.amount)).slice(0, 5);
  const unusualTxns = transactions.filter(t => t.status === "Unusual");

  const monthlyMap = {};
  transactions.forEach(t => {
    const m = parseMonth(t.date);
    if (m) monthlyMap[m] = (monthlyMap[m] || 0) + Number(t.amount || 0);
  });
  const monthlyData = Object.entries(monthlyMap).map(([month, amount]) => ({ month, amount }));

  const summaryCards = [
    { label: "Total Expenditure",    val: fmt(total),                                icon: <IconWallet color="#7C3AED" />,        bg: "#F5F3FF", col: "#7C3AED" },
    { label: "Total Transactions",   val: d.total_transactions || transactions.length, icon: <IconReceipt color="#3B82F6" />,      bg: "#EFF6FF", col: "#3B82F6" },
    { label: "Unusual Transactions", val: unusualTxns.length,                         icon: <IconAlertTriangle color="#EF4444" />, bg: "#FEF2F2", col: "#EF4444" },
  ];

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/reports" navigate={navigate} />
      <div style={s.main}>

        {/* Header */}
        <div style={s.topBar}>
          <div>
            {/* Title → Poppins */}
            <div style={s.title}>Reports</div>
            {/* Subtitle → Inter */}
            <div style={s.sub}>Detailed financial summary of your uploaded transactions.</div>
          </div>
          {/* Button → Poppins */}
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>
            <IconUpload /> Upload New
          </button>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {summaryCards.map((p, i) => (
            <div key={i} className="sw-card" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 14, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {p.icon}
              </div>
              <div>
                {/* Label → Inter */}
                <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>{p.label}</div>
                {/* Value → Poppins */}
                <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 800, color: p.col }}>{p.val}</div>
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
                  {["Category", "Amount", "% of Total", "Transactions", "Share"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
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
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: color.dot, flexShrink: 0 }} />
                          {/* Category name → Inter */}
                          <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 500 }}>{cat.category}</span>
                        </div>
                      </td>
                      {/* Amount → Poppins */}
                      <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#0F172A" }}>{fmt(cat.amount)}</td>
                      {/* % → Poppins */}
                      <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", color: "#7C3AED", fontWeight: 600 }}>{pctVal}%</td>
                      {/* Txn count → Inter */}
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
                  <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#0F172A" }}>Total</td>
                  <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#0F172A" }}>{fmt(total)}</td>
                  <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#7C3AED" }}>100%</td>
                  <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", fontWeight: 700 }}>{transactions.length}</td>
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
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
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

          {/* Top 5 transactions */}
          <div className="sw-card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
              {/* Card title with trophy icon → Poppins */}
              <div style={{ ...s.cardTitle, display: "flex", alignItems: "center", gap: 7 }}>
                <IconTrophy color="#D97706" /> Top 5 Largest Transactions
              </div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#F8FAFC" }}>
                  {["#", "Date", "Description", "Category", "Amount"].map(h => (
                    <th key={h} style={s.th}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {topTxns.map((txn, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #F9FAFB" }}>
                    {/* Rank → Poppins */}
                    <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", color: "#9CA3AF", fontWeight: 700 }}>#{i + 1}</td>
                    <td style={s.td}>{txn.date}</td>
                    <td style={s.td}>{txn.description}</td>
                    <td style={s.td}>
                      <span style={{ fontFamily: "'Inter', sans-serif", display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500, ...getCatColor(txn.category).tag }}>
                        {txn.category}
                      </span>
                    </td>
                    {/* Amount → Poppins */}
                    <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#0F172A" }}>{fmt(txn.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Unusual transactions */}
          <div className="sw-card" style={{ width: 320, flexShrink: 0, padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid #F3F4F6" }}>
              {/* Card title with alert icon → Poppins */}
              <div style={{ ...s.cardTitle, display: "flex", alignItems: "center", gap: 7 }}>
                <IconAlertTriangle color="#EF4444" size={16} /> Unusual Transactions ({unusualTxns.length})
              </div>
            </div>
            {unusualTxns.length === 0 ? (
              <div style={{ padding: "36px 20px", display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
                <IconShieldCheck color="#10B981" />
                {/* Empty state text → Inter */}
                <div style={{ fontFamily: "'Inter', sans-serif", color: "#9CA3AF", fontSize: 13, textAlign: "center" }}>
                  No unusual transactions detected!
                </div>
              </div>
            ) : (
              <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 10 }}>
                {unusualTxns.map((txn, i) => (
                  <div key={i} style={{ background: "#FFF8F0", border: "1px solid #FDE68A", borderRadius: 10, padding: "12px 14px" }}>
                    {/* Description → Poppins */}
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: 13, color: "#92400E" }}>{txn.description}</div>
                    {/* Meta → Inter */}
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{txn.date} · {txn.category}</div>
                    {/* Amount → Poppins */}
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 15, fontWeight: 800, color: "#EF4444", marginTop: 4 }}>{fmt(txn.amount)}</div>
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
  const parts = dateStr.split(/[\/\-]/);
  if (parts.length >= 2) {
    const monthNum = parseInt(parts[1] || parts[0]);
    if (monthNum >= 1 && monthNum <= 12) return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][monthNum - 1];
  }
  return null;
}

const s = {
  /* Base → Inter; Poppins applied inline where needed */
  page:      { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg,#F0F4FF 0%,#F8FAFC 50%,#FDF4FF 100%)" },
  main:      { flex: 1, padding: "28px 32px", overflowY: "auto" },
  topBar:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  /* Title → Poppins */
  title:     { fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 700, color: "#0F172A" },
  /* Subtitle → Inter */
  sub:       { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748B", marginTop: 4 },
  /* Button → Poppins */
  uploadBtn: { fontFamily: "'Poppins', sans-serif", background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 },
  /* Card title → Poppins */
  cardTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 0 },
  /* Table header → Inter */
  th:        { fontFamily: "'Inter', sans-serif", textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" },
  /* Table cell → Inter */
  td:        { fontFamily: "'Inter', sans-serif", padding: "12px 16px", color: "#374151", verticalAlign: "middle" },
};
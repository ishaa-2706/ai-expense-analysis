import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { getAnalysis, DEMO } from "../store";

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IconUpload = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
    <polyline points="16 9 12 5 8 9"/>
    <line x1="12" y1="5" x2="12" y2="17"/>
  </svg>
);

const IconWarning = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconCheck = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#10B981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const CatIcon = ({ cat, color }) => {
  const c = color || "#7C3AED";
  const icons = {
    "Food & Dining": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8c0-2.21-2.69-4-6-4S6 5.79 6 8v1h12V8z"/>
        <rect x="4" y="9" width="16" height="12" rx="1.5"/>
        <line x1="12" y1="9" x2="12" y2="21"/>
      </svg>
    ),
    "Restaurants": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8c0-2.21-2.69-4-6-4S6 5.79 6 8v1h12V8z"/>
        <rect x="4" y="9" width="16" height="12" rx="1.5"/>
        <line x1="12" y1="9" x2="12" y2="21"/>
      </svg>
    ),
    "Groceries": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    "Travel": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/>
      </svg>
    ),
    "Shopping": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
        <line x1="3" y1="6" x2="21" y2="6"/>
        <path d="M16 10a4 4 0 01-8 0"/>
      </svg>
    ),
    "Bills & Utilities": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    "Utilities": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
    "Bills & Recharge": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
        <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth="2.5"/>
      </svg>
    ),
    "Transfers": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="17 1 21 5 17 9"/>
        <path d="M3 11V9a4 4 0 014-4h14"/>
        <polyline points="7 23 3 19 7 15"/>
        <path d="M21 13v2a4 4 0 01-4 4H3"/>
      </svg>
    ),
    "Transport": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="2"/>
        <path d="M16 8h4l3 3v5h-7V8z"/>
        <circle cx="5.5" cy="18.5" r="2.5"/>
        <circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
    "Health": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
      </svg>
    ),
    "Education": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/>
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/>
      </svg>
    ),
    "Entertainment": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="23 7 16 12 23 17 23 7"/>
        <rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
      </svg>
    ),
    "Movies & Dvds": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polygon points="10 8 16 12 10 16 10 8"/>
      </svg>
    ),
    "Rent & Housing": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
    "Income": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23"/>
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
      </svg>
    ),
    "Cash": (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="6" width="20" height="12" rx="2"/>
        <circle cx="12" cy="12" r="3"/>
        <path d="M6 12h.01M18 12h.01"/>
      </svg>
    ),
  };
  const fallback = (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="12" rx="2"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );
  return icons[cat] || fallback;
};

// ── Component ──────────────────────────────────────────────────────────────────
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

      <div style={s.main}>
        <div style={s.topBar}>
          <div>
            <div style={s.title}>Categories</div>
            <div style={s.sub}>Spending breakdown by category from your uploaded data.</div>
          </div>
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>
            <IconUpload /> Upload New
          </button>
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
                          <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 600, color: "#0F172A" }}>{cat.category}</span>
                        </div>
                        <span style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: isActive ? "#7C3AED" : "#374151" }}>{fmt(cat.amount)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ flex: 1, height: 5, background: "#F1F5F9", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${pctVal}%`, background: color.bar, borderRadius: 3 }} />
                        </div>
                        <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9CA3AF", width: 36, textAlign: "right" }}>{pctVal}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              {categories.length === 0 && (
                <div style={{ fontFamily: "'Inter', sans-serif", textAlign: "center", padding: "30px 0", color: "#9CA3AF", fontSize: 13 }}>
                  No categories found. <span style={{ color: "#7C3AED", cursor: "pointer" }} onClick={() => navigate("/upload")}>Upload a file →</span>
                </div>
              )}
            </div>

            {/* Total summary card */}
            <div className="sw-card" style={{ background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none" }}>
              <div style={{ fontFamily: "'Inter', sans-serif", color: "#DDD6FE", fontSize: 12, marginBottom: 4 }}>Total Expenses</div>
              <div style={{ fontFamily: "'Poppins', sans-serif", color: "#fff", fontSize: 24, fontWeight: 800 }}>{fmt(total)}</div>
              <div style={{ fontFamily: "'Inter', sans-serif", color: "#A5B4FC", fontSize: 12, marginTop: 4 }}>{categories.length} categories · {transactions.length} transactions</div>
            </div>
          </div>

          {/* Right: selected category detail */}
          {selectedCat && (
            <div style={{ flex: 1 }}>
              <div className="sw-card fade-in" style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: getCatColor(selectedCat).tag.background, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <CatIcon cat={selectedCat} color={getCatColor(selectedCat).dot} />
                    </div>
                    <div>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: "#0F172A" }}>{selectedCat}</div>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9CA3AF", marginTop: 2 }}>{catTxns.length} transactions</div>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 800, color: "#7C3AED" }}>{fmt(catTotal)}</div>
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9CA3AF" }}>{total > 0 ? ((catTotal / total) * 100).toFixed(1) : 0}% of total</div>
                  </div>
                </div>

                <div style={{ display: "flex", gap: 12, marginTop: 16, flexWrap: "wrap" }}>
                  {[
                    { label: "Transactions", val: catTxns.length,                                               bg: "#EFF6FF", col: "#3B82F6" },
                    { label: "Total Spent",  val: fmt(catTotal),                                                bg: "#F5F3FF", col: "#7C3AED" },
                    { label: "Avg per txn",  val: catTxns.length ? fmt(catTotal / catTxns.length) : "—",        bg: "#F0FDF4", col: "#10B981" },
                    { label: "Unusual",      val: unusualInCat, bg: unusualInCat > 0 ? "#FEF2F2" : "#F9FAFB",  col: unusualInCat > 0 ? "#EF4444" : "#9CA3AF" },
                  ].map((p, i) => (
                    <div key={i} style={{ background: p.bg, borderRadius: 10, padding: "10px 16px" }}>
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9CA3AF" }}>{p.label}</div>
                      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 16, fontWeight: 700, color: p.col, marginTop: 2 }}>{p.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Transactions table */}
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
                        <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>{fmt(txn.amount)}</td>
                        <td style={s.td}>
                          <span style={{ fontFamily: "'Inter', sans-serif", display: "inline-flex", alignItems: "center", gap: 4, color: txn.status === "Unusual" ? "#EF4444" : "#10B981", fontWeight: 500, fontSize: 12 }}>
                            {txn.status === "Unusual" ? <IconWarning /> : <IconCheck />}
                            {txn.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {catTxns.length === 0 && (
                      <tr>
                        <td colSpan={4} style={{ fontFamily: "'Inter', sans-serif", textAlign: "center", padding: 30, color: "#9CA3AF" }}>
                          No transactions in this category.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
                {catTxns.length > 20 && (
                  <div style={{ fontFamily: "'Inter', sans-serif", textAlign: "center", padding: "12px 0", fontSize: 12, color: "#9CA3AF" }}>
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

const s = {
  page:      { minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  main:      { padding: "28px 32px" },
  topBar:    { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 },
  title:     { fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 700, color: "#0F172A" },
  sub:       { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748B", marginTop: 4 },
  uploadBtn: { fontFamily: "'Poppins', sans-serif", background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 },
  cardTitle: { fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 14 },
  th:        { fontFamily: "'Inter', sans-serif", textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em" },
  td:        { fontFamily: "'Inter', sans-serif", padding: "12px 16px", color: "#374151", verticalAlign: "middle" },
};
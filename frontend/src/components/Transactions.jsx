import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { getAnalysis, DEMO } from "../store";

export default function Transactions() {
  const navigate = useNavigate();
  const stored = getAnalysis();
  const d = stored || DEMO;
  const all = d.transactions || [];

  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [page, setPage] = useState(1);
  const PER_PAGE = 15;

  const categories = useMemo(() => ["All", ...Array.from(new Set(all.map(t => t.category)))], [all]);

  const filtered = useMemo(() => {
    let res = all.filter(t => {
      const q = search.toLowerCase();
      const matchSearch = !q || t.description?.toLowerCase().includes(q) || t.category?.toLowerCase().includes(q) || String(t.amount).includes(q);
      const matchCat = catFilter === "All" || t.category === catFilter;
      const matchStatus = statusFilter === "All" || t.status === statusFilter;
      return matchSearch && matchCat && matchStatus;
    });
    res = [...res].sort((a, b) => {
      let av = sortBy === "amount" ? Number(a.amount) : a[sortBy] || "";
      let bv = sortBy === "amount" ? Number(b.amount) : b[sortBy] || "";
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return res;
  }, [all, search, catFilter, statusFilter, sortBy, sortDir]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const totalFiltered = filtered.reduce((s, t) => s + Number(t.amount || 0), 0);
  const unusualCount = filtered.filter(t => t.status === "Unusual").length;

  const handleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
    setPage(1);
  };

  const SortIcon = ({ col }) => (
    <span style={{ marginLeft: 4, opacity: sortBy === col ? 1 : 0.3, fontSize: 10 }}>
      {sortBy === col ? (sortDir === "asc" ? "▲" : "▼") : "⇅"}
    </span>
  );

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/transactions" navigate={navigate} />
      <div style={s.main}>
        {/* Header */}
        <div style={s.topBar}>
          <div>
            <div style={s.title}>All Transactions</div>
            <div style={s.sub}>{filtered.length} transactions · {fmt(totalFiltered)} total</div>
          </div>
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>⬆ Upload New</button>
        </div>

        {/* Summary pills */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total Transactions", val: all.length, bg: "#EFF6FF", col: "#3B82F6" },
            { label: "Total Amount", val: fmt(d.total_expense || 0), bg: "#F5F3FF", col: "#7C3AED" },
            { label: "Unusual Detected", val: unusualCount, bg: "#FEF2F2", col: "#EF4444" },
            { label: "Categories", val: categories.length - 1, bg: "#F0FDF4", col: "#10B981" },
          ].map((p, i) => (
            <div key={i} style={{ background: p.bg, borderRadius: 12, padding: "10px 18px", fontSize: 13 }}>
              <span style={{ color: "#9CA3AF", fontWeight: 500 }}>{p.label}: </span>
              <span style={{ color: p.col, fontWeight: 700 }}>{p.val}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="sw-card" style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          <input
            style={s.search}
            placeholder="🔍  Search description, category, amount…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
          />
          <select style={s.select} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select style={s.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option>All</option><option>Normal</option><option>Unusual</option>
          </select>
          {(search || catFilter !== "All" || statusFilter !== "All") && (
            <button style={{ fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
              onClick={() => { setSearch(""); setCatFilter("All"); setStatusFilter("All"); setPage(1); }}>
              ✕ Clear filters
            </button>
          )}
          <span style={{ marginLeft: "auto", fontSize: 12, color: "#9CA3AF" }}>{filtered.length} results</span>
        </div>

        {/* Table */}
        <div className="sw-card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#F8FAFC" }}>
                {[["date","Date"], ["description","Description"], ["category","Category"], ["amount","Amount"], ["status","Status"]].map(([col, label]) => (
                  <th key={col} style={s.th} onClick={() => handleSort(col)}>
                    {label}<SortIcon col={col} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paged.length === 0 ? (
                <tr><td colSpan={5} style={{ textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>No transactions match your filters.</td></tr>
              ) : paged.map((txn, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F9FAFB", ...(txn.status === "Unusual" ? { background: "#FFFBEB" } : {}) }}>
                  <td style={s.td}>{txn.date}</td>
                  <td style={{ ...s.td, maxWidth: 260 }}>{txn.description}</td>
                  <td style={s.td}>
                    <span style={{ display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500, ...getCatColor(txn.category).tag }}>
                      {txn.category}
                    </span>
                  </td>
                  <td style={{ ...s.td, fontWeight: 600, color: "#0F172A" }}>{fmt(txn.amount)}</td>
                  <td style={s.td}>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 4,
                      color: txn.status === "Unusual" ? "#EF4444" : "#10B981", fontWeight: 500, fontSize: 12,
                    }}>
                      {txn.status === "Unusual" ? "⚠" : "✓"} {txn.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 20 }}>
            <button style={s.pgBtn} disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
              return (
                <button key={pg} style={{ ...s.pgBtn, ...(pg === page ? { background: "#7C3AED", color: "#fff", borderColor: "#7C3AED" } : {}) }}
                  onClick={() => setPage(pg)}>{pg}</button>
              );
            })}
            <button style={s.pgBtn} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
          </div>
        )}
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
  search:    { flex: 1, minWidth: 220, border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none" },
  select:    { border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "#374151", background: "#fff", cursor: "pointer", outline: "none" },
  th:        { textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" },
  td:        { padding: "12px 16px", color: "#374151", verticalAlign: "middle" },
  pgBtn:     { border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", color: "#374151", fontWeight: 500 },
};
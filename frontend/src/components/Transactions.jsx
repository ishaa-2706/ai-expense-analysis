import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
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

const IconSearch = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const IconX = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
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

const IconSortNeutral = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.3 }}>
    <line x1="12" y1="2" x2="12" y2="22"/>
    <polyline points="6 8 12 2 18 8"/>
    <polyline points="6 16 12 22 18 16"/>
  </svg>
);

const IconSortAsc = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/>
    <polyline points="6 11 12 5 18 11"/>
  </svg>
);

const IconSortDesc = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <polyline points="6 13 12 19 18 13"/>
  </svg>
);

const IconChevLeft = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6"/>
  </svg>
);

const IconChevRight = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ── Component ──────────────────────────────────────────────────────────────────
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
    <span style={{ marginLeft: 4, display: "inline-flex", verticalAlign: "middle" }}>
      {sortBy !== col
        ? <IconSortNeutral />
        : sortDir === "asc"
          ? <IconSortAsc />
          : <IconSortDesc />}
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
            {/* Title → Poppins */}
            <div style={s.title}>All Transactions</div>
            {/* Subtitle → Inter */}
            <div style={s.sub}>{filtered.length} transactions · {fmt(totalFiltered)} total</div>
          </div>
          {/* Button → Poppins */}
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>
            <IconUpload /> Upload New
          </button>
        </div>

        {/* Summary pills */}
        <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
          {[
            { label: "Total Transactions", val: all.length,                  bg: "#EFF6FF", col: "#3B82F6" },
            { label: "Total Amount",       val: fmt(d.total_expense || 0),   bg: "#F5F3FF", col: "#7C3AED" },
            { label: "Unusual Detected",   val: unusualCount,                bg: "#FEF2F2", col: "#EF4444" },
            { label: "Categories",         val: categories.length - 1,       bg: "#F0FDF4", col: "#10B981" },
          ].map((p, i) => (
            <div key={i} style={{ background: p.bg, borderRadius: 12, padding: "10px 18px", fontSize: 13 }}>
              {/* Pill label → Inter */}
              <span style={{ fontFamily: "'Inter', sans-serif", color: "#9CA3AF", fontWeight: 500 }}>{p.label}: </span>
              {/* Pill value → Poppins */}
              <span style={{ fontFamily: "'Poppins', sans-serif", color: p.col, fontWeight: 700 }}>{p.val}</span>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="sw-card" style={{ marginBottom: 20, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
          {/* Search with icon */}
          <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", pointerEvents: "none" }}>
              <IconSearch />
            </span>
            <input
              style={{ ...s.search, paddingLeft: 34 }}
              placeholder="Search description, category, amount…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select style={s.select} value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
          <select style={s.select} value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1); }}>
            <option>All</option><option>Normal</option><option>Unusual</option>
          </select>
          {(search || catFilter !== "All" || statusFilter !== "All") && (
            <button
              style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontWeight: 600, display: "flex", alignItems: "center", gap: 4 }}
              onClick={() => { setSearch(""); setCatFilter("All"); setStatusFilter("All"); setPage(1); }}
            >
              <IconX /> Clear filters
            </button>
          )}
          {/* Results count → Inter */}
          <span style={{ fontFamily: "'Inter', sans-serif", marginLeft: "auto", fontSize: 12, color: "#9CA3AF" }}>{filtered.length} results</span>
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
                <tr>
                  <td colSpan={5} style={{ fontFamily: "'Inter', sans-serif", textAlign: "center", padding: 40, color: "#9CA3AF", fontSize: 14 }}>
                    No transactions match your filters.
                  </td>
                </tr>
              ) : paged.map((txn, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #F9FAFB", ...(txn.status === "Unusual" ? { background: "#FFFBEB" } : {}) }}>
                  {/* Date → Inter */}
                  <td style={s.td}>{txn.date}</td>
                  {/* Description → Inter */}
                  <td style={{ ...s.td, maxWidth: 260 }}>{txn.description}</td>
                  {/* Category tag → Inter */}
                  <td style={s.td}>
                    <span style={{ fontFamily: "'Inter', sans-serif", display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500, ...getCatColor(txn.category).tag }}>
                      {txn.category}
                    </span>
                  </td>
                  {/* Amount → Poppins */}
                  <td style={{ ...s.td, fontFamily: "'Poppins', sans-serif", fontWeight: 600, color: "#0F172A" }}>{fmt(txn.amount)}</td>
                  {/* Status → Inter + icon */}
                  <td style={s.td}>
                    <span style={{
                      fontFamily: "'Inter', sans-serif",
                      display: "inline-flex", alignItems: "center", gap: 4,
                      color: txn.status === "Unusual" ? "#EF4444" : "#10B981",
                      fontWeight: 500, fontSize: 12,
                    }}>
                      {txn.status === "Unusual" ? <IconWarning /> : <IconCheck />}
                      {txn.status}
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
            <button style={{ ...s.pgBtn, display: "flex", alignItems: "center", gap: 4 }} disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              <IconChevLeft /> Prev
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              const pg = totalPages <= 7 ? i + 1 : page <= 4 ? i + 1 : page >= totalPages - 3 ? totalPages - 6 + i : page - 3 + i;
              return (
                <button key={pg} style={{ ...s.pgBtn, ...(pg === page ? { background: "#7C3AED", color: "#fff", borderColor: "#7C3AED" } : {}) }}
                  onClick={() => setPage(pg)}>{pg}</button>
              );
            })}
            <button style={{ ...s.pgBtn, display: "flex", alignItems: "center", gap: 4 }} disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>
              Next <IconChevRight />
            </button>
          </div>
        )}
      </div>
    </div>
  );
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
  /* Search input → Inter */
  search:    { fontFamily: "'Inter', sans-serif", width: "100%", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 14px", fontSize: 13, outline: "none" },
  /* Select → Inter */
  select:    { fontFamily: "'Inter', sans-serif", border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "9px 12px", fontSize: 12, color: "#374151", background: "#fff", cursor: "pointer", outline: "none" },
  /* Table header → Inter (label) */
  th:        { fontFamily: "'Inter', sans-serif", textAlign: "left", padding: "12px 16px", fontSize: 11, color: "#9CA3AF", fontWeight: 600, textTransform: "uppercase", letterSpacing: ".04em", cursor: "pointer", userSelect: "none", whiteSpace: "nowrap" },
  /* Table cell → Inter (body) */
  td:        { fontFamily: "'Inter', sans-serif", padding: "12px 16px", color: "#374151", verticalAlign: "middle" },
  /* Pagination button → Inter */
  pgBtn:     { fontFamily: "'Inter', sans-serif", border: "1.5px solid #E5E7EB", background: "#fff", borderRadius: 8, padding: "6px 14px", fontSize: 12, cursor: "pointer", color: "#374151", fontWeight: 500 },
};
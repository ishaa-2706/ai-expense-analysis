import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS } from "./shared";
import { setAnalysis } from "../store";

// ── SVG Icons ──────────────────────────────────────────────────────────────────
const IconPDF = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#EF4444" strokeWidth="1.8" fill="none"/>
    <path d="M14 2v6h6" stroke="#EF4444" strokeWidth="1.8" fill="none"/>
    <line x1="9" y1="13" x2="15" y2="13" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="9" y1="17" x2="13" y2="17" stroke="#EF4444" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconCSV = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="#10B981" strokeWidth="1.8" fill="none"/>
    <line x1="3" y1="9" x2="21" y2="9" stroke="#10B981" strokeWidth="1.8"/>
    <line x1="3" y1="15" x2="21" y2="15" stroke="#10B981" strokeWidth="1.8"/>
    <line x1="9" y1="9" x2="9" y2="21" stroke="#10B981" strokeWidth="1.8"/>
    <line x1="15" y1="9" x2="15" y2="21" stroke="#10B981" strokeWidth="1.8"/>
  </svg>
);

const IconExcel = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke="#3B82F6" strokeWidth="1.8" fill="none"/>
    <path d="M14 2v6h6" stroke="#3B82F6" strokeWidth="1.8" fill="none"/>
    <line x1="8" y1="13" x2="16" y2="13" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="8" y1="17" x2="16" y2="17" stroke="#3B82F6" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const IconFolder = () => (
  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" stroke="#7C3AED" strokeWidth="1.8" fill="none"/>
  </svg>
);

const IconUpload = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
    <polyline points="16 9 12 5 8 9"/>
    <line x1="12" y1="5" x2="12" y2="17"/>
  </svg>
);

const IconClose = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const IconLock = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

const IconEyeOpen = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const IconWarning = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconTip = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6D28D9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="12"/>
    <line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const IconCoffee = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8h1a4 4 0 010 8h-1"/>
    <path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/>
    <line x1="6" y1="1" x2="6" y2="4"/>
    <line x1="10" y1="1" x2="10" y2="4"/>
    <line x1="14" y1="1" x2="14" y2="4"/>
  </svg>
);

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile]             = useState(null);
  const [dragging, setDragging]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState(null);
  const [progress, setProgress]     = useState(0);
  const [pdfPassword, setPdfPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef();

  const ACCEPTED = [".csv", ".xlsx", ".xls", ".pdf"];

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) validateAndSetFile(f);
  };

  const handleFile = (e) => {
    if (e.target.files[0]) validateAndSetFile(e.target.files[0]);
  };

  const validateAndSetFile = (f) => {
    const ext = "." + f.name.split(".").pop().toLowerCase();
    if (!ACCEPTED.includes(ext)) {
      setError("Only CSV, Excel (.xlsx/.xls), or PDF files are supported.");
      return;
    }
    setError(null);
    setPdfPassword("");
    setFile(f);
  };

  const getFileExt = () => file?.name.split(".").pop()?.toLowerCase() || "";

  const getFileInfo = () => {
    const ext = getFileExt();
    if (ext === "pdf")  return { icon: <IconPDF />,   label: "PDF",   color: "#EF4444", bg: "#FEE2E2" };
    if (ext === "csv")  return { icon: <IconCSV />,   label: "CSV",   color: "#10B981", bg: "#D1FAE5" };
    return                     { icon: <IconExcel />, label: "Excel", color: "#3B82F6", bg: "#DBEAFE" };
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    setProgress(10);

    const formData = new FormData();
    formData.append("file", file);

    const isPdf     = getFileExt() === "pdf";
    const endpoint  = isPdf
      ? "http://localhost:8000/upload-pdf"
      : "http://localhost:8000/upload";

    if (isPdf && pdfPassword) {
      formData.append("password", pdfPassword);
    }

    // ── NEW: attach JWT token so backend saves to DB under this user ──────────
    const token = localStorage.getItem("token");
    const headers = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;
    // ─────────────────────────────────────────────────────────────────────────

    try {
      setProgress(30);

      let tick = 30;
      const progressInterval = isPdf
        ? setInterval(() => {
            tick = Math.min(tick + 5, 85);
            setProgress(tick);
          }, 1500)
        : null;

      const res = await fetch(endpoint, {
        method: "POST",
        headers,              // ← JWT token attached here
        body: formData,
      });

      if (progressInterval) clearInterval(progressInterval);
      setProgress(90);

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.detail || err.error || `Server error ${res.status}`);
      }

      const data = await res.json();
      setProgress(100);

      const raw        = data.analysisData ?? data;
      const normalized = normalizeBackendData(raw);

      // ── NEW: save to localStorage so dashboard reads it immediately ─────────
      setAnalysis(normalized);
      // ─────────────────────────────────────────────────────────────────────────

      setTimeout(() => navigate("/dashboard"), 300);

    } catch (err) {
      setError(err.message || "Upload failed. Is your backend running?");
      setLoading(false);
      setProgress(0);
    }
  };

  function normalizeBackendData(raw) {
    const txns = raw.transactions || raw.recent_transactions || [];
    const cats = raw.categories   || [];
    return {
      total_expense:       raw.total_expense       ?? raw.totalExpense       ?? 0,
      prev_expense:        raw.prev_expense         ?? 0,
      total_transactions:  raw.total_transactions   ?? raw.totalTransactions  ?? txns.length,
      prev_transactions:   raw.prev_transactions    ?? 0,
      unusual_count:       raw.unusual_count        ?? raw.unusualCount       ?? 0,
      top_category:        raw.top_category         ?? raw.topCategory        ?? (cats[0]?.category || "—"),
      top_category_amount: raw.top_category_amount  ?? raw.topCategoryAmount  ?? (cats[0]?.amount   || 0),
      categories:          cats,
      transactions:        txns,
      spending_over_time:  raw.spending_over_time   ?? raw.spendingOverTime   ?? [],
      insights:            raw.insights  || {},
      alerts:              raw.alerts    || [],
      _isReal:             true,
    };
  }

  const fi    = file ? getFileInfo() : null;
  const isPdf = getFileExt() === "pdf";

  return (
    <div style={pg.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/upload" navigate={navigate} />

      <div style={pg.main}>
        <div style={pg.topBar}>
          <div>
            <div style={pg.title}>Upload Transactions</div>
            <div style={pg.sub}>Upload your bank statement CSV, Excel, or PDF to get an AI-powered analysis.</div>
          </div>
        </div>

        <div style={pg.center}>
          <div className="sw-card fade-in" style={{ maxWidth: 560, width: "100%", padding: 36 }}>

            {/* Drop zone */}
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={handleDrop}
              onClick={() => !file && inputRef.current.click()}
              style={{
                ...pg.dropzone,
                borderColor: dragging ? "#7C3AED" : file ? "#10B981" : "#E5E7EB",
                background:  dragging ? "#F5F3FF" : file ? "#F0FDF4" : "#FAFAFA",
                cursor: file ? "default" : "pointer",
              }}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.pdf"
                style={{ display: "none" }}
                onChange={handleFile}
              />

              {file ? (
                <div style={{ display: "flex", alignItems: "center", gap: 14, textAlign: "left" }}>
                  <div style={{ width: 52, height: 52, borderRadius: 13, background: fi.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {fi.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {file.name}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 5 }}>
                      <span style={{ background: fi.bg, color: fi.color, fontSize: 11, fontWeight: 700, padding: "3px 8px", borderRadius: 6 }}>{fi.label}</span>
                      <span style={{ fontSize: 12, color: "#9CA3AF" }}>{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); setFile(null); setPdfPassword(""); setError(null); }}
                    style={{ background: "#FEE2E2", border: "none", width: 30, height: 30, borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}
                  >
                    <IconClose />
                  </button>
                </div>
              ) : (
                <>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}><IconFolder /></div>
                  <div style={{ fontWeight: 600, fontSize: 15, color: "#0F172A" }}>Drag & drop your file here</div>
                  <div style={{ fontSize: 13, color: "#9CA3AF", marginTop: 6 }}>or click to browse</div>
                  <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
                    {["CSV", "Excel", "PDF"].map(f => (
                      <span key={f} style={{ background: "#F5F3FF", color: "#7C3AED", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 }}>{f}</span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* PDF Password */}
            {file && isPdf && (
              <div style={{ background: "#F8FAFC", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: "16px 18px", marginBottom: 4, marginTop: -8 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                  <IconLock /> PDF Password <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(if protected)</span>
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <input
                    type={showPassword ? "text" : "password"}
                    value={pdfPassword}
                    onChange={(e) => setPdfPassword(e.target.value)}
                    placeholder="Enter PDF password..."
                    style={{ flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 10, padding: "10px 14px", fontSize: 13, outline: "none", background: "#fff" }}
                  />
                  <button
                    onClick={() => setShowPassword(p => !p)}
                    style={{ background: "#EDE9FE", border: "none", borderRadius: 10, width: 42, height: 42, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                  >
                    {showPassword ? <IconEyeOff /> : <IconEyeOpen />}
                  </button>
                </div>
                <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}>Leave empty if your PDF is not password protected</div>
              </div>
            )}

            {/* Progress bar */}
            {loading && (
              <div style={{ marginTop: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6B7280", marginBottom: 6 }}>
                  <span>{isPdf ? "Parsing PDF pages…" : "Analyzing your transactions…"}</span>
                  <span>{progress}%</span>
                </div>
                <div style={{ height: 6, background: "#E5E7EB", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${progress}%`, background: "linear-gradient(90deg,#7C3AED,#4F46E5)", borderRadius: 3, transition: "width .4s ease" }} />
                </div>
                {isPdf && progress < 90 && (
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
                    <IconCoffee /> Large PDFs may take a moment — hang tight
                  </div>
                )}
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ marginTop: 16, background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#DC2626", display: "flex", alignItems: "center", gap: 8 }}>
                <IconWarning /> <span>{error}</span>
              </div>
            )}

            {/* Upload button */}
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              style={{
                ...pg.btn,
                marginTop: 24,
                opacity: (!file || loading) ? 0.5 : 1,
                cursor: (!file || loading) ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              }}
            >
              {loading
                ? <><span style={pg.spinner} /> <span>Processing…</span></>
                : <><IconUpload /> <span>Analyze Transactions</span></>
              }
            </button>

            {/* Tips */}
            <div style={{ marginTop: 24, padding: "14px 16px", background: "#F5F3FF", borderRadius: 12, fontSize: 12, color: "#6D28D9", lineHeight: 1.7 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 700, marginBottom: 4 }}>
                <IconTip /> Tips for best results:
              </div>
              • CSV/Excel should have columns: Date, Description, Amount<br />
              • PDF should be a bank statement (text-based, not scanned)<br />
              • Make sure amounts are in ₹ (INR)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const pg = {
  page:     { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif" },
  main:     { flex: 1, padding: "28px 32px", overflowY: "auto" },
  topBar:   { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 },
  title:    { fontSize: 22, fontWeight: 700, color: "#0F172A" },
  sub:      { fontSize: 13, color: "#64748B", marginTop: 4 },
  center:   { display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: 16 },
  dropzone: { border: "2px dashed #E5E7EB", borderRadius: 16, padding: "40px 20px", textAlign: "center", transition: "all .2s", marginBottom: 20 },
  btn:      { width: "100%", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", border: "none", borderRadius: 12, padding: "13px 0", fontSize: 14, fontWeight: 700, letterSpacing: ".02em" },
  spinner:  { width: 15, height: 15, border: "2px solid rgba(255,255,255,0.4)", borderTop: "2px solid #fff", borderRadius: "50%", animation: "spin 0.8s linear infinite", display: "inline-block" },
};
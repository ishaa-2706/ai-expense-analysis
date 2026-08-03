import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS } from "./shared";
import { getAnalysis, DEMO } from "../store";

// ── Grade config ──────────────────────────────────────────────────────────────
const GRADE_CONFIG = {
  Excellent: { color: "#1D9E75", bg: "#e8faf4",  border: "#a7e8cf", textColor: "#0F6E56", bar: "linear-gradient(90deg,#1D9E75,#34d399)" },
  Good:      { color: "#7C6FE0", bg: "#f0eeff",  border: "#c5bdf7", textColor: "#534AB7", bar: "linear-gradient(90deg,#7C6FE0,#a78bfa)" },
  Fair:      { color: "#EF9F27", bg: "#fff8ec",  border: "#fbd89a", textColor: "#92400e", bar: "linear-gradient(90deg,#EF9F27,#fbbf24)" },
  Poor:      { color: "#E24B4A", bg: "#fff0f0",  border: "#fbbebe", textColor: "#991b1b", bar: "linear-gradient(90deg,#E24B4A,#f87171)" },
};

// ── HoverCard wrapper ─────────────────────────────────────────────────────────
function HoverCard({ children, style = {}, accentColor = "#7c3aed" }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: "#fff",
        border: `1.5px solid ${hovered ? accentColor : "#e8eaf0"}`,
        borderRadius: 18,
        boxShadow: hovered
          ? `0 10px 36px rgba(0,0,0,0.11), 0 0 0 3px ${accentColor}18`
          : "0 2px 12px rgba(0,0,0,0.06)",
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-3px)" : "translateY(0)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ── Gauge Meter ───────────────────────────────────────────────────────────────
function GaugeMeter({ score, gradeColor }) {
  const pct = (score - 300) / 600;
  const angle = -180 + pct * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 80, cy = 82, r = 60;
  const needleX = cx + r * 0.74 * Math.cos(rad);
  const needleY = cy + r * 0.74 * Math.sin(rad);
  return (
    <svg width="170" height="100" viewBox="0 0 160 92">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#E24B4A" />
          <stop offset="33%"  stopColor="#EF9F27" />
          <stop offset="66%"  stopColor="#97C459" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
        <filter id="needleShadow">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#0f172a" floodOpacity="0.2" />
        </filter>
      </defs>
      {/* Track */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="#f1f5f9" strokeWidth="10" strokeLinecap="round" />
      {/* Gradient arc */}
      <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round" />
      {/* Needle */}
      <line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke="#1e293b" strokeWidth="2.8" strokeLinecap="round" filter="url(#needleShadow)" />
      {/* Pivot */}
      <circle cx={cx} cy={cy} r="6" fill="#f8fafc" stroke="#e2e8f0" strokeWidth="1.5" />
      <circle cx={cx} cy={cy} r="3.5" fill="#1e293b" />
      {/* Labels */}
      <text x="2"   y="90" fontSize="9.5" fontWeight="700" fill="#94a3b8" fontFamily="'Poppins',sans-serif">300</text>
      <text x="64"  y="16" fontSize="9.5" fontWeight="700" fill="#94a3b8" fontFamily="'Poppins',sans-serif">600</text>
      <text x="136" y="90" fontSize="9.5" fontWeight="700" fill="#94a3b8" fontFamily="'Poppins',sans-serif">900</text>
    </svg>
  );
}

// ── Factor Bar ────────────────────────────────────────────────────────────────
function FactorBar({ label, score, color }) {
  const [width, setWidth] = useState(0);
  const [hovered, setHovered] = useState(false);
  useEffect(() => { const t = setTimeout(() => setWidth(score), 300); return () => clearTimeout(t); }, [score]);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? "#fafbff" : "#fff",
        border: `1.5px solid ${hovered ? color : "#e8eaf0"}`,
        borderRadius: 14, padding: "14px 16px",
        boxShadow: hovered ? `0 6px 20px rgba(0,0,0,0.08), 0 0 0 3px ${color}15` : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9, alignItems: "center" }}>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500, fontFamily: "'Inter', sans-serif" }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 800, color, fontFamily: "'Poppins', sans-serif" }}>{score}<span style={{ fontSize: 10, fontWeight: 500, color: "#94a3b8" }}>/100</span></span>
      </div>
      <div style={{ height: 7, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`, background: color,
          borderRadius: 99, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
}

// ── Sidebar Panel Card ────────────────────────────────────────────────────────
function PanelCard({ accentColor, borderColor, bg, icon, title, titleColor, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? bg : "#fff",
        border: `1.5px solid ${hovered ? accentColor : borderColor}`,
        borderRadius: 16,
        boxShadow: hovered
          ? `0 8px 28px rgba(0,0,0,0.09), 0 0 0 3px ${accentColor}18`
          : "0 2px 10px rgba(0,0,0,0.05)",
        padding: 18,
        transition: "all 0.22s cubic-bezier(0.4,0,0.2,1)",
        transform: hovered ? "translateY(-2px)" : "none",
      }}
    >
      <div style={{ fontSize: 13, fontWeight: 700, color: titleColor, display: "flex", alignItems: "center", gap: 7, marginBottom: 8, fontFamily: "'Poppins', sans-serif" }}>
        {icon}
        {title}
      </div>
      {children}
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function FinancialHealthScore() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [source, setSource]   = useState(null);

  useEffect(() => { fetchScore(); }, []);

  const fetchScore = async () => {
    setLoading(true); setError(null);
    try {
      const analysis = getAnalysis();
      const uploadedTransactions = analysis?.transactions ?? [];
      const transactions = uploadedTransactions.length > 0 ? uploadedTransactions : DEMO.transactions;
      const isDemo = uploadedTransactions.length === 0;
      setSource(isDemo ? "demo" : "uploaded");

      const res = await fetch("https://ai-expense-analysis.onrender.com/api/financial-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });
      const json = await res.json();
      if (json.success) setData(json.data);
      else setError(json.error || "Score could not be loaded");
    } catch {
      setError("Cannot connect to server");
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 44, height: 44,
            border: "3px solid rgba(124,111,224,0.15)",
            borderTop: "3px solid #7C6FE0", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 14px",
          }} />
          <p style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>Calculating your score…</p>
        </div>
      </div>
    );

    if (error) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ background: "#fff", border: "1.5px solid #fecaca", borderRadius: 18, padding: "32px 36px", textAlign: "center", maxWidth: 340, boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: "#fef2f2", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          </div>
          <p style={{ color: "#E24B4A", fontSize: 14, marginBottom: 16, fontFamily: "'Inter', sans-serif" }}>{error}</p>
          <button onClick={fetchScore} style={{
            background: "#f0eeff", border: "1.5px solid #c5bdf7", color: "#7C6FE0",
            borderRadius: 9, padding: "9px 22px", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif",
          }}>Retry</button>
        </div>
      </div>
    );

    if (!data) return null;

    const grade      = GRADE_CONFIG[data.grade] || GRADE_CONFIG.Fair;
    const factors    = Object.values(data.factors || {});
    const history    = data.history || [];
    const maxH       = Math.max(...history.map(h => h.score), 1);
    const tipColors  = ["#E24B4A", "#EF9F27", "#1D9E75", "#7C6FE0"];
    const weakest    = factors.length ? factors.reduce((a, b) => (a.score < b.score ? a : b)) : null;
    const unusualTip = data.tips?.find(t => t.toLowerCase().includes("unusual")) || "Some unusual transactions have been detected — please review them.";
    const restTip    = data.tips?.find(t => t.toLowerCase().includes("restaurant") || t.toLowerCase().includes("balance")) || "Balance your spending and maintain next month's budget.";
    const summaryMsg =
      data.grade === "Excellent" ? "Your finances are in great shape — keep it up!" :
      data.grade === "Good"      ? "Solid standing. Small tweaks will push you higher." :
      data.grade === "Fair"      ? "Room to improve. Follow the tips below to level up." :
                                   "Your score needs attention. Start with the tips below.";

    return (
      <>
        {/* ── Header ── */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 26 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a", fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: 10, background: "linear-gradient(135deg,#7c3aed,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
              </div>
              Financial Health Score
            </h1>
            <p style={{ fontSize: 13, color: "#64748b", margin: "6px 0 0", fontFamily: "'Inter', sans-serif" }}>
              {source === "uploaded"
                ? `Based on ${data.meta?.total_transactions ?? ""} uploaded transactions`
                : "Demo data — upload your file to see your actual score"}
            </p>
          </div>
          <button onClick={fetchScore} style={{
            background: "linear-gradient(135deg,#7c3aed,#6d28d9)", border: "none", color: "#fff",
            borderRadius: 10, padding: "10px 20px", cursor: "pointer",
            fontSize: 13, fontWeight: 600, fontFamily: "'Poppins', sans-serif",
            boxShadow: "0 4px 14px rgba(124,58,237,0.35)",
            display: "flex", alignItems: "center", gap: 7,
          }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
            Recalculate
          </button>
        </div>

        {/* ── Two-column layout ── */}
        <div style={{ display: "flex", gap: 22, alignItems: "flex-start" }}>

          {/* LEFT */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 18 }}>

            {/* Score card */}
            <HoverCard accentColor={grade.color} style={{ padding: "26px 28px" }}>
              {/* Top accent strip */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: grade.bar, borderRadius: "18px 18px 0 0" }} />
              <div style={{ display: "flex", alignItems: "center", gap: 32, flexWrap: "wrap" }}>
                <div>
                  <GaugeMeter score={data.score} gradeColor={grade.color} />
                </div>
                <div>
                  <div style={{ fontSize: 64, fontWeight: 800, color: grade.color, lineHeight: 1, fontFamily: "'Poppins', sans-serif" }}>
                    {data.score}
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4, fontFamily: "'Inter', sans-serif" }}>out of 900</div>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6, marginTop: 10,
                    background: grade.bg, border: `1.5px solid ${grade.border}`,
                    color: grade.textColor, fontSize: 12, fontWeight: 700,
                    padding: "5px 14px", borderRadius: 8, fontFamily: "'Poppins', sans-serif",
                  }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={grade.textColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    {data.grade} Standing
                  </div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 12, letterSpacing: 0.3, fontFamily: "'Inter', sans-serif" }}>
                    300 Poor &nbsp;·&nbsp; 550 Fair &nbsp;·&nbsp; 700 Good &nbsp;·&nbsp; 800 Excellent
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: "#f1f5f9", margin: "22px 0" }} />

              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.9, fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                Score Breakdown
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {factors.map(f => (
                  <FactorBar key={f.label} label={f.label} score={f.score} color={f.color} />
                ))}
              </div>
            </HoverCard>

            {/* Tips card */}
            <HoverCard accentColor="#7c3aed" style={{ padding: "22px 24px" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 16, fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, background: "#f5f3ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                Tips to improve your score
              </div>
              {data.tips.map((tip, i) => (
                <div key={i} style={{
                  display: "flex", gap: 11, alignItems: "flex-start",
                  paddingBottom: 12, marginBottom: 12,
                  borderBottom: i < data.tips.length - 1 ? "1px solid #f1f5f9" : "none",
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7, flexShrink: 0, marginTop: 1,
                    background: `${tipColors[i % tipColors.length]}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <div style={{ width: 7, height: 7, borderRadius: "50%", background: tipColors[i % tipColors.length] }} />
                  </div>
                  <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>{tip}</div>
                </div>
              ))}
            </HoverCard>

            {/* History card */}
            {history.length > 0 && (
              <HoverCard accentColor="#7c3aed" style={{ padding: "22px 24px" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 18, textTransform: "uppercase", letterSpacing: 0.9, fontFamily: "'Poppins', sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                  Score History
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 90 }}>
                  {history.map((h, i) => {
                    const isLast = i === history.length - 1;
                    const barH   = Math.round((h.score / maxH) * 66);
                    return (
                      <div key={h.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                        <span style={{ fontSize: 11, fontWeight: isLast ? 800 : 400, color: isLast ? grade.color : "#94a3b8", fontFamily: "'Poppins', sans-serif" }}>
                          {h.score}
                        </span>
                        <div style={{
                          width: "100%", height: barH,
                          background: isLast ? grade.bar : "#f1f5f9",
                          borderRadius: "5px 5px 0 0",
                          border: isLast ? `1.5px solid ${grade.border}` : "1px solid #e8eaf0",
                          transition: "height 0.6s ease",
                        }} />
                        <span style={{ fontSize: 11, fontWeight: isLast ? 700 : 400, color: isLast ? grade.color : "#94a3b8", fontFamily: "'Inter', sans-serif" }}>
                          {h.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </HoverCard>
            )}
          </div>

          {/* RIGHT sidebar */}
          <div style={{ width: 276, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Score Summary */}
            <PanelCard
              accentColor="#7c3aed" borderColor="#e8eaf0" bg="#f5f3ff"
              titleColor="#4c1d95"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>}
              title="Score Summary"
            >
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65, fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>{summaryMsg}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: grade.color, fontFamily: "'Poppins', sans-serif" }}>{data.score}</div>
                <div style={{ fontSize: 13, color: "#94a3b8", fontFamily: "'Inter', sans-serif" }}>/ 900</div>
              </div>
              <div style={{ marginTop: 10, height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${((data.score - 300) / 600) * 100}%`, background: grade.bar, borderRadius: 99 }} />
              </div>
            </PanelCard>

            {/* Risk Alert */}
            <PanelCard
              accentColor="#ef4444" borderColor="#fecaca" bg="#fef2f2"
              titleColor="#b91c1c"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>}
              title="Risk Alert"
            >
              <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.65, fontFamily: "'Inter', sans-serif", marginBottom: 12 }}>{unusualTip}</div>
              <button onClick={() => navigate("/alerts")} style={{
                width: "100%", background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff",
                border: "none", borderRadius: 8, padding: "9px 0",
                fontSize: 12, cursor: "pointer", fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                boxShadow: "0 3px 10px rgba(239,68,68,0.25)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                View All Alerts
              </button>
            </PanelCard>

            {/* Budget Goal */}
            <PanelCard
              accentColor="#f59e0b" borderColor="#fde68a" bg="#fffbeb"
              titleColor="#92400e"
              icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>}
              title="Budget Goal"
            >
              <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.65, fontFamily: "'Inter', sans-serif", marginBottom: 10 }}>{restTip}</div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                <div style={{ fontSize: 11, color: "#92400e", fontFamily: "'Inter', sans-serif" }}>Target</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706", fontFamily: "'Poppins', sans-serif", marginLeft: 4 }}>
                  {data.score >= 700 ? 800 : 700}
                </div>
              </div>
            </PanelCard>

            {/* Weakest Area */}
            {weakest && (
              <PanelCard
                accentColor={weakest.color} borderColor="#e8eaf0" bg="#f8fafc"
                titleColor="#0f172a"
                icon={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={weakest.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>}
                title="Weakest Area"
              >
                <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65, fontFamily: "'Inter', sans-serif" }}>
                  <span style={{ color: "#0f172a", fontWeight: 700, fontFamily: "'Poppins', sans-serif" }}>{weakest.label}</span>
                  {" "}is only{" "}
                  <span style={{ color: weakest.color, fontWeight: 700 }}>{weakest.score}/100</span>
                  {" "}— focus here to boost your overall score.
                </div>
                <div style={{ marginTop: 10, height: 5, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${weakest.score}%`, background: weakest.color, borderRadius: 99 }} />
                </div>
              </PanelCard>
            )}
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "linear-gradient(135deg,#F0F4FF 0%,#F8FAFC 50%,#FDF4FF 100%)", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
      `}</style>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/score" navigate={navigate} user={null} />
      <div style={{ flex: 1, minWidth: 0, padding: "28px 32px", overflowY: "auto" }}>
        {renderContent()}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS } from "./shared";

// ── Import your analysis store ─────────────────────────────────────────────────
import { getAnalysis, DEMO } from "../store";

const GRADE_CONFIG = {
  Excellent: { color: "#1D9E75", bg: "#e8faf4",  border: "#a7e8cf", textColor: "#0F6E56" },
  Good:      { color: "#7C6FE0", bg: "#f0eeff",  border: "#c5bdf7", textColor: "#534AB7" },
  Fair:      { color: "#EF9F27", bg: "#fff8ec",  border: "#fbd89a", textColor: "#92400e" },
  Poor:      { color: "#E24B4A", bg: "#fff0f0",  border: "#fbbebe", textColor: "#991b1b" },
};

function GaugeMeter({ score }) {
  const pct = (score - 300) / 600;
  const angle = -180 + pct * 180;
  const rad = (angle * Math.PI) / 180;
  const cx = 80, cy = 80, r = 58;
  const needleX = cx + r * 0.72 * Math.cos(rad);
  const needleY = cy + r * 0.72 * Math.sin(rad);
  return (
    <svg width="165" height="95" viewBox="0 0 160 88">
      <defs>
        <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#E24B4A" />
          <stop offset="33%"  stopColor="#EF9F27" />
          <stop offset="66%"  stopColor="#97C459" />
          <stop offset="100%" stopColor="#1D9E75" />
        </linearGradient>
      </defs>
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
        fill="none" stroke="#e2e8f0" strokeWidth="9" strokeLinecap="round" />
      <path d={`M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}`}
        fill="none" stroke="url(#gaugeGrad)" strokeWidth="9" strokeLinecap="round" />
      <line x1={cx} y1={cy} x2={needleX} y2={needleY}
        stroke="#334155" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx={cx} cy={cy} r="5" fill="#e2e8f0" />
      <circle cx={cx} cy={cy} r="3" fill="#334155" />
      <text x="0"   y="86" fontSize="10" fontWeight="600" fill="#94a3b8" fontFamily="inherit">300</text>
      <text x="62"  y="14" fontSize="10" fontWeight="600" fill="#94a3b8" fontFamily="inherit">600</text>
      <text x="136" y="86" fontSize="10" fontWeight="600" fill="#94a3b8" fontFamily="inherit">900</text>
    </svg>
  );
}

function FactorBar({ label, score, color }) {
  const [width, setWidth] = useState(0);
  useEffect(() => { setTimeout(() => setWidth(score), 300); }, [score]);
  return (
    <div style={{
      background: "#fff",
      border: "1.5px solid #e8eaf0",
      borderRadius: 14,
      padding: "14px 16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 9 }}>
        <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color }}>{score}/100</span>
      </div>
      <div style={{ height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{
          height: "100%", width: `${width}%`, background: color,
          borderRadius: 99, transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
        }} />
      </div>
    </div>
  );
}

export default function FinancialHealthScore() {
  const navigate = useNavigate();
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [source, setSource]   = useState(null); // "uploaded" | "backend" | "empty"

  useEffect(() => { fetchScore(); }, []);

  const fetchScore = async () => {
    setLoading(true);
    setError(null);

    try {
      // ── Step 1: Check if frontend store has uploaded transactions ──────────
      // getAnalysis() returns data saved by setAnalysis() in Upload.jsx.
      // If nothing uploaded yet, fall back to DEMO transactions so the
      // page always shows a meaningful score rather than an empty state.
      const analysis = getAnalysis();
      const uploadedTransactions = analysis?.transactions ?? [];
      const transactions = uploadedTransactions.length > 0
        ? uploadedTransactions
        : DEMO.transactions;
      const isDemo = uploadedTransactions.length === 0;

      let res;

      if (!isDemo) {
        // ── Step 2a: Real uploaded data → POST directly ───────────────────────
        // Guarantees score always reflects the latest file, even if the
        // backend was restarted and lost its in-memory store.
        console.log(`[FinancialScore] POSTing ${transactions.length} uploaded transactions`);
        setSource("uploaded");
      } else {
        // ── Step 2b: No upload yet → POST DEMO data so UI is never empty ──────
        console.log("[FinancialScore] No upload found, using DEMO transactions");
        setSource("demo");
      }

      res = await fetch("http://127.0.0.1:8000/api/financial-score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactions }),
      });

      const json = await res.json();

      if (json.success) {
        setData(json.data);
      } else {
        setError(json.error || "Score load nahi hua");
      }
    } catch {
      setError("Server se connect nahi ho pa raha");
    } finally {
      setLoading(false);
    }
  };

  /* shared prominent card */
  const C = {
    background: "#fff",
    border: "1.5px solid #e8eaf0",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: "20px 24px",
  };

  const s = {
    page: {
      display: "flex",
      minHeight: "100vh",
      background: "#f5f5f0",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
    },
    main: {
      flex: 1,
      minWidth: 0,
      padding: "28px 32px",
      overflowY: "auto",
    },
  };

  const renderContent = () => {
    if (loading) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40,
            border: "3px solid rgba(124,111,224,0.15)",
            borderTop: "3px solid #7C6FE0", borderRadius: "50%",
            animation: "spin 0.8s linear infinite", margin: "0 auto 12px",
          }} />
          <p style={{ fontSize: 14, color: "#94a3b8" }}>Score calculate ho raha hai...</p>
        </div>
      </div>
    );

    if (error) return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ ...C, textAlign: "center", maxWidth: 320 }}>
          <p style={{ color: "#E24B4A", fontSize: 14, marginBottom: 14 }}>{error}</p>
          <button onClick={fetchScore} style={{
            background: "#f0eeff", border: "1.5px solid #c5bdf7",
            color: "#7C6FE0", borderRadius: 8, padding: "8px 20px",
            cursor: "pointer", fontSize: 13, fontWeight: 600,
          }}>Retry karo</button>
        </div>
      </div>
    );

    // ── No data at all (shouldn't happen since we always POST) ────────────────
    if (!data) return null;

    const grade     = GRADE_CONFIG[data.grade] || GRADE_CONFIG.Fair;
    const factors   = Object.values(data.factors || {});
    const history   = data.history || [];
    const maxH      = Math.max(...history.map(h => h.score), 1);
    const tipColors = ["#E24B4A", "#EF9F27", "#1D9E75", "#7C6FE0"];

    const weakest    = factors.length ? factors.reduce((a, b) => (a.score < b.score ? a : b)) : null;
    const unusualTip = data.tips?.find(t => t.toLowerCase().includes("unusual")) || "Some unusual transactions have been detected — please review them.";
const restTip    = data.tips?.find(t => t.toLowerCase().includes("restaurant") || t.toLowerCase().includes("balance")) || "Balance your spending and maintain next month's budget.";
    const summaryMsg =
      data.grade === "Excellent"
  ? "Your score is excellent! Keep it up."
  : data.grade === "Good"
  ? "Your score is good. Try to improve a little more!"
  : data.grade === "Fair"
  ? "Your score is okay. Some areas need improvement."
  : "Your score is low. Follow the tips to improve.";

    return (
      <>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, letterSpacing: -0.3, color: "#0f172a" }}>
              Financial Health Score
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "5px 0 0" }}>
  {source === "uploaded"
    ? `Based on ${data.meta?.total_transactions ?? ""} uploaded transactions`
    : "Demo data — upload your file to see your actual score"}
</p>
          </div>
          <button onClick={fetchScore} style={{
            background: "#7c3aed", border: "none", color: "#fff",
            borderRadius: 10, padding: "9px 20px", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            boxShadow: "0 2px 10px rgba(124,58,237,0.3)",
          }}>↺ Recalculate</button>
        </div>

        {/* Two-column layout */}
        <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

          {/* LEFT: main content */}
          <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Score Card */}
            <div style={C}>
              <div style={{ display: "flex", alignItems: "center", gap: 28, flexWrap: "wrap" }}>
                <GaugeMeter score={data.score} />
                <div>
                  <div style={{ fontSize: 60, fontWeight: 800, color: grade.color, lineHeight: 1 }}>
                    {data.score}
                  </div>
                  <div style={{ fontSize: 13, color: "#94a3b8", marginTop: 4 }}>out of 900</div>
                  <div style={{
                    display: "inline-block", marginTop: 10,
                    background: grade.bg, border: `1.5px solid ${grade.border}`,
                    color: grade.textColor, fontSize: 12, fontWeight: 700,
                    padding: "5px 16px", borderRadius: 8, letterSpacing: 0.3,
                  }}>{data.grade} Standing</div>
                  <div style={{ fontSize: 11, color: "#cbd5e1", marginTop: 10, letterSpacing: 0.3 }}>
                    300 Poor &nbsp;·&nbsp; 550 Fair &nbsp;·&nbsp; 700 Good &nbsp;·&nbsp; 800 Excellent
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: "#f1f5f9", margin: "22px 0" }} />

              <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 14, textTransform: "uppercase", letterSpacing: 0.8 }}>
                Score Breakdown
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                {factors.map(f => (
                  <FactorBar key={f.label} label={f.label} score={f.score} color={f.color} />
                ))}
              </div>
            </div>

            {/* Tips Card */}
            <div style={C}>
  <div style={{ fontSize: 14, fontWeight: 700, color: "#0f172a", marginBottom: 14 }}>
    ✦ Tips to improve your score
  </div>
  {data.tips.map((tip, i) => (
    <div key={i} style={{
      display: "flex", gap: 10, alignItems: "flex-start",
      paddingBottom: 10, marginBottom: 10,
      borderBottom: i < data.tips.length - 1 ? "1px solid #f1f5f9" : "none",
    }}>
      <div style={{
        width: 7, height: 7, borderRadius: "50%",
        background: tipColors[i % tipColors.length],
        marginTop: 5, flexShrink: 0,
      }} />
      <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.65 }}>{tip}</div>
    </div>
  ))}
</div>
            {/* History Card */}
            {history.length > 0 && (
              <div style={C}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", marginBottom: 16, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  Score History
                </div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 88 }}>
                  {history.map((h, i) => {
                    const isLast = i === history.length - 1;
                    const barH   = Math.round((h.score / maxH) * 64);
                    return (
                      <div key={h.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 11, fontWeight: isLast ? 700 : 400, color: isLast ? grade.color : "#94a3b8" }}>
                          {h.score}
                        </span>
                        <div style={{
                          width: "100%", height: barH,
                          background: isLast ? grade.color : "#e2e8f0",
                          borderRadius: "4px 4px 0 0",
                          border: isLast ? `1.5px solid ${grade.border}` : "1px solid #e8eaf0",
                        }} />
                        <span style={{ fontSize: 11, fontWeight: isLast ? 700 : 400, color: isLast ? grade.color : "#94a3b8" }}>
                          {h.month}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: sidebar panels */}
          <div style={{ width: 280, flexShrink: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {/* Score Summary */}
            <div style={{
              background: "#fff", border: "1.5px solid #e8eaf0",
              borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: 18,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                📊 Score Summary
              </div>
              <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65 }}>{summaryMsg}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#7c3aed", marginTop: 10 }}>
                {data.score} / 900
              </div>
            </div>

            {/* Risk Alert */}
            <div style={{
              background: "#fff7f7", border: "1.5px solid #fecaca",
              borderRadius: 16, boxShadow: "0 2px 12px rgba(226,75,74,0.08)", padding: 18,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#b91c1c", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                ⚠ Risk Alert
              </div>
              <div style={{ fontSize: 12, color: "#7f1d1d", lineHeight: 1.65 }}>{unusualTip}</div>
              <button
                onClick={() => navigate("/alerts")}
                style={{
                  width: "100%", marginTop: 14, background: "#ef4444", color: "#fff",
                  border: "none", borderRadius: 8, padding: "9px 0",
                  fontSize: 13, cursor: "pointer", fontWeight: 600,
                  boxShadow: "0 2px 8px rgba(239,68,68,0.2)",
                }}>View All Alerts</button>
            </div>

            {/* Budget Goal */}
            <div style={{
              background: "#fffbeb", border: "1.5px solid #fde68a",
              borderRadius: 16, boxShadow: "0 2px 12px rgba(239,159,39,0.08)", padding: 18,
            }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#92400e", display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                💡 Budget Goal
              </div>
              <div style={{ fontSize: 12, color: "#78350f", lineHeight: 1.65 }}>{restTip}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#d97706", marginTop: 10 }}>
                Target: {data.score >= 700 ? 800 : 700}
              </div>
            </div>

            {/* Weakest Area */}
            {weakest && (
  <div style={{
    background: "#fff", border: "1.5px solid #e8eaf0",
    borderRadius: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)", padding: 18,
  }}>
    <div style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
      📉 Weakest Area
    </div>
    <div style={{ fontSize: 12, color: "#64748b", lineHeight: 1.65 }}>
      <span style={{ color: "#0f172a", fontWeight: 700 }}>{weakest.label}</span>
      {" "}is only{" "}
      <span style={{ color: weakest.color, fontWeight: 700 }}>{weakest.score}/100</span>
      {" "}. Focus on improving this to boost your overall score.
    </div>
  </div>
)}

          </div>
        </div>
      </>
    );
  };

  return (
    <div style={s.page}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/score" navigate={navigate} user={null} />
      <div style={s.main}>
        {renderContent()}
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

// ─── Utility ────────────────────────────────────────────────────────────────
const fmt = (n) => `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ─── Colour map for categories ───────────────────────────────────────────────
const CAT_COLORS = {
  "Food & Dining":     { tag: "tag-food",   bar: "#34D399", dot: "#34D399" },
  "Travel":            { tag: "tag-travel", bar: "#60A5FA", dot: "#60A5FA" },
  "Shopping":          { tag: "tag-shop",   bar: "#FBBF24", dot: "#FBBF24" },
  "Bills & Utilities": { tag: "tag-bills",  bar: "#818CF8", dot: "#818CF8" },
  "Others":            { tag: "tag-others", bar: "#F472B6", dot: "#F472B6" },
};

function getColor(category) {
  return CAT_COLORS[category] ?? { tag: "tag-others", bar: "#F472B6", dot: "#F472B6" };
}

// ─── Donut segment calculator ─────────────────────────────────────────────────
function buildDonutSegments(categories, total) {
  const CIRC = 2 * Math.PI * 52;
  let offset = 0;
  return categories.map((cat) => {
    const dash = (cat.amount / total) * CIRC;
    const gap  = CIRC - dash;
    const seg  = { ...cat, dash, gap, offset: -offset };
    offset += dash;
    return seg;
  });
}

// ─── Sub-components ──────────────────────────────────────────────────────────
function SummaryCard({ label, value, badge, badgeType, icon, iconBg, sub, subAction }) {
  return (
    <div className="card">
      <div className="card-icon" style={{ background: iconBg }}>{icon}</div>
      <div className="card-label">{label}</div>
      <div className="card-val">{value}</div>
      {badge && <div className={`card-badge badge-${badgeType}`}>{badge}</div>}
      {sub && <div style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>{sub}</div>}
      {subAction && (
        <div style={{ fontSize: 11, color: "#DC2626", marginTop: 6, cursor: "pointer" }} onClick={subAction.onClick}>
          {subAction.label}
        </div>
      )}
    </div>
  );
}

function DonutChart({ segments, total }) {
  const cx = 70, cy = 70, r = 52;
  return (
    <div className="donut-wrap">
      <svg width="140" height="140" viewBox="0 0 140 140" style={{ flexShrink: 0 }}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E5E7EB" strokeWidth="20" />
        {segments.map((seg, i) => (
          <circle
            key={i} cx={cx} cy={cy} r={r} fill="none"
            stroke={getColor(seg.category).dot}
            strokeWidth="20"
            strokeDasharray={`${seg.dash} ${seg.gap}`}
            strokeDashoffset={seg.offset}
            transform={`rotate(-90 ${cx} ${cy})`}
          />
        ))}
      </svg>
      <div className="donut-center">
        <div className="donut-total">{fmt(total)}</div>
        <div className="donut-label">Total</div>
      </div>
      <div className="legend">
        {segments.map((seg, i) => (
          <div className="legend-item" key={i}>
            <div className="legend-dot" style={{ background: getColor(seg.category).dot }} />
            {seg.category}
            <span className="legend-amt">{fmt(seg.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function BarChart({ categories, total }) {
  return (
    <div className="bar-wrap">
      {categories.map((cat, i) => (
        <div className="bar-row" key={i}>
          <div className="bar-label">{cat.category}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(cat.amount / total) * 100}%`, background: getColor(cat.category).bar }} />
          </div>
          <div className="bar-amt">{fmt(cat.amount)}</div>
        </div>
      ))}
    </div>
  );
}

function TransactionRow({ txn }) {
  return (
    <tr>
      <td>{txn.date}</td>
      <td>{txn.description}</td>
      <td><span className={`tag ${getColor(txn.category).tag}`}>{txn.category}</span></td>
      <td>{fmt(txn.amount)}</td>
      <td className={txn.status === "Unusual" ? "status-unusual" : "status-normal"}>{txn.status}</td>
    </tr>
  );
}

// ─── Sidebar ─────────────────────────────────────────────────────────────────
function Sidebar({ navigate }) {
  const navItems = [
    { icon: "🏠", label: "Dashboard", path: "/dashboard" },
    { icon: "⬆", label: "Upload", path: "/upload" },
    { icon: "📊", label: "Results", path: "/results" },
    { icon: "🔔", label: "Alerts", path: "/alerts" },
    { icon: "⚙", label: "Settings", path: "/settings" },
  ];
  return (
    <div className="sidebar">
      <div className="logo"><span className="logo-icon">💰</span>Spendwise AI</div>
      {navItems.map((item) => (
        <div
          key={item.path}
          className={`nav-item${item.path === "/results" ? " active" : ""}`}
          onClick={() => navigate?.(item.path)}
        >
          {item.icon} {item.label}
        </div>
      ))}
      <div style={{ marginTop: "auto" }}>
        <div className="ai-tip">
          <div className="ai-tip-label">🤖 AI Tip</div>
          <div className="ai-tip-text">You're likely to overspend this weekend. Try keeping food expenses under control.</div>
          <button className="ai-tip-btn" onClick={() => navigate?.("/upload")}>Upload New File</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function Results() {
  const navigate = useNavigate();
  const location = useLocation();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const stateData = location?.state?.analysisData;
    if (stateData) {
      setData(stateData);
      setLoading(false);
    } else {
      setError("No data found. Please upload a file first.");
      setLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="page">
          <Sidebar navigate={navigate} />
          <div className="main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ textAlign: "center" }}>
              <div className="spinner" />
              <p style={{ marginTop: 16, color: "#6B7280", fontSize: 14 }}>Analyzing your expenses...</p>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <style>{styles}</style>
        <div className="page">
          <Sidebar navigate={navigate} />
          <div className="main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "24px 32px", textAlign: "center", maxWidth: 400 }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
              <div style={{ fontWeight: 600, color: "#DC2626", marginBottom: 8 }}>No Data Found</div>
              <div style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>Please upload a CSV file to see your analysis.</div>
              <button className="upload-btn" onClick={() => navigate("/upload")}>Go to Upload</button>
            </div>
          </div>
        </div>
      </>
    );
  }

  const {
    total_expense = 0,
    total_transactions = 0,
    unusual_count = 0,
    top_category = "—",
    top_category_amount = 0,
    categories = [],
    transactions = [],
    insights = {},
  } = data;

  const donutSegments = buildDonutSegments(categories, total_expense);

  return (
    <>
      <style>{styles}</style>
      <div className="page">
        <Sidebar navigate={navigate} />
        <div className="main">

          {/* Top bar */}
          <div className="top-bar">
            <div>
              <div className="page-title">Analysis Results</div>
              <div className="page-sub">Here's your AI-powered finance breakdown.</div>
            </div>
            <button className="upload-btn" onClick={() => navigate("/upload")}>⬆ Upload New File</button>
          </div>

          {/* Summary cards */}
          <div className="cards">
            <SummaryCard label="Total Expense" value={fmt(total_expense)} icon="💼" iconBg="#EDE9FE" />
            <SummaryCard label="Top Category" value={top_category} sub={fmt(top_category_amount)} icon="🍽" iconBg="#FEF3C7" />
            <SummaryCard label="Transactions" value={total_transactions} icon="📄" iconBg="#DBEAFE" />
            <SummaryCard
              label="Unusual Spending" value={unusual_count} icon="⚠" iconBg="#FEE2E2"
              subAction={{ label: "View all alerts →", onClick: () => {} }}
            />
          </div>

          {/* Charts + Insights */}
          <div className="row">
            <div className="chart-card">
              <div className="chart-title">Expense by Category</div>
              <DonutChart segments={donutSegments} total={total_expense} />
            </div>
            <div className="chart-card">
              <div className="chart-title">Spending Breakdown</div>
              <BarChart categories={categories} total={total_expense} />
            </div>
            <div className="chart-card">
              <div className="chart-title">✨ AI Insights</div>
              <div className="insights">
                {insights.unusual_msg && (
                  <div className="insight-card unusual">
                    <div className="insight-title">⚠ Unusual Spending Detected</div>
                    <div className="insight-text">{insights.unusual_msg}</div>
                  </div>
                )}
                {insights.prediction_msg && (
                  <div className="insight-card pred">
                    <div className="insight-title">🔮 Prediction</div>
                    <div className="insight-text">
                      {insights.prediction_msg}
                      {insights.prediction_range && <><br /><strong>{insights.prediction_range}</strong></>}
                    </div>
                  </div>
                )}
                {!insights.unusual_msg && !insights.prediction_msg && (
                  <div style={{ fontSize: 13, color: "#6B7280", textAlign: "center", marginTop: 16 }}>No insights available.</div>
                )}
              </div>
            </div>
          </div>

          {/* Transactions table */}
          <div className="table-card">
            <div className="chart-title">Recent Transactions</div>
            <table>
              <thead>
                <tr>
                  <th>Date</th><th>Description</th><th>Category (AI)</th><th>Amount</th><th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn, i) => <TransactionRow key={i} txn={txn} />)}
              </tbody>
            </table>
          </div>

        </div>
      </div>
    </>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@500;700&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #F4F5F7; font-family: 'DM Sans', sans-serif; }
  .page { display: flex; min-height: 100vh; }
  .sidebar { width: 220px; background: #1E1B4B; color: #fff; padding: 24px 16px; display: flex; flex-direction: column; gap: 8px; flex-shrink: 0; }
  .logo { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 700; color: #fff; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }
  .logo-icon { width: 32px; height: 32px; background: #7C3AED; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 16px; }
  .nav-item { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border-radius: 8px; color: #C4B5FD; font-size: 14px; cursor: pointer; transition: all .2s; }
  .nav-item.active { background: #7C3AED; color: #fff; }
  .nav-item:hover:not(.active) { background: rgba(255,255,255,.07); color: #fff; }
  .ai-tip { background: #2D2B6B; border-radius: 12px; padding: 14px 16px; }
  .ai-tip-label { font-size: 11px; color: #A5B4FC; font-weight: 600; margin-bottom: 4px; display: flex; align-items: center; gap: 6px; }
  .ai-tip-text { font-size: 12px; color: #DDD6FE; line-height: 1.5; margin-bottom: 10px; }
  .ai-tip-btn { background: #7C3AED; color: #fff; border: none; border-radius: 7px; padding: 7px 14px; font-size: 12px; font-weight: 600; cursor: pointer; width: 100%; }
  .main { flex: 1; padding: 28px 32px; overflow: auto; }
  .top-bar { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; }
  .page-title { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #1E1B4B; }
  .page-sub { font-size: 13px; color: #6B7280; margin-top: 2px; }
  .upload-btn { background: #7C3AED; color: #fff; border: none; border-radius: 10px; padding: 10px 18px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; }
  .upload-btn:hover { background: #6D28D9; }
  .cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
  .card { background: #fff; border-radius: 14px; padding: 18px 20px; border: 0.5px solid #E5E7EB; }
  .card-label { font-size: 12px; color: #9CA3AF; font-weight: 500; margin-bottom: 8px; }
  .card-val { font-family: 'Space Grotesk', sans-serif; font-size: 22px; font-weight: 700; color: #1E1B4B; }
  .card-icon { float: right; width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 18px; }
  .card-badge { display: inline-flex; align-items: center; gap: 4px; font-size: 11px; margin-top: 6px; padding: 3px 8px; border-radius: 6px; font-weight: 500; }
  .badge-green { background: #D1FAE5; color: #065F46; }
  .badge-red { background: #FEE2E2; color: #991B1B; }
  .row { display: grid; grid-template-columns: 1fr 1fr 340px; gap: 16px; margin-bottom: 24px; }
  .chart-card { background: #fff; border-radius: 14px; padding: 20px; border: 0.5px solid #E5E7EB; }
  .chart-title { font-size: 14px; font-weight: 600; color: #1E1B4B; margin-bottom: 16px; display: flex; align-items: center; gap: 6px; }
  .donut-wrap { position: relative; display: flex; align-items: center; gap: 24px; }
  .donut-center { position: absolute; left: 70px; top: 50%; transform: translate(-50%,-50%); text-align: center; pointer-events: none; }
  .donut-total { font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 700; color: #1E1B4B; }
  .donut-label { font-size: 10px; color: #9CA3AF; }
  .legend { display: flex; flex-direction: column; gap: 8px; }
  .legend-item { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #374151; }
  .legend-dot { width: 10px; height: 10px; border-radius: 50%; flex-shrink: 0; }
  .legend-amt { margin-left: auto; color: #6B7280; font-size: 11px; }
  .bar-wrap { display: flex; flex-direction: column; gap: 10px; margin-top: 6px; }
  .bar-row { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #374151; }
  .bar-label { width: 110px; text-align: right; color: #6B7280; font-size: 11px; }
  .bar-track { flex: 1; height: 7px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
  .bar-fill { height: 100%; border-radius: 4px; transition: width .4s ease; }
  .bar-amt { width: 72px; font-size: 11px; color: #374151; text-align: right; }
  .insights { display: flex; flex-direction: column; gap: 12px; }
  .insight-card { border-radius: 10px; padding: 14px; }
  .insight-card.unusual { background: #FEF2F2; border: 1px solid #FECACA; }
  .insight-card.pred { background: #EDE9FE; border: 1px solid #DDD6FE; }
  .insight-title { font-size: 12px; font-weight: 600; margin-bottom: 4px; }
  .insight-card.unusual .insight-title { color: #DC2626; }
  .insight-card.pred .insight-title { color: #7C3AED; }
  .insight-text { font-size: 12px; color: #374151; line-height: 1.5; }
  .table-card { background: #fff; border-radius: 14px; padding: 20px; border: 0.5px solid #E5E7EB; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { color: #9CA3AF; font-weight: 500; font-size: 11px; text-align: left; padding: 0 12px 10px 0; text-transform: uppercase; letter-spacing: .04em; border-bottom: 1px solid #F3F4F6; }
  td { padding: 11px 12px 11px 0; color: #374151; border-bottom: 1px solid #F9FAFB; vertical-align: middle; }
  .tag { display: inline-block; padding: 3px 9px; border-radius: 6px; font-size: 11px; font-weight: 500; }
  .tag-food    { background: #D1FAE5; color: #065F46; }
  .tag-travel  { background: #DBEAFE; color: #1E40AF; }
  .tag-shop    { background: #FEF3C7; color: #92400E; }
  .tag-bills   { background: #EDE9FE; color: #5B21B6; }
  .tag-others  { background: #FCE7F3; color: #9D174D; }
  .status-normal  { color: #10B981; font-size: 12px; font-weight: 500; }
  .status-unusual { color: #EF4444; font-size: 12px; font-weight: 500; }
  .spinner { width: 40px; height: 40px; border: 3px solid #E5E7EB; border-top-color: #7C3AED; border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto; }
  @keyframes spin { to { transform: rotate(360deg); } }
`;
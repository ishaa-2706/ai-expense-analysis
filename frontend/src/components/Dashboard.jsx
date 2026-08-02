import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Sidebar, GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { useAuth } from "../context/AuthContext";
import api from "../api/axios";

const pct = (now, prev) => {
  if (!prev) return { val: "—", up: true };
  const d = (((now - prev) / prev) * 100).toFixed(1);
  return { val: Math.abs(d), up: d >= 0 };
};

const diff = (now, prev) => {
  if (prev == null) return { val: "—", up: true };
  const d = now - prev;
  return { val: Math.abs(d), up: d >= 0 };
};

const TAG_STYLE = (cat) => getCatColor(cat).tag;

const CAT_COLORS_MAP = {
  "Food & Dining":     "#da7014",
  "Travel":            "#60A5FA",
  "Shopping":          "#FBBF24",
  "Bills & Utilities": "#818CF8",
  "Transfers":         "#F472B6",
  "Transport":         "#60A5FA",
  "Bills & Recharge":  "#818CF8",
  "Utilities":         "#6EE7B7",
  "Health":            "#FCA5A5",
  "Education":         "#93C5FD",
  "Entertainment":     "#C4B5FD",
  "Rent & Housing":    "#FDE68A",
  "Income":            "#34D399",
  "Cash":              "#D1D5DB",
  "Restaurants":       "#956ef1",
  "Groceries":         "#F97316",
  "Movies & Dvds":     "#EC4899",
  "Others":            "#F472B6",
};

const getCatDot = (cat) => CAT_COLORS_MAP[cat] || getCatColor(cat).dot || "#94A3B8";

// ── SVG icons ──────────────────────────────────────────────────────────────────
const ICONS = {
  wallet: (c) => (
    <>
      <rect x="2" y="7" width="20" height="14" rx="2" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M16 2H8L6 7h12L16 2z" stroke={c} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      <circle cx="17" cy="14" r="1.5" fill={c}/>
    </>
  ),
  food: (c) => (
    <>
      <path d="M18 8c0-2.21-2.69-4-6-4S6 5.79 6 8v1h12V8z" stroke={c} strokeWidth="1.8" fill="none"/>
      <rect x="4" y="9" width="16" height="12" rx="1.5" stroke={c} strokeWidth="1.8" fill="none"/>
      <line x1="12" y1="9" x2="12" y2="21" stroke={c} strokeWidth="1.8"/>
    </>
  ),
  doc: (c) => (
    <>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={c} strokeWidth="1.8" fill="none"/>
      <path d="M14 2v6h6" stroke={c} strokeWidth="1.8" fill="none"/>
      <line x1="9" y1="13" x2="15" y2="13" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
      <line x1="9" y1="17" x2="13" y2="17" stroke={c} strokeWidth="1.8" strokeLinecap="round"/>
    </>
  ),
  alert: (c) => (
    <>
      <path d="M12 2L2 21h20L12 2z" stroke={c} strokeWidth="1.8" fill="none" strokeLinejoin="round"/>
      <line x1="12" y1="9" x2="12" y2="14" stroke={c} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="18" r="1" fill={c}/>
    </>
  ),
};

const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
  </svg>
);

const IconWarningTriangle = ({ color = "#DC2626" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/>
    <line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);

const IconTrendUp = ({ color = "#2563EB" }) => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
    <polyline points="16 7 22 7 22 13"/>
  </svg>
);

const IconCheck = ({ color = "#10B981" }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconFolder = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
  </svg>
);

const IconSend = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/>
    <polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);

const IconX = ({ size = 14, color = "#fff" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

function BotAvatar({ size = 32 }) {
  return (
    <img
      src="/src/assets/robot-avatar.png"
      alt="AI"
      style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      onError={(e) => {
        e.target.style.display = "none";
        e.target.insertAdjacentHTML("afterend", `<span style="font-size:${size * 0.6}px;line-height:1">\uD83E\uDD16</span>`);
      }}
    />
  );
}

// ── Stat Card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconType, iconBg, iconColor, badge, badgeUp, badgeSuffix, subAction }) {
  return (
    <div style={s.statCard} className="stat-card">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Label → Inter (body label) */}
          <div style={s.statLabel}>{label}</div>
          {/* Value → Poppins (heading) */}
          <div style={s.statValue}>{value}</div>
          {badge !== undefined && badge !== "—" && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
              <span style={{ fontFamily: "'Poppins', sans-serif", color: badgeUp ? "#10B981" : "#EF4444", fontSize: 10, fontWeight: 600 }}>
                {badgeUp ? "↑" : "↓"} {badge}{badgeSuffix || "%"}
              </span>
              <span style={{ fontFamily: "'Inter', sans-serif", color: "#9CA3AF", fontSize: 10 }}>from last month</span>
            </div>
          )}
          {sub && <div style={s.statSub}>{sub}</div>}
          {subAction && (
            <div onClick={subAction.onClick} style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#EF4444", marginTop: 8, cursor: "pointer", fontWeight: 500 }}>
              {subAction.label}
            </div>
          )}
        </div>
        <div style={{ width: 52, height: 52, borderRadius: 16, background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginLeft: 12 }}>
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            {ICONS[iconType]?.(iconColor)}
          </svg>
        </div>
      </div>
    </div>
  );
}

function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700, fontFamily: "'Inter', sans-serif" }}>
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1E293B", padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      {fmt(payload[0].value)}
    </div>
  );
}

// ── Chatbot ───────────────────────────────────────────────────────────────────
function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hi! I'm your AI finance assistant 🤖 Ask me anything about your expenses!" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = React.useRef(null);

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const q = input.trim();
    if (!q || loading) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: q }]);
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/api/ask-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: "ai", text: data.answer || data.response || "Sorry, I couldn't process that." }]);
    } catch {
      setMessages(prev => [...prev, { role: "ai", text: "⚠️ Could not connect to server. Please try again." }]);
    }
    setLoading(false);
  };

  return (
    <div style={{ position: "fixed", bottom: 90, right: 28, zIndex: 1000 }}>
      <div style={cs.box}>
        <div style={cs.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={cs.botAvatarWrap}><BotAvatar size={32} /></div>
            <div>
              {/* Chatbot title → Poppins */}
              <div style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 700, fontSize: 14, color: "#fff" }}>AI Finance Assistant</div>
              {/* Subtitle → Inter */}
              <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#A5B4FC" }}>Powered by Spendwise AI</div>
            </div>
          </div>
          <button onClick={onClose} style={{ ...cs.closeBtn, display: "flex", alignItems: "center", justifyContent: "center" }}><IconX size={12} color="#fff" /></button>
        </div>
        <div style={cs.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              {msg.role === "ai" && (
                <div style={{ marginRight: 6, alignSelf: "flex-end", marginBottom: 2 }}>
                  <BotAvatar size={28} />
                </div>
              )}
              {/* Bubble text → Inter (body) */}
              <div style={msg.role === "user" ? cs.userBubble : cs.aiBubble}>{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
              <BotAvatar size={28} />
              <div style={{ ...cs.aiBubble, color: "#9CA3AF" }}>Thinking…</div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
        <div style={cs.suggestions}>
          {["Where am I overspending?", "Top category this month?", "Predict my weekend spend"].map((sg, i) => (
            <button key={i} style={cs.suggBtn} onClick={() => setInput(sg)}>{sg}</button>
          ))}
        </div>
        <div style={cs.inputRow}>
          <input style={cs.input} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask about your finances..." />
          <button style={cs.sendBtn} onClick={sendMessage} disabled={loading}><IconSend /></button>
        </div>
      </div>
    </div>
  );
}

function buildTimeData(transactions) {
  if (!transactions.length) return [];
  const map = {};
  transactions.forEach(t => {
    const key = t.date?.split(",")[0] || t.date || "Unknown";
    map[key] = (map[key] || 0) + Number(t.amount || 0);
  });
  return Object.entries(map).slice(-8).map(([date, amount]) => ({ date, amount }));
}

// ── Empty State for new users ──────────────────────────────────────────────────
function EmptyState({ navigate, firstName }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flex: 1, minHeight: "60vh", gap: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}><IconFolder /></div>
      {/* Welcome heading → Poppins */}
      <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 700, color: "#0F172A" }}>
        Welcome, {firstName}! 
      </div>
      {/* Description → Inter */}
      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#64748B", textAlign: "center", maxWidth: 400, lineHeight: 1.6 }}>
        You haven't uploaded any transactions yet. Upload your bank statement or CSV to get started with your expense analysis.
      </div>
      <button style={{ ...s.uploadBtn, fontSize: 14, padding: "12px 28px", marginTop: 8 }} onClick={() => navigate("/upload")}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
          <polyline points="16 9 12 5 8 9"/>
          <line x1="12" y1="5" x2="12" y2="17"/>
        </svg>
        Upload Your First Statement
      </button>
    </div>
  );
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate   = useNavigate();
  const { user }   = useAuth();
  const [chatOpen, setChatOpen] = useState(false);

  const [dbData,    setDbData]    = useState(null);
  const [dbTxns,    setDbTxns]    = useState([]);
  const [dbAlerts,  setDbAlerts]  = useState([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [loading,   setLoading]   = useState(true);

  const fullName  = user?.name || "User";
  const firstName = fullName.split(" ")[0];

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const histRes = await api.get("/api/history");
        const history = histRes.data;

        if (!history || history.length === 0) {
          setIsNewUser(true);
          setLoading(false);
          return;
        }

        const latest = history[0];
        setDbData(latest);
        setIsNewUser(false);

        const txnRes = await api.get(`/api/history/${latest.id}/transactions`);
        setDbTxns(txnRes.data || []);

        const alertRes = await api.get("/api/alerts");
        setDbAlerts(alertRes.data || []);

      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setIsNewUser(true);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalExpense      = dbData?.total_expense      || 0;
  const totalTransactions = dbData?.total_transactions || 0;
  const unusualCount      = dbData?.unusual_count      || 0;
  const topCategory       = dbData?.top_category       || "—";

  const catTotalsMap = {};
  dbTxns.forEach(t => {
    if (t.type !== "credit") {
      catTotalsMap[t.category] = (catTotalsMap[t.category] || 0) + Number(t.amount);
    }
  });
  const categories = Object.entries(catTotalsMap)
    .map(([category, amount]) => ({ category, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => b.amount - a.amount);

  const topCatAmount = categories[0]?.amount || 0;

  const timeData = buildTimeData(dbTxns);
  const recentTxns = dbTxns.slice(0, 5);

  const unusualTxn    = dbTxns.find(t => t.is_unusual);
  const unusualMsg    = unusualTxn
    ? `You spent ₹${unusualTxn.amount} on ${unusualTxn.category} — higher than usual.`
    : null;

  const welcomeMsg = isNewUser
    ? `Welcome, ${firstName}! `
    : `Welcome back, ${firstName}! `;

  if (loading) {
    return (
      <div style={{ ...s.page, alignItems: "center", justifyContent: "center" }}>
        <style>{GLOBAL_CSS}</style>
        {/* Loading text → Inter */}
        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 14, color: "#64748B" }}>Loading your dashboard…</div>
      </div>
    );
  }

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS + extraCss}</style>
      <Sidebar active="/dashboard" navigate={navigate} />

      <div style={s.main}>
        {/* ── Top bar ── */}
        <div style={s.topBar}>
          <div>
            {/* Welcome heading → Poppins */}
            <div style={s.welcome}>{welcomeMsg}</div>
            {/* Welcome subtitle → Inter */}
            <div style={s.welcomeSub}>
              {isNewUser
                ? "Upload your first statement to get started."
                : "Here's your finance summary for this month."}
            </div>
          </div>
          {/* Button label → Poppins */}
          <button style={s.uploadBtn} onClick={() => navigate("/upload")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
              <polyline points="16 9 12 5 8 9"/>
              <line x1="12" y1="5" x2="12" y2="17"/>
            </svg>
            Upload Transactions
          </button>
        </div>

        {isNewUser ? (
          <EmptyState navigate={navigate} firstName={firstName} />
        ) : (
          <>
            {/* ── Stat cards ── */}
            <div style={s.statsGrid}>
              <StatCard label="Total Expense"      value={fmt(totalExpense)}    iconType="wallet" iconBg="#DCFCE7" iconColor="#16A34A" />
              <StatCard label="Highest Category"   value={topCategory}          sub={fmt(topCatAmount)} iconType="food" iconBg="#FEF3C7" iconColor="#D97706" />
              <StatCard label="Transactions"       value={totalTransactions}    iconType="doc"    iconBg="#EFF6FF" iconColor="#3B82F6" />
              <StatCard label="Unusual Spending"   value={unusualCount}         subAction={{ label: "View all alerts", onClick: () => navigate("/alerts") }} iconType="alert" iconBg="#FEE2E2" iconColor="#EF4444" />
            </div>

            {/* ── Charts row ── */}
            <div style={s.chartsRow}>
              {/* Pie chart */}
              <div style={s.chartCard} className="chart-card">
                {/* Chart title → Poppins */}
                <div style={s.chartTitle}>Expense by Category</div>
                {categories.length > 0 ? (
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <div style={{ position: "relative", width: 200, height: 200, flexShrink: 0 }}>
                      <PieChart width={200} height={200}>
                        <Pie data={categories} cx={95} cy={95} innerRadius={58} outerRadius={90}
                          dataKey="amount" paddingAngle={2} labelLine={false} label={<PieLabel />}>
                          {categories.map((entry, i) => (
                            <Cell key={i} fill={getCatDot(entry.category)} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v) => fmt(v)} />
                      </PieChart>
                      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                        {/* Pie centre value → Poppins */}
                        <div style={{ fontFamily: "'Poppins', sans-serif", fontSize: 13, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>{fmt(totalExpense)}</div>
                        {/* "Total" label → Inter */}
                        <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>Total</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {categories.map((cat, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: getCatDot(cat.category), flexShrink: 0, marginTop: 2 }} />
                          <div>
                            {/* Category name → Inter (body) */}
                            <div style={{ fontFamily: "'Inter', sans-serif", color: "#374151", fontWeight: 500 }}>{cat.category}</div>
                            {/* Category amount → Inter (subtext) */}
                            <div style={{ fontFamily: "'Inter', sans-serif", color: "#9CA3AF", fontSize: 11, marginTop: 1 }}>{fmt(cat.amount)}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ fontFamily: "'Inter', sans-serif", color: "#9CA3AF", fontSize: 13, textAlign: "center", marginTop: 20 }}>No category data.</div>
                )}
              </div>

              {/* Line chart */}
              <div style={{ ...s.chartCard, flex: 1 }} className="chart-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  {/* Chart title → Poppins */}
                  <div style={s.chartTitle}>Spending Over Time</div>
                  <select style={s.select}><option>This Month</option><option>Last Month</option></select>
                </div>
                {timeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={180}>
                    <LineChart data={timeData}>
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: "#9CA3AF", fontFamily: "'Inter', sans-serif" }} axisLine={false} tickLine={false}
                        tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<ChartTooltip />} />
                      <Line type="monotone" dataKey="amount" stroke="#7C3AED" strokeWidth={2.5}
                        dot={{ fill: "#7C3AED", r: 4 }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div style={{ fontFamily: "'Inter', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "#9CA3AF", fontSize: 13 }}>
                    No time-series data available.
                  </div>
                )}
              </div>

              {/* AI Insights */}
              <div style={{ ...s.chartCard, width: 260, flexShrink: 0 }} className="chart-card">
                <div style={{ ...s.chartTitle, display: "flex", alignItems: "center", gap: 6 }}>
                  <IconSparkle /> AI Insights
                </div>
                {unusualMsg && (
                  <div style={s.insightUnusual}>
                    {/* Insight heading → Poppins */}
                    <div style={{ fontFamily: "'Poppins', sans-serif", color: "#DC2626", fontWeight: 600, fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><IconWarningTriangle color="#DC2626" /> Unusual Spending Detected</div>
                    {/* Insight body → Inter */}
                    <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{unusualMsg}</div>
                    <button style={s.insightBtn} onClick={() => navigate("/alerts")}>View Details</button>
                  </div>
                )}
                <div style={{ ...s.insightPred, marginTop: unusualMsg ? 10 : 0 }}>
                  {/* Prediction heading → Poppins */}
                  <div style={{ fontFamily: "'Poppins', sans-serif", color: "#2563EB", fontWeight: 600, fontSize: 13, marginBottom: 6, display: "flex", alignItems: "center", gap: 5 }}><IconTrendUp color="#2563EB" /> Prediction</div>
                  {/* Prediction body → Inter */}
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#374151", lineHeight: 1.5 }}>You're likely to overspend this weekend based on your pattern.</div>
                  <button style={{ ...s.insightBtn, color: "#2563EB", borderColor: "#93C5FD", background: "#fff" }}
                    onClick={() => navigate("/predictions")}>View Prediction</button>
                </div>
                {!unusualMsg && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#10B981", marginTop: 10, fontWeight: 500, display: "flex", alignItems: "center", gap: 5 }}><IconCheck color="#10B981" /> No unusual spending detected.</div>
                )}
              </div>
            </div>

            {/* ── Bottom row ── */}
            <div style={s.bottomRow}>
              {/* Recent Transactions */}
              <div style={{ ...s.chartCard, flex: 1 }} className="chart-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  {/* Section title → Poppins */}
                  <div style={s.chartTitle}>Recent Transactions</div>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#7C3AED", cursor: "pointer", fontWeight: 500 }}
                    onClick={() => navigate("/transactions")}>View All Transactions →</span>
                </div>
                {recentTxns.length > 0 ? (
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                    <thead>
                      <tr>{["Date", "Description", "Category", "Amount", "Status"].map(h =>
                        <th key={h} style={s.th}>{h}</th>
                      )}</tr>
                    </thead>
                    <tbody>
                      {recentTxns.map((txn, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid #F9FAFB" }}>
                          <td style={s.td}>{txn.date}</td>
                          <td style={s.td}>{txn.description}</td>
                          <td style={s.td}><span style={{ ...s.tag, ...TAG_STYLE(txn.category) }}>{txn.category}</span></td>
                          <td style={s.td}>{fmt(txn.amount)}</td>
                          <td style={s.td}>
                            <span style={{ fontFamily: "'Inter', sans-serif", color: txn.status === "Unusual" ? "#EF4444" : "#10B981", fontWeight: 500 }}>
                              {txn.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div style={{ fontFamily: "'Inter', sans-serif", color: "#9CA3AF", fontSize: 13, textAlign: "center", padding: "20px 0" }}>No transactions yet.</div>
                )}
              </div>

              {/* Recent Alerts */}
              <div style={{ ...s.chartCard, width: 260, flexShrink: 0 }} className="chart-card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                  {/* Section title → Poppins */}
                  <div style={s.chartTitle}>Recent Alerts</div>
                </div>
                {dbAlerts.slice(0, 4).map((alert, i) => (
                  <div key={i} style={s.alertRow}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#EF4444", flexShrink: 0, marginTop: 3 }} />
                    <div>
                      {/* Alert message → Inter (body) */}
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#1E293B", fontWeight: 500 }}>{alert.message}</div>
                      {/* Alert date → Inter (subtext) */}
                      <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{alert.created_at?.split("T")[0]}</div>
                    </div>
                  </div>
                ))}
                {dbAlerts.length === 0 && (
                  <div style={{ fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 16 }}>No alerts.</div>
                )}
                <div style={{ textAlign: "center", marginTop: 12 }}>
                  <span style={{ fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#EF4444", cursor: "pointer", fontWeight: 500 }}
                    onClick={() => navigate("/alerts")}>View All Alerts →</span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── Chatbot ── */}
      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}
      <button
        onClick={() => setChatOpen(p => !p)}
        style={{
          position: "fixed", bottom: 28, right: 28, zIndex: 1001,
          width: 56, height: 56, borderRadius: "50%",
          background: chatOpen ? "linear-gradient(135deg,#7C3AED,#4F46E5)" : "transparent",
          border: "none", cursor: "pointer",
          boxShadow: "0 8px 24px rgba(124,58,237,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center",
          transition: "transform .2s", padding: 0, overflow: "hidden",
        }}
        title="Ask AI"
      >
        {chatOpen
          ? <IconX size={18} color="#fff" />
          : (
            <img
              src="/src/assets/robot-avatar.png"
              alt="AI"
              style={{ width: 56, height: 56, objectFit: "cover", borderRadius: "50%" }}
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentNode.innerHTML = "<span style='font-size:24px'>🤖</span>";
              }}
            />
          )
        }
      </button>
    </div>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = {
  /* Base font Inter; Poppins applied inline where needed */
  page:           { display: "flex", minHeight: "100vh", fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg,#F0F4FF 0%,#F8FAFC 50%,#FDF4FF 100%)" },
  main:           { flex: 1, padding: "28px 32px", overflowY: "auto" },
  topBar:         { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  /* Page heading → Poppins */
  welcome:        { fontFamily: "'Poppins', sans-serif", fontSize: 22, fontWeight: 700, color: "#0F172A" },
  /* Subtitle → Inter */
  welcomeSub:     { fontFamily: "'Inter', sans-serif", fontSize: 13, color: "#64748B", marginTop: 4 },
  /* Button → Poppins */
  uploadBtn:      { fontFamily: "'Poppins', sans-serif", background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
  statsGrid:      { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 },
  statCard:       { background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "24px 22px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", minHeight: 130, transition: "box-shadow .2s, transform .2s", cursor: "default" },
  /* Stat label → Inter */
  statLabel:      { fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#9CA3AF", fontWeight: 500, marginBottom: 8 },
  /* Stat value → Poppins */
  statValue:      { fontFamily: "'Poppins', sans-serif", fontSize: 20, fontWeight: 700, color: "#0F172A", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  /* Stat sub → Inter */
  statSub:        { fontFamily: "'Inter', sans-serif", fontSize: 12, color: "#6B7280", marginTop: 4 },
  chartsRow:      { display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-start" },
  chartCard:      { background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "22px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", transition: "box-shadow .2s, transform .2s" },
  /* Chart title → Poppins */
  chartTitle:     { fontFamily: "'Poppins', sans-serif", fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 16 },
  /* Select → Inter */
  select:         { fontFamily: "'Inter', sans-serif", fontSize: 12, border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 8px", color: "#374151", background: "#fff", cursor: "pointer" },
  insightUnusual: { background: "#FFF1F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px" },
  insightPred:    { background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "12px" },
  /* Insight button → Poppins */
  insightBtn:     { fontFamily: "'Poppins', sans-serif", marginTop: 10, fontSize: 11, fontWeight: 600, color: "#DC2626", background: "#fff", border: "1px solid #FECACA", borderRadius: 6, padding: "5px 12px", cursor: "pointer" },
  bottomRow:      { display: "flex", gap: 16, alignItems: "flex-start" },
  /* Table header → Inter (label) */
  th:             { fontFamily: "'Inter', sans-serif", textAlign: "left", padding: "0 12px 10px 0", fontSize: 11, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em", borderBottom: "1px solid #F3F4F6" },
  /* Table cell → Inter (body) */
  td:             { fontFamily: "'Inter', sans-serif", padding: "11px 12px 11px 0", color: "#374151", borderBottom: "1px solid #F9FAFB", verticalAlign: "middle" },
  /* Category tag → Inter */
  tag:            { fontFamily: "'Inter', sans-serif", display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500 },
  alertRow:       { display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #F3F4F6", alignItems: "flex-start" },
};

const cs = {
  box:          { width: 360, height: 500, background: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #E5E7EB" },
  header:       { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  botAvatarWrap:{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  closeBtn:     { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 12, fontWeight: 700 },
  messages:     { flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column" },
  /* Chat bubbles → Inter (body) */
  aiBubble:     { fontFamily: "'Inter', sans-serif", background: "#F3F4F6", color: "#1E293B", padding: "10px 13px", borderRadius: "0 12px 12px 12px", fontSize: 13, lineHeight: 1.5, maxWidth: 240 },
  userBubble:   { fontFamily: "'Inter', sans-serif", background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", padding: "10px 13px", borderRadius: "12px 0 12px 12px", fontSize: 13, lineHeight: 1.5, maxWidth: 240 },
  suggestions:  { padding: "6px 14px", display: "flex", gap: 6, flexWrap: "wrap" },
  /* Suggestion chips → Inter */
  suggBtn:      { fontFamily: "'Inter', sans-serif", fontSize: 11, background: "#EDE9FE", color: "#7C3AED", border: "none", borderRadius: 20, padding: "5px 10px", cursor: "pointer", fontWeight: 500 },
  inputRow:     { display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid #F3F4F6" },
  /* Chat input → Inter */
  input:        { fontFamily: "'Inter', sans-serif", flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 24, padding: "9px 14px", fontSize: 13, outline: "none" },
  sendBtn:      { width: 38, height: 38, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", borderRadius: "50%", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
};

const extraCss = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
  .stat-card:hover  { box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; transform: translateY(-2px); }
  .chart-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; transform: translateY(-2px); }
`;
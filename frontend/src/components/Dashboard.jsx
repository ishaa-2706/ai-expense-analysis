import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import { Sidebar, GLOBAL_CSS, fmt, getCatColor } from "./shared";
import { getAnalysis, DEMO } from "../store";

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
  "Food & Dining":     "#34D399",
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
  "Food & Dining":    "#34D399",
  "Restaurants":      "#956ef1",   // 👈 add karo
  "Groceries":        "#F97316",   // 👈 add karo  
  "Movies & Dvds":    "#EC4899", 
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

// ── Bot Avatar Image Component ─────────────────────────────────────────────────
// Yeh component header aur message dono mein use hoga
// src mein apni robot image ka path daalo
function BotAvatar({ size = 32 }) {
  return (
    <img
      src="/src/assets/robot-avatar.png"
      alt="AI"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        objectFit: "cover",
        flexShrink: 0,
      }}
      onError={(e) => {
        // Fallback: robot emoji if image not found
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
          <div style={s.statLabel}>{label}</div>
          <div style={s.statValue}>{value}</div>
          {badge !== undefined && badge !== "—" && (
            <div style={{ display: "flex", alignItems: "center", gap: 4, marginTop: 6 }}>
              <span style={{ color: badgeUp ? "#10B981" : "#EF4444", fontSize: 10, fontWeight: 600 }}>
                {badgeUp ? "↑" : "↓"} {badge}{badgeSuffix || "%"}
              </span>
              <span style={{ color: "#9CA3AF", fontSize: 10 }}>from last month</span>
            </div>
          )}
          {sub && <div style={s.statSub}>{sub}</div>}
          {subAction && (
            <div onClick={subAction.onClick} style={{ fontSize: 11, color: "#EF4444", marginTop: 8, cursor: "pointer", fontWeight: 500 }}>
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

// ── Pie label ─────────────────────────────────────────────────────────────────
function PieLabel({ cx, cy, midAngle, innerRadius, outerRadius, percent }) {
  if (percent < 0.06) return null;
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {(percent * 100).toFixed(1)}%
    </text>
  );
}

// ── Chart tooltip ─────────────────────────────────────────────────────────────
function ChartTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: "#1E293B", padding: "8px 12px", borderRadius: 8, fontSize: 12, color: "#fff" }}>
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

        {/* ── Header ── */}
        <div style={cs.header}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

            {/* FIX: Robot image in header — replace src in BotAvatar component above */}
            <div style={cs.botAvatarWrap}>
              <BotAvatar size={32} />
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: 14, color: "#fff" }}>AI Finance Assistant</div>
              <div style={{ fontSize: 11, color: "#A5B4FC" }}>Powered by Spendwise AI</div>
            </div>
          </div>
          <button onClick={onClose} style={cs.closeBtn}>✕</button>
        </div>

        {/* ── Messages ── */}
        <div style={cs.messages}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start", marginBottom: 10 }}>
              {/* FIX: Robot image next to each AI message */}
              {msg.role === "ai" && (
                <div style={{ marginRight: 6, alignSelf: "flex-end", marginBottom: 2 }}>
                  <BotAvatar size={28} />
                </div>
              )}
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

        {/* ── Suggestions ── */}
        <div style={cs.suggestions}>
          {["Where am I overspending?", "Top category this month?", "Predict my weekend spend"].map((sg, i) => (
            <button key={i} style={cs.suggBtn} onClick={() => setInput(sg)}>{sg}</button>
          ))}
        </div>

        {/* ── Input ── */}
        <div style={cs.inputRow}>
          <input style={cs.input} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && sendMessage()} placeholder="Ask about your finances..." />
          <button style={cs.sendBtn} onClick={sendMessage} disabled={loading}>➤</button>
        </div>

      </div>
    </div>
  );
}

// ── Build time data ────────────────────────────────────────────────────────────
function buildTimeData(transactions) {
  if (!transactions.length) return [];
  const map = {};
  transactions.forEach(t => {
    const key = t.date?.split(",")[0] || t.date || "Unknown";
    map[key] = (map[key] || 0) + Number(t.amount || 0);
  });
  return Object.entries(map).slice(-8).map(([date, amount]) => ({ date, amount }));
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const [chatOpen, setChatOpen] = useState(false);

  const stored = getAnalysis();
  const d = stored ? { ...DEMO, ...stored, user: DEMO.user } : DEMO;

  const expPct  = pct(d.total_expense,       d.prev_expense);
  const txnDiff = diff(d.total_transactions, d.prev_transactions);

  const timeData = (d.spending_over_time && d.spending_over_time.length > 0)
    ? d.spending_over_time
    : buildTimeData(d.transactions || []);

  const recentTxns = (d.transactions || []).slice(0, 5);
  const alerts     = d.alerts || [];

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS + extraCss}</style>
      <Sidebar active="/dashboard" navigate={navigate} user={d.user} />

      <div style={s.main}>
        {/* ── Top bar ── */}
        <div style={s.topBar}>
          <div>
            <div style={s.welcome}>Welcome back, {d.user.name}! </div>
            <div style={s.welcomeSub}>Here's your finance summary for this month.</div>
          </div>
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

        {/* ── Stat cards ── */}
        <div style={s.statsGrid}>
          <StatCard
            label="Total Expense"
            value={fmt(d.total_expense)}
            badge={expPct.val}
            badgeUp={expPct.up}
            badgeSuffix="%"
            iconType="wallet"
            iconBg="#DCFCE7"
            iconColor="#16A34A"
          />
          <StatCard
            label="Highest Category"
            value={d.top_category}
            sub={fmt(d.top_category_amount)}
            iconType="food"
            iconBg="#FEF3C7"
            iconColor="#D97706"
          />
          <StatCard
            label="Transactions"
            value={d.total_transactions}
            badge={txnDiff.val}
            badgeUp={txnDiff.up}
            badgeSuffix=""
            iconType="doc"
            iconBg="#EFF6FF"
            iconColor="#3B82F6"
          />
          <StatCard
            label="Unusual Spending"
            value={d.unusual_count}
            subAction={{ label: "View all alerts", onClick: () => navigate("/alerts") }}
            iconType="alert"
            iconBg="#FEE2E2"
            iconColor="#EF4444"
          />
        </div>

        {/* ── Charts row ── */}
        <div style={s.chartsRow}>
          {/* Pie chart */}
          <div style={s.chartCard} className="chart-card">
            <div style={s.chartTitle}>Expense by Category</div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ position: "relative", width: 200, height: 200, flexShrink: 0 }}>
                <PieChart width={200} height={200}>
                  <Pie data={d.categories} cx={95} cy={95} innerRadius={58} outerRadius={90}
                    dataKey="amount" paddingAngle={2} labelLine={false} label={<PieLabel />}>
                    {d.categories.map((entry, i) => (
                      <Cell key={i} fill={getCatDot(entry.category)} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} />
                </PieChart>
                <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center", pointerEvents: "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", whiteSpace: "nowrap" }}>{fmt(d.total_expense)}</div>
                  <div style={{ fontSize: 10, color: "#9CA3AF", marginTop: 1 }}>Total</div>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {d.categories.map((cat, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 12 }}>
                    <div style={{ width: 10, height: 10, borderRadius: "50%", background: getCatDot(cat.category), flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ color: "#374151", fontWeight: 500 }}>{cat.category}</div>
                      <div style={{ color: "#9CA3AF", fontSize: 11, marginTop: 1 }}>{fmt(cat.amount)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Line chart */}
          <div style={{ ...s.chartCard, flex: 1 }} className="chart-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={s.chartTitle}>Spending Over Time</div>
              <select style={s.select}>
                <option>This Month</option>
                <option>Last Month</option>
              </select>
            </div>
            {timeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={timeData}>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#9CA3AF" }} axisLine={false} tickLine={false}
                    tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="amount" stroke="#7C3AED" strokeWidth={2.5}
                    dot={{ fill: "#7C3AED", r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "#9CA3AF", fontSize: 13 }}>
                No time-series data available.
              </div>
            )}
          </div>

          {/* AI Insights */}
          <div style={{ ...s.chartCard, width: 260, flexShrink: 0 }} className="chart-card">
            <div style={{ ...s.chartTitle, display: "flex", alignItems: "center", gap: 6 }}>
              <span>✦</span> AI Insights
            </div>
            {d.insights?.unusual_msg && (
              <div style={s.insightUnusual}>
                <div style={{ color: "#DC2626", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>⚠ Unusual Spending Detected</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{d.insights.unusual_msg}</div>
                <button style={s.insightBtn} onClick={() => navigate("/alerts")}>View Details</button>
              </div>
            )}
            {d.insights?.prediction_msg && (
              <div style={{ ...s.insightPred, marginTop: 10 }}>
                <div style={{ color: "#2563EB", fontWeight: 600, fontSize: 13, marginBottom: 6 }}>🔮 Prediction</div>
                <div style={{ fontSize: 12, color: "#374151", lineHeight: 1.5 }}>{d.insights.prediction_msg}</div>
                <button style={{ ...s.insightBtn, color: "#2563EB", borderColor: "#93C5FD", background: "#fff" }}
                  onClick={() => navigate("/predictions")}>View Prediction</button>
              </div>
            )}
            {!d.insights?.unusual_msg && !d.insights?.prediction_msg && (
              <div style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 20 }}>
                Upload a file to get AI insights.
              </div>
            )}
          </div>
        </div>

        {/* ── Bottom row ── */}
        <div style={s.bottomRow}>
          {/* Recent Transactions */}
          <div style={{ ...s.chartCard, flex: 1 }} className="chart-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={s.chartTitle}>Recent Transactions</div>
              <span style={{ fontSize: 12, color: "#7C3AED", cursor: "pointer", fontWeight: 500 }}
                onClick={() => navigate("/transactions")}>View All Transactions →</span>
            </div>
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
                      <span style={{ color: txn.status === "Unusual" ? "#EF4444" : "#10B981", fontWeight: 500 }}>
                        {txn.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Alerts */}
          <div style={{ ...s.chartCard, width: 260, flexShrink: 0 }} className="chart-card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <div style={s.chartTitle}>Recent Alerts</div>
            </div>
            {alerts.slice(0, 4).map((alert, i) => (
              <div key={i} style={s.alertRow}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: alert.color || "#EF4444", flexShrink: 0, marginTop: 3 }} />
                <div>
                  <div style={{ fontSize: 13, color: "#1E293B", fontWeight: 500 }}>{alert.label}</div>
                  <div style={{ fontSize: 11, color: "#9CA3AF", marginTop: 2 }}>{alert.date}</div>
                </div>
              </div>
            ))}
            {alerts.length === 0 && (
              <div style={{ fontSize: 13, color: "#9CA3AF", textAlign: "center", marginTop: 16 }}>No alerts.</div>
            )}
            <div style={{ textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 12, color: "#EF4444", cursor: "pointer", fontWeight: 500 }}
                onClick={() => navigate("/alerts")}>View All Alerts →</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Chatbot ── */}
      {chatOpen && <Chatbot onClose={() => setChatOpen(false)} />}

      {/* ── Chat toggle button ── */}
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
          ? <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>✕</span>
          : (
            /* FIX: Robot image on the floating chat button too */
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
  page:           { display: "flex", minHeight: "100vh", fontFamily: "'Plus Jakarta Sans', sans-serif", background: "linear-gradient(135deg,#F0F4FF 0%,#F8FAFC 50%,#FDF4FF 100%)" },
  main:           { flex: 1, padding: "28px 32px", overflowY: "auto" },
  topBar:         { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 },
  welcome:        { fontSize: 22, fontWeight: 700, color: "#0F172A" },
  welcomeSub:     { fontSize: 13, color: "#64748B", marginTop: 4 },
  uploadBtn:      { background: "#7C3AED", color: "#fff", border: "none", borderRadius: 10, padding: "10px 20px", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 },
  statsGrid:      { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 },
  statCard:       { background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "24px 22px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", minHeight: 130, transition: "box-shadow .2s, transform .2s", cursor: "default" },
  statLabel:      { fontSize: 12, color: "#9CA3AF", fontWeight: 500, marginBottom: 8 },
  statValue:      { fontSize: 20, fontWeight: 700, color: "#0F172A", marginTop: 4, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" },
  statSub:        { fontSize: 12, color: "#6B7280", marginTop: 4 },
  chartsRow:      { display: "flex", gap: 16, marginBottom: 24, alignItems: "flex-start" },
  chartCard:      { background: "rgba(255,255,255,0.75)", backdropFilter: "blur(8px)", borderRadius: 10, padding: "22px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 12px rgba(0,0,0,0.07)", transition: "box-shadow .2s, transform .2s" },
  chartTitle:     { fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 16 },
  select:         { fontSize: 12, border: "1px solid #E5E7EB", borderRadius: 6, padding: "4px 8px", color: "#374151", background: "#fff", cursor: "pointer" },
  insightUnusual: { background: "#FFF1F2", border: "1px solid #FECACA", borderRadius: 8, padding: "12px" },
  insightPred:    { background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: 8, padding: "12px" },
  insightBtn:     { marginTop: 10, fontSize: 11, fontWeight: 600, color: "#DC2626", background: "#fff", border: "1px solid #FECACA", borderRadius: 6, padding: "5px 12px", cursor: "pointer" },
  bottomRow:      { display: "flex", gap: 16, alignItems: "flex-start" },
  th:             { textAlign: "left", padding: "0 12px 10px 0", fontSize: 11, color: "#9CA3AF", fontWeight: 500, textTransform: "uppercase", letterSpacing: ".04em", borderBottom: "1px solid #F3F4F6" },
  td:             { padding: "11px 12px 11px 0", color: "#374151", borderBottom: "1px solid #F9FAFB", verticalAlign: "middle" },
  tag:            { display: "inline-block", padding: "3px 9px", borderRadius: 6, fontSize: 11, fontWeight: 500 },
  alertRow:       { display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #F3F4F6", alignItems: "flex-start" },
};

const cs = {
  box:         { width: 360, height: 500, background: "#fff", borderRadius: 18, boxShadow: "0 20px 60px rgba(0,0,0,0.18)", display: "flex", flexDirection: "column", overflow: "hidden", border: "1px solid #E5E7EB" },
  header:      { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" },
  // botAvatarWrap: circular bg behind the image in header
  botAvatarWrap:{ width: 36, height: 36, background: "rgba(255,255,255,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" },
  closeBtn:    { background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", width: 28, height: 28, borderRadius: "50%", cursor: "pointer", fontSize: 12, fontWeight: 700 },
  messages:    { flex: 1, overflowY: "auto", padding: "14px 14px 6px", display: "flex", flexDirection: "column" },
  aiBubble:    { background: "#F3F4F6", color: "#1E293B", padding: "10px 13px", borderRadius: "0 12px 12px 12px", fontSize: 13, lineHeight: 1.5, maxWidth: 240 },
  userBubble:  { background: "linear-gradient(135deg,#7C3AED,#4F46E5)", color: "#fff", padding: "10px 13px", borderRadius: "12px 0 12px 12px", fontSize: 13, lineHeight: 1.5, maxWidth: 240 },
  suggestions: { padding: "6px 14px", display: "flex", gap: 6, flexWrap: "wrap" },
  suggBtn:     { fontSize: 11, background: "#EDE9FE", color: "#7C3AED", border: "none", borderRadius: 20, padding: "5px 10px", cursor: "pointer", fontWeight: 500 },
  inputRow:    { display: "flex", gap: 8, padding: "10px 14px", borderTop: "1px solid #F3F4F6" },
  input:       { flex: 1, border: "1.5px solid #E5E7EB", borderRadius: 24, padding: "9px 14px", fontSize: 13, outline: "none", fontFamily: "'Plus Jakarta Sans', sans-serif" },
  sendBtn:     { width: 38, height: 38, background: "linear-gradient(135deg,#7C3AED,#4F46E5)", border: "none", borderRadius: "50%", color: "#fff", fontSize: 14, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" },
};

const extraCss = `
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
  .stat-card:hover  { box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; transform: translateY(-2px); }
  .chart-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.13) !important; transform: translateY(-2px); }
`;
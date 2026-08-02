// ─── Spendwise AI – Shared Components ────────────────────────────────────────
import React from "react";
import { useAuth } from "../context/AuthContext";

export const fmt = (n) =>
  `₹${Number(n).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

export const CAT_COLORS = {
  "Food & Dining":     { bar: "#34D399", dot: "#34D399", tag: { background: "#D1FAE5", color: "#065F46" } },
  "Travel":            { bar: "#60A5FA", dot: "#60A5FA", tag: { background: "#DBEAFE", color: "#1E40AF" } },
  "Shopping":          { bar: "#FBBF24", dot: "#FBBF24", tag: { background: "#FEF3C7", color: "#92400E" } },
  "Bills & Utilities": { bar: "#818CF8", dot: "#818CF8", tag: { background: "#EDE9FE", color: "#5B21B6" } },
  "Transfers":         { bar: "#F472B6", dot: "#F472B6", tag: { background: "#FCE7F3", color: "#9D174D" } },
  "Transport":         { bar: "#38BDF8", dot: "#38BDF8", tag: { background: "#E0F2FE", color: "#0369A1" } },
  "Bills & Recharge":  { bar: "#818CF8", dot: "#818CF8", tag: { background: "#EDE9FE", color: "#5B21B6" } },
  "Others":            { bar: "#A78BFA", dot: "#A78BFA", tag: { background: "#EDE9FE", color: "#6D28D9" } },
};

export function getCatColor(cat) {
  return CAT_COLORS[cat] ?? { bar: "#A78BFA", dot: "#A78BFA", tag: { background: "#EDE9FE", color: "#6D28D9" } };
}

// ── SVG Nav Icons ──────────────────────────────────────────────────────────────
const NavIcons = {
  Dashboard: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1.5"/>
      <rect x="14" y="3" width="7" height="7" rx="1.5"/>
      <rect x="3" y="14" width="7" height="7" rx="1.5"/>
      <rect x="14" y="14" width="7" height="7" rx="1.5"/>
    </svg>
  ),
  Transactions: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/>
      <rect x="9" y="3" width="6" height="4" rx="1"/>
      <line x1="9" y1="12" x2="15" y2="12"/>
      <line x1="9" y1="16" x2="12" y2="16"/>
    </svg>
  ),
  Upload: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17v2a2 2 0 002 2h12a2 2 0 002-2v-2"/>
      <polyline points="16 9 12 5 8 9"/>
      <line x1="12" y1="5" x2="12" y2="17"/>
    </svg>
  ),
  Categories: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3"/>
      <circle cx="18" cy="6" r="3"/>
      <circle cx="6" cy="18" r="3"/>
      <path d="M15 18h6M18 15v6"/>
    </svg>
  ),
  Reports: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="20" x2="18" y2="10"/>
      <line x1="12" y1="20" x2="12" y2="4"/>
      <line x1="6"  y1="20" x2="6"  y2="14"/>
      <line x1="2"  y1="20" x2="22" y2="20"/>
    </svg>
  ),
  Predictions: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
    </svg>
  ),
  Alerts: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
      <path d="M13.73 21a2 2 0 01-3.46 0"/>
    </svg>
  ),
  Goals: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="3"/>
      <line x1="12" y1="2" x2="12" y2="5"/>
      <line x1="12" y1="19" x2="12" y2="22"/>
      <line x1="2" y1="12" x2="5" y2="12"/>
      <line x1="19" y1="12" x2="22" y2="12"/>
    </svg>
  ),
  "Financial Score": (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  ),
  Settings: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3"/>
      <path d="M19.07 4.93l-1.41 1.41M4.93 4.93l1.41 1.41M12 2v2M12 20v2M20 12h2M2 12h2M19.07 19.07l-1.41-1.41M4.93 19.07l1.41-1.41"/>
    </svg>
  ),
  Logout: (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
};

export const NAV = [
  { label: "Dashboard",       path: "/dashboard"    },
  { label: "Transactions",    path: "/transactions" },
  { label: "Upload",          path: "/upload"       },
  { label: "Categories",      path: "/categories"   },
  { label: "Reports",         path: "/reports"      },
  { label: "Predictions",     path: "/predictions"  },
  { label: "Alerts",          path: "/alerts"       },
  { label: "Goals",           path: "/goals"        },
  { label: "Financial Score", path: "/score"        },
  { label: "Settings",        path: "/settings"     },
];

// ── NavItem with hover state ───────────────────────────────────────────────────
function NavItem({ item, active, onClick, danger }) {
  const [hovered, setHovered] = React.useState(false);
  const isActive = active === item.path;

  const style = {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "10px 12px",
    paddingLeft: "9px",
    borderRadius: 8,
    fontSize: 13,
    fontWeight: isActive ? 600 : 400,
    cursor: "pointer",
    transition: "all .2s",
    marginBottom: 2,
    color: danger
      ? hovered ? "#FCA5A5" : "#94A3B8"
      : isActive ? "#fff" : hovered ? "#fff" : "#94A3B8",
    background: isActive
      ? "rgba(124,58,237,0.25)"
      : hovered
      ? danger ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.07)"
      : "transparent",
    borderLeft: isActive ? "3px solid #7C3AED" : "3px solid transparent",
  };

  return (
    <div
      style={style}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
        {NavIcons[item.label]}
      </span>
      {item.label}
    </div>
  );
}

// ── Sidebar ────────────────────────────────────────────────────────────────────
export function Sidebar({ active, navigate }) {
  const { user, logout } = useAuth();

  const displayName  = user?.name  || "User";
  const displayEmail = user?.email || "";
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <aside style={ss.sidebar}>

      {/* ── LOGO ── */}
      <div style={ss.logoArea}>
        <img
          src="/src/assets/logo.png"
          alt="SpendWise"
          style={ss.logoImg}
          onError={(e) => { e.target.style.display = "none"; }}
        />
        <div>
          <span style={ss.logoName}>SpendWise</span>
          <span style={ss.logoSub}>AI Expense Analyzer</span>
        </div>
      </div>

      {/* ── NAV ── */}
      <nav style={{ flex: 1, marginTop: 4 }}>
        {NAV.map((item) => (
          <NavItem
            key={item.path}
            item={item}
            active={active}
            onClick={() => navigate(item.path)}
          />
        ))}

        {/* ── Logout ── */}
        <NavItem
          item={{ label: "Logout", path: "" }}
          active=""
          onClick={handleLogout}
          danger
        />
      </nav>

      {/* ── USER CARD ── */}
      <div style={ss.userCard}>
        {/* ✅ Show Gmail profile pic if available, else fallback to letter avatar */}
        {user?.photo ? (
          <img
            src={user.photo}
            alt={displayName}
            style={ss.avatarImg}
            referrerPolicy="no-referrer"
          />
        ) : (
          <div style={ss.avatar}>{avatarLetter}</div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayName}
          </div>
          <div style={{ fontSize: 11, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {displayEmail}
          </div>
        </div>
      </div>

    </aside>
  );
}

export const GLOBAL_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@600;700&family=Inter:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', sans-serif; background: linear-gradient(135deg, #F0F4FF 0%, #F8FAFC 50%, #FDF4FF 100%); }
  button:hover { opacity: .9; }
  .sw-card { background: rgba(255,255,255,0.82); backdrop-filter: blur(10px); border-radius: 20px; padding: 22px; border: 1.5px solid #E5E7EB; box-shadow: 0 2px 12px rgba(0,0,0,0.07); transition: box-shadow .2s, transform .2s; }
  .sw-card:hover { box-shadow: 0 8px 28px rgba(0,0,0,0.12); transform: translateY(-1px); }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
  .fade-in { animation: fadeIn .35s ease both; }
`;

const ss = {
  sidebar: {
    width: 220,
    background: "#0F172A",
    display: "flex",
    flexDirection: "column",
    padding: "24px 12px",
    flexShrink: 0,
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
    overflowY: "auto",
    zIndex: 100,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 4px",
    marginBottom: 28,
  },
  logoImg: {
    width: 40,
    height: 40,
    objectFit: "contain",
    flexShrink: 0,
  },
  logoName: {
    fontFamily: "'Poppins', sans-serif",
    fontWeight: 700,
    fontSize: 15,
    color: "#fff",
    lineHeight: 1,
    display: "block",
  },
  logoSub: {
    fontFamily: "'Inter', sans-serif",
    fontSize: 9,
    color: "#64748B",
    marginTop: 3,
    letterSpacing: "0.7px",
    textTransform: "uppercase",
    display: "block",
  },
  userCard: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    padding: "12px 8px",
    borderTop: "1px solid #1E293B",
    marginTop: 8,
  },
  // letter avatar — shown when no profile photo
  avatar: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    background: "#7C3AED",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#fff",
    fontWeight: 700,
    fontSize: 14,
    flexShrink: 0,
  },
  // ✅ profile photo — shown for Google/Apple login
  avatarImg: {
    width: 34,
    height: 34,
    borderRadius: "50%",
    objectFit: "cover",
    flexShrink: 0,
    border: "2px solid #7C3AED",
  },
};
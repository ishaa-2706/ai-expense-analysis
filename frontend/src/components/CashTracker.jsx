import React, { useState, useEffect, useCallback, useRef } from "react";

// ─── constants ────────────────────────────────────────────────────────────────
const CASH_KEY    = "spendwise_cash_entries";
const OFFLINE_KEY = "spendwise_offline_queue";

// ─── SVG icons for quick items ────────────────────────────────────────────────
const IconTea = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 8h1a4 4 0 010 8h-1"/>
    <path d="M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8z"/>
    <line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>
  </svg>
);
const IconSnack = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 12h20M2 12c0-4 4-7 10-7s10 3 10 7M2 12c0 4 4 7 10 7s10-3 10-7"/>
    <path d="M12 5v14"/>
  </svg>
);
const IconMaggi = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 6h16v4H4z"/><path d="M8 10v8"/><path d="M12 10v8"/><path d="M16 10v8"/>
    <path d="M4 18h16"/>
  </svg>
);
const IconDrink = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 2h8l-1 7H9L8 2z"/>
    <path d="M9 9c0 5 6 5 6 10"/>
    <path d="M8 19h8"/><line x1="7" y1="22" x2="17" y2="22"/>
  </svg>
);
const IconAuto = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="3" width="15" height="13" rx="2"/>
    <path d="M16 8h4l3 3v3h-7V8z"/>
    <circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
  </svg>
);
const IconOrder = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/>
    <line x1="3" y1="6" x2="21" y2="6"/>
    <path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);
const IconStationery = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 20h9"/>
    <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
  </svg>
);
const IconMedicine = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="4"/>
    <path d="M12 8v8M8 12h8"/>
  </svg>
);

// ─── Tab icons ────────────────────────────────────────────────────────────────
const IconZap = ({ active }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={active ? "#7c3aed" : "none"} stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconPen = ({ active }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>
);
const IconList = ({ active }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={active ? "#7c3aed" : "#94a3b8"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/>
    <line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/>
    <line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
);
const IconWifi = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0114.08 0"/>
    <path d="M1.42 9a16 16 0 0121.16 0"/>
    <path d="M8.53 16.11a6 6 0 016.95 0"/>
    <circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
);
const IconNoWifi = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="1" y1="1" x2="23" y2="23"/>
    <path d="M16.72 11.06A10.94 10.94 0 0119 12.55"/>
    <path d="M5 12.55a10.94 10.94 0 015.17-2.39"/>
    <path d="M10.71 5.05A16 16 0 0122.56 9"/>
    <path d="M1.42 9a15.91 15.91 0 014.7-2.88"/>
    <path d="M8.53 16.11a6 6 0 016.95 0"/>
    <circle cx="12" cy="20" r="1" fill="currentColor"/>
  </svg>
);
const WalletIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
    <path d="M3 5v14a2 2 0 002 2h16v-5"/>
    <path d="M18 12a2 2 0 000 4h4v-4h-4z"/>
  </svg>
);
const CloseIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const QUICK_ITEMS = [
  { icon: IconTea,        label: "Tea",        amount: 10  },
  { icon: IconSnack,      label: "Snacks",     amount: 20  },
  { icon: IconMaggi,      label: "Maggi",      amount: 20  },
  { icon: IconDrink,      label: "Cold drink", amount: 30  },
  { icon: IconAuto,       label: "Auto",       amount: 30  },
  { icon: IconOrder,      label: "Food order", amount: 120 },
  { icon: IconStationery, label: "Stationery", amount: 50  },
  { icon: IconMedicine,   label: "Medicine",   amount: 80  },
];

const CATEGORIES = ["Food", "Transport", "Shopping", "Health", "Education", "Other"];

// ─── storage helpers ──────────────────────────────────────────────────────────
const loadEntries = () => {
  try { return JSON.parse(localStorage.getItem(CASH_KEY)) || []; }
  catch { return []; }
};
const saveEntries = (e) => localStorage.setItem(CASH_KEY, JSON.stringify(e));
const loadQueue   = () => {
  try { return JSON.parse(localStorage.getItem(OFFLINE_KEY)) || []; }
  catch { return []; }
};
const saveQueue   = (q) => localStorage.setItem(OFFLINE_KEY, JSON.stringify(q));

// ─── backend reachability check ───────────────────────────────────────────────
// FIX: navigator.onLine sirf network check karta hai, backend alive hai ya nahi
// ye nahi batata. Is function se actual backend ping karo pehle.
const isBackendReachable = async () => {
  if (!navigator.onLine) return false;
  try {
    const res = await fetch("http://127.0.0.1:8000/health", {
      method: "HEAD",
      signal: AbortSignal.timeout(2000), // 2s timeout
    });
    return res.ok;
  } catch {
    // Backend nahi chala, ya CORS block, ya timeout → reachable nahi
    return false;
  }
};

// ─── sync to backend ──────────────────────────────────────────────────────────
const syncToBackend = async (entry) => {
  // FIX: Online hone ke bawajood backend offline ho sakta hai
  if (!navigator.onLine) throw new Error("offline");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout

  try {
    const res = await fetch("http://127.0.0.1:8000/api/manual-expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new Error("sync failed");
    return res.json();
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

const today    = () => new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short" });
const todayKey = () => new Date().toISOString().split("T")[0];

// ─── main component ───────────────────────────────────────────────────────────
export default function CashTracker() {
  const [open,      setOpen]      = useState(false);
  const [tab,       setTab]       = useState("quick");
  const [entries,   setEntries]   = useState(loadEntries);
  const [queue,     setQueue]     = useState(loadQueue);
  const [syncing,   setSyncing]   = useState(false);
  const [syncMsg,   setSyncMsg]   = useState("");
  const [isOnline,  setIsOnline]  = useState(navigator.onLine);
  const [bounce,    setBounce]    = useState(false);
  // banner: null | "offline" | "back-online" | "syncing"
  const [banner, setBanner]       = useState(navigator.onLine ? null : "offline");

  const [manualAmt,  setManualAmt]  = useState("");
  const [manualDesc, setManualDesc] = useState("");
  const [manualCat,  setManualCat]  = useState("Food");

  // ref so async sync always sees latest queue
  const queueRef   = useRef(queue);
  const syncingRef = useRef(false);
  useEffect(() => { queueRef.current = queue; }, [queue]);

  // ── sync function ──────────────────────────────────────────────────────────
  const runSync = useCallback(async () => {
    if (syncingRef.current || queueRef.current.length === 0) return;

    // FIX: Sync karne se pehle backend reachability check karo
    const reachable = await isBackendReachable();
    if (!reachable) {
      setSyncMsg("Backend nahi mila — baad mein retry hoga.");
      setTimeout(() => setSyncMsg(""), 3500);
      return;
    }

    syncingRef.current = true;
    setSyncing(true);
    setBanner("syncing");

    let synced = 0;
    const remaining = [];
    for (const entry of queueRef.current) {
      try {
        await syncToBackend(entry);
        setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, synced: true } : e));
        synced++;
      } catch {
        remaining.push(entry);
      }
    }

    setQueue(remaining);
    queueRef.current = remaining;
    syncingRef.current = false;
    setSyncing(false);
    setBanner(null);

    if (synced > 0) {
      setSyncMsg(`✓ ${synced} ${synced === 1 ? "entry" : "entries"} synced!`);
    } else {
      setSyncMsg("Sync failed — will retry when stable.");
    }
    setTimeout(() => setSyncMsg(""), 3500);
  }, []);

  // ── online/offline listeners ───────────────────────────────────────────────
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (queueRef.current.length > 0) {
        setBanner("back-online");
        setTimeout(() => runSync(), 1800);
      } else {
        setBanner(null);
      }
    };
    const handleOffline = () => {
      setIsOnline(false);
      setBanner("offline");
    };
    window.addEventListener("online",  handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online",  handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [runSync]);

  // ── persist ────────────────────────────────────────────────────────────────
  useEffect(() => saveEntries(entries), [entries]);
  useEffect(() => saveQueue(queue),     [queue]);

  // ── add entry ──────────────────────────────────────────────────────────────
  // FIX: async banaya taaki isBackendReachable() await kar sake
  const addEntry = useCallback(async (item) => {
    const entry = {
      id:        Date.now(),
      label:     item.label,
      amount:    item.amount,
      category:  item.category || "Food",
      date:      todayKey(),
      dateLabel: today(),
      synced:    false,
    };

    setEntries(prev => [entry, ...prev]);
    setBounce(true);
    setTimeout(() => setBounce(false), 400);

    if (isOnline) {
      // FIX: Pehle backend ping karo — agar nahi mila toh queue mein daalo
      // Isse CORS errors aur 20 failed requests band ho jaayenge
      const reachable = await isBackendReachable();
      if (reachable) {
        syncToBackend(entry)
          .then(() => {
            setEntries(prev => prev.map(e => e.id === entry.id ? { ...e, synced: true } : e));
          })
          .catch(() => {
            // Sync fail hua → queue mein daalo silently
            setQueue(prev => {
              const u = [...prev, entry];
              queueRef.current = u;
              return u;
            });
          });
      } else {
        // Backend nahi chala → seedha queue mein daalo, koi error nahi
        setQueue(prev => {
          const u = [...prev, entry];
          queueRef.current = u;
          return u;
        });
      }
    } else {
      setQueue(prev => { const u = [...prev, entry]; queueRef.current = u; return u; });
    }
  }, [isOnline]);

  const addManual = () => {
    if (!manualAmt || !manualDesc) return;
    addEntry({ label: manualDesc, amount: parseFloat(manualAmt), category: manualCat });
    setManualAmt(""); setManualDesc("");
  };

  const todayEntries = entries.filter(e => e.date === todayKey());
  const todayTotal   = todayEntries.reduce((a, e) => a + e.amount, 0);

  const fabStyle = {
    position: "fixed", bottom: 96, right: 28, zIndex: 900,
    width: 56, height: 56, borderRadius: "50%",
    background: "#7c3aed", border: "none",
    boxShadow: "0 4px 20px rgba(124,58,237,0.45)",
    cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
    transform: bounce ? "scale(1.2)" : "scale(1)",
    transition: "transform 0.2s cubic-bezier(0.34,1.56,0.64,1)",
  };

  const panelStyle = {
    position: "fixed", bottom: 164, right: 28, zIndex: 901,
    width: 340, maxHeight: "72vh",
    background: "#fff", borderRadius: 20,
    boxShadow: "0 20px 60px rgba(0,0,0,0.18)",
    border: "1.5px solid #e8eaf0",
    display: "flex", flexDirection: "column",
    overflow: "hidden",
    fontFamily: "'Inter','Segoe UI',sans-serif",
  };

  // ── banner config ──────────────────────────────────────────────────────────
  const bannerMap = {
    "offline": {
      bg: "rgba(15,23,42,0.70)", border: "rgba(255,255,255,0.14)",
      color: "#fff", subColor: "rgba(255,255,255,0.6)",
      icon: <IconNoWifi />,
      text: "No internet connection",
      sub:  queue.length > 0 ? `${queue.length} entries saved offline` : "New entries will save locally",
      action: null,
    },
    "back-online": {
      bg: "rgba(245,158,11,0.15)", border: "rgba(245,158,11,0.40)",
      color: "#92400e", subColor: "rgba(146,64,14,0.65)",
      icon: <IconWifi />,
      text: `Back online — syncing ${queue.length} ${queue.length === 1 ? "entry" : "entries"}`,
      sub:  "Auto-syncing shortly...",
      action: { label: "Sync Now", fn: runSync },
    },
    "syncing": {
      bg: "rgba(124,58,237,0.12)", border: "rgba(124,58,237,0.28)",
      color: "#5b21b6", subColor: "rgba(91,33,182,0.6)",
      icon: null,
      text: "Syncing entries...",
      sub:  null,
      action: null,
    },
  };

  const bc = banner ? bannerMap[banner] : null;

  return (
    <>
      <style>{`@keyframes ct-spin { to { transform: rotate(360deg); } }`}</style>

      {/* ── FLOATING PILL BANNER — centered, mid-width, curved ───────────────── */}
      {bc && (
        <div style={{
          position: "fixed",
          top: 68,
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 9990,
          width: "auto",
          maxWidth: 500,
          minWidth: 260,
          background: bc.bg,
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${bc.border}`,
          borderRadius: 999,
          padding: "8px 16px 8px 14px",
          display: "flex", alignItems: "center", gap: 8,
          boxShadow: "0 6px 28px rgba(0,0,0,0.14)",
          fontFamily: "'Inter','Segoe UI',sans-serif",
          whiteSpace: "nowrap",
          pointerEvents: "auto",
        }}>
          {banner === "syncing" ? (
            <span style={{ display: "inline-flex", color: bc.color, animation: "ct-spin 1s linear infinite", fontSize: 16 }}>⟳</span>
          ) : (
            <span style={{ display: "inline-flex", color: bc.color }}>{bc.icon}</span>
          )}

          <span style={{ fontSize: 13, fontWeight: 600, color: bc.color }}>{bc.text}</span>
          {bc.sub && (
            <span style={{ fontSize: 12, color: bc.subColor }}>· {bc.sub}</span>
          )}

          {bc.action && !syncing && (
            <button onClick={bc.action.fn} style={{
              marginLeft: 2,
              background: "#f59e0b", color: "#fff", border: "none",
              borderRadius: 999, padding: "3px 12px",
              fontSize: 12, fontWeight: 600, cursor: "pointer", flexShrink: 0,
            }}>{bc.action.label}</button>
          )}

          {banner !== "syncing" && (
            <button onClick={() => setBanner(null)} style={{
              marginLeft: 2, background: "none", border: "none",
              cursor: "pointer", color: bc.color, opacity: 0.55,
              fontSize: 18, lineHeight: 1, padding: 0, flexShrink: 0,
            }}>×</button>
          )}
        </div>
      )}

      {/* ── sync toast ────────────────────────────────────────────────────────── */}
      {syncMsg && (
        <div style={{
          position: "fixed", top: 68, right: 28, zIndex: 9999,
          background: syncMsg.startsWith("✓") ? "#dcfce7" : "#fef3c7",
          border: `1px solid ${syncMsg.startsWith("✓") ? "#86efac" : "#fde68a"}`,
          borderRadius: 12, padding: "8px 16px",
          fontSize: 13,
          color: syncMsg.startsWith("✓") ? "#166534" : "#92400e",
          fontWeight: 500, fontFamily: "'Inter','Segoe UI',sans-serif",
          boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        }}>{syncMsg}</div>
      )}

      {/* ── FAB ───────────────────────────────────────────────────────────────── */}
      <button style={fabStyle} onClick={() => setOpen(o => !o)} title="Cash Tracker">
        {open ? <CloseIcon /> : <WalletIcon />}
      </button>

      {/* Today badge */}
      {!open && todayTotal > 0 && (
        <div style={{
          position: "fixed", bottom: 142, right: 24, zIndex: 902,
          background: "#ef4444", color: "#fff",
          fontSize: 10, fontWeight: 700,
          padding: "2px 7px", borderRadius: 20,
          fontFamily: "'Inter','Segoe UI',sans-serif",
        }}>₹{todayTotal}</div>
      )}

      {/* ── Panel ─────────────────────────────────────────────────────────────── */}
      {open && (
        <div style={panelStyle}>
          {/* Header */}
          <div style={{ padding: "16px 20px 0", borderBottom: "1px solid #f1f5f9", background: "#fafafa" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a", display: "flex", alignItems: "center", gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12V7H5a2 2 0 010-4h14v4"/>
                    <path d="M3 5v14a2 2 0 002 2h16v-5"/>
                    <path d="M18 12a2 2 0 000 4h4v-4h-4z"/>
                  </svg>
                  Cash Tracker
                </div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                  Today: <span style={{ color: "#7c3aed", fontWeight: 700 }}>₹{todayTotal}</span>
                  {queue.length > 0 && <span style={{ color: "#f59e0b", marginLeft: 8 }}>· {queue.length} pending</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                {isOnline && queue.length > 0 && !syncing && (
                  <button onClick={runSync} style={{
                    background: "#f0eeff", border: "1px solid #c5bdf7", color: "#7c3aed",
                    borderRadius: 8, padding: "3px 10px", fontSize: 11, fontWeight: 600,
                    cursor: "pointer",
                  }}>Sync</button>
                )}
                <div style={{
                  width: 8, height: 8, borderRadius: "50%",
                  background: isOnline ? "#10b981" : "#ef4444",
                }} title={isOnline ? "Online" : "Offline"} />
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: "flex" }}>
              {[
                { key: "quick",   Icon: IconZap,  label: "Quick"  },
                { key: "manual",  Icon: IconPen,  label: "Manual" },
                { key: "history", Icon: IconList, label: "Log"    },
              ].map(({ key, Icon, label }) => (
                <button key={key} onClick={() => setTab(key)} style={{
                  flex: 1, padding: "8px 0", border: "none", background: "none", cursor: "pointer",
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                  fontSize: 12, fontWeight: tab === key ? 700 : 500,
                  color: tab === key ? "#7c3aed" : "#94a3b8",
                  borderBottom: `2px solid ${tab === key ? "#7c3aed" : "transparent"}`,
                  marginBottom: -1,
                }}>
                  <Icon active={tab === key} />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab content */}
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>

            {/* Quick */}
            {tab === "quick" && (
              <>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12, fontWeight: 500 }}>Tap to add instantly 👇</div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  {QUICK_ITEMS.map(item => (
                    <button key={item.label} onClick={() => addEntry(item)} style={{
                      background: "#f8fafc", border: "1.5px solid #e8eaf0",
                      borderRadius: 12, padding: "12px 10px", cursor: "pointer",
                      textAlign: "left", transition: "all 0.15s",
                      display: "flex", alignItems: "center", gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = "#f0eeff"; e.currentTarget.style.borderColor = "#c5bdf7"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "#f8fafc"; e.currentTarget.style.borderColor = "#e8eaf0"; }}
                    >
                      <item.icon />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#0f172a" }}>{item.label}</div>
                        <div style={{ fontSize: 11, color: "#7c3aed", fontWeight: 700 }}>₹{item.amount}</div>
                      </div>
                    </button>
                  ))}
                </div>
                <div style={{ marginTop: 12, fontSize: 11, color: "#cbd5e1", textAlign: "center" }}>
                  {isOnline ? "✓ Online — syncing instantly" : "📵 Saving offline"}
                </div>
              </>
            )}

            {/* Manual */}
            {tab === "manual" && (
              <>
                <div style={{ fontSize: 12, color: "#64748b", marginBottom: 14, fontWeight: 500 }}>Log any custom expense</div>
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 500 }}>Description</div>
                  <input value={manualDesc} onChange={e => setManualDesc(e.target.value)}
                    placeholder='e.g. "Maggi at canteen"'
                    style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e8eaf0", fontSize: 13, background: "#f8fafc", outline: "none", boxSizing: "border-box" }}
                  />
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 500 }}>Amount (₹)</div>
                    <input type="number" value={manualAmt} onChange={e => setManualAmt(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addManual()} placeholder="20"
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e8eaf0", fontSize: 13, background: "#f8fafc", outline: "none", boxSizing: "border-box" }}
                    />
                  </div>
                  <div>
                    <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 500 }}>Category</div>
                    <select value={manualCat} onChange={e => setManualCat(e.target.value)}
                      style={{ width: "100%", padding: "10px 12px", borderRadius: 10, border: "1.5px solid #e8eaf0", fontSize: 13, background: "#f8fafc", outline: "none", boxSizing: "border-box", cursor: "pointer" }}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <button onClick={addManual} style={{
                  width: "100%", background: "#7c3aed", color: "#fff", border: "none",
                  borderRadius: 10, padding: "11px 0", fontSize: 13, fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 2px 10px rgba(124,58,237,0.3)",
                }}>+ Log Expense</button>
                <div style={{ marginTop: 10, fontSize: 11, color: "#94a3b8", textAlign: "center" }}>
                  {isOnline ? "✓ Will sync immediately" : "📵 Will sync when online"}
                </div>
              </>
            )}

            {/* Log / History */}
            {tab === "history" && (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b" }}>Today's cash log</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#7c3aed" }}>₹{todayTotal} total</div>
                </div>
                {todayEntries.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "24px 0", color: "#94a3b8", fontSize: 13 }}>No entries today.<br />Start logging! ⚡</div>
                ) : todayEntries.map(e => (
                  <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f1f5f9" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: 8, background: "#f0eeff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4h-4z"/>
                        </svg>
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#0f172a" }}>{e.label}</div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {e.category} · {e.synced ? <span style={{ color: "#10b981" }}>✓ synced</span> : <span style={{ color: "#f59e0b" }}>⏳ pending</span>}
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#ef4444" }}>−₹{e.amount}</div>
                  </div>
                ))}

                {entries.filter(e => e.date !== todayKey()).length > 0 && (
                  <>
                    <div style={{ fontSize: 11, fontWeight: 600, color: "#94a3b8", marginTop: 16, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>Earlier</div>
                    {entries.filter(e => e.date !== todayKey()).slice(0, 10).map(e => (
                      <div key={e.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f1f5f9", opacity: 0.65 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 7, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 12V7H5a2 2 0 010-4h14v4"/><path d="M3 5v14a2 2 0 002 2h16v-5"/><path d="M18 12a2 2 0 000 4h4v-4h-4z"/>
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: 12, fontWeight: 500, color: "#0f172a" }}>{e.label}</div>
                            <div style={{ fontSize: 11, color: "#94a3b8" }}>{e.dateLabel}</div>
                          </div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#64748b" }}>−₹{e.amount}</div>
                      </div>
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
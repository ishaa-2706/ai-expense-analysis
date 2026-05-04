import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar, GLOBAL_CSS } from "./shared";

// ─── helpers ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "spendwise_goals";

const loadGoals = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};

const saveGoals = (goals) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(goals));

const PRESET_GOALS = [
  { emoji: "🎧", label: "Headphones",  amount: 2000 },
  { emoji: "🏖️", label: "Trip",        amount: 5000 },
  { emoji: "🎮", label: "Gaming",      amount: 3500 },
  { emoji: "📱", label: "Phone",       amount: 8000 },
  { emoji: "👟", label: "Sneakers",    amount: 3000 },
  { emoji: "💻", label: "Laptop",      amount: 40000 },
  { emoji: "📚", label: "Books",       amount: 1000 },
  { emoji: "🍕", label: "Pizza Party", amount: 500  },
];

const FOOD_SKIP_AMOUNT = 120; // avg food order cost

const nudge = (goal) => {
  const remaining = goal.target - goal.saved;
  if (remaining <= 0) return "🎉 Goal complete! Congratulations!";
  const skips = Math.ceil(remaining / FOOD_SKIP_AMOUNT);
  const days  = Math.ceil(remaining / (goal.target * 0.1));
  if (skips <= 10)
    return `Skip ${skips} food order${skips > 1 ? "s" : ""} → reach your goal faster! 🚀`;
  return `Save ₹${Math.round(goal.target * 0.1)}/day → done in ${days} days 💪`;
};

const pct = (saved, target) =>
  Math.min(100, Math.round((saved / target) * 100));

// ─── colour palette ──────────────────────────────────────────────────────────
const COLORS = ["#7c3aed", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#ec4899"];

const C = {
  card: {
    background: "#fff",
    border: "1.5px solid #e8eaf0",
    borderRadius: 16,
    boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
    padding: "20px 24px",
  },
};

// ─── sub-components ──────────────────────────────────────────────────────────
function GoalCard({ goal, index, onAdd, onDelete }) {
  const p      = pct(goal.saved, goal.target);
  const color  = COLORS[index % COLORS.length];
  const done   = goal.saved >= goal.target;
  const [adding, setAdding] = useState(false);
  const [amt, setAmt]       = useState("");

  const handleAdd = () => {
    const n = parseFloat(amt);
    if (!n || n <= 0) return;
    onAdd(goal.id, n);
    setAmt(""); setAdding(false);
  };

  return (
    <div style={{
      ...C.card,
      borderLeft: `4px solid ${color}`,
      position: "relative",
      overflow: "hidden",
    }}>
      {/* delete */}
      <button onClick={() => onDelete(goal.id)} style={{
        position: "absolute", top: 12, right: 12,
        background: "none", border: "none", cursor: "pointer",
        fontSize: 16, color: "#cbd5e1", lineHeight: 1,
      }}>×</button>

      {/* top row */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{
          width: 44, height: 44, borderRadius: 12,
          background: `${color}18`, display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>{goal.emoji}</div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#0f172a" }}>{goal.label}</div>
          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
            {goal.deadline ? `Due: ${goal.deadline}` : "No deadline"}
          </div>
        </div>
        {done && (
          <div style={{
            background: "#dcfce7", color: "#16a34a",
            fontSize: 11, fontWeight: 700, padding: "4px 10px",
            borderRadius: 20,
          }}>✓ Done!</div>
        )}
      </div>

      {/* progress */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
          <span style={{ fontSize: 13, fontWeight: 600, color }}>₹{goal.saved.toLocaleString()}</span>
          <span style={{ fontSize: 13, color: "#94a3b8" }}>₹{goal.target.toLocaleString()}</span>
        </div>
        <div style={{ height: 8, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
          <div style={{
            height: "100%", width: `${p}%`,
            background: done ? "#10b981" : color,
            borderRadius: 99,
            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
          }} />
        </div>
        <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4, textAlign: "right" }}>{p}%</div>
      </div>

      {/* nudge */}
      {!done && (
        <div style={{
          background: `${color}10`, border: `1px solid ${color}30`,
          borderRadius: 10, padding: "8px 12px",
          fontSize: 12, color: "#475569", marginBottom: 12, lineHeight: 1.5,
        }}>
          💡 {nudge(goal)}
        </div>
      )}

      {/* add money */}
      {!done && (
        adding ? (
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              placeholder="₹ Amount"
              value={amt}
              onChange={e => setAmt(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleAdd()}
              autoFocus
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 8,
                border: "1.5px solid #e8eaf0", fontSize: 13,
                outline: "none", background: "#f8fafc",
              }}
            />
            <button onClick={handleAdd} style={{
              background: color, color: "#fff", border: "none",
              borderRadius: 8, padding: "8px 14px",
              fontSize: 13, fontWeight: 600, cursor: "pointer",
            }}>Add</button>
            <button onClick={() => setAdding(false)} style={{
              background: "#f1f5f9", color: "#64748b", border: "none",
              borderRadius: 8, padding: "8px 12px",
              fontSize: 13, cursor: "pointer",
            }}>✕</button>
          </div>
        ) : (
          <button onClick={() => setAdding(true)} style={{
            width: "100%", background: `${color}12`,
            border: `1.5px solid ${color}30`, color,
            borderRadius: 8, padding: "8px 0",
            fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>+ Add Money</button>
        )
      )}
    </div>
  );
}

function AddGoalModal({ onClose, onSave }) {
  const [emoji,    setEmoji]    = useState("🎯");
  const [label,    setLabel]    = useState("");
  const [target,   setTarget]   = useState("");
  const [deadline, setDeadline] = useState("");
  const [saved,    setSaved]    = useState("");

  const handlePreset = (p) => {
    setEmoji(p.emoji); setLabel(p.label);
    setTarget(String(p.amount));
  };

  const handleSave = () => {
    if (!label || !target) return;
    onSave({
      id:       Date.now(),
      emoji,
      label,
      target:   parseFloat(target),
      saved:    parseFloat(saved) || 0,
      deadline: deadline || null,
      createdAt: new Date().toISOString(),
    });
    onClose();
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 999,
      background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center",
    }} onClick={onClose}>
      <div style={{
        background: "#fff", borderRadius: 20,
        width: "100%", maxWidth: 440,
        boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        padding: "28px 28px 24px",
      }} onClick={e => e.stopPropagation()}>

        <div style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", marginBottom: 6 }}>
          🎯 New Saving Goal
        </div>
        <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
          Set a goal and track your progress
        </div>

        {/* Presets */}
        <div style={{ fontSize: 12, fontWeight: 600, color: "#64748b", marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.6 }}>
          Quick Presets
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {PRESET_GOALS.map(p => (
            <button key={p.label} onClick={() => handlePreset(p)} style={{
              background: label === p.label ? "#7c3aed" : "#f8fafc",
              color: label === p.label ? "#fff" : "#475569",
              border: `1.5px solid ${label === p.label ? "#7c3aed" : "#e8eaf0"}`,
              borderRadius: 20, padding: "5px 12px",
              fontSize: 12, cursor: "pointer", fontWeight: 500,
            }}>{p.emoji} {p.label}</button>
          ))}
        </div>

        {/* Emoji + Label */}
        <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
          <input value={emoji} onChange={e => setEmoji(e.target.value)}
            style={{
              width: 56, textAlign: "center", fontSize: 22,
              border: "1.5px solid #e8eaf0", borderRadius: 10,
              padding: "8px 4px", background: "#f8fafc", outline: "none",
            }}
          />
          <input value={label} onChange={e => setLabel(e.target.value)}
            placeholder="Goal name (e.g. Headphones)"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 10,
              border: "1.5px solid #e8eaf0", fontSize: 13,
              background: "#f8fafc", outline: "none",
            }}
          />
        </div>

        {/* Target + Saved */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 500 }}>Target Amount (₹)</div>
            <input type="number" value={target} onChange={e => setTarget(e.target.value)}
              placeholder="2000"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid #e8eaf0", fontSize: 13,
                background: "#f8fafc", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
          <div>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 500 }}>Already Saved (₹)</div>
            <input type="number" value={saved} onChange={e => setSaved(e.target.value)}
              placeholder="0"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10,
                border: "1.5px solid #e8eaf0", fontSize: 13,
                background: "#f8fafc", outline: "none", boxSizing: "border-box",
              }}
            />
          </div>
        </div>

        {/* Deadline */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ fontSize: 12, color: "#64748b", marginBottom: 5, fontWeight: 500 }}>Deadline (optional)</div>
          <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: "1.5px solid #e8eaf0", fontSize: 13,
              background: "#f8fafc", outline: "none", boxSizing: "border-box",
            }}
          />
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{
            flex: 1, padding: "11px 0", borderRadius: 10,
            background: "#f1f5f9", border: "none",
            color: "#64748b", fontSize: 13, fontWeight: 600, cursor: "pointer",
          }}>Cancel</button>
          <button onClick={handleSave} style={{
            flex: 2, padding: "11px 0", borderRadius: 10,
            background: "#7c3aed", border: "none",
            color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer",
            boxShadow: "0 2px 10px rgba(124,58,237,0.3)",
          }}>Save Goal 🎯</button>
        </div>
      </div>
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────
export default function GoalSavings() {
  const navigate         = useNavigate();
  const [goals, setGoals]       = useState(loadGoals);
  const [showModal, setModal]   = useState(false);

  useEffect(() => saveGoals(goals), [goals]);

  const addGoal    = (g)      => setGoals(prev => [g, ...prev]);
  const deleteGoal = (id)     => setGoals(prev => prev.filter(g => g.id !== id));
  const addMoney   = (id, n)  =>
    setGoals(prev => prev.map(g =>
      g.id === id ? { ...g, saved: Math.min(g.target, g.saved + n) } : g
    ));

  const totalTarget = goals.reduce((a, g) => a + g.target, 0);
  const totalSaved  = goals.reduce((a, g) => a + g.saved, 0);
  const completed   = goals.filter(g => g.saved >= g.target).length;

  const s = {
    page: { display: "flex", minHeight: "100vh", background: "#f5f5f0", fontFamily: "'Inter','Segoe UI',sans-serif" },
    main: { flex: 1, minWidth: 0, padding: "28px 32px", overflowY: "auto" },
  };

  return (
    <div style={s.page}>
      <style>{GLOBAL_CSS}</style>
      <Sidebar active="/goals" navigate={navigate} user={null} />

      <div style={s.main}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "#0f172a" }}>
              🎯 Goal-Based Savings
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: "5px 0 0" }}>
              Save smart, spend smarter
            </p>
          </div>
          <button onClick={() => setModal(true)} style={{
            background: "#7c3aed", border: "none", color: "#fff",
            borderRadius: 10, padding: "9px 20px", cursor: "pointer",
            fontSize: 13, fontWeight: 600,
            boxShadow: "0 2px 10px rgba(124,58,237,0.3)",
          }}>+ New Goal</button>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 24 }}>
          {[
            { label: "Total Goals",    value: goals.length,                       color: "#7c3aed", bg: "#f0eeff" },
            { label: "Total Saved",    value: `₹${totalSaved.toLocaleString()}`,  color: "#10b981", bg: "#ecfdf5" },
            { label: "Goals Achieved", value: `${completed} / ${goals.length}`,   color: "#f59e0b", bg: "#fffbeb" },
          ].map(c => (
            <div key={c.label} style={{
              background: c.bg,
              border: `1.5px solid ${c.color}30`,
              borderRadius: 14,
              padding: "16px 20px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
            }}>
              <div style={{ fontSize: 12, color: "#64748b", fontWeight: 500, marginBottom: 6 }}>{c.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Overall progress */}
        {goals.length > 0 && (
          <div style={{ ...C.card, marginBottom: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>Overall Savings Progress</span>
              <span style={{ fontSize: 13, color: "#7c3aed", fontWeight: 700 }}>
                ₹{totalSaved.toLocaleString()} / ₹{totalTarget.toLocaleString()}
              </span>
            </div>
            <div style={{ height: 10, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%",
                width: `${pct(totalSaved, totalTarget)}%`,
                background: "linear-gradient(90deg, #7c3aed, #0ea5e9)",
                borderRadius: 99, transition: "width 1s ease",
              }} />
            </div>
            <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 6, textAlign: "right" }}>
              {pct(totalSaved, totalTarget)}% of total target saved
            </div>
          </div>
        )}

        {/* Goals grid */}
        {goals.length === 0 ? (
          <div style={{
            ...C.card,
            textAlign: "center", padding: "60px 24px",
          }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🎯</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", marginBottom: 6 }}>
              No goals yet!
            </div>
            <div style={{ fontSize: 13, color: "#94a3b8", marginBottom: 20 }}>
              Set your first saving goal — Headphones, Trip, Gaming gear, anything!
            </div>
            <button onClick={() => setModal(true)} style={{
              background: "#7c3aed", border: "none", color: "#fff",
              borderRadius: 10, padding: "10px 24px", cursor: "pointer",
              fontSize: 13, fontWeight: 600,
            }}>+ Create First Goal</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
            {goals.map((g, i) => (
              <GoalCard key={g.id} goal={g} index={i} onAdd={addMoney} onDelete={deleteGoal} />
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <AddGoalModal onClose={() => setModal(false)} onSave={addGoal} />
      )}
    </div>
  );
}
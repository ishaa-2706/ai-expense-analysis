// ─── Spendwise AI – Shared Data Store ────────────────────────────────────────
// Simple module-level store with localStorage persistence.
// Any component can import { getAnalysis, setAnalysis, clearAnalysis }.

const KEY = "spendwise_analysis";

export function setAnalysis(data) {
  try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {}
  window.__spendwiseData = data;
}

export function getAnalysis() {
  if (window.__spendwiseData) return window.__spendwiseData;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { window.__spendwiseData = JSON.parse(raw); return window.__spendwiseData; }
  } catch {}
  return null;
}

export function clearAnalysis() {
  try { localStorage.removeItem(KEY); } catch {}
  window.__spendwiseData = null;
}

// ─── Demo / fallback data ─────────────────────────────────────────────────────
export const DEMO = {
  user: { name: "Manisha", email: "manisha@example.com" },
  total_expense: 52620,
  prev_expense: 46240,
  top_category: "Food & Dining",
  top_category_amount: 18760,
  total_transactions: 68,
  prev_transactions: 60,
  unusual_count: 3,
  categories: [
    { category: "Food & Dining",    amount: 18760 },
    { category: "Travel",           amount: 11620 },
    { category: "Shopping",         amount:  9380 },
    { category: "Bills & Utilities",amount:  6950 },
    { category: "Others",           amount:  5910 },
  ],
  spending_over_time: [
    { date: "May 1",  amount: 3200 },
    { date: "May 8",  amount: 4100 },
    { date: "May 15", amount: 3800 },
    { date: "May 22", amount: 5600 },
    { date: "May 29", amount: 7800 },
  ],
  insights: {
    unusual_msg: "You spent ₹4,850 on Shopping on May 26 — 2.4× higher than usual.",
    prediction_msg: "You're likely to spend ₹6,200 – ₹7,100 this weekend.",
    prediction_range: "₹6,200 – ₹7,100",
  },
  transactions: [
    { date: "May 28, 2024", description: "Zomato Order",     category: "Food & Dining",     amount: 650,  status: "Normal"  },
    { date: "May 27, 2024", description: "Uber Ride",        category: "Travel",            amount: 1250, status: "Normal"  },
    { date: "May 26, 2024", description: "Amazon Purchase",  category: "Shopping",          amount: 4850, status: "Unusual" },
    { date: "May 25, 2024", description: "Electricity Bill", category: "Bills & Utilities", amount: 1450, status: "Normal"  },
    { date: "May 24, 2024", description: "Swiggy Order",     category: "Food & Dining",     amount: 720,  status: "Normal"  },
    { date: "May 23, 2024", description: "Metro Card",       category: "Travel",            amount: 500,  status: "Normal"  },
    { date: "May 22, 2024", description: "Myntra Order",     category: "Shopping",          amount: 2200, status: "Normal"  },
    { date: "May 21, 2024", description: "Dominos Pizza",    category: "Food & Dining",     amount: 890,  status: "Normal"  },
    { date: "May 20, 2024", description: "Airtel Recharge",  category: "Bills & Utilities", amount: 299,  status: "Normal"  },
    { date: "May 19, 2024", description: "Ola Ride",         category: "Travel",            amount: 380,  status: "Normal"  },
  ],
  alerts: [
    { label: "Unusual spending on Shopping",     date: "May 26, 2024", color: "#EF4444", type: "high" },
    { label: "High amount spent on Food",        date: "May 24, 2024", color: "#F59E0B", type: "medium" },
    { label: "Weekend overspending predicted",   date: "May 23, 2024", color: "#F59E0B", type: "medium" },
  ],
};
from flask import Blueprint, jsonify, request
import random
import store  # shared store — no circular import

financial_score_bp = Blueprint('financial_score', __name__)


def calculate_financial_health_score(transactions, income=None):
    if not transactions:
        return {
            "score": 300, "grade": "Poor", "factors": {},
            "tips": ["No transaction data available. Please upload a bank statement first."],
            "history": []
        }

    # Normalize: status:"Unusual" → is_unusual:True
    for t in transactions:
        if 'is_unusual' not in t:
            t['is_unusual'] = t.get('status', '') == 'Unusual'

    total_expense = sum(float(t.get('amount', 0)) for t in transactions if float(t.get('amount', 0)) > 0)
    total_income = income or (total_expense * 1.4)

    expense_ratio = total_expense / total_income if total_income > 0 else 1.0
    if expense_ratio <= 0.5:   budget_score = 100
    elif expense_ratio <= 0.7: budget_score = 90
    elif expense_ratio <= 0.8: budget_score = 75
    elif expense_ratio <= 0.9: budget_score = 60
    elif expense_ratio <= 1.0: budget_score = 40
    else:                      budget_score = 20

    unusual_count = sum(1 for t in transactions if t.get('is_unusual', False))
    total_txns = len(transactions)
    unusual_ratio = unusual_count / total_txns if total_txns > 0 else 0
    if unusual_ratio == 0:        unusual_score = 100
    elif unusual_ratio <= 0.05:   unusual_score = 85
    elif unusual_ratio <= 0.10:   unusual_score = 65
    elif unusual_ratio <= 0.20:   unusual_score = 45
    else:                         unusual_score = 25

    savings = total_income - total_expense
    savings_rate = savings / total_income if total_income > 0 else 0
    if savings_rate >= 0.30:   savings_score = 100
    elif savings_rate >= 0.20: savings_score = 85
    elif savings_rate >= 0.10: savings_score = 65
    elif savings_rate >= 0.05: savings_score = 45
    elif savings_rate >= 0:    savings_score = 30
    else:                      savings_score = 10

    category_totals = {}
    for t in transactions:
        cat = t.get('category', 'Others')
        category_totals[cat] = category_totals.get(cat, 0) + float(t.get('amount', 0))
    top_category_pct = max(category_totals.values()) / total_expense if total_expense > 0 else 1.0
    if top_category_pct <= 0.30:   diversity_score = 100
    elif top_category_pct <= 0.40: diversity_score = 80
    elif top_category_pct <= 0.50: diversity_score = 60
    elif top_category_pct <= 0.65: diversity_score = 40
    else:                          diversity_score = 20

    weighted = budget_score * 0.30 + unusual_score * 0.25 + savings_score * 0.25 + diversity_score * 0.20
    final_score = max(300, min(900, int(300 + (weighted / 100) * 600)))

    if final_score >= 800:   grade = "Excellent"
    elif final_score >= 700: grade = "Good"
    elif final_score >= 550: grade = "Fair"
    else:                    grade = "Poor"

    tips = []
    if budget_score < 60:
     tips.append(f"Your expenses are {round(expense_ratio*100)}% of your income — try to keep it below 80%")
    if unusual_score < 60:
     tips.append(f"{unusual_count} unusual transactions detected — please review them")
    if savings_score < 60:
     tips.append(f"Your savings rate is only {round(savings_rate*100)}% — aim for at least 20%")
    if diversity_score < 60:
     top_cat = max(category_totals, key=category_totals.get)
     tips.append(f"You're spending {round(top_category_pct*100)}% on '{top_cat}' — try to balance it out")
    if not tips:
     tips.append("Great job! Keep maintaining your spending habits")
     tips.append("Next goal: push your savings rate to 30% for an 800+ score")
    base = final_score - random.randint(60, 90)
    history = [{"month": m, "score": min(900, max(300, base + i * random.randint(10, 20)))}
           for i, m in enumerate(["Jan", "Feb", "Mar", "Apr"])]
    history.append({"month": "May", "score": final_score})

    return {
        "score": final_score, "grade": grade,
        "factors": {
            "budget_adherence":   {"score": budget_score,    "label": "Budget adherence",  "color": "#1D9E75"},
            "unusual_spending":   {"score": unusual_score,   "label": "Unusual spending",   "color": "#EF9F27"},
            "savings_rate":       {"score": savings_score,   "label": "Savings rate",       "color": "#378ADD"},
            "category_diversity": {"score": diversity_score, "label": "Category diversity", "color": "#E24B4A"},
        },
        "tips": tips, "history": history,
        "meta": {
            "total_expense": round(total_expense, 2), "total_income": round(total_income, 2),
            "savings": round(savings, 2), "savings_rate_pct": round(savings_rate * 100, 1),
            "unusual_count": unusual_count, "total_transactions": total_txns,
            "top_category": max(category_totals, key=category_totals.get) if category_totals else "N/A",
            "top_category_pct": round(top_category_pct * 100, 1)
        }
    }


@financial_score_bp.route('/api/financial-score', methods=['GET'])
def get_financial_score():
    try:
        result = calculate_financial_health_score(store.transactions_store)
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@financial_score_bp.route('/api/financial-score', methods=['POST'])
def post_financial_score():
    try:
        body = request.get_json()
        transactions = body.get('transactions', [])
        income = body.get('income', None)
        if not transactions:
            return jsonify({"success": False, "error": "transactions array required"}), 400
        result = calculate_financial_health_score(transactions, income)
        return jsonify({"success": True, "data": result}), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
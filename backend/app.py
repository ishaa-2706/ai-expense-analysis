from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
load_dotenv()
from model import predict_category
import pandas as pd
import pdfplumber
from pypdf import PdfReader, PdfWriter
import io
import os
import json
import re
import concurrent.futures
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

import store

from financial_score import financial_score_bp
app.register_blueprint(financial_score_bp)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")


@app.route("/")
def home():
    return "Flask ML API running"


@app.route("/health", methods=["GET", "HEAD"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/api/manual-expense", methods=["POST"])
def manual_expense():
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "No data provided"}), 400
        label    = data.get("label", "").strip()
        amount   = data.get("amount")
        category = data.get("category", "Food").strip()
        date     = data.get("date", "").strip()
        if not label:
            return jsonify({"error": "label is required"}), 400
        if amount is None:
            return jsonify({"error": "amount is required"}), 400
        try:
            amount = float(amount)
        except (ValueError, TypeError):
            return jsonify({"error": "amount must be a number"}), 400
        entry = {"id": data.get("id"), "label": label, "amount": amount, "category": category, "date": date, "synced": True}
        print(f"[manual-expense] Saved: {label} ₹{amount} ({category}) on {date}")
        return jsonify({"success": True, "message": "Expense saved successfully", "entry": entry}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/predict", methods=["POST"])
def predict():
    try:
        data = request.get_json()
        description = data.get("description")
        if not description:
            return jsonify({"error": "Description is required"}), 400
        category = predict_category(description)
        return jsonify({"description": description, "predicted_category": category})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/upload", methods=["POST"])
def upload():
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400
        df = pd.read_csv(file)
        results = []
        for _, row in df.iterrows():
            description = str(row.get("description", ""))
            amount = float(row.get("amount", 0))
            date = str(row.get("date", ""))
            category = smart_category(description)  # ← FIXED: was predict_category
            is_unusual = amount > 3000
            results.append({
                "date": date, "description": description, "amount": amount,
                "category": category, "status": "Unusual" if is_unusual else "Normal",
                "is_unusual": is_unusual,
            })

        store.transactions_store = results

        total = sum(r["amount"] for r in results)
        cat_totals = {}
        for r in results:
            cat_totals[r["category"]] = cat_totals.get(r["category"], 0) + r["amount"]
        categories = [{"category": k, "amount": round(v, 2)} for k, v in sorted(cat_totals.items(), key=lambda x: -x[1])]
        top = categories[0] if categories else {"category": "-", "amount": 0}
        unusual = [r for r in results if r["is_unusual"]]
        unusual_msg = None
        if unusual:
            u = unusual[0]
            unusual_msg = f"You spent ₹{u['amount']} on {u['category']} — higher than usual."
        return jsonify({
            "total_expense": round(total, 2), "total_transactions": len(results),
            "unusual_count": len(unusual), "top_category": top["category"],
            "top_category_amount": top["amount"], "categories": categories,
            "transactions": results,
            "insights": {"unusual_msg": unusual_msg, "prediction_msg": "You're likely to overspend this weekend based on your pattern.", "prediction_range": "₹6,200 – ₹7,100"}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def smart_category(description):
    desc = description.lower()

    # Cash
    if any(k in desc for k in ["atm", "cash withdrawal", "cash deposit"]): return "Cash"

    # Income
    if any(k in desc for k in ["salary", "neft credit", "rtgs credit", "imps credit", "stipend"]): return "Income"

    # Transfers — person-name UPI pattern (e.g. TANUSREE/SBIN/..., MR BRAJA/YESB/...)
    if re.search(r"^upi/(cr|dr)/\d+/", desc) and not any(k in desc for k in ["zomato", "swiggy", "food", "restaurant", "cafe", "blinkit", "zepto", "bigbasket", "grocer", "netflix", "hotstar", "spotify", "amazon", "flipkart"]): return "Transfers"

    # Transfers — explicit keywords
    if any(k in desc for k in ["upi payment to", "upi received from", "upi transfer", "sent to", "received from", "neft", "imps", "rtgs"]): return "Transfers"

    # Food & Dining
    if any(k in desc for k in ["zomato", "swiggy", "food", "restaurant", "cafe", "hotel", "dining", "dominos", "pizza", "burger", "kfc", "mcdonalds", "blinkit", "zepto", "instamart", "bigbasket", "grocer", "tapoban", "indian r/", "ms arpita", "maa durg"]): return "Food & Dining"

    # Shopping
    if any(k in desc for k in ["amazon", "flipkart", "myntra", "meesho", "nykaa", "ajio", "pantaloo", "shopping", "mall", "store", "market"]): return "Shopping"

    # Transport
    if any(k in desc for k in ["uber", "ola", "rapido", "metro", "bus", "train", "irctc", "makemytrip", "cleartrip", "petrol", "fuel", "fastag", "toll", "flight", "indigo", "spicejet"]): return "Transport"

    # Bills & Recharge
    if any(k in desc for k in ["airtel", "jio", "bsnl", "vi ", "vodafone", "recharge", "mobile", "broadband", "internet", "dth", "tatasky", "dish tv", "postpaid", "prepaid"]): return "Bills & Recharge"

    # Utilities
    if any(k in desc for k in ["electricity", "water", "gas", "bill", "utility", "bescom", "mseb", "wbsedcl", "tata power", "adani"]): return "Utilities"

    # Health
    if any(k in desc for k in ["medical", "pharmacy", "hospital", "doctor", "clinic", "health", "apollo", "netmeds", "pharmeasy", "1mg", "lab"]): return "Health"

    # Education
    if any(k in desc for k in ["school", "college", "university", "education", "fees", "tuition", "udemy", "coursera", "byju", "unacademy"]): return "Education"

    # Entertainment
    if any(k in desc for k in ["netflix", "hotstar", "prime video", "spotify", "youtube", "movie", "cinema", "pvr", "inox", "bookmyshow", "gaming", "googleandroidapps", "google play"]): return "Entertainment"

    # Rent & Housing
    if any(k in desc for k in ["rent", "housing", "maintenance", "society", "landlord"]): return "Rent & Housing"

    # Fallback to ML model
    return predict_category(description)


def clean_gemini_json(raw_text):
    text = raw_text.strip()
    text = re.sub(r"```(?:json)?[\s\S]*?```", lambda m: m.group(0)[m.group(0).find("["):m.group(0).rfind("]")+1], text)
    match = re.search(r"\[[\s\S]*\]", text)
    if match:
        return match.group(0)
    return text


def parse_chunk(chunk, retries=3):
    import time
    prompt = (
        "You are an expert Indian bank statement parser (SBI, HDFC, ICICI, Axis, etc).\n\n"
        "Extract ALL financial transactions from the text below.\n\n"
        "Return ONLY a valid JSON array — no markdown, no explanation, no code fences.\n"
        'Example: [{"date":"01/04/2025","description":"UPI payment to TANUSREE","amount":235.00,"type":"debit"}]\n\n'
        "Rules:\n- amount: positive float\n- type: debit or credit\n- date: DD/MM/YYYY\n- SKIP balance rows\n\n"
        "Bank statement text:\n" + chunk
    )
    for attempt in range(retries):
        try:
            response = gemini_model.generate_content(prompt)
            raw = response.text.strip()
            cleaned = clean_gemini_json(raw)
            parsed = json.loads(cleaned)
            return parsed
        except json.JSONDecodeError:
            if attempt < retries - 1: time.sleep(5)
        except Exception as e:
            err_str = str(e)
            if "429" in err_str or "quota" in err_str.lower():
                time.sleep(20 * (attempt + 1))
            elif attempt < retries - 1:
                time.sleep(5)
    return []


@app.route("/upload-pdf", methods=["POST"])
def upload_pdf():
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400
        password = request.form.get("password", None)
        file_bytes = file.read()
        if password:
            reader = PdfReader(io.BytesIO(file_bytes))
            if reader.is_encrypted:
                reader.decrypt(password)
            decrypted_bytes = io.BytesIO()
            writer = PdfWriter()
            for page in reader.pages:
                writer.add_page(page)
            writer.write(decrypted_bytes)
            decrypted_bytes.seek(0)
            file_bytes = decrypted_bytes.read()
        pages_text = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text and page_text.strip():
                    pages_text.append(page_text)
        if not pages_text:
            return jsonify({"error": "Could not extract text from PDF."}), 400
        full_text = "\n".join(pages_text)
        CHUNK_SIZE, OVERLAP = 30000, 200
        text_chunks, start = [], 0
        while start < len(full_text):
            text_chunks.append(full_text[start:start+CHUNK_SIZE])
            start += CHUNK_SIZE - OVERLAP
        import time
        all_parsed, seen_keys = [], set()
        for i, chunk in enumerate(text_chunks):
            for txn in parse_chunk(chunk):
                key = (str(txn.get("date", "")), str(txn.get("amount", "")))
                if key not in seen_keys:
                    seen_keys.add(key)
                    all_parsed.append(txn)
            if i < len(text_chunks) - 1:
                time.sleep(35)
        if not all_parsed:
            return jsonify({"error": "Gemini could not parse any transactions."}), 400
        results = []
        for txn in all_parsed:
            description = str(txn.get("description") or "").strip()
            date = str(txn.get("date") or "").strip()
            txn_type = str(txn.get("type") or "debit").lower()
            try:
                amount = abs(float(txn.get("amount", 0)))
            except:
                amount = 0.0
            if not description or amount == 0:
                continue
            is_unusual = amount > 3000
            results.append({
                "date": date, "description": description, "amount": amount,
                "category": smart_category(description), "type": txn_type,
                "status": "Unusual" if is_unusual else "Normal", "is_unusual": is_unusual,
            })
        if not results:
            return jsonify({"error": "Could not parse any valid transactions."}), 400
        expense_results = [r for r in results if r.get("type") == "debit"] or results

        store.transactions_store = results

        total = sum(r["amount"] for r in expense_results)
        cat_totals = {}
        for r in expense_results:
            cat_totals[r["category"]] = cat_totals.get(r["category"], 0) + r["amount"]
        categories = [{"category": k, "amount": round(v, 2)} for k, v in sorted(cat_totals.items(), key=lambda x: -x[1])]
        top = categories[0] if categories else {"category": "-", "amount": 0}
        unusual = [r for r in expense_results if r["is_unusual"]]
        unusual_msg = f"You spent ₹{unusual[0]['amount']} on {unusual[0]['category']} — higher than usual." if unusual else None
        return jsonify({
            "total_expense": round(total, 2), "total_transactions": len(results),
            "unusual_count": len(unusual), "top_category": top["category"],
            "top_category_amount": top["amount"], "categories": categories,
            "transactions": results,
            "insights": {"unusual_msg": unusual_msg, "prediction_msg": "You're likely to overspend this weekend.", "prediction_range": "₹6,200 – ₹7,100"}
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ask-ai", methods=["POST"])
def ask_ai():
    try:
        data = request.get_json()
        question = data.get("question", "").strip()
        if not question:
            return jsonify({"error": "Question is required"}), 400
        system_prompt = """You are a helpful AI finance assistant for Spendwise AI.
- Respond in the same language the user uses (Hindi or English)
- Keep answers short and practical (max 3-4 sentences)
- Use rupee symbol for Indian currency
- Focus on personal finance, budgeting, and expense analysis"""
        response = gemini_model.generate_content(f"{system_prompt}\n\nUser question: {question}")
        return jsonify({"answer": response.text.strip()})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    app.run(debug=True, port=8000, threaded=True)
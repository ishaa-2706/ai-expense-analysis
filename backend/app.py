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

# ── NEW: DB imports ──────────────────────────────────────────────────────────
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import (
    JWTManager, create_access_token, jwt_required, get_jwt_identity
)
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
# ────────────────────────────────────────────────────────────────────────────

# ── NEW: Firebase Admin SDK (for Google/Apple sign-in verification) ─────────
import firebase_admin
from firebase_admin import credentials, auth as firebase_auth

firebase_creds_json = os.environ.get("FIREBASE_SERVICE_ACCOUNT_JSON")
if firebase_creds_json:
    try:
        firebase_creds_dict = json.loads(firebase_creds_json)
        cred = credentials.Certificate(firebase_creds_dict)
        firebase_admin.initialize_app(cred)
        print("[firebase] Admin SDK initialized successfully.")
    except Exception as e:
        print(f"[firebase] Failed to initialize Admin SDK: {e}")
else:
    print("[firebase] WARNING: FIREBASE_SERVICE_ACCOUNT_JSON not set. Google/Apple login will not work.")
# ────────────────────────────────────────────────────────────────────────────

app = Flask(__name__)
CORS(app, origins=[
    "https://spendwise-expense-analyzer.netlify.app",
    "http://localhost:5173"
], supports_credentials=True)

# ── NEW: App config ──────────────────────────────────────────────────────────
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL", "sqlite:///spendwise.db")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-secret-key-change-in-prod")
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = timedelta(days=7)

db = SQLAlchemy(app)
migrate = Migrate(app, db)
jwt = JWTManager(app)
# ────────────────────────────────────────────────────────────────────────────

import store
from financial_score import financial_score_bp
app.register_blueprint(financial_score_bp)

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)
gemini_model = genai.GenerativeModel("models/gemini-2.5-flash")


# ════════════════════════════════════════════════════════════════════════════
# DATABASE MODELS
# ════════════════════════════════════════════════════════════════════════════

class User(db.Model):
    __tablename__ = "users"
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100))
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    uploads       = db.relationship("Upload",           backref="user", lazy=True, cascade="all, delete-orphan")
    transactions  = db.relationship("Transaction",      backref="user", lazy=True, cascade="all, delete-orphan")
    cash_expenses = db.relationship("CashExpense",      backref="user", lazy=True, cascade="all, delete-orphan")
    goals         = db.relationship("Goal",             backref="user", lazy=True, cascade="all, delete-orphan")
    alerts        = db.relationship("Alert",            backref="user", lazy=True, cascade="all, delete-orphan")


class Upload(db.Model):
    __tablename__ = "uploads"
    id                 = db.Column(db.Integer, primary_key=True)
    user_id            = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    filename           = db.Column(db.Text)
    total_transactions = db.Column(db.Integer)
    total_expense      = db.Column(db.Numeric(12, 2))
    unusual_count      = db.Column(db.Integer)
    top_category       = db.Column(db.String(100))
    uploaded_at        = db.Column(db.DateTime, default=datetime.utcnow)

    transactions = db.relationship("Transaction", backref="upload", lazy=True, cascade="all, delete-orphan")


class Transaction(db.Model):
    __tablename__ = "transactions"
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=True)
    upload_id   = db.Column(db.Integer, db.ForeignKey("uploads.id"), nullable=True)
    date        = db.Column(db.String(20))
    description = db.Column(db.Text)
    amount      = db.Column(db.Numeric(12, 2))
    category    = db.Column(db.String(100))
    type        = db.Column(db.String(10))    # debit / credit
    status      = db.Column(db.String(20))    # Normal / Unusual
    is_unusual  = db.Column(db.Boolean, default=False)
    source      = db.Column(db.String(20))    # pdf / csv
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)


class CashExpense(db.Model):
    __tablename__ = "cash_expenses"
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    label      = db.Column(db.Text, nullable=False)
    amount     = db.Column(db.Numeric(12, 2), nullable=False)
    category   = db.Column(db.String(100))
    date       = db.Column(db.String(20))
    synced     = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Goal(db.Model):
    __tablename__ = "goals"
    id            = db.Column(db.Integer, primary_key=True)
    user_id       = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title         = db.Column(db.Text, nullable=False)
    target_amount = db.Column(db.Numeric(12, 2), nullable=False)
    saved_amount  = db.Column(db.Numeric(12, 2), default=0)
    deadline      = db.Column(db.String(20))
    status        = db.Column(db.String(20), default="active")  # active / completed
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    contributions = db.relationship("GoalContribution", backref="goal", lazy=True, cascade="all, delete-orphan")


class GoalContribution(db.Model):
    __tablename__ = "goal_contributions"
    id         = db.Column(db.Integer, primary_key=True)
    goal_id    = db.Column(db.Integer, db.ForeignKey("goals.id"), nullable=False)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    amount     = db.Column(db.Numeric(12, 2), nullable=False)
    note       = db.Column(db.Text)
    date       = db.Column(db.String(20))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Alert(db.Model):
    __tablename__ = "alerts"
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    message    = db.Column(db.Text)
    type       = db.Column(db.String(50))    # unusual_spend / goal_reminder
    is_read    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


# ════════════════════════════════════════════════════════════════════════════
# AUTH ROUTES  (email/password)
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if not data or not data.get("email") or not data.get("password"):
        return jsonify({"error": "Email and password are required"}), 400

    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400

    user = User(
        name=data.get("name", ""),
        email=data["email"],
        password_hash=generate_password_hash(data["password"]),
    )
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }), 201


@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "No data provided"}), 400

    user = User.query.filter_by(email=data.get("email")).first()
    if not user or not check_password_hash(user.password_hash, data.get("password", "")):
        return jsonify({"error": "Invalid email or password"}), 401

    token = create_access_token(identity=str(user.id))
    return jsonify({
        "token": token,
        "user": {"id": user.id, "name": user.name, "email": user.email}
    }), 200


@app.route("/api/me", methods=["GET"])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    return jsonify({"id": user.id, "name": user.name, "email": user.email}), 200


# ════════════════════════════════════════════════════════════════════════════
# AUTH ROUTES  (NEW: Google / Apple sign-in via Firebase ID token)
# ════════════════════════════════════════════════════════════════════════════

def _verify_firebase_and_issue_jwt(id_token):
    """
    Shared helper: verifies a Firebase ID token, finds-or-creates the
    matching User row, and returns (jwt_token, user_dict).
    Raises ValueError on invalid token.
    """
    try:
        decoded = firebase_auth.verify_id_token(id_token)
    except Exception as e:
        raise ValueError(f"Invalid Firebase ID token: {str(e)}")

    email = decoded.get("email")
    name  = decoded.get("name", "") or (email.split("@")[0] if email else "User")

    if not email:
        raise ValueError("Firebase token did not contain an email address")

    user = User.query.filter_by(email=email).first()
    if not user:
        # Social-login users get a random unusable password hash —
        # they will only ever authenticate via Firebase, not email/password.
        user = User(
            name=name,
            email=email,
            password_hash=generate_password_hash(os.urandom(16).hex()),
        )
        db.session.add(user)
        db.session.commit()

    token = create_access_token(identity=str(user.id))
    user_dict = {"id": user.id, "name": user.name, "email": user.email}
    return token, user_dict


@app.route("/api/auth/google", methods=["POST"])
def google_login():
    data = request.get_json()
    id_token = data.get("idToken") if data else None
    if not id_token:
        return jsonify({"error": "idToken is required"}), 400

    try:
        token, user_dict = _verify_firebase_and_issue_jwt(id_token)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    return jsonify({"token": token, "user": user_dict}), 200


@app.route("/api/auth/apple", methods=["POST"])
def apple_login():
    data = request.get_json()
    id_token = data.get("idToken") if data else None
    if not id_token:
        return jsonify({"error": "idToken is required"}), 400

    try:
        token, user_dict = _verify_firebase_and_issue_jwt(id_token)
    except ValueError as e:
        return jsonify({"error": str(e)}), 401

    return jsonify({"token": token, "user": user_dict}), 200


# ════════════════════════════════════════════════════════════════════════════
# EXISTING ROUTES  (unchanged logic — DB saving added where marked NEW)
# ════════════════════════════════════════════════════════════════════════════

@app.route("/")
def home():
    return "Flask ML API running"


@app.route("/health", methods=["GET", "HEAD"])
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/api/manual-expense", methods=["POST"])
@jwt_required(optional=True)                           # NEW: optional auth
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

        entry = {
            "id": data.get("id"), "label": label, "amount": amount,
            "category": category, "date": date, "synced": True
        }

        # ── NEW: Save to DB if user is logged in ────────────────────────────
        user_id = get_jwt_identity()
        if user_id:
            cash_exp = CashExpense(
                user_id=int(user_id),
                label=label,
                amount=amount,
                category=category,
                date=date,
                synced=True,
            )
            db.session.add(cash_exp)
            db.session.commit()
            entry["id"] = cash_exp.id
        # ────────────────────────────────────────────────────────────────────

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
@jwt_required(optional=True)                           # NEW: optional auth
def upload():
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        df = pd.read_csv(file)
        results = []
        for _, row in df.iterrows():
            description = str(row.get("description", ""))
            amount      = float(row.get("amount", 0))
            date        = str(row.get("date", ""))
            category    = smart_category(description)
            is_unusual  = amount > 3000
            results.append({
                "date": date, "description": description, "amount": amount,
                "category": category, "status": "Unusual" if is_unusual else "Normal",
                "is_unusual": is_unusual,
            })

        store.transactions_store = results

        total      = sum(r["amount"] for r in results)
        cat_totals = {}
        for r in results:
            cat_totals[r["category"]] = cat_totals.get(r["category"], 0) + r["amount"]
        categories  = [{"category": k, "amount": round(v, 2)} for k, v in sorted(cat_totals.items(), key=lambda x: -x[1])]
        top         = categories[0] if categories else {"category": "-", "amount": 0}
        unusual     = [r for r in results if r["is_unusual"]]
        unusual_msg = None
        if unusual:
            u = unusual[0]
            unusual_msg = f"You spent ₹{u['amount']} on {u['category']} — higher than usual."

        # ── NEW: Save upload session + transactions to DB ───────────────────
        user_id = get_jwt_identity()
        if user_id:
            upload_rec = Upload(
                user_id=int(user_id),
                filename=file.filename,
                total_transactions=len(results),
                total_expense=round(total, 2),
                unusual_count=len(unusual),
                top_category=top["category"],
            )
            db.session.add(upload_rec)
            db.session.flush()   # get upload_rec.id before commit

            for r in results:
                txn = Transaction(
                    user_id=int(user_id),
                    upload_id=upload_rec.id,
                    date=r["date"],
                    description=r["description"],
                    amount=r["amount"],
                    category=r["category"],
                    type="debit",
                    status=r["status"],
                    is_unusual=r["is_unusual"],
                    source="csv",
                )
                db.session.add(txn)

            db.session.commit()
        # ────────────────────────────────────────────────────────────────────

        return jsonify({
            "total_expense": round(total, 2), "total_transactions": len(results),
            "unusual_count": len(unusual), "top_category": top["category"],
            "top_category_amount": top["amount"], "categories": categories,
            "transactions": results,
            "insights": {
                "unusual_msg": unusual_msg,
                "prediction_msg": "You're likely to overspend this weekend based on your pattern.",
                "prediction_range": "₹6,200 – ₹7,100"
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


def smart_category(description):
    desc = description.lower()
    if any(k in desc for k in ["atm", "cash withdrawal", "cash deposit"]): return "Cash"
    if any(k in desc for k in ["salary", "neft credit", "rtgs credit", "imps credit", "stipend"]): return "Income"
    if re.search(r"^upi/(cr|dr)/\d+/", desc) and not any(k in desc for k in ["zomato", "swiggy", "food", "restaurant", "cafe", "blinkit", "zepto", "bigbasket", "grocer", "netflix", "hotstar", "spotify", "amazon", "flipkart"]): return "Transfers"
    if any(k in desc for k in ["upi payment to", "upi received from", "upi transfer", "sent to", "received from", "neft", "imps", "rtgs"]): return "Transfers"
    if any(k in desc for k in ["zomato", "swiggy", "food", "restaurant", "cafe", "hotel", "dining", "dominos", "pizza", "burger", "kfc", "mcdonalds", "blinkit", "zepto", "instamart", "bigbasket", "grocer", "tapoban", "indian r/", "ms arpita", "maa durg"]): return "Food & Dining"
    if any(k in desc for k in ["amazon", "flipkart", "myntra", "meesho", "nykaa", "ajio", "pantaloo", "shopping", "mall", "store", "market"]): return "Shopping"
    if any(k in desc for k in ["uber", "ola", "rapido", "metro", "bus", "train", "irctc", "makemytrip", "cleartrip", "petrol", "fuel", "fastag", "toll", "flight", "indigo", "spicejet"]): return "Transport"
    if any(k in desc for k in ["airtel", "jio", "bsnl", "vi ", "vodafone", "recharge", "mobile", "broadband", "internet", "dth", "tatasky", "dish tv", "postpaid", "prepaid"]): return "Bills & Recharge"
    if any(k in desc for k in ["electricity", "water", "gas", "bill", "utility", "bescom", "mseb", "wbsedcl", "tata power", "adani"]): return "Utilities"
    if any(k in desc for k in ["medical", "pharmacy", "hospital", "doctor", "clinic", "health", "apollo", "netmeds", "pharmeasy", "1mg", "lab"]): return "Health"
    if any(k in desc for k in ["school", "college", "university", "education", "fees", "tuition", "udemy", "coursera", "byju", "unacademy"]): return "Education"
    if any(k in desc for k in ["netflix", "hotstar", "prime video", "spotify", "youtube", "movie", "cinema", "pvr", "inox", "bookmyshow", "gaming", "googleandroidapps", "google play"]): return "Entertainment"
    if any(k in desc for k in ["rent", "housing", "maintenance", "society", "landlord"]): return "Rent & Housing"
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
            raw      = response.text.strip()
            cleaned  = clean_gemini_json(raw)
            parsed   = json.loads(cleaned)
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
@jwt_required(optional=True)                           # NEW: optional auth
def upload_pdf():
    try:
        file = request.files.get("file")
        if not file:
            return jsonify({"error": "No file uploaded"}), 400

        password   = request.form.get("password", None)
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

        full_text   = "\n".join(pages_text)
        CHUNK_SIZE, OVERLAP = 30000, 200
        text_chunks, start  = [], 0
        while start < len(full_text):
            text_chunks.append(full_text[start:start + CHUNK_SIZE])
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
            date        = str(txn.get("date") or "").strip()
            txn_type    = str(txn.get("type") or "debit").lower()
            try:
                amount = abs(float(txn.get("amount", 0)))
            except Exception:
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

        total      = sum(r["amount"] for r in expense_results)
        cat_totals = {}
        for r in expense_results:
            cat_totals[r["category"]] = cat_totals.get(r["category"], 0) + r["amount"]
        categories  = [{"category": k, "amount": round(v, 2)} for k, v in sorted(cat_totals.items(), key=lambda x: -x[1])]
        top         = categories[0] if categories else {"category": "-", "amount": 0}
        unusual     = [r for r in expense_results if r["is_unusual"]]
        unusual_msg = f"You spent ₹{unusual[0]['amount']} on {unusual[0]['category']} — higher than usual." if unusual else None

        # ── NEW: Save upload session + transactions to DB ───────────────────
        user_id = get_jwt_identity()
        if user_id:
            upload_rec = Upload(
                user_id=int(user_id),
                filename=file.filename,
                total_transactions=len(results),
                total_expense=round(total, 2),
                unusual_count=len(unusual),
                top_category=top["category"],
            )
            db.session.add(upload_rec)
            db.session.flush()   # get upload_rec.id before commit

            for r in results:
                txn = Transaction(
                    user_id=int(user_id),
                    upload_id=upload_rec.id,
                    date=r["date"],
                    description=r["description"],
                    amount=r["amount"],
                    category=r["category"],
                    type=r.get("type", "debit"),
                    status=r["status"],
                    is_unusual=r["is_unusual"],
                    source="pdf",
                )
                db.session.add(txn)

            # Generate alert for unusual spends
            if unusual:
                alert = Alert(
                    user_id=int(user_id),
                    message=unusual_msg,
                    type="unusual_spend",
                )
                db.session.add(alert)

            db.session.commit()
        # ────────────────────────────────────────────────────────────────────

        return jsonify({
            "total_expense": round(total, 2), "total_transactions": len(results),
            "unusual_count": len(unusual), "top_category": top["category"],
            "top_category_amount": top["amount"], "categories": categories,
            "transactions": results,
            "insights": {
                "unusual_msg": unusual_msg,
                "prediction_msg": "You're likely to overspend this weekend.",
                "prediction_range": "₹6,200 – ₹7,100"
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/api/ask-ai", methods=["POST"])
def ask_ai():
    try:
        data     = request.get_json()
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


# ════════════════════════════════════════════════════════════════════════════
# GOAL ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/goals", methods=["GET"])
@jwt_required()
def get_goals():
    user_id = int(get_jwt_identity())
    goals   = Goal.query.filter_by(user_id=user_id).all()
    return jsonify([{
        "id": g.id, "title": g.title,
        "target_amount": float(g.target_amount),
        "saved_amount":  float(g.saved_amount),
        "deadline": g.deadline, "status": g.status,
        "created_at": g.created_at.isoformat(),
    } for g in goals]), 200


@app.route("/api/goals", methods=["POST"])
@jwt_required()
def create_goal():
    user_id = int(get_jwt_identity())
    data    = request.get_json()
    if not data or not data.get("title") or not data.get("target_amount"):
        return jsonify({"error": "title and target_amount are required"}), 400

    goal = Goal(
        user_id=user_id,
        title=data["title"],
        target_amount=float(data["target_amount"]),
        saved_amount=float(data.get("saved_amount", 0)),
        deadline=data.get("deadline", ""),
        status="active",
    )
    db.session.add(goal)
    db.session.commit()
    return jsonify({
        "id": goal.id, "title": goal.title,
        "target_amount": float(goal.target_amount),
        "saved_amount": float(goal.saved_amount),
        "deadline": goal.deadline, "status": goal.status
    }), 201


@app.route("/api/goals/<int:goal_id>/contribute", methods=["POST"])
@jwt_required()
def contribute_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal    = Goal.query.filter_by(id=goal_id, user_id=user_id).first_or_404()
    data    = request.get_json()
    amount  = float(data.get("amount", 0))
    if amount <= 0:
        return jsonify({"error": "Amount must be positive"}), 400

    contribution = GoalContribution(
        goal_id=goal_id, user_id=user_id,
        amount=amount, note=data.get("note", ""),
        date=data.get("date", datetime.utcnow().strftime("%Y-%m-%d")),
    )
    goal.saved_amount = float(goal.saved_amount) + amount
    if float(goal.saved_amount) >= float(goal.target_amount):
        goal.status = "completed"

    db.session.add(contribution)
    db.session.commit()
    return jsonify({
        "success": True,
        "saved_amount": float(goal.saved_amount),
        "status": goal.status,
        "remaining": max(0, float(goal.target_amount) - float(goal.saved_amount)),
    }), 200


@app.route("/api/goals/<int:goal_id>", methods=["DELETE"])
@jwt_required()
def delete_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal    = Goal.query.filter_by(id=goal_id, user_id=user_id).first_or_404()
    db.session.delete(goal)
    db.session.commit()
    return jsonify({"success": True}), 200


# ════════════════════════════════════════════════════════════════════════════
# CASH TRACKER ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/cash-expenses", methods=["GET"])
@jwt_required()
def get_cash_expenses():
    user_id  = int(get_jwt_identity())
    expenses = CashExpense.query.filter_by(user_id=user_id).order_by(CashExpense.created_at.desc()).all()
    return jsonify([{
        "id": e.id, "label": e.label, "amount": float(e.amount),
        "category": e.category, "date": e.date, "synced": e.synced,
        "created_at": e.created_at.isoformat(),
    } for e in expenses]), 200


@app.route("/api/cash-expenses/sync", methods=["POST"])
@jwt_required()
def sync_cash_expenses():
    """Bulk-sync offline cash expenses from the frontend."""
    user_id = int(get_jwt_identity())
    data    = request.get_json()
    entries = data.get("expenses", [])
    saved   = 0
    for item in entries:
        try:
            exp = CashExpense(
                user_id=user_id,
                label=item.get("label", ""),
                amount=float(item.get("amount", 0)),
                category=item.get("category", "Others"),
                date=item.get("date", ""),
                synced=True,
            )
            db.session.add(exp)
            saved += 1
        except Exception:
            continue
    db.session.commit()
    return jsonify({"success": True, "saved": saved}), 200


@app.route("/api/cash-expenses/<int:exp_id>", methods=["DELETE"])
@jwt_required()
def delete_cash_expense(exp_id):
    user_id = int(get_jwt_identity())
    exp     = CashExpense.query.filter_by(id=exp_id, user_id=user_id).first_or_404()
    db.session.delete(exp)
    db.session.commit()
    return jsonify({"success": True}), 200


# ════════════════════════════════════════════════════════════════════════════
# HISTORY & ALERTS ROUTES
# ════════════════════════════════════════════════════════════════════════════

@app.route("/api/history", methods=["GET"])
@jwt_required()
def get_history():
    user_id = int(get_jwt_identity())
    uploads = Upload.query.filter_by(user_id=user_id).order_by(Upload.uploaded_at.desc()).all()
    return jsonify([{
        "id": u.id, "filename": u.filename,
        "total_transactions": u.total_transactions,
        "total_expense": float(u.total_expense or 0),
        "unusual_count": u.unusual_count,
        "top_category": u.top_category,
        "uploaded_at": u.uploaded_at.isoformat(),
    } for u in uploads]), 200


@app.route("/api/history/<int:upload_id>/transactions", methods=["GET"])
@jwt_required()
def get_upload_transactions(upload_id):
    user_id = int(get_jwt_identity())
    Upload.query.filter_by(id=upload_id, user_id=user_id).first_or_404()
    txns = Transaction.query.filter_by(upload_id=upload_id).all()
    return jsonify([{
        "id": t.id, "date": t.date, "description": t.description,
        "amount": float(t.amount), "category": t.category,
        "type": t.type, "status": t.status, "is_unusual": t.is_unusual,
    } for t in txns]), 200


@app.route("/api/alerts", methods=["GET"])
@jwt_required()
def get_alerts():
    user_id = int(get_jwt_identity())
    alerts  = Alert.query.filter_by(user_id=user_id).order_by(Alert.created_at.desc()).limit(20).all()
    return jsonify([{
        "id": a.id, "message": a.message, "type": a.type,
        "is_read": a.is_read, "created_at": a.created_at.isoformat(),
    } for a in alerts]), 200


@app.route("/api/alerts/<int:alert_id>/read", methods=["PATCH"])
@jwt_required()
def mark_alert_read(alert_id):
    user_id = int(get_jwt_identity())
    alert   = Alert.query.filter_by(id=alert_id, user_id=user_id).first_or_404()
    alert.is_read = True
    db.session.commit()
    return jsonify({"success": True}), 200


# ════════════════════════════════════════════════════════════════════════════
# RUN
# ════════════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    app.run(debug=True, port=8000, threaded=True)
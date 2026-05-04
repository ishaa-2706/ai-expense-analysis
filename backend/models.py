from flask_sqlalchemy import SQLAlchemy
from datetime import datetime

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = "users"
    id            = db.Column(db.Integer, primary_key=True)
    name          = db.Column(db.String(100))
    email         = db.Column(db.String(150), unique=True, nullable=False)
    password_hash = db.Column(db.Text, nullable=False)
    created_at    = db.Column(db.DateTime, default=datetime.utcnow)

    uploads       = db.relationship("Upload", backref="user", lazy=True, cascade="all, delete")
    transactions  = db.relationship("Transaction", backref="user", lazy=True, cascade="all, delete")
    cash_expenses = db.relationship("CashExpense", backref="user", lazy=True, cascade="all, delete")
    goals         = db.relationship("Goal", backref="user", lazy=True, cascade="all, delete")
    alerts        = db.relationship("Alert", backref="user", lazy=True, cascade="all, delete")


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

    transactions = db.relationship("Transaction", backref="upload", lazy=True, cascade="all, delete")


class Transaction(db.Model):
    __tablename__ = "transactions"
    id          = db.Column(db.Integer, primary_key=True)
    user_id     = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    upload_id   = db.Column(db.Integer, db.ForeignKey("uploads.id"), nullable=True)
    date        = db.Column(db.String(20))
    description = db.Column(db.Text)
    amount      = db.Column(db.Numeric(12, 2))
    category    = db.Column(db.String(100))
    type        = db.Column(db.String(10))       # debit / credit
    status      = db.Column(db.String(20))       # Normal / Unusual
    is_unusual  = db.Column(db.Boolean, default=False)
    source      = db.Column(db.String(20))       # pdf / csv
    created_at  = db.Column(db.DateTime, default=datetime.utcnow)


class CashExpense(db.Model):
    __tablename__ = "cash_expenses"
    id         = db.Column(db.Integer, primary_key=True)
    user_id    = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    label      = db.Column(db.Text, nullable=False)
    amount     = db.Column(db.Numeric(12, 2), nullable=False)
    category   = db.Column(db.String(100))
    date       = db.Column(db.String(20))
    synced     = db.Column(db.Boolean, default=False)   # for offline sync
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Goal(db.Model):
    __tablename__ = "goals"
    id             = db.Column(db.Integer, primary_key=True)
    user_id        = db.Column(db.Integer, db.ForeignKey("users.id"), nullable=False)
    title          = db.Column(db.Text, nullable=False)
    target_amount  = db.Column(db.Numeric(12, 2), nullable=False)
    saved_amount   = db.Column(db.Numeric(12, 2), default=0)
    deadline       = db.Column(db.String(20))
    status         = db.Column(db.String(20), default="active")  # active / completed / cancelled
    created_at     = db.Column(db.DateTime, default=datetime.utcnow)

    contributions = db.relationship("GoalContribution", backref="goal", lazy=True, cascade="all, delete")


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
    type       = db.Column(db.String(50))    # unusual_spend / goal_reminder / budget_warning
    is_read    = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
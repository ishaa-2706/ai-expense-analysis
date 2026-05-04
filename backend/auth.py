from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import create_access_token
from models import db, User

auth_bp = Blueprint("auth", __name__)

@auth_bp.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()
    if User.query.filter_by(email=data["email"]).first():
        return jsonify({"error": "Email already registered"}), 400
    user = User(
        name=data.get("name", ""),
        email=data["email"],
        password_hash=generate_password_hash(data["password"])
    )
    db.session.add(user)
    db.session.commit()
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}), 201

@auth_bp.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()
    user = User.query.filter_by(email=data["email"]).first()
    if not user or not check_password_hash(user.password_hash, data["password"]):
        return jsonify({"error": "Invalid email or password"}), 401
    token = create_access_token(identity=str(user.id))
    return jsonify({"token": token, "user": {"id": user.id, "name": user.name, "email": user.email}}), 200
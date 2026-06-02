from __future__ import annotations

import json
import uuid
from dataclasses import dataclass
from datetime import datetime
from pathlib import Path

from app.core.config import BASE_DIR


AUTH_STORE_DIR = BASE_DIR / "data"
AUTH_STORE_PATH = AUTH_STORE_DIR / "users.json"


@dataclass
class LocalUserRecord:
    id: str
    email: str
    hashed_password: str
    created_at: str


def _ensure_store() -> None:
    AUTH_STORE_DIR.mkdir(parents=True, exist_ok=True)
    if not AUTH_STORE_PATH.exists():
        AUTH_STORE_PATH.write_text("[]", encoding="utf-8")


def _load_users() -> list[dict]:
    _ensure_store()
    try:
        raw = AUTH_STORE_PATH.read_text(encoding="utf-8").strip()
        if not raw:
            return []
        data = json.loads(raw)
        return data if isinstance(data, list) else []
    except json.JSONDecodeError:
        return []


def _save_users(users: list[dict]) -> None:
    _ensure_store()
    AUTH_STORE_PATH.write_text(json.dumps(users, indent=2), encoding="utf-8")


def get_local_user(email: str) -> LocalUserRecord | None:
    normalized_email = email.strip().lower()
    for user in _load_users():
        if user.get("email") == normalized_email:
            return LocalUserRecord(
                id=user.get("id", ""),
                email=user["email"],
                hashed_password=user["hashed_password"],
                created_at=user.get("created_at", datetime.utcnow().isoformat()),
            )
    return None


def create_local_user(email: str, hashed_password: str) -> LocalUserRecord:
    normalized_email = email.strip().lower()
    users = _load_users()

    if any(user.get("email") == normalized_email for user in users):
        raise ValueError("Email already registered")

    record = {
        "id": uuid.uuid4().hex,
        "email": normalized_email,
        "hashed_password": hashed_password,
        "created_at": datetime.utcnow().isoformat(),
    }
    users.append(record)
    _save_users(users)
    return LocalUserRecord(**record)
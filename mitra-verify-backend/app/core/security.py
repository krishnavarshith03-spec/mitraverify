import hashlib
import json
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any, cast

import bcrypt
from jose import JWTError, jwt

from app.core.config import settings
from cryptography.fernet import Fernet
import os

# Enterprise Template Encryption Key
TEMPLATE_ENCRYPTION_KEY = os.environ.get("TEMPLATE_ENCRYPTION_KEY", "oyJDmYHRxu3ewbUgpfFMnu4eTyV51U-_eBmqJtmB0dc=").encode()
fernet = Fernet(TEMPLATE_ENCRYPTION_KEY)

def encrypt_template(template_data: list | dict) -> str:
    """Encrypts a biometric template for secure DB storage."""
    json_data = json.dumps(template_data).encode("utf-8")
    return fernet.encrypt(json_data).decode("utf-8")

def decrypt_template(encrypted_data: str) -> list | dict:
    """Decrypts a biometric template from DB storage."""
    json_data = fernet.decrypt(encrypted_data.encode("utf-8")).decode("utf-8")
    return json.loads(json_data)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        # bcrypt can only hash strings up to 72 bytes. We just truncate or rely on frontend.
        return bcrypt.checkpw(plain_password.encode('utf-8')[:72], hashed_password.encode('utf-8'))
    except Exception:
        return False

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8')[:72], salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire, "type": "access"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode.update({"exp": expire, "type": "refresh"})
    return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

def decode_token(token: str) -> dict[str, Any] | None:
    try:
        return cast(dict[str, Any], jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]))
    except JWTError:
        return None

def decode_supabase_token(token: str) -> dict[str, Any] | None:
    try:
        secret = settings.SUPABASE_JWT_SECRET
        if secret.strip().startswith("{"):
            try:
                secret = json.loads(secret)
            except Exception:
                pass

        if "your-supabase-jwt" in secret or not secret:
            return cast(dict[str, Any], jwt.get_unverified_claims(token))

        # Supabase JWTs use HS256 (Legacy) or ES256/RS256 (New Asymmetric Keys)
        return cast(dict[str, Any], jwt.decode(
            token, 
            secret, 
            algorithms=["HS256", "ES256", "RS256"],
            options={"verify_aud": False}
        ))
    except JWTError:
        return None

def generate_api_key(api_type: str) -> tuple[str, str]:
    """Returns (plaintext_key, key_hash)"""
    prefix_map = {"basic": "mv_basic", "advanced": "mv_adv", "enterprise": "mv_ent"}
    prefix = prefix_map.get(api_type, "mv_key")
    random_part = secrets.token_urlsafe(24)
    plaintext = f"{prefix}_{random_part}"
    key_hash = hashlib.sha256(plaintext.encode()).hexdigest()
    return plaintext, key_hash

def hash_api_key(plaintext_key: str) -> str:
    return hashlib.sha256(plaintext_key.encode()).hexdigest()

def get_key_prefix(plaintext_key: str) -> str:
    parts = plaintext_key.split("_")
    if len(parts) >= 3:
        suffix = parts[-1][-6:]
        return f"{parts[0]}_{parts[1]}...{suffix}"
    return plaintext_key[:12] + "..."

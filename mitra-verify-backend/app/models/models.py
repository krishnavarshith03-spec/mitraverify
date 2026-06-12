import uuid
from datetime import datetime
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Float, ForeignKey, Text, Enum as SAEnum, JSON as JSONType
from sqlalchemy.orm import relationship, backref
# Removed SQLite-specific JSON import; using generic JSONType
from app.core.database import Base
import enum

class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"
    enterprise = "enterprise"

class ApiKeyType(str, enum.Enum):
    basic = "basic"
    advanced = "advanced"
    enterprise = "enterprise"

class VerificationResult(str, enum.Enum):
    pass_ = "pass"
    fail = "fail"
    spoof = "spoof"
    error = "error"

def gen_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=gen_uuid)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255))
    role = Column(SAEnum(UserRole), default=UserRole.user)
    email_verified = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    last_login = Column(DateTime)
    organizations = relationship("Organization", back_populates="owner")
    api_keys = relationship("ApiKey", back_populates="user")
    sessions = relationship("Session", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")
    notifications = relationship("Notification", back_populates="user")

class Organization(Base):
    __tablename__ = "organizations"
    id = Column(String, primary_key=True, default=gen_uuid)
    name = Column(String(255), nullable=False)
    owner_id = Column(String, ForeignKey("users.id"))
    plan = Column(String, default="open")
    monthly_limit = Column(Integer, default=999999)
    created_at = Column(DateTime, default=datetime.utcnow)
    owner = relationship("User", back_populates="organizations")
    api_keys = relationship("ApiKey", back_populates="organization")

class ApiKey(Base):
    __tablename__ = "api_keys"
    id = Column(String, primary_key=True, default=gen_uuid)
    organization_id = Column(String, ForeignKey("organizations.id"), nullable=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    name = Column(String(255), default="My API Key")
    key_prefix = Column(String(50))
    key_hash = Column(String(64), unique=True, nullable=False, index=True)
    api_type = Column(SAEnum(ApiKeyType), nullable=False)
    is_active = Column(Boolean, default=True)
    last_used_at = Column(DateTime)
    request_count = Column(Integer, default=0)
    rate_limit = Column(Integer, default=100)
    expires_at = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="api_keys")
    organization = relationship("Organization", back_populates="api_keys")
    usage_logs = relationship("ApiUsage", back_populates="api_key")
    verification_logs = relationship("VerificationLog", back_populates="api_key")

class ApiUsage(Base):
    __tablename__ = "api_usage"
    id = Column(String, primary_key=True, default=gen_uuid)
    api_key_id = Column(String, ForeignKey("api_keys.id"))
    endpoint = Column(String(255))
    method = Column(String(10))
    status_code = Column(Integer)
    response_time = Column(Float)
    ip_address = Column(String(45))
    user_agent = Column(String(512))
    request_size = Column(Integer)
    response_size = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow)
    api_key = relationship("ApiKey", back_populates="usage_logs")

class VerificationLog(Base):
    __tablename__ = "verification_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    api_key_id = Column(String, ForeignKey("api_keys.id"))
    session_id = Column(String(255))
    api_type = Column(String)
    result = Column(String)
    confidence = Column(Float)
    processing_time = Column(Float)
    checks_performed = Column(JSONType)
    spoof_score = Column(Float, default=0.0)
    deepfake_risk = Column(Float, default=0.0)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow)
    api_key = relationship("ApiKey", back_populates="verification_logs")
    liveness_logs = relationship("LivenessLog", back_populates="verification")

class LivenessLog(Base):
    __tablename__ = "liveness_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    verification_id = Column(String, ForeignKey("verification_logs.id"))
    check_type = Column(String(50))
    passed = Column(Boolean)
    confidence = Column(Float)
    frame_count = Column(Integer)
    duration_ms = Column(Float)
    meta_data = Column(JSONType)
    verification = relationship("VerificationLog", back_populates="liveness_logs")

class Session(Base):
    __tablename__ = "sessions"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    access_token = Column(String(512))
    refresh_token = Column(String(512))
    ip_address = Column(String(45))
    user_agent = Column(String(512))
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime)
    user = relationship("User", back_populates="sessions")

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    action = Column(String(255))
    resource_type = Column(String(100))
    resource_id = Column(String)
    meta_data = Column(JSONType)
    ip_address = Column(String(45))
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="audit_logs")

class Notification(Base):
    __tablename__ = "notifications"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"))
    type = Column(String(100))
    title = Column(String(255))
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="notifications")

class SystemLog(Base):
    __tablename__ = "system_logs"
    id = Column(String, primary_key=True, default=gen_uuid)
    level = Column(String(20))
    message = Column(Text)
    meta_data = Column(JSONType)
    created_at = Column(DateTime, default=datetime.utcnow)


class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    embedding_vector = Column(JSONType, nullable=False)  # Stored as float list in JSON format
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    user = relationship("User", backref="face_embeddings")

# New per‑user face profile (one‑to‑one with User)
class FaceProfile(Base):
    __tablename__ = "face_profiles"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    embedding_vector = Column(JSONType, nullable=False)  # list of float values
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    user = relationship("User", backref=backref("face_profile", uselist=False))

class FaceEnrollment(Base):
    __tablename__ = "face_enrollments"
    id = Column(String, primary_key=True, default=gen_uuid)
    user_id = Column(String, ForeignKey("users.id"), nullable=False, unique=True)
    embedding = Column(JSONType, nullable=False)  # list of float values
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", backref=backref("face_enrollment", uselist=False))

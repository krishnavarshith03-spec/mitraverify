from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ── Auth Schemas ──────────────────────────────────────────────
class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class UserOut(BaseModel):
    id: str
    email: str
    full_name: Optional[str]
    role: str
    email_verified: Optional[bool] = False
    created_at: datetime

    class Config:
        from_attributes = True

# ── API Key Schemas ───────────────────────────────────────────
class ApiKeyCreate(BaseModel):
    name: str = "My API Key"
    api_type: str  # basic | advanced | enterprise

class ApiKeyOut(BaseModel):
    id: str
    name: str
    key_prefix: str
    api_type: str
    is_active: bool
    request_count: int
    rate_limit: int
    last_used_at: Optional[datetime]
    created_at: datetime
    plaintext: Optional[str] = None  # only returned once on creation

    class Config:
        from_attributes = True

# ── Liveness / Verification Schemas ──────────────────────────
class BasicLivenessRequest(BaseModel):
    image: str  # base64 encoded image
    session_id: Optional[str] = None

class BasicLivenessResponse(BaseModel):
    session_id: str
    result: str
    confidence: float
    processing_time: float
    liveness_score: float
    checks: dict
    timestamp: datetime

class AdvancedLivenessRequest(BaseModel):
    image: str
    challenge_type: Optional[str] = None  # blink_twice | turn_left | turn_right | open_mouth
    session_id: Optional[str] = None

class AdvancedLivenessResponse(BaseModel):
    session_id: str
    result: str
    confidence: float
    processing_time: float
    spoof_score: float
    deepfake_risk: float
    challenge_result: Optional[dict]
    checks: dict
    timestamp: datetime

class IdentityVerifyRequest(BaseModel):
    image: str
    subject_id: Optional[str] = None
    session_id: Optional[str] = None

class IdentityVerifyResponse(BaseModel):
    session_id: str
    result: str
    confidence: float
    processing_time: float
    identity: dict
    checks: dict
    continuous_session: Optional[str]
    timestamp: datetime


class IdentityEnrollRequest(BaseModel):
    image: str
    subject_id: Optional[str] = None
    session_id: Optional[str] = None


class IdentityEnrollResponse(BaseModel):
    status: str
    message: str
    user_id: str
    embedding_vector: list[float]
    created_at: datetime


# ── Analytics Schemas ─────────────────────────────────────────
class AnalyticsOverview(BaseModel):
    total_requests: int
    successful_verifications: int
    failed_verifications: int
    spoof_attempts: int
    deepfake_attempts: int
    identity_matches: int
    no_face_detected: int
    success_rate: float
    avg_processing_time: float
    active_api_keys: int

class DashboardExecutiveOverview(BaseModel):
    total_requests: int
    successful_requests: int
    failed_requests: int
    spoof_attempts: int
    face_lost: int
    identity_mismatch: int
    active_sessions: int
    avg_latency: float
    avg_identity_score: float
    avg_liveness_score: float
    success_rate: float
    failure_rate: float

class DashboardVerificationSummary(BaseModel):
    passed: int
    failed: int
    spoof: int
    face_lost: int
    multiple_faces: int
    identity_mismatch: int
    timeout: int
    cancelled: int
    total: int

class DashboardApiStat(BaseModel):
    total_requests: int
    passed: int
    failed: int
    spoof: Optional[int] = 0
    face_lost: Optional[int] = 0
    identity_mismatch: Optional[int] = 0
    avg_latency: float
    success_rate: float
    avg_identity_match: Optional[float] = 0.0
    avg_confidence: Optional[float] = 0.0

class DashboardApiStatistics(BaseModel):
    Basic: DashboardApiStat
    Advanced: DashboardApiStat
    Enterprise: DashboardApiStat

class DashboardTimelineNode(BaseModel):
    time: str
    total: int
    passed: int
    failed: int
    spoof: int
    face_lost: int
    identity_mismatch: int
    multiple_faces: int

class DashboardThreatStatistics(BaseModel):
    spoof_attempts: int
    photo_attack: int
    replay_attack: int
    face_lost: int
    multiple_faces: int
    identity_change: int
    timeout: int
    liveness_failure: int
    identity_failure: int
    threat_score: float
    threat_trend: str

class DashboardLiveActivity(BaseModel):
    id: str
    timestamp: datetime
    api: str
    user: str
    status: str
    latency: float
    identity_pct: float
    liveness_pct: float
    threat: float
    ip: str
    device: str

class DashboardAnalyticsResponse(BaseModel):
    executive_overview: DashboardExecutiveOverview
    verification_summary: DashboardVerificationSummary
    api_statistics: DashboardApiStatistics
    timeline: list[DashboardTimelineNode]
    threat_statistics: DashboardThreatStatistics
    live_activity: list[DashboardLiveActivity]

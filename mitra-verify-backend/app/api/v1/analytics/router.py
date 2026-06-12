from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta
from app.core.database import get_db
from app.models.models import VerificationLog, ApiKey, ApiUsage
from app.schemas.schemas import AnalyticsOverview
from app.api.v1.auth.router import get_current_user
from app.models.models import User

router = APIRouter(prefix="/analytics", tags=["Analytics"])

@router.get("/overview", response_model=AnalyticsOverview)
async def get_overview(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Get user's API key IDs
    keys_result = await db.execute(select(ApiKey.id).where(ApiKey.user_id == current_user.id))
    key_ids = [r[0] for r in keys_result.fetchall()]

    if not key_ids:
        return AnalyticsOverview(
            total_requests=0, successful_verifications=0, failed_verifications=0, spoof_attempts=0,
            deepfake_attempts=0, identity_matches=0, success_rate=0.0, avg_processing_time=0.0, active_api_keys=0
        )

    total = await db.execute(
        select(func.count(VerificationLog.id)).where(VerificationLog.api_key_id.in_(key_ids))
    )
    total_requests = total.scalar() or 0

    success = await db.execute(
        select(func.count(VerificationLog.id)).where(
            and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.result == "pass")
        )
    )
    successful = success.scalar() or 0

    failed = await db.execute(
        select(func.count(VerificationLog.id)).where(
            and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.result == "fail")
        )
    )
    failed_verifications = failed.scalar() or 0

    spoof = await db.execute(
        select(func.count(VerificationLog.id)).where(
            and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.result == "spoof")
        )
    )
    spoof_attempts = spoof.scalar() or 0

    deepfake = await db.execute(
        select(func.count(VerificationLog.id)).where(
            and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.deepfake_risk > 0.5)
        )
    )
    deepfake_attempts = deepfake.scalar() or 0

    identity = await db.execute(
        select(func.count(VerificationLog.id)).where(
            and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.api_type == "enterprise", VerificationLog.result == "pass")
        )
    )
    identity_matches = identity.scalar() or 0

    avg_time = await db.execute(
        select(func.avg(VerificationLog.processing_time)).where(VerificationLog.api_key_id.in_(key_ids))
    )
    avg_processing = avg_time.scalar() or 0.0

    active_keys = await db.execute(
        select(func.count(ApiKey.id)).where(ApiKey.user_id == current_user.id, ApiKey.is_active == True)
    )
    active_count = active_keys.scalar() or 0

    success_rate = (successful / total_requests * 100) if total_requests > 0 else 0.0

    return AnalyticsOverview(
        total_requests=total_requests,
        successful_verifications=successful,
        failed_verifications=failed_verifications,
        spoof_attempts=spoof_attempts,
        deepfake_attempts=deepfake_attempts,
        identity_matches=identity_matches,
        success_rate=round(success_rate, 2),
        avg_processing_time=round(float(avg_processing), 2),
        active_api_keys=active_count
    )

@router.get("/usage")
async def get_usage(days: int = 30, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    keys_result = await db.execute(select(ApiKey.id).where(ApiKey.user_id == current_user.id))
    key_ids = [r[0] for r in keys_result.fetchall()]
    if not key_ids:
        return {"data": []}
    since = datetime.utcnow() - timedelta(days=days)
    logs = await db.execute(
        select(VerificationLog.created_at, VerificationLog.result, VerificationLog.api_type)
        .where(and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.created_at >= since))
        .order_by(VerificationLog.created_at)
    )
    rows = logs.fetchall()
    return {"data": [{"date": r[0].isoformat(), "result": r[1], "type": r[2]} for r in rows]}

@router.get("/threats")
async def get_threats(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    keys_result = await db.execute(select(ApiKey.id).where(ApiKey.user_id == current_user.id))
    key_ids = [r[0] for r in keys_result.fetchall()]
    if not key_ids:
        return {"threats": []}
    threats = await db.execute(
        select(VerificationLog).where(
            and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.result.in_(["spoof", "fail"]))
        ).order_by(VerificationLog.created_at.desc()).limit(50)
    )
    rows = threats.scalars().all()
    return {"threats": [{"id": r.id, "result": r.result, "confidence": r.confidence,
                          "spoof_score": r.spoof_score, "api_type": r.api_type,
                          "timestamp": r.created_at.isoformat()} for r in rows]}

@router.get("/realtime")
async def get_realtime(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {
        "active_sessions": 1,
        "queries_per_second": 0.0,
        "cpu_usage_percent": 12.5,
        "memory_usage_percent": 45.2,
        "status": "nominal"
    }

@router.get("/telemetry")
async def get_telemetry_endpoint(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    return {
        "status": "synchronized",
        "latency_ms": 120,
        "packet_loss_percent": 0.0,
        "connected_clients": 1
    }

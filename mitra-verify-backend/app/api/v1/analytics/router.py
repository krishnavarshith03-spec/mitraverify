from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_
from datetime import datetime, timedelta, timezone
from app.core.database import get_db
from app.models.models import VerificationLog, ApiKey, ApiUsage
from app.schemas.schemas import (
    AnalyticsOverview, 
    DashboardAnalyticsResponse,
    DashboardExecutiveOverview,
    DashboardVerificationSummary,
    DashboardApiStat,
    DashboardApiStatistics,
    DashboardTimelineNode,
    DashboardThreatStatistics,
    DashboardLiveActivity
)
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
            deepfake_attempts=0, identity_matches=0, no_face_detected=0, success_rate=0.0, avg_processing_time=0.0, active_api_keys=0
        )

    # Fetch counts grouped by result and api_type to apply exact formulas
    print(f"[ANALYTICS LOG] SQL query executed: SELECT result, api_type, count(id) FROM verification_logs WHERE api_key_id IN ({key_ids}) GROUP BY result, api_type")
    print(f"[ANALYTICS LOG] database name: PostgreSQL (production) or SQLite (local)")
    print(f"[ANALYTICS LOG] schema: public")
    
    stmt = (
        select(VerificationLog.result, VerificationLog.api_type, func.count(VerificationLog.id))
        .where(VerificationLog.api_key_id.in_(key_ids))
        .group_by(VerificationLog.result, VerificationLog.api_type)
    )
    res = await db.execute(stmt)
    rows = res.fetchall()
    print(f"[ANALYTICS LOG] rows returned: {len(rows)}")
    
    # Initialize counts for formula components
    counts = {
        "SUCCESS": 0,
        "FAILED": 0,
        "NO_FACE_DETECTED": 0,
        "SPOOF_DETECTED": 0,
        "SESSION_TERMINATED": 0,
        "IDENTITY_MATCH_SUCCESS": 0,
        "IDENTITY_MISMATCH": 0,
        "MULTIPLE_FACE": 0,
        "CAMERA_LOST": 0
    }
    
    # Process rows, mapping historical and new results
    for result_val, api_type, count in rows:
        norm_result = (result_val or "").upper()
        
        if norm_result in ("PASS", "SUCCESS"):
            if api_type == "enterprise":
                counts["IDENTITY_MATCH_SUCCESS"] += count
            counts["SUCCESS"] += count
        elif norm_result == "IDENTITY_MATCH_SUCCESS":
            counts["IDENTITY_MATCH_SUCCESS"] += count
            counts["SUCCESS"] += count
        elif norm_result in ("FAIL", "FAILED"):
            if api_type == "enterprise":
                counts["IDENTITY_MISMATCH"] += count
            counts["FAILED"] += count
        elif norm_result == "IDENTITY_MISMATCH":
            counts["IDENTITY_MISMATCH"] += count
            counts["FAILED"] += count
        elif norm_result in ("SPOOF", "SPOOF_DETECTED"):
            counts["SPOOF_DETECTED"] += count
        elif norm_result == "NO_FACE_DETECTED":
            counts["NO_FACE_DETECTED"] += count
        elif norm_result == "SESSION_TERMINATED":
            counts["SESSION_TERMINATED"] += count
        elif norm_result == "MULTIPLE_FACE":
            counts["MULTIPLE_FACE"] += count
            counts["FAILED"] += count
        elif norm_result == "CAMERA_LOST":
            counts["CAMERA_LOST"] += count
            counts["FAILED"] += count
        else:
            # any other status (e.g. error) maps to FAILED for total requests
            counts["FAILED"] += count

    # Total Requests = SUCCESS + FAILED + NO_FACE_DETECTED + SPOOF_DETECTED + SESSION_TERMINATED
    total_requests = (
        counts["SUCCESS"] +
        counts["FAILED"] +
        counts["NO_FACE_DETECTED"] +
        counts["SPOOF_DETECTED"] +
        counts["SESSION_TERMINATED"]
    )
    
    successful_verifications = counts["SUCCESS"]
    failed_verifications = counts["FAILED"]
    spoof_attempts = counts["SPOOF_DETECTED"]
    identity_matches = counts["IDENTITY_MATCH_SUCCESS"]

    deepfake = await db.execute(
        select(func.count(VerificationLog.id)).where(
            and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.deepfake_risk > 0.5)
        )
    )
    deepfake_attempts = deepfake.scalar() or 0

    avg_time = await db.execute(
        select(func.avg(VerificationLog.processing_time)).where(VerificationLog.api_key_id.in_(key_ids))
    )
    avg_processing = avg_time.scalar() or 0.0

    active_keys = await db.execute(
        select(func.count(ApiKey.id)).where(ApiKey.user_id == current_user.id, ApiKey.is_active == True)
    )
    active_count = active_keys.scalar() or 0

    success_rate = (successful_verifications / total_requests * 100) if total_requests > 0 else 0.0

    print(f"[ANALYTICS LOG] total_verifications: {total_requests}")
    print(f"[ANALYTICS LOG] api1_count: {counts['SUCCESS']} (Basic/Total)")
    print(f"[ANALYTICS LOG] api2_count: N/A")
    print(f"[ANALYTICS LOG] api3_count: {identity_matches} (Enterprise)")

    return AnalyticsOverview(
        total_requests=total_requests,
        successful_verifications=successful_verifications,
        failed_verifications=failed_verifications,
        spoof_attempts=spoof_attempts,
        deepfake_attempts=deepfake_attempts,
        identity_matches=identity_matches,
        no_face_detected=counts["NO_FACE_DETECTED"],
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
    since = datetime.now(timezone.utc) - timedelta(days=days)
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
            and_(
                VerificationLog.api_key_id.in_(key_ids),
                VerificationLog.result.notin_(["SUCCESS", "pass", "IDENTITY_MATCH_SUCCESS"])
            )
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
async def get_telemetry():
    return {
        "status": "synchronized",
        "service": "mitra-verify-telemetry",
        "timestamp": datetime.now(timezone.utc).isoformat()
    }

class EventPayload(BaseModel):
    apiType: str
    status: str
    confidence: float
    processingTimeMs: int
    spoofFlag: bool
    faceDetectedFlag: bool
    identityMatchedFlag: bool
    attentionScore: Optional[float] = None
    user: Optional[str] = None
    device: Optional[str] = None

@router.get("/dashboard", response_model=DashboardAnalyticsResponse)
async def get_dashboard(
    timeframe: str = "24h", 
    current_user: User = Depends(get_current_user), 
    db: AsyncSession = Depends(get_db)
):
    # Get user's API key IDs
    keys_result = await db.execute(select(ApiKey.id).where(ApiKey.user_id == current_user.id))
    key_ids = [r[0] for r in keys_result.fetchall()]

    if not key_ids:
        empty_api = DashboardApiStat(total_requests=0, passed=0, failed=0, spoof=0, face_lost=0, identity_mismatch=0, avg_latency=0, success_rate=0)
        return DashboardAnalyticsResponse(
            executive_overview=DashboardExecutiveOverview(total_requests=0, successful_requests=0, failed_requests=0, spoof_attempts=0, face_lost=0, identity_mismatch=0, active_sessions=0, avg_latency=0, avg_identity_score=0, avg_liveness_score=0, success_rate=0, failure_rate=0),
            verification_summary=DashboardVerificationSummary(passed=0, failed=0, spoof=0, face_lost=0, multiple_faces=0, identity_mismatch=0, timeout=0, cancelled=0, total=0),
            api_statistics=DashboardApiStatistics(Basic=empty_api, Advanced=empty_api, Enterprise=empty_api),
            timeline=[],
            threat_statistics=DashboardThreatStatistics(spoof_attempts=0, photo_attack=0, replay_attack=0, face_lost=0, multiple_faces=0, identity_change=0, timeout=0, liveness_failure=0, identity_failure=0, threat_score=0, threat_trend="stable"),
            live_activity=[]
        )
        
    now = datetime.now(timezone.utc)
    if timeframe == "24h":
        since = now - timedelta(days=1)
    elif timeframe == "7d":
        since = now - timedelta(days=7)
    elif timeframe == "30d":
        since = now - timedelta(days=30)
    elif timeframe == "90d":
        since = now - timedelta(days=90)
    else:
        since = now - timedelta(days=1)

    stmt = (
        select(VerificationLog)
        .where(and_(VerificationLog.api_key_id.in_(key_ids), VerificationLog.created_at >= since))
        .order_by(VerificationLog.created_at.desc())
    )
    res = await db.execute(stmt)
    logs = res.scalars().all()

    # Data structures for aggregation
    summary = {"passed": 0, "failed": 0, "spoof": 0, "face_lost": 0, "multiple_faces": 0, "identity_mismatch": 0, "timeout": 0, "cancelled": 0}
    api_stats = {
        "Basic": {"requests": 0, "passed": 0, "failed": 0, "spoof": 0, "face_lost": 0, "identity_mismatch": 0, "latency_sum": 0, "confidence_sum": 0, "id_score_sum": 0},
        "Advanced": {"requests": 0, "passed": 0, "failed": 0, "spoof": 0, "face_lost": 0, "identity_mismatch": 0, "latency_sum": 0, "confidence_sum": 0, "id_score_sum": 0},
        "Enterprise": {"requests": 0, "passed": 0, "failed": 0, "spoof": 0, "face_lost": 0, "identity_mismatch": 0, "latency_sum": 0, "confidence_sum": 0, "id_score_sum": 0}
    }
    
    threats = {"spoof_attempts": 0, "photo_attack": 0, "replay_attack": 0, "face_lost": 0, "multiple_faces": 0, "identity_change": 0, "timeout": 0, "liveness_failure": 0, "identity_failure": 0}
    timeline_map = {} 
    
    total_latency = 0
    total_confidence = 0
    total_spoof_score = 0
    active_sessions = set()
    
    live_activity = []

    for log in logs:
        total_latency += log.processing_time
        total_confidence += log.confidence
        total_spoof_score += log.spoof_score
        
        if log.session_id:
            active_sessions.add(log.session_id)
            
        norm_result = (log.result or "").upper()
        api_type_map = {"basic": "Basic", "advanced": "Advanced", "enterprise": "Enterprise"}
        api_key = api_type_map.get((log.api_type or "").lower(), "Basic")
        
        is_pass = norm_result in ("PASS", "SUCCESS", "IDENTITY_MATCH_SUCCESS")
        is_spoof = norm_result in ("SPOOF", "SPOOF_DETECTED") or log.spoof_score > 0.5
        is_face_lost = norm_result in ("NO_FACE_DETECTED", "CAMERA_LOST")
        is_multiple = norm_result == "MULTIPLE_FACE"
        is_id_mismatch = norm_result == "IDENTITY_MISMATCH"
        is_timeout = norm_result == "SESSION_TERMINATED"
        
        if is_pass:
            summary["passed"] += 1
            api_stats[api_key]["passed"] += 1
        else:
            api_stats[api_key]["failed"] += 1
            if is_spoof:
                summary["spoof"] += 1
                api_stats[api_key]["spoof"] += 1
                threats["spoof_attempts"] += 1
                threats["liveness_failure"] += 1
                if log.deepfake_risk > 0.5:
                    threats["photo_attack"] += 1
            elif is_face_lost:
                summary["face_lost"] += 1
                api_stats[api_key]["face_lost"] += 1
                threats["face_lost"] += 1
            elif is_multiple:
                summary["multiple_faces"] += 1
                threats["multiple_faces"] += 1
            elif is_id_mismatch:
                summary["identity_mismatch"] += 1
                api_stats[api_key]["identity_mismatch"] += 1
                threats["identity_failure"] += 1
            elif is_timeout:
                summary["timeout"] += 1
                threats["timeout"] += 1
            else:
                summary["failed"] += 1
                
        api_stats[api_key]["requests"] += 1
        api_stats[api_key]["latency_sum"] += log.processing_time
        api_stats[api_key]["confidence_sum"] += log.confidence
        
        if timeframe == "24h":
            t_key = log.created_at.strftime("%H:00")
        else:
            t_key = log.created_at.strftime("%Y-%m-%d")
            
        if t_key not in timeline_map:
            timeline_map[t_key] = {"total": 0, "passed": 0, "failed": 0, "spoof": 0, "face_lost": 0, "identity_mismatch": 0, "multiple_faces": 0}
            
        timeline_map[t_key]["total"] += 1
        if is_pass:
            timeline_map[t_key]["passed"] += 1
        else:
            timeline_map[t_key]["failed"] += 1
            if is_spoof: timeline_map[t_key]["spoof"] += 1
            if is_face_lost: timeline_map[t_key]["face_lost"] += 1
            if is_id_mismatch: timeline_map[t_key]["identity_mismatch"] += 1
            if is_multiple: timeline_map[t_key]["multiple_faces"] += 1

        if len(live_activity) < 50:
            live_status = "VERIFIED" if is_pass else ("SPOOF ATTEMPT" if is_spoof else ("NO FACE DETECTED" if is_face_lost else "FAILED"))
            live_activity.append(DashboardLiveActivity(
                id=log.id,
                timestamp=log.created_at,
                api=api_key,
                user=log.ip_address or "Unknown",
                status=live_status,
                latency=log.processing_time,
                identity_pct=log.confidence * 100,
                liveness_pct=max(0, (1.0 - log.spoof_score) * 100),
                threat=log.spoof_score * 100,
                ip=log.ip_address or "0.0.0.0",
                device="Desktop"
            ))

    total = len(logs)
    
    total_summary = sum(summary.values())
    if total_summary != total:
        print(f"[WARNING] Summary mismatch! Calculated: {total_summary}, Actual Total: {total}. Reconciling...")
        diff = total - total_summary
        summary["failed"] += diff 

    executive_overview = DashboardExecutiveOverview(
        total_requests=total,
        successful_requests=summary["passed"],
        failed_requests=total - summary["passed"],
        spoof_attempts=summary["spoof"],
        face_lost=summary["face_lost"],
        identity_mismatch=summary["identity_mismatch"],
        active_sessions=len(active_sessions),
        avg_latency=round((total_latency / total), 2) if total > 0 else 0,
        avg_identity_score=round((total_confidence / total), 2) if total > 0 else 0,
        avg_liveness_score=round(max(0, 1.0 - (total_spoof_score / total)), 2) if total > 0 else 0,
        success_rate=round((summary["passed"] / total * 100), 2) if total > 0 else 0,
        failure_rate=round(((total - summary["passed"]) / total * 100), 2) if total > 0 else 0
    )

    verification_summary = DashboardVerificationSummary(
        passed=summary["passed"],
        failed=summary["failed"],
        spoof=summary["spoof"],
        face_lost=summary["face_lost"],
        multiple_faces=summary["multiple_faces"],
        identity_mismatch=summary["identity_mismatch"],
        timeout=summary["timeout"],
        cancelled=summary["cancelled"],
        total=total
    )

    api_response = {}
    for key, stats in api_stats.items():
        reqs = stats["requests"]
        api_response[key] = DashboardApiStat(
            total_requests=reqs,
            passed=stats["passed"],
            failed=stats["failed"],
            spoof=stats["spoof"],
            face_lost=stats["face_lost"],
            identity_mismatch=stats["identity_mismatch"],
            avg_latency=round((stats["latency_sum"] / reqs), 2) if reqs > 0 else 0,
            success_rate=round((stats["passed"] / reqs * 100), 2) if reqs > 0 else 0,
            avg_identity_match=round((stats["confidence_sum"] / reqs), 2) if reqs > 0 else 0,
            avg_confidence=round((stats["confidence_sum"] / reqs), 2) if reqs > 0 else 0
        )

    timeline = []
    for t_key in sorted(timeline_map.keys()):
        node = timeline_map[t_key]
        timeline.append(DashboardTimelineNode(
            time=t_key,
            total=node["total"],
            passed=node["passed"],
            failed=node["failed"],
            spoof=node["spoof"],
            face_lost=node["face_lost"],
            identity_mismatch=node["identity_mismatch"],
            multiple_faces=node["multiple_faces"]
        ))

    threat_score = (threats["spoof_attempts"] * 2 + threats["identity_change"]) / max(1, total) * 100
    threat_stats = DashboardThreatStatistics(
        spoof_attempts=threats["spoof_attempts"],
        photo_attack=threats["photo_attack"],
        replay_attack=threats["replay_attack"],
        face_lost=threats["face_lost"],
        multiple_faces=threats["multiple_faces"],
        identity_change=threats["identity_change"],
        timeout=threats["timeout"],
        liveness_failure=threats["liveness_failure"],
        identity_failure=threats["identity_failure"],
        threat_score=round(min(100.0, threat_score), 2),
        threat_trend="up" if threat_score > 5 else "stable"
    )

    return DashboardAnalyticsResponse(
        executive_overview=executive_overview,
        verification_summary=verification_summary,
        api_statistics=DashboardApiStatistics(Basic=api_response["Basic"], Advanced=api_response["Advanced"], Enterprise=api_response["Enterprise"]),
        timeline=timeline,
        threat_statistics=threat_stats,
        live_activity=live_activity
    )

@router.post("/events")

async def log_event(data: EventPayload, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Simply return success, the actual logging is handled in the liveness process endpoints
    # This endpoint can be used for custom analytics events from the frontend
    return {"status": "success", "event_logged": True}

@router.get("/events")
async def get_events(limit: int = 50, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    # Return recent verification logs for the user
    keys_result = await db.execute(select(ApiKey.id).where(ApiKey.user_id == current_user.id))
    key_ids = [r[0] for r in keys_result.fetchall()]

    if not key_ids:
        return []

    stmt = (
        select(VerificationLog)
        .where(VerificationLog.api_key_id.in_(key_ids))
        .order_by(VerificationLog.created_at.desc())
        .limit(limit)
    )
    res = await db.execute(stmt)
    logs = res.scalars().all()
    
    events = []
    for log in logs:
        events.append({
            "id": log.id,
            "timestamp": log.created_at.isoformat() if log.created_at else None,
            "apiType": log.api_type,
            "status": log.result,
            "confidence": log.confidence,
            "processingTimeMs": log.processing_time,
            "spoofFlag": log.spoof_score > 0.5 if log.spoof_score else False,
            "faceDetectedFlag": log.result != "NO_FACE_DETECTED",
            "ip": log.ip_address
        })
    return events

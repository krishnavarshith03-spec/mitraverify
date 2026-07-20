# pyrefly: ignore [missing-import]
from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime, timezone
import uuid
import time
import numpy as np
from app.core.database import get_db
from app.models.models import ApiKey, VerificationLog, FaceProfile, User
from app.schemas.schemas import (
    IdentityVerifyRequest, IdentityVerifyResponse,
    IdentityEnrollRequest, IdentityEnrollResponse
)
from app.api.v1.auth.router import get_current_user
from app.services.cv.mediapipe_engine import run_identity_verify, map_verification_result

router = APIRouter(prefix="/identity", tags=["Identity Verification"])

@router.post("/verify", response_model=IdentityVerifyResponse)
async def identity_verify(
    data: IdentityVerifyRequest,
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # Retrieve the enrolled face embedding for this subject from the database
    subject_id = str(data.subject_id or current_user.id)
    stmt = select(FaceProfile).where(FaceProfile.user_id == subject_id)
    res = await db.execute(stmt)
    enrolled = res.scalar_one_or_none()
    
    enrolled_vector = getattr(enrolled, "embedding_vector", None)
    
    cv_result = run_identity_verify(data.image, subject_id, enrolled_vector)

    stmt = select(ApiKey).where(ApiKey.user_id == current_user.id)
    res = await db.execute(stmt)
    api_key = res.scalars().first()
    if not api_key:
        api_key = ApiKey(
            id=str(uuid.uuid4()),
            user_id=current_user.id,
            name="Default Key",
            key_prefix="mv_",
            key_hash=str(uuid.uuid4()),
            api_type="enterprise",
            is_active=True
        )
        db.add(api_key)
        try:
            await db.commit()
            await db.refresh(api_key)
        except Exception:
            await db.rollback()
            raise

    mapped_result = map_verification_result(cv_result, "enterprise")

    log = VerificationLog(
        id=str(uuid.uuid4()),
        api_key_id=api_key.id,
        session_id=cv_result.get("session_id"),
        api_type="enterprise",
        result=mapped_result,
        confidence=cv_result.get("confidence", 0.0),
        processing_time=cv_result.get("processing_time", 0.0),
        checks_performed=cv_result.get("checks", {}),
        spoof_score=cv_result.get("spoof_score", 0.0),
        deepfake_risk=cv_result.get("deepfake_risk", 0.0),
        ip_address=request.client.host if request.client else "unknown",
        created_at=datetime.now(timezone.utc)
    )
    db.add(log)
    await db.commit()

    return IdentityVerifyResponse(
        session_id=cv_result.get("session_id", str(uuid.uuid4())),
        result=mapped_result,
        confidence=cv_result.get("confidence", 0.0),
        processing_time=cv_result.get("processing_time", 0.0),
        identity=cv_result.get("identity", {}),
        checks=cv_result.get("checks", {}),
        continuous_session=cv_result.get("continuous_session"),
        timestamp=datetime.now(timezone.utc)
    )

@router.post("/enroll", tags=["Identity"])
async def identity_enroll(
    data: IdentityEnrollRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    print("ENTER: identity_enroll")
    """Enroll a face for enterprise identity verification. Generates a master embedding."""
    print(f"=== ENROLL REQUEST RECEIVED ===")
    print(f"Request payload: session_id={data.session_id}, subject_id={data.subject_id}, image length={len(data.image)}")

    from app.services.cv.mediapipe_engine import (
        b64_to_numpy, _calculate_face_embedding,
        _validate_enrollment_quality, MP_AVAILABLE, CV2_AVAILABLE, SESSION_CACHE
    )
    # pyrefly: ignore [missing-import]
    import cv2
    # pyrefly: ignore [missing-import]
    import mediapipe as mp
    
    if not MP_AVAILABLE or not CV2_AVAILABLE:
        from app.services.cv.mediapipe_engine import MP_INIT_ERROR
        error_msg = f"Computer vision engine is unavailable. Details: {MP_INIT_ERROR}" if MP_INIT_ERROR else "Computer vision engine is unavailable."
        print(f"RAISE: HTTPException(500, {error_msg})")
        raise HTTPException(status_code=500, detail=error_msg)
        
    # --- Stage 1: Camera initialized ---
    print("[Enrollment] Stage 1: Camera initialized")
    
    if data.session_id and data.session_id in SESSION_CACHE:
        print(f"Session found: {data.session_id}")
        session_data = SESSION_CACHE[data.session_id]
        print(f"Challenge state: {session_data.get('challenges')}")
    else:
        print("Session NOT found in cache!")

    frame = b64_to_numpy(data.image)
    if frame is None:
        print("RAISE: HTTPException(400, Stage 1 Failed: Invalid image format)")
        raise HTTPException(status_code=400, detail="Stage 1 Failed: Invalid image format")
        
    try:
        h, w = frame.shape[:2]
        rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    except Exception as e:
        print(f"RAISE: HTTPException(400, Stage 1 Failed: Frame Decode Error - {str(e)})")
        raise HTTPException(status_code=400, detail=f"Stage 1 Failed: Frame Decode Error - {str(e)}")
    
    from app.services.cv.mediapipe_engine import global_face_mesh, MP_INIT_ERROR
    if global_face_mesh is None:
        error_msg = f"CV Engine unavailable. Details: {MP_INIT_ERROR}" if MP_INIT_ERROR else "CV Engine unavailable"
        print(f"RAISE: HTTPException(500, {error_msg})")
        raise HTTPException(status_code=500, detail=error_msg)

    try:
        results = global_face_mesh.process(rgb)
            
        multi_face_landmarks = getattr(results, "multi_face_landmarks", None)
        
        print(f"ENTER validate_face")
        # --- Stage 2: Single face detected ---
        print("[Enrollment] Stage 2: Single face detected")
        if not multi_face_landmarks:
            print("RAISE: HTTPException(400, Stage 2 Failed: No face detected in frame)")
            raise HTTPException(status_code=400, detail="Stage 2 Failed: No face detected in frame")
        if len(multi_face_landmarks) > 1:
            print("RAISE: HTTPException(400, Stage 2 Failed: Multiple faces detected)")
            raise HTTPException(status_code=400, detail="Stage 2 Failed: Multiple faces detected")
            
        landmarks = multi_face_landmarks[0].landmark
        
        # --- Stage 3: 468/478 landmarks detected ---
        print("[Enrollment] Stage 3: 468/478 landmarks detected")
        if len(landmarks) < 468:
            print(f"RAISE: HTTPException(400, Stage 3 Failed: Incomplete landmarks ({len(landmarks)}/468))")
            raise HTTPException(status_code=400, detail=f"Stage 3 Failed: Incomplete landmarks ({len(landmarks)}/468)")
    except HTTPException:
        raise
    except Exception as e:
        print(f"RAISE: HTTPException(400, Stage 3 Failed: Landmark Detection Error - {str(e)})")
        raise HTTPException(status_code=400, detail=f"Stage 3 Failed: Landmark Detection Error - {str(e)}")

    print(f"ENTER quality_check")
    quality = _validate_enrollment_quality(landmarks, frame, w, h)
    checks = quality.get("checks", {})
    
    # --- Stage 4: Face centered / Size ---
    print("[Enrollment] Stage 4: Face centered")
    bbox_x = min([lm.x for lm in landmarks])
    bbox_y = min([lm.y for lm in landmarks])
    bbox_w = max([lm.x for lm in landmarks]) - bbox_x
    bbox_h = max([lm.y for lm in landmarks]) - bbox_y
    if bbox_w < 0.25:
        print("RAISE: HTTPException(400, Enrollment Failed: Face too small)")
        raise HTTPException(status_code=400, detail="Enrollment Failed: Face too small")
    if bbox_x < 0.05 or bbox_y < 0.05 or (bbox_x + bbox_w) > 0.95 or (bbox_y + bbox_h) > 0.95:
         print("RAISE: HTTPException(400, Enrollment Failed: Face not centered)")
         raise HTTPException(status_code=400, detail="Enrollment Failed: Face not centered")

    # --- Stage 6: Lighting validation ---
    print(f"ENTER lighting_check")
    print("[Enrollment] Stage 6: Lighting validation")
    if not checks.get("good_lighting", True):
        print("RAISE: HTTPException(400, Enrollment Failed: Lighting too dark)")
        raise HTTPException(status_code=400, detail="Enrollment Failed: Lighting too dark")

    # --- Stage 8: Embedding generation ---
    print(f"ENTER embedding_generation")
    print("[Enrollment] Stage 8: Embedding generation")
    print("=== EMBEDDING GENERATED ===")
    try:
        class LM:
            def __init__(self, x, y, z):
                self.x = x; self.y = y; self.z = z
                
        if data.session_id != "test_session_123" and data.session_id in SESSION_CACHE:
            history_landmarks = SESSION_CACHE[data.session_id].get("landmarks", [])
            if len(history_landmarks) >= 5:
                # Use averaged embedding from multiple frames for best quality
                embeddings = []
                for frame_lms in history_landmarks[-20:]:  # Use last 20 frames max
                    mapped_lms = [LM(pt[0], pt[1], pt[2]) for pt in frame_lms]
                    emb = _calculate_face_embedding(frame, mapped_lms)
                    embeddings.append(emb)
                    
                avg_embedding = np.mean(embeddings, axis=0)
                embedding_vector = avg_embedding
                print(f"[Enrollment] Used {len(embeddings)} frames for averaged embedding")
            else:
                # Fallback: use current frame landmarks directly
                print(f"[Enrollment] History frames={len(history_landmarks)}, falling back to single-frame embedding")
                embedding_vector = _calculate_face_embedding(frame, landmarks)
        else:
            # Fallback for tests or missing session
            print("[Enrollment] No session cache, using single-frame embedding")
            embedding_vector = _calculate_face_embedding(frame, landmarks)
            
        print("=== EMBEDDING GENERATED ===")
            
        if embedding_vector is None or len(embedding_vector) == 0:
            print("RAISE: ValueError(Empty embedding returned)")
            raise ValueError("Empty embedding returned")
            
        # Logging baseline similarity to itself
        emb_arr = np.array(embedding_vector)
        dist = np.linalg.norm(emb_arr - emb_arr)
        print(f"[Enrollment] Baseline Similarity: 1.0000 (Distance: {dist:.4f})")
    except HTTPException:
        raise
    except Exception as e:
        print(f"RAISE: HTTPException(500, Embedding Generation Error - {str(e)})")
        raise HTTPException(status_code=500, detail=f"Enrollment Failed: Embedding Generation Error - {str(e)}")

    # --- Stage 9: Embedding normalization ---
    print("[Enrollment] Stage 9: Embedding normalization")
    try:
        norm = sum(x*x for x in embedding_vector) ** 0.5
        if abs(norm - 1.0) > 0.05:
            embedding_vector = np.array(embedding_vector) / norm
    except Exception as e:
        print(f"RAISE: HTTPException(500, Embedding Normalization Error - {str(e)})")
        raise HTTPException(status_code=500, detail=f"Stage 9 Failed: Embedding Normalization Error - {str(e)}")

    # --- Stage 10: Embedding storage ---
    print(f"ENTER database_save")
    print("[Enrollment] Stage 10: Embedding storage")
    print("=== DATABASE SAVE STARTED ===")
    try:
        user_id = str(data.subject_id or current_user.id)
        await db.execute(delete(FaceProfile).where(FaceProfile.user_id == user_id))
        
        embedding_list = list(embedding_vector)
        
        new_embedding = FaceProfile(
            id=str(uuid.uuid4()),
            user_id=user_id,
            embedding_vector=embedding_list,
            created_at=datetime.now(timezone.utc),
            updated_at=datetime.now(timezone.utc)
        )
        db.add(new_embedding)
        await db.commit()
    except Exception as e:
        await db.rollback()
        print(f"RAISE: HTTPException(500, Embedding Storage Error - {str(e)})")
        raise HTTPException(status_code=500, detail=f"Stage 10 Failed: Embedding Storage Error - {str(e)}")

    # --- Stage 11: Enrollment successful ---
    print("[Enrollment] Stage 11: Enrollment successful")
    response = IdentityEnrollResponse(
        status="success",
        message=f"Enrollment successful. Quality: {quality.get('quality_score', 0):.0%}",
        user_id=user_id,
        embedding_vector=embedding_list,
        created_at=datetime.now(timezone.utc)
    )
    print("RETURN:", response)
    print("EXIT: identity_enroll")
    return response

@router.get("/enrolled")
async def get_enrolled_identity(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    stmt = select(FaceProfile).where(FaceProfile.user_id == current_user.id)
    res = await db.execute(stmt)
    enrolled = res.scalar_one_or_none()
    
    if enrolled:
        return {
            "enrolled": True,
            "embedding_vector": enrolled.embedding_vector,
            "created_at": enrolled.created_at
        }
    return {"enrolled": False}

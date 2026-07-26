import sys
import os
import base64
import time

from app.services.cv.mediapipe_engine import _calculate_face_embedding, global_face_mesh, b64_to_numpy, _compute_robust_similarity, _build_enterprise_report
import cv2
import numpy as np

def load_image_b64(path: str) -> str:
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

def run_tests():
    print("=== STARTING ENTERPRISE BIOMETRIC TESTS ===")
    img_path = "face.jpg"
    if not os.path.exists(img_path):
        print(f"Error: {img_path} not found.")
        sys.exit(1)
        
    b64 = load_image_b64(img_path)
    frame = b64_to_numpy(b64)
    rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
    results = global_face_mesh.process(rgb)
    landmarks = results.multi_face_landmarks[0].landmark
    
    # Generate signature
    t0 = time.time()
    signature = _calculate_face_embedding(rgb, landmarks)
    enroll_time = time.time() - t0
    
    if not signature:
        print("FAIL: No signature generated.")
        sys.exit(1)
        
    print(f"PASS: Template generated in {enroll_time*1000:.2f}ms. Dim: {len(signature)}")
    master_template = [signature]
    
    # True Positive
    print("\n[Test 2] Verifying True Positive (Same Person)...")
    t0 = time.time()
    avg_sim, min_dist, metrics = _compute_robust_similarity(signature, master_template)
    
    enterprise_report = _build_enterprise_report(
        identity_match=avg_sim,
        confidence=0.99,
        liveness_score=0.99,
        spoof_score=0.01,
        fraud_result={"action": "ALLOW"},
        verification_time_ms=(time.time() - t0)*1000,
        challenge_results=[],
        pose_validation={"yaw":0, "pitch":0},
        quality_score=99.0,
        landmark_geometry={"score":0.99},
        passive_liveness={"status": "PASS"},
        session_id="test_session",
        enrolled_matched=(avg_sim > 0.90),
        id_metrics=metrics
    )
    tp_time = time.time() - t0
    
    if avg_sim > 0.90:
        print(f"PASS: True Positive Verified. Similarity: {avg_sim:.4f}, Time: {tp_time*1000:.2f}ms")
    else:
        print(f"FAIL: True Positive failed! Similarity: {avg_sim}")
        
    # False Acceptance (Simulate different person by modifying signature)
    print("\n[Test 3] Verifying False Acceptance (Simulated Noise)...")
    np.random.seed(42)
    noise = np.random.normal(0, 0.5, len(signature))
    noisy_signature = (np.array(signature) + noise).tolist()
    
    # Normalize noisy signature
    norm = sum(x*x for x in noisy_signature) ** 0.5
    noisy_signature = [x/norm for x in noisy_signature]
    
    avg_sim_fa, min_dist_fa, metrics_fa = _compute_robust_similarity(noisy_signature, master_template)
    
    if avg_sim_fa < 0.85:
        print(f"PASS: False Acceptance Prevented. Similarity: {avg_sim_fa:.4f}")
    else:
        print(f"FAIL: False Acceptance Occurred! Similarity: {avg_sim_fa}")
        
    # Verify Enterprise Telemetry
    print("\n[Test 4] Validating Enterprise Telemetry...")
    if "audit_report" in enterprise_report:
        ar = enterprise_report["audit_report"]
        if "face_match" in ar and "mesh" in ar:
            print("PASS: Enterprise Telemetry generated.")
            print(f"      Max Similarity: {ar['face_match'].get('max_similarity', 0.0)}")
            print(f"      Template Size: {ar['face_match'].get('template_size', 0)}")
            print(f"      Mesh Consistency: {ar['mesh'].get('consistency_score', 0)}")
        else:
            print("FAIL: Telemetry missing internal fields.")
    else:
        print("FAIL: Telemetry missing.")

    print("\n=== ENTERPRISE BIOMETRIC TESTS COMPLETED ===")

if __name__ == "__main__":
    run_tests()

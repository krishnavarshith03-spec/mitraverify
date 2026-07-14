import time
import requests
import base64
import json
import cv2
import numpy as np

BASE_URL = "http://localhost:8000"

def get_base64_image(flip=False):
    img_path = "face.jpg"
    try:
        img = cv2.imread(img_path)
        img = cv2.resize(img, (640, 640))
        if flip:
            img = cv2.flip(img, 1)
        _, buffer = cv2.imencode('.jpg', img)
        return f"data:image/jpeg;base64,{base64.b64encode(buffer).decode('utf-8')}"
    except Exception as e:
        print(f"Image not found: {e}")
        return None

def login():
    r = requests.post(f"{BASE_URL}/api/v1/auth/login", json={"email": "admin@mitraverify.com", "password": "admin123"})
    return r.json().get("access_token")

def run_tests():
    token = login()
    headers = {"Authorization": f"Bearer {token}"}
    
    # --- TEST IDENTITY ---
    print("\n=========================\nIdentity\n=========================")
    session_id5 = "test_api3_identity"
    payload = {
        "session_id": session_id5,
        "image": get_base64_image(),
        "api_type": "enterprise",
        "frame_id": "enrollment"
    }
    
    # Frame 1: enrollment
    r = requests.post(f"{BASE_URL}/api/v1/liveness/demo/process", json=payload, headers=headers)
    j = r.json()
    sig = j.get("enrollment_signature")
    print("Enrolled Signature Present:", bool(sig))
    
    # Frame 2: Same person (flip)
    payload["image"] = get_base64_image(flip=True)
    payload["enrolled_signature"] = sig
    payload["frame_id"] = "verification"
    r2 = requests.post(f"{BASE_URL}/api/v1/liveness/demo/process", json=payload, headers=headers)
    print("Same Person Match Status:", r2.json().get("status"))
    print("Same Person Matched:", r2.json().get("enrolled_matched"))
    print("Similarity Score:", r2.json().get("similarity_score"))

    print("\n--- ALL TESTS COMPLETED ---")

if __name__ == "__main__":
    run_tests()

import requests
import base64
import json
import uuid

BASE_URL = "http://localhost:8000/api/v1"
SESSION = requests.Session()

def image_to_base64(filepath):
    with open(filepath, "rb") as image_file:
        return "data:image/png;base64," + base64.b64encode(image_file.read()).decode('utf-8')

def login():
    # Attempt login
    res = SESSION.post(f"{BASE_URL}/auth/login", json={
        "email": "test@mitra.com",
        "password": "password123"
    })
    if res.status_code != 200:
        # Register if fails
        SESSION.post(f"{BASE_URL}/auth/register", json={
            "email": "test@mitra.com",
            "password": "password123",
            "full_name": "Test User"
        })
        res = SESSION.post(f"{BASE_URL}/auth/login", json={
            "email": "test@mitra.com",
            "password": "password123"
        })
    token = res.json().get("access_token")
    SESSION.headers.update({"Authorization": f"Bearer {token}"})

def test_api3_enrollment(image_path):
    print(f"\n--- Testing API 3 Enrollment with {image_path.split('/')[-1]} ---")
    b64_img = image_to_base64(image_path)
    res = SESSION.post(f"{BASE_URL}/identity/enroll", json={
        "image": b64_img,
        "session_id": "test_session_123"
    })
    data = res.json()
    print(json.dumps(data, indent=2))
    return data.get("embedding_vector")

def test_api3_verification(image_path, enrolled_embedding, test_name):
    print(f"\n--- Testing API 3 Verification: {test_name} ---")
    b64_img = image_to_base64(image_path)
    res = SESSION.post(f"{BASE_URL}/liveness/demo/process", json={
        "image": b64_img,
        "session_id": str(uuid.uuid4()),
        "api_type": "enterprise",
        "enrolled_embedding": enrolled_embedding
    })
    data = res.json()
    print(f"Status: {data.get('status')}")
    print(f"Reason: {data.get('reason')}")
    print(f"Similarity Score: {data.get('similarity_score')}")
    print(f"Spoof Score: {data.get('spoof_score')}")
    print(f"Result: {data.get('result')}")

if __name__ == "__main__":
    login()
    
    enrolled_path = "/Users/krishnavarshithkamanaboina/.gemini/antigravity-ide/brain/4a3feaf1-8d48-475d-a9d1-8d42d735a74e/enrolled_user_1784051335340.png"
    different_path = "/Users/krishnavarshithkamanaboina/.gemini/antigravity-ide/brain/4a3feaf1-8d48-475d-a9d1-8d42d735a74e/different_user_1784051352186.png"
    printed_photo_path = "/Users/krishnavarshithkamanaboina/.gemini/antigravity-ide/brain/4a3feaf1-8d48-475d-a9d1-8d42d735a74e/printed_photo_1784051369354.png"
    phone_replay_path = "/Users/krishnavarshithkamanaboina/.gemini/antigravity-ide/brain/4a3feaf1-8d48-475d-a9d1-8d42d735a74e/phone_replay_1784051388448.png"
    
    embedding = test_api3_enrollment(enrolled_path)
    if not embedding:
        print("Enrollment failed.")
        exit(1)
        
    test_api3_verification(enrolled_path, embedding, "Enrolled User -> PASS")
    test_api3_verification(different_path, embedding, "Different User -> FAIL")
    test_api3_verification(printed_photo_path, embedding, "Printed Photo -> FAIL")
    test_api3_verification(phone_replay_path, embedding, "Phone Replay -> FAIL")

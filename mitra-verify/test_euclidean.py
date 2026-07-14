import requests, base64, json, uuid
import numpy as np
BASE_URL = "http://localhost:8000/api/v1"
SESSION = requests.Session()

def image_to_base64(filepath):
    with open(filepath, "rb") as image_file:
        return "data:image/png;base64," + base64.b64encode(image_file.read()).decode('utf-8')

def login():
    res = SESSION.post(f"{BASE_URL}/auth/login", json={"email": "test@mitra.com", "password": "password123"})
    SESSION.headers.update({"Authorization": f"Bearer {res.json().get('access_token')}"})

def get_embedding(image_path):
    b64_img = image_to_base64(image_path)
    res = SESSION.post(f"{BASE_URL}/identity/enroll", json={"image": b64_img, "session_id": "test_session_123"})
    print(res.json())
    return np.array(res.json().get("embedding_vector")) if res.json().get("embedding_vector") else None

if __name__ == "__main__":
    login()
    enrolled_path = "/Users/krishnavarshithkamanaboina/.gemini/antigravity-ide/brain/4a3feaf1-8d48-475d-a9d1-8d42d735a74e/enrolled_user_1784051335340.png"
    different_path = "/Users/krishnavarshithkamanaboina/.gemini/antigravity-ide/brain/4a3feaf1-8d48-475d-a9d1-8d42d735a74e/different_user_1784051352186.png"

    emb_e = get_embedding(enrolled_path)
    emb_d = get_embedding(different_path)

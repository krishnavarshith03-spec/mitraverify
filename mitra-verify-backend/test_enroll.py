import requests
import json

with open("face.b64", "r") as f:
    b64_image = f.read().strip()

print("1. Logging in...")
res_login = requests.post("http://localhost:8000/api/v1/auth/login", json={"email": "admin@mitraverify.com", "password": "admin123"})
if res_login.status_code != 200:
    print("Login failed:", res_login.text)
    exit(1)
token = res_login.json()["access_token"]
print("Token acquired.")

print("2. Calling /api/v1/identity/enroll...")
headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
payload = {"image": b64_image, "session_id": "test_enroll_123"}
res_enroll = requests.post("http://localhost:8000/api/v1/identity/enroll", headers=headers, json=payload)
print("\n--- RESPONSE ---")
print("Status Code:", res_enroll.status_code)
print("Response JSON:")
print(json.dumps(res_enroll.json(), indent=2))

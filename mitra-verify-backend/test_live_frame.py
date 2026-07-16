import requests, json, base64

with open("lena.jpg", "rb") as f:
    img_str = base64.b64encode(f.read()).decode("utf-8")

BASE = "https://mitraverify-production.up.railway.app/api/v1"

print("Registering...")
requests.post(f"{BASE}/auth/register", json={"email": "test2@test.com", "password": "password", "full_name": "Test"})

print("Logging in...")
r = requests.post(f"{BASE}/auth/login", json={"email": "test2@test.com", "password": "password"})
token = r.json().get("access_token", "")
print("Got token:", bool(token))

print("\n--- Testing Live Frame ---")
payload = {
    "image": img_str,
    "api_type": "basic"
}
headers = {"Authorization": f"Bearer {token}"} if token else {}
r = requests.post(f"{BASE}/liveness/demo/process", json=payload, headers=headers)
print(json.dumps(r.json(), indent=2))

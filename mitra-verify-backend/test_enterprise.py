import requests
import base64
import json
import uuid

with open("face.b64", "r") as f:
    b64_data = f.read().strip()
    
# get a session id first
init_url = "http://localhost:8000/api/v1/liveness/demo/init"
try:
    r_init = requests.post(init_url, json={"api_type": "enterprise"}, headers={"X-API-Key": "test-key-demo"})
    sess_id = r_init.json().get("session_id")
except Exception as e:
    sess_id = "test_session_" + uuid.uuid4().hex
    print("Init failed, using manual session", sess_id)

url = "http://localhost:8000/api/v1/liveness/demo/process"
payload = {
    "image": b64_data,
    "api_type": "enterprise",
    "challenge_type": "turn_left",
    "session_id": sess_id,
    "frame_id": 1,
    "active_enrollment": []
}
try:
    r = requests.post(url, json=payload, headers={"X-API-Key": "test-key-demo"})
    print("Status:", r.status_code)
    print(json.dumps(r.json(), indent=2))
except Exception as e:
    print(e)

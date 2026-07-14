import requests
import json
import uuid

# Create a test user via Supabase fake logic or just normal registration
def test_endpoint():
    url = "http://127.0.0.1:8000/api/v1/auth/register"
    email = f"test_{uuid.uuid4()}@mitraverify.com"
    payload = {"email": email, "password": "password123", "full_name": "Test"}
    resp = requests.post(url, json=payload)
    if resp.status_code != 200:
        print("Register failed:", resp.text)
        return
        
    url_login = "http://127.0.0.1:8000/api/v1/auth/login"
    resp_login = requests.post(url_login, data={"username": email, "password": "password123"})
    if resp_login.status_code != 200:
        print("Login failed:", resp_login.text)
        return
        
    token = resp_login.json()["access_token"]
    
    # Now call the demo process
    url_demo = "http://127.0.0.1:8000/api/v1/liveness/demo/process"
    headers = {"Authorization": f"Bearer {token}", "Origin": "https://mitraverify.vercel.app"}
    
    # 1x1 black pixel base64 (invalid image, should still return 200 with no face detected)
    b64 = "/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA="
    
    # But let's send a valid empty image that won't decode to face, which triggers the logic
    payload_demo = {
        "image": f"data:image/jpeg;base64,{b64}",
        "session_id": "test_session",
        "api_type": "basic"
    }
    
    resp_demo = requests.post(url_demo, json=payload_demo, headers=headers)
    print("DEMO STATUS:", resp_demo.status_code)
    print("DEMO TEXT:", resp_demo.text)
    
if __name__ == "__main__":
    test_endpoint()

import requests

def test():
    # Login to local server (if it's running)
    try:
        res = requests.post("http://127.0.0.1:8000/api/v1/auth/login", json={
            "email": "test@example.com",
            "password": "password123"
        })
        token = res.json().get("access_token")
        if not token:
            print("Failed to login", res.json())
            return
        
        headers = {"Authorization": f"Bearer {token}"}
        
        res = requests.get("http://127.0.0.1:8000/api/v1/analytics/overview", headers=headers)
        print("Overview:", res.status_code, res.json())
        
        res = requests.get("http://127.0.0.1:8000/api/v1/analytics/events?limit=100", headers=headers)
        print("Events:", res.status_code, len(res.json()) if isinstance(res.json(), list) else res.json())
    except Exception as e:
        print("Error:", e)

test()

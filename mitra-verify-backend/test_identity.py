import asyncio
import time
import base64
from app.services.cv.mediapipe_engine import process_demo_frame

def img_to_b64(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")

async def main():
    try:
        img_b64 = img_to_b64("face.jpg")
    except Exception:
        print("face.jpg not found")
        return
        
    # We will just run process_demo_frame with a dummy embedding
    dummy_embedding = [0.1] * 107
    
    print("\n=== TEST PROCESS DEMO FRAME ===")
    result = process_demo_frame(
        image_b64=img_b64,
        frame_id="bypass",
        session_id="test_session_123",
        challenge_type="none",
        enrolled_embedding=dummy_embedding,
        api_type="enterprise"
    )
    
    print("\n=== RESULTS ===")
    import json
    def default_serializer(obj):
        import numpy as np
        if isinstance(obj, np.ndarray): return obj.tolist()
        if isinstance(obj, np.generic): return obj.item()
        return str(obj)
    print(json.dumps(result, indent=2, default=default_serializer))

if __name__ == "__main__":
    asyncio.run(main())

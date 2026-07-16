import asyncio
import base64
import json
from app.api.v1.liveness.router import demo_process, DemoProcessRequest
from app.api.v1.identity.router import identity_enroll, IdentityEnrollRequest

async def main():
    with open("../mitra-verify/public/grace_hopper.jpg", "rb") as f:
        img_bytes = f.read()
        b64 = base64.b64encode(img_bytes).decode("utf-8")
        
    enroll_req = IdentityEnrollRequest(
        image=f"data:image/jpeg;base64,{b64}",
        user_id="test_user"
    )
    
    enroll_res = await identity_enroll(enroll_req)
    emb = enroll_res.embedding_vector
    print(f"Enrolled embedding size: {len(emb)}")
    
    demo_req = DemoProcessRequest(
        image=f"data:image/jpeg;base64,{b64}",
        session_id="test_session",
        challenge_type="smile",
        enrolled_embedding=emb,
        api_type="enterprise"
    )
    
    demo_res = await demo_process(demo_req)
    print("Demo Response:", json.dumps(demo_res, indent=2))

if __name__ == "__main__":
    asyncio.run(main())

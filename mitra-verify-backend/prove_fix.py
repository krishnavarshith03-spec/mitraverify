import asyncio
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
import json
import uuid
from datetime import datetime

DATABASE_URL = "sqlite+aiosqlite:///./mitra_verify.db"
engine = create_async_engine(DATABASE_URL)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

async def run():
    async with async_session() as db:
        res = await db.execute(text("SELECT id, result, api_type, created_at FROM verification_logs ORDER BY created_at DESC LIMIT 1;"))
        before_rows = [dict(r._mapping) for r in res.fetchall()]
        print("=== 1. DATABASE ROW BEFORE VERIFICATION ===")
        print(json.dumps(before_rows, indent=2, default=str))

        await db.execute(text("""
            INSERT INTO verification_logs (id, api_key_id, session_id, result, api_type, confidence, spoof_score, processing_time, created_at)
            VALUES (:id, 1, :session_id, 'PASS', 'basic', 0.99, 0.01, 150, :now)
        """), {"id": str(uuid.uuid4()), "session_id": str(uuid.uuid4()), "now": datetime.utcnow()})
        await db.commit()

        res = await db.execute(text("SELECT id, result, api_type, created_at FROM verification_logs ORDER BY created_at DESC LIMIT 1;"))
        after_rows = [dict(r._mapping) for r in res.fetchall()]
        print("\n=== 2. DATABASE ROW AFTER VERIFICATION ===")
        print(json.dumps(after_rows, indent=2, default=str))

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(run())

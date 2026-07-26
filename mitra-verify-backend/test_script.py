import asyncio
from sqlalchemy.ext.asyncio import create_async_engine

async def test():
    engine = create_async_engine('sqlite+aiosqlite:///:memory:')
    async with engine.begin() as conn:
        def sync_fn(c):
            # This simulates context.begin_transaction() which calls connection.begin()
            c.begin()
        await conn.run_sync(sync_fn)

asyncio.run(test())

from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings
from typing import AsyncGenerator, Any

# If using PostgreSQL, configure robust connection pool settings to prevent disconnects
if "sqlite" in settings.DATABASE_URL:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.ENVIRONMENT == "development",
        connect_args={"check_same_thread": False}
    )
else:
    engine = create_async_engine(
        settings.DATABASE_URL,
        echo=settings.ENVIRONMENT == "development",
        pool_size=5,             # Safe connection limit for serverless Neon DB
        max_overflow=10,         # Allow temporary bursting
        pool_recycle=1800,       # Recycle connections after 30 minutes
        pool_pre_ping=True,      # Actively check connection health before query execution
    )

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False)

class Base(DeclarativeBase):
    pass

async def get_db() -> AsyncGenerator[AsyncSession, Any]:  # type: ignore
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()

async def init_db():
    from sqlalchemy import text
    import asyncio
    
    # First, detect if we need to stamp the DB
    users_exists = False
    alembic_exists = False
    
    async with engine.begin() as conn:
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='users'"))
        users_exists = result.scalar() is not None
        
        result = await conn.execute(text("SELECT name FROM sqlite_master WHERE type='table' AND name='alembic_version'"))
        alembic_exists = result.scalar() is not None
        
    def run_migrations():
        from alembic.config import Config
        from alembic import command
        alembic_cfg = Config("alembic.ini")
        
        if users_exists and not alembic_exists:
            # DB was created by create_all before Alembic was introduced
            command.stamp(alembic_cfg, "0455c6e66a99")
            
        command.upgrade(alembic_cfg, "head")
        
    await asyncio.to_thread(run_migrations)

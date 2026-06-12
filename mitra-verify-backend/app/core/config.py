from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    SECRET_KEY: str = "mitra-verify-super-secret-jwt-key-change-in-production-2024"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 30
    DATABASE_URL: str = "sqlite+aiosqlite:///./mitra_verify.db"
    CORS_ORIGINS: str = "http://localhost:3005,http://127.0.0.1:3005"
    ENVIRONMENT: str = "development"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"

settings = Settings()

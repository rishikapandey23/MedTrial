import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str | None = None
    MONGODB_URI: str = "mongodb://localhost:27017"
    MONGODB_DB_NAME: str = "medtrial"
    GEMINI_API_KEY: str | None = None
    JWT_SECRET_KEY: str = "9a2f7c3e5d8b1a4f0c9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 120

    class Config:
        # Load env relative to config file location
        env_file = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), ".env")
        extra = "ignore"

settings = Settings()

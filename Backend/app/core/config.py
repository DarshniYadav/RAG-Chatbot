from pydantic_settings import BaseSettings
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

class Settings(BaseSettings):
    mongo_uri: str
    mongo_db_name: str = "rag"
    gemini_api_key: str
    jwt_secret_key: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440
    chroma_persist_dir: str = str(BASE_DIR / "chroma_db")
    upload_dir: str = str(BASE_DIR / "uploads")

    class Config:
        env_file = str(BASE_DIR / ".env")
        extra = "ignore"

    @property
    def openai_api_key(self) -> str:
        return self.gemini_api_key

settings = Settings()
import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    FinixBot configuration settings.
    GROQ_API_KEY has NO default value — Pydantic will raise a ValidationError
    at application startup if GROQ_API_KEY is missing from environment or .env file.
    """
    GROQ_API_KEY: str
    GROQ_MODEL_NAME: str = "llama-3.1-8b-instant"
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-small-en-v1.5"
    CHROMA_DB_PATH: str = "./chroma_db"
    CHROMA_COLLECTION_NAME: str = "finix_faq"
    BANKING_SERVICE_URL: str = "http://localhost:9090"
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K: int = 3
    SIMILARITY_THRESHOLD: float = 0.35

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings: Settings = None

def get_settings() -> Settings:
    global settings
    if settings is None:
        settings = Settings()
    return settings

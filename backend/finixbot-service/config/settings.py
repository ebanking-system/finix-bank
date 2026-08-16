import os
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    FinixBot configuration settings.
    GROQ_API_KEY defaults to empty string allowing the bot to operate in direct-RAG
    knowledge retrieval mode if no Groq API key is provided.
    """
    GROQ_API_KEY: str = ""
    GROQ_MODEL_NAME: str = "llama-3.1-8b-instant"
    EMBEDDING_MODEL_NAME: str = "BAAI/bge-small-en-v1.5"
    CHROMA_DB_PATH: str = "./chroma_db"
    CHROMA_COLLECTION_NAME: str = "finix_faq"
    BANKING_SERVICE_URL: str = "http://api-gateway:9090"
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    TOP_K: int = 3
    SIMILARITY_THRESHOLD: float = 0.35

    model_config = SettingsConfigDict(
        env_file=(".env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings: Settings = None

def get_settings() -> Settings:
    global settings
    if settings is None:
        settings = Settings()
    return settings

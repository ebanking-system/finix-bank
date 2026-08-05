from fastapi import APIRouter
from models.schemas import HealthResponse
from config.settings import get_settings
from vectorstore.chroma_manager import get_chroma_manager

router = APIRouter(prefix="", tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def health_check():
    """
    Health check endpoint verifying ChromaDB persistence connection
    and Groq API key configuration.
    """
    settings = get_settings()
    chroma_mgr = get_chroma_manager()

    groq_ok = bool(settings.GROQ_API_KEY and len(settings.GROQ_API_KEY) > 5)
    doc_count = chroma_mgr.count()

    return HealthResponse(
        status="UP",
        groq_configured=groq_ok,
        chroma_connected=True,
        total_documents=doc_count
    )

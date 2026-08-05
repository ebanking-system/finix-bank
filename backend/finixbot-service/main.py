import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config.settings import get_settings
from api.chat_router import router as chat_router
from api.health_router import router as health_router
from api.ingest_router import router as ingest_router
from vectorstore.chroma_manager import get_chroma_manager

# Configure structured logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("finixbot-service")

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    FastAPI startup lifespan hook: loads settings and auto-indexes FAQ knowledge base.
    """
    logger.info("Initializing FinixBot RAG Service...")
    try:
        settings = get_settings()
        logger.info(f"Loaded configuration for Groq model '{settings.GROQ_MODEL_NAME}'.")
        
        chroma_mgr = get_chroma_manager()
        indexed_count = chroma_mgr.ingest_knowledge_base()
        logger.info(f"Startup ingestion complete: {indexed_count} chunks stored in ChromaDB.")
    except Exception as e:
        logger.error(f"Startup warning / configuration check: {str(e)}")

    yield
    logger.info("Shutting down FinixBot Service...")

app = FastAPI(
    title="FinixBot RAG Chatbot Service",
    description="Retrieval-Augmented Generation (RAG) assistant service for Finix Bank",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for Vite frontend and API Gateway
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(chat_router)
app.include_router(health_router)
app.include_router(ingest_router)

@app.get("/")
def root():
    return {
        "service": "FinixBot RAG Chatbot Service",
        "status": "RUNNING",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

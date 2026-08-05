from fastapi import APIRouter
from models.schemas import IngestResponse
from vectorstore.chroma_manager import get_chroma_manager

router = APIRouter(prefix="", tags=["Ingest"])

@router.post("/ingest", response_model=IngestResponse)
def reindex_knowledge_base():
    """
    Admin endpoint to re-parse and index all documents in knowledge_base/ into ChromaDB.
    """
    chroma_mgr = get_chroma_manager()
    indexed_count = chroma_mgr.ingest_knowledge_base()

    return IngestResponse(
        status="success",
        message=f"Successfully ingested and indexed {indexed_count} document chunks into ChromaDB.",
        documents_indexed=indexed_count
    )

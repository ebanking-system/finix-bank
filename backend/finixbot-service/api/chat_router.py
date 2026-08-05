import time
import logging
from fastapi import APIRouter, HTTPException, status
from models.schemas import ChatRequest, ChatResponse
from rag.rag_engine import get_rag_engine
from flows.live_api_flow import get_live_api_flow

logger = logging.getLogger(__name__)
router = APIRouter(prefix="", tags=["Chat"])

@router.post("/chat", response_model=ChatResponse)
def chat_endpoint(request: ChatRequest):
    """
    Main FinixBot conversational endpoint.
    1. Checks for account-specific live API intent if JWT is supplied.
    2. Falls through to vector search RAG over Finix FAQ knowledge base.
    3. Returns citations and source tag ('faq' | 'live_api').
    """
    start_time = time.time()
    query = request.query.strip()

    if not query:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Query string cannot be empty."
        )

    # 1. Check Live API Intent flow if JWT is present
    live_flow = get_live_api_flow()
    intent = live_flow.detect_intent(query)

    if intent and request.jwt:
        logger.info(f"Matched live API intent '{intent}' for query: '{query}'")
        answer, source = live_flow.execute_live_flow(intent, request.jwt, query)
        exec_time = round(time.time() - start_time, 3)
        return ChatResponse(
            answer=answer,
            citations=["Live Banking API"],
            source=source,
            execution_time_sec=exec_time
        )

    # 2. RAG Knowledge Base Flow
    rag_engine = get_rag_engine()
    answer, citations, source, exec_time = rag_engine.answer_query(
        query=query,
        history=request.conversation_history
    )

    return ChatResponse(
        answer=answer,
        citations=citations,
        source=source,
        execution_time_sec=exec_time
    )

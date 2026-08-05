from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class MessageTurn(BaseModel):
    role: str = Field(..., description="Role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content string")

class ChatRequest(BaseModel):
    query: str = Field(..., description="User question or query string")
    jwt: Optional[str] = Field(None, description="Optional JWT bearer token for account-specific operations")
    conversation_history: Optional[List[MessageTurn]] = Field(default=[], description="Last N conversation turns")

class ChatResponse(BaseModel):
    answer: str = Field(..., description="Generated answer from RAG or live API flow")
    citations: List[str] = Field(default=[], description="List of source document names referenced")
    source: str = Field(..., description="Origin of answer: 'faq' | 'live_api' | 'fallback'")
    execution_time_sec: float = Field(..., description="Time taken to process query in seconds")

class IngestResponse(BaseModel):
    status: str
    message: str
    documents_indexed: int

class HealthResponse(BaseModel):
    status: str
    groq_configured: bool
    chroma_connected: bool
    total_documents: int

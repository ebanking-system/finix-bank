import time
import logging
from typing import List, Dict, Any, Tuple
import requests

from config.settings import get_settings
from vectorstore.chroma_manager import get_chroma_manager
from prompts.system_prompts import FINIXBOT_SYSTEM_PROMPT
from rag.history_manager import format_history
from models.schemas import MessageTurn

logger = logging.getLogger(__name__)

class RAGEngine:
    def __init__(self):
        self.settings = get_settings()
        self.chroma_mgr = get_chroma_manager()

    def generate_groq_response(self, system_prompt: str, user_query: str) -> str:
        """
        Calls the Groq API (free tier, llama-3.1-8b-instant) to generate answer.
        Uses raw HTTP requests to avoid version mismatches with groq SDK.
        """
        api_key = self.settings.GROQ_API_KEY
        if not api_key:
            raise ValueError("GROQ_API_KEY is not configured.")

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.settings.GROQ_MODEL_NAME,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_query}
            ],
            "temperature": 0.2,
            "max_tokens": 600
        }

        try:
            resp = requests.post(url, json=payload, headers=headers, timeout=15)
            if resp.status_code == 200:
                data = resp.json()
                return data["choices"][0]["message"]["content"].strip()
            else:
                logger.error(f"Groq API returned HTTP {resp.status_code}: {resp.text}")
                return "I'm experiencing high traffic right now. Please try again in a few moments or contact Finix Bank support at 1800-FINIX-BANK."
        except Exception as e:
            logger.error(f"Failed to query Groq API: {str(e)}")
            return "I'm having trouble connecting to my reasoning engine right now. Please contact customer support."

    def answer_query(
        self, query: str, history: List[MessageTurn] = None
    ) -> Tuple[str, List[str], str, float]:
        """
        Executes full RAG workflow:
        1. Query ChromaDB for top-K context chunks above similarity threshold.
        2. If match found: build prompt and generate Groq answer.
        3. If no match above threshold: return friendly fallback without LLM hallucination.
        """
        start_time = time.time()
        relevant_chunks = self.chroma_mgr.similarity_search(query)

        if not relevant_chunks:
            exec_time = round(time.time() - start_time, 3)
            fallback = (
                "I'm not sure about that — try rephrasing your question, or contact our "
                "24/7 Finix Support team at **1800-FINIX-BANK** (1800-34649-2265) or **support@finixbank.com**."
            )
            return fallback, [], "faq", exec_time

        # Aggregate context & citations
        context_parts = []
        citations = set()
        for idx, chunk in enumerate(relevant_chunks, 1):
            src_file = chunk["metadata"].get("source", "FAQ Document")
            citations.add(src_file)
            context_parts.append(f"[Source {idx}: {src_file}]\n{chunk['text']}")

        context_text = "\n\n".join(context_parts)
        if history:
            hist_str = format_history(history)
            if hist_str:
                context_text = f"CONVERSATION HISTORY:\n{hist_str}\n\n" + context_text

        system_prompt = FINIXBOT_SYSTEM_PROMPT.format(context=context_text, query=query)
        answer = self.generate_groq_response(system_prompt, query)
        exec_time = round(time.time() - start_time, 3)

        return answer, sorted(list(citations)), "faq", exec_time

_rag_engine_instance = None

def get_rag_engine() -> RAGEngine:
    global _rag_engine_instance
    if _rag_engine_instance is None:
        _rag_engine_instance = RAGEngine()
    return _rag_engine_instance

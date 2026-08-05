import logging
from typing import List
from sentence_transformers import SentenceTransformer

logger = logging.getLogger(__name__)

class EmbeddingManager:
    def __init__(self, model_name: str = "BAAI/bge-small-en-v1.5"):
        self.model_name = model_name
        logger.info(f"Loading local HuggingFace embedding model: {model_name}...")
        self.model = SentenceTransformer(model_name)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        embeddings = self.model.encode(texts, show_progress_bar=False, convert_to_numpy=True)
        return embeddings.tolist()

    def embed_query(self, text: str) -> List[float]:
        embedding = self.model.encode(text, show_progress_bar=False, convert_to_numpy=True)
        return embedding.tolist()

_embedding_instance = None

def get_embedding_manager(model_name: str = "BAAI/bge-small-en-v1.5") -> EmbeddingManager:
    global _embedding_instance
    if _embedding_instance is None:
        _embedding_instance = EmbeddingManager(model_name)
    return _embedding_instance

import os
import glob
import logging
from typing import List, Dict, Any, Tuple
import chromadb
from chromadb.config import Settings as ChromaSettings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config.settings import get_settings
from vectorstore.embeddings import get_embedding_manager

logger = logging.getLogger(__name__)

class ChromaManager:
    def __init__(self):
        self.settings = get_settings()
        self.chroma_client = chromadb.PersistentClient(path=self.settings.CHROMA_DB_PATH)
        self.embedding_mgr = get_embedding_manager(self.settings.EMBEDDING_MODEL_NAME)
        self.collection = self.chroma_client.get_or_create_collection(
            name=self.settings.CHROMA_COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )

    def ingest_knowledge_base(self, knowledge_base_dir: str = "knowledge_base") -> int:
        """
        Reads markdown and text files from knowledge_base directory,
        chunks them, computes embeddings, and stores in ChromaDB.
        """
        if not os.path.exists(knowledge_base_dir):
            logger.warning(f"Knowledge base directory '{knowledge_base_dir}' does not exist.")
            return 0

        files = glob.glob(os.path.join(knowledge_base_dir, "*.md")) + \
                glob.glob(os.path.join(knowledge_base_dir, "*.txt"))

        if not files:
            logger.warning("No .md or .txt files found in knowledge_base directory.")
            return 0

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=self.settings.CHUNK_SIZE,
            chunk_overlap=self.settings.CHUNK_OVERLAP
        )

        documents = []
        metadatas = []
        ids = []
        doc_count = 0

        for file_path in files:
            filename = os.path.basename(file_path)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            chunks = text_splitter.split_text(content)
            for i, chunk in enumerate(chunks):
                chunk_id = f"{filename}_chunk_{i}"
                documents.append(chunk)
                metadatas.append({"source": filename, "chunk_index": i})
                ids.append(chunk_id)
                doc_count += 1

        if documents:
            embeddings = self.embedding_mgr.embed_documents(documents)
            self.collection.upsert(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Ingested {doc_count} chunks from {len(files)} files into ChromaDB.")

        return doc_count

    def similarity_search(self, query: str, top_k: int = None, threshold: float = None) -> List[Dict[str, Any]]:
        """
        Queries ChromaDB for chunks similar to the input query.
        Returns a list of dicts with text, metadata, and distance.
        """
        k = top_k or self.settings.TOP_K
        sim_threshold = threshold if threshold is not None else self.settings.SIMILARITY_THRESHOLD

        if self.collection.count() == 0:
            # Auto-ingest if collection is empty
            self.ingest_knowledge_base()

        if self.collection.count() == 0:
            return []

        query_embedding = self.embedding_mgr.embed_query(query)
        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=k,
            include=["documents", "metadatas", "distances"]
        )

        relevant_chunks = []
        if results and results.get("documents"):
            docs = results["documents"][0]
            metas = results["metadatas"][0]
            distances = results["distances"][0]

            for doc, meta, dist in zip(docs, metas, distances):
                # For cosine distance: similarity = 1 - distance
                similarity = 1.0 - dist
                if similarity >= sim_threshold:
                    relevant_chunks.append({
                        "text": doc,
                        "metadata": meta,
                        "similarity": similarity,
                        "distance": dist
                    })

        return relevant_chunks

    def count(self) -> int:
        return self.collection.count()

_chroma_instance = None

def get_chroma_manager() -> ChromaManager:
    global _chroma_instance
    if _chroma_instance is None:
        _chroma_instance = ChromaManager()
    return _chroma_instance

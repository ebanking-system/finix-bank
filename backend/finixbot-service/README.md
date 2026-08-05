# FinixBot RAG Service

Retrieval-Augmented Generation (RAG) AI Chatbot Service for **Finix Bank**, powered by FastAPI, ChromaDB, HuggingFace embeddings (`BAAI/bge-small-en-v1.5`), and the Groq API (`llama-3.1-8b-instant`).

## Features
- **Zero-Cost RAG Pipeline**: Uses local CPU embeddings (`sentence-transformers`) and free-tier Groq API for generation.
- **Local Persistent Vector Store**: ChromaDB at `./chroma_db` requiring no cloud DB dependencies.
- **Live Account Flow**: Recognizes intent for account balance, loan status, KYC, and recent transactions, invoking real backend APIs using forwarded customer JWT.
- **Auto-Ingestion**: Automatically parses and indexes `.md` files in `knowledge_base/` at startup.

---

## Local Setup & Execution

### 1. Environment Configuration
Create a `.env` file inside `backend/finixbot-service/` (this file is `.gitignore`d):

```env
GROQ_API_KEY=gsk_your_actual_groq_key_here
GROQ_MODEL_NAME=llama-3.1-8b-instant
EMBEDDING_MODEL_NAME=BAAI/bge-small-en-v1.5
CHROMA_DB_PATH=./chroma_db
CHROMA_COLLECTION_NAME=finix_faq
BANKING_SERVICE_URL=http://localhost:9090
```

> **Note**: `GROQ_API_KEY` is required. The application will fail at startup if missing.

### 2. Install Dependencies
```bash
cd backend/finixbot-service
python -m venv .venv
# On Windows:
.venv\Scripts\activate
# On Linux/macOS:
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Run FastAPI Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
Interactive API Documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## How to Add New FAQ Documents & Re-Ingest

1. Drop new markdown (`.md`) or text (`.txt`) files into the `knowledge_base/` folder.
2. Trigger the ingestion endpoint:
```bash
curl -X POST http://localhost:8000/ingest
```
3. The new document chunks will be embedded and upserted into ChromaDB immediately.

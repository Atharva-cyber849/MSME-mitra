# MSME Business Support Chatbot - Backend

This is the ML/AI backend for the MSME Business Support Chatbot, featuring:

- **Intent Classification** using DistilBERT
- **Knowledge Retrieval** using RAG (Retrieval-Augmented Generation) with ChromaDB
- **Language Detection** for multilingual support
- **Response Generation** with confidence-based fallback

## Prerequisites

- Python 3.8 or higher
- pip (Python package manager)
- 2GB free disk space (for models)
- 4GB RAM minimum (8GB recommended)

## Installation

### 1. Create Virtual Environment (Recommended)

```bash
# Windows
python -m venv venv
venv\Scripts\activate

# Linux/Mac
python3 -m venv venv
source venv/bin/activate
```

### 2. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- FastAPI and Uvicorn (web framework)
- Transformers and PyTorch (ML models)
- Sentence Transformers (embeddings)
- ChromaDB (vector database)
- Other utilities

## Setup

### 3. Download Models

Download the required ML models (~500MB):

```bash
python scripts/download_models.py
```

This downloads:
- DistilBERT for intent classification
- Sentence Transformer for embeddings

### 4. Initialize Knowledge Base

Set up the vector database with MSME documents:

```bash
python scripts/setup_knowledge_base.py
```

This will:
- Create sample MSME documents (MUDRA loans, GST, Udyam, schemes)
- Process and chunk documents
- Generate embeddings
- Populate ChromaDB

## Running the Server

### Development Mode

```bash
python main.py
```

Or using uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at: **http://localhost:8000**

### API Documentation

Once running, visit:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## API Endpoints

### POST /api/chat

Main chatbot endpoint.

**Request:**
```json
{
  "message": "Tell me about MUDRA loans",
  "language": "en"
}
```

**Response:**
```json
{
  "response": "Based on the available information...",
  "intent": "Loans & Subsidies",
  "confidence": 0.92,
  "detected_language": "en",
  "language_confidence": 0.85,
  "sources": ["mudra_loans.txt"],
  "all_intent_scores": {
    "Loans & Subsidies": 0.92,
    "GST & Compliance": 0.03,
    ...
  }
}
```

### GET /api/health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "knowledge_base_stats": {
    "total_documents": 45,
    "collection_name": "msme_knowledge_base"
  }
}
```

### GET /api/stats

System statistics.

## Adding Custom Documents

### 1. Add Documents to Knowledge Base

Place your PDF, TXT, or MD files in the `knowledge_base/` directory:

```bash
backend/
  knowledge_base/
    your_document.pdf
    another_doc.txt
```

### 2. Re-index Knowledge Base

```bash
python scripts/setup_knowledge_base.py
```

Choose "yes" when prompted to re-index.

### 3. Document Naming Convention

For automatic intent mapping, include keywords in filenames:
- `mudra_*.pdf` → "Loans & Subsidies"
- `gst_*.pdf` → "GST & Compliance"
- `udyam_*.pdf` → "Udyam Registration"
- `scheme_*.pdf` → "Government Schemes"

## Configuration

Edit `config.py` to customize:

```python
# Confidence thresholds
INTENT_CONFIDENCE_THRESHOLD = 0.65  # Minimum confidence for intent
RETRIEVAL_CONFIDENCE_THRESHOLD = 0.5  # Minimum for document relevance

# RAG settings
CHUNK_SIZE = 512  # Characters per chunk
CHUNK_OVERLAP = 50  # Overlap between chunks
TOP_K_RETRIEVAL = 3  # Number of documents to retrieve

# Models
INTENT_MODEL_NAME = "distilbert-base-uncased"
EMBEDDING_MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
```

## Architecture

```
User Query
    ↓
Language Detection (langdetect)
    ↓
Text Preprocessing (cleaning, normalization)
    ↓
Intent Classification (DistilBERT)
    ↓
Knowledge Retrieval (ChromaDB + Sentence Transformers)
    ↓
Response Generation (Template + RAG)
    ↓
Confidence Check & Response
```

## Troubleshooting

### Models not loading

```bash
# Clear cache and re-download
rm -rf models_cache/
python scripts/download_models.py
```

### ChromaDB errors

```bash
# Delete and recreate database
rm -rf chroma_db/
python scripts/setup_knowledge_base.py
```

### Port already in use

Change port in `config.py`:
```python
API_PORT = 8001  # Use different port
```

### Out of memory

Reduce batch size or use CPU-only mode:
```python
# In intent_classifier.py
self.device = torch.device('cpu')  # Force CPU
```

## Testing

Run tests (if implemented):

```bash
pytest tests/ -v
```

## Production Deployment

For production, use:

```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

Or use Docker (create Dockerfile):

```dockerfile
FROM python:3.9-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
RUN python scripts/download_models.py
RUN python scripts/setup_knowledge_base.py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

## Support

For issues or questions:
- Check logs in console output
- Verify models are downloaded
- Ensure knowledge base is initialized
- Check API documentation at /docs

## License

MIT License

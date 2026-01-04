"""
FastAPI backend for MSME Business Support Chatbot
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import List, Optional, Dict
import logging
import sys
import json
from datetime import datetime
from pathlib import Path

from config import settings
from models.language_detector import language_detector
from models.text_preprocessor import text_preprocessor
from models.intent_classifier import intent_classifier
from models.knowledge_retrieval import knowledge_retrieval
from models.response_generator import response_generator

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="MSME Business Support Chatbot API",
    description="ML/AI backend for MSME chatbot with intent classification and RAG",
    version="1.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware to prevent caching
@app.middleware("http")
async def add_no_cache_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Cache-Control"] = "no-cache, no-store, must-revalidate"
    response.headers["Pragma"] = "no-cache"
    response.headers["Expires"] = "0"
    return response


# Request/Response models
class ChatRequest(BaseModel):
    message: str
    language: Optional[str] = "en"


class ChatResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    detected_language: str
    language_confidence: float
    sources: List[str] = []
    all_intent_scores: Optional[Dict[str, float]] = None


class FeedbackRequest(BaseModel):
    message: str
    response: str
    intent: str
    confidence: float
    rating: int  # 1 for thumbs up, -1 for thumbs down
    comment: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    knowledge_base_stats: Dict


# Global state
models_loaded = False


@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    global models_loaded
    
    try:
        logger.info("Starting model initialization...")
        
        # Load intent classifier
        logger.info("Loading intent classifier...")
        intent_classifier.load_model()
        
        # Load knowledge retrieval system
        logger.info("Loading knowledge retrieval system...")
        knowledge_retrieval.load_models()
        
        models_loaded = True
        logger.info("All models loaded successfully!")
        
    except Exception as e:
        logger.error(f"Failed to load models: {e}")
        logger.warning("Server will start but chat functionality will be limited")


@app.get("/", response_model=Dict)
async def root():
    """Root endpoint"""
    return {
        "message": "MSME Business Support Chatbot API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """Health check endpoint"""
    kb_stats = knowledge_retrieval.get_collection_stats()
    
    return HealthResponse(
        status="healthy" if models_loaded else "degraded",
        models_loaded=models_loaded,
        knowledge_base_stats=kb_stats
    )


@app.post("/api/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    """
    Main chat endpoint
    
    Process user message through the ML pipeline:
    1. Language detection
    2. Text preprocessing
    3. Intent classification
    4. Knowledge retrieval
    5. Response generation
    """
    if not models_loaded:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Please try again later."
        )
    
    try:
        user_message = request.message.strip()
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        logger.info(f"Processing message: {user_message[:100]}...")
        
        # Step 1: Language Detection
        detected_lang, lang_confidence = language_detector.detect_language(user_message)
        logger.info(f"Detected language: {detected_lang} (confidence: {lang_confidence:.2f})")
        
        # Step 2: Text Preprocessing
        preprocessed_text = text_preprocessor.normalize_query(user_message)
        logger.info(f"Preprocessed text: {preprocessed_text[:100]}...")
        
        # Step 3: Intent Classification
        intent, intent_confidence, all_scores = intent_classifier.classify_intent(
            preprocessed_text
        )
        logger.info(f"Intent: {intent} (confidence: {intent_confidence:.2f})")
        
        # Step 4: Knowledge Retrieval (if not greeting or unknown)
        retrieved_docs = []
        if intent not in ["Greeting or general conversation", "Unknown or unclear question"] and intent_confidence >= settings.INTENT_CONFIDENCE_THRESHOLD:
            retrieved_docs = knowledge_retrieval.retrieve(
                query=preprocessed_text,
                intent=intent,
                top_k=settings.TOP_K_RETRIEVAL
            )
            logger.info(f"Retrieved {len(retrieved_docs)} documents")
        
        # Step 5: Response Generation
        response_text, sources = response_generator.generate_response(
            intent=intent,
            confidence=intent_confidence,
            retrieved_docs=retrieved_docs,
            query=user_message
        )
        
        logger.info("Response generated successfully")
        logger.info(f"📤 Final response length: {len(response_text)} chars")
        logger.info(f"📤 Sources included: {sources}")
        logger.info(f"📤 Response preview: {response_text[:200]}...")
        
        return ChatResponse(
            response=response_text,
            intent=intent,
            confidence=intent_confidence,
            detected_language=detected_lang,
            language_confidence=lang_confidence,
            sources=sources,
            all_intent_scores=all_scores
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing chat request: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")


@app.get("/api/stats")
async def get_stats():
    """Get system statistics"""
    if not models_loaded:
        return {"error": "Models not loaded"}
    
    kb_stats = knowledge_retrieval.get_collection_stats()
    
    return {
        "models_loaded": models_loaded,
        "intent_labels": settings.INTENT_LABELS,
        "supported_languages": settings.SUPPORTED_LANGUAGES,
        "knowledge_base": kb_stats,
        "config": {
            "intent_threshold": settings.INTENT_CONFIDENCE_THRESHOLD,
            "retrieval_threshold": settings.RETRIEVAL_CONFIDENCE_THRESHOLD,
            "top_k": settings.TOP_K_RETRIEVAL
        }
    }


@app.post("/api/feedback")
async def submit_feedback(feedback: FeedbackRequest):
    """Store user feedback for response quality"""
    try:
        feedback_dir = Path("feedback")
        feedback_dir.mkdir(exist_ok=True)
        
        feedback_file = feedback_dir / "user_feedback.jsonl"
        
        # Create feedback entry
        feedback_entry = {
            "timestamp": datetime.now().isoformat(),
            "message": feedback.message,
            "response": feedback.response,
            "intent": feedback.intent,
            "confidence": feedback.confidence,
            "rating": feedback.rating,
            "comment": feedback.comment
        }
        
        # Append to JSONL file
        with open(feedback_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_entry) + "\n")
        
        logger.info(f"Feedback received: rating={feedback.rating}, intent={feedback.intent}")
        
        return {
            "status": "success",
            "message": "Thank you for your feedback!"
        }
        
    except Exception as e:
        logger.error(f"Error storing feedback: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to store feedback: {str(e)}")


@app.get("/api/feedback/stats")
async def get_feedback_stats():
    """Get feedback statistics"""
    try:
        feedback_file = Path("feedback") / "user_feedback.jsonl"
        
        if not feedback_file.exists():
            return {
                "total_feedback": 0,
                "positive": 0,
                "negative": 0,
                "satisfaction_rate": 0.0
            }
        
        total = 0
        positive = 0
        negative = 0
        intent_stats = {}
        
        with open(feedback_file, "r", encoding="utf-8") as f:
            for line in f:
                entry = json.loads(line)
                total += 1
                
                if entry["rating"] > 0:
                    positive += 1
                else:
                    negative += 1
                
                intent = entry["intent"]
                if intent not in intent_stats:
                    intent_stats[intent] = {"positive": 0, "negative": 0}
                
                if entry["rating"] > 0:
                    intent_stats[intent]["positive"] += 1
                else:
                    intent_stats[intent]["negative"] += 1
        
        satisfaction_rate = (positive / total * 100) if total > 0 else 0.0
        
        return {
            "total_feedback": total,
            "positive": positive,
            "negative": negative,
            "satisfaction_rate": round(satisfaction_rate, 2),
            "by_intent": intent_stats
        }
        
    except Exception as e:
        logger.error(f"Error reading feedback stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to read feedback: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )

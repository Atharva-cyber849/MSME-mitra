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
import re
from datetime import datetime
from pathlib import Path

from config import settings
from models.language_detector import language_detector
from models.text_preprocessor import text_preprocessor
from models.intent_classifier import intent_classifier
from models.knowledge_retrieval import knowledge_retrieval
from models.response_generator import response_generator
from utils.conversation_manager import conversation_manager
from utils.analytics import analytics

# Import Groq for AI question generation
try:
    from groq import Groq
    GROQ_AVAILABLE = True
except ImportError:
    GROQ_AVAILABLE = False

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
    session_id: Optional[str] = None


class ChatResponse(BaseModel):
    response: str
    intent: str
    confidence: float
    detected_language: str
    language_confidence: float
    sources: List[str] = []
    all_intent_scores: Optional[Dict[str, float]] = None
    session_id: str
    suggested_questions: List[str] = []
    rich_content: Optional[Dict] = None


class FeedbackRequest(BaseModel):
    message: str
    response: str
    intent: str
    confidence: float
    rating: int  # 1 for thumbs up, -1 for thumbs down
    comment: Optional[str] = None
    session_id: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    models_loaded: bool
    knowledge_base_stats: Dict


class BusinessProfile(BaseModel):
    type: Optional[str] = None  # e.g., "Manufacturing", "Retail", "Services"
    size: Optional[str] = None  # e.g., "Micro", "Small", "Medium"
    location: Optional[str] = None  # e.g., "Mumbai", "Delhi"
    stage: Optional[str] = None  # e.g., "Planning", "Starting", "Established"
    industry: Optional[str] = None  # e.g., "Food", "Textiles", "Technology"


class BusinessProfileRequest(BaseModel):
    session_id: str
    profile: BusinessProfile


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
    6. Conversation history tracking
    7. Analytics logging
    """
    if not models_loaded:
        raise HTTPException(
            status_code=503,
            detail="Models not loaded. Please try again later."
        )
    
    try:
        import time
        start_time = time.time()
        
        user_message = request.message.strip()
        
        if not user_message:
            raise HTTPException(status_code=400, detail="Message cannot be empty")
        
        # Get or create session
        session_id = request.session_id
        if not session_id:
            session_id = conversation_manager.create_session()
        
        logger.info(f"Processing message: {user_message[:100]}... [Session: {session_id}]")
        
        # Step 1: Language Detection (use user-selected language if provided, otherwise auto-detect)
        if request.language and request.language != "auto":
            detected_lang = request.language
            lang_confidence = 1.0  # User explicitly selected this language
            logger.info(f"Using user-selected language: {detected_lang}")
        else:
            detected_lang, lang_confidence = language_detector.detect_language(user_message)
            logger.info(f"Auto-detected language: {detected_lang} (confidence: {lang_confidence:.2f})")
        
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
        
        # Get business profile from session context
        business_profile = conversation_manager.get_context(session_id, "business_profile")
        
        # Step 5: Response Generation with language and business context
        response_text, sources = response_generator.generate_response(
            intent=intent,
            confidence=intent_confidence,
            retrieved_docs=retrieved_docs,
            query=user_message,
            detected_language=detected_lang,
            business_profile=business_profile
        )
        
        # Step 6: Generate AI-powered suggested follow-up questions
        suggested_questions = _generate_ai_suggested_questions(
            user_query=user_message,
            bot_response=response_text,
            intent=intent,
            language=detected_lang
        )
        
        # Step 7: Generate rich content (links, buttons, etc.)
        rich_content = _generate_rich_content(intent, sources)
        
        # Calculate response time
        response_time = time.time() - start_time
        
        # Add to conversation history
        conversation_manager.add_message(
            session_id=session_id,
            role="user",
            content=user_message,
            intent=intent,
            confidence=intent_confidence
        )
        conversation_manager.add_message(
            session_id=session_id,
            role="assistant",
            content=response_text,
            intent=intent,
            confidence=intent_confidence
        )
        
        # Log analytics
        analytics.log_query(
            user_query=user_message,
            intent=intent,
            confidence=intent_confidence,
            detected_language=detected_lang,
            response_time=response_time,
            success=True,
            session_id=session_id
        )
        
        logger.info("Response generated successfully")
        logger.info(f"📤 Final response length: {len(response_text)} chars")
        logger.info(f"📤 Sources included: {sources}")
        logger.info(f"📤 Response time: {response_time:.2f}s")
        logger.info(f"📤 Response preview: {response_text[:200]}...")
        
        return ChatResponse(
            response=response_text,
            intent=intent,
            confidence=intent_confidence,
            detected_language=detected_lang,
            language_confidence=lang_confidence,
            sources=sources,
            all_intent_scores=all_scores,
            session_id=session_id,
            suggested_questions=suggested_questions,
            rich_content=rich_content
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
            "comment": feedback.comment,
            "session_id": feedback.session_id
        }
        
        # Append to JSONL file
        with open(feedback_file, "a", encoding="utf-8") as f:
            f.write(json.dumps(feedback_entry) + "\n")
        
        # Log to analytics
        analytics.log_feedback(
            rating=feedback.rating,
            intent=feedback.intent,
            comment=feedback.comment,
            session_id=feedback.session_id
        )
        
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


@app.get("/api/analytics/dashboard")
async def get_analytics_dashboard():
    """Get comprehensive analytics dashboard data"""
    try:
        dashboard_data = analytics.get_dashboard_summary()
        session_stats = conversation_manager.get_session_stats()
        
        return {
            **dashboard_data,
            "session_stats": session_stats
        }
    except Exception as e:
        logger.error(f"Error fetching analytics: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to fetch analytics: {str(e)}")


@app.get("/api/analytics/popular")
async def get_popular_queries(days: int = 7, limit: int = 10):
    """Get most popular query intents"""
    try:
        return analytics.get_popular_queries(limit=limit, days=days)
    except Exception as e:
        logger.error(f"Error fetching popular queries: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/analytics/daily")
async def get_daily_analytics(days: int = 7):
    """Get daily statistics"""
    try:
        return analytics.get_daily_stats(days=days)
    except Exception as e:
        logger.error(f"Error fetching daily stats: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/conversation/history/{session_id}")
async def get_conversation_history(session_id: str):
    """Get conversation history for a session"""
    try:
        history = conversation_manager.get_conversation_history(session_id)
        return {"session_id": session_id, "messages": history}
    except Exception as e:
        logger.error(f"Error fetching conversation history: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/conversation/new")
async def create_new_conversation():
    """Create a new conversation session"""
    try:
        session_id = conversation_manager.create_session()
        return {"session_id": session_id}
    except Exception as e:
        logger.error(f"Error creating session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/business-profile")
async def set_business_profile(request: BusinessProfileRequest):
    """Set business profile for personalized recommendations"""
    try:
        session_id = request.session_id
        profile_dict = request.profile.dict(exclude_none=True)
        
        # Store in session context
        conversation_manager.update_context(session_id, "business_profile", profile_dict)
        
        logger.info(f"Business profile set for session {session_id}: {profile_dict}")
        
        return {
            "status": "success",
            "message": "Business profile saved successfully",
            "profile": profile_dict
        }
    except Exception as e:
        logger.error(f"Error setting business profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/business-profile/{session_id}")
async def get_business_profile(session_id: str):
    """Get business profile for a session"""
    try:
        profile = conversation_manager.get_context(session_id, "business_profile")
        
        if not profile:
            return {"session_id": session_id, "profile": None}
        
        return {"session_id": session_id, "profile": profile}
    except Exception as e:
        logger.error(f"Error getting business profile: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/quick-actions")
async def get_quick_actions():
    """Get predefined quick action queries"""
    quick_actions = [
        {
            "id": "eligibility_mudra",
            "category": "Loans",
            "title": "Check MUDRA Loan Eligibility",
            "query": "What are the eligibility criteria for MUDRA loans?",
            "icon": "DollarSign",
            "color": "primary"
        },
        {
            "id": "gst_registration",
            "category": "Registration",
            "title": "GST Registration Process",
            "query": "How do I register for GST?",
            "icon": "FileText",
            "color": "accent"
        },
        {
            "id": "udyam_register",
            "category": "Registration",
            "title": "Udyam Registration",
            "query": "How to register for Udyam?",
            "icon": "Building",
            "color": "success"
        },
        {
            "id": "calculate_emi",
            "category": "Financial",
            "title": "Calculate Loan EMI",
            "query": "How to calculate EMI for business loans?",
            "icon": "Calculator",
            "color": "primary"
        },
        {
            "id": "schemes_women",
            "category": "Schemes",
            "title": "Schemes for Women Entrepreneurs",
            "query": "What schemes are available for women entrepreneurs?",
            "icon": "Award",
            "color": "accent"
        },
        {
            "id": "licenses_required",
            "category": "Compliance",
            "title": "Required Licenses",
            "query": "What licenses do I need to start my business?",
            "icon": "Shield",
            "color": "success"
        },
        {
            "id": "tax_benefits",
            "category": "Financial",
            "title": "MSME Tax Benefits",
            "query": "What tax benefits are available for MSMEs?",
            "icon": "TrendingUp",
            "color": "primary"
        },
        {
            "id": "subsidy_manufacturing",
            "category": "Schemes",
            "title": "Manufacturing Subsidies",
            "query": "What subsidies are available for manufacturing businesses?",
            "icon": "Factory",
            "color": "accent"
        },
        {
            "id": "digital_marketing",
            "category": "Growth",
            "title": "Digital Marketing Guide",
            "query": "How to start digital marketing for my business?",
            "icon": "Megaphone",
            "color": "success"
        },
        {
            "id": "export_assistance",
            "category": "Growth",
            "title": "Export Assistance",
            "query": "What support is available for exporting products?",
            "icon": "Globe",
            "color": "primary"
        },
        {
            "id": "employee_compliance",
            "category": "Compliance",
            "title": "Employee Laws & Compliance",
            "query": "What are the labor laws for small businesses?",
            "icon": "Users",
            "color": "accent"
        },
        {
            "id": "credit_guarantee",
            "category": "Loans",
            "title": "Credit Guarantee Scheme",
            "query": "What is the Credit Guarantee Scheme for MSMEs?",
            "icon": "ShieldCheck",
            "color": "success"
        }
    ]
    
    return {"actions": quick_actions}


@app.post("/api/conversation/new")
async def create_new_conversation():
    """Create a new conversation session"""
    try:
        session_id = conversation_manager.create_session()
        return {"session_id": session_id}
    except Exception as e:
        logger.error(f"Error creating session: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )


# Helper functions
def _generate_ai_suggested_questions(
    user_query: str, 
    bot_response: str, 
    intent: str,
    language: str = "en"
) -> List[str]:
    """Generate contextual follow-up questions using AI based on the conversation"""
    
    # If Groq is not available, fall back to static suggestions
    if not response_generator.use_groq or not GROQ_AVAILABLE:
        return _generate_suggested_questions(intent, confidence=0.9)
    
    try:
        # Create prompt for generating follow-up questions
        prompt = f"""Based on this conversation, generate 3 highly relevant and contextual follow-up questions that a business owner might naturally ask next.

User Query: {user_query}
Bot Response: {bot_response}
Topic Area: {intent}

Requirements:
1. Questions should be specific and directly related to the conversation
2. Questions should help the user learn more or take next steps
3. Make questions natural and conversational
4. Keep questions short (max 10-12 words each)
5. Questions should be in {'Hindi (using Devanagari script)' if language == 'hi' else 'English'}

Generate exactly 3 follow-up questions, one per line, without numbering or bullet points."""

        # Use Groq to generate questions
        chat_completion = response_generator.groq_client.chat.completions.create(
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates follow-up questions for MSME business owners."},
                {"role": "user", "content": prompt}
            ],
            model=settings.GROQ_MODEL_NAME,
            temperature=0.8,
            max_tokens=200,
        )
        
        if chat_completion and chat_completion.choices[0].message.content:
            response_text = chat_completion.choices[0].message.content
            # Parse the response into a list of questions
            questions = [q.strip() for q in response_text.strip().split('\n') if q.strip()]
            # Remove any numbering or bullets that might appear
            questions = [re.sub(r'^[\d\-\*\•\.]+\s*', '', q) for q in questions]
            # Return up to 3 questions
            return questions[:3] if questions else _generate_suggested_questions(intent, confidence=0.9)
        
    except Exception as e:
        logger.error(f"Error generating AI suggested questions: {e}")
    
    # Fallback to static suggestions if AI generation fails
    return _generate_suggested_questions(intent, confidence=0.9)


def _generate_suggested_questions(intent: str, confidence: float) -> List[str]:
    """Generate contextual follow-up questions based on intent (fallback method)"""
    
    suggestions = {
        "Questions about MUDRA loans, business loans, subsidies, or financial support": [
            "What documents are required for MUDRA loan?",
            "What is the interest rate for MUDRA loans?",
            "How long does loan approval take?",
            "What are the different types of MUDRA loans?"
        ],
        "Questions about GST registration, tax filing, or compliance": [
            "What is the GST registration process?",
            "What documents are needed for GST registration?",
            "When do I need to file GST returns?",
            "What are the GST rates for different products?"
        ],
        "Questions about Udyam registration or MSME business registration": [
            "How do I register for Udyam?",
            "Is Udyam registration mandatory?",
            "What documents are needed for Udyam?",
            "What are the benefits of Udyam registration?"
        ],
        "Questions about government schemes or business support programs": [
            "What schemes are available for MSMEs?",
            "How can I apply for PMEGP scheme?",
            "What is the Credit Guarantee Scheme?",
            "Are there subsidies for women entrepreneurs?"
        ],
        "Questions about business licenses, permits, or regulatory requirements": [
            "What licenses do I need for manufacturing?",
            "How do I get trade license?",
            "What are the environmental clearance requirements?",
            "Do I need FSSAI license for food business?"
        ],
        "Questions about employee management, labor laws, or HR compliance": [
            "What are the labor laws for small businesses?",
            "How do I register under ESI and PF?",
            "What is the minimum wage requirement?",
            "What are the leave policies for employees?"
        ],
        "Questions about tax compliance, filing, or accounting": [
            "How do I file income tax for my business?",
            "What is the due date for tax filing?",
            "What deductions are available for MSMEs?",
            "Do I need to maintain accounting books?"
        ],
        "Questions about digital marketing, e-commerce, or online business": [
            "How can I start selling online?",
            "What are the best digital marketing strategies?",
            "How do I set up an e-commerce website?",
            "What is the GeM portal?"
        ]
    }
    
    # Return suggestions based on intent
    if intent in suggestions and confidence >= settings.INTENT_CONFIDENCE_THRESHOLD:
        return suggestions[intent][:3]  # Return top 3 suggestions
    
    # Default generic suggestions
    return [
        "Tell me about MUDRA loans",
        "How do I register for GST?",
        "What is Udyam registration?"
    ]


def _generate_rich_content(intent: str, sources: List[str]) -> Optional[Dict]:
    """Generate rich content like links, buttons, and formatted elements"""
    
    rich_content = {
        "links": [],
        "actions": [],
        "info_cards": []
    }
    
    # Add official government links based on intent
    official_links = {
        "Questions about MUDRA loans, business loans, subsidies, or financial support": [
            {"text": "MUDRA Official Portal", "url": "https://www.mudra.org.in/"},
            {"text": "Apply for MUDRA Loan", "url": "https://udyamimitra.in/"},
        ],
        "Questions about GST registration, tax filing, or compliance": [
            {"text": "GST Portal", "url": "https://www.gst.gov.in/"},
            {"text": "GST Registration Guide", "url": "https://tutorial.gst.gov.in/"},
        ],
        "Questions about Udyam registration or MSME business registration": [
            {"text": "Udyam Registration Portal", "url": "https://udyamregistration.gov.in/"},
            {"text": "MSME Ministry", "url": "https://msme.gov.in/"},
        ],
        "Questions about government schemes or business support programs": [
            {"text": "MSME Schemes", "url": "https://msme.gov.in/schemes-and-programmes"},
            {"text": "PMEGP Portal", "url": "https://www.kviconline.gov.in/pmegpeportal/"},
        ],
    }
    
    if intent in official_links:
        rich_content["links"] = official_links[intent]
    
    # Add action buttons
    if "loan" in intent.lower():
        rich_content["actions"].append({
            "type": "calculate",
            "text": "Calculate EMI",
            "icon": "calculator"
        })
    
    if "gst" in intent.lower() or "tax" in intent.lower():
        rich_content["actions"].append({
            "type": "download",
            "text": "Download GST Guide",
            "icon": "download"
        })
    
    # Add helpline info card
    rich_content["info_cards"].append({
        "type": "helpline",
        "title": "Need Help?",
        "content": "MSME Helpline: 1800-11-6446\nEmail: helpdesk-msme@gov.in",
        "icon": "phone"
    })
    
    return rich_content if (rich_content["links"] or rich_content["actions"]) else None

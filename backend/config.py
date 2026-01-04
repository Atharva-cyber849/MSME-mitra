from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    """Application configuration settings"""
    
    # API Settings
    API_HOST: str = "0.0.0.0"
    API_PORT: int = 8000
    API_RELOAD: bool = True
    
    # CORS Settings
    CORS_ORIGINS: List[str] = ["*"]
    
    # Model Settings
    INTENT_MODEL_NAME: str = "valhalla/distilbart-mnli-12-1"
    EMBEDDING_MODEL_NAME: str = "sentence-transformers/all-MiniLM-L6-v2"
    
    # Confidence Thresholds
    INTENT_CONFIDENCE_THRESHOLD: float = 0.50
    RETRIEVAL_CONFIDENCE_THRESHOLD: float = 0.3
    
    # RAG Settings
    CHUNK_SIZE: int = 2000
    CHUNK_OVERLAP: int = 200
    TOP_K_RETRIEVAL: int = 5
    
    # Vector Database Settings
    CHROMA_PERSIST_DIRECTORY: str = "./chroma_db"
    CHROMA_COLLECTION_NAME: str = "msme_knowledge_base"
    
    # Paths
    KNOWLEDGE_BASE_DIR: str = "./knowledge_base"
    MODELS_DIR: str = "./models_cache"
    
    # Intent Categories
    INTENT_LABELS: List[str] = [
        "Questions about MUDRA loans, business loans, subsidies, or financial support",
        "Questions about GST registration, tax filing, or compliance",
        "Questions about Udyam registration or MSME business registration",
        "Questions about government schemes or business support programs",
        "Questions about business licenses, permits, or regulatory requirements",
        "Questions about employee management, labor laws, or HR compliance",
        "Questions about tax compliance, filing, or accounting",
        "Questions about digital marketing, e-commerce, or online business",
        "Greeting or general conversation",
        "Unknown or unclear question"
    ]
    
    # Supported Languages
    SUPPORTED_LANGUAGES: List[str] = [
        "en",  # English
        "hi",  # Hindi
        "bn",  # Bengali
        "ta",  # Tamil
        "te",  # Telugu
        "mr",  # Marathi
        "gu",  # Gujarati
        "kn"   # Kannada
    ]
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()

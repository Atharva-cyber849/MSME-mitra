"""Download and cache required models"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from transformers import DistilBertTokenizer, DistilBertForSequenceClassification
from sentence_transformers import SentenceTransformer
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def download_models():
    """Download and cache all required models"""
    
    # Create models cache directory
    if not os.path.exists(settings.MODELS_DIR):
        os.makedirs(settings.MODELS_DIR)
        logger.info(f"Created models directory: {settings.MODELS_DIR}")
    
    logger.info("Starting model downloads...")
    logger.info("This may take a few minutes on first run...")
    
    # Download DistilBERT for intent classification
    logger.info(f"\n1. Downloading DistilBERT model: {settings.INTENT_MODEL_NAME}")
    try:
        tokenizer = DistilBertTokenizer.from_pretrained(
            settings.INTENT_MODEL_NAME,
            cache_dir=settings.MODELS_DIR
        )
        model = DistilBertForSequenceClassification.from_pretrained(
            settings.INTENT_MODEL_NAME,
            num_labels=len(settings.INTENT_LABELS),
            cache_dir=settings.MODELS_DIR
        )
        logger.info("✓ DistilBERT model downloaded successfully")
    except Exception as e:
        logger.error(f"✗ Failed to download DistilBERT: {e}")
        return False
    
    # Download Sentence Transformer for embeddings
    logger.info(f"\n2. Downloading Sentence Transformer: {settings.EMBEDDING_MODEL_NAME}")
    try:
        embedding_model = SentenceTransformer(
            settings.EMBEDDING_MODEL_NAME,
            cache_folder=settings.MODELS_DIR
        )
        logger.info("✓ Sentence Transformer downloaded successfully")
    except Exception as e:
        logger.error(f"✗ Failed to download Sentence Transformer: {e}")
        return False
    
    logger.info("\n" + "="*50)
    logger.info("All models downloaded successfully!")
    logger.info("="*50)
    
    return True


if __name__ == "__main__":
    success = download_models()
    if success:
        logger.info("\nYou can now run the setup_knowledge_base.py script")
        sys.exit(0)
    else:
        logger.error("\nModel download failed. Please check your internet connection and try again.")
        sys.exit(1)

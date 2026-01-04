"""Language detection module for multilingual support"""
from langdetect import detect, LangDetectException
from typing import Tuple
import logging

logger = logging.getLogger(__name__)


class LanguageDetector:
    """Detects the language of user input"""
    
    SUPPORTED_LANGUAGES = {
        'en': 'English',
        'hi': 'Hindi',
        'bn': 'Bengali',
        'ta': 'Tamil',
        'te': 'Telugu',
        'mr': 'Marathi',
        'gu': 'Gujarati',
        'kn': 'Kannada'
    }
    
    def __init__(self):
        """Initialize the language detector"""
        logger.info("Language detector initialized")
    
    def detect_language(self, text: str) -> Tuple[str, float]:
        """
        Detect the language of the input text
        
        Args:
            text: Input text to detect language
            
        Returns:
            Tuple of (language_code, confidence)
            Default to 'en' if detection fails
        """
        if not text or len(text.strip()) < 3:
            logger.warning("Text too short for language detection, defaulting to English")
            return ('en', 0.5)
        
        try:
            detected_lang = detect(text)
            
            # Check if detected language is supported
            if detected_lang in self.SUPPORTED_LANGUAGES:
                confidence = 0.85  # langdetect doesn't provide confidence, using fixed value
                logger.info(f"Detected language: {self.SUPPORTED_LANGUAGES[detected_lang]} ({detected_lang})")
                return (detected_lang, confidence)
            else:
                logger.info(f"Detected unsupported language: {detected_lang}, defaulting to English")
                return ('en', 0.6)
                
        except LangDetectException as e:
            logger.error(f"Language detection failed: {e}, defaulting to English")
            return ('en', 0.5)
    
    def is_supported(self, lang_code: str) -> bool:
        """Check if a language is supported"""
        return lang_code in self.SUPPORTED_LANGUAGES
    
    def get_language_name(self, lang_code: str) -> str:
        """Get the full name of a language from its code"""
        return self.SUPPORTED_LANGUAGES.get(lang_code, "Unknown")


# Singleton instance
language_detector = LanguageDetector()

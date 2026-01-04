"""Text preprocessing pipeline for cleaning and normalizing user input"""
import re
import string
from typing import List
import logging

logger = logging.getLogger(__name__)


class TextPreprocessor:
    """Preprocesses text for intent classification and retrieval"""
    
    # Common stop words (basic set, can be extended)
    STOP_WORDS = {
        'a', 'an', 'the', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
        'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
        'could', 'may', 'might', 'must', 'can', 'i', 'you', 'he', 'she', 'it',
        'we', 'they', 'them', 'their', 'this', 'that', 'these', 'those'
    }
    
    # Common abbreviations and expansions for MSME domain
    ABBREVIATIONS = {
        "gst": "goods and services tax",
        "g.s.t": "goods and services tax",
        "msme": "micro small medium enterprise",
        "m.s.m.e": "micro small medium enterprise",
        "sme": "small medium enterprise",
        "pf": "provident fund",
        "epf": "employee provident fund",
        "esic": "employee state insurance",
        "esi": "employee state insurance",
        "itr": "income tax return",
        "tds": "tax deducted at source",
        "pan": "permanent account number",
        "tan": "tax deduction account number",
        "iec": "import export code",
        "noc": "no objection certificate",
        "fssai": "food safety standards authority",
        "ca": "chartered accountant",
        "hr": "human resources",
        "ot": "overtime",
        "seo": "search engine optimization",
        "ppc": "pay per click",
        "fy": "financial year",
        "ay": "assessment year",
        "pmegp": "prime minister employment generation programme",
        "cgtmse": "credit guarantee fund trust",
        "pmmy": "pradhan mantri mudra yojana",
    }
    
    def __init__(self, remove_stopwords: bool = False):
        """
        Initialize the text preprocessor
        
        Args:
            remove_stopwords: Whether to remove stop words (default: False)
                             Keep False for intent classification to preserve context
        """
        self.remove_stopwords = remove_stopwords
        logger.info(f"Text preprocessor initialized (remove_stopwords={remove_stopwords})")
    
    def clean_text(self, text: str) -> str:
        """
        Clean and normalize text
        
        Args:
            text: Raw input text
            
        Returns:
            Cleaned text
        """
        if not text:
            return ""
        
        # Convert to lowercase
        text = text.lower()
        
        # Remove URLs
        text = re.sub(r'http\S+|www\S+|https\S+', '', text, flags=re.MULTILINE)
        
        # Remove email addresses
        text = re.sub(r'\S+@\S+', '', text)
        
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        
        # Strip leading/trailing whitespace
        text = text.strip()
        
        return text
    
    def expand_abbreviations(self, text: str) -> str:
        """
        Expand common abbreviations to full forms
        
        Args:
            text: Input text with abbreviations
            
        Returns:
            Text with expanded abbreviations
        """
        words = text.lower().split()
        expanded = []
        
        for word in words:
            # Remove punctuation for matching
            clean_word = word.strip('.,!?;:')
            if clean_word in self.ABBREVIATIONS:
                expanded.append(self.ABBREVIATIONS[clean_word])
            else:
                expanded.append(word)
        
        return ' '.join(expanded)
    
    def tokenize(self, text: str) -> List[str]:
        """
        Tokenize text into words
        
        Args:
            text: Input text
            
        Returns:
            List of tokens
        """
        # Simple whitespace tokenization
        tokens = text.split()
        
        # Remove punctuation from tokens
        tokens = [token.strip(string.punctuation) for token in tokens]
        
        # Filter empty tokens
        tokens = [token for token in tokens if token]
        
        return tokens
    
    def remove_stop_words(self, tokens: List[str]) -> List[str]:
        """
        Remove stop words from token list
        
        Args:
            tokens: List of tokens
            
        Returns:
            Filtered token list
        """
        return [token for token in tokens if token.lower() not in self.STOP_WORDS]
    
    def preprocess(self, text: str, for_embedding: bool = False) -> str:
        """
        Full preprocessing pipeline
        
        Args:
            text: Raw input text
            for_embedding: If True, applies more aggressive preprocessing for embeddings
            
        Returns:
            Preprocessed text
        """
        # Clean text
        cleaned = self.clean_text(text)
        
        if not cleaned:
            return ""
        
        # For embeddings or if stopword removal is enabled
        if for_embedding or self.remove_stopwords:
            tokens = self.tokenize(cleaned)
            tokens = self.remove_stop_words(tokens)
            return ' '.join(tokens)
        
        return cleaned
    
    def normalize_query(self, query: str) -> str:
        """
        Normalize a user query for intent classification
        Preserves context by not removing stop words
        Expands abbreviations for better matching
        
        Args:
            query: User query
            
        Returns:
            Normalized query
        """
        # First do basic preprocessing
        normalized = self.preprocess(query, for_embedding=False)
        
        # Then expand abbreviations
        normalized = self.expand_abbreviations(normalized)
        
        return normalized


# Singleton instance
text_preprocessor = TextPreprocessor(remove_stopwords=False)

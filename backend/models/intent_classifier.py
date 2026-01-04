import torch
from transformers import pipeline
from config import settings
import logging
import re
from typing import Dict, Tuple
from difflib import SequenceMatcher

logger = logging.getLogger(__name__)

# Keyword-based fallback patterns for high-confidence quick matching
INTENT_KEYWORDS = {
    "Questions about MUDRA loans, business loans, subsidies, or financial support": [
        "mudra", "mudraa", "loan", "loans", "credit", "credits", "subsidy", "subsidies", "financial", "funding", "fund",
        "borrow", "borrowing", "interest rate", "interest", "installment", "emi", "repayment",
        "shishu", "kishore", "tarun", "finance", "finances", "capital", "working capital", "term loan",
        "business loan", "startup loan", "micro loan", "small loan", "collateral free", "no collateral",
        "loan eligibility", "loan apply", "loan application", "how to get loan", "apply for loan",
        "pmmy", "pradhan mantri mudra yojana", "financial support", "financial assistance", "need money",
        "need funding", "need capital", "bank loan", "nbfc", "microfinance"
    ],
    "Questions about GST registration, tax filing, or compliance": [
        "gst", "g.s.t", "goods and services tax", "goods service tax", "tax", "taxes", "taxation",
        "registration", "register", "filing", "file return", "return", "returns", "invoice", "invoicing",
        "compliance", "compliances", "deduction", "input credit", "itc", "input tax credit",
        "gstr", "gstr-1", "gstr-2", "gstr-3b", "gstr-9", "itr", "income tax return", "income tax",
        "tds", "tax deducted at source", "advance tax", "tax planning", "exemption", "exemptions",
        "turnover", "threshold", "gstin", "gst number", "gst portal", "gst certificate",
        "how to register gst", "gst process", "gst mandatory", "gst filing", "gst deadline",
        "composition scheme", "regular scheme", "nil return", "late fees", "penalty"
    ],
    "Questions about Udyam registration or MSME business registration": [
        "udyam", "udyog", "udhyam", "udyog aadhaar", "msme", "m.s.m.e", "sme", "ssi",
        "registration", "register", "certificate", "classify", "classification",
        "micro", "small", "medium", "enterprise", "enterprises", "business register", "business registration",
        "register business", "register my business", "how to register", "registration process",
        "incorporation", "company formation", "startup registration", "pan", "tan", "aadhaar",
        "msme certificate", "udyam certificate", "em-2", "em-1", "msme portal", "udyam portal",
        "benefits of registration", "why register", "registration fee", "documents required",
        "sole proprietor", "partnership", "private limited", "llp"
    ],
    "Questions about government schemes or business support programs": [
        "scheme", "schemes", "govt scheme", "government", "government scheme", "govt", "program", "programmes",
        "support", "initiative", "initiatives", "benefit", "benefits", "subsidy", "subsidies",
        "grant", "grants", "assistance", "help", "aid", "financial aid",
        "pmegp", "pm employment generation", "vishwakarma", "pm vishwakarma", "standup", "stand up india",
        "cgtmse", "credit guarantee", "clcss", "capital subsidy", "technology upgradation",
        "prime minister", "pm scheme", "central scheme", "state scheme", "yojana",
        "startup india", "make in india", "atmanirbhar", "mudra yojana",
        "what schemes", "which scheme", "eligible for scheme", "scheme benefits", "how to apply scheme"
    ],
    "Questions about business licenses, permits, or regulatory requirements": [
        "license", "licence", "licenses", "permit", "permits", "permission", "certificate", "certificates",
        "regulatory", "regulation", "compliance", "compliances", "trade", "trade license", "trade licence",
        "shop", "shop act", "establishment", "shop and establishment", "fssai", "food license", "food safety",
        "iso", "iso certificate", "pollution", "pollution clearance", "noc", "no objection",
        "factory", "factory license", "factory act", "drug license", "pharmacy license",
        "environmental", "environmental clearance", "ec", "approval", "approvals",
        "iec", "import export", "import export code", "importer exporter", "occupancy", "occupancy certificate",
        "fire", "fire noc", "building", "municipal", "corporation", "panchayat",
        "what licenses", "which license", "mandatory license", "need license", "license required",
        "how to get license", "apply for license", "license fee", "license renewal"
    ],
    "Questions about employee management, labor laws, or HR compliance": [
        "employee", "employees", "staff", "worker", "workers", "labor", "labour", "hr", "human resource",
        "pf", "epf", "provident fund", "employee provident fund", "esic", "esi", "employee state insurance",
        "payroll", "salary", "salaries", "wages", "wage", "minimum wage", "payment of wages",
        "leave", "leaves", "casual leave", "sick leave", "earned leave", "paid leave",
        "attendance", "working hours", "shift", "overtime", "ot",
        "hiring", "hire", "recruitment", "recruit", "onboarding", "joining",
        "termination", "firing", "resignation", "exit", "separation", "notice period",
        "gratuity", "bonus", "incentive", "benefits", "perks",
        "maternity", "maternity leave", "paternity", "paternity leave",
        "employment", "workforce", "manpower", "human resources",
        "labor law", "labour law", "labor compliance", "employment law",
        "appraisal", "increment", "promotion", "performance", "kpi"
    ],
    "Questions about tax compliance, filing, or accounting": [
        "tax compliance", "tax compliances", "accounting", "accounts", "bookkeeping", "books",
        "financial statement", "financial statements", "balance sheet", "profit loss", "p&l", "pnl",
        "audit", "auditing", "auditor", "chartered accountant", "ca", "cma",
        "annual return", "annual filing", "quarterly filing", "quarterly return", "monthly return",
        "tax deduction", "deductions", "section 80c", "tax saving",
        "depreciation", "amortization", "expense", "expenses", "revenue", "income",
        "tally", "quickbooks", "zoho books", "accounting software",
        "invoice", "bill", "receipt", "voucher", "journal entry",
        "financial year", "fy", "assessment year", "ay",
        "tax audit", "statutory audit", "internal audit", "due date", "deadline"
    ],
    "Questions about digital marketing, e-commerce, or online business": [
        "digital marketing", "digital", "online marketing", "internet marketing",
        "online", "online business", "internet business", "web business",
        "ecommerce", "e-commerce", "e commerce", "online store", "online shop",
        "website", "web site", "web portal", "web design", "web development",
        "social media", "social", "facebook", "fb", "instagram", "insta", "twitter", "linkedin",
        "google ads", "google adwords", "ppc", "pay per click",
        "seo", "search engine optimization", "search ranking", "google ranking",
        "email marketing", "email campaign", "newsletter",
        "amazon", "flipkart", "meesho", "shopee", "myntra", "snapdeal",
        "shopify", "woocommerce", "magento", "wordpress",
        "advertising", "advertisement", "ads", "promotion", "promote",
        "sales online", "sell online", "online selling",
        "content marketing", "influencer", "affiliate", "marketplace"
    ],
    "Greeting or general conversation": [
        "hello", "hi", "hey", "hii", "hlo", "namaste", "namaskar", "greet", "greetings",
        "how are you", "what's up", "whatsup", "sup",
        "thanks", "thank you", "thankyou", "thnx", "thank u", "ty",
        "please", "pls", "plz", "help", "help me", "can you help",
        "good morning", "good afternoon", "good evening", "good night",
        "bye", "goodbye", "see you", "take care"
    ],
}

class IntentClassifier:
    def __init__(self):
        """
        Initialize the zero-shot intent classifier wrapper.
        Actual model loading happens in load_model().
        """
        self.device = 0 if torch.cuda.is_available() else -1
        self.classifier = None
        self.labels = settings.INTENT_LABELS
        self.intent_cache = {}  # Cache for repeated queries

    def load_model(self):
        """Load the model pipeline"""
        logger.info(f"Loading intent classification model: {settings.INTENT_MODEL_NAME} on device {self.device}")
        try:
            self.classifier = pipeline(
                "zero-shot-classification",
                model=settings.INTENT_MODEL_NAME,
                device=self.device
            )
            logger.info("Intent classifier loaded successfully")
        except Exception as e:
            logger.error(f"Error loading intent classifier: {str(e)}")
            raise

    def _preprocess_text(self, text: str) -> str:
        """Preprocess text for better classification"""
        # Convert to lowercase
        text = text.lower().strip()
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove common punctuation that doesn't affect meaning
        text = re.sub(r'[?.!,]+', '', text)
        return text

    def _fuzzy_match(self, word: str, keyword: str, threshold: float = 0.85) -> bool:
        """
        Check if word fuzzy matches keyword using SequenceMatcher.
        Handles typos like 'mudra' vs 'mudraa', 'udyam' vs 'udhyam'
        
        Args:
            word: Word from user query
            keyword: Target keyword to match
            threshold: Similarity threshold (0.85 = 85% similar)
        
        Returns:
            True if similarity >= threshold
        """
        # Exact match
        if word == keyword:
            return True
        
        # Length check - avoid matching very different words
        if abs(len(word) - len(keyword)) > 3:
            return False
        
        # Calculate similarity ratio
        ratio = SequenceMatcher(None, word, keyword).ratio()
        return ratio >= threshold

    def _keyword_match(self, text: str) -> Tuple[str, float, str]:
        """
        Quick keyword-based matching for high-confidence classification.
        Now includes fuzzy matching for typo tolerance.
        Returns: (intent_label, confidence_score, method_used)
        """
        preprocessed = self._preprocess_text(text)
        words = preprocessed.split()
        
        best_match = None
        best_score = 0.0
        
        for intent_label, keywords in INTENT_KEYWORDS.items():
            exact_matches = 0
            fuzzy_matches = 0
            
            # Check for exact and fuzzy keyword matches
            for keyword in keywords:
                # Exact match (substring)
                if keyword in preprocessed:
                    exact_matches += 1
                else:
                    # Fuzzy match each word
                    for word in words:
                        if len(word) >= 3 and self._fuzzy_match(word, keyword):
                            fuzzy_matches += 1
                            break
            
            total_matches = exact_matches + (fuzzy_matches * 0.8)  # Fuzzy matches count less
            
            if total_matches > 0:
                # Calculate confidence based on matches
                confidence = min(0.95, 0.6 + (total_matches * 0.1))
                
                if confidence > best_score:
                    best_score = confidence
                    best_match = intent_label
        
        # Lower threshold for greeting queries since they're unambiguous
        match_threshold = 0.60 if best_match == "Greeting or general conversation" else 0.75
        
        if best_match and best_score > match_threshold:
            return best_match, best_score, "keyword_match"
        
        return None, 0.0, "no_match"

    def _adjust_threshold(self, text: str, base_threshold: float = None) -> float:
        """
        Dynamically adjust confidence threshold based on query characteristics.
        
        Args:
            text: User query
            base_threshold: Base threshold from config (default: settings.INTENT_CONFIDENCE_THRESHOLD)
        
        Returns:
            Adjusted threshold
        """
        if base_threshold is None:
            base_threshold = settings.INTENT_CONFIDENCE_THRESHOLD
        
        preprocessed = self._preprocess_text(text)
        words = preprocessed.split()
        
        # Factor 1: Query length adjustment
        # Short queries (1-3 words) get higher threshold (more specific needed)
        # Long queries (10+ words) get lower threshold (more context = easier to classify)
        if len(words) <= 3:
            length_adjustment = 0.10  # Increase threshold by 10%
        elif len(words) >= 10:
            length_adjustment = -0.10  # Decrease threshold by 10%
        else:
            length_adjustment = 0.0
        
        # Factor 2: Keyword presence
        # Queries with strong keywords get lower threshold (high confidence expected)
        has_strong_keywords = any(
            keyword in preprocessed 
            for keyword_list in INTENT_KEYWORDS.values() 
            for keyword in keyword_list[:5]  # Check top 5 keywords per category
        )
        keyword_adjustment = -0.05 if has_strong_keywords else 0.05
        
        # Factor 3: Question indicators
        # Questions get slightly lower threshold (more common pattern)
        is_question = any(
            word in preprocessed 
            for word in ["how", "what", "when", "where", "why", "which", "who", "tell me", "explain"]
        )
        question_adjustment = -0.03 if is_question else 0.0
        
        # Calculate final threshold
        adjusted = base_threshold + length_adjustment + keyword_adjustment + question_adjustment
        
        # Clamp between 0.3 and 0.7
        adjusted = max(0.3, min(0.7, adjusted))
        
        if adjusted != base_threshold:
            logger.info(f"Adjusted threshold: {base_threshold:.2f} → {adjusted:.2f} "
                       f"(length: {length_adjustment:+.2f}, keywords: {keyword_adjustment:+.2f}, "
                       f"question: {question_adjustment:+.2f})")
        
        return adjusted

    def classify_intent(self, text: str) -> Tuple[str, float, Dict[str, float]]:
        """
        Classify the intent of the given text using hybrid approach:
        1. Quick keyword-based matching
        2. Zero-shot classification fallback
        3. Dynamic confidence thresholding
        """
        if not self.classifier:
            logger.warning("Classifier not loaded, attempting to load...")
            self.load_model()

        # Check cache first
        cache_key = self._preprocess_text(text)
        if cache_key in self.intent_cache:
            cached_result = self.intent_cache[cache_key]
            logger.info(f"Using cached result for: {text[:50]}...")
            return cached_result

        try:
            # Step 1: Try quick keyword matching first (faster, more accurate for common queries)
            keyword_intent, keyword_score, method = self._keyword_match(text)
            
            if method == "keyword_match":
                logger.info(f"Quick match: {keyword_intent} (confidence: {keyword_score:.2f}) via keyword matching")
                all_scores = {
                    label: keyword_score if label == keyword_intent else 0.0 
                    for label in self.labels
                }
                result = (keyword_intent, float(keyword_score), all_scores)
                self.intent_cache[cache_key] = result
                return result

            # Step 2: Fall back to zero-shot classification
            logger.info(f"Performing zero-shot classification for: {text[:50]}...")
            result = self.classifier(text, self.labels, multi_label=False)
            
            # Extract top prediction
            top_intent = result['labels'][0]
            top_score = result['scores'][0]
            
            # Create dictionary of all scores
            all_scores = {
                label: score 
                for label, score in zip(result['labels'], result['scores'])
            }
            
            logger.info(f"Zero-shot result: {top_intent} (confidence: {top_score:.2f})")
            
            # Step 3: Apply dynamic confidence threshold
            dynamic_threshold = self._adjust_threshold(text)
            
            if top_score >= dynamic_threshold:
                logger.info(f"Classified intent: {top_intent} (confidence: {top_score:.2f}, threshold: {dynamic_threshold:.2f})")
                result = (top_intent, float(top_score), all_scores)
            else:
                # If confidence too low, mark as Unknown
                logger.info(f"Low confidence ({top_score:.2f} < {dynamic_threshold:.2f}), marking as Unknown")
                result = ("Unknown or unclear question", float(top_score), all_scores)
            
            # Cache the result
            self.intent_cache[cache_key] = result
            return result
            
        except Exception as e:
            logger.error(f"Error during intent classification: {str(e)}")
            # Fallback
            fallback_result = ("Unknown", 0.0, {label: 0.0 for label in self.labels})
            self.intent_cache[cache_key] = fallback_result
            return fallback_result

    def get_intent_explanation(self, intent: str) -> str:
        """Get a user-friendly explanation of the detected intent"""
        explanations = {
            "Questions about MUDRA loans, business loans, subsidies, or financial support": 
                "I detected you're asking about financing options",
            "Questions about GST registration, tax filing, or compliance":
                "I detected you're asking about tax and compliance matters",
            "Questions about Udyam registration or MSME business registration":
                "I detected you're asking about business registration",
            "Questions about government schemes or business support programs":
                "I detected you're asking about government support programs",
            "Questions about business licenses, permits, or regulatory requirements":
                "I detected you're asking about licenses and permits",
            "Greeting or general conversation":
                "I detected a greeting or general question",
            "Unknown or unclear question":
                "I'm not sure what you're asking about",
        }
        return explanations.get(intent, "")

    def clear_cache(self):
        """Clear the intent classification cache"""
        self.intent_cache.clear()
        logger.info("Intent classifier cache cleared")
# Create global instance
intent_classifier = IntentClassifier()
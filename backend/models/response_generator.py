"""Response generation module combining templates and RAG"""
from typing import List, Dict, Tuple
import logging
import re
from config import settings

logger = logging.getLogger(__name__)


class ResponseGenerator:
    """Generates responses based on intent and retrieved knowledge"""
    
    # Template responses for different intents
    TEMPLATES = {
        "Greeting or general conversation": [
            "Namaste! 🙏 Welcome to the MSME Business Support Chatbot.\n\nI can help you with:\n• Government schemes & subsidies\n• Loan information\n• GST & compliance\n• Udyam registration\n• Licensing & permits\n• Employee management\n• Digital marketing\n• Tax compliance\n\nWhat would you like to know about?"
        ],
        "Questions about MUDRA loans, business loans, subsidies, or financial support": [
            "I can help you with information about MSME loans and subsidies. Let me find the most relevant information for you."
        ],
        "Questions about GST registration, tax filing, or compliance": [
            "I'll provide you with information about GST registration and compliance requirements."
        ],
        "Questions about Udyam registration or MSME business registration": [
            "Let me help you with Udyam registration information."
        ],
        "Questions about government schemes or business support programs": [
            "I'll find information about relevant government schemes for MSMEs."
        ],
        "Questions about business licenses, permits, or regulatory requirements": [
            "I can help you understand the licensing and permit requirements for your business."
        ],
        "Questions about employee management, labor laws, or HR compliance": [
            "I'll provide information about employee management and labor compliance requirements."
        ],
        "Questions about tax compliance, filing, or accounting": [
            "I'll help you with tax compliance and filing information."
        ],
        "Questions about digital marketing, e-commerce, or online business": [
            "I'll provide guidance on digital marketing and e-commerce for your business."
        ],
        "Unknown or unclear question": [
            "I'm not fully confident about this query. For accurate information, please contact the official MSME helpline at 1800-11-6446 or visit msme.gov.in",
            "I couldn't find specific information about your query. Would you like to:\n\n• Rephrase your question?\n• Ask about loans, GST, Udyam registration, government schemes, licenses, employee management, or digital marketing?\n• Contact MSME support at msme.gov.in"
        ]
    }
    
    def __init__(self):
        """Initialize the response generator"""
        logger.info("Response generator initialized")
    
    def generate_response(
        self,
        intent: str,
        confidence: float,
        retrieved_docs: List[Dict] = None,
        query: str = ""
    ) -> Tuple[str, List[str]]:
        """
        Generate a response based on intent and retrieved knowledge
        
        Args:
            intent: Classified intent
            confidence: Intent confidence score
            retrieved_docs: Retrieved documents from RAG
            query: Original user query
            
        Returns:
            Tuple of (response_text, sources)
        """
        sources = []
        
        # Handle low confidence / unknown intent
        if confidence < settings.INTENT_CONFIDENCE_THRESHOLD or intent == "Unknown or unclear question":
            response = self._get_fallback_response(query)
            return response, sources
        
        # Handle greeting
        if intent == "Greeting or general conversation":
            response = self.TEMPLATES["Greeting or general conversation"][0]
            return response, sources
        
        # Generate RAG-augmented response
        if retrieved_docs and len(retrieved_docs) > 0:
            response = self._generate_rag_response(intent, retrieved_docs, query)
            sources = [doc.get('metadata', {}).get('source', 'Knowledge Base') 
                      for doc in retrieved_docs]
        else:
            # Fallback to template if no documents retrieved
            response = self._get_template_response(intent)
        
        return response, sources
    
    def _generate_rag_response(
        self,
        intent: str,
        retrieved_docs: List[Dict],
        query: str
    ) -> str:
        """
        Generate response using retrieved documents
        
        Args:
            intent: Classified intent
            retrieved_docs: Retrieved documents
            query: User query
            
        Returns:
            Generated response
        """
        # Use ALL retrieved documents (don't filter by threshold)
        # The retrieval already ranked them by relevance
        relevant_docs = retrieved_docs
        
        logger.info(f"📊 Using {len(relevant_docs)} retrieved documents")
        
        # Combine retrieved information
        context_parts = []
        for i, doc in enumerate(relevant_docs[:5], 1):  # Top 5 documents
            text = doc.get('text', '').strip()
            if text:
                # Clean up text formatting
                text = text.replace('\n\n\n', '\n\n')  # Remove excessive line breaks
                
                # Only truncate if EXTREMELY long (over 5000 chars)
                if len(text) > 5000:
                    text = self._smart_truncate(text, 5000)
                
                # Apply formatting
                text = self._format_response_text(text)
                
                context_parts.append(text)
                logger.info(f"📄 Added context part {i}: {text[:80]}...")
        
        logger.info(f"📋 Total context parts collected: {len(context_parts)}")
        
        if not context_parts:
            logger.warning(f"No context found in retrieved docs for intent: {intent}")
            return self._get_template_response(intent)
        
        # Create response with context - combine with clear separation
        response = context_parts[0]  # Start with most relevant doc
        logger.info(f"🔤 Starting response with part 1 ({len(context_parts[0])} chars)")
        
        # Add additional docs if available and not too redundant
        if len(context_parts) > 1:
            for idx, additional in enumerate(context_parts[1:], 2):
                # Only check for true duplicates - same exact starting content
                # Don't block documents that just share common words
                if not self._is_duplicate_content(response, additional):
                    # Use cleaner separator
                    response += "\n\n" + additional
                    logger.info(f"✅ Added part {idx} ({len(additional)} chars)")
                else:
                    logger.info(f"❌ Skipped part {idx} (duplicate content)")
        
        # Add helpful closing only if response isn't too long
        if len(response) < 6000:
            response += "\n\n💡 **Would you like more details about any specific aspect?**"
        
        return response
    
    def _is_duplicate_content(self, existing: str, new: str) -> bool:
        """Check if new content is substantially similar to existing"""
        # Only filter if the new content's first 150 chars are already in existing
        # This catches true duplicates without blocking related content
        new_start = new[:150].strip().lower()
        if new_start in existing.lower():
            return True
        
        # Also check if content is EXTREMELY similar (>95% word overlap)
        new_words = set(new.lower().split()[:100])  # First 100 words
        existing_words = set(existing.lower().split())
        overlap = len(new_words & existing_words) / len(new_words) if new_words else 0
        return overlap > 0.95  # Only filter if nearly identical (was 0.7)
    
    def _smart_truncate(self, text: str, max_length: int) -> str:
        """
        Intelligently truncate text avoiding breaking numbered lists or structured content
        
        Args:
            text: Text to truncate
            max_length: Maximum length
            
        Returns:
            Truncated text
        """
        if len(text) <= max_length:
            return text
        
        # Strategy 1: Try to cut at section boundary (headers with colons or double newlines)
        # Look for good break points in the last 300 chars before max_length
        search_start = max(0, max_length - 300)
        search_text = text[search_start:max_length]
        
        # Find last section header (line ending with colon)
        section_matches = list(re.finditer(r'\n([A-Z][^\n]+:)\n', search_text))
        if section_matches:
            last_section = section_matches[-1]
            cutoff = search_start + last_section.start()
            return text[:cutoff].rstrip()
        
        # Strategy 2: Find last paragraph break that's not inside a list
        paragraph_breaks = []
        for match in re.finditer(r'\n\n', text[:max_length]):
            pos = match.start()
            # Check if this break is not right after a numbered list item or bullet
            context = text[max(0, pos-10):pos+10]
            if not re.search(r'\d+\.\s*$|^\s*\d+\.|-\s*$|^\s*-', context):
                paragraph_breaks.append(pos)
        
        if paragraph_breaks:
            cutoff = paragraph_breaks[-1]
            if cutoff > max_length * 0.6:  # Must be at least 60% through
                return text[:cutoff].rstrip()
        
        # Strategy 3: Cut at sentence boundary (but not in a list)
        cutoff = None
        for match in re.finditer(r'\.\s+', text[:max_length]):
            potential_cut = match.end()
            # Make sure we're not in a numbered list by checking nearby text
            context_before = text[max(0, potential_cut-50):potential_cut]
            context_after = text[potential_cut:min(len(text), potential_cut+20)]
            
            # Don't cut if next line starts with a number or bullet
            if not re.match(r'^\s*\d+\.|\s*-\s', context_after):
                cutoff = potential_cut
        
        # If we found a good sentence boundary, use it
        if cutoff and cutoff > max_length * 0.7:
            return text[:cutoff].rstrip()
        
        # Strategy 4: Last resort - cut at word boundary with ellipsis
        cutoff = text.rfind(' ', max_length - 100, max_length)
        if cutoff > 0:
            return text[:cutoff].rstrip() + "..."
        
        # Give up and just cut
        return text[:max_length].rstrip() + "..."
    
    def _format_response_text(self, text: str) -> str:
        """
        Format response text with better markdown and structure
        """
        # Bold important headers (lines ending with colon)
        text = re.sub(r'^([A-Z][^\n:]+:)', r'**\1**', text, flags=re.MULTILINE)
        
        # Bold standalone section titles
        text = re.sub(r'^([A-Z][A-Za-z\s]+)$', r'**\1**', text, flags=re.MULTILINE)
        
        # Format bullet points (convert - to •)
        text = re.sub(r'\n-\s+', r'\n• ', text)
        
        # Bold amounts (₹ symbol followed by numbers)
        text = re.sub(r'(₹\s*[\d,]+(?:\.\d+)?\s*(?:lakh|crore|lakhs|crores)?)', r'**\1**', text, flags=re.I)
        
        # Bold percentages
        text = re.sub(r'(\d+(?:\.\d+)?%)', r'**\1**', text)
        
        # Clean up excessive newlines (more than 2 becomes 2)
        text = re.sub(r'\n{3,}', '\n\n', text)
        
        return text
    
    def _get_template_response(self, intent: str) -> str:
        """Get a template response for the intent"""
        templates = self.TEMPLATES.get(intent, self.TEMPLATES["Unknown or unclear question"])
        # For now, return the first template (can be randomized)
        return templates[0]
    
    def _get_fallback_response(self, query: str = "") -> str:
        """
        Get a fallback response for unknown/low-confidence queries
        Provides specific suggestions based on query content
        """
        base_response = self.TEMPLATES["Unknown or unclear question"][0]
        
        # Add smart suggestions based on partial keyword matches
        suggestions = []
        query_lower = query.lower()
        
        if any(word in query_lower for word in ["loan", "money", "fund", "credit"]):
            suggestions.append("• Try asking about 'MUDRA loans' or 'business loans'")
        if any(word in query_lower for word in ["tax", "gst", "filing"]):
            suggestions.append("• Try asking about 'GST registration' or 'tax compliance'")
        if any(word in query_lower for word in ["register", "registration"]):
            suggestions.append("• Try asking about 'Udyam registration' or 'business registration'")
        if any(word in query_lower for word in ["license", "permit"]):
            suggestions.append("• Try asking about 'business licenses' or 'permits required'")
        if any(word in query_lower for word in ["employee", "staff", "worker"]):
            suggestions.append("• Try asking about 'employee management' or 'labor compliance'")
        
        if suggestions:
            base_response += "\n\n**Suggestions:**\n" + "\n".join(suggestions)
        
        return base_response
    
    def format_response_with_sources(
        self,
        response: str,
        sources: List[str]
    ) -> str:
        """
        Format response with source citations
        
        Args:
            response: Generated response
            sources: List of source names
            
        Returns:
            Formatted response with sources
        """
        if not sources:
            return response
        
        # Remove duplicates while preserving order
        unique_sources = list(dict.fromkeys(sources))
        
        formatted = response + "\n\n---\n📚 Sources:\n"
        for i, source in enumerate(unique_sources, 1):
            formatted += f"{i}. {source}\n"
        
        return formatted


# Singleton instance
response_generator = ResponseGenerator()

"""Knowledge retrieval using RAG (Retrieval-Augmented Generation) with ChromaDB"""
from sentence_transformers import SentenceTransformer
import chromadb
from chromadb.config import Settings as ChromaSettings
from typing import List, Dict, Tuple
import logging
import os
import re
from config import settings

logger = logging.getLogger(__name__)


class KnowledgeRetrieval:
    """RAG system for retrieving relevant knowledge from vector database"""
    
    def __init__(self):
        """Initialize the knowledge retrieval system"""
        self.embedding_model = None
        self.chroma_client = None
        self.collection = None
        
        logger.info("Knowledge retrieval system initialized")
    
    def load_models(self):
        """Load embedding model and initialize ChromaDB"""
        try:
            # Load sentence transformer for embeddings
            logger.info(f"Loading embedding model: {settings.EMBEDDING_MODEL_NAME}")
            self.embedding_model = SentenceTransformer(settings.EMBEDDING_MODEL_NAME)
            
            # Initialize ChromaDB
            logger.info(f"Initializing ChromaDB at {settings.CHROMA_PERSIST_DIRECTORY}")
            self.chroma_client = chromadb.PersistentClient(
                path=settings.CHROMA_PERSIST_DIRECTORY
            )
            
            # Get or create collection
            try:
                self.collection = self.chroma_client.get_collection(
                    name=settings.CHROMA_COLLECTION_NAME
                )
                logger.info(f"Loaded existing collection: {settings.CHROMA_COLLECTION_NAME}")
            except:
                self.collection = self.chroma_client.create_collection(
                    name=settings.CHROMA_COLLECTION_NAME,
                    metadata={"description": "MSME knowledge base"}
                )
                logger.info(f"Created new collection: {settings.CHROMA_COLLECTION_NAME}")
            
            logger.info("Models loaded successfully")
            
        except Exception as e:
            logger.error(f"Failed to load models: {e}")
            raise
    
    def add_documents(
        self,
        documents: List[str],
        metadatas: List[Dict] = None,
        ids: List[str] = None
    ):
        """
        Add documents to the knowledge base
        
        Args:
            documents: List of document texts
            metadatas: Optional list of metadata dicts
            ids: Optional list of document IDs
        """
        if self.collection is None:
            raise RuntimeError("Collection not initialized. Call load_models() first.")
        
        try:
            # Generate embeddings
            embeddings = self.embedding_model.encode(documents).tolist()
            
            # Generate IDs if not provided
            if ids is None:
                ids = [f"doc_{i}" for i in range(len(documents))]
            
            # Add to collection
            self.collection.add(
                embeddings=embeddings,
                documents=documents,
                metadatas=metadatas,
                ids=ids
            )
            
            logger.info(f"Added {len(documents)} documents to knowledge base")
            
        except Exception as e:
            logger.error(f"Failed to add documents: {e}")
            raise
    
    def retrieve(
        self,
        query: str,
        intent: str = None,
        top_k: int = None
    ) -> List[Dict]:
        """
        Retrieve relevant documents for a query
        
        Args:
            query: User query
            intent: Optional intent filter
            top_k: Number of documents to retrieve (default from settings)
            
        Returns:
            List of retrieved documents with metadata and scores
        """
        if self.collection is None:
            raise RuntimeError("Collection not initialized. Call load_models() first.")
        
        if top_k is None:
            top_k = settings.TOP_K_RETRIEVAL
        
        try:
            # Generate query embedding
            query_embedding = self.embedding_model.encode(query).tolist()
            
            # Don't use intent filter - let semantic search find best matches
            # Intent metadata may not match if labels changed
            where_filter = None
            
            # Query the collection - retrieve MORE docs to allow grouping by source
            results = self.collection.query(
                query_embeddings=[query_embedding],
                n_results=top_k * 2,  # Retrieve 2x to allow filtering for better sources
                where=where_filter
            )
            
            # Format results
            retrieved_docs = []
            if results['documents'] and len(results['documents'][0]) > 0:
                for i in range(len(results['documents'][0])):
                    doc = {
                        'text': results['documents'][0][i],
                        'metadata': results['metadatas'][0][i] if results['metadatas'] else {},
                        'distance': results['distances'][0][i] if results['distances'] else 0,
                        'relevance_score': 1 - (results['distances'][0][i] if results['distances'] else 0)
                    }
                    retrieved_docs.append(doc)
            
            # Re-rank results to boost documents starting with titles
            retrieved_docs = self._rerank_by_completeness(retrieved_docs, query)
            
            # Smart filtering: Group by source and return all docs from top sources
            grouped = {}
            for doc in retrieved_docs:
                source = doc.get('metadata', {}).get('source', 'unknown')
                if source not in grouped:
                    grouped[source] = []
                grouped[source].append(doc)
            
            logger.info(f"📂 Documents grouped by source: {[(src, len(docs)) for src, docs in grouped.items()]}")
            
            # Return documents prioritizing sources with multiple matching chunks
            final_docs = []
            
            # Sort sources by: (1) number of matches descending, (2) highest relevance score descending
            sorted_sources = sorted(
                grouped.keys(),
                key=lambda src: (
                    -len(grouped[src]),  # More matches = higher priority
                    -max(doc['relevance_score'] for doc in grouped[src])  # Higher relevance = higher priority
                )
            )
            
            # First pass: Add ALL chunks from sources with 2+ matches
            for source in sorted_sources:
                docs_from_source = grouped[source]
                if len(docs_from_source) >= 2:
                    final_docs.extend(docs_from_source)  # Add ALL docs from this source
                    logger.info(f"✅ Added {len(docs_from_source)} docs from {source}")
                    if len(final_docs) >= top_k:
                        break
            
            # Second pass: Add single-chunk sources to fill remaining slots
            if len(final_docs) < top_k:
                for source in sorted_sources:
                    docs_from_source = grouped[source]
                    if len(docs_from_source) == 1:
                        final_docs.append(docs_from_source[0])
                        logger.info(f"✅ Added 1 doc from {source}")
                        if len(final_docs) >= top_k:
                            break
            
            logger.info(f"Retrieved {len(final_docs)} final documents for query")
            return final_docs[:top_k]
            
        except Exception as e:
            logger.error(f"Retrieval failed: {e}")
            return []
    
    def _rerank_by_completeness(self, docs: List[Dict], query: str) -> List[Dict]:
        """
        Re-rank documents to prefer complete content over fragments.
        Filters out obvious fragments and boosts complete documents.
        
        Args:
            docs: Retrieved documents
            query: Original query
            
        Returns:
            Filtered and re-ranked documents
        """
        if not docs:
            return docs
        
        # Score and categorize all docs
        scored_docs = []
        
        for doc in docs:
            text = doc['text'].strip()
            boost = 0.0
            fragment_score = 0  # 0 = good, 1 = minor issues, 2 = major fragment
            
            # Check 1: Obvious fragments (start with lowercase, punctuation, or partial words)
            if len(text) > 0:
                first_char = text[0]
                if first_char.islower() or first_char in ',-•):':
                    fragment_score = 2
                    logger.info(f"❌ Major fragment (lowercase/punct start) - {text[:50]}")
            
            # Check 2: Starts with a single capital letter followed by comma/punctuation (partial word)
            if re.match(r'^[A-Z][,\s\)\.]', text[:5]):  # "N, " or "T. " etc
                fragment_score = 2
                logger.info(f"❌ Major fragment (partial word) - {text[:50]}")
            
            # Check 3: Starts mid-sentence (no proper beginning)
            first_line = text.split('\n')[0] if '\n' in text else text[:100]
            if re.match(r'^[a-z\s,\-]+$', first_line):  # All lowercase first line
                fragment_score = max(fragment_score, 1)  # Minor issue
                logger.info(f"⚠️ Minor issue (lowercase first line) - {first_line[:50]}")
            
            # Boost 1: Starts with a clear title (ALL CAPS or Title - Subtitle format)
            if re.match(r'^[A-Z][A-Z\s\-]+$', first_line):  # ALL CAPS title
                boost += 0.25
                fragment_score = 0  # Override - this is good
                logger.info(f"✅ +0.25: ALL CAPS title - {first_line[:40]}")
            elif re.match(r'^[A-Z][A-Za-z\s]+ - [A-Z]', text[:60]):  # "MUDRA Loans - Pradhan"
                boost += 0.30
                fragment_score = 0  # Override - this is good
                logger.info(f"✅ +0.30: Full title format - {first_line[:40]}")
            
            # Boost 2: Starts with proper sentence (capital letter + complete thought)
            if text[0].isupper() and fragment_score == 0:
                boost += 0.10
                logger.info(f"✅ +0.10: Proper start - {text[:40]}")
            
            # Boost 3: Contains section headers
            if re.search(r'\n[A-Z][A-Za-z\s]+:\n', text[:200]):  # "Eligibility:\n"
                boost += 0.20
                fragment_score = min(fragment_score, 1)  # Likely has some structure
                logger.info(f"✅ +0.20: Has section headers")
            
            # Penalty: Incomplete numbered list item (number without proper content)
            if re.match(r'^\d+\.\s*[A-Z]', text):
                # Check if it's a mid-list item (content after number is very short)
                first_item = text.split('\n')[0]
                if len(first_item) < 30:  # Suspiciously short
                    boost -= 0.20
                    logger.info(f"⚠️ -0.20: Short list item - {first_item}")
            
            # Boost 4: Contains query term prominently (in first 150 chars)
            query_words = [w.lower() for w in query.split() if len(w) > 3]
            text_start = text[:150].lower()
            matches = sum(1 for word in query_words if word in text_start)
            if matches > 0:
                boost += 0.08 * matches
                logger.info(f"✅ +{0.08 * matches:.2f}: Query matches ({matches})")
            
            # Apply boost to relevance score
            doc['original_score'] = doc['relevance_score']
            doc['relevance_score'] = doc['relevance_score'] + boost
            doc['completeness_boost'] = boost
            doc['fragment_score'] = fragment_score
            
            scored_docs.append(doc)
        
        # Sort by adjusted relevance score
        scored_docs.sort(key=lambda x: x['relevance_score'], reverse=True)
        
        # Smart filtering: Only filter major fragments IF we have good alternatives
        good_docs = [d for d in scored_docs if d['fragment_score'] < 2]
        
        if len(good_docs) > 0:
            # We have at least some good docs, use them
            logger.info(f"📊 Filtered {len(scored_docs) - len(good_docs)} major fragments, kept {len(good_docs)} docs")
            return good_docs
        else:
            # All docs are fragments - keep top 2 anyway (better than nothing)
            logger.info(f"⚠️ All {len(scored_docs)} docs are fragments - keeping top 2 as fallback")
            return scored_docs[:2]
    
    def get_collection_stats(self) -> Dict:
        """Get statistics about the knowledge base"""
        if self.collection is None:
            return {"error": "Collection not initialized"}
        
        try:
            count = self.collection.count()
            return {
                "total_documents": count,
                "collection_name": settings.CHROMA_COLLECTION_NAME
            }
        except Exception as e:
            logger.error(f"Failed to get stats: {e}")
            return {"error": str(e)}


# Singleton instance
knowledge_retrieval = KnowledgeRetrieval()

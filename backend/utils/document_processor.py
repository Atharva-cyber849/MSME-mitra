"""Document processing utilities for knowledge base"""
from PyPDF2 import PdfReader
from typing import List, Dict, Tuple
import os
import logging

logger = logging.getLogger(__name__)


class DocumentProcessor:
    """Process documents for knowledge base ingestion"""
    
    def __init__(self, chunk_size: int = 512, chunk_overlap: int = 50):
        """
        Initialize document processor
        
        Args:
            chunk_size: Maximum characters per chunk
            chunk_overlap: Overlap between chunks
        """
        self.chunk_size = chunk_size
        self.chunk_overlap = chunk_overlap
        logger.info(f"Document processor initialized (chunk_size={chunk_size}, overlap={chunk_overlap})")
    
    def extract_text_from_pdf(self, pdf_path: str) -> str:
        """
        Extract text from PDF file
        
        Args:
            pdf_path: Path to PDF file
            
        Returns:
            Extracted text
        """
        try:
            reader = PdfReader(pdf_path)
            text = ""
            
            for page in reader.pages:
                text += page.extract_text() + "\n"
            
            logger.info(f"Extracted {len(text)} characters from {pdf_path}")
            return text
            
        except Exception as e:
            logger.error(f"Failed to extract text from {pdf_path}: {e}")
            return ""
    
    def extract_text_from_txt(self, txt_path: str) -> str:
        """
        Extract text from TXT file
        
        Args:
            txt_path: Path to TXT file
            
        Returns:
            File contents
        """
        try:
            with open(txt_path, 'r', encoding='utf-8') as f:
                text = f.read()
            
            logger.info(f"Read {len(text)} characters from {txt_path}")
            return text
            
        except Exception as e:
            logger.error(f"Failed to read {txt_path}: {e}")
            return ""
    
    def chunk_text(self, text: str) -> List[str]:
        """
        Split text into overlapping chunks, avoiding breaking numbered lists
        
        Args:
            text: Input text
            
        Returns:
            List of text chunks
        """
        if not text:
            return []
        
        chunks = []
        start = 0
        text_length = len(text)
        
        while start < text_length:
            # Ensure this chunk starts at a clean boundary (unless it's the very first chunk)
            if start > 0:
                # Look for a good starting point: paragraph break, sentence start, or section header
                # Check if we're already at a paragraph break
                if start < text_length - 2 and text[start-2:start] == '\n\n':
                    pass  # Already at paragraph break, good
                # Check if we're at the start of a sentence (previous char is ., !, ? followed by space/newline)
                elif start > 0 and text[start-1] in ' \n' and start > 1 and text[start-2] in '.!?':
                    pass  # At sentence start, good
                # Otherwise, look ahead for a good boundary
                else:
                    # Look for paragraph break first (within 100 chars)
                    para_break = text.find('\n\n', start, start + 100)
                    if para_break != -1:
                        start = para_break + 2
                    else:
                        # Look for sentence end + space/newline (within 100 chars)
                        found_boundary = False
                        for i in range(start, min(start + 100, text_length - 1)):
                            if text[i] in '.!?' and i + 1 < text_length and text[i + 1] in ' \n':
                                start = i + 2 if text[i + 1] == ' ' else i + 1
                                found_boundary = True
                                break
                        # If no good boundary found, at least start at a word boundary
                        if not found_boundary:
                            space_pos = text.find(' ', start, start + 50)
                            if space_pos != -1:
                                start = space_pos + 1
            
            # Now find the end of this chunk
            end = min(start + self.chunk_size, text_length)
            
            # Try to end at good boundaries
            if end < text_length:
                # Strategy 1: Look for paragraph breaks (double newlines)
                paragraph_break = text.rfind('\n\n', start, end)
                if paragraph_break != -1 and paragraph_break > start + int(self.chunk_size * 0.5):
                    # Check if we're not in the middle of a list
                    context_after = text[paragraph_break:min(text_length, paragraph_break + 20)]
                    if not context_after.strip().startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '-', '•')):
                        end = paragraph_break
                
                # Strategy 2: Look for sentence endings (but not in lists)
                if end == start + self.chunk_size:  # Paragraph break didn't work
                    for delimiter in ['. ', '.\n', '! ', '!\n', '? ', '?\n']:
                        last_delimiter = text.rfind(delimiter, start + int(self.chunk_size * 0.7), end)
                        if last_delimiter != -1:
                            # Check the next line doesn't start with a number (list continuation)
                            check_pos = last_delimiter + len(delimiter)
                            if check_pos < text_length:
                                next_chars = text[check_pos:check_pos + 3].strip()
                                if not next_chars[:2].startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.')):
                                    end = last_delimiter + 1
                                    break
            
            chunk = text[start:end].strip()
            if chunk:
                chunks.append(chunk)
            
            # Move to next chunk with overlap
            next_start = end - self.chunk_overlap
            
            # Ensure we always progress forward to avoid infinite loops
            if next_start <= start:
                next_start = end
            
            start = next_start
        
        logger.info(f"Created {len(chunks)} chunks from text")
        return chunks
    
    def process_document(
        self,
        file_path: str,
        metadata: Dict = None
    ) -> Tuple[List[str], List[Dict]]:
        """
        Process a document file into chunks with metadata
        
        Args:
            file_path: Path to document file
            metadata: Optional metadata dict
            
        Returns:
            Tuple of (chunks, metadatas)
        """
        # Extract text based on file type
        file_ext = os.path.splitext(file_path)[1].lower()
        
        if file_ext == '.pdf':
            text = self.extract_text_from_pdf(file_path)
        elif file_ext in ['.txt', '.md']:
            text = self.extract_text_from_txt(file_path)
        else:
            logger.warning(f"Unsupported file type: {file_ext}")
            return [], []
        
        if not text:
            return [], []
        
        # Chunk the text
        chunks = self.chunk_text(text)
        
        # Create metadata for each chunk
        base_metadata = metadata or {}
        base_metadata['source'] = os.path.basename(file_path)
        
        metadatas = []
        for i, chunk in enumerate(chunks):
            chunk_metadata = base_metadata.copy()
            chunk_metadata['chunk_id'] = i
            chunk_metadata['total_chunks'] = len(chunks)
            metadatas.append(chunk_metadata)
        
        return chunks, metadatas
    
    def process_directory(
        self,
        directory_path: str,
        intent_mapping: Dict[str, str] = None
    ) -> Tuple[List[str], List[Dict], List[str]]:
        """
        Process all documents in a directory
        
        Args:
            directory_path: Path to directory containing documents
            intent_mapping: Optional dict mapping filename patterns to intents
            
        Returns:
            Tuple of (all_chunks, all_metadatas, all_ids)
        """
        all_chunks = []
        all_metadatas = []
        all_ids = []
        
        if not os.path.exists(directory_path):
            logger.error(f"Directory not found: {directory_path}")
            return all_chunks, all_metadatas, all_ids
        
        # Process each file
        for filename in os.listdir(directory_path):
            file_path = os.path.join(directory_path, filename)
            
            if not os.path.isfile(file_path):
                continue
            
            # Determine intent from filename or mapping
            intent = "General"
            if intent_mapping:
                for pattern, mapped_intent in intent_mapping.items():
                    if pattern.lower() in filename.lower():
                        intent = mapped_intent
                        break
            
            # Process document
            metadata = {"intent": intent}
            chunks, metadatas = self.process_document(file_path, metadata)
            
            # Generate IDs
            base_id = os.path.splitext(filename)[0]
            ids = [f"{base_id}_chunk_{i}" for i in range(len(chunks))]
            
            all_chunks.extend(chunks)
            all_metadatas.extend(metadatas)
            all_ids.extend(ids)
        
        logger.info(f"Processed {len(all_chunks)} total chunks from directory")
        return all_chunks, all_metadatas, all_ids


# Singleton instance
document_processor = DocumentProcessor()

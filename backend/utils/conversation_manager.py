"""Conversation history and session management"""
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json
import logging
from pathlib import Path
import uuid

logger = logging.getLogger(__name__)


class ConversationManager:
    """Manages conversation sessions and context"""
    
    def __init__(self, persist_dir: str = "./conversations"):
        self.persist_dir = Path(persist_dir)
        self.persist_dir.mkdir(exist_ok=True)
        self.sessions: Dict[str, Dict] = {}
        self.max_history = 10  # Keep last 10 messages
        self.session_timeout = timedelta(hours=24)
        logger.info("Conversation manager initialized")
    
    def create_session(self) -> str:
        """Create a new conversation session"""
        session_id = str(uuid.uuid4())
        self.sessions[session_id] = {
            "created_at": datetime.now(),
            "last_activity": datetime.now(),
            "messages": [],
            "context": {}
        }
        logger.info(f"Created new session: {session_id}")
        return session_id
    
    def add_message(
        self,
        session_id: str,
        role: str,
        content: str,
        intent: Optional[str] = None,
        confidence: Optional[float] = None
    ) -> None:
        """Add a message to conversation history"""
        if session_id not in self.sessions:
            logger.warning(f"Session {session_id} not found, creating new session")
            self.sessions[session_id] = {
                "created_at": datetime.now(),
                "last_activity": datetime.now(),
                "messages": [],
                "context": {}
            }
        
        message = {
            "timestamp": datetime.now().isoformat(),
            "role": role,
            "content": content,
            "intent": intent,
            "confidence": confidence
        }
        
        self.sessions[session_id]["messages"].append(message)
        self.sessions[session_id]["last_activity"] = datetime.now()
        
        # Keep only recent messages
        if len(self.sessions[session_id]["messages"]) > self.max_history * 2:
            self.sessions[session_id]["messages"] = self.sessions[session_id]["messages"][-self.max_history * 2:]
        
        logger.debug(f"Added message to session {session_id}")
    
    def get_conversation_history(
        self,
        session_id: str,
        max_messages: Optional[int] = None
    ) -> List[Dict]:
        """Get conversation history for a session"""
        if session_id not in self.sessions:
            return []
        
        messages = self.sessions[session_id]["messages"]
        
        if max_messages:
            return messages[-max_messages:]
        
        return messages
    
    def get_context_summary(self, session_id: str) -> str:
        """Get a summary of conversation context"""
        if session_id not in self.sessions:
            return ""
        
        messages = self.sessions[session_id]["messages"]
        
        if not messages:
            return ""
        
        # Get recent user questions and intents
        recent_topics = []
        for msg in messages[-6:]:  # Last 3 exchanges
            if msg["role"] == "user" and msg.get("intent"):
                recent_topics.append(msg["intent"])
        
        if not recent_topics:
            return ""
        
        # Create context summary
        unique_topics = list(dict.fromkeys(recent_topics))
        context = f"Previous topics discussed: {', '.join(unique_topics[:3])}"
        
        return context
    
    def update_context(self, session_id: str, key: str, value: any) -> None:
        """Update session context"""
        if session_id in self.sessions:
            self.sessions[session_id]["context"][key] = value
    
    def get_context(self, session_id: str, key: str, default: any = None) -> any:
        """Get value from session context"""
        if session_id not in self.sessions:
            return default
        
        return self.sessions[session_id]["context"].get(key, default)
    
    def cleanup_old_sessions(self) -> int:
        """Remove expired sessions"""
        current_time = datetime.now()
        expired_sessions = []
        
        for session_id, session_data in self.sessions.items():
            if current_time - session_data["last_activity"] > self.session_timeout:
                expired_sessions.append(session_id)
        
        for session_id in expired_sessions:
            del self.sessions[session_id]
        
        if expired_sessions:
            logger.info(f"Cleaned up {len(expired_sessions)} expired sessions")
        
        return len(expired_sessions)
    
    def save_session(self, session_id: str) -> None:
        """Persist session to disk"""
        if session_id not in self.sessions:
            return
        
        session_file = self.persist_dir / f"{session_id}.json"
        
        try:
            with open(session_file, "w", encoding="utf-8") as f:
                # Convert datetime objects to strings
                session_data = self.sessions[session_id].copy()
                session_data["created_at"] = session_data["created_at"].isoformat()
                session_data["last_activity"] = session_data["last_activity"].isoformat()
                json.dump(session_data, f, indent=2)
            
            logger.debug(f"Saved session {session_id} to disk")
        except Exception as e:
            logger.error(f"Failed to save session {session_id}: {e}")
    
    def load_session(self, session_id: str) -> bool:
        """Load session from disk"""
        session_file = self.persist_dir / f"{session_id}.json"
        
        if not session_file.exists():
            return False
        
        try:
            with open(session_file, "r", encoding="utf-8") as f:
                session_data = json.load(f)
            
            # Convert strings back to datetime
            session_data["created_at"] = datetime.fromisoformat(session_data["created_at"])
            session_data["last_activity"] = datetime.fromisoformat(session_data["last_activity"])
            
            self.sessions[session_id] = session_data
            logger.info(f"Loaded session {session_id} from disk")
            return True
        except Exception as e:
            logger.error(f"Failed to load session {session_id}: {e}")
            return False
    
    def get_session_stats(self) -> Dict:
        """Get statistics about active sessions"""
        return {
            "active_sessions": len(self.sessions),
            "total_messages": sum(len(s["messages"]) for s in self.sessions.values())
        }


# Global conversation manager instance
conversation_manager = ConversationManager()

"""Analytics module for tracking chatbot usage and performance"""
import sqlite3
from typing import Dict, List, Optional
from datetime import datetime, timedelta
from pathlib import Path
import logging
import json

logger = logging.getLogger(__name__)


class Analytics:
    """Track and analyze chatbot usage patterns"""
    
    def __init__(self, db_path: str = "./analytics.db"):
        self.db_path = db_path
        self._initialize_database()
        logger.info("Analytics module initialized")
    
    def _initialize_database(self):
        """Create database tables if they don't exist"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Query logs table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS query_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                session_id TEXT,
                user_query TEXT NOT NULL,
                intent TEXT NOT NULL,
                confidence REAL NOT NULL,
                detected_language TEXT,
                response_time REAL,
                success BOOLEAN NOT NULL
            )
        """)
        
        # Intent statistics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS intent_stats (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL,
                intent TEXT NOT NULL,
                count INTEGER DEFAULT 1,
                avg_confidence REAL,
                UNIQUE(date, intent)
            )
        """)
        
        # Daily metrics table
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS daily_metrics (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                date TEXT NOT NULL UNIQUE,
                total_queries INTEGER DEFAULT 0,
                unique_sessions INTEGER DEFAULT 0,
                avg_response_time REAL,
                success_rate REAL
            )
        """)
        
        # User satisfaction table (from feedback)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS satisfaction_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT NOT NULL,
                session_id TEXT,
                intent TEXT,
                rating INTEGER NOT NULL,
                comment TEXT
            )
        """)
        
        conn.commit()
        conn.close()
        logger.info("Analytics database initialized")
    
    def log_query(
        self,
        user_query: str,
        intent: str,
        confidence: float,
        detected_language: str,
        response_time: float,
        success: bool = True,
        session_id: Optional[str] = None
    ):
        """Log a user query"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO query_logs 
                (timestamp, session_id, user_query, intent, confidence, detected_language, response_time, success)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                datetime.now().isoformat(),
                session_id,
                user_query,
                intent,
                confidence,
                detected_language,
                response_time,
                success
            ))
            
            conn.commit()
        except Exception as e:
            logger.error(f"Failed to log query: {e}")
        finally:
            conn.close()
    
    def log_feedback(
        self,
        rating: int,
        intent: str,
        comment: Optional[str] = None,
        session_id: Optional[str] = None
    ):
        """Log user feedback"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute("""
                INSERT INTO satisfaction_logs (timestamp, session_id, intent, rating, comment)
                VALUES (?, ?, ?, ?, ?)
            """, (datetime.now().isoformat(), session_id, intent, rating, comment))
            
            conn.commit()
        except Exception as e:
            logger.error(f"Failed to log feedback: {e}")
        finally:
            conn.close()
    
    def get_popular_queries(self, limit: int = 10, days: int = 7) -> List[Dict]:
        """Get most frequent query intents"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute("""
            SELECT intent, COUNT(*) as count, AVG(confidence) as avg_confidence
            FROM query_logs
            WHERE timestamp >= ? AND success = 1
            GROUP BY intent
            ORDER BY count DESC
            LIMIT ?
        """, (since_date, limit))
        
        results = [
            {"intent": row[0], "count": row[1], "avg_confidence": row[2]}
            for row in cursor.fetchall()
        ]
        
        conn.close()
        return results
    
    def get_daily_stats(self, days: int = 7) -> List[Dict]:
        """Get daily statistics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute("""
            SELECT 
                DATE(timestamp) as date,
                COUNT(*) as total_queries,
                COUNT(DISTINCT session_id) as unique_sessions,
                AVG(response_time) as avg_response_time,
                SUM(CASE WHEN success = 1 THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as success_rate
            FROM query_logs
            WHERE timestamp >= ?
            GROUP BY DATE(timestamp)
            ORDER BY date DESC
        """, (since_date,))
        
        results = [
            {
                "date": row[0],
                "total_queries": row[1],
                "unique_sessions": row[2],
                "avg_response_time": round(row[3], 3) if row[3] else 0,
                "success_rate": round(row[4], 2) if row[4] else 0
            }
            for row in cursor.fetchall()
        ]
        
        conn.close()
        return results
    
    def get_intent_distribution(self, days: int = 7) -> List[Dict]:
        """Get intent distribution"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute("""
            SELECT intent, COUNT(*) as count
            FROM query_logs
            WHERE timestamp >= ? AND success = 1
            GROUP BY intent
            ORDER BY count DESC
        """, (since_date,))
        
        results = [{"intent": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        conn.close()
        return results
    
    def get_satisfaction_metrics(self, days: int = 7) -> Dict:
        """Get user satisfaction metrics"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute("""
            SELECT 
                COUNT(*) as total_feedback,
                SUM(CASE WHEN rating > 0 THEN 1 ELSE 0 END) as positive,
                SUM(CASE WHEN rating < 0 THEN 1 ELSE 0 END) as negative,
                AVG(rating) as avg_rating
            FROM satisfaction_logs
            WHERE timestamp >= ?
        """, (since_date,))
        
        row = cursor.fetchone()
        
        conn.close()
        
        if not row or row[0] == 0:
            return {
                "total_feedback": 0,
                "positive": 0,
                "negative": 0,
                "satisfaction_rate": 0.0
            }
        
        return {
            "total_feedback": row[0],
            "positive": row[1] or 0,
            "negative": row[2] or 0,
            "satisfaction_rate": round((row[1] or 0) / row[0] * 100, 2)
        }
    
    def get_language_distribution(self, days: int = 7) -> List[Dict]:
        """Get language usage distribution"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute("""
            SELECT detected_language, COUNT(*) as count
            FROM query_logs
            WHERE timestamp >= ? AND detected_language IS NOT NULL
            GROUP BY detected_language
            ORDER BY count DESC
        """, (since_date,))
        
        results = [{"language": row[0], "count": row[1]} for row in cursor.fetchall()]
        
        conn.close()
        return results
    
    def get_dashboard_summary(self) -> Dict:
        """Get comprehensive dashboard summary"""
        return {
            "popular_queries": self.get_popular_queries(limit=10, days=7),
            "daily_stats": self.get_daily_stats(days=7),
            "intent_distribution": self.get_intent_distribution(days=7),
            "satisfaction_metrics": self.get_satisfaction_metrics(days=7),
            "language_distribution": self.get_language_distribution(days=7)
        }


# Global analytics instance
analytics = Analytics()

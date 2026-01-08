// API client for chatbot backend

export interface ChatRequest {
  message: string;
  language?: string;
  session_id?: string;
}

export interface ChatResponse {
  response: string;
  intent: string;
  confidence: number;
  detected_language: string;
  language_confidence: number;
  sources: string[];
  all_intent_scores?: Record<string, number>;
  session_id: string;
  suggested_questions: string[];
  rich_content?: {
    links: Array<{ text: string; url: string }>;
    actions: Array<{ type: string; text: string; icon: string }>;
    info_cards: Array<{ type: string; title: string; content: string; icon: string }>;
  };
}

export interface HealthResponse {
  status: string;
  models_loaded: boolean;
  knowledge_base_stats: {
    total_documents: number;
    collection_name: string;
  };
}

export interface FeedbackRequest {
  message: string;
  response: string;
  intent: string;
  confidence: number;
  rating: number;  // 1 for thumbs up, -1 for thumbs down
  comment?: string;
  session_id?: string;
}

export interface FeedbackResponse {
  status: string;
  message: string;
}

export interface AnalyticsDashboard {
  popular_queries: Array<{ intent: string; count: number; avg_confidence: number }>;
  daily_stats: Array<any>;
  intent_distribution: Array<{ intent: string; count: number }>;
  satisfaction_metrics: any;
  language_distribution: Array<{ language: string; count: number }>;
  session_stats: { active_sessions: number; total_messages: number };
}

export interface BusinessProfile {
  type?: string;
  size?: string;
  location?: string;
  stage?: string;
  industry?: string;
}

export interface QuickAction {
  id: string;
  category: string;
  title: string;
  query: string;
  icon: string;
  color: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ChatbotAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async chat(message: string, language: string = 'en', sessionId?: string): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, language, session_id: sessionId }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to get response from chatbot');
    }

    return response.json();
  }

  async createNewSession(): Promise<{ session_id: string }> {
    const response = await fetch(`${this.baseUrl}/api/conversation/new`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to create new session');
    }

    return response.json();
  }

  async getConversationHistory(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/conversation/history/${sessionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get conversation history');
    }

    return response.json();
  }

  async getAnalyticsDashboard(): Promise<AnalyticsDashboard> {
    const response = await fetch(`${this.baseUrl}/api/analytics/dashboard`);
    
    if (!response.ok) {
      throw new Error('Failed to get analytics dashboard');
    }

    return response.json();
  }

  async getPopularQueries(days: number = 7, limit: number = 10): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/analytics/popular?days=${days}&limit=${limit}`);
    
    if (!response.ok) {
      throw new Error('Failed to get popular queries');
    }

    return response.json();
  }

  async getDailyAnalytics(days: number = 7): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/analytics/daily?days=${days}`);
    
    if (!response.ok) {
      throw new Error('Failed to get daily analytics');
    }

    return response.json();
  }

  async setBusinessProfile(sessionId: string, profile: BusinessProfile): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/business-profile`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ session_id: sessionId, profile }),
    });

    if (!response.ok) {
      throw new Error('Failed to set business profile');
    }

    return response.json();
  }

  async getBusinessProfile(sessionId: string): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/business-profile/${sessionId}`);
    
    if (!response.ok) {
      throw new Error('Failed to get business profile');
    }

    return response.json();
  }

  async getQuickActions(): Promise<{ actions: QuickAction[] }> {
    const response = await fetch(`${this.baseUrl}/api/quick-actions`);
    
    if (!response.ok) {
      throw new Error('Failed to get quick actions');
    }

    return response.json();
  }

  async healthCheck(): Promise<HealthResponse> {
    const response = await fetch(`${this.baseUrl}/api/health`);
    
    if (!response.ok) {
      throw new Error('Health check failed');
    }

    return response.json();
  }

  async getStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to get stats');
    }

    return response.json();
  }

  async submitFeedback(feedback: FeedbackRequest): Promise<FeedbackResponse> {
    const response = await fetch(`${this.baseUrl}/api/feedback`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(feedback),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to submit feedback');
    }

    return response.json();
  }

  async getFeedbackStats(): Promise<any> {
    const response = await fetch(`${this.baseUrl}/api/feedback/stats`);
    
    if (!response.ok) {
      throw new Error('Failed to get feedback stats');
    }

    return response.json();
  }
}

export const chatbotAPI = new ChatbotAPI();

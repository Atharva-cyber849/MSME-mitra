// API client for chatbot backend

export interface ChatRequest {
  message: string;
  language?: string;
}

export interface ChatResponse {
  response: string;
  intent: string;
  confidence: number;
  detected_language: string;
  language_confidence: number;
  sources: string[];
  all_intent_scores?: Record<string, number>;
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
}

export interface FeedbackResponse {
  status: string;
  message: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

class ChatbotAPI {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async chat(message: string, language: string = 'en'): Promise<ChatResponse> {
    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message, language }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: 'Unknown error' }));
      throw new Error(error.detail || 'Failed to get response from chatbot');
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

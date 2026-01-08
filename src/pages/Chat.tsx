import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { ChatSidebar } from "@/components/chat/ChatSidebar";
import { BusinessProfileModal } from "@/components/chat/BusinessProfileModal";
import { QuickActionsPanel } from "@/components/chat/QuickActionsPanel";

import { Sparkles, Zap, Shield, FileText, ExternalLink } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  intent?: string;
  confidence?: number;
  userQuery?: string;  // Store user query for feedback
  feedbackGiven?: boolean;  // Track if feedback already given
  suggested_questions?: string[];
  rich_content?: {
    links?: Array<{ text: string; url: string }>;
    actions?: Array<{ type: string; text: string; icon: string }>;
    info_cards?: Array<{ type: string; title: string; content: string; icon: string }>;
  };
}

const FloatingParticle = ({ delay, size, left, duration }: { delay: number; size: number; left: string; duration: number }) => (
  <div
    className="absolute rounded-full bg-primary/20 animate-float pointer-events-none"
    style={{
      width: size,
      height: size,
      left,
      top: `${Math.random() * 100}%`,
      animationDelay: `${delay}s`,
      animationDuration: `${duration}s`,
    }}
  />
);

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      text: "Namaste! 🙏 Welcome to the MSME Business Support Chatbot.\n\nI can help you with:\n• Government schemes & subsidies\n• Loan information\n• GST & compliance\n• Udyam registration\n• Licensing & permits\n\nHow can I assist you today?",
      isBot: true,
      intent: "Greeting",
      confidence: 0.98,
    },
  ]);
  const [language, setLanguage] = useState("en");
  const [isTyping, setIsTyping] = useState(false);
  const [hoveredAction, setHoveredAction] = useState<string | null>(null);
  const [backendError, setBackendError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showBusinessProfile, setShowBusinessProfile] = useState(false);
  const [hasBusinessProfile, setHasBusinessProfile] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Initialize speech recognition
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      // Set language based on selected language
      recognitionRef.current.lang = language === 'hi' ? 'hi-IN' : 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleSendMessage(transcript);
        setIsRecording(false);
      };
      
      recognitionRef.current.onerror = () => {
        setIsRecording(false);
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, [language]);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }
    
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      recognitionRef.current.start();
      setIsRecording(true);
    }
  };

  const speakResponse = (text: string) => {
    if ('speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setBackendError(null);

    try {
      // Call the ML backend API
      const { chatbotAPI } = await import("@/lib/api");
      const response = await chatbotAPI.chat(text, language, sessionId || undefined);

      // Store session ID and check for business profile
      if (!sessionId) {
        setSessionId(response.session_id);
        
        // Show business profile modal after first message if not set
        if (!hasBusinessProfile && messages.length === 1) {
          setTimeout(() => setShowBusinessProfile(true), 2000);
        }
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.response,
        isBot: true,
        intent: response.intent,
        confidence: response.confidence,
        userQuery: text,  // Store user query for feedback
        feedbackGiven: false,
        suggested_questions: response.suggested_questions,
        rich_content: response.rich_content,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error calling chatbot API:", error);
      setBackendError("Unable to connect to backend. Please ensure the server is running.");
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting to my knowledge base right now. Please ensure the backend server is running and try again.",
        isBot: true,
        intent: "Unknown",
        confidence: 0,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMessage]);
    }
  };

  const handleFeedback = async (messageId: string, rating: number) => {
    try {
      // Find the message
      const message = messages.find(m => m.id === messageId);
      if (!message || !message.isBot) return;

      const { chatbotAPI } = await import("@/lib/api");
      await chatbotAPI.submitFeedback({
        message: message.userQuery || "",
        response: message.text,
        intent: message.intent || "Unknown",
        confidence: message.confidence || 0,
        rating,
        session_id: sessionId || undefined,
      });

      // Mark feedback as given
      setMessages(prev => 
        prev.map(m => 
          m.id === messageId 
            ? { ...m, feedbackGiven: true }
            : m
        )
      );

      console.log(`Feedback submitted: ${rating > 0 ? 'Positive' : 'Negative'}`);
    } catch (error) {
      console.error("Error submitting feedback:", error);
    }
  };

  const handleBusinessProfileSave = async (profile: any) => {
    if (!sessionId) return;
    
    try {
      const { chatbotAPI } = await import("@/lib/api");
      await chatbotAPI.setBusinessProfile(sessionId, profile);
      setHasBusinessProfile(true);
      
      // Add a system message about personalization
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: "Great! I've saved your business profile. I'll now provide personalized recommendations based on your business type and stage. 🎯",
        isBot: true,
        intent: "System",
        confidence: 1.0,
      };
      setMessages((prev) => [...prev, systemMessage]);
    } catch (error) {
      console.error("Error saving business profile:", error);
    }
  };

  // Save conversation to localStorage
  const saveConversation = () => {
    if (!sessionId || messages.length <= 1) return; // Don't save empty conversations
    
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
    const existingIndex = conversations.findIndex((c: any) => c.id === sessionId);
    
    // Get first user message for title
    const firstUserMessage = messages.find(m => !m.isBot);
    const title = firstUserMessage 
      ? firstUserMessage.text.substring(0, 50) + (firstUserMessage.text.length > 50 ? "..." : "")
      : "New Conversation";
    
    const lastMessage = messages[messages.length - 1];
    
    const conversation = {
      id: sessionId,
      title,
      lastMessage: lastMessage.text.substring(0, 60) + "...",
      timestamp: Date.now(),
      messages: messages,
      language,
    };
    
    if (existingIndex >= 0) {
      conversations[existingIndex] = conversation;
    } else {
      conversations.unshift(conversation);
    }
    
    localStorage.setItem("conversations", JSON.stringify(conversations));
    window.dispatchEvent(new Event("conversationUpdated"));
  };

  // Save conversation when messages change
  useEffect(() => {
    if (messages.length > 1) {
      saveConversation();
    }
  }, [messages]);

  // Start new chat
  const handleNewChat = () => {
    setMessages([
      {
        id: "welcome",
        text: "Namaste! 🙏 Welcome to the MSME Business Support Chatbot.\n\nI can help you with:\n• Government schemes & subsidies\n• Loan information\n• GST & compliance\n• Udyam registration\n• Licensing & permits\n\nHow can I assist you today?",
        isBot: true,
        intent: "Greeting",
        confidence: 0.98,
      },
    ]);
    setSessionId(null);
    setBackendError(null);
  };

  // Load conversation from history
  const handleSelectConversation = (convId: string) => {
    const conversations = JSON.parse(localStorage.getItem("conversations") || "[]");
    const conversation = conversations.find((c: any) => c.id === convId);
    
    if (conversation) {
      setMessages(conversation.messages);
      setSessionId(conversation.id);
      setLanguage(conversation.language || "en");
    }
  };

  const quickActions = [
    { label: "Government Schemes", icon: Sparkles, color: "from-primary to-primary/70" },
    { label: "MUDRA Loan", icon: Zap, color: "from-accent to-accent/70" },
    { label: "GST Registration", icon: FileText, color: "from-success to-success/70" },
    { label: "Udyam Help", icon: Shield, color: "from-primary to-accent" },
  ];

  return (
    <Layout hideFooter hideNavbar>
      <ChatSidebar
        currentSessionId={sessionId || ""}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onShowBusinessProfile={() => setShowBusinessProfile(true)}
        hasBusinessProfile={hasBusinessProfile}
        language={language}
        onLanguageChange={setLanguage}
        onSidebarToggle={setIsSidebarOpen}
      />
      
      <div className={`flex flex-col h-screen relative bg-background transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'}`}>
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {backendError && (
            <div className="max-w-3xl mx-auto px-4 py-6">
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4 text-sm text-destructive flex items-start gap-3">
                <span className="text-xl">⚠️</span>
                <div>
                  <p className="font-semibold mb-1">Connection Error</p>
                  <p className="text-xs">{backendError}</p>
                </div>
              </div>
            </div>
          )}
          {messages.map((msg, index) => (
            <div key={msg.id}>
              <ChatMessage
                messageId={msg.id}
                message={msg.text}
                isBot={msg.isBot}
                intent={msg.intent}
                confidence={msg.confidence}
                feedbackGiven={msg.feedbackGiven}
                onFeedback={handleFeedback}
              />
              
              {/* Rich Content */}
              {msg.isBot && msg.rich_content && index === messages.length - 1 && (
                <div className="max-w-3xl mx-auto px-4 pb-4 space-y-2">
                  {/* Links */}
                  {msg.rich_content.links && msg.rich_content.links.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {msg.rich_content.links.map((link, i) => (
                        <a
                          key={i}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs bg-primary/10 hover:bg-primary/20 text-primary rounded-full transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          {link.text}
                        </a>
                      ))}
                    </div>
                  )}
                  
                  {/* Info Cards */}
                  {msg.rich_content.info_cards && msg.rich_content.info_cards.length > 0 && (
                    <div className="space-y-2">
                      {msg.rich_content.info_cards.map((card, i) => (
                        <div key={i} className="bg-card border border-border rounded-lg p-3 text-xs">
                          <p className="font-semibold text-foreground mb-1">{card.title}</p>
                          <p className="text-muted-foreground whitespace-pre-line">{card.content}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Suggested Questions */}
              {msg.isBot && msg.suggested_questions && msg.suggested_questions.length > 0 && index === messages.length - 1 && (
                <div className="max-w-3xl mx-auto px-4 pb-4">
                  <div className="pl-14 space-y-2">
                    <p className="text-xs text-muted-foreground">Suggested follow-ups</p>
                    <div className="flex flex-wrap gap-2">
                      {msg.suggested_questions.map((question, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(question)}
                          className="text-sm px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-lg transition-colors border border-border"
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {isTyping && <ChatMessage message="" isBot isTyping />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions Panel */}
        {showSuggestions && (
          <div className="border-t border-border bg-background/95 backdrop-blur-sm">
            <QuickActionsPanel 
              onActionClick={handleSendMessage}
              hoveredAction={hoveredAction}
              setHoveredAction={setHoveredAction}
            />
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-border bg-background/95 backdrop-blur-sm">
          <ChatInput 
            onSend={handleSendMessage} 
            disabled={isTyping}
            showSuggestions={showSuggestions}
            setShowSuggestions={setShowSuggestions}
            isRecording={isRecording}
            onToggleRecording={toggleVoiceRecording}
            hasVoiceSupport={!!recognitionRef.current}
          />
        </div>
      </div>

      {/* Business Profile Modal */}
      <BusinessProfileModal
        open={showBusinessProfile}
        onClose={() => setShowBusinessProfile(false)}
        onSave={handleBusinessProfileSave}
      />
    </Layout>
  );
};

export default Chat;

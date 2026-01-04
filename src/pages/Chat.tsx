import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { LanguageSelector } from "@/components/chat/LanguageSelector";
import { getIntentResponse } from "@/lib/chatbotResponses";
import { Info, Sparkles, Zap, Shield, FileText } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  intent?: string;
  confidence?: number;
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      text,
      isBot: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate bot thinking delay
    setTimeout(() => {
      const { intent, confidence, response } = getIntentResponse(text);

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response,
        isBot: true,
        intent,
        confidence,
      };

      setIsTyping(false);
      setMessages((prev) => [...prev, botMessage]);
    }, 1000 + Math.random() * 1000);
  };

  const quickActions = [
    { label: "Government Schemes", icon: Sparkles, color: "from-primary to-primary/70" },
    { label: "MUDRA Loan", icon: Zap, color: "from-accent to-accent/70" },
    { label: "GST Registration", icon: FileText, color: "from-success to-success/70" },
    { label: "Udyam Help", icon: Shield, color: "from-primary to-accent" },
  ];

  return (
    <Layout hideFooter>
      <div className="flex flex-col h-[calc(100vh-64px)] relative overflow-hidden">
        {/* Animated Background Particles */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <FloatingParticle delay={0} size={8} left="10%" duration={8} />
          <FloatingParticle delay={1} size={6} left="25%" duration={10} />
          <FloatingParticle delay={2} size={10} left="45%" duration={7} />
          <FloatingParticle delay={0.5} size={5} left="65%" duration={9} />
          <FloatingParticle delay={1.5} size={7} left="80%" duration={11} />
          <FloatingParticle delay={3} size={4} left="90%" duration={8} />
        </div>

        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur-sm relative z-10">
          <div className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center animate-glow group-hover:animate-wiggle transition-all duration-300">
                <span className="text-lg">🤖</span>
              </div>
              {/* Pulse ring effect */}
              <div className="absolute inset-0 rounded-full bg-primary/30 animate-pulse-ring" />
            </div>
            <div>
              <h1 className="font-heading font-semibold text-foreground group-hover:gradient-text transition-all duration-300">
                MSME Support Bot
              </h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                <span className="animate-fade-in">Online</span>
              </p>
            </div>
          </div>
          <div className="hover-lift">
            <LanguageSelector value={language} onChange={setLanguage} />
          </div>
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/10 shimmer-bg animate-shimmer relative z-10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-primary animate-bounce-gentle" />
            <span>This is a demo chatbot. Responses are simulated for demonstration purposes.</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30 particles-bg relative z-10">
          {messages.map((msg, index) => (
            <div
              key={msg.id}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ChatMessage
                message={msg.text}
                isBot={msg.isBot}
                intent={msg.intent}
                confidence={msg.confidence}
              />
            </div>
          ))}
          {isTyping && (
            <div className="animate-scale-in">
              <ChatMessage message="" isBot isTyping />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-3 border-t border-border bg-card/80 backdrop-blur-sm overflow-x-auto relative z-10">
          <div className="flex gap-3">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.label}
                  onClick={() => handleSendMessage(`Tell me about ${action.label}`)}
                  onMouseEnter={() => setHoveredAction(action.label)}
                  onMouseLeave={() => setHoveredAction(null)}
                  className={`
                    relative px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap
                    flex items-center gap-2 interactive-scale
                    bg-gradient-to-r ${action.color} text-white
                    shadow-soft hover:shadow-elevated
                    transition-all duration-300
                    ${hoveredAction === action.label ? 'ring-2 ring-primary/30 ring-offset-2' : ''}
                  `}
                >
                  <Icon className={`w-3.5 h-3.5 ${hoveredAction === action.label ? 'animate-bounce-gentle' : ''}`} />
                  {action.label}
                  {hoveredAction === action.label && (
                    <span className="absolute inset-0 rounded-full bg-white/20 animate-pulse-ring" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Area */}
        <div className="relative z-10">
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </div>
      </div>
    </Layout>
  );
};

export default Chat;

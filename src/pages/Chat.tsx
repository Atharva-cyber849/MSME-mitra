import { useState, useRef, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { ChatInput } from "@/components/chat/ChatInput";
import { LanguageSelector } from "@/components/chat/LanguageSelector";
import { getIntentResponse } from "@/lib/chatbotResponses";
import { Info } from "lucide-react";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  intent?: string;
  confidence?: number;
}

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

  return (
    <Layout hideFooter>
      <div className="flex flex-col h-[calc(100vh-64px)]">
        {/* Chat Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center">
              <span className="text-lg">🤖</span>
            </div>
            <div>
              <h1 className="font-heading font-semibold text-foreground">MSME Support Bot</h1>
              <p className="text-xs text-success flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
                Online
              </p>
            </div>
          </div>
          <LanguageSelector value={language} onChange={setLanguage} />
        </div>

        {/* Info Banner */}
        <div className="px-4 py-2 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="w-4 h-4 text-primary" />
            <span>This is a demo chatbot. Responses are simulated for demonstration purposes.</span>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              message={msg.text}
              isBot={msg.isBot}
              intent={msg.intent}
              confidence={msg.confidence}
            />
          ))}
          {isTyping && <ChatMessage message="" isBot isTyping />}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        <div className="px-4 py-2 border-t border-border bg-card overflow-x-auto">
          <div className="flex gap-2">
            {["Government Schemes", "MUDRA Loan", "GST Registration", "Udyam Help"].map((action) => (
              <button
                key={action}
                onClick={() => handleSendMessage(`Tell me about ${action}`)}
                className="px-3 py-1.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium whitespace-nowrap hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {action}
              </button>
            ))}
          </div>
        </div>

        {/* Input Area */}
        <ChatInput onSend={handleSendMessage} disabled={isTyping} />
      </div>
    </Layout>
  );
};

export default Chat;

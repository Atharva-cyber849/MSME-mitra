import { Bot, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ChatMessageProps {
  message: string;
  isBot: boolean;
  intent?: string;
  confidence?: number;
  isTyping?: boolean;
}

export const ChatMessage = ({ message, isBot, intent, confidence, isTyping }: ChatMessageProps) => {
  return (
    <div className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"} animate-slide-up`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[80%] md:max-w-[70%]`}>
        <div className={`px-4 py-3 ${isBot ? "chat-bubble-bot" : "chat-bubble-user"}`}>
          {isTyping ? (
            <div className="flex gap-1.5 py-1">
              <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
              <span className="w-2 h-2 rounded-full bg-muted-foreground typing-dot" />
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message}</p>
          )}
        </div>
        
        {isBot && intent && !isTyping && (
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary" className="text-xs">
              {intent}
            </Badge>
            {confidence !== undefined && (
              <span className="text-xs text-muted-foreground">
                {(confidence * 100).toFixed(0)}% confident
              </span>
            )}
          </div>
        )}
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

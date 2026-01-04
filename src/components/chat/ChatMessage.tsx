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
    <div className={`flex gap-3 ${isBot ? "justify-start" : "justify-end"} animate-slide-up group`}>
      {isBot && (
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0 shadow-soft group-hover:shadow-elevated transition-all duration-300 group-hover:scale-110">
          <Bot className="w-4 h-4 text-primary-foreground" />
        </div>
      )}
      
      <div className={`max-w-[80%] md:max-w-[70%]`}>
        <div 
          className={`
            px-4 py-3 
            ${isBot ? "chat-bubble-bot hover:shadow-elevated" : "chat-bubble-user hover:shadow-soft"} 
            transition-all duration-300 
            hover:-translate-y-0.5
          `}
        >
          {isTyping ? (
            <div className="flex gap-1.5 py-1">
              <span className="w-2.5 h-2.5 rounded-full bg-primary/60 typing-dot" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary/60 typing-dot" />
              <span className="w-2.5 h-2.5 rounded-full bg-primary/60 typing-dot" />
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap leading-relaxed">{message}</p>
          )}
        </div>
        
        {isBot && intent && !isTyping && (
          <div className="flex items-center gap-2 mt-2 animate-fade-in">
            <Badge 
              variant="secondary" 
              className="text-xs interactive-scale cursor-default hover:bg-primary/10 hover:text-primary transition-colors duration-200"
            >
              {intent}
            </Badge>
            {confidence !== undefined && (
              <div className="flex items-center gap-1">
                <div className="h-1.5 w-12 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-success rounded-full transition-all duration-500"
                    style={{ width: `${confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs text-muted-foreground">
                  {(confidence * 100).toFixed(0)}%
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {!isBot && (
        <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0 shadow-soft group-hover:shadow-elevated transition-all duration-300 group-hover:scale-110">
          <User className="w-4 h-4 text-secondary-foreground" />
        </div>
      )}
    </div>
  );
};

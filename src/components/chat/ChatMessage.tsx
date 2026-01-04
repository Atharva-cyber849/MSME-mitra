import { Bot, User, ThumbsUp, ThumbsDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import ReactMarkdown from "react-markdown";

interface ChatMessageProps {
  messageId?: string;
  message: string;
  isBot: boolean;
  intent?: string;
  confidence?: number;
  isTyping?: boolean;
  feedbackGiven?: boolean;
  onFeedback?: (messageId: string, rating: number) => void;
}

export const ChatMessage = ({ 
  messageId, 
  message, 
  isBot, 
  intent, 
  confidence, 
  isTyping,
  feedbackGiven,
  onFeedback 
}: ChatMessageProps) => {
  const [hoveredFeedback, setHoveredFeedback] = useState<string | null>(null);

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
            <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-li:my-0.5">
              <ReactMarkdown>{message}</ReactMarkdown>
            </div>
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

        {/* Feedback Buttons */}
        {isBot && !isTyping && messageId && onFeedback && intent !== "Greeting" && (
          <div className="flex items-center gap-2 mt-2 animate-fade-in">
            {feedbackGiven ? (
              <span className="text-xs text-muted-foreground italic">Thank you for your feedback!</span>
            ) : (
              <>
                <span className="text-xs text-muted-foreground">Was this helpful?</span>
                <button
                  onClick={() => onFeedback(messageId, 1)}
                  onMouseEnter={() => setHoveredFeedback('up')}
                  onMouseLeave={() => setHoveredFeedback(null)}
                  className={`
                    p-1 rounded-full transition-all duration-200
                    ${hoveredFeedback === 'up' 
                      ? 'bg-success/20 text-success scale-110' 
                      : 'hover:bg-success/10 text-muted-foreground hover:text-success'
                    }
                  `}
                  title="Helpful"
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => onFeedback(messageId, -1)}
                  onMouseEnter={() => setHoveredFeedback('down')}
                  onMouseLeave={() => setHoveredFeedback(null)}
                  className={`
                    p-1 rounded-full transition-all duration-200
                    ${hoveredFeedback === 'down' 
                      ? 'bg-destructive/20 text-destructive scale-110' 
                      : 'hover:bg-destructive/10 text-muted-foreground hover:text-destructive'
                    }
                  `}
                  title="Not helpful"
                >
                  <ThumbsDown className="w-3.5 h-3.5" />
                </button>
              </>
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

import { Bot, User, ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
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
    <div className={`w-full py-8 px-4 ${isBot ? 'bg-muted/30' : 'bg-background'} border-b border-border/50`}>
      <div className="max-w-3xl mx-auto">
        <div className="flex gap-6 items-start group">
          {/* Avatar */}
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
            isBot 
              ? 'bg-gradient-to-br from-primary to-primary/70 text-primary-foreground shadow-lg' 
              : 'bg-gradient-to-br from-accent to-accent/70 text-accent-foreground shadow-md'
          }`}>
            {isBot ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">
                {isBot ? 'MSME Assistant' : 'You'}
              </span>
              {isBot && intent && !isTyping && (
                <Badge variant="secondary" className="text-xs">
                  {intent.split(' ').slice(0, 2).join(' ')}
                </Badge>
              )}
            </div>

            <div className="text-[15px] leading-7">
              {isTyping ? (
                <div className="flex gap-2 items-center py-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                </div>
              ) : (
                <div className="prose prose-sm max-w-none dark:prose-invert prose-p:my-3 prose-ul:my-2 prose-li:my-1 prose-headings:font-semibold">
                  <ReactMarkdown>{message}</ReactMarkdown>
                </div>
              )}
            </div>

            {/* Feedback Buttons */}
            {isBot && !isTyping && messageId && onFeedback && intent !== "Greeting" && confidence && confidence > 0 && (
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border/50">
                {feedbackGiven ? (
                  <span className="text-xs text-muted-foreground">✓ Thanks for your feedback</span>
                ) : (
                  <>
                    <button
                      onClick={() => onFeedback(messageId, 1)}
                      onMouseEnter={() => setHoveredFeedback('up')}
                      onMouseLeave={() => setHoveredFeedback(null)}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors"
                      title="Good response"
                    >
                      <ThumbsUp className="w-4 h-4 text-muted-foreground hover:text-success transition-colors" />
                    </button>
                    <button
                      onClick={() => onFeedback(messageId, -1)}
                      onMouseEnter={() => setHoveredFeedback('down')}
                      onMouseLeave={() => setHoveredFeedback(null)}
                      className="p-1.5 rounded-md hover:bg-muted transition-colors"
                      title="Bad response"
                    >
                      <ThumbsDown className="w-4 h-4 text-muted-foreground hover:text-destructive transition-colors" />
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

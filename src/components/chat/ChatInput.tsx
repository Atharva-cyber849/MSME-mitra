import { useState, KeyboardEvent } from "react";
import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div 
      className={`
        flex items-center gap-2 p-4 bg-card/90 backdrop-blur-sm border-t border-border
        transition-all duration-300
        ${isFocused ? 'bg-card shadow-elevated' : ''}
      `}
    >
      <div className={`
        flex-1 relative transition-all duration-300
        ${isFocused ? 'scale-[1.01]' : ''}
      `}>
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Type your question here..."
          disabled={disabled}
          className={`
            w-full bg-muted border-2 border-transparent 
            focus-visible:ring-0 focus-visible:border-primary
            transition-all duration-300
            ${isFocused ? 'shadow-soft' : ''}
          `}
        />
        {isFocused && (
          <div className="absolute inset-0 rounded-md bg-primary/5 pointer-events-none animate-pulse" />
        )}
      </div>
      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground hover:text-foreground hover:bg-muted interactive-scale"
        disabled
        title="Voice input (coming soon)"
      >
        <Mic className="w-5 h-5" />
      </Button>
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className={`
          gradient-primary shadow-soft interactive-scale
          ${message.trim() && !disabled ? 'animate-glow' : ''}
          disabled:opacity-50 disabled:cursor-not-allowed
        `}
      >
        <Send className={`w-4 h-4 transition-transform duration-200 ${message.trim() ? 'translate-x-0.5 -translate-y-0.5' : ''}`} />
      </Button>
    </div>
  );
};

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
    <div className="flex items-center gap-2 p-4 bg-card border-t border-border">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your question here..."
        disabled={disabled}
        className="flex-1 bg-muted border-0 focus-visible:ring-1 focus-visible:ring-primary"
      />
      <Button
        size="icon"
        variant="ghost"
        className="text-muted-foreground hover:text-foreground"
        disabled
        title="Voice input (coming soon)"
      >
        <Mic className="w-5 h-5" />
      </Button>
      <Button
        size="icon"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        className="gradient-primary shadow-soft"
      >
        <Send className="w-4 h-4" />
      </Button>
    </div>
  );
};

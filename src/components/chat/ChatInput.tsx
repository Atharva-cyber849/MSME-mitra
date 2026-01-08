import { useState, KeyboardEvent } from "react";
import { Send, Mic, MicOff, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  showSuggestions?: boolean;
  setShowSuggestions?: (show: boolean) => void;
  isRecording?: boolean;
  onToggleRecording?: () => void;
  hasVoiceSupport?: boolean;
}

export const ChatInput = ({ 
  onSend, 
  disabled,
  showSuggestions = true,
  setShowSuggestions,
  isRecording = false,
  onToggleRecording,
  hasVoiceSupport = false
}: ChatInputProps) => {
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
    <div className="flex items-center justify-center gap-2 p-4">
      <div className="flex items-center gap-2 w-full max-w-2xl">
        {/* Hide/Show Suggestions Button */}
        {setShowSuggestions && (
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setShowSuggestions(!showSuggestions)}
            className="text-muted-foreground hover:text-foreground rounded-lg flex-shrink-0"
            title={showSuggestions ? "Hide suggestions" : "Show suggestions"}
          >
            {showSuggestions ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
          </Button>
        )}

        <div className="flex-1">
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Message MSME Assistant..."
            disabled={disabled}
            className="w-full bg-muted border border-border focus-visible:ring-1 focus-visible:ring-primary text-base py-5 px-4 rounded-xl"
          />
        </div>

        {/* Voice Input Button */}
        {hasVoiceSupport && onToggleRecording && (
          <Button
            size="icon"
            variant="ghost"
            onClick={onToggleRecording}
            className={`rounded-lg flex-shrink-0 ${
              isRecording 
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
            title={isRecording ? "Stop recording" : "Voice input"}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </Button>
        )}

        <Button
          size="icon"
          onClick={handleSend}
          disabled={!message.trim() || disabled}
          className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground disabled:opacity-50 flex-shrink-0"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";
import { Plus, MessageSquare, Settings, Menu, X, Trash2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { LanguageSelector } from "./LanguageSelector";
import { ThemeToggle } from "./ThemeToggle";

interface Conversation {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: number;
}

interface ChatSidebarProps {
  currentSessionId: string;
  onNewChat: () => void;
  onSelectConversation: (sessionId: string) => void;
  onShowBusinessProfile: () => void;
  hasBusinessProfile: boolean;
  language: string;
  onLanguageChange: (lang: string) => void;
  onSidebarToggle?: (isOpen: boolean) => void;
}

export const ChatSidebar = ({
  currentSessionId,
  onNewChat,
  onSelectConversation,
  onShowBusinessProfile,
  hasBusinessProfile,
  language,
  onLanguageChange,
  onSidebarToggle,
}: ChatSidebarProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  // Notify parent when sidebar state changes
  useEffect(() => {
    onSidebarToggle?.(isOpen);
  }, [isOpen, onSidebarToggle]);

  // Load conversations from localStorage
  useEffect(() => {
    const loadConversations = () => {
      const stored = localStorage.getItem("conversations");
      if (stored) {
        const parsed = JSON.parse(stored);
        setConversations(parsed);
      }
    };
    loadConversations();
    
    // Listen for conversation updates
    window.addEventListener("conversationUpdated", loadConversations);
    return () => window.removeEventListener("conversationUpdated", loadConversations);
  }, []);

  const handleDeleteConversation = (id: string) => {
    const updated = conversations.filter((c) => c.id !== id);
    setConversations(updated);
    localStorage.setItem("conversations", JSON.stringify(updated));
    
    // If deleting current conversation, start a new one
    if (id === currentSessionId) {
      onNewChat();
    }
  };

  const handleRenameConversation = (id: string, newTitle: string) => {
    const updated = conversations.map((c) =>
      c.id === id ? { ...c, title: newTitle } : c
    );
    setConversations(updated);
    localStorage.setItem("conversations", JSON.stringify(updated));
    setEditingId(null);
  };

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Group conversations by date
  const groupedConversations = conversations.reduce((groups, conv) => {
    const date = formatTimestamp(conv.timestamp);
    if (!groups[date]) groups[date] = [];
    groups[date].push(conv);
    return groups;
  }, {} as Record<string, Conversation[]>);

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-50 md:hidden"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </Button>

      {/* Sidebar */}
      <div
        className={`fixed top-0 left-0 h-screen bg-muted/50 border-r border-border backdrop-blur-sm flex flex-col transition-all duration-300 z-40 ${
          isOpen ? "w-64" : "w-0 md:w-16"
        }`}
      >
        {isOpen ? (
          <>
            {/* Header with Toggle */}
            <div className="flex items-center justify-between p-3 border-b border-border">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="mr-2"
              >
                <Menu className="w-4 h-4" />
              </Button>
              <Button
                onClick={onNewChat}
                className="flex-1 justify-start gap-2 bg-primary hover:bg-primary/90"
              >
                <Plus className="w-4 h-4" />
                New Chat
              </Button>
            </div>

            {/* Conversations List */}
            <ScrollArea className="flex-1 px-2">
              <div className="py-2 space-y-1">
                {Object.entries(groupedConversations).length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No conversations yet
                  </p>
                ) : (
                  Object.entries(groupedConversations).map(([date, convs]) => (
                    <div key={date} className="mb-4">
                      <p className="text-xs text-muted-foreground px-3 py-2 font-medium">
                        {date}
                      </p>
                      {convs.map((conv) => (
                        <div
                          key={conv.id}
                          className={`group relative rounded-lg transition-colors ${
                            conv.id === currentSessionId
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted"
                          }`}
                        >
                          {editingId === conv.id ? (
                            <div className="flex items-center gap-1 px-3 py-2">
                              <input
                                type="text"
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleRenameConversation(conv.id, editTitle);
                                  } else if (e.key === "Escape") {
                                    setEditingId(null);
                                  }
                                }}
                                className="flex-1 bg-background border border-border rounded px-2 py-1 text-sm"
                                autoFocus
                              />
                              <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleRenameConversation(conv.id, editTitle)}
                                className="h-6 w-6"
                              >
                                <Check className="w-3 h-3" />
                              </Button>
                            </div>
                          ) : (
                            <>
                              <button
                                onClick={() => onSelectConversation(conv.id)}
                                className="flex items-start gap-2 px-3 py-2 w-full text-left"
                              >
                                <MessageSquare className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {conv.title}
                                  </p>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {conv.lastMessage}
                                  </p>
                                </div>
                              </button>
                              <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 flex gap-1">
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => startEditing(conv.id, conv.title)}
                                  className="h-6 w-6"
                                >
                                  <Edit2 className="w-3 h-3" />
                                </Button>
                                <Button
                                  size="icon"
                                  variant="ghost"
                                  onClick={() => handleDeleteConversation(conv.id)}
                                  className="h-6 w-6 hover:bg-destructive/10 hover:text-destructive"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </Button>
                              </div>
                            </>
                          )}
                        </div>
                      ))}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>

            {/* Settings Section */}
            <div className="border-t border-border p-3 space-y-2">
              <button
                onClick={onShowBusinessProfile}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors w-full text-left ${
                  hasBusinessProfile ? "text-success" : "text-muted-foreground"
                }`}
              >
                <Settings className="w-4 h-4" />
                <span className="text-sm">Business Profile</span>
              </button>
              
              <div className="flex items-center justify-between px-3 py-1">
                <LanguageSelector value={language} onChange={onLanguageChange} compact />
              </div>
              
              <div className="flex items-center justify-between px-3 py-1">
                <span className="text-xs text-muted-foreground">Theme</span>
                <ThemeToggle />
              </div>
            </div>
          </>
        ) : (
          // Collapsed sidebar - icons only
          <div className="hidden md:flex flex-col items-center gap-2 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              title="Open sidebar"
              className="mb-2"
            >
              <Menu className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onNewChat}
              title="New Chat"
            >
              <Plus className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onShowBusinessProfile}
              title="Settings"
              className={hasBusinessProfile ? "text-success" : ""}
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

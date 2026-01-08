import { useState, useEffect } from "react";
import { 
  Calculator, Building, FileText, Shield, Award, TrendingUp, 
  Factory, Globe, Users, ShieldCheck, DollarSign, Megaphone,
  ChevronDown, ChevronUp 
} from "lucide-react";
import { chatbotAPI, QuickAction } from "@/lib/api";

interface QuickActionsPanelProps {
  onActionClick: (query: string) => void;
  hoveredAction: string | null;
  setHoveredAction: (action: string | null) => void;
}

const iconMap: Record<string, any> = {
  Calculator,
  Building,
  FileText,
  Shield,
  Award,
  TrendingUp,
  Factory,
  Globe,
  Users,
  ShieldCheck,
  DollarSign,
  Megaphone,
};

const colorMap: Record<string, string> = {
  primary: "from-primary to-primary/70",
  accent: "from-accent to-accent/70",
  success: "from-success to-success/70",
};

export const QuickActionsPanel = ({ onActionClick, hoveredAction, setHoveredAction }: QuickActionsPanelProps) => {
  const [actions, setActions] = useState<QuickAction[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  useEffect(() => {
    loadQuickActions();
  }, []);

  const loadQuickActions = async () => {
    try {
      const { actions } = await chatbotAPI.getQuickActions();
      setActions(actions);
    } catch (error) {
      console.error("Failed to load quick actions:", error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ["All", ...Array.from(new Set(actions.map((a) => a.category)))];
  
  const filteredActions = selectedCategory === "All" 
    ? actions 
    : actions.filter((a) => a.category === selectedCategory);

  const displayActions = expanded ? filteredActions : filteredActions.slice(0, 6);

  if (loading) {
    return (
      <div className="px-4 py-2 text-center text-sm text-muted-foreground">
        Loading quick actions...
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-card/80 backdrop-blur-sm">
      {/* Category Filter */}
      <div className="px-4 pt-3 pb-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-all
                ${selectedCategory === category
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 pb-3">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {displayActions.map((action) => {
            const Icon = iconMap[action.icon] || Building;
            return (
              <button
                key={action.id}
                onClick={() => onActionClick(action.query)}
                onMouseEnter={() => setHoveredAction(action.id)}
                onMouseLeave={() => setHoveredAction(null)}
                className={`
                  relative p-3 rounded-lg text-xs font-medium
                  flex flex-col items-center gap-2 interactive-scale
                  bg-gradient-to-br ${colorMap[action.color] || colorMap.primary}
                  text-white shadow-soft hover:shadow-elevated
                  transition-all duration-300
                  ${hoveredAction === action.id ? "ring-2 ring-primary/30 ring-offset-2" : ""}
                `}
              >
                <Icon className={`w-5 h-5 ${hoveredAction === action.id ? "animate-bounce-gentle" : ""}`} />
                <span className="text-center leading-tight">{action.title}</span>
                {hoveredAction === action.id && (
                  <span className="absolute inset-0 rounded-lg bg-white/20 animate-pulse-ring" />
                )}
              </button>
            );
          })}
        </div>

        {/* Expand/Collapse Button */}
        {filteredActions.length > 6 && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-1"
          >
            {expanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show More ({filteredActions.length - 6} more)
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

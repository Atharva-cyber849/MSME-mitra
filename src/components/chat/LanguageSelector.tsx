import { Globe } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguageSelectorProps {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}

export const LanguageSelector = ({ value, onChange, compact = false }: LanguageSelectorProps) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={compact ? "w-auto bg-transparent border-0 text-xs" : "w-[140px] bg-card border-border"}>
        {!compact && <Globe className="w-4 h-4 mr-2 text-muted-foreground" />}
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="en">English</SelectItem>
        <SelectItem value="hi">हिंदी (Hindi)</SelectItem>
        <SelectItem value="bn">বাংলা (Bengali)</SelectItem>
        <SelectItem value="te">తెలుగు (Telugu)</SelectItem>
        <SelectItem value="mr">मराठी (Marathi)</SelectItem>
        <SelectItem value="ta">தமிழ் (Tamil)</SelectItem>
        <SelectItem value="gu">ગુજરાતી (Gujarati)</SelectItem>
        <SelectItem value="kn">ಕನ್ನಡ (Kannada)</SelectItem>
        <SelectItem value="ml">മലയാളം (Malayalam)</SelectItem>
      </SelectContent>
    </Select>
  );
};

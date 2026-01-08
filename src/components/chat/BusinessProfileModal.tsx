import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, MapPin, Briefcase, TrendingUp, Factory } from "lucide-react";
import { BusinessProfile } from "@/lib/api";

interface BusinessProfileModalProps {
  open: boolean;
  onClose: () => void;
  onSave: (profile: BusinessProfile) => void;
}

export const BusinessProfileModal = ({ open, onClose, onSave }: BusinessProfileModalProps) => {
  const [profile, setProfile] = useState<BusinessProfile>({});

  const handleSave = () => {
    onSave(profile);
    onClose();
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Tell Us About Your Business
          </DialogTitle>
          <DialogDescription>
            Help us provide personalized recommendations tailored to your business needs.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Business Type */}
          <div className="space-y-2">
            <Label htmlFor="type" className="flex items-center gap-2">
              <Briefcase className="w-4 h-4" />
              Business Type
            </Label>
            <Select
              value={profile.type || ""}
              onValueChange={(value) => setProfile({ ...profile, type: value })}
            >
              <SelectTrigger id="type">
                <SelectValue placeholder="Select business type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Manufacturing">Manufacturing</SelectItem>
                <SelectItem value="Trading">Trading/Retail</SelectItem>
                <SelectItem value="Services">Services</SelectItem>
                <SelectItem value="Food & Beverages">Food & Beverages</SelectItem>
                <SelectItem value="Technology">Technology</SelectItem>
                <SelectItem value="Healthcare">Healthcare</SelectItem>
                <SelectItem value="Agriculture">Agriculture</SelectItem>
                <SelectItem value="Construction">Construction</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Size */}
          <div className="space-y-2">
            <Label htmlFor="size" className="flex items-center gap-2">
              <Factory className="w-4 h-4" />
              Business Size
            </Label>
            <Select
              value={profile.size || ""}
              onValueChange={(value) => setProfile({ ...profile, size: value })}
            >
              <SelectTrigger id="size">
                <SelectValue placeholder="Select business size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Micro">Micro (Investment up to ₹1 Cr)</SelectItem>
                <SelectItem value="Small">Small (Investment up to ₹10 Cr)</SelectItem>
                <SelectItem value="Medium">Medium (Investment up to ₹50 Cr)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Business Stage */}
          <div className="space-y-2">
            <Label htmlFor="stage" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Business Stage
            </Label>
            <Select
              value={profile.stage || ""}
              onValueChange={(value) => setProfile({ ...profile, stage: value })}
            >
              <SelectTrigger id="stage">
                <SelectValue placeholder="Select business stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Planning">Planning to Start</SelectItem>
                <SelectItem value="Starting">Just Started (0-1 year)</SelectItem>
                <SelectItem value="Growing">Growing (1-3 years)</SelectItem>
                <SelectItem value="Established">Established (3+ years)</SelectItem>
                <SelectItem value="Expanding">Expanding/Scaling</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <Label htmlFor="location" className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Location (State)
            </Label>
            <Select
              value={profile.location || ""}
              onValueChange={(value) => setProfile({ ...profile, location: value })}
            >
              <SelectTrigger id="location">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                <SelectItem value="Delhi">Delhi</SelectItem>
                <SelectItem value="Karnataka">Karnataka</SelectItem>
                <SelectItem value="Tamil Nadu">Tamil Nadu</SelectItem>
                <SelectItem value="Gujarat">Gujarat</SelectItem>
                <SelectItem value="Uttar Pradesh">Uttar Pradesh</SelectItem>
                <SelectItem value="West Bengal">West Bengal</SelectItem>
                <SelectItem value="Rajasthan">Rajasthan</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={handleSkip}>
            Skip for Now
          </Button>
          <Button onClick={handleSave} className="gradient-primary">
            Save Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

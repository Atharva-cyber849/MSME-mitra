import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight, Shield, Clock, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export const HeroSection = () => {
  return (
    <section className="gradient-hero py-16 md:py-24 overflow-hidden">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-5 py-3 rounded-full bg-primary/10 text-primary text-base font-semibold mb-8 animate-fade-in shadow-sm">
            <Shield className="w-5 h-5" />
            सरकार द्वारा सत्यापित | Government Verified
          </div>

          {/* Main Heading */}
          <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 animate-slide-up leading-tight">
            एमएसएमई व्यापार सहायता
            <br />
            <span className="text-primary">MSME Business Support</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-muted-foreground mb-10 max-w-3xl mx-auto animate-slide-up leading-relaxed" style={{ animationDelay: "0.1s" }}>
            सरकारी योजनाओं, लोन, GST, उद्यम पंजीकरण की तुरंत जानकारी पाएं
            <br />
            <span className="text-lg md:text-xl">Get instant answers on schemes, loans, GST & registration – 24×7 in Hindi & English</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 mb-12 animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <Link to="/chat" className="w-full sm:w-auto">
              <Button size="lg" className="gradient-primary shadow-soft gap-3 text-lg px-10 py-6 w-full sm:w-auto hover:scale-105 transition-transform">
                <MessageSquare className="w-6 h-6" />
                बात शुरू करें | Start Chat
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
            <Link to="/how-it-works" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="gap-3 text-lg px-10 py-6 w-full sm:w-auto hover:bg-muted transition-colors">
                कैसे काम करता है | How It Works
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto animate-slide-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card shadow-card hover:shadow-lg transition-all border border-primary/10">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Clock className="w-7 h-7 text-primary" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground mb-1">24/7</p>
                <p className="text-base text-muted-foreground font-medium">हमेशा उपलब्ध<br />Always Available</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card shadow-card hover:shadow-lg transition-all border border-accent/10">
              <div className="w-14 h-14 rounded-xl bg-accent/10 flex items-center justify-center">
                <Globe className="w-7 h-7 text-accent" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground mb-1">2</p>
                <p className="text-base text-muted-foreground font-medium">भाषाएं<br />Languages</p>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center gap-3 p-6 rounded-2xl bg-card shadow-card hover:shadow-lg transition-all border border-success/10">
              <div className="w-14 h-14 rounded-xl bg-success/10 flex items-center justify-center">
                <Shield className="w-7 h-7 text-success" />
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-foreground mb-1">100+</p>
                <p className="text-base text-muted-foreground font-medium">सरकारी योजनाएं<br />Govt. Schemes</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

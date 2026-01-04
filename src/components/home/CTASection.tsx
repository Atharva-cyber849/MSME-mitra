import { Link } from "react-router-dom";
import { MessageSquare, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const CTASection = () => {
  return (
    <section className="py-16 md:py-24 bg-muted">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8">
            Our chatbot is available 24/7 to answer your questions about government schemes, 
            loans, compliance, and more. Start your conversation now!
          </p>
          <Link to="/chat">
            <Button size="lg" className="gradient-primary shadow-soft gap-2 text-base px-8">
              <MessageSquare className="w-5 h-5" />
              Start Chat Now
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

import { 
  FileText, 
  Landmark, 
  Receipt, 
  ClipboardCheck, 
  Building2, 
  Coins,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

const features = [
  {
    icon: Landmark,
    title: "Government Schemes",
    description: "Access information about PM Vishwakarma, Mudra Yojana, Stand-Up India, and 100+ central & state schemes",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Coins,
    title: "Loans & Subsidies",
    description: "Learn about eligibility, interest rates, application process for MSME loans and government subsidies",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Receipt,
    title: "GST & Compliance",
    description: "Get guidance on GST registration, filing, returns, and tax compliance for your business",
    color: "bg-success/10 text-success",
  },
  {
    icon: ClipboardCheck,
    title: "Udyam Registration",
    description: "Step-by-step assistance for Udyam registration, MSME certificate, and classification",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: FileText,
    title: "Licensing & Permits",
    description: "Information on FSSAI, trade license, shop act, and other business permits",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Building2,
    title: "Business Setup",
    description: "Guidance on company registration, legal structure, and starting your business",
    color: "bg-success/10 text-success",
  },
];

export const FeaturesSection = () => {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
            How Can We Help You?
          </h2>
          <p className="text-muted-foreground">
            Our AI-powered chatbot provides instant answers on all aspects of MSME business support
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Link
              key={feature.title}
              to="/chat"
              className="group p-6 rounded-2xl bg-card shadow-card border border-border hover:shadow-elevated hover:border-primary/20 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                {feature.description}
              </p>
              <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Ask about this
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

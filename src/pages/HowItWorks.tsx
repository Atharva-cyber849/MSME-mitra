import { Layout } from "@/components/layout/Layout";
import { 
  MessageSquare, 
  Globe, 
  FileSearch, 
  Brain, 
  Database, 
  Sparkles, 
  CheckCircle,
  ArrowRight
} from "lucide-react";

const mlSteps = [
  {
    icon: MessageSquare,
    title: "User Query",
    description: "User asks a question in English or Hindi about MSME schemes, loans, or compliance",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Globe,
    title: "Language Detection",
    description: "System automatically detects the language of the input query",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: FileSearch,
    title: "Text Preprocessing",
    description: "Query is cleaned, tokenized, and normalized for processing",
    color: "bg-success/10 text-success",
  },
  {
    icon: Brain,
    title: "Intent Classification",
    description: "BERT/DistilBERT model classifies the user's intent (loan, scheme, GST, etc.)",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Database,
    title: "Knowledge Retrieval",
    description: "RAG system retrieves relevant information from vector database using embeddings",
    color: "bg-accent/10 text-accent",
  },
  {
    icon: Sparkles,
    title: "Response Generation",
    description: "LLM generates contextual response based on retrieved knowledge",
    color: "bg-success/10 text-success",
  },
  {
    icon: CheckCircle,
    title: "Confidence Check",
    description: "System evaluates confidence score and shows fallback if uncertain",
    color: "bg-primary/10 text-primary",
  },
];

const technologies = [
  { name: "DistilBERT", desc: "Intent Classification" },
  { name: "Sentence Transformers", desc: "Text Embeddings" },
  { name: "ChromaDB", desc: "Vector Database" },
  { name: "Google Gemini", desc: "Response Generation" },
  { name: "FastAPI", desc: "Backend API" },
  { name: "React + Vite", desc: "Frontend Framework" },
];

const HowItWorks = () => {
  return (
    <Layout>
      <section className="py-20 md:py-28 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-20">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
              यह कैसे काम करता है
              <br />
              <span className="text-4xl md:text-5xl">How It Works</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              हमारा AI-आधारित चैटबॉट आपके सवालों को समझने और एमएसएमई योजनाओं और अनुपालन के बारे में सटीक जानकारी देने के लिए उन्नत मशीन लर्निंग का उपयोग करता है
              <br />
              <span className="text-lg md:text-xl mt-3 block">Our AI-powered chatbot uses advanced machine learning to understand your queries and provide accurate information</span>
            </p>
          </div>

          {/* ML Pipeline */}
          <div className="max-w-5xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
              प्रक्रिया का प्रवाह | ML Pipeline Flow
            </h2>
            
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute left-10 top-0 bottom-0 w-1 bg-primary/20 hidden md:block rounded-full" />
              
              <div className="space-y-6">
                {mlSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex gap-8 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Icon */}
                    <div className={`w-20 h-20 rounded-3xl ${step.color} flex items-center justify-center flex-shrink-0 relative z-10 shadow-md`}>
                      <step.icon className="w-9 h-9" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-card rounded-3xl p-8 shadow-card border-2 border-border hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-base font-bold text-primary bg-primary/10 px-4 py-1.5 rounded-full">
                          चरण | Step {index + 1}
                        </span>
                        {index < mlSteps.length - 1 && (
                          <ArrowRight className="w-5 h-5 text-primary hidden sm:block" />
                        )}
                      </div>
                      <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-3">
                        {step.title}
                      </h3>
                      <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Technology Stack
            </h2>
            <p className="text-muted-foreground">
              Built with state-of-the-art NLP and ML technologies
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {technologies.map((tech, index) => (
              <div
                key={tech.name}
                className="p-4 rounded-xl bg-card shadow-card border border-border text-center animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <p className="font-semibold text-foreground">{tech.name}</p>
                <p className="text-xs text-muted-foreground">{tech.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Sources */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-4">
              Data Sources
            </h2>
            <p className="text-muted-foreground mb-8">
              Our knowledge base is built from official government sources
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              {[
                "Ministry of MSME Official Documents",
                "Udyam Registration Portal Data",
                "GST Portal Guidelines",
                "RBI Circulars on MSME Lending",
                "State MSME Department Publications",
                "SIDBI Scheme Documents",
                "MUDRA Bank Guidelines",
                "CGTMSE Scheme Details",
              ].map((source, index) => (
                <div
                  key={source}
                  className="flex items-center gap-3 p-4 rounded-xl bg-card shadow-card"
                >
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-sm text-foreground">{source}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default HowItWorks;

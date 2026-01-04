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
  { name: "BERT / DistilBERT", desc: "Intent Classification" },
  { name: "Sentence Transformers", desc: "Text Embeddings" },
  { name: "Pinecone / FAISS", desc: "Vector Database" },
  { name: "LangChain", desc: "RAG Pipeline" },
  { name: "OpenAI / Gemini", desc: "Response Generation" },
  { name: "FastAPI", desc: "Backend API" },
];

const HowItWorks = () => {
  return (
    <Layout>
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              How It Works
            </h1>
            <p className="text-lg text-muted-foreground">
              Our AI-powered chatbot uses advanced machine learning to understand your queries 
              and provide accurate information about MSME schemes and compliance.
            </p>
          </div>

          {/* ML Pipeline */}
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-2xl font-bold text-foreground mb-8 text-center">
              ML Pipeline Flow
            </h2>
            
            <div className="relative">
              {/* Connection Line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border hidden md:block" />
              
              <div className="space-y-6">
                {mlSteps.map((step, index) => (
                  <div
                    key={step.title}
                    className="flex gap-6 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Icon */}
                    <div className={`w-16 h-16 rounded-2xl ${step.color} flex items-center justify-center flex-shrink-0 relative z-10`}>
                      <step.icon className="w-7 h-7" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 bg-card rounded-2xl p-6 shadow-card border border-border">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded">
                          Step {index + 1}
                        </span>
                        {index < mlSteps.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                        )}
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
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

import { Layout } from "@/components/layout/Layout";
import { Target, Users, Lightbulb, Shield, Heart, Zap } from "lucide-react";

const values = [
  {
    icon: Target,
    title: "Mission",
    description: "To democratize access to government MSME support by providing instant, accurate information to every small business owner in India.",
  },
  {
    icon: Users,
    title: "Who We Serve",
    description: "Small business owners, shopkeepers, startups, rural entrepreneurs, artisans, and first-time MSME founders across India.",
  },
  {
    icon: Lightbulb,
    title: "Our Vision",
    description: "A future where every Indian entrepreneur can easily navigate government schemes and grow their business without bureaucratic hurdles.",
  },
];

const features = [
  {
    icon: Shield,
    title: "Verified Information",
    description: "All responses are sourced from official government portals and verified documents.",
  },
  {
    icon: Heart,
    title: "User-Friendly",
    description: "Designed with simplicity in mind, accessible to users with varying levels of digital literacy.",
  },
  {
    icon: Zap,
    title: "Instant Responses",
    description: "Get answers in seconds, 24/7, without waiting in queues or navigating complex websites.",
  },
];

const About = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              About MSME Support Chatbot
            </h1>
            <p className="text-lg text-muted-foreground">
              Empowering India's Micro, Small & Medium Enterprises with AI-powered assistance 
              for government schemes, loans, and compliance.
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center p-8 rounded-2xl bg-card shadow-card border border-border animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-6">
                  <value.icon className="w-8 h-8 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-4">
                  {value.title}
                </h3>
                <p className="text-muted-foreground">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-6 text-center">
              The Problem We Solve
            </h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                India has over 63 million MSMEs contributing to 30% of the GDP. Yet, many small business 
                owners struggle to access government support due to:
              </p>
              <ul className="list-disc list-inside space-y-2 pl-4">
                <li>Complex and scattered information across multiple portals</li>
                <li>Language barriers and technical jargon</li>
                <li>Lack of awareness about available schemes</li>
                <li>Limited digital literacy in rural areas</li>
                <li>Long waiting times at government offices</li>
              </ul>
              <p className="mt-6">
                Our chatbot bridges this gap by providing instant, accurate, and easy-to-understand 
                information in multiple languages, available 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
            Why Choose Our Chatbot?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-6 rounded-2xl bg-card shadow-card border border-border animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="py-12 bg-primary/5">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm text-muted-foreground">
              <strong>Disclaimer:</strong> This is a demonstration project for educational purposes. 
              While we strive for accuracy, always verify information from official government sources 
              before making important decisions. This chatbot is not affiliated with any government body.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;

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
      <section className="py-20 md:py-28 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
              एमएसएमई सहायता के बारे में
              <br />
              <span className="text-4xl md:text-5xl">About MSME Support Chatbot</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              भारत के सूक्ष्म, लघु और मध्यम उद्योगों को सरकारी योजनाओं, लोन और अनुपालन के लिए AI-आधारित सहायता
              <br />
              <span className="text-lg md:text-xl mt-2 block">Empowering India's MSMEs with AI-powered assistance for schemes, loans & compliance</span>
            </p>
          </div>
        </div>
      </section>

      {/* Mission & Values */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {values.map((value, index) => (
              <div
                key={value.title}
                className="text-center p-10 rounded-3xl bg-card shadow-card border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-8 shadow-md">
                  <value.icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-heading text-2xl font-bold text-foreground mb-5">
                  {value.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="py-20 md:py-28 bg-muted">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-10 text-center">
              हम किन समस्याओं का समाधान करते हैं
              <br />
              <span className="text-3xl md:text-4xl mt-2 block">Problems We Solve</span>
            </h2>
            <div className="space-y-6 text-muted-foreground bg-card p-8 md:p-10 rounded-3xl shadow-lg">
              <p className="text-lg md:text-xl leading-relaxed">
                भारत में 6.3 करोड़ से अधिक एमएसएमई हैं जो GDP में 30% का योगदान देते हैं। फिर भी, कई छोटे व्यापार मालिकों को सरकारी सहायता प्राप्त करने में कठिनाई होती है:
                <br /><br />
                <strong>India has over 63 million MSMEs contributing to 30% of GDP. Yet, many small business owners struggle to access government support due to:</strong>
              </p>
              <ul className="list-disc list-inside space-y-4 pl-6 text-base md:text-lg">
                <li>Complex and scattered information across multiple portals</li>
                <li>Language barriers and technical jargon</li>
                <li>Lack of awareness about available schemes</li>
                <li>Limited digital literacy in rural areas</li>
                <li>Long waiting times at government offices</li>
              </ul>
              <p className="mt-6 text-lg md:text-xl leading-relaxed">
                Our chatbot bridges this gap by providing instant, accurate, and easy-to-understand 
                information in multiple languages, available 24/7.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 md:py-28 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-16 text-center">
            हमारा चैटबॉट क्यों चुनें?
            <br />
            <span className="text-3xl md:text-4xl mt-2 block">Why Choose Our Chatbot?</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="p-8 rounded-3xl bg-card shadow-card border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg animate-slide-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-foreground mb-4">
                  {feature.title}
                </h3>
                <p className="text-base md:text-lg text-muted-foreground leading-relaxed">
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

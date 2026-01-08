import { Layout } from "@/components/layout/Layout";
import { Phone, Mail, MapPin, MessageCircle, ExternalLink, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { toast } from "sonner";

const helplines = [
  {
    title: "MSME Helpline",
    number: "1800-11-0900",
    description: "National toll-free helpline for MSME queries",
    available: "24/7",
  },
  {
    title: "Udyam Registration Help",
    number: "1800-180-6763",
    description: "Support for Udyam registration issues",
    available: "9 AM - 6 PM",
  },
  {
    title: "GST Helpdesk",
    number: "1800-103-4786",
    description: "Queries related to GST registration and filing",
    available: "9 AM - 9 PM",
  },
];

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you soon.", {
      description: "This is a demo - no actual message was sent.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-20 md:py-28 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="font-heading text-5xl md:text-6xl font-bold text-foreground mb-8 leading-tight">
              संपर्क और सहायता
              <br />
              <span className="text-4xl md:text-5xl">Contact & Help</span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed">
              सहायता चाहिए? हमारी हेल्पलाइन पर संपर्क करें या मानव सहायता से जुड़ें
              <br />
              <span className="text-lg md:text-xl mt-2 block">Need assistance? Reach out through our helplines or connect with human support</span>
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Helplines */}
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">
                आधिकारिक हेल्पलाइन | Official Helplines
              </h2>
              <div className="space-y-5">
                {helplines.map((helpline, index) => (
                  <div
                    key={helpline.title}
                    className="p-8 rounded-3xl bg-card shadow-card border-2 border-border hover:border-primary/30 transition-all hover:shadow-lg animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex flex-col gap-4">
                      <div>
                        <h3 className="font-bold text-xl md:text-2xl text-foreground mb-2">
                          {helpline.title}
                        </h3>
                        <p className="text-base md:text-lg text-muted-foreground mb-4 leading-relaxed">
                          {helpline.description}
                        </p>
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                          <a
                            href={`tel:${helpline.number}`}
                            className="flex items-center gap-3 text-primary font-bold text-xl md:text-2xl hover:text-primary/80 transition-colors"
                          >
                            <Phone className="w-6 h-6" />
                            {helpline.number}
                          </a>
                          <span className="flex items-center gap-2 text-base text-muted-foreground bg-muted px-4 py-2 rounded-full">
                            <Clock className="w-4 h-4" />
                            {helpline.available}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Human Support Button */}
              <div className="mt-8 p-6 rounded-2xl bg-primary/5 border border-primary/20">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
                    <MessageCircle className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground">Need Human Support?</h3>
                    <p className="text-sm text-muted-foreground">
                      Connect with a real person for complex queries
                    </p>
                  </div>
                </div>
                <Button className="w-full mt-4 gradient-primary shadow-soft gap-2" disabled>
                  Connect to Human Support
                  <span className="text-xs opacity-75">(Demo)</span>
                </Button>
              </div>

              {/* Useful Links */}
              <div className="mt-8">
                <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
                  Useful Links
                </h3>
                <div className="space-y-2">
                  {[
                    { name: "MSME Ministry Portal", url: "https://msme.gov.in" },
                    { name: "Udyam Registration", url: "https://udyamregistration.gov.in" },
                    { name: "GST Portal", url: "https://gst.gov.in" },
                    { name: "MUDRA Loans", url: "https://mudra.org.in" },
                  ].map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {link.name}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div>
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-foreground mb-8">
                संदेश भेजें | Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="text-base md:text-lg font-semibold text-foreground mb-3 block">
                      आपका नाम | Your Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="अपना नाम लिखें | Enter your name"
                      required
                      className="text-base md:text-lg py-6 px-4"
                    />
                  </div>
                  <div>
                    <label className="text-base md:text-lg font-semibold text-foreground mb-3 block">
                      ईमेल पता | Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="अपना ईमेल लिखें | Enter your email"
                      required
                      className="text-base md:text-lg py-6 px-4"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-base md:text-lg font-semibold text-foreground mb-3 block">
                    विषय | Subject
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="यह किस बारे में है? | What's this about?"
                    required
                    className="text-base md:text-lg py-6 px-4"
                  />
                </div>
                <div>
                  <label className="text-base md:text-lg font-semibold text-foreground mb-3 block">
                    संदेश | Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="अपनी समस्या विस्तार से बताएं... | Describe your query in detail..."
                    rows={6}
                    required
                    className="text-base md:text-lg py-4 px-4"
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary shadow-soft text-lg py-7 hover:scale-105 transition-transform">
                  संदेश भेजें | Send Message
                </Button>
              </form>

              {/* Office Address */}
              <div className="mt-8 p-6 rounded-2xl bg-card shadow-card border border-border">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Office Address
                </h3>
                <p className="text-sm text-muted-foreground">
                  Ministry of Micro, Small & Medium Enterprises<br />
                  Udyog Bhawan, Rafi Marg<br />
                  New Delhi - 110001<br />
                  India
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;

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
      <section className="py-16 md:py-24 gradient-hero">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-foreground mb-6">
              Contact & Help
            </h1>
            <p className="text-lg text-muted-foreground">
              Need assistance? Reach out through our helplines or connect with human support.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 md:py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Helplines */}
            <div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                Official Helplines
              </h2>
              <div className="space-y-4">
                {helplines.map((helpline, index) => (
                  <div
                    key={helpline.title}
                    className="p-6 rounded-2xl bg-card shadow-card border border-border animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">
                          {helpline.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {helpline.description}
                        </p>
                        <div className="flex items-center gap-4">
                          <a
                            href={`tel:${helpline.number}`}
                            className="flex items-center gap-2 text-primary font-medium"
                          >
                            <Phone className="w-4 h-4" />
                            {helpline.number}
                          </a>
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3 h-3" />
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
              <h2 className="font-heading text-2xl font-bold text-foreground mb-6">
                Send us a Message
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Your Name
                    </label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Enter your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Subject
                  </label>
                  <Input
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="What's this about?"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Message
                  </label>
                  <Textarea
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    placeholder="Describe your query in detail..."
                    rows={5}
                    required
                  />
                </div>
                <Button type="submit" className="w-full gradient-primary shadow-soft">
                  Send Message
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

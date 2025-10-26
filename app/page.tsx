"use client";
import React, { useState, useEffect } from "react";
import {
  Brain,
  Zap,
  Target,
  Users,
  ArrowRight,
  Menu,
  X,
  CheckCircle,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function AIConsultancySite() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
  });
  const [formStatus, setFormStatus] = useState({ type: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleInputChange = (e: {
    target: { name: string; value: string };
  }) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendEmail = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: "", message: "" });

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        type: "error",
        message: "Please fill in all required fields.",
      });
      setIsSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormStatus({
        type: "error",
        message: "Please enter a valid email address.",
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          company: formData.company,
          message: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setFormStatus({
          type: "success",
          message:
            "✨ Thank you! Your message has been sent successfully. We'll get back to you within 24 hours.",
        });
        setFormData({ name: "", email: "", company: "", message: "" });
      } else {
        setFormStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setFormStatus({
        type: "error",
        message: "Network error. Please check your connection and try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const services = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI Strategy & Roadmap",
      description:
        "Develop comprehensive AI integration strategies aligned with your business objectives and technical capabilities.",
      color: "from-purple-200 to-purple-300",
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Custom AI Solutions",
      description:
        "Build tailored AI models and systems that solve your specific business challenges and enhance product capabilities.",
      color: "from-blue-200 to-blue-300",
    },
    {
      icon: <Target className="w-8 h-8" />,
      title: "Implementation & Integration",
      description:
        "Seamlessly integrate AI technologies into your existing products and workflows with minimal disruption.",
      color: "from-pink-200 to-pink-300",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Team Training & Support",
      description:
        "Empower your team with AI knowledge and provide ongoing support to ensure long-term success.",
      color: "from-teal-200 to-teal-300",
    },
  ];

  const caseStudies = [
    {
      company: "E-Commerce Platform",
      challenge: "Needed personalized product recommendations",
      solution: "Implemented ML-based recommendation engine",
      result: "35% increase in conversion rates",
      color: "bg-gradient-to-br from-purple-100 to-pink-100",
    },
    {
      company: "SaaS Analytics Tool",
      challenge: "Manual data analysis was time-consuming",
      solution: "Integrated predictive analytics with AI",
      result: "10x faster insights generation",
      color: "bg-gradient-to-br from-blue-100 to-cyan-100",
    },
    {
      company: "Customer Support Platform",
      challenge: "High volume of repetitive inquiries",
      solution: "Deployed intelligent chatbot system",
      result: "60% reduction in support tickets",
      color: "bg-gradient-to-br from-teal-100 to-green-100",
    },
  ];

  const process = [
    {
      step: "01",
      title: "Discovery",
      description:
        "Understand your business goals, technical landscape, and AI readiness",
    },
    {
      step: "02",
      title: "Strategy",
      description:
        "Design a tailored AI integration roadmap with clear milestones",
    },
    {
      step: "03",
      title: "Development",
      description: "Build and train AI models specific to your use case",
    },
    {
      step: "04",
      title: "Integration",
      description: "Seamlessly deploy AI into your existing systems",
    },
    {
      step: "05",
      title: "Optimization",
      description: "Monitor, refine, and scale AI performance over time",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-gray-800">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" />
        <div
          className="absolute top-40 right-10 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute bottom-20 left-1/2 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 group">
              <div className="relative">
                <Brain className="w-8 h-8 text-purple-500 transition-transform group-hover:rotate-12" />
                <Sparkles className="w-4 h-4 text-pink-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                AI Integration Labs
              </span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-8">
              <a
                href="#services"
                className="hover:text-purple-600 transition-colors relative group"
              >
                Services
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full" />
              </a>
              <a
                href="#process"
                className="hover:text-pink-600 transition-colors relative group"
              >
                Process
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-pink-600 transition-all group-hover:w-full" />
              </a>
              <a
                href="#case-studies"
                className="hover:text-blue-600 transition-colors relative group"
              >
                Case Studies
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full" />
              </a>
              <a
                href="#contact"
                className="hover:text-teal-600 transition-colors relative group"
              >
                Contact
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-teal-600 transition-all group-hover:w-full" />
              </a>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-purple-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-purple-100 animate-fadeIn">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#services"
                className="block hover:text-purple-600 transition-colors"
              >
                Services
              </a>
              <a
                href="#process"
                className="block hover:text-pink-600 transition-colors"
              >
                Process
              </a>
              <a
                href="#case-studies"
                className="block hover:text-blue-600 transition-colors"
              >
                Case Studies
              </a>
              <a
                href="#contact"
                className="block hover:text-teal-600 transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-block mb-4 px-4 py-2 bg-purple-100 rounded-full text-purple-700 text-sm font-medium animate-bounce">
            ✨ Transforming Businesses with AI
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent animate-fadeIn">
            Transform Your Products with AI
          </h1>
          <p
            className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto animate-fadeIn"
            style={{ animationDelay: "0.2s" }}
          >
            Expert AI integration consultancy helping businesses unlock the
            power of artificial intelligence
          </p>
          <div
            className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeIn"
            style={{ animationDelay: "0.4s" }}
          >
            <a
              href="#contact"
              className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2"
            >
              <span>Get Started</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </a>
            <a
              href="#services"
              className="group bg-white hover:bg-gray-50 border-2 border-purple-300 hover:border-purple-400 text-purple-600 px-8 py-4 rounded-full font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Our Services
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Comprehensive AI solutions tailored to your unique business needs
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group bg-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 border border-gray-100 animate-fadeIn"
                style={{ animationDelay: `${idx * 0.1}s` }}
              >
                <div
                  className={`inline-block p-3 rounded-xl bg-gradient-to-br ${service.color} text-gray-700 mb-4 group-hover:scale-110 transition-transform`}
                >
                  {service.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-800">
                  {service.title}
                </h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section
        id="process"
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-white/50 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-pink-600 to-blue-600 bg-clip-text text-transparent">
            Our Process
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            A proven methodology for successful AI integration
          </p>
          <div className="grid md:grid-cols-5 gap-6">
            {process.map((item, idx) => (
              <div key={idx} className="relative group">
                <div
                  className="bg-gradient-to-br from-purple-400 via-pink-400 to-blue-400 text-white p-6 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:scale-105 animate-fadeIn"
                  style={{ animationDelay: `${idx * 0.1}s` }}
                >
                  <div className="text-3xl font-bold mb-3 opacity-60">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-sm text-white/90">{item.description}</p>
                </div>
                {idx < process.length - 1 && (
                  <ArrowRight className="hidden md:block absolute top-1/2 -right-8 transform -translate-y-1/2 text-purple-300 w-6 h-6 animate-pulse" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies Section */}
      <section
        id="case-studies"
        className="relative py-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-7xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
            Success Stories
          </h2>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Real results from our AI integration projects
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {caseStudies.map((study, idx) => (
              <div
                key={idx}
                className={`${study.color} p-8 rounded-2xl shadow-lg hover:shadow-2xl transition-all hover:-translate-y-2 animate-fadeIn`}
                style={{ animationDelay: `${idx * 0.15}s` }}
              >
                <h3 className="text-2xl font-bold mb-4 text-gray-800">
                  {study.company}
                </h3>
                <div className="space-y-4">
                  <div>
                    <div className="text-sm text-gray-600 font-semibold mb-1">
                      Challenge
                    </div>
                    <p className="text-gray-700">{study.challenge}</p>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 font-semibold mb-1">
                      Solution
                    </div>
                    <p className="text-gray-700">{study.solution}</p>
                  </div>
                  <div className="pt-4 border-t border-gray-300">
                    <div className="flex items-center space-x-2 text-green-600">
                      <CheckCircle className="w-5 h-5 animate-pulse" />
                      <span className="font-semibold">{study.result}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        id="contact"
        className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100"
      >
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Ready to Get Started?
          </h2>
          <p className="text-gray-600 mb-8">
            Lets discuss how AI can transform your product and drive business
            growth
          </p>
          <div className="bg-white p-8 rounded-2xl shadow-2xl">
            {formStatus.message && (
              <div
                className={`mb-4 p-4 rounded-xl ${
                  formStatus.type === "success"
                    ? "bg-green-100 text-green-700 border border-green-300"
                    : formStatus.type === "error"
                      ? "bg-red-100 text-red-700 border border-red-300"
                      : "bg-blue-100 text-blue-700 border border-blue-300"
                }`}
              >
                {formStatus.message}
              </div>
            )}
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your Name *"
                  className="bg-gray-50 border-2 border-purple-200 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-400 transition-all"
                  required
                />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email Address *"
                  className="bg-gray-50 border-2 border-pink-200 rounded-xl px-4 py-3 focus:outline-none focus:border-pink-400 transition-all"
                  required
                />
              </div>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                placeholder="Company Name"
                className="w-full bg-gray-50 border-2 border-blue-200 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-400 transition-all"
              />
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us about your project... *"
                rows={4}
                className="w-full bg-gray-50 border-2 border-teal-200 rounded-xl px-4 py-3 focus:outline-none focus:border-teal-400 transition-all"
                required
              />
              <button
                onClick={sendEmail}
                disabled={isSubmitting}
                className={`w-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:from-purple-600 hover:via-pink-600 hover:to-blue-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl hover:scale-105 flex items-center justify-center space-x-2 ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <MessageSquare className="w-5 h-5" />
                <span>
                  {isSubmitting ? "Sending..." : "Schedule a Consultation"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-white/80 backdrop-blur-md border-t border-purple-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="flex items-center justify-center space-x-2 mb-4 group">
            <Brain className="w-6 h-6 text-purple-500 group-hover:rotate-12 transition-transform" />
            <span className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              AI Integration Labs
            </span>
          </div>
          <p className="text-gray-600 mb-4">
            Empowering businesses with intelligent AI solutions
          </p>
          <p className="text-gray-400 text-sm">
            © 2025 AI Integration Labs. All rights reserved.
          </p>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

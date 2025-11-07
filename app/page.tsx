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
  MessageSquare,
  Sparkles,
  TrendingUp,
  Rocket,
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

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const sendEmail = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormStatus({ type: "", message: "" });

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        type: "error",
        message: "Please fill in all required fields.",
      });
      setIsSubmitting(false);
      return;
    }

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
      icon: <Brain className="w-10 h-10" />,
      title: "AI Strategy & Roadmap",
      description:
        "Develop comprehensive AI integration strategies aligned with your business objectives and technical capabilities.",
    },
    {
      icon: <Zap className="w-10 h-10" />,
      title: "Custom AI Solutions",
      description:
        "Build tailored AI models and systems that solve your specific business challenges and enhance product capabilities.",
    },
    {
      icon: <Target className="w-10 h-10" />,
      title: "Implementation & Integration",
      description:
        "Seamlessly integrate AI technologies into your existing products and workflows with minimal disruption.",
    },
    {
      icon: <Users className="w-10 h-10" />,
      title: "Team Training & Support",
      description:
        "Empower your team with AI knowledge and provide ongoing support to ensure long-term success.",
    },
  ];

  const stats = [
    { value: "50+", label: "AI Projects Delivered" },
    { value: "95%", label: "Client Satisfaction" },
    { value: "$2M+", label: "Revenue Generated" },
    { value: "24/7", label: "Support Available" },
  ];

  const caseStudies = [
    {
      company: "E-Commerce Platform",
      description: "Personalized product recommendations that drive sales",
      result: "35% increase in conversion rates",
      metric: "+35%",
    },
    {
      company: "SaaS Analytics Tool",
      description: "Predictive analytics for faster business insights",
      result: "10x faster insights generation",
      metric: "10x",
    },
    {
      company: "Customer Support Platform",
      description: "Intelligent chatbot reducing support workload",
      result: "60% reduction in support tickets",
      metric: "-60%",
    },
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/95 backdrop-blur-sm z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2 group cursor-pointer">
              <div className="relative">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <Brain className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-gray-900">
                AI Integration Labs
              </span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#services"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Services
              </a>
              <a
                href="#case-studies"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Case Studies
              </a>
              <a
                href="#process"
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Process
              </a>
              <a
                href="#contact"
                className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-800 transition-all hover:scale-105"
              >
                Get Started
              </a>
            </div>

            <button
              className="md:hidden text-gray-900"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100">
            <div className="px-4 py-4 space-y-3">
              <a
                href="#services"
                className="block text-gray-600 hover:text-gray-900"
              >
                Services
              </a>
              <a
                href="#case-studies"
                className="block text-gray-600 hover:text-gray-900"
              >
                Case Studies
              </a>
              <a
                href="#process"
                className="block text-gray-600 hover:text-gray-900"
              >
                Process
              </a>
              <a
                href="#contact"
                className="block bg-black text-white px-6 py-2 rounded-full text-center"
              >
                Get Started
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-2 bg-gray-100 px-4 py-2 rounded-full mb-6 animate-slideDown">
              <Sparkles className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-700">
                Trusted by innovative companies
              </span>
            </div>

            <h1 className="text-6xl md:text-8xl line-height-1 font-bold mb-6 text-gray-900 animate-fadeInUp">
              Building AI Solutions,
              <br />
              <span className="relative  inline-block md:text-4xl text-gray-500">
                integration & automation.
                <div className="absolute -bottom-2 left-0 w-full h-3 bg-yellow-200 -z-10 animate-expand"></div>
              </span>
            </h1>

            <p
              className="text-xl md:text-2xl text-gray-600 mb-10 max-w-3xl mx-auto animate-fadeInUp"
              style={{ animationDelay: "0.2s" }}
            >
              Turn your product vision into market success with AI-powered
              solutions
            </p>

            <div
              className="flex flex-col sm:flex-row gap-4 justify-center animate-fadeInUp"
              style={{ animationDelay: "0.4s" }}
            >
              <a
                href="#contact"
                className="group bg-black text-white px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-xl flex items-center justify-center space-x-2"
              >
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="#case-studies"
                className="bg-white border-2 border-gray-900 text-gray-900 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 hover:shadow-xl"
              >
                View Case Studies
              </a>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="text-center p-6 bg-white rounded-2xl border border-gray-200 hover:border-gray-900 transition-all hover:scale-105 animate-fadeInUp"
                style={{ animationDelay: `${0.6 + idx * 0.1}s` }}
              >
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
              Premium services
              <br />
              fueling startup growth
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Comprehensive AI solutions tailored to your unique business needs
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {services.map((service, idx) => (
              <div
                key={idx}
                className="group bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-900 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{
                  animation: `slideInUp 0.6s ease-out ${idx * 0.1}s both`,
                }}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-black group-hover:text-white transition-all group-hover:scale-110">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center text-gray-900 font-semibold group-hover:translate-x-2 transition-transform">
                  <span>Learn more</span>
                  <ArrowRight className="w-5 h-5 ml-2" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="case-studies" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
              Startups that thrived
              <br />
              with our support
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {caseStudies.map((study, idx) => (
              <div
                key={idx}
                className="group bg-gray-50 p-8 rounded-3xl hover:bg-white border border-transparent hover:border-gray-900 transition-all hover:scale-105 hover:shadow-2xl cursor-pointer"
                style={{
                  animation: `slideInUp 0.6s ease-out ${idx * 0.15}s both`,
                }}
              >
                <div className="text-6xl font-bold text-gray-900 mb-6">
                  {study.metric}
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {study.company}
                </h3>
                <p className="text-gray-600 mb-6">{study.description}</p>
                <div className="flex items-center space-x-2 text-green-600 font-semibold">
                  <TrendingUp className="w-5 h-5" />
                  <span>{study.result}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section id="process" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-bold mb-4 text-gray-900">
              From idea to launch —
              <br />
              we help AI startups move fast
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-900 transition-all hover:scale-105 hover:shadow-xl">
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Discovery & Strategy
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We dive deep into your business goals, technical landscape, and
                AI readiness to design a tailored roadmap.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-900 transition-all hover:scale-105 hover:shadow-xl"
              style={{ animationDelay: "0.1s" }}
            >
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Build & Integrate
              </h3>
              <p className="text-gray-600 leading-relaxed">
                Our team builds custom AI models and seamlessly integrates them
                into your existing systems.
              </p>
            </div>

            <div
              className="bg-white p-8 rounded-3xl border border-gray-200 hover:border-gray-900 transition-all hover:scale-105 hover:shadow-xl"
              style={{ animationDelay: "0.2s" }}
            >
              <div className="w-12 h-12 bg-black text-white rounded-full flex items-center justify-center text-xl font-bold mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">
                Optimize & Scale
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We monitor, refine, and scale AI performance while training your
                team for long-term success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900 rounded-3xl p-12 text-center text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900"></div>

            <div className="relative z-10">
              <Rocket className="w-16 h-16 mx-auto mb-6 animate-bounce" />
              <h2 className="text-4xl md:text-5xl font-bold mb-4">
                Ready to transform your product?
              </h2>
              <p className="text-xl text-gray-300 mb-8">
                Start with a free 3-day trial. No commitment required.
              </p>

              {formStatus.message && (
                <div
                  className={`mb-6 p-4 rounded-xl ${
                    formStatus.type === "success"
                      ? "bg-green-500/20 text-green-300 border border-green-500"
                      : "bg-red-500/20 text-red-300 border border-red-500"
                  }`}
                >
                  {formStatus.message}
                </div>
              )}

              <div className="max-w-2xl mx-auto space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Your Name *"
                    className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-white/40 transition-all text-white placeholder-gray-400"
                    required
                  />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Email Address *"
                    className="bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-white/40 transition-all text-white placeholder-gray-400"
                    required
                  />
                </div>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company Name"
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-white/40 transition-all text-white placeholder-gray-400"
                />
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Tell us about your project... *"
                  rows={4}
                  className="w-full bg-white/10 border border-white/20 rounded-xl px-6 py-4 focus:outline-none focus:border-white/40 transition-all text-white placeholder-gray-400"
                  required
                />
                <button
                  onClick={sendEmail}
                  disabled={isSubmitting}
                  className={`w-full bg-white text-gray-900 px-8 py-4 rounded-full font-bold transition-all hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2 ${
                    isSubmitting ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  <MessageSquare className="w-5 h-5" />
                  <span>
                    {isSubmitting ? "Sending..." : "Start Free Trial"}
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">
                AI Integration Labs
              </span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 AI Integration Labs. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(50px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes expand {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }
        .animate-slideDown {
          animation: slideDown 0.6s ease-out forwards;
        }
        .animate-expand {
          animation: expand 1s ease-out 0.5s forwards;
          width: 0;
        }
      `}</style>
    </div>
  );
}

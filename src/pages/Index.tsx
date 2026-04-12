import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Presentation,
  ArrowRight,
  Zap,
  Layout,
  Download,
  Play,
  ChevronRight,
} from "lucide-react";

const navLinks = ["Features", "Templates", "Pricing"];

const features = [
  { icon: Zap, title: "AI-Powered", desc: "Generate complete presentations from a single topic" },
  { icon: Layout, title: "Pro Templates", desc: "Beautiful, academic-grade slide designs" },
  { icon: Download, title: "PPTX Export", desc: "Download production-ready PowerPoint files" },
  { icon: Play, title: "Present Mode", desc: "Fullscreen slideshow with keyboard controls" },
];

const trustedBy = ["IIT Delhi", "Stanford", "MIT", "Harvard", "Oxford"];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [authOpen, setAuthOpen] = useState(false);
  const [topic, setTopic] = useState("");

  const handleGenerate = () => {
    if (user) {
      navigate(`/create${topic ? `?topic=${encodeURIComponent(topic)}` : ""}`);
    } else {
      setAuthOpen(true);
    }
  };

  return (
    <div className="min-h-screen gradient-orange-bg text-foreground">
      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/40 border-b border-border/50">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Deckora" className="h-8 w-auto" />
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link} href={`#${link.toLowerCase()}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Login
              </button>
            )}
            <Button size="sm" className="gradient-primary text-primary-foreground rounded-full px-5 hover:brightness-110 transition-all" onClick={handleGenerate}>
              Get Started
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Glow orbs */}
        <div className="absolute top-20 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-40 right-1/4 w-80 h-80 bg-accent/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left - Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="space-y-8"
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
                <Sparkles className="h-3.5 w-3.5" />
                AI-Powered Presentation Maker
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight">
                Create stunning{" "}
                <span className="gradient-text">presentations</span>{" "}
                in seconds
              </h1>

              <p className="text-lg text-muted-foreground max-w-lg leading-relaxed">
                Transform any topic into professional, academic-grade slides with AI.
                Export to PowerPoint, present fullscreen — all in one tool.
              </p>

              {/* Input + Button */}
              <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="Enter your topic..."
                    className="w-full h-13 px-5 rounded-full bg-secondary/60 border border-border/60 text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  />
                </div>
                <Button
                  onClick={handleGenerate}
                  className="gradient-primary text-primary-foreground rounded-full px-7 h-13 text-sm font-semibold hover:scale-[1.03] hover:brightness-110 transition-all shadow-lg glow-orange-sm"
                >
                  Generate
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              <p className="text-xs text-muted-foreground">
                No credit card required • Free to try
              </p>
            </motion.div>

            {/* Right - Floating Card Mockup */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:block relative"
            >
              <div className="relative">
                {/* Main card */}
                <div className="glass-card-strong rounded-2xl p-6 glow-orange">
                  <div className="slide-preview rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 via-accent/10 to-secondary flex items-center justify-center">
                    <div className="text-center space-y-4 p-8">
                      <div className="w-14 h-14 rounded-2xl gradient-primary mx-auto flex items-center justify-center">
                        <Presentation className="h-7 w-7 text-primary-foreground" />
                      </div>
                      <h3 className="text-xl font-bold font-display">Your Presentation</h3>
                      <p className="text-sm text-muted-foreground">AI-generated slides ready in seconds</p>
                      <div className="flex gap-2 justify-center">
                        {[1, 2, 3, 4].map((i) => (
                          <div key={i} className={`h-1.5 rounded-full ${i === 1 ? "w-8 bg-primary" : "w-4 bg-muted"}`} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Floating mini card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="absolute -bottom-6 -left-8 glass-card rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg gradient-primary flex items-center justify-center">
                    <Download className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">Export Ready</p>
                    <p className="text-[10px] text-muted-foreground">PPTX • PDF</p>
                  </div>
                </motion.div>

                {/* Floating mini card 2 */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  className="absolute -top-4 -right-6 glass-card rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <div className="w-9 h-9 rounded-lg bg-success/20 flex items-center justify-center">
                    <Zap className="h-4 w-4 text-success" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold">12 Slides</p>
                    <p className="text-[10px] text-muted-foreground">Generated</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="border-t border-border/40 py-10">
        <div className="max-w-5xl mx-auto px-6">
          <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mb-6">Trusted by students & professionals</p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {trustedBy.map((name) => (
              <span key={name} className="text-sm font-medium text-muted-foreground/50">{name}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-14"
          >
            <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
              Everything you need to <span className="gradient-text">present like a pro</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              From AI content generation to polished exports — Deckora handles it all.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="glass-card rounded-2xl p-6 hover:border-primary/30 transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold font-display mb-1.5">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card-strong rounded-3xl p-12 glow-orange relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 pointer-events-none" />
            <div className="relative">
              <h2 className="text-3xl md:text-4xl font-bold font-display mb-4">
                Ready to create your next presentation?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands of students and professionals using Deckora to build stunning slides.
              </p>
              <Button
                onClick={handleGenerate}
                className="gradient-primary text-primary-foreground rounded-full px-8 h-12 text-base font-semibold hover:scale-[1.03] hover:brightness-110 transition-all shadow-lg glow-orange-sm"
              >
                Get Started Free
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Deckora" className="h-5 w-auto" />
          </div>
          <p>© 2026 Deckora. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
            <a href="#" className="hover:text-foreground transition-colors">Terms</a>
            <a href="#" className="hover:text-foreground transition-colors">Support</a>
          </div>
        </div>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} reason="Sign in to generate and save presentations" />
    </div>
  );
}

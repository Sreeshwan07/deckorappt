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

const features = [
  { icon: Zap, title: "AI-Powered", desc: "Generate complete presentations from a single topic" },
  { icon: Layout, title: "Pro Templates", desc: "Beautiful, academic-grade slide designs" },
  { icon: Download, title: "PPTX Export", desc: "Download production-ready PowerPoint files" },
  { icon: Play, title: "Present Mode", desc: "Fullscreen slideshow with keyboard controls" },
];

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
            <div className="p-1.5 rounded-lg gradient-primary">
              <Presentation className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold font-display tracking-wide">Deckora</span>
          </div>

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

      {/* Hero Section — centered, focused */}
      <section className="relative overflow-hidden">
        <div className="absolute top-20 left-1/3 w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/6 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 pt-28 pb-32 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display leading-[1.1] tracking-tight">
              Create stunning{" "}
              <span className="gradient-text">presentations</span>{" "}
              in seconds
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Transform any topic into professional, academic-grade slides with AI.
              Export to PowerPoint, present fullscreen — all in one tool.
            </p>

            {/* Large centered input bar */}
            <div className="max-w-2xl mx-auto mt-10">
              <div className="relative flex items-center bg-secondary/50 border border-border/60 rounded-2xl shadow-xl shadow-primary/5 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/15 focus-within:shadow-[0_0_30px_hsl(var(--primary)/0.1)] transition-all">
                <Sparkles className="absolute left-5 h-5 w-5 text-muted-foreground/50" />
                <input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                  placeholder="Describe your presentation topic…"
                  className="flex-1 h-16 pl-13 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground/60 outline-none text-base"
                />
                <Button
                  onClick={handleGenerate}
                  className="gradient-primary text-primary-foreground rounded-xl px-6 h-11 mr-2.5 text-sm font-semibold hover:scale-[1.02] hover:brightness-110 transition-all shadow-md"
                >
                  Generate
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                No credit card required • Free to try
              </p>
            </div>
          </motion.div>
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
            <div className="p-1 rounded gradient-primary">
              <Presentation className="h-3 w-3 text-primary-foreground" />
            </div>
            <span className="font-semibold text-foreground font-display">Deckora</span>
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

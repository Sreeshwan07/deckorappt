import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import ThemeSwitcher from "@/components/ThemeSwitcher";
import BrandLogo from "@/components/BrandLogo";
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
  Cpu,
  Wand2,
} from "lucide-react";

const features = [
  { icon: Cpu, title: "AI Engine", desc: "GPT-class reasoning generates structured outlines from a single prompt." },
  { icon: Layout, title: "Cinematic Templates", desc: "Studio-grade layouts with typography tuned for impact." },
  { icon: Download, title: "PPTX & PDF Export", desc: "Production-ready files. Open in PowerPoint, Keynote, anywhere." },
  { icon: Play, title: "Present Mode", desc: "Fullscreen slideshow with keyboard control and presenter polish." },
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
    <div className="min-h-screen cinematic-bg text-foreground relative overflow-hidden">
      {/* Decorative grid + ambient lights */}
      <div className="absolute inset-0 grid-bg pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[160px] pointer-events-none"
           style={{ background: "hsl(var(--primary) / 0.18)" }} />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[160px] pointer-events-none"
           style={{ background: "hsl(var(--accent) / 0.15)" }} />

      {/* Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-background/40 border-b border-border/40">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <BrandLogo className="text-2xl" />
          </div>


          <div className="hidden md:flex items-center gap-7 text-sm">
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <button onClick={() => user ? navigate("/create") : setAuthOpen(true)} className="text-muted-foreground hover:text-foreground transition-colors">Templates</button>
            <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            {user ? (
              <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <button onClick={() => setAuthOpen(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3">
                Login
              </button>
            )}
            <Button
              size="sm"
              className="gradient-primary text-primary-foreground rounded-full px-5 hover:brightness-110 transition-all glow-primary-sm"
              onClick={handleGenerate}
            >
              Launch Studio
            </Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="max-w-5xl mx-auto px-6 pt-24 pb-32 text-center relative">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* status pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-xs">
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-primary animate-ping opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-primary" />
              </span>
              <span className="font-mono-cy uppercase tracking-widest text-foreground/80">AI engine online</span>
            </div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold font-display leading-[1.02] tracking-tighter">
              The creative OS for{" "}
              <span className="gradient-text text-glow">AI presentations</span>
            </h1>

            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Describe an idea. Deckora composes cinematic, on-brand decks in seconds —
              ready to present, share, or export to PowerPoint.
            </p>

            {/* Massive prompt bar */}
            <div className="max-w-3xl mx-auto mt-12 relative">
              <div className="relative animated-border rounded-2xl">
                <div className="relative flex items-center bg-background/70 backdrop-blur-xl rounded-2xl">
                  <Wand2 className="absolute left-5 h-5 w-5 text-primary" />
                  <input
                    type="text"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
                    placeholder="Describe your presentation idea…"
                    className="flex-1 h-[68px] pl-14 pr-4 bg-transparent text-foreground placeholder:text-muted-foreground/50 outline-none text-base font-medium"
                  />
                  <Button
                    onClick={handleGenerate}
                    className="gradient-primary text-primary-foreground rounded-xl px-6 h-12 mr-3 text-sm font-semibold hover:scale-[1.02] hover:brightness-110 transition-all glow-primary-sm"
                  >
                    Generate
                    <ArrowRight className="h-4 w-4 ml-1.5" />
                  </Button>
                </div>
              </div>
              <p className="text-xs font-mono-cy uppercase tracking-widest text-muted-foreground/60 mt-4">
                No credit card · 60-second decks · GPU-accelerated
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-16"
          >
            <div className="inline-block text-[10px] font-mono-cy uppercase tracking-widest text-primary mb-4">
              · Capabilities ·
            </div>
            <h2 className="text-3xl md:text-5xl font-bold font-display tracking-tight mb-4">
              Built for <span className="gradient-text">creative velocity</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Everything you need to think, design, and ship presentations — without the busywork.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.4 }}
                className="group glass-card rounded-2xl p-6 hover:border-primary/40 transition-all relative overflow-hidden"
              >
                <div className="absolute -inset-x-10 -top-10 h-32 bg-primary/0 group-hover:bg-primary/10 blur-3xl transition-all" />
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 group-hover:bg-primary/20 group-hover:scale-105 transition-all">
                    <f.icon className="h-5 w-5 text-primary" />
                  </div>
                  <h3 className="font-semibold font-display text-lg mb-1.5">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card-strong rounded-3xl p-12 glow-primary relative overflow-hidden scanline"
          >
            <div className="absolute inset-0 gradient-primary-subtle pointer-events-none" />
            <div className="relative">
              <div className="inline-block text-[10px] font-mono-cy uppercase tracking-widest text-primary mb-4">
                · Get started ·
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-display tracking-tight mb-4">
                Your next deck is one prompt away
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                Join thousands building cinematic presentations with Deckora — completely free to try.
              </p>
              <Button
                onClick={handleGenerate}
                className="gradient-primary text-primary-foreground rounded-full px-8 h-12 text-base font-semibold hover:scale-[1.03] hover:brightness-110 transition-all glow-primary-sm"
              >
                Enter the Studio
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 relative">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <BrandLogo className="text-base" />
          </div>
          <p className="font-mono-cy uppercase tracking-widest text-[10px]">© 2026 · AI Creative OS</p>
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

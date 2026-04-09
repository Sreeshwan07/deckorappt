import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/AuthModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { templateList } from "@/lib/templates";
import SlideRenderer from "@/components/SlideRenderer";
import {
  Sparkles,
  Presentation,
  ArrowRight,
  Zap,
  Layers,
  Download,
} from "lucide-react";

const suggestedTopics = [
  "Artificial Intelligence",
  "Machine Learning",
  "DBMS Concepts",
  "Cloud Computing",
  "Cyber Security",
  "Data Structures",
  "Operating Systems",
  "Web Development",
];

export default function Index() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [authOpen, setAuthOpen] = useState(false);

  const handleGenerate = () => {
    if (user) {
      navigate(`/create?topic=${encodeURIComponent(topic)}`);
    } else {
      setAuthOpen(true);
    }
  };

  const handleTopicClick = (t: string) => {
    setTopic(t);
  };

  return (
    <div className="min-h-screen cosmic-bg">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-background/60 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-14 px-4 lg:px-8">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg gradient-primary">
              <Presentation className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold font-display gradient-text">Deckora</span>
          </div>
          <div className="flex items-center gap-3">
            {user ? (
              <Button variant="gradient" size="sm" onClick={() => navigate("/dashboard")}>
                Dashboard
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => setAuthOpen(true)}>
                  Sign In
                </Button>
                <Button variant="gradient" size="sm" onClick={() => setAuthOpen(true)}>
                  Get Started
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-12 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-sm mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI-Powered Presentations
            </div>
            <h1 className="text-4xl md:text-6xl font-bold font-display gradient-text mb-4 leading-tight">
              Create stunning presentations in seconds
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Enter any topic and let AI generate professional, academic-quality slides with structured content, examples, and visuals.
            </p>

            {/* Topic input */}
            <div className="max-w-xl mx-auto">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter your presentation topic..."
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="h-12 text-base bg-secondary/30 border-border"
                  onKeyDown={(e) => e.key === "Enter" && topic.trim() && handleGenerate()}
                />
                <Button
                  variant="gradient"
                  size="lg"
                  className="glow-purple-sm shrink-0"
                  onClick={handleGenerate}
                  disabled={!topic.trim()}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-4 justify-center">
                {suggestedTopics.map((t) => (
                  <button
                    key={t}
                    onClick={() => handleTopicClick(t)}
                    className="px-3 py-1.5 text-xs rounded-full border border-border bg-secondary/20 text-muted-foreground hover:border-primary/30 hover:text-foreground transition-colors"
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: Zap, title: "AI-Powered", desc: "Generate complete presentations from any topic with structured, academic-quality content." },
            { icon: Layers, title: "6 Pro Templates", desc: "Choose from professionally designed templates — corporate, minimal, startup, tech, creative, academic." },
            { icon: Download, title: "PPTX Export", desc: "Download your presentations as PowerPoint files, ready for seminars and classrooms." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-2xl p-6 text-center"
            >
              <div className="inline-flex p-3 rounded-xl gradient-primary-subtle mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold font-display text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Templates Gallery */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold font-display gradient-text mb-2">Professional Templates</h2>
          <p className="text-muted-foreground">Choose a style that fits your presentation</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {templateList.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="glass-card rounded-xl overflow-hidden hover:glow-purple-sm transition-all group cursor-pointer"
              onClick={handleGenerate}
            >
              <div className="slide-preview w-full overflow-hidden">
                <SlideRenderer
                  slide={{ title: t.name, content: [t.description, "Professional layouts with AI content"] }}
                  templateId={t.id}
                  slideIndex={0}
                  totalSlides={1}
                  className="w-full h-full text-[3.5px]"
                />
              </div>
              <div className="p-3 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-semibold text-foreground">{t.name}</h4>
                  <p className="text-xs text-muted-foreground">{t.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-3xl mx-auto px-4 py-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card-strong rounded-3xl p-10"
        >
          <h2 className="text-2xl md:text-3xl font-bold font-display gradient-text mb-3">
            Ready to create your presentation?
          </h2>
          <p className="text-muted-foreground mb-6">No sign-up required to explore. Generate your first deck in under 60 seconds.</p>
          <Button variant="gradient" size="lg" className="glow-purple" onClick={handleGenerate}>
            <Sparkles className="h-5 w-5" />
            Generate Presentation
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Deckora · AI-Powered Presentations</p>
      </footer>

      <AuthModal open={authOpen} onOpenChange={setAuthOpen} reason="Sign in to generate and save presentations" />
    </div>
  );
}
